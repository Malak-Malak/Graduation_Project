// src/api/handler/endpoints/requirementApi.js
//
// Endpoints:
//   GET    /api/Requirement              → list all requirements
//   POST   /api/Requirement/add          → { description }
//   PUT    /api/Requirement/update/{id}  → { description }
//   DELETE /api/Requirement/delete/{id}

import axiosInstance from "../../axiosInstance";

const requirementApi = {
    /**
     * GET /api/Requirement
     * Expected response shape:
     * [{ requirementId: number, description: string }]
     */
    getAll: () =>
        axiosInstance.get("/Requirement").then((r) => r.data),

    /**
     * POST /api/Requirement/add
     * @param {string} description
     */
    add: (description) =>
        axiosInstance
            .post("/Requirement/add", { description })
            .then((r) => r.data),

    /**
     * PUT /api/Requirement/update/{requirementId}
     * @param {number} requirementId
     * @param {string} description
     */
    update: (requirementId, description) =>
        axiosInstance
            .put(`/Requirement/update/${requirementId}`, { description })
            .then((r) => r.data),

    /**
     * DELETE /api/Requirement/delete/{requirementId}
     * @param {number} requirementId
     */
    remove: (requirementId) =>
        axiosInstance
            .delete(`/Requirement/delete/${requirementId}`)
            .then((r) => r.data),
};

export default requirementApi;