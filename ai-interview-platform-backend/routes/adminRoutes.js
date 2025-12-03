import express from "express";
import { verifyFirebaseToken } from "../middleware/firebaseAuthMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import {
  getDashboardStats,
  getAllUsers,
  getRecentActivity,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(verifyFirebaseToken);
router.use(isAdmin);

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.get("/activity", getRecentActivity);

export default router;
