// C:\Users\Dell\Desktop\Graduation_Project\FrontEnd\GPMS\src\api\handler\endpoints\kanbanApi.js

import axiosInstance from "../../axiosInstance";

/**
 * Fetch the full Kanban board (all columns + tasks)
 * GET /api/Kanban/board
 */
export const getKanbanBoard = () =>
    axiosInstance.get("/Kanban/board");

/**
 * Fetch team members available for assignment
 * GET /api/Kanban/team-members
 */
export const getTeamMembers = () =>
    axiosInstance.get("/Kanban/team-members");

/**
 * Create a new task
 * POST /api/Kanban/create-task
 * @param {{ title, description, status, deadline, assignedUserIds: number[] }} payload
 */
export const createTask = (payload) =>
    axiosInstance.post("/Kanban/create-task", payload);

/**
 * Update task details (title / description / deadline / assignees)
 * PUT /api/Kanban/update-task/{taskId}
 * @param {number} taskId
 * @param {{ title, description, deadline, assignedUserIds: number[] }} payload
 */
export const updateTask = (taskId, payload) =>
    axiosInstance.put(`/Kanban/update-task/${taskId}`, payload);

/**
 * Move a task to a different status column
 * PUT /api/Kanban/update-status
 * @param {{ taskId: number, status: string }} payload
 */
export const updateTaskStatus = (payload) =>
    axiosInstance.put("/Kanban/update-status", payload);

/**
 * Delete a task permanently
 * DELETE /api/Kanban/delete-task/{taskId}
 * @param {number} taskId
 */
export const deleteTask = (taskId) =>
    axiosInstance.delete(`/Kanban/delete-task/${taskId}`);