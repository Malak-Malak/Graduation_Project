// src/api/handler/endpoints/studentApi.js
//
// Backend keys:
//   fullName, phoneNumber, department, field, gitHubLink, linkedinLink, personalEmail
//
// Mapping:
//   department  →  academic major (Computer Science, Software Engineering…)
//   field       →  skills joined by comma  e.g. "Frontend,Backend,AI / ML"
//
// Endpoints:
//   GET  /api/Student/my-team
//   GET  /api/Student/supervisors
//   GET  /api/Student/available-students
//   GET  /api/Student/available-teams
//   GET  /api/Student/my-invitations
//   GET  /api/Student/my-join-requests        → requests the student sent to teams (⚠ pending backend)
//   GET  /api/Student/team-join-requests      → requests received by the student's team (leader only)
//   POST /api/Student/create-team
//   POST /api/Student/send-invitation
//   POST /api/Student/request-to-join
//   POST /api/Student/respond-to-invitation
//   POST /api/Student/respond-to-join-request
//   POST /api/Student/reject-join-request/{requestId}
//   POST /api/Student/request-leave
//   PUT  /api/Student/update-project-info
//   DELETE /api/Student/delete-join-request/{requestId}
//   GET  /api/Student/supervisor-office-hours  ← NEW (Get supervisor's available slots)
//   POST /api/Student/request-appointment      ← UPDATED { officeHourId, isOnline }
//   GET  /api/Student/my-appointments          ← existing
//   PUT  /api/Student/update-appointment       ← NEW { appointmentId, officeHourId, isOnline, excuse }
//   POST /api/Student/switch-version           ← NEW (Phase switching)
//   GET  /api/Student/current-version          ← NEW (Get current phase)

