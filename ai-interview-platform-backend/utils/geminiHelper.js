import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


export const callGeminiWithRetry = async (prompt, options = {}) => {
  const {
    model = "gemini-3.0-pro-exp", 
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
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} with model: ${currentModel}`);
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

      
      const isModelNotFound = errorMessage.includes("404") || 
                             errorMessage.includes("not found") ||
                             errorMessage.includes("is not supported");

      
      if (isRateLimit) {
        console.warn(`⚠️ Rate limit error (429) on attempt ${attempt}/${maxRetries} with model ${currentModel}`);

        
        if (!hasTriedFallback && currentModel === "gemini-3.0-pro-exp") {
             console.log("🔄 gemini-3.0-pro-exp rate limited, switching to gemini-2.0-flash-lite...");
             currentModel = "gemini-2.0-flash-lite";
             hasTriedFallback = true;
             
             await new Promise((resolve) => setTimeout(resolve, 1500));
             continue;
        }

        
        const delay = initialDelay * Math.pow(2, Math.min(attempt - 1, 6)); 
        const jitter = Math.random() * 1000; 
        const totalDelay = Math.min(delay + jitter, 60000); 

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


export const getGeminiModel = (preferredModel = "gemini-3.0-pro-exp") => {
  return genAI.getGenerativeModel({ model: preferredModel });
};

