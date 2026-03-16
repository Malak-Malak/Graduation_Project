import axiosInstance from "./../../axiosInstance";

const studentApi = {

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

    createTeam: (body) =>
        axiosInstance.post("/Student/create-team", body).then((r) => r.data),

    sendInvitation: (studentId) =>
        axiosInstance.post("/Student/send-invitation", { studentId }).then((r) => r.data),

    requestToJoin: (teamId) =>
        axiosInstance.post("/Student/request-to-join", { teamId }).then((r) => r.data),

    respondToInvitation: (joinRequestId, isAccepted) =>
        axiosInstance.post("/Student/respond-to-invitation", { joinRequestId, isAccepted }).then((r) => r.data),

    respondToJoinRequest: (joinRequestId, isAccepted) =>
        axiosInstance.post("/Student/respond-to-join-request", { joinRequestId, isAccepted }).then((r) => r.data),

    requestLeave: () =>
        axiosInstance.post("/Student/request-leave").then((r) => r.data),

};

export default studentApi;