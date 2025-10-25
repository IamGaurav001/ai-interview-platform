import express from "express";
import { generateQuestion } from "../controllers/interviewController.js";
import { evaluateAnswer } from "../controllers/interviewController.js";


const router = express.Router();

router.post("/question", generateQuestion);
router.post("/evaluate", evaluateAnswer);

export default router;
