// src/api/handler/endpoints/fileSystemApi.js
//
// Endpoints:
//   GET    /api/FileSystem/supervisor-files
//   GET    /api/FileSystem/student-files
//   POST   /api/FileSystem/add
//   PUT    /api/FileSystem/edit/{id}
//   DELETE /api/FileSystem/delete/{id}
//
// NOTE: Backend returns { id, filePath, description, uploadedAt, ... }
//       The path parameter is called "attachmentId" in Swagger but maps to "id" in response.

import axiosInstance from "../../axiosInstance";

const fileSystemApi = {

    getSupervisorFiles: () =>
        axiosInstance.get("/FileSystem/supervisor-files").then((r) => r.data),

    getStudentFiles: () =>
        axiosInstance.get("/FileSystem/student-files").then((r) => r.data),

    addFile: (body) =>
        axiosInstance.post("/FileSystem/add", {
            filePath: body.filePath ?? "",
            description: body.description ?? "",
        }).then((r) => r.data),

    // @param {number} id — the file's "id" from GET response
    editFile: (id, body) =>
        axiosInstance.put(`/FileSystem/edit/${id}`, {
            filePath: body.filePath ?? "",
            description: body.description ?? "",
        }).then((r) => r.data),

    // @param {number} id — the file's "id" from GET response
    deleteFile: (id) =>
        axiosInstance.delete(`/FileSystem/delete/${id}`).then((r) => r.data),
};

export default fileSystemApi;