import axios from "axios";
import { API_BASE_URL } from "../config";

// The ONLY axios instance in the app.
// baseURL ends in /api, so request paths look like "/auth/login" or "/rooms/create".
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 60000, // Render free instances can take ~50s to wake up
});

// Auth is token-based (JWT in localStorage + Authorization header) — unchanged design.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
