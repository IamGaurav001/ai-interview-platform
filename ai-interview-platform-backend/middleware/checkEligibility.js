import User from "../models/User.js";

export const checkInterviewEligibility = async (req, res, next) => {
  try {
    console.log(`🔍 checkInterviewEligibility called for: ${req.originalUrl}`);
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.usage) {
      user.usage = {
        freeInterviewsLeft: 3,
        lastMonthlyReset: new Date(),
        purchasedCredits: 0,
      };
    }

    const now = new Date();
    const lastReset = new Date(user.usage.lastMonthlyReset);
    const daysSinceReset = (now - lastReset) / (1000 * 60 * 60 * 24);

    if (daysSinceReset >= 30) {
      user.usage.freeInterviewsLeft = 3;
      user.usage.lastMonthlyReset = now;
    }

    
    if (user.usage.freeInterviewsLeft > 0) {
      user.usage.freeInterviewsLeft -= 1;
      await user.save();
      return next();
    } else if (user.usage.purchasedCredits > 0) {
      user.usage.purchasedCredits -= 1;
      await user.save();
      return next();
    } else {
      return res.status(403).json({
        message: "No interview credits left. Please purchase more.",
        code: "NO_CREDITS",
      });
    }
  } catch (error) {
    console.error("Eligibility check error:", error);
    res.status(500).json({ message: "Server error checking eligibility" });
  }
};

export const hasCredits = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.usage) {
      user.usage = {
        freeInterviewsLeft: 3,
        lastMonthlyReset: new Date(),
        purchasedCredits: 0,
      };
      await user.save();
    }

    const totalCredits = (user.usage.freeInterviewsLeft || 0) + (user.usage.purchasedCredits || 0);

    if (totalCredits > 0) {
      return next();
    } else {
      return res.status(403).json({
        message: "No interview credits left. Please purchase more.",
        code: "NO_CREDITS",
      });
    }
  } catch (error) {
    console.error("Credit check error:", error);
    res.status(500).json({ message: "Server error checking credits" });
  }
};
