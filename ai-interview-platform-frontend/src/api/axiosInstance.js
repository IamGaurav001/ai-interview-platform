import axios from "axios";
import { auth } from "../config/firebase.js";

const axiosInstance = axios.create({
  baseURL: "/api",
  timeout: 30000, // 30 seconds timeout (can be overridden per request)
});

// Request interceptor - add Firebase ID token to headers
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Get current Firebase user
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        // Get fresh token (Firebase SDK handles caching and refresh automatically)
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
        // Update localStorage for consistency
        localStorage.setItem("firebaseToken", token);
      } else {
        // Fallback to localStorage token if user object not available
        const token = localStorage.getItem("firebaseToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error("Error getting Firebase token:", error);
      // Try to use stored token as fallback
      const token = localStorage.getItem("firebaseToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Don't override Content-Type for FormData - let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error("Network Error:", error.message);
      return Promise.reject({
        message: "Network error. Please check if the backend server is running.",
        networkError: true,
      });
    }

    // Handle 401 Unauthorized - clear token and redirect to login
    if (error.response.status === 401) {
      localStorage.removeItem("firebaseToken");
      // Only redirect if not already on login/register page
      if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
        window.location.href = "/login";
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default axiosInstance;
