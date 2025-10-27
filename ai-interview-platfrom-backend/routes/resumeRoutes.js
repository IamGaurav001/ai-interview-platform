import express from "express";
import multer from "multer";
// pdf-parse import removed as it's handled in controller
import { analyzeResume } from "../controllers/resumeController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("resume"), analyzeResume);

export default router;
