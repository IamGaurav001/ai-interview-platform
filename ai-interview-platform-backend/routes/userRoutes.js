import express from "express";
import { updateProfile, getProfile } from "../controllers/userController.js";
import { verifyFirebaseToken } from "../middleware/firebaseAuthMiddleware.js";

const router = express.Router();


router.use(verifyFirebaseToken);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

export default router;
