
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/room.routes.js";
import { corsOrigin } from "./config/cors.js";

const app = express();

// CORS configuration
const corsOptions = {
  origin: corsOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// CORS middleware must run before API routes
app.use(cors(corsOptions));

// Handle preflight requests
app.options(/.*/, cors(corsOptions));

// Parse JSON request bodies
app.use(express.json({ limit: "100kb" }));

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "YouTube Watch Party Backend is running",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Room routes
app.use("/api/rooms", roomRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central error handler
app.use((err, req, res, next) => {
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON body",
    });
  }

  console.error("Unhandled error:", err);

  return res.status(500).json({
    success: false,
    message: "Server Error",
  });
});

export default app;
