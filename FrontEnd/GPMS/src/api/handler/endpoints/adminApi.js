import axiosInstance from "./../../axiosInstance";

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/Admin/pending-requests
// يجيب كل الطلبات اللي بانتظار الموافقة
// ══════════════════════════════════════════════════════════════════════════════
export const getPendingRequests = () =>
    axiosInstance.get("/Admin/pending-requests");

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/Admin/review-request
// Body: { requestId: number, isApproved: boolean }
// ══════════════════════════════════════════════════════════════════════════════
export const reviewRequest = (requestId, isApproved) =>
    axiosInstance.post("/Admin/review-request", { requestId, isApproved });

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/Admin/add-university-record
// Body: { universityEmail, username, password, fullName, role, department, isGraduate }
// ══════════════════════════════════════════════════════════════════════════════
export const addUniversityRecord = (data) =>
    axiosInstance.post("/Admin/add-university-record", data);

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/Admin/users
// يجيب كل المستخدمين
// ══════════════════════════════════════════════════════════════════════════════
export const getAllUsers = () =>
    axiosInstance.get("/Admin/users");

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/Admin/all-requests
// يجيب كل الطلبات (مقبولة + مرفوضة + pending)
// ══════════════════════════════════════════════════════════════════════════════
export const getAllRequests = () =>
    axiosInstance.get("/Admin/all-requests");