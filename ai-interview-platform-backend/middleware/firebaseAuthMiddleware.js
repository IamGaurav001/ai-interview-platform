import admin from "../config/firebaseAdmin.js";
import User from "../models/User.js";

export const verifyFirebaseToken = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ 
        message: "Not authorized, no token provided" 
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;

    let user = await User.findOne({ firebaseUid });

    // If not found by UID, try finding by email (to prevent duplicates)
    if (!user && email) {
      user = await User.findOne({ email });
      if (user) {
        console.log(`🔗 Linking existing user ${email} to new Firebase UID`);
        user.firebaseUid = firebaseUid;
      }
    }

    if (!user) {
      try {
        user = await User.create({
          firebaseUid,
          email: email || "",
          name: decodedToken.name || email?.split("@")[0] || "User",
          lastLoginAt: new Date(),
        });
      } catch (createError) {
        // Handle race condition: Duplicate key error (E11000)
        if (createError.code === 11000) {
          console.warn("⚠️ Race condition or duplicate detected, attempting recovery...");
          user = await User.findOne({ $or: [{ firebaseUid }, { email }] });
          
          if (user) {
             // If found, ensure UID is linked
             if (user.firebaseUid !== firebaseUid) {
                 user.firebaseUid = firebaseUid;
                 await user.save();
             }
          } else {
             // Still failed? Throw original error
             throw createError;
          }
        } else {
          throw createError;
        }
      }
    } else {
      // Session expiration check removed to allow persistent login
      // Firebase token validation handles security

      
      let isModified = false;
      if (email && user.email !== email) {
        user.email = email;
        isModified = true;
      }
      if (decodedToken.name && user.name !== decodedToken.name) {
        user.name = decodedToken.name;
        isModified = true;
      }
      // Ensure UID is consistent (in case we found by email)
      if (user.firebaseUid !== firebaseUid) {
        user.firebaseUid = firebaseUid;
        isModified = true;
      }

      if (isModified) {
        await user.save();
      }
    }

    req.user = user;
    req.firebaseUid = firebaseUid;
    next();
  } catch (error) {
    console.error("Firebase auth error:", error.message);
    
    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({ 
        message: "Token expired. Please sign in again." 
      });
    }
    
    if (error.code === "auth/argument-error" || error.code === "auth/invalid-id-token") {
      return res.status(401).json({ 
        message: "Invalid token. Please sign in again." 
      });
    }

    return res.status(401).json({ 
      message: "Not authorized, token verification failed",
      error: error.message 
    });
  }
};



