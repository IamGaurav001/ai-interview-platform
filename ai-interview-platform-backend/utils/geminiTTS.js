import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import textToSpeech from "@google-cloud/text-to-speech";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let ttsClient = null;

const initializeTTS = async () => {
  if (ttsClient !== null) return; 
  
  try {
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
      console.warn("⚠️ Google Cloud TTS credentials not found. Audio generation disabled.");
      console.warn("⚠️ Set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLOUD_PROJECT to enable TTS.");
      ttsClient = false;
      return;
    }
  } catch (err) {
    console.warn("⚠️ Google Cloud TTS client initialization failed:", err.message);
    console.warn("⚠️ Audio generation will be disabled. Set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLOUD_PROJECT env var.");
    ttsClient = false;
  }
};

initializeTTS().catch(() => {
  ttsClient = false;
});

export async function geminiTextToSpeech(text, fileName = "output.mp3") {
  try {
    if (!text || text.trim().length === 0) {
      console.warn("⚠️ Empty text provided to TTS");
      return null;
    }

    if (ttsClient === null) {
      await initializeTTS();
    }

    if (!ttsClient || ttsClient === false) {
      return null;
    }

    const request = {
      input: { text: text },
      voice: {
        languageCode: "en-US",
        name: "en-US-Neural2-F",
        ssmlGender: "FEMALE",
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 1.0,
        pitch: 0.0,
        volumeGainDb: 0.0,
      },
    };

    const [response] = await ttsClient.synthesizeSpeech(request);

    if (!response.audioContent) {
      throw new Error("No audio content received from TTS service.");
    }

    const outputDir = path.resolve(__dirname, "../public/audio");
    fs.mkdirSync(outputDir, { recursive: true });

    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, response.audioContent, "binary");

    console.log("✅ Voice file generated:", fileName);

    return `/audio/${fileName}`;
  } catch (err) {
    console.error("❌ Google Cloud TTS Error:", err.message);
    return null;
  }
}

