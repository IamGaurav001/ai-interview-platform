import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../config/firebase.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from "firebase/auth";
import { 
  sendVerificationEmail as sendVerificationEmailAPI,
  sendPasswordResetEmail as sendPasswordResetEmailAPI
} from "../api/authAPI";
import { setUserId, setUserProperties } from "../config/amplitude";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateToken = async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const token = await firebaseUser.getIdToken();
        localStorage.setItem("firebaseToken", token);
        firebaseUser.getIdToken(true); 
      } catch (error) {
        console.error("Error getting Firebase token:", error);
        localStorage.removeItem("firebaseToken");
      }
    } else {
      localStorage.removeItem("firebaseToken");
    }
  };  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await updateToken(firebaseUser);
        
        // Set Amplitude User Identity
        setUserId(firebaseUser.uid);
        setUserProperties({
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'User',
          email_verified: firebaseUser.emailVerified
        });

        setUser(firebaseUser);
      } else {
        localStorage.removeItem("firebaseToken");
        setUserId(null); // Clear Amplitude user on logout
        setUser(null);
      }
      setLoading(false);
    });

    const tokenRefreshInterval = setInterval(async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken(true);
          localStorage.setItem("firebaseToken", token);
        } catch (error) {
          console.error("Error refreshing token:", error);
        }
      }
    }, 50 * 60 * 1000); 
    return () => {
      unsub();
      clearInterval(tokenRefreshInterval);
    };
  }, []);

  const signup = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    await updateToken(userCredential.user);
    
    // Send verification email
    try {
      await sendVerificationEmailAPI();
    } catch (error) {
      console.error("Error sending verification email:", error);
    }
    
    setUser(userCredential.user);

    return userCredential.user;
  };

  const sendVerificationEmail = async (user) => {
    if (user) {
      // Send verification email
      try {
        await sendVerificationEmailAPI();
      } catch (error) {
        console.error("Error sending verification email:", error);
      }
    }
  };

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    
    await updateToken(userCredential.user);
    
    setUser(userCredential.user);
    
    return userCredential.user;
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("firebaseToken");

    setUser(null);
  };

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const result = await signInWithPopup(auth, provider);
      await updateToken(result.user);

      setUser(result.user);
      return result.user;
    } catch (error) {
      if (error?.code === "auth/popup-blocked") {
        await signInWithRedirect(auth, provider);
        return null;
      }
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  const updateUser = async (profileData) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, profileData);
      setUser({ ...auth.currentUser, ...profileData });
      return auth.currentUser;
    }
    return null;
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmailAPI(email);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      if (error.response) {
        console.error("Backend Error Details:", error.response.data);
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, googleLogin, updateUser, resetPassword, sendVerificationEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
