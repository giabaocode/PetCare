import axios from "axios";

const baseURL =
  (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("pcx_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.warn("Phiên đăng nhập hết hạn hoặc không có quyền truy cập.");

      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register")
      ) {
        localStorage.removeItem("pcx_token");
        localStorage.removeItem("pcx_profile");

        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
