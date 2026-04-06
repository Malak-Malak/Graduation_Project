// src/api/handler/endpoints/fileSystemApi.js
//
// Real response shape from GET /api/FileSystem/student-files and supervisor-files:
// {
//   id              : number,   ← use this everywhere (NOT attachmentId)
//   fileName        : string,
//   filePath        : string,
//   description     : string,
//   uploadedAt      : string (ISO),
//   uploadedByName  : string,
//   uploadedByUserId: number,
// }
//
// Endpoints:
//   GET    /api/FileSystem/supervisor-files      → supervisor's own files
//   GET    /api/FileSystem/student-files         → student files
//   POST   /api/FileSystem/add                   → { filePath, fileName, description }
//   PUT    /api/FileSystem/edit/{id}             → { filePath, fileName, description }
//   DELETE /api/FileSystem/delete/{id}

import axiosInstance from "../../axiosInstance";

const fileSystemApi = {

    /** GET /api/FileSystem/supervisor-files */
    getSupervisorFiles: () =>
        axiosInstance.get("/FileSystem/supervisor-files").then((r) => r.data),

    /** GET /api/FileSystem/student-files */
    getStudentFiles: () =>
        axiosInstance.get("/FileSystem/student-files").then((r) => r.data),

    /**
     * POST /api/FileSystem/add
     * @param {{ filePath: string, fileName: string, description: string }} body
     */
    addFile: (body) =>
        axiosInstance
            .post("/FileSystem/add", {
                filePath: body.filePath ?? "",
                fileName: body.fileName ?? "",
                description: body.description ?? "",
            })
            .then((r) => r.data),

    /**
     * PUT /api/FileSystem/edit/{id}
     * @param {number} id     ← file.id from the response
     * @param {{ filePath: string, fileName: string, description: string }} body
     */
    editFile: (id, body) =>
        axiosInstance
            .put(`/FileSystem/edit/${id}`, {
                filePath: body.filePath ?? "",
                fileName: body.fileName ?? "",
                description: body.description ?? "",
            })
            .then((r) => r.data),

    /**
     * DELETE /api/FileSystem/delete/{id}
     * @param {number} id  ← file.id
     */
    deleteFile: (id) =>
        axiosInstance.delete(`/FileSystem/delete/${id}`).then((r) => r.data),
};

export default fileSystemApi;