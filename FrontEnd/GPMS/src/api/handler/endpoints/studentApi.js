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

const LABEL_TO_CODE = Object.fromEntries(
    Object.entries(SUPERVISOR_AREA_MAP).map(([k, v]) => [v, k])
);

// ── Department → Student Skill Suggestions ────────────────────────────────────
// Keyed by the exact department strings the backend returns.
// Falls back to FALLBACK_STUDENT_SKILLS if no match found.
export const DEPARTMENT_SKILL_MAP = {
    "Computer System Engineering": [
        "Frontend", "Backend", "AI / ML", "Data Analysis",
        "UI/UX", "DevOps", "Mobile", "Security",
        "Database", "Testing / QA", "Embedded", "Networks",
    ],
    "Computer Engineering": [
        "Frontend", "Backend", "AI / ML", "Data Analysis",
        "UI/UX", "DevOps", "Mobile", "Security",
        "Database", "Testing / QA", "Embedded", "Networks",
    ],
    "Electrical Engineering": [
        "Embedded", "Networks", "Signal Processing",
        "Control Systems", "FPGA / VHDL", "PCB Design",
        "Power Electronics", "Microcontrollers", "Automation",
    ],
    "Mechanical Engineering": [
        "CAD / Simulation", "Finite Element Analysis", "3D Printing",
        "Robotics", "Thermodynamics", "Manufacturing",
        "Automation", "Control Systems", "Fluid Mechanics",
    ],
    "Mechatronics Engineering": [
        "Embedded", "Robotics", "Control Systems",
        "Automation", "Microcontrollers", "FPGA / VHDL",
        "CAD / Simulation", "Networks", "Signal Processing",
        "Machine Learning",
    ],
    "Telecommunications Engineering": [
        "Networks", "Signal Processing", "Wireless Communications",
        "Antenna Design", "Embedded", "FPGA / VHDL",
        "Cybersecurity", "Protocols", "RF Engineering",
    ],
    "Power & Energy Engineering": [
        "Power Electronics", "Renewable Energy", "Smart Grid",
        "Control Systems", "Electrical Machines", "CAD / Simulation",
        "Automation", "Energy Storage", "Power Systems",
    ],
};

// Generic fallback if the backend returns an unexpected department
export const FALLBACK_STUDENT_SKILLS = [
    "Frontend", "Backend", "AI / ML", "Data Analysis",
    "UI/UX", "DevOps", "Mobile", "Security",
    "Database", "Testing / QA", "Embedded", "Networks",
];

/**
 * Returns the suggested skills array for a given department string.
 * Safe to call with null / undefined — returns fallback.
 */
export function getSkillsForDepartment(department) {
    if (!department) return FALLBACK_STUDENT_SKILLS;
    return DEPARTMENT_SKILL_MAP[department] ?? FALLBACK_STUDENT_SKILLS;
}

// ─────────────────────────────────────────────────────────────────────────────

function encodeField(skills = []) {
    const encoded = skills
        .map((s) => LABEL_TO_CODE[s] ?? s)
        .join(",");
    return encoded.slice(0, 100);
}

export function decodeField(field = "") {
    if (!field) return [];
    return field
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => SUPERVISOR_AREA_MAP[s] ?? s);
}

// ─────────────────────────────────────────────────────────────────────────────

const studentApi = {

    // ── University Info ───────────────────────────────────────────────────────

    /**
     * Returns { username, universityEmail, department }
     * Call once on mount; the department field drives skill suggestions.
     */
    getUniversityInfo: () =>
        axiosInstance.get("/User/my-university-info").then((r) => r.data),

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
            field:         encodeField(data.skills),
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
            field:                encodeField(data.skills),
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