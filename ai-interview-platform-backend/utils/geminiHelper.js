import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------------------------------------------------------------------------
// Parse quota info from a 429 error
// Returns { retryDelayMs, isDailyExhausted }
// ---------------------------------------------------------------------------
const parseRateLimitError = (error) => {
  let retryDelayMs = null;
  let isDailyExhausted = false;

  try {
    // The SDK embeds the raw JSON body in the error message
    const match = error.message?.match(/\[\{.*\}\]/s);
    if (match) {
      const details = JSON.parse(match[0]);
      for (const detail of details) {
        // Extract retry delay from RetryInfo
        if (detail["@type"]?.includes("RetryInfo") && detail.retryDelay) {
          const seconds = parseInt(detail.retryDelay, 10) || 0;
          retryDelayMs = (seconds + 2) * 1000; // add 2s buffer
        }
        // Detect daily quota exhaustion
        if (detail["@type"]?.includes("QuotaFailure") && detail.violations) {
          for (const v of detail.violations) {
            if (v.quotaId?.toLowerCase().includes("perday")) {
              isDailyExhausted = true;
            }
          }
        }
      }
    }
  } catch (_) {
    // Parsing failed — fall back to defaults
  }

  return { retryDelayMs, isDailyExhausted };
};

// ---------------------------------------------------------------------------
// API Key pool — comma-separated keys in GEMINI_API_KEY env var
// ---------------------------------------------------------------------------
const API_KEYS = process.env.GEMINI_API_KEY
  ? process.env.GEMINI_API_KEY.split(",").map((k) => k.trim()).filter((k) => k)
  : [];

if (API_KEYS.length === 0) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

console.log(`🔑 Loaded ${API_KEYS.length} Gemini API key(s)`);

// ---------------------------------------------------------------------------
// Model fallback chain — ordered from best to most available.
// Use stable aliases so they never go 404 when previews retire.
// ---------------------------------------------------------------------------
const MODEL_FALLBACK_CHAIN = [
  "gemini-2.5-flash",    // Gemini 2.5 Flash — stable alias, has free-tier quota
  "gemini-2.0-flash",    // Gemini 2.0 Flash — fallback
  "gemini-2.0-flash-lite", // Lite tier — last resort
];

// ---------------------------------------------------------------------------
// Key health tracking
// ---------------------------------------------------------------------------
const keyHealth = API_KEYS.map((key, index) => ({
  key,
  index,
  failures: 0,
  lastFailure: null,
  successCount: 0,
  isHealthy: true,
  cooldownUntil: null,
}));

let currentKeyIndex = -1; // Start at -1 so first increment gives index 0

// Models whose daily quota is exhausted — skip for the rest of this process lifetime
const dailyExhaustedModels = new Set();
// Models that returned 404 (wrong name / no API access) — skip permanently
const unavailableModels = new Set();

const getNextApiKey = () => {
  const now = Date.now();

  // Auto-restore keys whose cooldown has expired
  keyHealth.forEach((k) => {
    if (!k.isHealthy && k.cooldownUntil && k.cooldownUntil < now) {
      k.isHealthy = true;
      k.failures = 0;
      k.cooldownUntil = null;
      console.log(`✅ API Key ${k.index + 1} cooldown expired — restored to healthy`);
    }
  });

  // True round-robin: advance and pick the next healthy, non-cooldown key
  for (let i = 0; i < keyHealth.length; i++) {
    currentKeyIndex = (currentKeyIndex + 1) % keyHealth.length;
    const candidate = keyHealth[currentKeyIndex];
    if (candidate.isHealthy && (!candidate.cooldownUntil || candidate.cooldownUntil < now)) {
      return candidate;
    }
  }

  // All keys in cooldown — pick the one whose cooldown expires soonest
  const nextAvailable = keyHealth.reduce((min, k) =>
    k.cooldownUntil && (!min.cooldownUntil || k.cooldownUntil < min.cooldownUntil) ? k : min,
    keyHealth[0]
  );
  const expiresIn = Math.max(0, Math.round(((nextAvailable.cooldownUntil || 0) - now) / 1000));
  console.warn(`⚠️ All API keys in cooldown. Using key ${nextAvailable.index + 1} (cooldown ends in ${expiresIn}s)`);
  return nextAvailable;
};

