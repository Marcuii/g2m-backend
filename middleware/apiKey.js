// API Key middleware
const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey && apiKey === process.env.API_KEY) {
    next();
  } else {
    return res.status(403).json({
      status: 403,
      data: {
        data: null,
        message: "Invalid API Key",
      },
    });
  }
};

module.exports = apiKeyMiddleware;
