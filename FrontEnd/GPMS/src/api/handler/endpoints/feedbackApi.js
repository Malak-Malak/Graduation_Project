// src/api/handler/endpoints/feedbackApi.js
//
// Correct endpoints (from Swagger):
//   GET    /api/Feedback/file/{fileId}          ← feedback for a specific file
//   POST   /api/Feedback/create                 ← { content, teamId, taskItemId, projectFileId }
//   POST   /api/Feedback/reply                  ← { content, parentFeedbackId }
//   PUT    /api/Feedback/edit/{feedbackId}       ← { content }
//   PUT    /api/Feedback/edit-reply/{replyId}    ← { content }
//   DELETE /api/Feedback/delete/{feedbackId}
//   DELETE /api/Feedback/delete-reply/{replyId}
//
// Mapped shapes used in UI:
//   MappedFeedback: { feedbackId, content, createdAt, authorName, authorRole, taskItemId, projectFileId, replies[] }
//   MappedReply:    { replyId, content, createdAt, authorName, authorRole }

import axiosInstance from "../../axiosInstance";

// ── field mappers ─────────────────────────────────────────────────────────────

const mapReply = (rep) => ({
    replyId: rep.id ?? rep.replyId ?? null,
    content: rep.content ?? "",
    createdAt: rep.createdAt ?? null,
    authorName: rep.senderName ?? rep.authorName ?? "",
    authorRole: rep.senderRole ?? rep.authorRole ?? "",
});

const mapFeedback = (fb) => ({
    feedbackId: fb.id ?? fb.feedbackId ?? null,
    content: fb.content ?? "",
    createdAt: fb.createdAt ?? null,
    authorName: fb.senderName ?? fb.authorName ?? "",
    authorRole: fb.senderRole ?? fb.authorRole ?? "",
    taskItemId: fb.taskItemId ?? null,
    projectFileId: fb.projectFileId ?? null,
    replies: Array.isArray(fb.replies) ? fb.replies.map(mapReply) : [],
});

// ─────────────────────────────────────────────────────────────────────────────

const feedbackApi = {

    // ── READ ──────────────────────────────────────────────────────────────────

    /**
     * GET /api/Feedback/file/{fileId}
     * Returns all feedback for a specific file (with nested replies).
     * Call this once per file card to get feedback + student replies.
     * @param {number} fileId  ← file.id
     * @returns {Promise<MappedFeedback[]>}
     */
    getFeedbackByFile: (fileId) =>
        axiosInstance
            .get(`/Feedback/file/${fileId}`)
            .then((r) => (Array.isArray(r.data) ? r.data : []).map(mapFeedback)),

    // ── CREATE ────────────────────────────────────────────────────────────────

    /**
     * POST /api/Feedback/create
     * Supervisor creates feedback on a student file.
     * taskItemId = file.id
     * @param {{ content: string, teamId: number, taskItemId: number, projectFileId?: number }} body
     */
    createFeedback: (body) =>
        axiosInstance
            .post("/Feedback/create", {
                content: body.content ?? "",
                teamId: body.teamId,
                taskItemId: body.taskItemId ?? 0,
                projectFileId: body.projectFileId ?? 0,
            })
            .then((r) => r.data),

    /**
     * POST /api/Feedback/reply
     * Student replies to a feedback thread.
     * @param {{ content: string, parentFeedbackId: number }} body
     */
    replyToFeedback: (body) =>
        axiosInstance
            .post("/Feedback/reply", {
                content: body.content ?? "",
                parentFeedbackId: body.parentFeedbackId,
            })
            .then((r) => r.data),

    // ── UPDATE ────────────────────────────────────────────────────────────────

    /**
     * PUT /api/Feedback/edit/{feedbackId}
     * @param {number} feedbackId
     * @param {string} content
     */
    editFeedback: (feedbackId, content) =>
        axiosInstance
            .put(`/Feedback/edit/${feedbackId}`, { content })
            .then((r) => r.data),

    /**
     * PUT /api/Feedback/edit-reply/{replyId}
     * @param {number} replyId
     * @param {string} content
     */
    editReply: (replyId, content) =>
        axiosInstance
            .put(`/Feedback/edit-reply/${replyId}`, { content })
            .then((r) => r.data),

    // ── DELETE ────────────────────────────────────────────────────────────────

    /**
     * DELETE /api/Feedback/delete/{feedbackId}
     * @param {number} feedbackId
     */
    deleteFeedback: (feedbackId) =>
        axiosInstance
            .delete(`/Feedback/delete/${feedbackId}`)
            .then((r) => r.data),

    /**
     * DELETE /api/Feedback/delete-reply/{replyId}
     * @param {number} replyId
     */
    deleteReply: (replyId) =>
        axiosInstance
            .delete(`/Feedback/delete-reply/${replyId}`)
            .then((r) => r.data),
};

export default feedbackApi;