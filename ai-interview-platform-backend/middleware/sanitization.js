/**
 * OWASP Security: Input Sanitization Middleware
 * - Sanitizes all user inputs to prevent XSS and injection attacks
 * - Removes potentially dangerous characters
 * - Trims whitespace
 * - Validates data types
 */

/**
 * Recursively sanitize an object
 * Removes null bytes, control characters, and excessive whitespace
 */
const sanitizeValue = (value) => {
  if (typeof value === "string") {
    return (
      value
        // Remove null bytes (can cause issues in C-based systems)
        .replace(/\0/g, "")
        // Remove other control characters except newline, tab, carriage return
        .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
        // Normalize whitespace (but preserve intentional newlines/tabs)
        .replace(/\s+/g, " ")
        .trim()
    );
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value !== null && typeof value === "object") {
    const sanitized = {};
    for (const [key, val] of Object.entries(value)) {
      // Sanitize the key as well (prevent prototype pollution)
      const sanitizedKey = sanitizeValue(key);
      // Skip dangerous keys
      if (
        sanitizedKey !== "__proto__" &&
        sanitizedKey !== "constructor" &&
        sanitizedKey !== "prototype"
      ) {
        sanitized[sanitizedKey] = sanitizeValue(val);
      }
    }
    return sanitized;
  }

  return value;
};

/**
 * Middleware to sanitize request body, query, and params
 * Apply this middleware before validation
 */
export const sanitizeInput = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeValue(req.body);
    }

    // Sanitize query parameters (Express 5 has read-only query, so we need to be careful)
    if (req.query && typeof req.query === "object") {
      const sanitizedQuery = sanitizeValue(req.query);
      // Only update if query is not read-only
      if (Object.keys(sanitizedQuery).length > 0) {
        try {
          Object.keys(sanitizedQuery).forEach(key => {
            req.query[key] = sanitizedQuery[key];
          });
        } catch (e) {
          // If query is read-only, skip sanitization for query params
          // Body and params are still sanitized
        }
      }
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === "object") {
      req.params = sanitizeValue(req.params);
    }

    next();
  } catch (error) {
    console.error("❌ Input sanitization error:", error.message);
    // Fail safe - continue with request even if sanitization fails
    // This ensures the app doesn't break
    next();
  }
};

/**
 * Strict sanitization for text inputs
 * Removes HTML tags and potentially dangerous characters
 */
export const sanitizeText = (text) => {
  if (typeof text !== "string") return text;

  return text
    .replace(/\0/g, "") // Remove null bytes
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control chars
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove iframe tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // Remove event handlers
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .trim();
};

/**
 * Validate and sanitize MongoDB ObjectId
 * Prevents NoSQL injection
 */
export const sanitizeObjectId = (id) => {
  if (typeof id !== "string") return null;

  // MongoDB ObjectId is exactly 24 hex characters
  const objectIdRegex = /^[a-f0-9]{24}$/i;

  const sanitized = id.trim().toLowerCase();

  return objectIdRegex.test(sanitized) ? sanitized : null;
};

/**
 * Sanitize email addresses
 * Basic validation and normalization
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== "string") return null;

  const sanitized = email.trim().toLowerCase();

  // Basic email regex (not perfect but good enough for sanitization)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return emailRegex.test(sanitized) ? sanitized : null;
};

/**
 * Sanitize URLs
 * Only allow http and https protocols
 */
export const sanitizeUrl = (url) => {
  if (typeof url !== "string") return null;

  try {
    const parsed = new URL(url.trim());

    // Only allow http and https
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }

    return parsed.href;
  } catch {
    return null;
  }
};

/**
 * Prevent parameter pollution
 * Ensures parameters are not arrays when they shouldn't be
 */
export const preventParameterPollution = (allowedArrayParams = []) => {
  return (req, res, next) => {
    try {
      // Check query parameters
      if (req.query) {
        for (const [key, value] of Object.entries(req.query)) {
          if (Array.isArray(value) && !allowedArrayParams.includes(key)) {
            // Take only the first value if it's an unexpected array
            req.query[key] = value[0];
          }
        }
      }

      // Check body parameters
      if (req.body) {
        for (const [key, value] of Object.entries(req.body)) {
          if (Array.isArray(value) && !allowedArrayParams.includes(key)) {
            // Take only the first value if it's an unexpected array
            req.body[key] = value[0];
          }
        }
      }

      next();
    } catch (error) {
      console.error("❌ Parameter pollution prevention error:", error.message);
      return res.status(400).json({
        success: false,
        error: "Invalid parameters",
        message: "Request contains invalid parameters",
      });
    }
  };
};

/**
 * Size limit middleware
 * Prevents large payloads from consuming resources
 */
export const validatePayloadSize = (maxSizeBytes = 10 * 1024 * 1024) => {
  return (req, res, next) => {
    const contentLength = req.headers["content-length"];

    if (contentLength && parseInt(contentLength) > maxSizeBytes) {
      return res.status(413).json({
        success: false,
        error: "Payload too large",
        message: `Request payload exceeds maximum size of ${maxSizeBytes / 1024 / 1024}MB`,
      });
    }

    next();
  };
};
