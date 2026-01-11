import express from "express";
import { syncUser, sendVerificationEmail, sendPasswordResetEmail } from "../controllers/authController.js";
import { verifyFirebaseToken } from "../middleware/firebaseAuthMiddleware.js";
import { strictRateLimiter, userRateLimiter } from "../middleware/rateLimiters.js";
import { sanitizeInput } from "../middleware/sanitization.js";

const router = express.Router();

// OWASP Security: Apply sanitization to all routes
router.use(sanitizeInput);

// Authenticated endpoints
router.post("/sync", verifyFirebaseToken, userRateLimiter(10, 60), syncUser);
router.post("/send-verification-email", verifyFirebaseToken, userRateLimiter(3, 3600), sendVerificationEmail);

// Public endpoint with strict rate limiting (prevent brute force)
router.post("/send-password-reset-email", strictRateLimiter, sendPasswordResetEmail);

export default router;
