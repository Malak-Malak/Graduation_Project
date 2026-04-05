// src/api/handler/endpoints/fileSystemApi.js
//
// Endpoints:
//   GET    /api/FileSystem                        → get all files
//   GET    /api/FileSystem/task/{taskItemId}       → get files by task
//   POST   /api/FileSystem/add                    → add file (link)
//   PUT    /api/FileSystem/edit/{attachmentId}     → edit file
//   DELETE /api/FileSystem/delete/{attachmentId}  → delete file

import axiosInstance from "../../axiosInstance";

const fileSystemApi = {

    /**
     * GET /api/FileSystem
     * Returns all file links for the logged-in user's project.
     *
     * Expected response shape per item:
     * {
     *   attachmentId : number,
     *   filePath     : string,   ← shareable URL
     *   description  : string,
     *   taskItemId   : number,
     * }
     */
    getAllFiles: () =>
        axiosInstance.get("/FileSystem").then((r) => r.data),

    /**
     * GET /api/FileSystem/task/{taskItemId}
     * Returns file links belonging to a specific task.
     *
     * @param {number} taskItemId
     */
    getFilesByTask: (taskItemId) =>
        axiosInstance.get(`/FileSystem/task/${taskItemId}`).then((r) => r.data),

    /**
     * POST /api/FileSystem/add
     * Save a new shareable link.
     *
     * @param {{ filePath: string, description: string, taskItemId: number }} body
     */
    addFile: (body) =>
        axiosInstance.post("/FileSystem/add", {
            filePath: body.filePath ?? "",
            description: body.description ?? "",
            taskItemId: body.taskItemId ?? 0,
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