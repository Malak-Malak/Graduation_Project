// src/api/handler/endpoints/headOfDepartmentApi.js
//
// Head of Department API — endpoints for the elevated supervisor role.
//
// Supervisor (Head) endpoints:
//   POST   /api/HeadOfDepartment/create-slot
//   DELETE /api/HeadOfDepartment/delete-slot/{slotId}
//   GET    /api/HeadOfDepartment/slots
//   POST   /api/HeadOfDepartment/assign-team-to-slot
//   GET    /api/HeadOfDepartment/department-teams
//   GET    /api/HeadOfDepartment/department-supervisors
//   GET    /api/HeadOfDepartment/student-requests
//   POST   /api/HeadOfDepartment/review-student-request
//   GET    /api/HeadOfDepartment/department-students
//
// Student endpoint:
//   GET    /api/HeadOfDepartment/my-discussion-slot
//
// Supervisor (regular) endpoint:
//   GET    /api/HeadOfDepartment/my-teams-slots

import axiosInstance from "./../../axiosInstance";

// ─── Discussion Slots ──────────────────────────────────────────────────────────

/**
 * POST /api/HeadOfDepartment/create-slot
 * @param {{ dateTime: string, location: string, notes?: string }} payload
 */
export const createSlot = (payload) =>
    axiosInstance.post("/HeadOfDepartment/create-slot", payload).then(r => r.data);

/**
 * DELETE /api/HeadOfDepartment/delete-slot/{slotId}
 * @param {number} slotId
 */
export const deleteSlot = (slotId) =>
    axiosInstance.delete(`/HeadOfDepartment/delete-slot/${slotId}`).then(r => r.data);

/**
 * GET /api/HeadOfDepartment/slots
 * Returns all slots created by the head of department.
 */
export const getSlots = () =>
    axiosInstance.get("/HeadOfDepartment/slots").then(r => r.data);

/**
 * POST /api/HeadOfDepartment/assign-team-to-slot
 * @param {{ teamId: number, slotId: number }} payload
 */
export const assignTeamToSlot = (payload) =>
    axiosInstance.post("/HeadOfDepartment/assign-team-to-slot", payload).then(r => r.data);

// ─── Department Overview ───────────────────────────────────────────────────────

/**
 * GET /api/HeadOfDepartment/department-teams
 * All teams in the head's department.
 */
export const getDepartmentTeams = () =>
    axiosInstance.get("/HeadOfDepartment/department-teams").then(r => r.data);

/**
 * GET /api/HeadOfDepartment/department-supervisors
 * All supervisors in the department with their teams.
 */
export const getDepartmentSupervisors = () =>
    axiosInstance.get("/HeadOfDepartment/department-supervisors").then(r => r.data);

// ─── Student Management ────────────────────────────────────────────────────────

/**
 * GET /api/HeadOfDepartment/student-requests
 * Pending student registration requests in the department.
 */
export const getStudentRequests = () =>
    axiosInstance.get("/HeadOfDepartment/student-requests").then(r => r.data);

/**
 * POST /api/HeadOfDepartment/review-student-request
 * @param {{ requestId: number, isApproved: boolean }} payload
 */
export const reviewStudentRequest = (payload) =>
    axiosInstance.post("/HeadOfDepartment/review-student-request", payload).then(r => r.data);

/**
 * GET /api/HeadOfDepartment/department-students
 * All registered students in the department.
 */
export const getDepartmentStudents = () =>
    axiosInstance.get("/HeadOfDepartment/department-students").then(r => r.data);

// ─── Student View ──────────────────────────────────────────────────────────────

/**
 * GET /api/HeadOfDepartment/my-discussion-slot
 * Returns the discussion slot assigned to the logged-in student's team.
 */
export const getMyDiscussionSlot = () =>
    axiosInstance.get("/HeadOfDepartment/my-discussion-slot").then(r => r.data);

// ─── Regular Supervisor View ───────────────────────────────────────────────────

/**
 * GET /api/HeadOfDepartment/my-teams-slots
 * Returns all teams supervised by the logged-in supervisor, with their assigned slots.
 */
export const getMyTeamsSlots = () =>
    axiosInstance.get("/HeadOfDepartment/my-teams-slots").then(r => r.data);