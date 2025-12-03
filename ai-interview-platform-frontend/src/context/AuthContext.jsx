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

import { getUserProfile } from "../api/userAPI";

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
        
        // Fetch user profile from backend
        try {
          const response = await getUserProfile();
          if (response.data && response.data.user) {
             const backendUser = response.data.user;
             // Merge backend user data with firebase user object
             // We create a new object to avoid mutating the Firebase UserImpl object directly if it's frozen
             firebaseUser = { ...firebaseUser, ...backendUser, uid: firebaseUser.uid, email: firebaseUser.email }; 
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }

        // Set Amplitude User Identity
        // Set Amplitude User Identity
        const userId = firebaseUser.email || firebaseUser.uid;
        if (userId) {
          setUserId(userId);
          setUserProperties({
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'User',
            email_verified: firebaseUser.emailVerified,
            role: firebaseUser.role,
            user_id: firebaseUser.uid // Store UID as a property for reference
          });
        }

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
    
    // Set Amplitude User Identity
    // Set Amplitude User Identity
    const userId = userCredential.user.email || userCredential.user.uid;
    setUserId(userId);
    setUserProperties({
      email: userCredential.user.email,
      name: displayName || 'User',
      username: displayName || 'User',
      email_verified: userCredential.user.emailVerified,
      user_id: userCredential.user.uid
    });

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
    
    // Set Amplitude User Identity
    // Set Amplitude User Identity
    const userId = userCredential.user.email || userCredential.user.uid;
    setUserId(userId);
    setUserProperties({
      email: userCredential.user.email,
      name: userCredential.user.displayName || 'User',
      username: userCredential.user.displayName || 'User',
      email_verified: userCredential.user.emailVerified,
      user_id: userCredential.user.uid
    });

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

      // Set Amplitude User Identity
      // Set Amplitude User Identity
      const userId = result.user.email || result.user.uid;
      setUserId(userId);
      setUserProperties({
        email: result.user.email,
        name: result.user.displayName || 'User',
        username: result.user.displayName || 'User',
        email_verified: result.user.emailVerified,
        user_id: result.user.uid
      });

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
