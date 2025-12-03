import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const makeAdmin = async () => {
  const email = process.argv[2];

  if (!email) {
    console.error("Please provide an email address as an argument.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOne({ email });

    if (!user) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    user.role = "admin";
    await user.save();

    console.log(`User ${email} is now an admin.`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

makeAdmin();
