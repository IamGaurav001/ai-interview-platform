import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const DEFAULT_MODEL = "gemini-2.0-flash";
const FALLBACK_MODEL = "gemini-1.5-flash";
const MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 1000;

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

  // Prepare the prompt
  const prompt =
    "Transcribe this audio into clean, accurate English text. Return only the transcribed text, no additional commentary or formatting.";

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
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

      if (isModelNotFound && currentModel === DEFAULT_MODEL) {
        console.warn(
          `⚠️ Model ${DEFAULT_MODEL} unavailable. Switching to ${FALLBACK_MODEL}...`
        );
        currentModel = FALLBACK_MODEL;
        continue;
      }

      if (isRetryable && attempt < MAX_RETRIES) {
        const delay =
          INITIAL_DELAY_MS * Math.pow(2, attempt - 1) + Math.random() * 1000;
        console.warn(
          `⚠️ Gemini STT error (${message || err}). Retrying in ${Math.round(
            delay
          )}ms (attempt ${attempt}/${MAX_RETRIES})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      if (isRateLimit && attempt === MAX_RETRIES) {
        throw new Error(
          "Gemini speech-to-text rate limit reached. Please wait a moment and try again."
        );
      }

      console.error("❌ Gemini STT Error:", message);
      throw err;
    }
  }

  throw lastError || new Error("Failed to transcribe audio with Gemini");
}






