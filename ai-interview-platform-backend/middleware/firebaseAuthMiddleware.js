import admin from "../config/firebaseAdmin.js";
import User from "../models/User.js";
import { disposableDomains } from "../utils/disposableDomains.js";

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

    if (email) {
      const domain = email.split("@")[1].toLowerCase();
      if (disposableDomains.includes(domain)) {
        return res.status(403).json({
          message: "Disposable email addresses are not allowed. Please use a valid email provider.",
        });
      }
    }

    let user = await User.findOne({ firebaseUid });

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
        if (createError.code === 11000) {
          console.warn("⚠️ Race condition or duplicate detected, attempting recovery...");
          user = await User.findOne({ $or: [{ firebaseUid }, { email }] });
          
          if (user) {
             if (user.firebaseUid !== firebaseUid) {
                 user.firebaseUid = firebaseUid;
                 await user.save();
             }
          } else {
             throw createError;
          }
        } else {
          throw createError;
        }
      }
    } else {
      
      let isModified = false;
      if (email && user.email !== email) {
        user.email = email;
        isModified = true;
      }
      if (decodedToken.name && user.name !== decodedToken.name) {
        user.name = decodedToken.name;
        isModified = true;
      }
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



