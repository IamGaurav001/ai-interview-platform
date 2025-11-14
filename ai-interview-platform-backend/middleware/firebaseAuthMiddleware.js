import admin from "../config/firebaseAdmin.js";
import User from "../models/User.js";

/**
 * Firebase Authentication Middleware
 * Verifies Firebase ID token and attaches user to request
 */
export const verifyFirebaseToken = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
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

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    // Find user by firebaseUid
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      // Check if a user with the same email already exists
      if (decodedToken.email) {
        const existingEmailUser = await User.findOne({ email: decodedToken.email });
        if (existingEmailUser) {
          // Update firebaseUid if needed
          if (!existingEmailUser.firebaseUid || existingEmailUser.firebaseUid !== firebaseUid) {
            existingEmailUser.firebaseUid = firebaseUid;
            await existingEmailUser.save();
          }
          user = existingEmailUser;
        } else {
          // Create new user
          user = await User.create({
            firebaseUid,
            email: decodedToken.email,
            name: decodedToken.name || decodedToken.email.split("@")[0] || "User",
          });
        }
      } else {
        // Create new user without email
        user = await User.create({
          firebaseUid,
          email: "",
          name: decodedToken.name || "User",
        });
      }
    } else {
      // Update email/name if changed in Firebase
      if (decodedToken.email && user.email !== decodedToken.email) {
        user.email = decodedToken.email;
      }
      if (decodedToken.name && user.name !== decodedToken.name) {
        user.name = decodedToken.name;
      }
      await user.save();
    }

    // Attach user to request
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


