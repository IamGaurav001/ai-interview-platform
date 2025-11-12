import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import textToSpeech from "@google-cloud/text-to-speech";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Google Cloud Text-to-Speech client
// Uses GOOGLE_APPLICATION_CREDENTIALS env var or API key if available
let ttsClient = null;

// Initialize TTS client asynchronously to avoid blocking server startup
const initializeTTS = async () => {
  if (ttsClient !== null) return; // Already initialized or attempted
  
  try {
    // Try to initialize with credentials file or default credentials
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      ttsClient = new textToSpeech.TextToSpeechClient({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });
      console.log("✅ Google Cloud TTS client initialized with credentials file");
    } else if (process.env.GOOGLE_CLOUD_PROJECT) {
      ttsClient = new textToSpeech.TextToSpeechClient({
        projectId: process.env.GOOGLE_CLOUD_PROJECT,
      });
      console.log("✅ Google Cloud TTS client initialized with project ID");
    } else {
      // Don't try default credentials - it will crash if not available
      console.warn("⚠️ Google Cloud TTS credentials not found. Audio generation disabled.");
      console.warn("⚠️ Set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLOUD_PROJECT to enable TTS.");
      ttsClient = false; // Mark as attempted but failed
      return;
    }
  } catch (err) {
    console.warn("⚠️ Google Cloud TTS client initialization failed:", err.message);
    console.warn("⚠️ Audio generation will be disabled. Set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLOUD_PROJECT env var.");
    ttsClient = false; // Mark as attempted but failed
  }
};

// Initialize on first import (non-blocking)
initializeTTS().catch(() => {
  ttsClient = false;
});

// 🗣 Convert text to audio (MP3) using Google Cloud Text-to-Speech
export async function geminiTextToSpeech(text, fileName = "output.mp3") {
  try {
    if (!text || text.trim().length === 0) {
      console.warn("⚠️ Empty text provided to TTS");
      return null;
    }

    // Ensure TTS client is initialized
    if (ttsClient === null) {
      await initializeTTS();
    }

    if (!ttsClient || ttsClient === false) {
      // TTS not available - return null gracefully
      return null;
    }

    // Configure the request
    const request = {
      input: { text: text },
      voice: {
        languageCode: "en-US",
        name: "en-US-Neural2-F", // Natural, conversational female voice
        ssmlGender: "FEMALE",
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 1.0,
        pitch: 0.0,
        volumeGainDb: 0.0,
      },
    };

    // Perform the text-to-speech request
    const [response] = await ttsClient.synthesizeSpeech(request);

    if (!response.audioContent) {
      throw new Error("No audio content received from TTS service.");
    }

    // Ensure folder exists
    const outputDir = path.resolve(__dirname, "../public/audio");
    fs.mkdirSync(outputDir, { recursive: true });

    // Save MP3
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, response.audioContent, "binary");

    console.log("✅ Voice file generated:", fileName);

    return `/audio/${fileName}`;
  } catch (err) {
    console.error("❌ Google Cloud TTS Error:", err.message);
    // Return null instead of throwing to allow graceful degradation
    return null;
  }
}

