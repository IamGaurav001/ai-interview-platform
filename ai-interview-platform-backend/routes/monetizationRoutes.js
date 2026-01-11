import express from "express";
import { createOrder, verifyPayment, getTransactionHistory } from "../controllers/monetizationController.js";
import { verifyFirebaseToken } from "../middleware/firebaseAuthMiddleware.js";
import { paymentRateLimiter, verificationRateLimiter, userRateLimiter } from "../middleware/rateLimiters.js";
import { sanitizeInput } from "../middleware/sanitization.js";

const router = express.Router();

// OWASP Security: Apply authentication and sanitization to all routes
router.use(verifyFirebaseToken);
router.use(sanitizeInput);

// Payment endpoints with strict rate limiting
router.post("/create-order", paymentRateLimiter, userRateLimiter(5, 3600), createOrder);
router.post("/verify-payment", verificationRateLimiter, userRateLimiter(10, 900), verifyPayment);
router.get("/history", userRateLimiter(20, 60), getTransactionHistory);

export default router;