const markKeyFailure = (keyInfo) => {
  keyInfo.failures++;
  keyInfo.lastFailure = Date.now();
  // Exponential backoff: 30s, 60s, 120s, 240s … capped at 5 min
  const cooldownDuration = Math.min(30000 * Math.pow(2, keyInfo.failures - 1), 300000);
  keyInfo.cooldownUntil = Date.now() + cooldownDuration;

  if (keyInfo.failures >= 3) {
    keyInfo.isHealthy = false;
    console.error(`❌ API Key ${keyInfo.index + 1} marked unhealthy after ${keyInfo.failures} failures`);
  }
  console.warn(`⚠️ API Key ${keyInfo.index + 1} in cooldown for ${cooldownDuration / 1000}s`);
};

const markKeySuccess = (keyInfo) => {
  keyInfo.successCount++;
  keyInfo.failures = Math.max(0, keyInfo.failures - 1);
  if (!keyInfo.isHealthy && keyInfo.successCount % 3 === 0) {
    keyInfo.isHealthy = true;
    console.log(`✅ API Key ${keyInfo.index + 1} restored to healthy status`);
  }
};

// ---------------------------------------------------------------------------
// Core retry function
// ---------------------------------------------------------------------------
export const callGeminiWithRetry = async (prompt, options = {}) => {
  const {
    model: preferredModel = "gemini-2.5-flash-preview-04-17",
    maxRetries = 10,
    initialDelay = 2000,
    generationConfig = {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 2048,
    },
  } = options;

  // Build the attempt sequence: preferred model first, then the rest of the chain
  // Exclude any models that have hit their daily quota this session
  const startIdx = MODEL_FALLBACK_CHAIN.indexOf(preferredModel);
  const fullChain =
    startIdx !== -1
      ? MODEL_FALLBACK_CHAIN.slice(startIdx)
      : [preferredModel, ...MODEL_FALLBACK_CHAIN];
  const orderedChain = fullChain.filter((m) => !dailyExhaustedModels.has(m));

  if (orderedChain.length === 0) {
    throw new Error(
      `All available Gemini models have exhausted their daily free-tier quota. ` +
      `Please wait until midnight (Pacific Time) for quotas to reset, or add a paid API key.`
    );
  }

  let currentModelIdx = 0; // index into orderedChain
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const currentModel = orderedChain[currentModelIdx];
    let keyInfo = null;

    try {
      keyInfo = getNextApiKey();
      const geminiInstance = new GoogleGenerativeAI(keyInfo.key);

      console.log(
        `🔄 Attempt ${attempt}/${maxRetries} with model: ${currentModel} ` +
        `(Key ${keyInfo.index + 1}/${API_KEYS.length}, Health: ${keyInfo.isHealthy ? "✅" : "⚠️"})`
      );

      const geminiModel = geminiInstance.getGenerativeModel({ model: currentModel });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Gemini API timeout after 45s")), 45000)
      );

      const apiPromise = geminiModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
      });

      const result = await Promise.race([apiPromise, timeoutPromise]);
      const responseText = result.response.text().trim();

      markKeySuccess(keyInfo);
      console.log(`✅ Gemini API call successful (attempt ${attempt}, model: ${currentModel}, Key ${keyInfo.index + 1})`);
      return responseText;

    } catch (error) {
      lastError = error;
      const errorMessage = error.message || "";

      const isRateLimit =
        errorMessage.includes("429") ||
        errorMessage.includes("Too Many Requests") ||
        errorMessage.includes("Resource exhausted");

      const isModelUnavailable =
        errorMessage.includes("404") ||
        errorMessage.includes("not found") ||
        errorMessage.includes("is not supported") ||
        errorMessage.includes("deprecated");

      const isRetryable =
        errorMessage.includes("503") ||
        errorMessage.includes("500") ||
        errorMessage.includes("overloaded") ||
        errorMessage.includes("timeout");

      // ── Rate limit: parse error, handle daily exhaustion, cascade model ───
      if (isRateLimit) {
        if (keyInfo) markKeyFailure(keyInfo);

        const { retryDelayMs, isDailyExhausted } = parseRateLimitError(error);

        if (isDailyExhausted) {
          // This model's free-tier daily quota is gone — skip it permanently this session
          dailyExhaustedModels.add(currentModel);
          console.error(
            `🚫 Daily quota exhausted for model: ${currentModel}. ` +
            `Skipping this model for the rest of the session.`
          );
        } else {
          console.warn(
            `⚠️ Rate limit (429) on attempt ${attempt}/${maxRetries} — model: ${currentModel}, ` +
            `Key ${keyInfo?.index != null ? keyInfo.index + 1 : "?"}`
          );
        }

        // Always try the next model in chain if available
        const remainingChain = fullChain.filter((m) => !dailyExhaustedModels.has(m));
        const nextModelIdx = remainingChain.indexOf(currentModel);
        const nextModel = remainingChain[nextModelIdx + 1];

        if (nextModel) {
          currentModelIdx = orderedChain.indexOf(nextModel);
          if (currentModelIdx === -1) currentModelIdx = 0;
          console.log(`🔄 Switching model: ${currentModel} → ${nextModel}`);
          const switchDelay = isDailyExhausted ? 500 : Math.min(retryDelayMs ?? 1500, 5000);
          await new Promise((r) => setTimeout(r, switchDelay));
          continue;
        }

        if (remainingChain.length === 0) {
          throw new Error(
            `All available Gemini models have exhausted their daily free-tier quota. ` +
            `Please wait until midnight (Pacific Time) for quotas to reset, or add a paid API key.`
          );
        }

        // All models tried on rate-limit — use API-provided retry delay
        currentModelIdx = 0;
        const delay = retryDelayMs ?? Math.min(initialDelay * Math.pow(2, Math.min(attempt - 1, 5)), 30000);
        if (attempt < maxRetries) {
          console.log(`⏳ All models rate-limited. Waiting ${Math.round(delay)}ms before retry ${attempt + 1}...`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw new Error(
          `Rate limit exceeded after ${maxRetries} attempts across all models. ` +
          `The Gemini API is currently overloaded. Please wait a few minutes and try again.`
        );
      }

      // ── Model unavailable (404): permanently skip, cascade to next ─────────
      if (isModelUnavailable) {
        unavailableModels.add(currentModel);
        console.warn(`⚠️ Model ${currentModel} not available (404) — marked as unavailable, trying next...`);

        const workingChain = fullChain.filter(
          (m) => !dailyExhaustedModels.has(m) && !unavailableModels.has(m)
        );

        if (workingChain.length === 0) {
          throw new Error(
            `All Gemini models are unavailable or exhausted. ` +
            `Tried: ${orderedChain.join(", ")}. ` +
            `Please verify your API key at https://aistudio.google.com/`
          );
        }

        const nextModel = workingChain[0];
        currentModelIdx = orderedChain.indexOf(nextModel);
        if (currentModelIdx === -1) currentModelIdx = 0;
        console.log(`🔄 Switching model: ${currentModel} → ${nextModel}`);
        continue;
      }

      // ── Transient server error: retry same model ──────────────────────────
      if (isRetryable && attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, Math.min(attempt - 1, 5));
        console.warn(`⚠️ Transient error on attempt ${attempt}, retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      // ── Unrecoverable error ───────────────────────────────────────────────
      throw error;
    }
  }

  throw lastError || new Error("Failed to call Gemini API after all retries");
};

/**
 * Get a Gemini model instance (uses first available key)
 */
export const getGeminiModel = (preferredModel = "gemini-2.0-flash") => {
  const instance = new GoogleGenerativeAI(API_KEYS[0]);
  return instance.getGenerativeModel({ model: preferredModel });
};
