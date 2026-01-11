import rateLimit from "express-rate-limit";
import redisClient from "../config/redis.js";

/**
 * OWASP Security: Enhanced Rate Limiting
 * - IP-based rate limiting for public endpoints
 * - User-based rate limiting for authenticated endpoints
 * - Graceful 429 responses with retry information
 * - Redis-backed for distributed systems
 */

/**
 * IP-based rate limiter for public endpoints
 * Prevents brute force and DDoS attacks
 */
export const ipRateLimiter = (maxRequests = 100, windowMinutes = 15) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message: {
      success: false,
      error: "Too many requests",
      message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMinutes} minutes allowed.`,
      retryAfter: windowMinutes * 60,
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: "Too many requests",
        message: `You have exceeded the ${maxRequests} requests in ${windowMinutes} minutes limit. Please try again later.`,
        retryAfter: windowMinutes * 60,
      });
    },
    // Skip health checks from rate limiting
    skip: (req, res) => {
      return req.path === "/health";
    },
  });
};

/**
 * User-based rate limiter (Redis-backed)
 * More granular control for authenticated users
 * Prevents abuse from authenticated accounts
 */
export const userRateLimiter = (maxRequests = 10, windowSeconds = 60) => {
  return async (req, res, next) => {
    try {
      // Skip if user is not authenticated
      if (!req.user || !req.user._id) {
        return next();
      }

      const userId = req.user._id.toString();
      const key = `ratelimit:user:${userId}:${req.path}`;

      const requests = await redisClient.incr(key);

      // Set expiry on first request
      if (requests === 1) {
        await redisClient.expire(key, windowSeconds);
      }

      // Check if limit exceeded
      if (requests > maxRequests) {
        const ttl = await redisClient.ttl(key);
        return res.status(429).json({
          success: false,
          error: "Too many requests",
          message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowSeconds} seconds allowed for this endpoint.`,
          retryAfter: ttl,
          limit: maxRequests,
          remaining: 0,
          reset: Date.now() + ttl * 1000,
        });
      }

      // Set rate limit headers
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - requests));
      res.setHeader("X-RateLimit-Reset", Date.now() + windowSeconds * 1000);

      next();
    } catch (error) {
      console.error("❌ User rate limiter error:", error.message);
      // Fail open - don't block requests if Redis is down
      next();
    }
  };
};

/**
 * Combined IP + User rate limiter
 * Applies both IP and user-based limits
 */
export const combinedRateLimiter = (
  ipMax = 100,
  ipWindowMinutes = 15,
  userMax = 10,
  userWindowSeconds = 60
) => {
  const ipLimiter = ipRateLimiter(ipMax, ipWindowMinutes);
  const userLimiter = userRateLimiter(userMax, userWindowSeconds);

  return [ipLimiter, userLimiter];
};

/**
 * Strict rate limiter for sensitive endpoints (auth, payments)
 * Lower limits to prevent brute force attacks
 */
export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 requests per 15 minutes
  message: {
    success: false,
    error: "Too many attempts",
    message: "Too many attempts from this IP. Please try again after 15 minutes.",
    retryAfter: 900,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "Too many attempts",
      message: "Too many attempts from this IP. Please try again after 15 minutes.",
      retryAfter: 900,
    });
  },
});

/**
 * Payment endpoint rate limiter
 * Prevents payment fraud and abuse
 */
export const paymentRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 payment attempts per hour
  message: {
    success: false,
    error: "Too many payment requests",
    message: "Too many payment requests from this IP. Please try again later.",
    retryAfter: 3600,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "Too many payment requests",
      message: "Too many payment requests created from this IP. Please try again later.",
      retryAfter: 3600,
    });
  },
});

/**
 * Payment verification rate limiter
 * Stricter than payment creation to prevent signature brute force
 */
export const verificationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 verification attempts per 15 minutes
  message: {
    success: false,
    error: "Too many verification attempts",
    message: "Too many payment verification attempts. Please try again later.",
    retryAfter: 900,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "Too many verification attempts",
      message: "Too many payment verification attempts. Please try again later.",
      retryAfter: 900,
    });
  },
});

/**
 * File upload rate limiter
 * Prevents storage abuse
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Max 20 uploads per hour
  message: {
    success: false,
    error: "Too many uploads",
    message: "Too many file uploads. Please try again later.",
    retryAfter: 3600,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "Too many uploads",
      message: "Too many file uploads from this IP. Please try again later.",
      retryAfter: 3600,
    });
  },
});
