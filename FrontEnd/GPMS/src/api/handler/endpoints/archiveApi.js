import axiosInstance from "./../../axiosInstance";

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/Archive/submit
// Body: 0 (version 1) or 1 (version 2)
// Role: Student only
// ══════════════════════════════════════════════════════════════════════════════
export const submitProject = (version = 0) =>
    axiosInstance.post("/Archive/submit", version, {
        headers: { "Content-Type": "application/json" },
    });

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/Archive/submitted-teams
// Role: Supervisor only
// ══════════════════════════════════════════════════════════════════════════════
export const getSubmittedTeams = () =>
    axiosInstance.get("/Archive/submitted-teams");

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/Archive/send-to-archive
// Body: { teamId: number, version: number }
// Role: Supervisor only
// ══════════════════════════════════════════════════════════════════════════════
export const sendToArchive = (teamId, version) =>
    axiosInstance.post("/Archive/send-to-archive", { teamId, version });

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/Archive
// Role: Public — no token required
// ══════════════════════════════════════════════════════════════════════════════
export const getAllArchivedProjects = () =>
    axiosInstance.get("/Archive");

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/Archive/{teamId}
// Role: Public — no token required
// ══════════════════════════════════════════════════════════════════════════════
export const getArchivedProjectById = (teamId) =>
    axiosInstance.get(`/Archive/${teamId}`);

const archiveApi = {
    submitProject,
    getSubmittedTeams,
    sendToArchive,
    getAllArchivedProjects,
    getArchivedProjectById,
};

export default archiveApi;