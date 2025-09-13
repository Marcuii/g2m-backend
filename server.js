// Server setup with routes and middleware
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const whiteListOrigins = require("./middleware/whiteListOrigins");
const apiKeyMiddleware = require("./middleware/apiKey");
require("./utils/cleanPendingEmails");
require("dotenv").config();

const app = express();

connectDB();

app.use(helmet());
// CORS: allow specific origin if provided, else default allow all
if (process.env.NODE_ENV === "production") {
  const corsOrigin = process.env.CORS_ORIGIN;
  app.use(
    cors(
      corsOrigin
        ? { origin: corsOrigin.split(","), credentials: true }
        : { origin: true, credentials: true }
    )
  );
} else {
  app.use(cors({ origin: true, credentials: true }));
}
app.use(express.json());
app.use(cookieParser());

// Custom Middleware - stop if in development mode
if (process.env.NODE_ENV === "production") {
  app.use(whiteListOrigins);
  app.use(apiKeyMiddleware);
}

// API Docs (Swagger UI)
try {
  const openapi = YAML.load(`${__dirname}/docs/openapi.yaml`);
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapi));
} catch (e) {
  console.warn("Swagger docs not loaded:", e.message);
}

const adminInRouter = require("./routes/adminIn");
app.use("/api/admin", adminInRouter);

const userAuthRouter = require("./routes/userAuth");
app.use("/api/auth", userAuthRouter);

const userInRouter = require("./routes/userIn");
app.use("/api/user", userInRouter);

const productRouter = require("./routes/product");
app.use("/api/products", productRouter);

const orderRouter = require("./routes/orders");
app.use("/api/orders", orderRouter);

const reviewRouter = require("./routes/reviews");
app.use("/api/reviews", reviewRouter);

app.get("/api", async (req, res) => {
  try {
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    const dbState = states[mongoose.connection.readyState] || "unknown";

    res.status(200).json({
      status: 200,
      data: {
        status: "ok",
        message: "API is running",
        uptime: process.uptime(),
        database: dbState,
        timestamp: Date.now(),
      },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({
    status: 404,
    data: {
      data: null,
      message: "Invalid Route",
    },
  });
});

// For development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// For hosting
module.exports = app;
