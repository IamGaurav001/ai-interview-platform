import express from "express";
import { createOrder, verifyPayment } from "../controllers/monetizationController.js";
import { verifyFirebaseToken } from "../middleware/firebaseAuthMiddleware.js";

const router = express.Router();

router.use(verifyFirebaseToken);

router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);

export default router;
