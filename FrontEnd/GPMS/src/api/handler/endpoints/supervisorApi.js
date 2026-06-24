// src/api/handler/endpoints/supervisorApi.js
//
// Supervisor API — all endpoints consumed by supervisor-facing pages.
//
// Endpoints:
//   GET  /api/Supervisor/pending-team-requests
//   GET  /api/Supervisor/leave-requests
//   POST /api/Supervisor/respond-to-team-request
//   POST /api/Supervisor/respond-to-leave-request
//   PUT  /api/Supervisor/set-max-teams
//   GET  /api/Supervisor/my-teams
//   GET  /api/Supervisor/team/{teamId}
//   GET  /api/Supervisor/total-teams
//   POST /api/Supervisor/office-hours        ← isOnline included
//   GET  /api/Supervisor/office-hours
//   DELETE /api/Supervisor/office-hours/{id}
//   GET  /api/Supervisor/all-appointments
//   GET  /api/Supervisor/pending-appointments
//   POST /api/Supervisor/respond-to-appointment

import axiosInstance from "./../../axiosInstance";

// ─── Pending Requests ─────────────────────────────────────────────────────────

export const getPendingTeamRequests = async () => {
    const res = await axiosInstance.get("/Supervisor/pending-team-requests");
    return res.data;
};

export const getPendingLeaveRequests = async () => {
    try {
        const res = await axiosInstance.get("/Supervisor/leave-requests");
        return res.data;
    } catch {
        return [];
    }
};

export const respondToTeamRequest = async (payload) => {
    const res = await axiosInstance.post("/Supervisor/respond-to-team-request", payload);
    return res.data;
};

export const respondToLeaveRequest = async (payload) => {
    const res = await axiosInstance.post("/Supervisor/respond-to-leave-request", payload);
    return res.data;
};

export const setMaxTeams = async (payload) => {
    const res = await axiosInstance.put("/Supervisor/set-max-teams", payload);
    return res.data;
};

// ─── My Teams ─────────────────────────────────────────────────────────────────

export const getSupervisorTeams = async () => {
    const res = await axiosInstance.get("/Supervisor/my-teams");
    return res.data;
};

export const getSupervisorTeamById = async (teamId) => {
    const res = await axiosInstance.get(`/Supervisor/team/${teamId}`);
    return res.data;
};

export const getSupervisorTotalTeams = async () => {
    const res = await axiosInstance.get("/Supervisor/total-teams");
    return res.data;
};

// ─── Teams Overview (merged from /teams-overview + /my-teams) ────────────────

/**
 * Fetches teams overview by combining two endpoints in parallel:
 *   GET /api/Supervisor/teams-overview  → tasks (phase1+phase2) + files
 *   GET /api/Supervisor/my-teams        → members + projectTitle + projectDescription
 *
 * The two responses are merged by teamId so the rest of the app
 * gets a single unified object per team.
 *
 * @returns {Promise<Array>}
 */
export const getTeamsOverview = async () => {
    const [overviewRes, myTeamsRes] = await Promise.all([
        axiosInstance.get("/Supervisor/teams-overview"),
        axiosInstance.get("/Supervisor/my-teams"),
    ]);

    // Normalise both responses — handle wrapped vs. unwrapped shapes
    const overviewData = (() => {
        const d = overviewRes.data;
        if (Array.isArray(d))              return d;
        if (d && Array.isArray(d.data))    return d.data;
        if (d && Array.isArray(d.teams))   return d.teams;
        return [];
    })();

    const myTeamsData = (() => {
        const d = myTeamsRes.data;
        if (Array.isArray(d))              return d;
        if (d && Array.isArray(d.data))    return d.data;
        if (d && Array.isArray(d.teams))   return d.teams;
        return [];
    })();

    // Merge: inject members + project info from /my-teams into each overview item
    return overviewData.map(team => {
        const teamId = team.teamId ?? team.id;
        const match  = myTeamsData.find(t =>
            (t.id != null    && t.id    === teamId) ||
            (t.teamId != null && t.teamId === teamId)
        );
        return {
            ...team,
            members:             match?.members             ?? [],
            projectTitle:        match?.projectTitle        ?? team.teamName ?? team.projectTitle ?? "—",
            projectDescription:  match?.projectDescription  ?? "",
        };
    });
};

// ─── Office Hours ─────────────────────────────────────────────────────────────

/**
 * POST /api/Supervisor/office-hours
 * Create a new available office hour slot.
 *
 * @param {{ dayOfWeek: string, startTime: string, endTime: string, isOnline: boolean }} payload
 *   - dayOfWeek  : e.g. "Monday", "Tuesday" …
 *   - startTime  : e.g. "09:00"
 *   - endTime    : e.g. "11:00"
 *   - isOnline   : true = Online meeting, false = In-person / office hour
 *
 * ✅ isOnline is set by the supervisor here. The student receives it read-only
 *    from GET /api/Student/supervisor-office-hours and cannot override it.
 */
export const createOfficeHour = async (payload) => {
    const res = await axiosInstance.post("/Supervisor/office-hours", {
        dayOfWeek: payload.dayOfWeek,
        startTime: payload.startTime,
        endTime:   payload.endTime,
        isOnline:  payload.isOnline ?? false,
    });
    return res.data;
};

/**
 * GET /api/Supervisor/office-hours
 * Returns all office hour slots for the logged-in supervisor.
 *
 * Expected response shape per item:
 * {
 *   officeHourId : number,
 *   dayOfWeek    : string,
 *   startTime    : string,
 *   endTime      : string,
 *   isOnline     : boolean,
 * }
 */
export const getOfficeHours = async () => {
    const res = await axiosInstance.get("/Supervisor/office-hours");
    return res.data;
};

/**
 * DELETE /api/Supervisor/office-hours/{officeHourId}
 * Delete a specific office hour slot.
 *
 * @param {number} officeHourId
 */
export const deleteOfficeHour = async (officeHourId) => {
    const res = await axiosInstance.delete(`/Supervisor/office-hours/${officeHourId}`);
    return res.data;
};

// ─── Appointments ─────────────────────────────────────────────────────────────

/**
 * GET /api/Supervisor/all-appointments
 * Returns ALL appointments (pending, approved, rejected) for the supervisor.
 *
 * Expected response shape per item:
 * {
 *   appointmentId  : number,
 *   dayOfWeek?     : string,
 *   startTime?     : string,
 *   endTime?       : string,
 *   isOnline       : boolean,
 *   status         : "Pending" | "Approved" | "Rejected",
 *   studentName    : string,
 *   studentId      : number,
 *   teamName?      : string,
 *   link?          : string,
 * }
 */
export const getAllAppointments = async () => {
    const res = await axiosInstance.get("/Supervisor/all-appointments");
    return res.data;
};

/**
 * GET /api/Supervisor/pending-appointments
 * Returns only pending appointment requests.
 */
export const getPendingAppointments = async () => {
    const res = await axiosInstance.get("/Supervisor/pending-appointments");
    return res.data;
};

/**
 * POST /api/Supervisor/respond-to-appointment
 *
 * @param {{ appointmentId: number, isApproved: boolean, link: string }} payload
 */
export const respondToAppointment = async (payload) => {
    const res = await axiosInstance.post("/Supervisor/respond-to-appointment", {
        appointmentId: payload.appointmentId,
        isApproved:    payload.isApproved,
        link:          payload.link ?? "",
    });
    return res.data;
};