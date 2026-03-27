// src/api/handler/endpoints/supervisorApi.js
import axiosInstance from "./../../axiosInstance";

// ─── Pending Requests ────────────────────────────────────────────────────────

/**
 * GET /api/Supervisor/pending-team-requests
 * Returns all pending team join requests + leave requests for the logged-in supervisor
 * Expected response shape per item:
 * {
 *   teamId, teamName, projectTitle, projectDescription,
 *   studentName, studentId, requestedAt,
 *   type: "team" | "leave",
 *   memberId (for leave requests),
 *   members: [{ userId, fullName, email, isLeader }]
 * }
 */
export const getPendingTeamRequests = async () => {
    const res = await axiosInstance.get("/Supervisor/pending-team-requests");
    return res.data;
};

/**
 * POST /api/Supervisor/respond-to-team-request
 * Approve or reject a team supervision request
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
 * Approve or reject a student leave request
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
 * Set the maximum number of teams the supervisor is willing to supervise
 * @param {{ maxTeams: number }} payload
 */
export const setMaxTeams = async (payload) => {
    const res = await axiosInstance.put("/Supervisor/set-max-teams", payload);
    return res.data;
};

// ─── My Teams ────────────────────────────────────────────────────────────────

/**
 * GET /api/Supervisor/my-teams
 * Returns all teams currently supervised by the logged-in supervisor
 * Expected response shape per item:
 * {
 *   teamId, teamName, projectTitle, projectDescription,
 *   maxMembers, progress,
 *   members: [{ userId, fullName, email, isLeader }],
 *   tasks: { todo, inProgress, done },
 *   files: { total, pending },
 *   risk: "low" | "medium" | "high",
 *   lastActive
 * }
 */
export const getSupervisorTeams = async () => {
    const res = await axiosInstance.get("/Supervisor/my-teams");
    return res.data;
};

/**
 * GET /api/Supervisor/team/{teamId}
 * Returns full details of a single supervised team
 * @param {number} teamId
 */
export const getSupervisorTeamById = async (teamId) => {
    const res = await axiosInstance.get(`/Supervisor/team/${teamId}`);
    return res.data;
};

/**
 * GET /api/Supervisor/total-teams
 * Returns the total count of teams supervised + supervisor's current maxTeams setting
 * Expected response shape:
 * { totalTeams: number, maxTeams: number }
 */
export const getSupervisorTotalTeams = async () => {
    const res = await axiosInstance.get("/Supervisor/total-teams");
    return res.data;
};