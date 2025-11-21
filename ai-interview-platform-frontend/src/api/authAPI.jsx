import axios from "./axiosInstance";

// Sync Firebase user to MongoDB backend
// This ensures the user exists in MongoDB after Firebase authentication
// Optionally accepts nickname to update it during sync (e.g. registration)
export const syncUser = (nickname) => axios.post("/auth/sync", { nickname });

// Update user profile
export const updateUserProfile = (data) => axios.put("/user/profile", data);
