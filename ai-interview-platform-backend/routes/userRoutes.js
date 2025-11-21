import express from "express";
import { updateProfile } from "../controllers/userController.js";
import { verifyFirebaseToken } from "../middleware/firebaseAuthMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyFirebaseToken);

router.put("/profile", updateProfile);

export default router;
