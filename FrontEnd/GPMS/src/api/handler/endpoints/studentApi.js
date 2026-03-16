import axiosInstance from "../axiosInstance";

const studentApi = {

    // ── جيب فريقي الحالي
    getMyTeam: () =>
        axiosInstance.get("/Student/my-team").then((r) => r.data),

    // ── جيب المشرفين المتاحين
    getSupervisors: () =>
        axiosInstance.get("/Student/supervisors").then((r) => r.data),

    // ── جيب الطلاب المتاحين
    getAvailableStudents: () =>
        axiosInstance.get("/Student/available-students").then((r) => r.data),

    // ── جيب الفرق المتاحة للانضمام
    getAvailableTeams: () =>
        axiosInstance.get("/Student/available-teams").then((r) => r.data),

    // ── جيب دعواتي
    getMyInvitations: () =>
        axiosInstance.get("/Student/my-invitations").then((r) => r.data),

    // ── أنشئ فريق
    createTeam: (body) =>
        axiosInstance.post("/Student/create-team", body).then((r) => r.data),

    // ── أرسل دعوة لطالب
    sendInvitation: (studentId) =>
        axiosInstance.post("/Student/send-invitation", { studentId }).then((r) => r.data),

    // ── طلب انضمام لفريق
    requestToJoin: (teamId) =>
        axiosInstance.post("/Student/request-to-join", { teamId }).then((r) => r.data),

    // ── رد على دعوة وصلتك
    respondToInvitation: (joinRequestId, isAccepted) =>
        axiosInstance.post("/Student/respond-to-invitation", { joinRequestId, isAccepted }).then((r) => r.data),

    // ── رد على طلب انضمام (أنت قائد الفريق)
    respondToJoinRequest: (joinRequestId, isAccepted) =>
        axiosInstance.post("/Student/respond-to-join-request", { joinRequestId, isAccepted }).then((r) => r.data),

    // ── طلب مغادرة الفريق
    requestLeave: () =>
        axiosInstance.post("/Student/request-leave").then((r) => r.data),

};

export default studentApi;