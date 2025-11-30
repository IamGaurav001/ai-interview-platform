import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Call Gemini API with automatic retry, exponential backoff, and model fallback
 * @param {string} prompt - The prompt to send to Gemini
 * @param {Object} options - Configuration options
 * @param {string} options.model - Primary model to use (default: "gemini-2.0-flash")
 * @param {number} options.maxRetries - Maximum retry attempts (default: 5)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {Object} options.generationConfig - Generation configuration
 * @returns {Promise<string>} The response text from Gemini
 */
export const callGeminiWithRetry = async (prompt, options = {}) => {
  const {
    model = "gemini-2.0-flash",
    maxRetries = 7,
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

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const geminiModel = genAI.getGenerativeModel({ model: currentModel });
      const result = await geminiModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
      });

      const responseText = result.response.text().trim();
      console.log(`✅ Gemini API call successful (attempt ${attempt}, model: ${currentModel})`);
      return responseText;
    } catch (error) {
      lastError = error;
      const errorMessage = error.message || "";
      const isRateLimit = errorMessage.includes("429") || 
                         errorMessage.includes("Too Many Requests") ||
                         errorMessage.includes("Resource exhausted");

      // Check for model not found errors
      const isModelNotFound = errorMessage.includes("404") || 
                             errorMessage.includes("not found") ||
                             errorMessage.includes("is not supported");

      // If it's a rate limit error
      if (isRateLimit) {
        console.warn(`⚠️ Rate limit error (429) on attempt ${attempt}/${maxRetries} with model ${currentModel}`);

        // Strategy: If 2.0-flash is rate limited, try 2.0-flash-lite as it might have a separate quota/limit
        if (currentModel === "gemini-2.0-flash") {
             console.log("🔄 gemini-2.0-flash rate limited, switching to gemini-2.0-flash-lite for next attempt...");
             currentModel = "gemini-2.0-flash-lite";
             // Don't wait as long if we are switching models, just a small backoff
             await new Promise((resolve) => setTimeout(resolve, 1000));
             continue;
        }

        // Calculate exponential backoff delay
        const delay = initialDelay * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 1000; // Add random jitter (0-1s)
        const totalDelay = delay + jitter;

        if (attempt < maxRetries) {
          console.log(`⏳ Waiting ${Math.round(totalDelay)}ms before retry ${attempt + 1}...`);
          await new Promise((resolve) => setTimeout(resolve, totalDelay));
          continue;
        } else {
          throw new Error(
            `Rate limit exceeded after ${maxRetries} attempts. Please wait a few minutes and try again.`
          );
        }
      }

      // If model not found, try fallback model (only once)
      if (isModelNotFound && attempt === 1) {
        if (currentModel === "gemini-2.0-flash") {
          console.log("🔄 gemini-2.0-flash not available, trying gemini-2.0-flash-lite as fallback...");
          currentModel = "gemini-2.0-flash-lite";
          continue;
        } else if (currentModel === "gemini-2.0-flash-lite") {
           console.log("🔄 gemini-2.0-flash-lite not available, trying gemini-pro-latest as fallback...");
           currentModel = "gemini-pro-latest";
           continue;
        } else if (currentModel === "gemini-1.5-pro") {
          console.log("🔄 gemini-1.5-pro not available, trying gemini-pro-latest as fallback...");
          currentModel = "gemini-pro-latest";
          continue;
        }
      }

      // For other errors, check if we should retry
      const isRetryable = errorMessage.includes("503") || 
                         errorMessage.includes("500") ||
                         errorMessage.includes("overloaded") ||
                         errorMessage.includes("timeout");

      if (isRetryable && attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        console.warn(`⚠️ Retryable error on attempt ${attempt}, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // If model not found and we've already tried all fallbacks, throw a clear error
      if (isModelNotFound && currentModel === "gemini-pro-latest") {
        throw new Error(
          `None of the Gemini models are available. Please check your API key and ensure you have access to at least one Gemini model (gemini-2.0-flash, gemini-2.0-flash-lite, or gemini-pro-latest).`
        );
      }

      // If not retryable or out of retries, throw the error
      throw error;
    }
  }

  // If we exhausted all retries
  throw lastError || new Error("Failed to call Gemini API after all retries");
};

/**
 * Get a Gemini model instance with fallback support
 * @param {string} preferredModel - Preferred model name
 * @returns {Object} Gemini model instance
 */
export const getGeminiModel = (preferredModel = "gemini-2.0-flash") => {
  return genAI.getGenerativeModel({ model: preferredModel });
};

