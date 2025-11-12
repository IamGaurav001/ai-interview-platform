import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import mongoose from "mongoose";
import redisClient from "./config/redis.js";

dotenv.config(); 
const app = express();

connectDB();

// ✅ Core middlewares
app.use(cors());
app.use(express.json());

// 🔊 Serve audio files
app.use("/audio", express.static("public/audio"));

app.get("/health", async (req, res) => {
  try {
    const mongoStatus =
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
    const redisStatus = redisClient.isOpen ? "Connected" : "Disconnected";

    res.status(200).json({
      status: "OK",
      mongo: mongoStatus,
      redis: redisStatus,
      uptime: process.uptime().toFixed(0) + "s",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/resume", resumeRoutes);

app.get("/", (req, res) => {
  res.send("AI Interview Coach Backend is running ✅");
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await redisClient.connect();
    console.log("✅ Redis connected successfully");
  } catch (err) {
    console.error("❌ Redis connection failed:", err.message);
  }

  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})();
