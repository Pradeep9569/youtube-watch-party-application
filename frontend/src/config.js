// Single source of truth for backend URLs.
// VITE_API_URL = backend ORIGIN only (no /api, no /auth, no trailing slash), e.g.
//   https://youtube-watch-party-system-1-y992.onrender.com
// VITE_API (the old variable name) is still honoured as a fallback.
const raw =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API ||
  (import.meta.env.DEV ? "https://youtube-watch-party-application.onrender.com" : "");

export const API_ORIGIN = raw.replace(/\/+$/, "").replace(/\/api(\/auth)?$/, "");

if (!API_ORIGIN && !import.meta.env.DEV) {
  console.error("VITE_API_URL is not set: API and socket calls will fail.");
}

// All REST calls go through this base. Paths below it are written WITHOUT "/api":
//   api.post("/auth/login"), api.post("/rooms/create")
export const API_BASE_URL = `${API_ORIGIN}/api`;
