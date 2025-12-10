import { GoogleGenerativeAI } from "@google/generative-ai";


const API_KEYS = process.env.GEMINI_API_KEY 
  ? process.env.GEMINI_API_KEY.split(',').map(k => k.trim()).filter(k => k)
  : [];

if (API_KEYS.length === 0) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

// Track API key health and usage
const keyHealth = API_KEYS.map((key, index) => ({
  key,
  index,
  failures: 0,
  lastFailure: null,
  successCount: 0,
  isHealthy: true,
  cooldownUntil: null,
}));

let currentKeyIndex = 0;
const requestQueue = [];
let isProcessingQueue = false;
const MAX_CONCURRENT_REQUESTS = 5; 
let activeRequests = 0;

  const getNextApiKey = () => {
  const now = Date.now();
  
  const availableKeys = keyHealth.filter(k => 
    k.isHealthy && (!k.cooldownUntil || k.cooldownUntil < now)
  );
  
  if (availableKeys.length === 0) {
    const nextAvailable = keyHealth.reduce((min, k) => 
      (!min.cooldownUntil || (k.cooldownUntil && k.cooldownUntil < min.cooldownUntil)) ? k : min
    );
    console.warn(`⚠️ All API keys in cooldown. Using key ${nextAvailable.index + 1} (cooldown ends in ${Math.round((nextAvailable.cooldownUntil - now) / 1000)}s)`);
    return nextAvailable;
  }
  
  currentKeyIndex = (currentKeyIndex + 1) % availableKeys.length;
  return availableKeys[currentKeyIndex];
};

const markKeyFailure = (keyInfo, error) => {
  keyInfo.failures++;
  keyInfo.lastFailure = Date.now();
  
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
  
  if (keyInfo.successCount % 3 === 0 && !keyInfo.isHealthy) {
    keyInfo.isHealthy = true;
    console.log(`✅ API Key ${keyInfo.index + 1} restored to healthy status`);
  }
};

const genAI = new GoogleGenerativeAI(API_KEYS[0]); 
export const callGeminiWithRetry = async (prompt, options = {}) => {
  const {
    model = "gemini-2.0-flash-lite", 
    maxRetries = 10,
    initialDelay = 2000,
    generationConfig = {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 2048,
    },
  } = options;

  let currentModel = model;
  let lastError = null;
  let hasTriedFallback = false; 

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let keyInfo = null;
    
    try {
      // Get next healthy API key
      keyInfo = getNextApiKey();
      const geminiInstance = new GoogleGenerativeAI(keyInfo.key);
      
      console.log(`🔄 Attempt ${attempt}/${maxRetries} with model: ${currentModel} (Key ${keyInfo.index + 1}/${API_KEYS.length}, Health: ${keyInfo.isHealthy ? '✅' : '⚠️'})`);
      const geminiModel = geminiInstance.getGenerativeModel({ model: currentModel });
      
      // Add timeout wrapper to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Gemini API timeout after 45s')), 45000)
      );
      
      const apiPromise = geminiModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
      });
      
      const result = await Promise.race([apiPromise, timeoutPromise]);

      const responseText = result.response.text().trim();
      
      // Mark key as successful
      markKeySuccess(keyInfo);
      
      console.log(`✅ Gemini API call successful (attempt ${attempt}, model: ${currentModel}, Key ${keyInfo.index + 1})`);
      return responseText;
    } catch (error) {
      lastError = error;
      const errorMessage = error.message || "";
      const isRateLimit = errorMessage.includes("429") || 
                         errorMessage.includes("Too Many Requests") ||
                         errorMessage.includes("Resource exhausted");

      
      const isModelNotFound = errorMessage.includes("404") || 
                             errorMessage.includes("not found") ||
                             errorMessage.includes("is not supported");

      
      if (isRateLimit) {
        // Mark this key as failed and put in cooldown
        if (keyInfo) {
          markKeyFailure(keyInfo, error);
        }
        
        console.warn(`⚠️ Rate limit error (429) on attempt ${attempt}/${maxRetries} with model ${currentModel} (Key ${keyInfo?.index + 1 || 'unknown'})`);


        
        if (!hasTriedFallback && currentModel === "gemini-3.0-pro-exp") {
             console.log("🔄 gemini-3.0-pro-exp rate limited, switching to gemini-2.0-flash-lite...");
             currentModel = "gemini-2.0-flash-lite";
             hasTriedFallback = true;
             
             await new Promise((resolve) => setTimeout(resolve, 1500));
             continue;
        }

        
        const delay = initialDelay * Math.pow(2, Math.min(attempt - 1, 6)); 
        const jitter = Math.random() * 1000; 
        const totalDelay = Math.max(2000, Math.min(delay + jitter, 10000)); // Minimum 2s to respect 1 req/sec limit

        if (attempt < maxRetries) {
          console.log(`⏳ Waiting ${Math.round(totalDelay)}ms before retry ${attempt + 1}...`);
          await new Promise((resolve) => setTimeout(resolve, totalDelay));
          continue;
        } else {
          throw new Error(
            `Rate limit exceeded after ${maxRetries} attempts. The Gemini API is currently overloaded. Please wait a few minutes and try again.`
          );
        }
      }

      
      if (isModelNotFound && attempt === 1) {
        if (currentModel === "gemini-3.0-pro-exp") {
          console.log("🔄 gemini-3.0-pro-exp not available, trying gemini-2.0-flash-lite as fallback...");
          currentModel = "gemini-2.0-flash-lite";
          hasTriedFallback = true;
          continue;
        } else if (currentModel === "gemini-2.0-flash-lite") {
          console.log("🔄 gemini-2.0-flash-lite not available, trying gemini-2.0-flash as fallback...");
          currentModel = "gemini-2.0-flash";
          hasTriedFallback = true;
          continue;
        } else if (currentModel === "gemini-2.0-flash") {
           console.log("🔄 gemini-2.0-flash not available, trying gemini-1.5-flash as fallback...");
           currentModel = "gemini-1.5-flash";
           continue;
        } else if (currentModel === "gemini-1.5-pro") {
          console.log("🔄 gemini-1.5-pro not available, trying gemini-1.5-flash as fallback...");
          currentModel = "gemini-1.5-flash";
          continue;
        }
      }

      
      const isRetryable = errorMessage.includes("503") || 
                         errorMessage.includes("500") ||
                         errorMessage.includes("overloaded") ||
                         errorMessage.includes("timeout");

      if (isRetryable && attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, Math.min(attempt - 1, 5));
        console.warn(`⚠️ Retryable error on attempt ${attempt}, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      
      if (isModelNotFound) {
        throw new Error(
          `Gemini model "${currentModel}" is not available. Please check your API key and ensure you have access to Gemini models.`
        );
      }

      
      throw error;
    }
  }

  
  throw lastError || new Error("Failed to call Gemini API after all retries");
};


export const getGeminiModel = (preferredModel = "gemini-2.0-flash-lite") => {
  return genAI.getGenerativeModel({ model: preferredModel });
};

