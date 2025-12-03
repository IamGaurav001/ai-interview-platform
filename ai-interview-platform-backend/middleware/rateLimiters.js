import rateLimit from "express-rate-limit";

export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 payment creation requests per hour
  message: "Too many payment requests created from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit verification attempts
  message: "Too many payment verification attempts, please try again later.",
});
