import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configuration constants
const DEFAULT_MODEL = "gemini-2.0-flash";
const MAX_RETRIES = 10; // Increased from 7 to 10 for better rate limit handling
const INITIAL_DELAY_MS = 2000;

/**
 * Transcribe audio to text using Gemini
 * @param {string} audioFilePath - Path to the audio file
 * @param {string} mimeType - MIME type of the audio (e.g., "audio/webm", "audio/wav")
 * @returns {Promise<string>} Transcribed text
 */
export async function geminiSpeechToText(audioFilePath, mimeType = "audio/webm") {
  if (!fs.existsSync(audioFilePath)) {
    throw new Error("Audio file not found");
  }

  // Read audio file and convert to base64
  const audioFile = fs.readFileSync(audioFilePath);
  const base64Audio = audioFile.toString("base64");

  let currentModel = DEFAULT_MODEL;
  let lastError = null;
  let hasTriedFallback = false; // Track if we've already switched models
  const maxRetries = MAX_RETRIES;
  const initialDelay = INITIAL_DELAY_MS;

  // Prepare the prompt
  const prompt =
    "Transcribe this audio into clean, accurate English text. Return only the transcribed text, no additional commentary or formatting.";

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 STT Attempt ${attempt}/${maxRetries} with model: ${currentModel}`);
      const model = genAI.getGenerativeModel({ model: currentModel });

      // Send audio to Gemini for transcription
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Audio,
                },
              },
            ],
          },
        ],
      });

      const transcribedText = result.response.text().trim();

      if (!transcribedText || transcribedText.length === 0) {
        throw new Error("No transcription received from Gemini");
      }

      console.log(
        `✅ Audio transcribed successfully (attempt ${attempt}, model: ${currentModel})`
      );
      return transcribedText;
    } catch (err) {
      lastError = err;
      const message = err?.message || "";
      const isRateLimit =
        message.includes("429") ||
        message.includes("Too Many Requests") ||
        message.includes("Resource exhausted");
      const isRetryable =
        isRateLimit ||
        message.includes("503") ||
        message.includes("500") ||
        message.includes("overloaded") ||
        message.includes("timeout");
      const isModelNotFound =
        message.includes("404") ||
        message.includes("not found") ||
        message.includes("unsupported");

      // Handle Rate Limits with Fallback
      if (isRateLimit) {
         console.warn(`⚠️ Rate limit error (429) on attempt ${attempt}/${maxRetries} with model ${currentModel}`);
         
         // Switch to fallback model immediately on first rate limit
         if (!hasTriedFallback && currentModel === "gemini-2.0-flash") {
             console.log("🔄 gemini-2.0-flash rate limited, switching to gemini-2.0-flash-lite...");
             currentModel = "gemini-2.0-flash-lite";
             hasTriedFallback = true;
             await new Promise((resolve) => setTimeout(resolve, 1500));
             continue;
         }

         // Use exponential backoff with cap
         if (attempt < maxRetries) {
           const delay = Math.min(
             initialDelay * Math.pow(2, Math.min(attempt - 1, 6)) + Math.random() * 1000,
             60000 // Cap at 60 seconds
           );
           console.log(`⏳ Waiting ${Math.round(delay)}ms before retry ${attempt + 1}...`);
           await new Promise((resolve) => setTimeout(resolve, delay));
           continue;
         } else {
           throw new Error(
             "Gemini speech-to-text rate limit reached. The AI service is experiencing high demand. Please wait 2-3 minutes and try again."
           );
         }
      }

      // Handle Model Not Found with Fallback
      if (isModelNotFound && attempt === 1) {
        if (currentModel === "gemini-2.0-flash") {
          console.log("🔄 gemini-2.0-flash not available, trying gemini-2.0-flash-lite as fallback...");
          currentModel = "gemini-2.0-flash-lite";
          hasTriedFallback = true;
          continue;
        } else if (currentModel === "gemini-2.0-flash-lite") {
           console.log("🔄 gemini-2.0-flash-lite not available, trying gemini-1.5-flash as fallback...");
           currentModel = "gemini-1.5-flash";
           continue;
        }
      }

      if (isRetryable && attempt < maxRetries) {
        const delay = Math.min(
          initialDelay * Math.pow(2, Math.min(attempt - 1, 5)) + Math.random() * 1000,
          60000
        );
        console.warn(
          `⚠️ Gemini STT error (${message}). Retrying in ${Math.round(
            delay
          )}ms (attempt ${attempt}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      console.error("❌ Gemini STT Error:", message);
      throw err;
    }
  }

  throw lastError || new Error("Failed to transcribe audio with Gemini");
}






