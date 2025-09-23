// Middleware to authenticate user using JWT
const jwt = require("jsonwebtoken");

const userInAuth = (req, res, next) => {
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

    req.user = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

module.exports = userInAuth;
