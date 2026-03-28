// src/api/handler/endpoints/studentApi.js
//
// Backend keys:
//   fullName, phoneNumber, department, field, gitHubLink, linkedinLink, personalEmail
//
// Mapping:
//   department  →  academic major (Computer Science, Software Engineering…)
//   field       →  skills joined by comma  e.g. "Frontend,Backend,AI / ML"

import axiosInstance from "./../../axiosInstance";

const studentApi = {

    // ── Team Queries ──────────────────────────────────────────────────────────

    /**
     * GET /api/Student/my-team
     * Expected response shape:
     * {
     *   teamId, teamName?, projectTitle, projectDescription?,
     *   status, members: [{ userId, fullName, email, isLeader }],
     *   supervisor: { userId, fullName, department }
     * }
     */
    getMyTeam: () =>
        axiosInstance.get("/Student/my-team").then((r) => r.data),

    /**
     * GET /api/Student/supervisors
     * Expected response shape:
     * [{ userId, fullName, department, maxTeams, currentTeams }]
     */
    getSupervisors: () =>
        axiosInstance.get("/Student/supervisors").then((r) => r.data),

    /**
     * GET /api/Student/available-students
     * Expected response shape:
     * [{ userId, fullName, email, department }]
     */
    getAvailableStudents: () =>
        axiosInstance.get("/Student/available-students").then((r) => r.data),

    /**
     * GET /api/Student/available-teams
     * Expected response shape:
     * [{ teamId, projectTitle, projectDescription?, membersCount, maxMembers,
     *    supervisor: { fullName } }]
     */
    getAvailableTeams: () =>
        axiosInstance.get("/Student/available-teams").then((r) => r.data),

    /**
     * GET /api/Student/my-invitations
     * Expected response shape:
     * [{
     *   id, joinRequestId?,
     *   teamName, projectTitle, projectDescription?,
     *   sender: { userId, fullName, email },
     *   status: "Pending" | "Accepted" | "Rejected",
     *   sentAt
     * }]
     */
    getMyInvitations: () =>
        axiosInstance.get("/Student/my-invitations").then((r) => r.data),

    // ── Team Actions ──────────────────────────────────────────────────────────

    /**
     * POST /api/Student/create-team
     * @param {{ projectTitle: string, projectDescription?: string, supervisorId: number, studentIds?: number[] }} body
     */
    createTeam: (body) =>
        axiosInstance.post("/Student/create-team", {
            projectTitle: body.projectTitle,
            projectDescription: body.projectDescription ?? "",
            supervisorId: body.supervisorId,
            studentIds: body.studentIds ?? [],
        }).then((r) => r.data),

    /**
     * POST /api/Student/send-invitation
     * @param {number} studentId
     */
    sendInvitation: (studentId) =>
        axiosInstance.post("/Student/send-invitation", { studentId }).then((r) => r.data),

    /**
     * POST /api/Student/request-to-join
     * @param {number} teamId
     */
    requestToJoin: (teamId) =>
        axiosInstance.post("/Student/request-to-join", { teamId }).then((r) => r.data),

    /**
     * POST /api/Student/respond-to-invitation
     * @param {number} joinRequestId
     * @param {boolean} isAccepted
     */
    respondToInvitation: (joinRequestId, isAccepted) =>
        axiosInstance.post("/Student/respond-to-invitation", { joinRequestId, isAccepted }).then((r) => r.data),

    /**
     * POST /api/Student/respond-to-join-request
     * @param {number} joinRequestId
     * @param {boolean} isAccepted
     */
    respondToJoinRequest: (joinRequestId, isAccepted) =>
        axiosInstance.post("/Student/respond-to-join-request", { joinRequestId, isAccepted }).then((r) => r.data),

    /**
     * POST /api/Student/request-leave
     */
    requestLeave: () =>
        axiosInstance.post("/Student/request-leave").then((r) => r.data),

    /**
     * PUT /api/Student/update-project-info
     * Allows the team leader to update the project title and description
     * @param {{ projectTitle: string, projectDescription: string }} body
     */
    updateProjectInfo: (body) =>
        axiosInstance.put("/Student/update-project-info", {
            projectTitle: body.projectTitle ?? "",
            projectDescription: body.projectDescription ?? "",
        }).then((r) => r.data),

    // ── User Profile ──────────────────────────────────────────────────────────

    /** GET /api/UserProfile */
    getProfile: () =>
        axiosInstance.get("/UserProfile").then((r) => r.data),

    /**
     * POST /api/UserProfile — create profile for the first time
     * data.skills[]  →  joined as comma string  →  field
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
     * PUT /api/UserProfile — update existing profile
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

export default studentApi;