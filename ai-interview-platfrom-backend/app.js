import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import interviewRoutes from "./routes/interviewRoutes.js";
import connectDB from "./config/db.js";

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/interview", interviewRoutes);

app.get("/", (req, res) => {
  res.send("AI Interview Coach Backend is running ✅");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
