import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    nickname: { type: String },
    resumeUrl: { type: String },
    skills: [String],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
