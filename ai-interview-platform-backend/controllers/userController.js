import User from "../models/User.js";
import { strictUpdateProfileSchema } from "../validators/userValidators.js";


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
        resumes: user.resumes?.length > 0 ? user.resumes : (user.resume ? [user.resume] : []),
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


export const updateProfile = async (req, res) => {
  try {
    // OWASP Security: Strict input validation
    const validation = strictUpdateProfileSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid input data",
        error: validation.error.errors?.[0]?.message || "Invalid input data" 
      });
    }

    const { name, hasCompletedOnboarding, notifications } = validation.data;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only update fields that were provided and validated
    if (name) user.name = name;
    if (hasCompletedOnboarding !== undefined) {
      user.hasCompletedOnboarding = hasCompletedOnboarding;
    }
    if (notifications) {
      user.notifications = { ...user.notifications, ...notifications };
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
        resumes: user.resumes,
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
