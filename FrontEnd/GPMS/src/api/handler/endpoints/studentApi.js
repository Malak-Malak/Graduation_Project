// src/api/handler/endpoints/studentApi.js
//
// Backend keys:
//   fullName, phoneNumber, department, field, gitHubLink, linkedinLink, personalEmail
//
// Mapping:
//   department  →  academic major (Computer Science, Software Engineering…)
//   field       →  skills joined by comma  e.g. "Frontend,Backend,AI / ML"
//
// Endpoints:
//   GET  /api/Student/my-team
//   GET  /api/Student/supervisors
//   GET  /api/Student/available-students
//   GET  /api/Student/available-teams
//   GET  /api/Student/my-invitations
//   GET  /api/Student/my-join-requests        → requests the student sent to teams (⚠ pending backend)
//   GET  /api/Student/team-join-requests      → requests received by the student's team (leader only)
//   POST /api/Student/create-team
//   POST /api/Student/send-invitation
//   POST /api/Student/request-to-join
//   POST /api/Student/respond-to-invitation
//   POST /api/Student/respond-to-join-request
//   POST /api/Student/reject-join-request/{requestId}
//   POST /api/Student/request-leave
//   PUT  /api/Student/update-project-info
//   DELETE /api/Student/delete-join-request/{requestId}
//   POST /api/Student/request-appointment     ← NEW
//   GET  /api/Student/my-appointments         ← NEW
//   POST /api/Student/switch-version          ← NEW (Phase switching)
//   GET  /api/Student/current-version         ← NEW (Get current phase)

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
     * Invitations sent TO the student from teams.
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

    /**
     * GET /api/Student/my-join-requests
     * Requests the student sent TO teams (request-to-join).
     *
     * ⚠  NOTE: This endpoint is not yet implemented on the backend.
     *    Until it is ready the function silently returns [] so existing
     *    UI keeps working without errors.
     */
    getMyJoinRequests: async () => {
        try {
            const res = await axiosInstance.get("/Student/my-join-requests");
            return res.data;
        } catch {
            return [];
        }
    },

    /**
     * GET /api/Student/team-join-requests
     * Join requests received by the student's team (visible to team leader).
     * Expected response shape:
     * [{
     *   id, joinRequestId,
     *   studentId, studentName, studentEmail?,
     *   status: "Pending" | "Accepted" | "Rejected",
     *   sentAt
     * }]
     */
    getTeamJoinRequests: () =>
        axiosInstance.get("/Student/team-join-requests").then((r) => r.data),

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
     * POST /api/Student/reject-join-request/{requestId}
     * @param {number} requestId
     */
    rejectJoinRequest: (requestId) =>
        axiosInstance.post(`/Student/reject-join-request/${requestId}`).then((r) => r.data),

    /**
     * POST /api/Student/request-leave
     */
    requestLeave: () =>
        axiosInstance.post("/Student/request-leave").then((r) => r.data),

    /**
     * PUT /api/Student/update-project-info
     * @param {{ projectTitle: string, projectDescription: string }} body
     */
    updateProjectInfo: (body) =>
        axiosInstance.put("/Student/update-project-info", {
            projectTitle: body.projectTitle ?? "",
            projectDescription: body.projectDescription ?? "",
        }).then((r) => r.data),

    /**
     * DELETE /api/Student/delete-join-request/{requestId}
     * @param {number} requestId
     */
    deleteJoinRequest: (requestId) =>
        axiosInstance.delete(`/Student/delete-join-request/${requestId}`).then((r) => r.data),

    // ── User Profile ──────────────────────────────────────────────────────────

    /** GET /api/UserProfile */
    getProfile: () =>
        axiosInstance.get("/UserProfile").then((r) => r.data),

    getAllStudents: () =>
        axiosInstance.get("/Student/all-students").then((r) => r.data),

    /**
     * POST /api/UserProfile — create profile for the first time
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

    // ── Appointments ──────────────────────────────────────────────────────────

    /**
     * POST /api/Student/request-appointment
     * Student requests a meeting appointment with their supervisor.
     *
     * @param {string} dateTime  — ISO 8601 string, e.g. "2026-04-10T10:00:00.000Z"
     *
     * Request body: { dateTime: string }
     */
    requestAppointment: (dateTime) =>
        axiosInstance
            .post("/Student/request-appointment", { dateTime })
            .then((r) => r.data),

    /**
     * GET /api/Student/my-appointments
     * Returns all appointments for the logged-in student.
     *
     * Expected response shape per item:
     * {
     *   appointmentId : number,
     *   dateTime      : string (ISO),
     *   status        : "Pending" | "Approved" | "Rejected",
     *   link?         : string,   // filled by supervisor on approval
     *   supervisorName: string,
     * }
     */
    getMyAppointments: () =>
        axiosInstance.get("/Student/my-appointments").then((r) => r.data),

    // ── Phase / Version Switching ─────────────────────────────────────────────

    /**
     * POST /api/Student/switch-version
     * Switches the student between Phase 1 (Proposal) and Phase 2 (Project).
     * No request body needed — backend toggles automatically.
     *
     * Expected response shape:
     * { version: "Phase1" | "Phase2" }
     */
    switchVersion: () =>
        axiosInstance.post("/Student/switch-version").then((r) => r.data),

    /**
     * GET /api/Student/current-version
     * Returns the student's current active phase.
     *
     * Expected response shape:
     * { version: "Phase1" | "Phase2" }
     */
    getCurrentVersion: () =>
        axiosInstance.get("/Student/current-version").then((r) => r.data),
};

export default studentApi;