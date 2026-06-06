/**
 * Rate limiting middleware to prevent API abuse
 * Uses in-memory storage (for production, use Redis)
 */

class RateLimiter {
  constructor() {
    this.requests = new Map();
    // Clean up old entries every 5 minutes
    this.cleanup();
  }

  cleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.requests.entries()) {
        // Remove entries older than 1 hour
        if (now - value.startTime > 3600000) {
          this.requests.delete(key);
        }
      }
    }, 300000); // Every 5 minutes
  }

  isRateLimited(identifier, limit = 30, windowMs = 60000) {
    const now = Date.now();

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, {
        count: 1,
        startTime: now,
      });
      return false;
    }

    const data = this.requests.get(identifier);
    const timePassed = now - data.startTime;

    if (timePassed > windowMs) {
      // Reset the window
      this.requests.set(identifier, {
        count: 1,
        startTime: now,
      });
      return false;
    }

    data.count++;

    if (data.count > limit) {
      return true; // Rate limited
    }

    return false;
  }

  getRemainingRequests(identifier, limit = 30, windowMs = 60000) {
    const now = Date.now();

    if (!this.requests.has(identifier)) {
      return limit;
    }

    const data = this.requests.get(identifier);
    const timePassed = now - data.startTime;

    if (timePassed > windowMs) {
      return limit;
    }

    return Math.max(0, limit - data.count);
  }

  getResetTime(identifier, windowMs = 60000) {
    const now = Date.now();

    if (!this.requests.has(identifier)) {
      return now + windowMs;
    }

    const data = this.requests.get(identifier);
    return data.startTime + windowMs;
  }
}

const limiter = new RateLimiter();

/**
 * Rate limit middleware factory
 * @param {number} limit - Max requests per window
 * @param {number} windowMs - Time window in milliseconds
 * @param {string} keyGenerator - Function to generate rate limit key (default: IP address)
 */
function rateLimit({
  limit = 30,
  windowMs = 60000,
  keyGenerator = (req) => req.ip || req.connection.remoteAddress,
  message = "Too many requests, please try again later.",
} = {}) {
  return (req, res, next) => {
    const key = keyGenerator(req);

    if (limiter.isRateLimited(key, limit, windowMs)) {
      const resetTime = limiter.getResetTime(key, windowMs);
      const secondsUntilReset = Math.ceil((resetTime - Date.now()) / 1000);

      return res.status(429).json({
        success: false,
        message: message,
        retryAfter: secondsUntilReset,
      });
    }

    // Add rate limit info to response headers
    res.set("X-RateLimit-Limit", String(limit));
    res.set(
      "X-RateLimit-Remaining",
      String(limiter.getRemainingRequests(key, limit, windowMs))
    );
    res.set(
      "X-RateLimit-Reset",
      String(limiter.getResetTime(key, windowMs))
    );

    next();
  };
}

module.exports = {
  rateLimit,
  limiter,
};
