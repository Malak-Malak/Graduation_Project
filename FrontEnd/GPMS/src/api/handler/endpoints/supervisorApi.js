// src/api/handler/endpoints/supervisorApi.js
//
// Supervisor API — all endpoints consumed by supervisor-facing pages.
//
// Endpoints:
//   GET  /api/Supervisor/pending-team-requests   → team join requests
//   GET  /api/Supervisor/leave-requests          → student leave requests (⚠ pending backend)
//   POST /api/Supervisor/respond-to-team-request
//   POST /api/Supervisor/respond-to-leave-request
//   PUT  /api/Supervisor/set-max-teams
//   GET  /api/Supervisor/my-teams
//   GET  /api/Supervisor/team/{teamId}
//   GET  /api/Supervisor/total-teams

import axiosInstance from "./../../axiosInstance";

// ─── Pending Requests ────────────────────────────────────────────────────────

/**
 * GET /api/Supervisor/pending-team-requests
 *
 * Returns all pending team join requests for the logged-in supervisor.
 *
 * Expected response shape per item:
 * {
 *   teamId          : number,
 *   teamName        : string,
 *   projectTitle    : string,
 *   projectDescription?: string,
 *   studentName     : string,
 *   studentId       : number,
 *   requestedAt     : string (ISO date),
 *   type            : "team",
 *   members         : [{ userId, fullName, email, isLeader }]
 * }
 */
export const getPendingTeamRequests = async () => {
    const res = await axiosInstance.get("/Supervisor/pending-team-requests");
    return res.data;
};

/**
 * GET /api/Supervisor/leave-requests
 *
 * Returns all pending student leave requests for teams supervised
 * by the logged-in supervisor.
 *
 * Expected response shape per item:
 * {
 *   teamMemberId : number,
 *   teamId       : number,
 *   teamName     : string,
 *   studentName  : string,
 *   studentId    : number,
 *   requestedAt  : string (ISO date),
 *   reason?      : string
 * }
 *
 * ⚠  NOTE: This endpoint is not yet implemented on the backend.
 *    Until it is ready the function silently returns [] so existing
 *    UI (GroupsList, PendingRequests) keeps working without errors.
 *    Once the backend ships, remove the try/catch wrapper and let
 *    the axios call throw normally.
 */
export const getPendingLeaveRequests = async () => {
    try {
        const res = await axiosInstance.get("/Supervisor/leave-requests");
        return res.data;
    } catch {
        // Graceful fallback — endpoint not available yet
        return [];
    }
};

/**
 * POST /api/Supervisor/respond-to-team-request
 *
 * Approve or reject a pending team supervision request.
 *
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
 *
 * Approve or reject a student leave request.
 *
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
 *
 * Update the maximum number of teams the supervisor is willing to supervise.
 *
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
 * Returns all teams currently supervised by the logged-in supervisor.
 *
 * Expected response shape per item:
 * {
 *   teamId             : number,
 *   teamName           : string,
 *   projectTitle       : string,
 *   projectDescription?: string,
 *   maxMembers         : number,
 *   progress           : number  (0-100),
 *   risk               : "low" | "medium" | "high",
 *   lastActive?        : string,
 *   members            : [{ userId, fullName, email, isLeader }],
 *   tasks              : { todo, inProgress, done },
 *   files              : { total, pending }
 * }
 */
export const getSupervisorTeams = async () => {
    const res = await axiosInstance.get("/Supervisor/my-teams");
    return res.data;
};

/**
 * GET /api/Supervisor/team/{teamId}
 *
 * Returns full details for a single supervised team.
 *
 * @param {number} teamId
 */
export const getSupervisorTeamById = async (teamId) => {
    const res = await axiosInstance.get(`/Supervisor/team/${teamId}`);
    return res.data;
};

/**
 * GET /api/Supervisor/total-teams
 *
 * Returns the supervisor's current team count and their configured limit.
 *
 * Expected response shape:
 * { totalTeams: number, maxTeams: number }
 */
export const getSupervisorTotalTeams = async () => {
    const res = await axiosInstance.get("/Supervisor/total-teams");
    return res.data;
};