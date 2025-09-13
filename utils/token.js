const jwt = require("jsonwebtoken");

// Utility functions to generate JWT access and refresh tokens
// Access tokens have a short lifespan, while refresh tokens last longer
const generateAccessToken = (userId, userRole) => {
  return jwt.sign({ id: userId, role: userRole }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "1h", // short life
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "15d", // long life
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};