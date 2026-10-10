import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/room.routes.js";
import { corsOrigin } from "./config/cors.js";

const app = express();

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "100kb" }));

// Health checks (Render pings these)
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "YouTube Watch Party Backend is running",
  });
});
app.get("/health", (req, res) => res.status(200).json({ success: true }));

// API routes. Final URLs:
//   POST /api/auth/register   POST /api/auth/login   GET /api/auth/me
//   POST /api/rooms/create    POST /api/rooms/join
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

// 404 for anything else
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central error handler (e.g. malformed JSON body -> 400 instead of an HTML stack trace)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON body" });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Server Error" });
});

export default app;
