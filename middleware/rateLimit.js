// Middleware to limit repeated login attempts
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    status: 429,
    data: {
      data: null,
      message: "Too many login attempts. Please try again later.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = loginLimiter;
