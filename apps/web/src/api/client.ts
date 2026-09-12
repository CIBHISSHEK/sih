import axios from "axios";

// In production the API serves this frontend from the same origin, so
// VITE_API_URL is left blank and every call is relative ("/api/..."). For
// local dev it points at the standalone API on :4000.
export const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:4000" : "");

export const api = axios.create({ baseURL: `${API_URL}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
