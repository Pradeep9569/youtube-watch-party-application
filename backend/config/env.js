// Central place for environment configuration.
// Variable names: PORT, MONGO_URI, JWT_SECRET, CLIENT_URL (comma-separated list allowed).
// CLINT_URI (old typo) is still read as a fallback so existing Render configs keep working.

const clientUrlRaw =
  process.env.CLIENT_URL || process.env.CLINT_URI || "";

const DEFAULT_DEV_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];

export function getAllowedOrigins() {
  const fromEnv = clientUrlRaw
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  return [...new Set([...fromEnv, ...DEFAULT_DEV_ORIGINS])];
}

export function assertRequiredEnv() {
  const missing = ["MONGO_URI", "JWT_SECRET"].filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
