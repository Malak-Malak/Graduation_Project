// src/api/handler/endpoints/feedbackApi.js
//
// Endpoints:
//   GET    /api/Feedback/team/{teamId}
//   POST   /api/Feedback/create
//   POST   /api/Feedback/reply
//   PUT    /api/Feedback/edit/{feedbackId}
//   PUT    /api/Feedback/edit-reply/{replyId}
//   DELETE /api/Feedback/delete/{feedbackId}
//   DELETE /api/Feedback/delete-reply/{replyId}

import axiosInstance from "../../axiosInstance";

const feedbackApi = {
    /**
     * GET /api/Feedback/team/{teamId}
     * Expected shape per item:
     * {
     *   feedbackId, content, teamId, taskItemId?,
     *   authorName, authorId, createdAt,
     *   replies: [{ replyId, content, authorName, authorId, createdAt }]
     * }
     */
    getFeedbackByTeam: (teamId) =>
        axiosInstance.get(`/Feedback/team/${teamId}`).then((r) => {
            const data = Array.isArray(r.data) ? r.data : [];
            return data.map((fb) => ({
                feedbackId: fb.id,
                content: fb.content,
                createdAt: fb.createdAt,
                authorName: fb.senderName,      // ✅ map
                authorRole: fb.senderRole,
                taskItemId: fb.taskItemId,
                replies: (fb.replies ?? []).map((rep) => ({
                    replyId: rep.id,            // ✅ map
                    content: rep.content,
                    createdAt: rep.createdAt,
                    authorName: rep.senderName, // ✅ map
                    authorRole: rep.senderRole,
                })),
            }));
        }),

    /** POST /api/Feedback/create
     * @param {{ content: string, teamId: number, taskItemId: number }} body
     */
    createFeedback: (body) =>
        axiosInstance.post("/Feedback/create", {
            content: body.content ?? "",
            teamId: body.teamId ?? 0,
            taskItemId: body.taskItemId ?? 0,
        }).then((r) => r.data),

    /** POST /api/Feedback/reply
     * @param {{ content: string, parentFeedbackId: number }} body
     */
    replyToFeedback: (body) =>
        axiosInstance.post("/Feedback/reply", {
            content: body.content ?? "",
            parentFeedbackId: body.parentFeedbackId ?? 0,
        }).then((r) => r.data),

    /** PUT /api/Feedback/edit/{feedbackId} */
    editFeedback: (feedbackId, content) =>
        axiosInstance.put(`/Feedback/edit/${feedbackId}`, { content }).then((r) => r.data),

    /** PUT /api/Feedback/edit-reply/{replyId} */
    editReply: (replyId, content) =>
        axiosInstance.put(`/Feedback/edit-reply/${replyId}`, { content }).then((r) => r.data),

    /** DELETE /api/Feedback/delete/{feedbackId} */
    deleteFeedback: (feedbackId) =>
        axiosInstance.delete(`/Feedback/delete/${feedbackId}`).then((r) => r.data),

    /** DELETE /api/Feedback/delete-reply/{replyId} */
    deleteReply: (replyId) =>
        axiosInstance.delete(`/Feedback/delete-reply/${replyId}`).then((r) => r.data),
};

export default feedbackApi;