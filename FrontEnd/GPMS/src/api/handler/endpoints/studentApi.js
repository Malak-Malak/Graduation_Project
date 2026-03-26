// ─────────────────────────────────────────────────────────────────────────────
// studentApi.js
// Backend keys:
//   fullName, phoneNumber, department, field (نفس department),
//   gitHubLink, linkedinLink, personalEmail
// ملاحظة: skills مش موجودة في الـ backend — بس محتفظين بيها في الـ UI فقط
// ─────────────────────────────────────────────────────────────────────────────

// import axiosInstance from "./../../axiosInstance";

// const studentApi = {

//     // ── Team Queries ──────────────────────────────────────────────────────────

//     getMyTeam: () =>
//         axiosInstance.get("/Student/my-team").then((r) => r.data),

//     getSupervisors: () =>
//         axiosInstance.get("/Student/supervisors").then((r) => r.data),

//     getAvailableStudents: () =>
//         axiosInstance.get("/Student/available-students").then((r) => r.data),

//     getAvailableTeams: () =>
//         axiosInstance.get("/Student/available-teams").then((r) => r.data),

//     getMyInvitations: () =>
//         axiosInstance.get("/Student/my-invitations").then((r) => r.data),

//     // ── Team Actions ──────────────────────────────────────────────────────────

//     createTeam: (body) =>
//         axiosInstance.post("/Student/create-team", {
//             projectTitle: body.projectTitle,
//             supervisorId: body.supervisorId,
//             studentIds: body.studentIds ?? [],
//         }).then((r) => r.data),

//     sendInvitation: (studentId) =>
//         axiosInstance.post("/Student/send-invitation", { studentId }).then((r) => r.data),

//     requestToJoin: (teamId) =>
//         axiosInstance.post("/Student/request-to-join", { teamId }).then((r) => r.data),

//     respondToInvitation: (joinRequestId, isAccepted) =>
//         axiosInstance.post("/Student/respond-to-invitation", { joinRequestId, isAccepted }).then((r) => r.data),

//     respondToJoinRequest: (joinRequestId, isAccepted) =>
//         axiosInstance.post("/Student/respond-to-join-request", { joinRequestId, isAccepted }).then((r) => r.data),

//     requestLeave: () =>
//         axiosInstance.post("/Student/request-leave").then((r) => r.data),

//     // ── User Profile ──────────────────────────────────────────────────────────

//     /** GET /api/UserProfile */
//     getProfile: () =>
//         axiosInstance.get("/UserProfile").then((r) => r.data),

//     /**
//      * POST /api/UserProfile — إنشاء البروفايل لأول مرة
//      * department و field نفس القيمة (اسم التخصص)
//      */
//     createProfile: (data) =>
//         axiosInstance.post("/UserProfile", {
//             phoneNumber: data.phoneNumber ?? "",
//             fullName: data.fullName ?? "",
//             department: data.Department ?? "",   // اسم التخصص
//             field: data.field ?? "",   // نفس التخصص
//             gitHubLink: data.github ?? "",
//             linkedinLink: data.linkedin ?? "",
//             personalEmail: data.email ?? "",
//         }).then((r) => r.data),

//     /**
//      * PUT /api/UserProfile — تعديل البروفايل
//      */
//     updateProfile: (data) =>
//         axiosInstance.put("/UserProfile", {
//             phoneNumber: data.phoneNumber ?? "",
//             fullName: data.fullName ?? "",
//             department: data.Department ?? "",   // اسم التخصص
//             field: data.field ?? "",   // نفس التخصص
//             gitHubLink: data.github ?? "",
//             linkedinLink: data.linkedin ?? "",
//             personalEmail: data.email ?? "",
//             totalNumOfCreditCards: 0,
//         }).then((r) => r.data),
// };

// export default studentApi;
// ─────────────────────────────────────────────────────────────────────────────
// studentApi.js
// Backend keys:
//   fullName, phoneNumber, department, field, gitHubLink, linkedinLink, personalEmail
//
// التعيين:
//   department  →  التخصص الأكاديمي (Computer Science, Software Engineering…)
//   field       →  الـ skills مجمّعة بـ comma  e.g. "Frontend,Backend,AI / ML"
// ─────────────────────────────────────────────────────────────────────────────

import axiosInstance from "./../../axiosInstance";

const studentApi = {

    // ── Team Queries ──────────────────────────────────────────────────────────

    getMyTeam: () =>
        axiosInstance.get("/Student/my-team").then((r) => r.data),

    getSupervisors: () =>
        axiosInstance.get("/Student/supervisors").then((r) => r.data),

    getAvailableStudents: () =>
        axiosInstance.get("/Student/available-students").then((r) => r.data),

    getAvailableTeams: () =>
        axiosInstance.get("/Student/available-teams").then((r) => r.data),

    getMyInvitations: () =>
        axiosInstance.get("/Student/my-invitations").then((r) => r.data),

    // ── Team Actions ──────────────────────────────────────────────────────────

    createTeam: (body) =>
        axiosInstance.post("/Student/create-team", {
            projectTitle: body.projectTitle,
            supervisorId: body.supervisorId,
            studentIds: body.studentIds ?? [],
        }).then((r) => r.data),

    sendInvitation: (studentId) =>
        axiosInstance.post("/Student/send-invitation", { studentId }).then((r) => r.data),

    requestToJoin: (teamId) =>
        axiosInstance.post("/Student/request-to-join", { teamId }).then((r) => r.data),

    respondToInvitation: (joinRequestId, isAccepted) =>
        axiosInstance.post("/Student/respond-to-invitation", { joinRequestId, isAccepted }).then((r) => r.data),

    respondToJoinRequest: (joinRequestId, isAccepted) =>
        axiosInstance.post("/Student/respond-to-join-request", { joinRequestId, isAccepted }).then((r) => r.data),

    requestLeave: () =>
        axiosInstance.post("/Student/request-leave").then((r) => r.data),

    // ── User Profile ──────────────────────────────────────────────────────────

    /** GET /api/UserProfile */
    getProfile: () =>
        axiosInstance.get("/UserProfile").then((r) => r.data),

    /**
     * POST /api/UserProfile — إنشاء البروفايل لأول مرة
     *
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
            field: (data.skills ?? []).join(","),   // skills[] → "Frontend,Backend,…"
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
            field: (data.skills ?? []).join(","),  // skills[] → "Frontend,Backend,…"
            totalNumOfCreditCards: 0,
            personalEmail: data.email ?? "",
            bio: data.bio ?? "",
        }).then((r) => r.data),
};

export default studentApi;