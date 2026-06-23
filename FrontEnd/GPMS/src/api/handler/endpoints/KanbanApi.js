// src/api/handler/endpoints/kanbanApi.js

import axiosInstance from "../../axiosInstance";

export const getKanbanBoard = () =>
    axiosInstance.get("/Kanban/board");

export const getTeamMembers = () =>
    axiosInstance.get("/Kanban/team-members");

export const createTask = (payload) =>
    axiosInstance.post("/Kanban/create-task", payload);

export const updateTask = (taskId, payload) =>
    axiosInstance.put(`/Kanban/update-task/${taskId}`, payload);

export const updateTaskStatus = (payload) =>
    axiosInstance.put("/Kanban/update-status", payload);

export const deleteTask = (taskId) =>
    axiosInstance.delete(`/Kanban/delete-task/${taskId}`);

/**
 * Supervisor read-only — Phase 1
 * GET /api/Kanban/supervisor-board/{teamId}/phase1
 */
export const getSupervisorKanbanPhase1 = (teamId) =>
    axiosInstance.get(`/Kanban/supervisor-board/${teamId}/phase1`);

/**
 * Supervisor read-only — Phase 2
 * GET /api/Kanban/supervisor-board/{teamId}/phase2
 */
export const getSupervisorKanbanPhase2 = (teamId) =>
    axiosInstance.get(`/Kanban/supervisor-board/${teamId}/phase2`);