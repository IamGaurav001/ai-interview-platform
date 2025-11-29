import express from "express";
import { syncUser, sendVerificationEmail, sendPasswordResetEmail } from "../controllers/authController.js";
import { verifyFirebaseToken } from "../middleware/firebaseAuthMiddleware.js";

const router = express.Router();

// Sync Firebase user to MongoDB (optional - middleware also handles this)
// This endpoint is useful for explicit user sync or getting user data
router.post("/sync", verifyFirebaseToken, syncUser);

// Send verification email (using backend SMTP)
router.post("/send-verification-email", verifyFirebaseToken, sendVerificationEmail);

// Send password reset email (public endpoint)
router.post("/send-password-reset-email", sendPasswordResetEmail);

export default router;
