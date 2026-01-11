import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { verifyFirebaseToken } from "../middleware/firebaseAuthMiddleware.js";
import { userRateLimiter, uploadRateLimiter } from "../middleware/rateLimiters.js";
import { sanitizeInput } from "../middleware/sanitization.js";
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
  resetInterview,
} from "../controllers/interviewController.js";
import { getWeakAreas } from "../controllers/interviewController.js";
import { checkInterviewEligibility, hasCredits } from "../middleware/checkEligibility.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const uploadDir = path.join(__dirname, "../uploads/audio");

fs.mkdirSync(uploadDir, { recursive: true });

// OWASP Security: Strict file upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename to prevent path traversal
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `voice-${uniqueSuffix}-${sanitizedName}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
    files: 1, // Only 1 file per request
  },
  fileFilter: (req, file, cb) => {
    // OWASP Security: Whitelist allowed MIME types
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

// OWASP Security: Apply sanitization to all routes
router.use(sanitizeInput);

// Public endpoints with IP-based rate limiting
router.post("/evaluate", verifyFirebaseToken, hasCredits, userRateLimiter(10, 60), evaluateAnswer);
router.post("/save-session", verifyFirebaseToken, hasCredits, userRateLimiter(5, 60), saveCompleteSession);
router.get("/history", verifyFirebaseToken, userRateLimiter(20, 60), getInterviewHistory);
router.get("/weak-areas", verifyFirebaseToken, userRateLimiter(20, 60), getWeakAreas);

// Interview flow endpoints with stricter rate limiting
router.post("/start", verifyFirebaseToken, hasCredits, userRateLimiter(5, 60), startInterview);
router.post("/next", verifyFirebaseToken, hasCredits, userRateLimiter(20, 60), nextInterviewStep);
router.post("/end", verifyFirebaseToken, hasCredits, userRateLimiter(5, 60), endInterview);
router.post("/cancel", verifyFirebaseToken, hasCredits, userRateLimiter(5, 60), cancelInterview);
router.post("/reset", verifyFirebaseToken, hasCredits, userRateLimiter(5, 60), resetInterview);
router.get("/active-session", verifyFirebaseToken, userRateLimiter(20, 60), getActiveSession);

// Voice upload endpoint with upload-specific rate limiting
router.post(
  "/voice-answer",
  verifyFirebaseToken,
  hasCredits,
  uploadRateLimiter, // IP-based upload limiting
  userRateLimiter(10, 60), // User-based limiting
  upload.single("audio"),
  evaluateVoiceAnswer
);

export default router;
