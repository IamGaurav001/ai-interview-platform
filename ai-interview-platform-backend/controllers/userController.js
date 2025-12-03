import User from "../models/User.js";

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,

        email: user.email,
        firebaseUid: user.firebaseUid,
        resumeUrl: user.resumeUrl,
        skills: user.skills,
        usage: user.usage,
        notifications: user.notifications,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        role: (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL) ? "admin" : user.role,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (req.body.hasCompletedOnboarding !== undefined) {
      user.hasCompletedOnboarding = req.body.hasCompletedOnboarding;
    }
    if (req.body.notifications) {
      user.notifications = { ...user.notifications, ...req.body.notifications };
    }


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
        notifications: user.notifications,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};
