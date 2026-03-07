import axios from "axios";

const axiosInstance = axios.create({
    // ✅ في dev: الـ Vite proxy بيحول /api → https://gpms.up.railway.app/api
    // ✅ في production: غيري هذا لـ https://gpms.up.railway.app/api
    baseURL: "/api",

    headers: {
        "Content-Type": "application/json",
    },
});

// ── Request: أضف token لكل request ─────────────────────────────────────────
axiosInstance.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("gpms_token");  // ✅ نفس الـ key في AuthContext
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response: لو 401 اطرد للـ login ─────────────────────────────────────────
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            sessionStorage.removeItem("gpms_token");
            sessionStorage.removeItem("gpms_user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;