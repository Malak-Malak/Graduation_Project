// src/components/common/student/Feedback/Feedback.jsx

import { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Stack, Paper, Button, IconButton, Tooltip,
    CircularProgress, Alert, TextField, Avatar, Collapse, Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";

import feedbackApi from "../../../../api/handler/endpoints/feedbackApi";
import { useAuth } from "../../../../contexts/AuthContext";

// ── helpers ───────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        + " · "
        + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

const getInitials = (name = "") =>
    name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

// ── small sub-components ──────────────────────────────────────────────────────

function AuthorAvatar({ name, color }) {
    return (
        <Avatar sx={{ width: 34, height: 34, bgcolor: color, fontSize: "0.78rem", fontWeight: 700 }}>
            {getInitials(name)}
        </Avatar>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Feedback() {
    const theme = useTheme();
    const t = theme.palette.custom;
    const { user } = useAuth();

    const teamId = user?.teamId ?? null;
    const currentUserId = user?.id ?? user?.userId ?? null;

    // ── state ─────────────────────────────────────────────────────────────────
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // new feedback form
    const [newContent, setNewContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // inline edit  → { type: "feedback"|"reply", id, content }
    const [editing, setEditing] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [editSaving, setEditSaving] = useState(false);

    // reply box   → feedbackId | null
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    const [replySaving, setReplySaving] = useState(false);

    // ── fetch ─────────────────────────────────────────────────────────────────
    const fetchFeedbacks = useCallback(async () => {
        if (!teamId) { setLoading(false); return; }
        try {
            setLoading(true);
            setError(null);
            const data = await feedbackApi.getFeedbackByTeam(teamId);
            setFeedbacks(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.response?.data?.message ?? err?.message ?? "Failed to load feedback.");
        } finally {
            setLoading(false);
        }
    }, [teamId]);

    useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);

    // ── submit new feedback ───────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!newContent.trim()) return;
        setSubmitting(true);
        setSubmitError("");
        try {
            await feedbackApi.createFeedback({
                content: newContent.trim(),
                teamId: Number(teamId),
                taskItemId: 0,
            });
            setNewContent("");
            await fetchFeedbacks();
        } catch (err) {
            setSubmitError(err?.response?.data?.message ?? "Failed to post feedback.");
        } finally {
            setSubmitting(false);
        }
    };

    // ── delete feedback ───────────────────────────────────────────────────────
    const handleDeleteFeedback = async (feedbackId) => {
        setFeedbacks((prev) => prev.filter((f) => f.feedbackId !== feedbackId));
        try {
            await feedbackApi.deleteFeedback(feedbackId);
        } catch {
            await fetchFeedbacks();
        }
    };

    // ── delete reply ──────────────────────────────────────────────────────────
    const handleDeleteReply = async (feedbackId, replyId) => {
        setFeedbacks((prev) => prev.map((f) =>
            f.feedbackId !== feedbackId ? f
                : { ...f, replies: (f.replies ?? []).filter((r) => r.replyId !== replyId) }
        ));
        try {
            await feedbackApi.deleteReply(replyId);
        } catch {
            await fetchFeedbacks();
        }
    };

    // ── start edit ────────────────────────────────────────────────────────────
    const startEdit = (type, id, content) => {
        setEditing({ type, id });
        setEditContent(content);
    };
    const cancelEdit = () => { setEditing(null); setEditContent(""); };

    // ── save edit ─────────────────────────────────────────────────────────────
    const handleSaveEdit = async () => {
        if (!editContent.trim() || !editing) return;
        setEditSaving(true);
        try {
            if (editing.type === "feedback") {
                await feedbackApi.editFeedback(editing.id, editContent.trim());
            } else {
                await feedbackApi.editReply(editing.id, editContent.trim());
            }
            await fetchFeedbacks();
            cancelEdit();
        } catch {
            // keep edit open on error
        } finally {
            setEditSaving(false);
        }
    };

    // ── reply ─────────────────────────────────────────────────────────────────
    const openReply = (feedbackId) => {
        setReplyingTo(feedbackId);
        setReplyContent("");
    };
    const cancelReply = () => { setReplyingTo(null); setReplyContent(""); };

    const handleSubmitReply = async (feedbackId) => {
        if (!replyContent.trim()) return;
        setReplySaving(true);
        try {
            await feedbackApi.replyToFeedback({
                content: replyContent.trim(),
                parentFeedbackId: feedbackId,
            });
            setReplyContent("");
            setReplyingTo(null);
            await fetchFeedbacks();
        } catch {
            // keep reply box open on error
        } finally {
            setReplySaving(false);
        }
    };

    // ── avatar colors ─────────────────────────────────────────────────────────
    const COLORS = ["#C47E7E", "#C49A6C", "#7E9FC4", "#6D8A7D", "#9E86C4", "#C47EA8"];
    const colorFor = (name = "") => COLORS[name.charCodeAt(0) % COLORS.length];

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <Box sx={{ maxWidth: 860 }}>

            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                    <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>Feedback</Typography>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                        {feedbacks.length} thread{feedbacks.length !== 1 ? "s" : ""}
                    </Typography>
                </Box>
            </Stack>

            {/* No team warning */}
            {!teamId && (
                <Alert severity="warning" sx={{ borderRadius: 2, mb: 3 }}>
                    You need to be part of a team to view or post feedback.
                </Alert>
            )}

            {/* New feedback box */}
            {teamId && (
                <Paper elevation={0} sx={{
                    p: 2.5, mb: 3, borderRadius: 3,
                    bgcolor: t.surfaceHover,
                    border: `1px solid ${t.borderLight}`,
                }}>
                    <Stack direction="row" gap={1.5} alignItems="flex-start">
                        <AuthorAvatar name={user?.name ?? "Me"} color={t.accentPrimary} />
                        <Box sx={{ flex: 1 }}>
                            <TextField
                                fullWidth
                                multiline
                                minRows={2}
                                placeholder="Write feedback or a note for your team…"
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && e.ctrlKey) handleSubmit();
                                }}
                                sx={{ mb: 1 }}
                            />
                            {submitError && (
                                <Alert severity="error" sx={{ mb: 1, borderRadius: 2, fontSize: "0.8rem" }}>
                                    {submitError}
                                </Alert>
                            )}
                            <Stack direction="row" justifyContent="flex-end">
                                <Button
                                    variant="contained"
                                    size="small"
                                    endIcon={submitting
                                        ? <CircularProgress size={13} color="inherit" />
                                        : <SendOutlinedIcon sx={{ fontSize: 15 }} />}
                                    onClick={handleSubmit}
                                    disabled={submitting || !newContent.trim()}
                                    sx={{ bgcolor: t.accentPrimary, borderRadius: 2, fontSize: "0.8rem" }}
                                >
                                    {submitting ? "Posting…" : "Post"}
                                </Button>
                            </Stack>
                        </Box>
                    </Stack>
                </Paper>
            )}

            {/* Loading */}
            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress sx={{ color: t.accentPrimary }} />
                </Box>
            )}

            {/* Error */}
            {!loading && error && (
                <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>{error}</Alert>
            )}

            {/* Empty */}
            {!loading && !error && feedbacks.length === 0 && teamId && (
                <Box sx={{ textAlign: "center", py: 8 }}>
                    <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 48, color: t.textTertiary, mb: 1.5 }} />
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem", mb: 0.5 }}>
                        No feedback yet.
                    </Typography>
                    <Typography sx={{ color: t.textTertiary, fontSize: "0.8rem" }}>
                        Be the first to post a note or feedback above.
                    </Typography>
                </Box>
            )}

            {/* Feedback threads */}
            {!loading && !error && feedbacks.length > 0 && (
                <Stack spacing={2}>
                    {feedbacks.map((fb) => {
                        const isEditingThis = editing?.type === "feedback" && editing?.id === fb.feedbackId;
                        const isOwner = String(fb.authorId) === String(currentUserId);

                        return (
                            <Paper key={fb.feedbackId} elevation={1} sx={{
                                borderRadius: 3,
                                bgcolor: theme.palette.background.paper,
                                overflow: "hidden",
                            }}>
                                {/* Feedback header */}
                                <Box sx={{ p: 2.5 }}>
                                    <Stack direction="row" gap={1.5} alignItems="flex-start">
                                        <AuthorAvatar name={fb.authorName} color={colorFor(fb.authorName)} />
                                        <Box sx={{ flex: 1 }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                                                <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: t.textPrimary }}>
                                                    {fb.authorName}
                                                </Typography>
                                                <Stack direction="row" alignItems="center" gap={0.3}>
                                                    <Typography sx={{ fontSize: "0.7rem", color: t.textTertiary, mr: 0.5 }}>
                                                        {formatDate(fb.createdAt)}
                                                    </Typography>
                                                    {isOwner && !isEditingThis && (
                                                        <>
                                                            <Tooltip title="Edit">
                                                                <IconButton size="small"
                                                                    onClick={() => startEdit("feedback", fb.feedbackId, fb.content)}
                                                                    sx={{ color: t.textTertiary, "&:hover": { color: t.accentPrimary } }}>
                                                                    <EditOutlinedIcon sx={{ fontSize: 15 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete">
                                                                <IconButton size="small"
                                                                    onClick={() => handleDeleteFeedback(fb.feedbackId)}
                                                                    sx={{ color: t.textTertiary, "&:hover": { color: t.error } }}>
                                                                    <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                </Stack>
                                            </Stack>

                                            {/* Content or edit field */}
                                            {isEditingThis ? (
                                                <Stack gap={1}>
                                                    <TextField
                                                        fullWidth multiline minRows={2}
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        size="small"
                                                    />
                                                    <Stack direction="row" gap={1}>
                                                        <Button size="small" variant="contained"
                                                            startIcon={editSaving
                                                                ? <CircularProgress size={12} color="inherit" />
                                                                : <CheckOutlinedIcon sx={{ fontSize: 14 }} />}
                                                            onClick={handleSaveEdit}
                                                            disabled={editSaving || !editContent.trim()}
                                                            sx={{ bgcolor: t.accentPrimary, borderRadius: 2, fontSize: "0.75rem" }}>
                                                            {editSaving ? "Saving…" : "Save"}
                                                        </Button>
                                                        <Button size="small" onClick={cancelEdit}
                                                            startIcon={<CloseOutlinedIcon sx={{ fontSize: 14 }} />}
                                                            sx={{ color: t.textSecondary, fontSize: "0.75rem" }}>
                                                            Cancel
                                                        </Button>
                                                    </Stack>
                                                </Stack>
                                            ) : (
                                                <Typography sx={{ fontSize: "0.875rem", color: t.textSecondary, lineHeight: 1.6 }}>
                                                    {fb.content}
                                                </Typography>
                                            )}

                                            {/* Reply button */}
                                            {!isEditingThis && (
                                                <Button
                                                    size="small"
                                                    startIcon={<ReplyOutlinedIcon sx={{ fontSize: 14 }} />}
                                                    onClick={() => replyingTo === fb.feedbackId ? cancelReply() : openReply(fb.feedbackId)}
                                                    sx={{
                                                        mt: 0.5, color: t.textTertiary, fontSize: "0.75rem",
                                                        "&:hover": { color: t.accentPrimary }
                                                    }}
                                                >
                                                    {replyingTo === fb.feedbackId ? "Cancel" : `Reply${fb.replies?.length ? ` (${fb.replies.length})` : ""}`}
                                                </Button>
                                            )}
                                        </Box>
                                    </Stack>
                                </Box>

                                {/* Replies */}
                                {(fb.replies?.length > 0 || replyingTo === fb.feedbackId) && (
                                    <>
                                        <Divider sx={{ borderColor: t.borderLight }} />
                                        <Box sx={{ bgcolor: `${t.surfaceHover}80`, px: 2.5, py: 1.5 }}>
                                            <Stack spacing={1.5}>
                                                {(fb.replies ?? []).map((reply) => {
                                                    const isEditingReply = editing?.type === "reply" && editing?.id === reply.replyId;
                                                    const isReplyOwner = String(reply.authorId) === String(currentUserId);
                                                    return (
                                                        <Stack key={reply.replyId} direction="row" gap={1.2} alignItems="flex-start">
                                                            <AuthorAvatar name={reply.authorName} color={colorFor(reply.authorName)} />
                                                            <Box sx={{ flex: 1 }}>
                                                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.3}>
                                                                    <Typography sx={{ fontWeight: 600, fontSize: "0.8rem", color: t.textPrimary }}>
                                                                        {reply.authorName}
                                                                    </Typography>
                                                                    <Stack direction="row" alignItems="center" gap={0.3}>
                                                                        <Typography sx={{ fontSize: "0.68rem", color: t.textTertiary, mr: 0.3 }}>
                                                                            {formatDate(reply.createdAt)}
                                                                        </Typography>
                                                                        {isReplyOwner && !isEditingReply && (
                                                                            <>
                                                                                <Tooltip title="Edit">
                                                                                    <IconButton size="small"
                                                                                        onClick={() => startEdit("reply", reply.replyId, reply.content)}
                                                                                        sx={{ color: t.textTertiary, "&:hover": { color: t.accentPrimary } }}>
                                                                                        <EditOutlinedIcon sx={{ fontSize: 13 }} />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                                <Tooltip title="Delete">
                                                                                    <IconButton size="small"
                                                                                        onClick={() => handleDeleteReply(fb.feedbackId, reply.replyId)}
                                                                                        sx={{ color: t.textTertiary, "&:hover": { color: t.error } }}>
                                                                                        <DeleteOutlineIcon sx={{ fontSize: 13 }} />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                            </>
                                                                        )}
                                                                    </Stack>
                                                                </Stack>
                                                                {isEditingReply ? (
                                                                    <Stack gap={1}>
                                                                        <TextField fullWidth multiline minRows={1}
                                                                            value={editContent}
                                                                            onChange={(e) => setEditContent(e.target.value)}
                                                                            size="small" />
                                                                        <Stack direction="row" gap={1}>
                                                                            <Button size="small" variant="contained"
                                                                                startIcon={editSaving
                                                                                    ? <CircularProgress size={11} color="inherit" />
                                                                                    : <CheckOutlinedIcon sx={{ fontSize: 13 }} />}
                                                                                onClick={handleSaveEdit}
                                                                                disabled={editSaving || !editContent.trim()}
                                                                                sx={{ bgcolor: t.accentPrimary, borderRadius: 2, fontSize: "0.72rem" }}>
                                                                                {editSaving ? "Saving…" : "Save"}
                                                                            </Button>
                                                                            <Button size="small" onClick={cancelEdit}
                                                                                sx={{ color: t.textSecondary, fontSize: "0.72rem" }}>
                                                                                Cancel
                                                                            </Button>
                                                                        </Stack>
                                                                    </Stack>
                                                                ) : (
                                                                    <Typography sx={{ fontSize: "0.82rem", color: t.textSecondary, lineHeight: 1.5 }}>
                                                                        {reply.content}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Stack>
                                                    );
                                                })}

                                                {/* Reply input */}
                                                <Collapse in={replyingTo === fb.feedbackId}>
                                                    <Stack direction="row" gap={1.2} alignItems="flex-start" pt={0.5}>
                                                        <AuthorAvatar name={user?.name ?? "Me"} color={t.accentPrimary} />
                                                        <Box sx={{ flex: 1 }}>
                                                            <TextField
                                                                fullWidth multiline minRows={1}
                                                                placeholder="Write a reply…"
                                                                value={replyContent}
                                                                onChange={(e) => setReplyContent(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter" && e.ctrlKey) handleSubmitReply(fb.feedbackId);
                                                                }}
                                                                size="small"
                                                                sx={{ mb: 1 }}
                                                            />
                                                            <Stack direction="row" gap={1}>
                                                                <Button size="small" variant="contained"
                                                                    endIcon={replySaving
                                                                        ? <CircularProgress size={11} color="inherit" />
                                                                        : <SendOutlinedIcon sx={{ fontSize: 13 }} />}
                                                                    onClick={() => handleSubmitReply(fb.feedbackId)}
                                                                    disabled={replySaving || !replyContent.trim()}
                                                                    sx={{ bgcolor: t.accentPrimary, borderRadius: 2, fontSize: "0.75rem" }}>
                                                                    {replySaving ? "Sending…" : "Reply"}
                                                                </Button>
                                                                <Button size="small" onClick={cancelReply}
                                                                    sx={{ color: t.textSecondary, fontSize: "0.75rem" }}>
                                                                    Cancel
                                                                </Button>
                                                            </Stack>
                                                        </Box>
                                                    </Stack>
                                                </Collapse>
                                            </Stack>
                                        </Box>
                                    </>
                                )}
                            </Paper>
                        );
                    })}
                </Stack>
            )}
        </Box>
    );
}