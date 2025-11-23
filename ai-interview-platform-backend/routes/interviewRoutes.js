import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { verifyFirebaseToken } from "../middleware/firebaseAuthMiddleware.js";
import { rateLimiter } from "../middleware/rateLimiter.js";
import {
  evaluateAnswer,
  getInterviewHistory,
  saveCompleteSession,
  startInterview,
  nextInterviewStep,
  endInterview,
  getActiveSession,
  evaluateVoiceAnswer,
  cancelInterview,
} from "../controllers/interviewController.js";
import { getWeakAreas } from "../controllers/interviewController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for audio uploads
const uploadDir = path.join(__dirname, "../uploads/audio");
// Ensure directory exists
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `voice-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    const allowedMimes = [
      "audio/webm",
      "audio/wav",
      "audio/mp3",
      "audio/mpeg",
      "audio/ogg",
      "audio/m4a",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only audio files are allowed."), false);
    }
  },
});

const router = express.Router();

// Legacy endpoints (kept for backward compatibility)
router.post("/evaluate", verifyFirebaseToken, rateLimiter(10, 60), evaluateAnswer);
router.post("/save-session", verifyFirebaseToken, saveCompleteSession);
router.get("/history", verifyFirebaseToken, getInterviewHistory);
router.get("/weak-areas", verifyFirebaseToken, getWeakAreas);

// ✅ New Redis-based interview flow endpoints (with rate limiting)
router.post("/start", verifyFirebaseToken, rateLimiter(5, 60), startInterview);
router.post("/next", verifyFirebaseToken, rateLimiter(20, 60), nextInterviewStep);
router.post("/end", verifyFirebaseToken, rateLimiter(5, 60), endInterview);
router.post("/cancel", verifyFirebaseToken, rateLimiter(5, 60), cancelInterview);
router.get("/active-session", verifyFirebaseToken, getActiveSession);

// ✅ Voice answer evaluation endpoint
router.post(
  "/voice-answer",
  verifyFirebaseToken,
  rateLimiter(10, 60),
  upload.single("audio"),
  evaluateVoiceAnswer
);

export default router;
