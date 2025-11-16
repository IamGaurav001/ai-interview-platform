import express from "express";
import { syncUser } from "../controllers/authController.js";
import { verifyFirebaseToken } from "../middleware/firebaseAuthMiddleware.js";

const router = express.Router();

// Sync Firebase user to MongoDB (optional - middleware also handles this)
// This endpoint is useful for explicit user sync or getting user data
router.post("/sync", verifyFirebaseToken, syncUser);

export default router;
