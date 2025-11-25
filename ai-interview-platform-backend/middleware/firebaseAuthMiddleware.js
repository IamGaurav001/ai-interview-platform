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

    let user = await User.findOne({ firebaseUid });

    if (!user) {
      user = await User.create({
        firebaseUid,
        email: decodedToken.email || "",
        name: decodedToken.name || decodedToken.email?.split("@")[0] || "User",
        lastLoginAt: new Date(), 
      });
    } else {
      const SESSION_DURATION = 24 * 60 * 60 * 1000;
      
      if (user.lastLoginAt) {
        const sessionAge = Date.now() - new Date(user.lastLoginAt).getTime();
        if (sessionAge > SESSION_DURATION) {
          return res.status(401).json({ 
            code: "SESSION_EXPIRED",
            message: "Your session has expired. Please login again." 
          });
        }
      }
      
      if (decodedToken.email && user.email !== decodedToken.email) {
        user.email = decodedToken.email;
      }
      if (decodedToken.name && user.name !== decodedToken.name) {
        user.name = decodedToken.name;
      }
      await user.save();
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



