// Middleware to authenticate admin using JWT
const jwt = require("jsonwebtoken");

const adminInAuth = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token)
    return res.status(404).json({
      status: 404,
      data: {
        data: null,
        message: "No token provided",
      },
    });

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err)
      return res.status(406).json({
        status: 406,
        data: {
          data: null,
          message: "Expired token",
        },
      });

    // Check if user is admin
    if (!decoded.role || decoded.role !== "admin") {
      return res.status(403).json({
        status: 403,
        data: {
          data: null,
          message: "Forbidden",
        },
      });
    }

    req.user = decoded.id;
    next();
  });
};

module.exports = adminInAuth;
