// ─────────────────────────────────────────────────────────────────────────────
// studentApi.js
// Handles all Student + UserProfile API calls.
// Backend base: /api/Student  and  /api/UserProfile
// ─────────────────────────────────────────────────────────────────────────────

import axiosInstance from "./../../axiosInstance";

const studentApi = {

    // ── Team Queries ──────────────────────────────────────────────────────────

    /** GET /api/Student/my-team — بيجيب فريق الطالب الحالي */
    getMyTeam: () =>
        axiosInstance.get("/Student/my-team").then((r) => r.data),

    /** GET /api/Student/supervisors — قائمة المشرفين المتاحين */
    getSupervisors: () =>
        axiosInstance.get("/Student/supervisors").then((r) => r.data),

    /** GET /api/Student/available-students — الطلاب اللي ما عندهم فريق بعد */
    getAvailableStudents: () =>
        axiosInstance.get("/Student/available-students").then((r) => r.data),

    /** GET /api/Student/available-teams — الفرق اللي تقبل أعضاء جدد */
    getAvailableTeams: () =>
        axiosInstance.get("/Student/available-teams").then((r) => r.data),

    /** GET /api/Student/my-invitations — دعوات الانضمام الواردة على الطالب */
    getMyInvitations: () =>
        axiosInstance.get("/Student/my-invitations").then((r) => r.data),

    // ── Team Actions ──────────────────────────────────────────────────────────

    /**
     * POST /api/Student/create-team
     * body: { projectTitle, supervisorId, studentIds[] }
     * studentIds = [] لو الطالب بدو يبدأ لحاله
     */
    createTeam: (body) =>
        axiosInstance.post("/Student/create-team", {
            projectTitle: body.projectTitle,
            supervisorId: body.supervisorId,
            studentIds: body.studentIds ?? [],
        }).then((r) => r.data),

    /**
     * POST /api/Student/send-invitation
     * body: { studentId }  — قائد الفريق يدعو طالب
     */
    sendInvitation: (studentId) =>
        axiosInstance.post("/Student/send-invitation", { studentId }).then((r) => r.data),

    /**
     * POST /api/Student/request-to-join
     * body: { teamId }  — الطالب يطلب الانضمام لفريق
     */
    requestToJoin: (teamId) =>
        axiosInstance.post("/Student/request-to-join", { teamId }).then((r) => r.data),

    /**
     * POST /api/Student/respond-to-invitation
     * body: { joinRequestId, isAccepted }  — الطالب يرد على دعوة وصلته
     */
    respondToInvitation: (joinRequestId, isAccepted) =>
        axiosInstance.post("/Student/respond-to-invitation", { joinRequestId, isAccepted }).then((r) => r.data),

    /**
     * POST /api/Student/respond-to-join-request
     * body: { joinRequestId, isAccepted }  — قائد الفريق يرد على طلب انضمام
     */
    respondToJoinRequest: (joinRequestId, isAccepted) =>
        axiosInstance.post("/Student/respond-to-join-request", { joinRequestId, isAccepted }).then((r) => r.data),

    /** POST /api/Student/request-leave — الطالب يطلب مغادرة فريقه */
    requestLeave: () =>
        axiosInstance.post("/Student/request-leave").then((r) => r.data),

    // ── User Profile ──────────────────────────────────────────────────────────

    /** GET /api/UserProfile — بيجيب بروفايل الطالب الحالي */
    getProfile: () =>
        axiosInstance.get("/UserProfile").then((r) => r.data),

    /**
     * POST /api/UserProfile — إنشاء البروفايل لأول مرة (ProfileSetupModal)
     * body: { phoneNumber, fullName, department, gitHubLink, linkedinLink, field, personalEmail }
     */
    createProfile: (data) =>
        axiosInstance.post("/UserProfile", {
            phoneNumber: data.phoneNumber ?? "",
            fullName: data.fullName ?? "",
            department: data.department ?? "",
            gitHubLink: data.github ?? data.gitHubLink ?? "",
            linkedinLink: data.linkedin ?? data.linkedinLink ?? "",
            field: data.field ?? "",
            personalEmail: data.email ?? data.personalEmail ?? "",
        }).then((r) => r.data),

    /**
     * PUT /api/UserProfile — تعديل البروفايل (EditProfileModal)
     * body: { phoneNumber, fullName, department, gitHubLink, linkedinLink,
     *         field, totalNumOfCreditCards, personalEmail }
     * ملاحظة: totalNumOfCreditCards موجود في الـ schema لكن مش مستخدم عندنا → نبعته 0
     */
    updateProfile: (data) =>
        axiosInstance.put("/UserProfile", {
            phoneNumber: data.phoneNumber ?? "",
            fullName: data.fullName ?? "",
            department: data.department ?? "",
            gitHubLink: data.github ?? data.gitHubLink ?? "",
            linkedinLink: data.linkedin ?? data.linkedinLink ?? "",
            field: data.field ?? "",
            totalNumOfCreditCards: 0,                          // مش مستخدم في الـ UI
            personalEmail: data.email ?? data.personalEmail ?? "",
        }).then((r) => r.data),

};

export default studentApi;