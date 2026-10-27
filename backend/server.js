require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { rateLimit } = require("express-rate-limit");

const db = require("./src/config/database");
const authRoutes = require("./src/routes/authRoutes");

const app = express();

const PORT = Number(process.env.PORT || 5000);
const CLIENT_URL = process.env.CLIENT_URL;

// Validate required environment variables
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error(
    "JWT_SECRET must contain at least 32 characters. Configure it in backend/.env."
  );
}

if (!CLIENT_URL) {
  throw new Error("CLIENT_URL is missing from backend/.env.");
}

console.log("Starting Smart POS backend...");

// Security headers
app.use(helmet());

// Frontend-to-backend communication
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// Parse JSON request bodies and cookies
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Rate limiter for login requests
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again later.",
  },
});

// Rate limiter for password-reset requests
const resetRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many password-reset requests. Please try again later.",
  },
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");

    return res.status(200).json({
      status: "OK",
      message: "Smart POS backend is running.",
      database: "connected",
    });
  } catch (error) {
    console.error("Health check database error:", error.message);

    return res.status(503).json({
      status: "ERROR",
      message: "The database connection failed.",
      database: "disconnected",
    });
  }
});

// Apply rate limits to authentication endpoints
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/forgot-password", resetRequestLimiter);

// Authentication routes
app.use("/api/auth", authRoutes);

// Handle unknown endpoints
app.use((req, res) => {
  res.status(404).json({
    message: "API endpoint not found.",
  });
});

// Central error handler
app.use((error, req, res, next) => {
  console.error("Backend error:", error.stack || error.message);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    message: "An unexpected server error occurred.",
  });
});

// Start the backend after checking MySQL
async function startServer() {
  try {
    console.log("Checking MySQL connection...");

    await db.query("SELECT 1");

    console.log("MySQL connection successful.");

    const server = app.listen(PORT, () => {
      console.log(
        `Smart POS backend running on http://localhost:${PORT}`
      );
      console.log(`Frontend URL: ${CLIENT_URL}`);
      console.log("Backend startup completed successfully.");
    });

    server.on("error", (error) => {
      console.error("HTTP server error:", error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start Smart POS backend.");
    console.error("Error:", error.message);

    process.exit(1);
  }
}

startServer();