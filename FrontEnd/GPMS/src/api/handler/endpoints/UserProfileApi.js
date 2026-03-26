import axiosInstance from "./../../axiosInstance";

const UserProfileApi = {

    /** GET /api/UserProfile — بروفايل المستخدم الحالي */
    getProfile: () =>
        axiosInstance.get("/UserProfile").then((r) => r.data),

    /**
     * GET /api/UserProfile/{userId} — بروفايل طالب معين
     * بنستخدمه في TeamFinder لعرض بروفايل الطالب الكامل
     */
    getProfileById: (userId) =>
        axiosInstance.get(`/UserProfile/${userId}`).then((r) => r.data),

    /**
     * POST /api/UserProfile — إنشاء البروفايل لأول مرة
     * data.department  →  التخصص الأكاديمي  (string)
     * data.skills      →  مصفوفة الـ skills  → بنحوّلها لـ string مفصول بـ comma → field
     */
    createProfile: (data) =>
        axiosInstance.post("/UserProfile", {
            phoneNumber: data.phoneNumber ?? "",
            fullName: data.fullName ?? "",
            department: data.department ?? "",
            gitHubLink: data.github ?? "",
            linkedinLink: data.linkedin ?? "",
            field: (data.skills ?? []).join(","),
            personalEmail: data.email ?? "",
            bio: data.bio ?? "",
        }).then((r) => r.data),

    /**
     * PUT /api/UserProfile — تعديل البروفايل
     */
    updateProfile: (data) =>
        axiosInstance.put("/UserProfile", {
            phoneNumber: data.phoneNumber ?? "",
            fullName: data.fullName ?? "",
            department: data.department ?? "",
            gitHubLink: data.github ?? "",
            linkedinLink: data.linkedin ?? "",
            field: (data.skills ?? []).join(","),
            totalNumOfCreditCards: 0,
            personalEmail: data.email ?? "",
            bio: data.bio ?? "",
        }).then((r) => r.data),
};

export default UserProfileApi;