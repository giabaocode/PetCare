/// <reference types="vite/client" />
import axios from "axios";
const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pcx_token");
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;
