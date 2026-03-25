// src/api/handler/endpoints/supervisorApi.js
import axiosInstance from "./../../axiosInstance";

// ─── Pending Requests ────────────────────────────────────────────────────────

/**
 * GET /api/Supervisor/pending-team-requests
 * Returns all pending team join requests for the logged-in supervisor
 */
export const getPendingTeamRequests = async () => {
    const res = await axiosInstance.get("/Supervisor/pending-team-requests");
    return res.data;
};

/**
 * POST /api/Supervisor/respond-to-team-request
 * Approve or reject a team join request
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
 * Set the maximum number of teams the supervisor can supervise
 * @param {{ maxTeams: number }} payload
 */
export const setMaxTeams = async (payload) => {
    const res = await axiosInstance.put("/Supervisor/set-max-teams", payload);
    return res.data;
};