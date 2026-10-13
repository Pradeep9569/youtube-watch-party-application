
const clientUrlRaw =
  process.env.CLIENT_URL || process.env.CLINT_URI || "";

const DEFAULT_ORIGINS = [
  "https://youtube-watch-party-application.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

export function getAllowedOrigins() {
  const fromEnv = clientUrlRaw
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  return [...new Set([...fromEnv, ...DEFAULT_ORIGINS])];
}

export function assertRequiredEnv() {
  const missing = ["MONGO_URI", "JWT_SECRET"].filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}
