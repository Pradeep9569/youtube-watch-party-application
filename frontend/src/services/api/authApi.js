import api from "../api";

// Thin wrappers so no component ever builds an auth URL by hand.
// Resulting URLs: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
export const registerRequest = (data) => api.post("/auth/register", data);
export const loginRequest = (data) => api.post("/auth/login", data);
export const meRequest = () => api.get("/auth/me");
