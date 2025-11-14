// Import needed Firebase functions
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6460IzM31wyatp3DZA7Fuosg-JspNo20",
  authDomain: "ai-interview-coach-71c37.firebaseapp.com",
  projectId: "ai-interview-coach-71c37",
  storageBucket: "ai-interview-coach-71c37.firebasestorage.app",
  messagingSenderId: "1092698828736",
  appId: "1:1092698828736:web:f02c533c74fde05386e225",
  measurementId: "G-JECDZYFPWE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);

export default app;
