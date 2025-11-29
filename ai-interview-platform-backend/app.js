import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import mongoose from "mongoose";
import redisClient from "./config/redis.js";
import monetizationRoutes from "./routes/monetizationRoutes.js";


dotenv.config();
const app = express();

connectDB();

// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://13.60.25.27",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

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
app.use("/api/user", userRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/monetization", monetizationRoutes);

app.get("/", (req, res) => {
  res.send("IntervueAI Backend is running ✅");
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server immediately (don't wait for Redis)
console.log("CI/CD working test");
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Connect to Redis in background (non-blocking)
  redisClient.connect()
    .then(() => {
      console.log("✅ Redis connected successfully");
    })
    .catch((err) => {
      console.error("❌ Redis connection failed:", err.message);
      console.log("⚠️  Server running without Redis. Some features may not work.");
    });
});