import axiosInstance from "./../../axiosInstance";

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
            projectTitle: body.projectTitle,
            projectDescription: body.projectDescription ?? "",
            supervisorId: body.supervisorId,
            studentIds: body.studentIds ?? [],
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
            projectTitle: body.projectTitle ?? "",
            projectDescription: body.projectDescription ?? "",
        }).then((r) => r.data),

    deleteJoinRequest: (requestId) =>
        axiosInstance.delete(`/Student/delete-join-request/${requestId}`).then((r) => r.data),

    // ── User Profile ──────────────────────────────────────────────────────────

    // getProfile: () =>
    //     axiosInstance.get("/UserProfile").then((r) => r.data),

    getAllStudents: () =>
        axiosInstance.get("/Student/all-students").then((r) => r.data),

    // createProfile: (data) =>
    //     axiosInstance.post("/UserProfile", {
    //         phoneNumber: data.phoneNumber ?? "",
    //         fullName: data.fullName ?? "",
    //         department: data.department ?? "",
    //         gitHubLink: data.github ?? "",
    //         linkedinLink: data.linkedin ?? "",
    //         field: (data.skills ?? []).join(","),
    //         personalEmail: data.email ?? "",
    //         bio: data.bio ?? "",
    //     }).then((r) => r.data),

    // updateProfile: (data) =>
    //     axiosInstance.put("/UserProfile", {
    //         phoneNumber: data.phoneNumber ?? "",
    //         fullName: data.fullName ?? "",
    //         department: data.department ?? "",
    //         gitHubLink: data.github ?? "",
    //         linkedinLink: data.linkedin ?? "",
    //         field: (data.skills ?? []).join(","),
    //         totalNumOfCreditCards: 0,
    //         personalEmail: data.email ?? "",
    //         bio: data.bio ?? "",
    //     }).then((r) => r.data),

    // ── Appointments ──────────────────────────────────────────────────────────
    /** GET /api/UserProfile — مرة وحدة بس، بعدها من الـ cache */
    getProfile: () => {
        if (_profileCache) return Promise.resolve(_profileCache);
        if (_profilePromise) return _profilePromise;
        _profilePromise = axiosInstance.get("/UserProfile")
            .then((r) => {
                _profileCache = r.data;
                _profilePromise = null;
                return _profileCache;
            })
            .catch((err) => {
                _profilePromise = null;
                throw err;
            });
        return _profilePromise;
    },

    /** يمسح الـ cache — نستدعيه بعد create أو update */
    invalidateCache: () => {
        _profileCache = null;
        _profilePromise = null;
    },

    getProfileById: (userId) =>
        axiosInstance.get(`/UserProfile/${userId}`).then((r) => r.data),

    createProfile: (data) =>
        axiosInstance.post("/UserProfile", {
            phoneNumber: data.phoneNumber ?? "",
            fullName: data.fullName ?? "",
            department: data.department ?? "",
            gitHubLink: data.github ?? "",
            linkedinLink: data.linkedin ?? "",
            field: (data.skills ?? []).join(","),
            personalEmail: data.email ?? "",
            bio: data.bio ?? "",
        }).then((r) => {
            UserProfileApi.invalidateCache();
            return r.data;
        }),

    updateProfile: (data) =>
        axiosInstance.put("/UserProfile", {
            phoneNumber: data.phoneNumber ?? "",
            fullName: data.fullName ?? "",
            department: data.department ?? "",
            gitHubLink: data.github ?? "",
            linkedinLink: data.linkedin ?? "",
            field: (data.skills ?? []).join(","),
            totalNumOfCreditCards: 0,
            personalEmail: data.email ?? "",
            bio: data.bio ?? "",
        }).then((r) => {
            UserProfileApi.invalidateCache();
            return r.data;
        }),
    /**
     * GET /api/Student/supervisor-office-hours
     * Returns the supervisor's available office hour slots.
     *
     * Expected response shape per item:
     * {
     *   officeHourId : number,
     *   dayOfWeek    : string,   // e.g. "Monday"
     *   startTime    : string,   // e.g. "09:00"
     *   endTime      : string,   // e.g. "11:00"
     * }
     */
    getSupervisorOfficeHours: () =>
        axiosInstance.get("/Student/supervisor-office-hours").then((r) => r.data),

    /**
     * POST /api/Student/request-appointment
     * Student requests an appointment based on a specific office hour slot.
     *
     * @param {{ officeHourId: number, isOnline: boolean }} body
     */
    requestAppointment: (body) =>
        axiosInstance
            .post("/Student/request-appointment", {
                officeHourId: body.officeHourId,
                isOnline: body.isOnline ?? false,
            })
            .then((r) => r.data),

    /**
     * GET /api/Student/my-appointments
     * Returns all appointments for the logged-in student.
     *
     * Expected response shape per item:
     * {
     *   appointmentId  : number,
     *   dateTime?      : string (ISO),
     *   dayOfWeek?     : string,
     *   startTime?     : string,
     *   endTime?       : string,
     *   isOnline       : boolean,
     *   status         : "Pending" | "Approved" | "Rejected",
     *   link?          : string,
     *   supervisorName : string,
     * }
     */
    getMyAppointments: () =>
        axiosInstance.get("/Student/my-appointments").then((r) => r.data),

    /**
     * PUT /api/Student/update-appointment
     * Student updates a pending appointment (reschedule or change mode).
     *
     * @param {{ appointmentId: number, officeHourId: number, isOnline: boolean, excuse: string }} body
     */
    updateAppointment: (body) =>
        axiosInstance
            .put("/Student/update-appointment", {
                appointmentId: body.appointmentId,
                officeHourId: body.officeHourId,
                isOnline: body.isOnline ?? false,
                excuse: body.excuse ?? "",
            })
            .then((r) => r.data),

    // ── Phase / Version Switching ─────────────────────────────────────────────

    switchVersion: () =>
        axiosInstance.post("/Student/switch-version").then((r) => r.data),

    getCurrentVersion: () =>
        axiosInstance.get("/Student/current-version").then((r) => r.data),
};

export default studentApi;