import express from "express";
import multer from "multer";
import { verifyFirebaseToken } from "../middleware/firebaseAuthMiddleware.js";
import { analyzeResume, useExistingResume, deleteResume } from "../controllers/resumeController.js";
import { hasCredits } from "../middleware/checkEligibility.js";

const router = express.Router();
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const isPDF =
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");
    if (isPDF) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Multer error:", err.code, err.message);
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "File too large",
        message: "File size exceeds 5MB limit. Please upload a smaller file.",
      });
    }
    return res.status(400).json({
      error: "File upload error",
      message: err.message,
    });
  }
  if (err) {
    console.error("File upload error:", err.message);
    return res.status(400).json({
      error: "File upload error",
      message: err.message || "Invalid file. Please upload a PDF file.",
    });
  }
  next();
};



router.post(
  "/upload",
  verifyFirebaseToken,
  hasCredits,
  (req, res, next) => {
    upload.single("resume")(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  analyzeResume
);

router.post(
  "/existing",
  verifyFirebaseToken,
  hasCredits,
  useExistingResume
);

router.delete(
  "/:id",
  verifyFirebaseToken,
  deleteResume
);

export default router;
