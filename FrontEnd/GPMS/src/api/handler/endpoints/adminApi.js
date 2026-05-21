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

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/Admin/university-records
// كل السجلات الجامعية
// ══════════════════════════════════════════════════════════════════════════════
export const getUniversityRecords = () =>
    axiosInstance.get("/Admin/university-records");

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/Admin/university-records/{email}
// سجل شخص معين بالإيميل
// ══════════════════════════════════════════════════════════════════════════════
export const getUniversityRecordByEmail = (email) =>
    axiosInstance.get(`/Admin/university-records/${encodeURIComponent(email)}`);

// ══════════════════════════════════════════════════════════════════════════════
// DELETE /api/Admin/delete-university-record/{email}
// ══════════════════════════════════════════════════════════════════════════════
export const deleteUniversityRecord = (email) =>
    axiosInstance.delete(`/Admin/delete-university-record/${encodeURIComponent(email)}`);

// ══════════════════════════════════════════════════════════════════════════════
// DELETE /api/Admin/delete-request/{id}
// ══════════════════════════════════════════════════════════════════════════════
export const deleteRequest = (id) =>
    axiosInstance.delete(`/Admin/delete-request/${id}`);

// ══════════════════════════════════════════════════════════════════════════════
// HEAD OF DEPARTMENT — Admin Only
// ══════════════════════════════════════════════════════════════════════════════

// PUT /api/Admin/set-head-of-department/{supervisorId}
// يعين مشرف كرئيس قسم — بدون body
// إذا القسم ما فيه رئيس → 200 مباشرة
// إذا القسم فيه رئيس ثاني → 409/400 مع رسالة خطأ → استخدم replaceHeadOfDepartment
export const setHeadOfDepartment = (supervisorId) =>
    axiosInstance.put(`/Admin/set-head-of-department/${supervisorId}`);

// PUT /api/Admin/replace-head-of-department/{supervisorId}
// يستبدل رئيس القسم الحالي بالمشرف الجديد — بدون body
// استدعيها بعد ما الأدمن يأكد الـ warning popup
export const replaceHeadOfDepartment = (supervisorId) =>
    axiosInstance.put(`/Admin/replace-head-of-department/${supervisorId}`);

// DELETE /api/Admin/remove-head-of-department/{supervisorId}
// يشيل صلاحية رئيس القسم من المشرف بدون تعيين بديل
export const removeHeadOfDepartment = (supervisorId) =>
    axiosInstance.delete(`/Admin/remove-head-of-department/${supervisorId}`);