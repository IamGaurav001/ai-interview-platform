import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

// Config
import connectDB from "./config/db.js";
import redisClient from "./config/redis.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import monetizationRoutes from "./routes/monetizationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Middleware
import { errorHandler } from "./middleware/errorMiddleware.js";

// Initialize Environment
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// Middleware Configuration
// ==========================================

// Trust proxy (required for rate limiting behind load balancers/proxies like Nginx/Vercel)
app.set('trust proxy', 1);

// 1. CORS - Must be first to handle preflight requests correctly
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://prephire.co",
  "https://www.prephire.co",
  "https://prephire.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// 2. Security & Performance
app.use(helmet());
app.use(compression());

// 3. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 4. Body Parsing & Static Files
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/audio", express.static("public/audio"));

// ==========================================
// Routes
// ==========================================

// Health Check
app.get("/health", async (req, res) => {
  try {
    const mongoStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
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

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/monetization", monetizationRoutes);
app.use("/api/admin", adminRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("IntervueAI Backend is running ✅");
});

// Error Handling (Must be last)
app.use(errorHandler);

// ==========================================
// Server Startup & Graceful Shutdown
// ==========================================

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Connect to Redis
    await redisClient.connect();
    console.log("✅ Redis connected successfully");

    // 3. Start Server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Graceful Shutdown Logic
    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(() => {
        console.log("HTTP server closed.");
      });

      try {
        await mongoose.connection.close(false);
        console.log("MongoDB connection closed.");
        
        if (redisClient.isOpen) {
          await redisClient.quit();
          console.log("Redis connection closed.");
        }
        
        process.exit(0);
      } catch (err) {
        console.error("Error during shutdown:", err);
        process.exit(1);
      }
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
