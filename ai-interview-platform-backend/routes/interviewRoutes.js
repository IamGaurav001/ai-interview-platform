import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { rateLimiter } from "../middleware/rateLimiter.js";
import {
  generateQuestion,
  evaluateAnswer,
  getInterviewHistory,
  saveCompleteSession,
  startInterview,
  nextInterviewStep,
  endInterview,
  getActiveSession,
} from "../controllers/interviewController.js";
import { getWeakAreas, getPrepGuide } from "../controllers/interviewController.js";

const router = express.Router();

// Legacy endpoints (kept for backward compatibility)
router.post("/generate", protect, rateLimiter(10, 60), generateQuestion);
router.post("/evaluate", protect, rateLimiter(10, 60), evaluateAnswer);
router.post("/save-session", protect, saveCompleteSession);
router.get("/history", protect, getInterviewHistory);
router.get("/weak-areas", protect, getWeakAreas);
router.get("/prep-guide", protect, getPrepGuide);

// ✅ New Redis-based interview flow endpoints (with rate limiting)
router.post("/start", protect, rateLimiter(5, 60), startInterview);
router.post("/next", protect, rateLimiter(20, 60), nextInterviewStep);
router.post("/end", protect, rateLimiter(5, 60), endInterview);
router.get("/active-session", protect, getActiveSession);

export default router;
