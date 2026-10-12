
import { getAllowedOrigins } from "./env.js";

// Shared by Express CORS and Socket.IO CORS.
export function corsOrigin(origin, callback) {
  // Allow requests without an Origin header.
  if (!origin) {
    return callback(null, true);
  }

  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  console.error("CORS blocked origin:", origin);
  console.error("Allowed origins:", allowedOrigins);

  return callback(null, false);
}
