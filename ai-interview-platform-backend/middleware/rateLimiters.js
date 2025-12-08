import rateLimit from "express-rate-limit";

export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 10, 
  message: "Too many payment requests created from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20, 
  message: "Too many payment verification attempts, please try again later.",
});
