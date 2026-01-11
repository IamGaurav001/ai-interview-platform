import express from "express";
import multer from "multer";
import { verifyFirebaseToken } from "../middleware/firebaseAuthMiddleware.js";
import { analyzeResume, useExistingResume, deleteResume } from "../controllers/resumeController.js";
import { hasCredits } from "../middleware/checkEligibility.js";
import { uploadRateLimiter, userRateLimiter } from "../middleware/rateLimiters.js";
import { sanitizeInput } from "../middleware/sanitization.js";

const router = express.Router();

// OWASP Security: Strict file upload configuration
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1, // Only 1 file per request
  },
  fileFilter: (req, file, cb) => {
    // OWASP Security: Whitelist PDF files only
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

// OWASP Security: Enhanced error handler for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Multer error:", err.code, err.message);
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        error: "File too large",
        message: "File size exceeds 5MB limit. Please upload a smaller file.",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        error: "Too many files",
        message: "Only one file can be uploaded at a time.",
      });
    }
    return res.status(400).json({
      success: false,
      error: "File upload error",
      message: err.message,
    });
  }
  if (err) {
    console.error("File upload error:", err.message);
    return res.status(400).json({
      success: false,
      error: "File upload error",
      message: err.message || "Invalid file. Please upload a PDF file.",
    });
  }
  next();
};

// OWASP Security: Apply sanitization to all routes
router.use(sanitizeInput);

// Resume upload endpoint with strict rate limiting
router.post(
  "/upload",
  verifyFirebaseToken,
  hasCredits,
  uploadRateLimiter, // IP-based upload limiting
  userRateLimiter(10, 3600), // User can upload max 10 resumes per hour
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

// Use existing resume endpoint
router.post(
  "/existing",
  verifyFirebaseToken,
  hasCredits,
  userRateLimiter(20, 60), // 20 requests per minute
  useExistingResume
);

// Delete resume endpoint
router.delete(
  "/:id",
  verifyFirebaseToken,
  userRateLimiter(10, 60), // 10 deletes per minute
  deleteResume
);

export default router;
