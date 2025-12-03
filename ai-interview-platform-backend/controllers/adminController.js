import User from "../models/User.js";
import InterviewSession from "../models/InterviewSession.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInterviews = await InterviewSession.countDocuments();
    
    // Active users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.countDocuments({ lastLoginAt: { $gte: thirtyDaysAgo } });

    res.status(200).json({
      totalUsers,
      totalInterviews,
      activeUsers,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard stats", error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password") // Exclude password if it existed (though we use firebaseUid)
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const activities = await InterviewSession.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(20);
      
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching activities", error: error.message });
  }
};
