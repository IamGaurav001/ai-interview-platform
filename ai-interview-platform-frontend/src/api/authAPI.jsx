import axios from "./axiosInstance";

// Sync Firebase user to MongoDB backend
// This ensures the user exists in MongoDB after Firebase authentication
// This ensures the user exists in MongoDB after Firebase authentication
export const syncUser = () => axios.post("/auth/sync");

// Update user profile
export const updateUserProfile = (data) => axios.put("/user/profile", data);
