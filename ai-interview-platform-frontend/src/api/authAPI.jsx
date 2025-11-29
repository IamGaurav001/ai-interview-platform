import axios from "./axiosInstance";

// Sync Firebase user to MongoDB backend
// This ensures the user exists in MongoDB after Firebase authentication
export const syncUser = () => axios.post("/auth/sync");

// Update user profile
export const updateUserProfile = (data) => axios.put("/user/profile", data);

// Send verification email
export const sendVerificationEmail = () => axios.post("/auth/send-verification-email");

// Send password reset email
export const sendPasswordResetEmail = (email) => axios.post("/auth/send-password-reset-email", { email });
