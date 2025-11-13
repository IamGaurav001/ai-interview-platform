import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Transcribe audio to text using Gemini
 * @param {string} audioFilePath - Path to the audio file
 * @param {string} mimeType - MIME type of the audio (e.g., "audio/webm", "audio/wav")
 * @returns {Promise<string>} Transcribed text
 */
export async function geminiSpeechToText(audioFilePath, mimeType = "audio/webm") {
  try {
    if (!fs.existsSync(audioFilePath)) {
      throw new Error("Audio file not found");
    }

    // Read audio file and convert to base64
    const audioFile = fs.readFileSync(audioFilePath);
    const base64Audio = audioFile.toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Prepare the prompt
    const prompt = "Transcribe this audio into clean, accurate English text. Return only the transcribed text, no additional commentary or formatting.";

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

    console.log("✅ Audio transcribed successfully");
    return transcribedText;
  } catch (err) {
    console.error("❌ Gemini STT Error:", err.message);
    throw err;
  }
}





