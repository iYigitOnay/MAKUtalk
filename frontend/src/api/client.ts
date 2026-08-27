import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorData = error.response?.data;

    const message = Array.isArray(errorData?.message)
      ? errorData.message[0]
      : errorData?.message;

    if (status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth";
      }
    } else if (
      status === 403 &&
      (message === "BANNED_USER" || errorData?.error === "BANNED_USER")
    ) {
      // YASAKLI KULLANICI YAKALANDI
      console.error(
        "⛔ YASAKLI KULLANICI TESPIT EDILDI, SISTEMDEN ATILIYOR...",
      );

      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      if (window.socket) {
        window.socket.disconnect();
      }

      // ANINDA BANNED SAYFASINA
      window.location.href = "/banned";
    }

    return Promise.reject(error);
  },
);

export default apiClient;
