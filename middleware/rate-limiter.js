const rateLimit = require('express-rate-limit');

// 88. Configure Global Rate Limiting Guards
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute timeframe window
  max: 100, // Limit each unique IP to 100 network requests per window
  message: {
    success: false,
    message: "Too many requests originating from this IP address profile. Access locked for 15 minutes."
  },
  standardHeaders: true, // Return standard rate limit info headers
  legacyHeaders: false, // Disable X-RateLimit-* legacy headers
});

module.exports = { globalRateLimiter };