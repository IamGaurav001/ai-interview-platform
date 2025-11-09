import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  generateQuestion,
  evaluateAnswer,
  getInterviewHistory,
  saveCompleteSession,
} from "../controllers/interviewController.js";
import { getWeakAreas, getPrepGuide } from "../controllers/interviewController.js";

const router = express.Router();

router.post("/generate", protect, generateQuestion);
router.post("/evaluate", protect, evaluateAnswer);
router.post("/save-session", protect, saveCompleteSession);
router.get("/history", protect, getInterviewHistory);
router.get("/weak-areas", protect, getWeakAreas);
router.get("/prep-guide", protect, getPrepGuide);


export default router;
