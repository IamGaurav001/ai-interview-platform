import User from "../models/User.js";

export const syncUser = async (req, res) => {
  try {
    const user = req.user;

    user.lastLoginAt = new Date();



    await user.save();

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,

        email: user.email,
        firebaseUid: user.firebaseUid,
        resumeUrl: user.resumeUrl,
        skills: user.skills,
        resumeUrl: user.resumeUrl,
        skills: user.skills,
        lastLoginAt: user.lastLoginAt,
        usage: user.usage,
      },
      message: "User synced successfully",
    });
  } catch (error) {
    console.error("Sync user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
