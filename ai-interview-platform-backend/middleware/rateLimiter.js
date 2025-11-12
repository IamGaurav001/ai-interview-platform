import redisClient from "../config/redis.js";

/**
 * Redis-based Rate Limiter Middleware
 * Prevents abuse and cost spikes by limiting API calls per user
 * 
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowSeconds - Time window in seconds
 */
export const rateLimiter = (maxRequests = 10, windowSeconds = 60) => {
  return async (req, res, next) => {
    try {
      // Skip rate limiting if user is not authenticated
      if (!req.user || !req.user._id) {
        return next();
      }

      const userId = req.user._id.toString();
      const key = `ratelimit:${userId}`;

      // Increment request count
      const requests = await redisClient.incr(key);

      // Set expiration on first request
      if (requests === 1) {
        await redisClient.expire(key, windowSeconds);
      }

      // Check if limit exceeded
      if (requests > maxRequests) {
        const ttl = await redisClient.ttl(key);
        return res.status(429).json({
          success: false,
          error: "Too many requests",
          message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowSeconds} seconds.`,
          retryAfter: ttl
        });
      }

      // Add rate limit headers
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - requests));
      res.setHeader("X-RateLimit-Reset", Date.now() + (windowSeconds * 1000));

      next();
    } catch (error) {
      console.error("❌ Rate limiter error:", error.message);
      // On Redis error, allow request (fail open)
      next();
    }
  };
};


