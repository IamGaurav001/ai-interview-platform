import express from "express";
import { syncUser, sendVerificationEmail, sendPasswordResetEmail } from "../controllers/authController.js";
import { verifyFirebaseToken } from "../middleware/firebaseAuthMiddleware.js";

const router = express.Router();



router.post("/sync", verifyFirebaseToken, syncUser);


router.post("/send-verification-email", verifyFirebaseToken, sendVerificationEmail);


router.post("/send-password-reset-email", sendPasswordResetEmail);

export default router;
