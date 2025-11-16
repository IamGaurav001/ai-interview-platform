import axios from "./axiosInstance";

// Sync Firebase user to MongoDB backend
// This ensures the user exists in MongoDB after Firebase authentication
export const syncUser = () => axios.post("/auth/sync");
