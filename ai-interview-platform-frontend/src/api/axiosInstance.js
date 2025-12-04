import axios from "axios";
import { auth } from "../config/firebase.js";

const baseURL = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : "/api";

if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
  console.warn("⚠️  VITE_API_BASE_URL is not set! API calls may fail in production.");
}

const axiosInstance = axios.create({
  baseURL,
  timeout: 30000, 
});

axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
        localStorage.setItem("firebaseToken", token);
      } else {
        const token = localStorage.getItem("firebaseToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error("Error getting Firebase token:", error);
      const token = localStorage.getItem("firebaseToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!error.response) {
      console.error("Network Error:", error.message);
      return Promise.reject({
        message: `Cannot connect to server at ${error.config?.baseURL || 'unknown URL'}. Please make sure the backend is running.`,
        networkError: true,
      });
    }

    if (error.response.status === 401) {
      localStorage.removeItem("firebaseToken");
      // loginTimestamp removal is no longer needed as the feature was removed
      
      if (error.response.data?.code === "SESSION_EXPIRED") {
        console.log("Session expired - logging out");
      }
      
      // Sign out from Firebase to update AuthContext state and trigger legitimate redirect
      auth.signOut().catch(err => console.error("Error signing out on 401:", err));
    }

    if (error.response.status === 429) {
      return Promise.reject({
        message: "You are making too many requests. Please wait a moment and try again.",
        status: 429,
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
