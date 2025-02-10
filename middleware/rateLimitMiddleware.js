const rateLimit = require("express-rate-limit");

// Limit requests to 5 per minute for login/register
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { message: "Too many requests, please try again later." },
  headers: true, // Send rate limit info in response headers
});

// Limit general API requests to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: "Too many requests, please slow down." },
  headers: true,
});

module.exports = { authLimiter, apiLimiter };
