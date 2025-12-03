import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    resumeUrl: { type: String },
    skills: [String],
    lastLoginAt: { type: Date, index: true },
    usage: {
      freeInterviewsLeft: { type: Number, default: 3 },
      lastMonthlyReset: { type: Date, default: Date.now },
      purchasedCredits: { type: Number, default: 0 },
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
      marketing: { type: Boolean, default: false },
    },
    hasCompletedOnboarding: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
