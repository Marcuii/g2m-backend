// Whitelist allowed headers
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["*"];

const whiteListOrigins = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
  } else {
    return res.status(403).json({
      status: 403,
      data: {
        data: null,
        message: `This origin not allowed`,
      },
    });
  }
};

module.exports = whiteListOrigins;