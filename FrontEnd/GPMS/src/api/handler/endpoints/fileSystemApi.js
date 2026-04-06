// src/api/handler/endpoints/fileSystemApi.js
//
// Endpoints (updated to match backend Swagger):
//   GET    /api/FileSystem/supervisor-files        → supervisor's own uploaded files
//   GET    /api/FileSystem/student-files           → student's own uploaded files
//   POST   /api/FileSystem/add                     → add file (link) — no taskItemId
//   PUT    /api/FileSystem/edit/{attachmentId}      → edit file
//   DELETE /api/FileSystem/delete/{attachmentId}   → delete file

import axiosInstance from "../../axiosInstance";

const fileSystemApi = {

    /**
     * GET /api/FileSystem/supervisor-files
     * Returns files uploaded by the supervisor (scoped to their teams).
     * Used by: supervisor "My Files" tab + student "Supervisor Files" tab.
     *
     * Expected response shape per item:
     * {
     *   attachmentId : number,
     *   filePath     : string,
     *   description  : string,
     * }
     */
    getSupervisorFiles: () =>
        axiosInstance.get("/FileSystem/supervisor-files").then((r) => r.data),

    /**
     * GET /api/FileSystem/student-files
     * Returns files uploaded by the student (their own files only).
     * Used by: student "My Files" tab + supervisor "Review Teams" tab.
     *
     * Expected response shape per item:
     * {
     *   attachmentId : number,
     *   filePath     : string,
     *   description  : string,
     * }
     */
    getStudentFiles: () =>
        axiosInstance.get("/FileSystem/student-files").then((r) => r.data),

    /**
     * POST /api/FileSystem/add
     * Save a new shareable link.
     * Backend determines ownership from the auth token (student or supervisor).
     *
     * @param {{ filePath: string, description: string }} body
     */
    addFile: (body) =>
        axiosInstance.post("/FileSystem/add", {
            filePath: body.filePath ?? "",
            description: body.description ?? "",
        }).then((r) => r.data),

    /**
     * PUT /api/FileSystem/edit/{attachmentId}
     * Edit an existing link's URL or description.
     *
     * @param {number} attachmentId
     * @param {{ filePath: string, description: string }} body
     */
    editFile: (attachmentId, body) =>
        axiosInstance.put(`/FileSystem/edit/${attachmentId}`, {
            filePath: body.filePath ?? "",
            description: body.description ?? "",
        }).then((r) => r.data),

    /**
     * DELETE /api/FileSystem/delete/{attachmentId}
     *
     * @param {number} attachmentId
     */
    deleteFile: (attachmentId) =>
        axiosInstance.delete(`/FileSystem/delete/${attachmentId}`).then((r) => r.data),
};

export default fileSystemApi;