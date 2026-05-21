// src/api/handler/endpoints/headOfDepartmentApi.js
//
// Head of Department API — endpoints for the elevated supervisor role.
// Base path: /api/head/
//
// HOD endpoints:
//   POST   /api/head/create-slot
//   DELETE /api/head/delete-slot/{slotId}
//   GET    /api/head/slots
//   POST   /api/head/assign-team-to-slot
//   PUT    /api/head/update-team-slot
//   DELETE /api/head/unassign-team/{teamId}
//   GET    /api/head/department-teams
//   GET    /api/head/department-supervisors
//   GET    /api/head/department-students
//   GET    /api/head/student-requests
//   POST   /api/head/review-student-request
//
// Student endpoint:
//   GET    /api/head/my-discussion-slot
//
// Supervisor (regular) endpoint:
//   GET    /api/head/my-teams-slots

import axiosInstance from "./../../axiosInstance";

// ─── Helper: safely extract array from any response shape ─────────────────────
const toArray = (res) => {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    if (res && Array.isArray(res.content)) return res.content;
    if (res && Array.isArray(res.result)) return res.result;
    if (res && Array.isArray(res.items)) return res.items;
    return [];
};

// ─── Discussion Slots ──────────────────────────────────────────────────────────

/**
 * POST /api/head/create-slot
 * @param {{ dateTime: string, location: string, notes?: string }} payload
 */
export const createSlot = (payload) =>
    axiosInstance.post("/head/create-slot", payload).then(r => r.data);

/**
 * DELETE /api/head/delete-slot/{slotId}
 * @param {number} slotId
 */
export const deleteSlot = (slotId) =>
    axiosInstance.delete(`/head/delete-slot/${slotId}`).then(r => r.data);

/**
 * GET /api/head/slots
 * Returns all slots created by this HOD, ordered by date ascending.
 * Each slot includes assignedTeams array (max 1 team per slot).
 * @returns {Promise<Array>}
 */
export const getSlots = () =>
    axiosInstance.get("/head/slots").then(r => toArray(r.data));

/**
 * POST /api/head/assign-team-to-slot
 * @param {{ teamId: number, slotId: number }} payload
 */
export const assignTeamToSlot = (payload) =>
    axiosInstance.post("/head/assign-team-to-slot", payload).then(r => r.data);

/**
 * PUT /api/head/update-team-slot
 * Move a team from its current slot to a different slot.
 * @param {{ teamId: number, newSlotId: number }} payload
 */
export const updateTeamSlot = (payload) =>
    axiosInstance.put("/head/update-team-slot", payload).then(r => r.data);

/**
 * DELETE /api/head/unassign-team/{teamId}
 * Remove a team's slot assignment. The slot becomes available again.
 * @param {number} teamId
 */
export const unassignTeam = (teamId) =>
    axiosInstance.delete(`/head/unassign-team/${teamId}`).then(r => r.data);

// ─── Department Overview ───────────────────────────────────────────────────────

/**
 * GET /api/head/department-teams
 * All teams in the HOD's department (all statuses).
 * Each team includes assignedSlot if one exists.
 * @returns {Promise<Array>}
 */
export const getDepartmentTeams = () =>
    axiosInstance.get("/head/department-teams").then(r => toArray(r.data));

/**
 * GET /api/head/department-supervisors
 * All supervisors in the department (excluding HOD himself),
 * each with their supervised teams.
 * @returns {Promise<Array>}
 */
export const getDepartmentSupervisors = () =>
    axiosInstance.get("/head/department-supervisors").then(r => toArray(r.data));

/**
 * GET /api/head/department-students
 * All registered students in the department with team status.
 * @returns {Promise<Array>}
 */
export const getDepartmentStudents = () =>
    axiosInstance.get("/head/department-students").then(r => toArray(r.data));

// ─── Student Management ────────────────────────────────────────────────────────

/**
 * GET /api/head/student-requests
 * Pending student registration requests in the HOD's department.
 * @returns {Promise<Array>}
 */
export const getStudentRequests = () =>
    axiosInstance.get("/head/student-requests").then(r => toArray(r.data));

/**
 * POST /api/head/review-student-request
 * @param {{ requestId: number, isApproved: boolean }} payload
 */
export const reviewStudentRequest = (payload) =>
    axiosInstance.post("/head/review-student-request", payload).then(r => r.data);

// ─── Student View ──────────────────────────────────────────────────────────────

/**
 * GET /api/head/my-discussion-slot
 * Returns the discussion slot assigned to the logged-in student's team.
 * 404 if no slot assigned yet.
 */
export const getMyDiscussionSlot = () =>
    axiosInstance.get("/head/my-discussion-slot").then(r => r.data);

// ─── Regular Supervisor View ───────────────────────────────────────────────────

/**
 * GET /api/head/my-teams-slots
 * Returns all of the logged-in supervisor's teams with their assigned slots.
 * Works for both regular supervisors and HOD.
 * @returns {Promise<Array>}
 */
export const getMyTeamsSlots = () =>
    axiosInstance.get("/head/my-teams-slots").then(r => toArray(r.data));