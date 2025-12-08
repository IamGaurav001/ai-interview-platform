import express from "express";
import { createOrder, verifyPayment, getTransactionHistory } from "../controllers/monetizationController.js";
import { verifyFirebaseToken } from "../middleware/firebaseAuthMiddleware.js";

import { paymentLimiter, verificationLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.use(verifyFirebaseToken);

router.post("/create-order", paymentLimiter, createOrder);
router.post("/verify-payment", verificationLimiter, verifyPayment);
router.get("/history", getTransactionHistory);

export default router;
