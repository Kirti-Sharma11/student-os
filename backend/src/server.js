const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const analyticsRoutes = require("./routes/analyticsRoutes");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/analytics", analyticsRoutes);
app.get("/", (req, res) => {
  res.send("Backend running...");
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("[Error Handler]", err);

  // Handle Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large. Max size: 10MB",
    });
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({
      success: false,
      message: "Only one file can be uploaded",
    });
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message: "File field name does not match",
    });
  }

  // Handle 404
  if (err.status === 404) {
    return res.status(404).json({
      success: false,
      message: "Endpoint not found",
    });
  }

  // Generic error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? err.stack
        : undefined,
  });
});

// Handle 404 for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[Server] SIGTERM received, shutting down gracefully...");

  server.close(async () => {
    console.log("[Server] HTTP server closed");

    // Cleanup resume analysis resources
    try {
      const resumeController = require("./controllers/resumeController");
      await resumeController.cleanup();
    } catch (error) {
      console.error("[Server] Cleanup error:", error.message);
    }

    process.exit(0);
  });

  // Force exit after 30 seconds
  setTimeout(() => {
    console.error(
      "[Server] Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 30000);
});

process.on("SIGINT", async () => {
  console.log("[Server] SIGINT received, shutting down gracefully...");

  server.close(async () => {
    console.log("[Server] HTTP server closed");

    try {
      const resumeController = require("./controllers/resumeController");
      await resumeController.cleanup();
    } catch (error) {
      console.error("[Server] Cleanup error:", error.message);
    }

    process.exit(0);
  });

  // Force exit after 30 seconds
  setTimeout(() => {
    console.error(
      "[Server] Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 30000);
});

// Unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
  console.error(
    "[Server] Unhandled Rejection at:",
    promise,
    "reason:",
    reason
  );
});