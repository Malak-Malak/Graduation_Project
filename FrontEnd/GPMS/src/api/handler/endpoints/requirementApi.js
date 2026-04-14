// src/api/handler/endpoints/requirementApi.js
//
// Endpoints:
//   GET    /api/Requirement                    → list all requirements
//   POST   /api/Requirement/add                → { title, description, priority, type }
//   PUT    /api/Requirement/update/{id}        → { title, description, priority, type }
//   DELETE /api/Requirement/delete/{id}
//   GET    /api/Requirement/github-repo        → returns { githubRepo: string | null }
//   POST   /api/Requirement/github-repo        → { githubRepo: string }

import axiosInstance from "../../axiosInstance";

const requirementApi = {

    // ── Requirements CRUD ─────────────────────────────────────────────────────

    getAll: () =>
        axiosInstance.get("/Requirement").then((r) => r.data),

    add: (payload) =>
        axiosInstance
            .post("/Requirement/add", payload)
            .then((r) => r.data),

    update: (requirementId, payload) =>
        axiosInstance
            .put(`/Requirement/update/${requirementId}`, payload)
            .then((r) => r.data),

    remove: (requirementId) =>
        axiosInstance
            .delete(`/Requirement/delete/${requirementId}`)
            .then((r) => r.data),

    // ── GitHub Repo ───────────────────────────────────────────────────────────

    getGithubRepo: () =>
        axiosInstance.get("/Requirement/github-repo").then((r) => r.data),

    setGithubRepo: (githubRepo) =>
        axiosInstance
            .post("/Requirement/github-repo", { githubRepo })
            .then((r) => r.data),
};

export default requirementApi;