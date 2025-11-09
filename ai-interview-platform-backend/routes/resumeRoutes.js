import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import { analyzeResume } from "../controllers/resumeController.js";

const router = express.Router();
const upload = multer({ 
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF files - check both mimetype and extension
    const isPDF = file.mimetype === "application/pdf" || 
                  file.originalname.toLowerCase().endsWith(".pdf");
    if (isPDF) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// Error handling middleware for multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Multer error:", err.code, err.message);
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ 
        error: "File too large",
        message: "File size exceeds 5MB limit. Please upload a smaller file." 
      });
    }
    return res.status(400).json({ 
      error: "File upload error",
      message: err.message 
    });
  }
  if (err) {
    console.error("File upload error:", err.message);
    return res.status(400).json({ 
      error: "File upload error",
      message: err.message || "Invalid file. Please upload a PDF file." 
    });
  }
  next();
};

// Route with proper error handling
router.post("/upload", 
  protect, 
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

export default router;
