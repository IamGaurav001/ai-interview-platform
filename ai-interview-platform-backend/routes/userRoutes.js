import express from "express";
import { updateProfile, getProfile } from "../controllers/userController.js";
import { verifyFirebaseToken } from "../middleware/firebaseAuthMiddleware.js";
import { userRateLimiter } from "../middleware/rateLimiters.js";
import { sanitizeInput } from "../middleware/sanitization.js";

const router = express.Router();

// OWASP Security: Apply authentication and sanitization to all routes
router.use(verifyFirebaseToken);
router.use(sanitizeInput);

router.get("/profile", userRateLimiter(30, 60), getProfile);
router.put("/profile", userRateLimiter(10, 60), updateProfile);

export default router;
