import axiosInstance from "./../../axiosInstance";

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/Archive/submit
// Body: 0 (Phase 1) or 1 (Phase 2) — raw integer
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
// GET /api/Archive/team-files/{teamId}?version=0
// Role: Supervisor only
// Returns list of files uploaded by the team for a specific phase
// ══════════════════════════════════════════════════════════════════════════════
export const getTeamFiles = (teamId, version) =>
    axiosInstance.get(`/Archive/team-files/${teamId}`, {
        params: { version },
    });

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/Archive/send-to-archive
// Body: { teamId: number, version: number, fileIds: number[] }
// Role: Supervisor only
// ══════════════════════════════════════════════════════════════════════════════
export const sendToArchive = (teamId, version, fileIds) =>
    axiosInstance.post("/Archive/send-to-archive", { teamId, version, fileIds });

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

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/Archive/search
// Body: "string" — raw search query string (not wrapped in an object)
// Role: Public — no token required
// ══════════════════════════════════════════════════════════════════════════════
export const searchArchive = (query) =>
    axiosInstance.post("/Archive/search", query, {
        headers: { "Content-Type": "application/json" },
    });

const archiveApi = {
    submitProject,
    getSubmittedTeams,
    getTeamFiles,
    sendToArchive,
    getAllArchivedProjects,
    getArchivedProjectById,
    searchArchive,
};

export default archiveApi;