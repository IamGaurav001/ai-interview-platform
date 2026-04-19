import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// ---------------------------------------------------------------------------
// Re-use the same multi-key pool as geminiHelper (split on comma)
// ---------------------------------------------------------------------------
const API_KEYS = process.env.GEMINI_API_KEY
  ? process.env.GEMINI_API_KEY.split(",").map((k) => k.trim()).filter((k) => k)
  : [];

if (API_KEYS.length === 0) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

// STT model fallback chain — these models support multimodal (audio) input
const STT_MODEL_CHAIN = [
  "gemini-2.5-flash",   // Best available — top of free-tier quota
  "gemini-2.0-flash",   // Fallback
];

// Per-session sets to avoid retrying known-bad models
const sttDailyExhausted = new Set();
const sttUnavailable = new Set();

let sttKeyIndex = -1;

const getNextKey = () => {
  sttKeyIndex = (sttKeyIndex + 1) % API_KEYS.length;
  return API_KEYS[sttKeyIndex];
};

// ---------------------------------------------------------------------------
// Parse retryDelay + daily-exhaustion from 429 error body (same as geminiHelper)
// ---------------------------------------------------------------------------
const parseRateLimitError = (error) => {
  let retryDelayMs = null;
  let isDailyExhausted = false;
  try {
    const match = error.message?.match(/\[\{.*\}\]/s);
    if (match) {
      const details = JSON.parse(match[0]);
      for (const detail of details) {
        if (detail["@type"]?.includes("RetryInfo") && detail.retryDelay) {
          retryDelayMs = (parseInt(detail.retryDelay, 10) + 2) * 1000;
        }
        if (detail["@type"]?.includes("QuotaFailure") && detail.violations) {
          for (const v of detail.violations) {
            if (v.quotaId?.toLowerCase().includes("perday")) isDailyExhausted = true;
          }
        }
      }
    }
  } catch (_) {}
  return { retryDelayMs, isDailyExhausted };
};

// ---------------------------------------------------------------------------
// Main STT function
// ---------------------------------------------------------------------------
export async function geminiSpeechToText(audioFilePath, mimeType = "audio/webm") {
  if (!fs.existsSync(audioFilePath)) {
    throw new Error("Audio file not found");
  }

  const audioFile = fs.readFileSync(audioFilePath);
  const base64Audio = audioFile.toString("base64");

  const prompt =
    "Transcribe this audio into clean, accurate English text. Return only the transcribed text, no additional commentary or formatting.";

  const maxRetries = process.env.NODE_ENV === "production" ? 3 : 10;
  const initialDelay = process.env.NODE_ENV === "production" ? 500 : 2000;

  // Build working chain (excluding already-known bad models this session)
  let workingChain = STT_MODEL_CHAIN.filter(
    (m) => !sttDailyExhausted.has(m) && !sttUnavailable.has(m)
  );

  if (workingChain.length === 0) {
    throw new Error(
      "All STT models have exhausted their daily quota. Please wait until midnight PT or add a paid API key."
    );
  }

  let modelIdx = 0;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const currentModel = workingChain[modelIdx];
    if (!currentModel) break;

    try {
      const apiKey = getNextKey();
      const geminiInstance = new GoogleGenerativeAI(apiKey);
      const model = geminiInstance.getGenerativeModel({ model: currentModel });

      console.log(
        `🔄 STT Attempt ${attempt}/${maxRetries} with model: ${currentModel} ` +
        `(Key ${(sttKeyIndex % API_KEYS.length) + 1}/${API_KEYS.length})`
      );

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: base64Audio } },
            ],
          },
        ],
      });

      const transcribedText = result.response.text().trim();

      if (!transcribedText || transcribedText.length === 0) {
        throw new Error("No transcription received from Gemini");
      }

      console.log(`✅ Audio transcribed successfully (attempt ${attempt}, model: ${currentModel})`);
      return transcribedText;

    } catch (err) {
      lastError = err;
      const message = err?.message || "";

      const isRateLimit =
        message.includes("429") ||
        message.includes("Too Many Requests") ||
        message.includes("Resource exhausted");

      const isModelUnavailable =
        message.includes("404") ||
        message.includes("not found") ||
        message.includes("unsupported") ||
        message.includes("is not supported");

      const isInvalidKey = message.includes("400") && message.includes("API_KEY_INVALID");

      const isRetryable =
        message.includes("503") ||
        message.includes("500") ||
        message.includes("overloaded") ||
        message.includes("timeout");

      // ── Invalid API key — skip this key, don't retry the same one ──────────
      if (isInvalidKey) {
        console.error(`❌ STT: API key ${(sttKeyIndex % API_KEYS.length) + 1} is invalid. Skipping...`);
        // If we've tried all keys and all are invalid, throw immediately
        if (API_KEYS.length === 1) {
          throw new Error("The Gemini API key is invalid. Please check your GEMINI_API_KEY in .env");
        }
        // Otherwise just retry (getNextKey will advance to the next key)
        continue;
      }

      // ── Rate limit ─────────────────────────────────────────────────────────
      if (isRateLimit) {
        const { retryDelayMs, isDailyExhausted } = parseRateLimitError(err);

        if (isDailyExhausted) {
          sttDailyExhausted.add(currentModel);
          console.error(`🚫 STT: Daily quota exhausted for ${currentModel}. Skipping for this session.`);
        } else {
          console.warn(`⚠️ STT: Rate limit (429) on attempt ${attempt}/${maxRetries} — model: ${currentModel}`);
        }

        // Try next model
        workingChain = STT_MODEL_CHAIN.filter(
          (m) => !sttDailyExhausted.has(m) && !sttUnavailable.has(m)
        );
        if (modelIdx < workingChain.length - 1) {
          modelIdx++;
          console.log(`🔄 Switching STT model → ${workingChain[modelIdx]}`);
          const delay = Math.min(retryDelayMs ?? 1500, 5000);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        if (workingChain.length === 0) {
          throw new Error(
            "All STT models have exhausted their daily quota. Please wait until midnight PT or add a paid API key."
          );
        }

        const delay = Math.min(
          initialDelay * Math.pow(2, Math.min(attempt - 1, 5)) + Math.random() * 1000,
          30000
        );
        console.log(`⏳ STT: All models rate-limited. Waiting ${Math.round(delay)}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      // ── Model unavailable (404) ────────────────────────────────────────────
      if (isModelUnavailable) {
        sttUnavailable.add(currentModel);
        console.warn(`⚠️ STT: Model ${currentModel} unavailable (404) — marking as unavailable.`);
        workingChain = STT_MODEL_CHAIN.filter(
          (m) => !sttDailyExhausted.has(m) && !sttUnavailable.has(m)
        );
        if (workingChain.length === 0) {
          throw new Error(
            `All STT models are unavailable. Please verify your API key at https://aistudio.google.com/`
          );
        }
        modelIdx = 0;
        console.log(`🔄 Switching STT model → ${workingChain[0]}`);
        continue;
      }

      // ── Transient errors ───────────────────────────────────────────────────
      if (isRetryable && attempt < maxRetries) {
        const delay = Math.min(
          initialDelay * Math.pow(2, Math.min(attempt - 1, 5)) + Math.random() * 1000,
          60000
        );
        console.warn(`⚠️ STT: Transient error, retrying in ${Math.round(delay)}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      console.error("❌ Transcription error:", message);
      throw err;
    }
  }

  throw lastError || new Error("Failed to transcribe audio with Gemini");
}
