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
  getRedirectResult,
  sendPasswordResetEmail
} from "firebase/auth";

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
  };





  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await updateToken(firebaseUser);
        
        setUser(firebaseUser);
      } else {
        localStorage.removeItem("firebaseToken");
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
    

    
    setUser(userCredential.user);

    return userCredential.user;
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

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, googleLogin, updateUser, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
