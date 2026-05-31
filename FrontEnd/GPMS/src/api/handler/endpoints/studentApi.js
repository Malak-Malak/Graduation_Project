// src/api/handler/endpoints/studentApi.js
//
// Backend keys:
//   fullName, phoneNumber, department, field, gitHubLink, linkedinLink, personalEmail
//
// field max length = 100 chars.
// Supervisor research-area labels are long, so we store short codes in `field`
// and expand them back to full labels in normalizeProfile (ProfilePage).
//
// Short-code map lives here so encoding/decoding is co-located.

import axiosInstance from "./../../axiosInstance";

// ── Supervisor Research-Area short codes ──────────────────────────────────────
// key   = what gets stored in backend `field` (short, ≤4 chars each)
// value = full display label shown in the UI
export const SUPERVISOR_AREA_MAP = {
    "AI":   "Artificial Intelligence",
    "ML":   "Machine Learning",
    "DL":   "Deep Learning",
    "BDA":  "Big Data & Analytics",
    "DS":   "Data Science",
    "CN":   "Cybersecurity & Networks",
    "SEA":  "Software Engineering & Architecture",
    "CCD":  "Cloud Computing & DevOps",
    "HCI":  "Human-Computer Interaction",
    "IOT":  "Embedded Systems & IoT",
    "DB":   "Database Systems",
    "CVN":  "Computer Vision & NLP",
    "DSB":  "Distributed Systems & Blockchain",
};

// reverse: full label → short code
const LABEL_TO_CODE = Object.fromEntries(
    Object.entries(SUPERVISOR_AREA_MAP).map(([k, v]) => [v, k])
);

/**
 * Encode skills array → comma-separated string for backend.
 * Supervisor area labels are replaced with their short codes.
 * Student free-text skills are stored as-is (they're already short).
 * Truncated to 100 chars as a safety net.
 */
function encodeField(skills = []) {
    const encoded = skills
        .map((s) => LABEL_TO_CODE[s] ?? s)   // replace known labels with codes
        .join(",");
    return encoded.slice(0, 100);             // hard cap at 100
}

/**
 * Decode field string → skills array.
 * Short codes are expanded back to full labels.
 * Unknown tokens (student free-text) are kept as-is.
 */
export function decodeField(field = "") {
    if (!field) return [];
    return field
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => SUPERVISOR_AREA_MAP[s] ?? s);  // expand code → label if known
}

// ─────────────────────────────────────────────────────────────────────────────

const studentApi = {

    // ── Team Queries ──────────────────────────────────────────────────────────

    getMyTeam: () =>
        axiosInstance.get("/Student/my-team").then((r) => r.data),

    getSupervisors: () =>
        axiosInstance.get("/Student/supervisors").then((r) => r.data),

    getAvailableStudents: () =>
        axiosInstance.get("/Student/available-students").then((r) => r.data),

    getAvailableTeams: () =>
        axiosInstance.get("/Student/available-teams").then((r) => r.data),

    getMyInvitations: () =>
        axiosInstance.get("/Student/my-invitations").then((r) => r.data),

    getMyJoinRequests: async () => {
        try {
            const res = await axiosInstance.get("/Student/my-join-requests");
            return res.data;
        } catch {
            return [];
        }
    },

    getTeamJoinRequests: () =>
        axiosInstance.get("/Student/team-join-requests").then((r) => r.data),

    // ── Team Actions ──────────────────────────────────────────────────────────

    createTeam: (body) =>
        axiosInstance.post("/Student/create-team", {
            projectTitle:       body.projectTitle,
            projectDescription: body.projectDescription ?? "",
            supervisorId:       body.supervisorId,
            studentIds:         body.studentIds ?? [],
        }).then((r) => r.data),

    sendInvitation: (studentId) =>
        axiosInstance.post("/Student/send-invitation", { studentId }).then((r) => r.data),

    requestToJoin: (teamId) =>
        axiosInstance.post("/Student/request-to-join", { teamId }).then((r) => r.data),

    respondToInvitation: (joinRequestId, isAccepted) =>
        axiosInstance.post("/Student/respond-to-invitation", { joinRequestId, isAccepted }).then((r) => r.data),

    respondToJoinRequest: (joinRequestId, isAccepted) =>
        axiosInstance.post("/Student/respond-to-join-request", { joinRequestId, isAccepted }).then((r) => r.data),

    rejectJoinRequest: (requestId) =>
        axiosInstance.post(`/Student/reject-join-request/${requestId}`).then((r) => r.data),

    requestLeave: () =>
        axiosInstance.post("/Student/request-leave").then((r) => r.data),

    updateProjectInfo: (body) =>
        axiosInstance.put("/Student/update-project-info", {
            projectTitle:       body.projectTitle ?? "",
            projectDescription: body.projectDescription ?? "",
        }).then((r) => r.data),

    deleteJoinRequest: (requestId) =>
        axiosInstance.delete(`/Student/delete-join-request/${requestId}`).then((r) => r.data),

    // ── User Profile ──────────────────────────────────────────────────────────

    getProfile: () =>
        axiosInstance.get("/UserProfile").then((r) => r.data),

    getProfileById: (userId) =>
        axiosInstance.get(`/UserProfile/${userId}`).then((r) => r.data),

    getAllStudents: () =>
        axiosInstance.get("/Student/all-students").then((r) => r.data),

    createProfile: (data) =>
        axiosInstance.post("/UserProfile", {
            phoneNumber:   data.phoneNumber   ?? "",
            fullName:      data.fullName      ?? "",
            department:    data.department    ?? "",
            gitHubLink:    data.github        ?? "",
            linkedinLink:  data.linkedin      ?? "",
            field:         encodeField(data.skills),   // ← encoded, ≤100 chars
            personalEmail: data.email         ?? "",
            bio:           data.bio           ?? "",
        }).then((r) => r.data),

    updateProfile: (data) =>
        axiosInstance.put("/UserProfile", {
            phoneNumber:          data.phoneNumber ?? "",
            fullName:             data.fullName    ?? "",
            department:           data.department  ?? "",
            gitHubLink:           data.github      ?? "",
            linkedinLink:         data.linkedin    ?? "",
            field:                encodeField(data.skills),   // ← encoded, ≤100 chars
            totalNumOfCreditCards: 0,
            personalEmail:        data.email       ?? "",
            bio:                  data.bio         ?? "",
        }).then((r) => r.data),

    // ── Appointments ──────────────────────────────────────────────────────────

    getSupervisorOfficeHours: () =>
        axiosInstance.get("/Student/supervisor-office-hours").then((r) => r.data),

    requestAppointment: (body) =>
        axiosInstance
            .post("/Student/request-appointment", { officeHourId: body.officeHourId })
            .then((r) => r.data),

    getMyAppointments: () =>
        axiosInstance.get("/Student/my-appointments").then((r) => r.data),

    updateAppointment: (body) =>
        axiosInstance
            .put("/Student/update-appointment", {
                appointmentId: body.appointmentId,
                officeHourId:  body.officeHourId,
                excuse:        body.excuse ?? "",
            })
            .then((r) => r.data),

    // ── Phase / Version Switching ─────────────────────────────────────────────

    switchVersion: () =>
        axiosInstance.post("/Student/switch-version").then((r) => r.data),

    getCurrentVersion: () =>
        axiosInstance.get("/Student/current-version").then((r) => r.data),
};

export default studentApi;