import User from "../models/User.js";

// Sync Firebase user to MongoDB
// This is called after Firebase authentication to ensure user exists in MongoDB
// The middleware also handles this automatically, but this endpoint is useful
// for explicit syncing or getting user data after registration
export const syncUser = async (req, res) => {
  try {
    // User is already created/updated by verifyFirebaseToken middleware
    const user = req.user;
    
    // Update nickname if provided in request body (e.g. during registration)
    if (req.body.nickname && user.nickname !== req.body.nickname) {
      user.nickname = req.body.nickname;
      await user.save();
    }
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        nickname: user.nickname,
        email: user.email,
        firebaseUid: user.firebaseUid,
        resumeUrl: user.resumeUrl,
        skills: user.skills,
      },
      message: "User synced successfully",
    });
  } catch (error) {
    console.error("Sync user error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};
