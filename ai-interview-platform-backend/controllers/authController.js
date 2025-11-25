import User from "../models/User.js";

export const syncUser = async (req, res) => {
  try {
    const user = req.user;
    
    user.lastLoginAt = new Date();
    
    if (req.body.nickname && user.nickname !== req.body.nickname) {
      user.nickname = req.body.nickname;
    }
    
    await user.save();
    
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
        lastLoginAt: user.lastLoginAt,
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
