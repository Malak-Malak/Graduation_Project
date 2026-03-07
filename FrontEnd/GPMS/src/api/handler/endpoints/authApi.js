import axiosInstance from "./../../axiosInstance";

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/Auth/request-access
// Body: { universityEmail }
// الهدف: يرسل طلب وصول → يظهر عند الأدمن في pending-requests
// ══════════════════════════════════════════════════════════════════════════════
export const requestAccess = (universityEmail) =>
    axiosInstance.post("/Auth/request-access", { universityEmail });

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/Auth/login
// Body: { username, password }
// ══════════════════════════════════════════════════════════════════════════════
export const loginUser = ({ username, password }) =>
    axiosInstance.post("/Auth/login", { username, password });