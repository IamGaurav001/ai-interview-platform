import express from "express";
import { updateProfile, getProfile } from "../controllers/userController.js";
import { verifyFirebaseToken } from "../middleware/firebaseAuthMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyFirebaseToken);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

export default router;
