import { getAllowedOrigins } from "./env.js";

// Shared by Express CORS and Socket.IO CORS so they can never drift apart.
export function corsOrigin(origin, callback) {
  // Requests with no Origin header (curl, health checks, server-to-server) are allowed.
  if (!origin) return callback(null, true);
  if (getAllowedOrigins().includes(origin)) return callback(null, true);
  return callback(null, false);
}
