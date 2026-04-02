// src/api/handler/endpoints/supervisorApi.js
//
// Supervisor API — all endpoints consumed by supervisor-facing pages.
//
// Endpoints:
//   GET  /api/Supervisor/pending-team-requests
//   GET  /api/Supervisor/leave-requests          (⚠ pending backend)
//   POST /api/Supervisor/respond-to-team-request
//   POST /api/Supervisor/respond-to-leave-request
//   PUT  /api/Supervisor/set-max-teams
//   GET  /api/Supervisor/my-teams
//   GET  /api/Supervisor/team/{teamId}
//   GET  /api/Supervisor/total-teams
//   GET  /api/Supervisor/pending-appointments    ← NEW
//   POST /api/Supervisor/respond-to-appointment  ← NEW

import axiosInstance from "./../../axiosInstance";

// ─── Pending Requests ────────────────────────────────────────────────────────

/**
 * GET /api/Supervisor/pending-team-requests
 *
 * Returns all pending team join requests for the logged-in supervisor.
 *
 * Expected response shape per item:
 * {
 *   teamId, teamName, projectTitle, projectDescription?,
 *   studentName, studentId, requestedAt, type: "team",
 *   members: [{ userId, fullName, email, isLeader }]
 * }
 */
export const getPendingTeamRequests = async () => {
    const res = await axiosInstance.get("/Supervisor/pending-team-requests");
    return res.data;
};

/**
 * GET /api/Supervisor/leave-requests
 *
 * ⚠  NOTE: Not yet implemented on the backend — returns [] gracefully.
 *
 * Expected response shape per item:
 * {
 *   teamMemberId, teamId, teamName,
 *   studentName, studentId, requestedAt, reason?
 * }
 */
export const getPendingLeaveRequests = async () => {
    try {
        const res = await axiosInstance.get("/Supervisor/leave-requests");
        return res.data;
    } catch {
        return [];
    }
};

/**
 * POST /api/Supervisor/respond-to-team-request
 * @param {{ teamId: number, isApproved: boolean }} payload
 */
export const respondToTeamRequest = async (payload) => {
    const res = await axiosInstance.post(
        "/Supervisor/respond-to-team-request",
        payload
    );
    return res.data;
};

/**
 * POST /api/Supervisor/respond-to-leave-request
 * @param {{ teamMemberId: number, isApproved: boolean }} payload
 */
export const respondToLeaveRequest = async (payload) => {
    const res = await axiosInstance.post(
        "/Supervisor/respond-to-leave-request",
        payload
    );
    return res.data;
};

/**
 * PUT /api/Supervisor/set-max-teams
 * @param {{ maxTeams: number }} payload
 */
export const setMaxTeams = async (payload) => {
    const res = await axiosInstance.put("/Supervisor/set-max-teams", payload);
    return res.data;
};

// ─── My Teams ────────────────────────────────────────────────────────────────

/**
 * GET /api/Supervisor/my-teams
 *
 * Expected response shape per item:
 * {
 *   teamId, teamName, projectTitle, projectDescription?,
 *   maxMembers, progress (0-100), risk: "low"|"medium"|"high",
 *   lastActive?, members: [{ userId, fullName, email, isLeader }],
 *   tasks: { todo, inProgress, done }, files: { total, pending }
 * }
 */
export const getSupervisorTeams = async () => {
    const res = await axiosInstance.get("/Supervisor/my-teams");
    return res.data;
};

/**
 * GET /api/Supervisor/team/{teamId}
 * @param {number} teamId
 */
export const getSupervisorTeamById = async (teamId) => {
    const res = await axiosInstance.get(`/Supervisor/team/${teamId}`);
    return res.data;
};

/**
 * GET /api/Supervisor/total-teams
 * Expected response shape: { totalTeams: number, maxTeams: number }
 */
export const getSupervisorTotalTeams = async () => {
    const res = await axiosInstance.get("/Supervisor/total-teams");
    return res.data;
};

// ─── Appointments ─────────────────────────────────────────────────────────────

/**
 * GET /api/Supervisor/pending-appointments
 *
 * Returns all appointment requests sent by students to the supervisor
 * that are still in "Pending" status.
 *
 * Expected response shape per item:
 * {
 *   appointmentId  : number,
 *   dateTime       : string (ISO),
 *   status         : "Pending",
 *   studentName    : string,
 *   studentId      : number,
 *   teamName?      : string,
 * }
 */
export const getPendingAppointments = async () => {
    const res = await axiosInstance.get("/Supervisor/pending-appointments");
    return res.data;
};

/**
 * POST /api/Supervisor/respond-to-appointment
 *
 * Supervisor approves or rejects a student appointment request.
 * When approving an online meeting, provide the meeting link.
 *
 * @param {{ appointmentId: number, isApproved: boolean, link: string }} payload
 *   - appointmentId : ID of the appointment to respond to
 *   - isApproved    : true = approve, false = reject
 *   - link          : meeting URL (required when isApproved is true, pass "" otherwise)
 *
 * Request body sent to API: { appointmentId, isApproved, link }
 */
export const respondToAppointment = async (payload) => {
    const res = await axiosInstance.post(
        "/Supervisor/respond-to-appointment",
        {
            appointmentId: payload.appointmentId,
            isApproved: payload.isApproved,
            link: payload.link ?? "",
        }
    );
    return res.data;
};