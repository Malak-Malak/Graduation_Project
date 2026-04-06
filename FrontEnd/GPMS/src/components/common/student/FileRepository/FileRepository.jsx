// src/components/common/student/FileRepository/FileRepository.jsx
//
// Two tabs:
//   Tab 0 "My Files"         — student's own files: add / edit / delete (owner only)
//   Tab 1 "Supervisor Files" — supervisor's files: read-only list
//
// API:
//   GET  /api/FileSystem/student-files
//   GET  /api/FileSystem/supervisor-files
//   GET  /api/Feedback/team/{teamId}
//   POST /api/FileSystem/add              → { filePath, description }
//   PUT  /api/FileSystem/edit/{id}
//   DELETE /api/FileSystem/delete/{id}
//   POST /api/Feedback/reply              → { content, parentFeedbackId }
//   PUT  /api/Feedback/edit-reply/{id}    → { content }
//   DELETE /api/Feedback/delete-reply/{id}
//
// Backend FeedbackDto shape (after mapping in feedbackApi.js):
//   { feedbackId, content, createdAt, authorName, authorRole, taskItemId,
//     replies: [{ replyId, content, createdAt, authorName, authorRole }] }

import { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Stack, Paper, Button, IconButton, Tooltip,
    CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, InputAdornment, Avatar, Divider,
    Collapse, Tabs, Tab, Badge, Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import AddLinkOutlinedIcon from "@mui/icons-material/AddLinkOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import SupervisorAccountOutlinedIcon from "@mui/icons-material/SupervisorAccountOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";

import fileSystemApi from "../../../../api/handler/endpoints/fileSystemApi";
import feedbackApi from "../../../../api/handler/endpoints/feedbackApi";
import { useAuth } from "../../../../contexts/AuthContext";

// ── helpers ───────────────────────────────────────────────────────────────────

const getFileType = (filePath = "") => {
    const l = filePath.toLowerCase();
    if (l.includes("drive.google") || l.includes("docs.google")) return "gdrive";
    if (l.includes("github.com")) return "github";
    if (l.includes("onedrive") || l.includes("sharepoint")) return "onedrive";
    return "link";
};

const TYPE_META = {
    gdrive: { color: "#4285F4", icon: <CloudOutlinedIcon /> },
    github: { color: "#6D8A7D", icon: <InsertDriveFileOutlinedIcon /> },
    onedrive: { color: "#0078D4", icon: <CloudOutlinedIcon /> },
    link: { color: "#9E9E9E", icon: <LinkOutlinedIcon /> },
};

const getDisplayName = (filePath = "", description = "") => {
    if (description?.trim()) return description.trim();
    try {
        const url = new URL(filePath);
        return url.hostname + (url.pathname.length > 1 ? url.pathname.slice(0, 36) + "…" : "");
    } catch { return filePath.slice(0, 50) || "Untitled link"; }
};

const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const getInitials = (name = "") =>
    name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

const PALETTE = ["#C47E7E", "#C49A6C", "#7E9FC4", "#6D8A7D", "#9E86C4"];
const colorFor = (name = "") => PALETTE[(name.charCodeAt(0) ?? 0) % PALETTE.length];

const EMPTY_FORM = { filePath: "", description: "" };

function TabPanel({ children, value, index }) {
    return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function FileRepository() {
    const theme = useTheme();
    const t = theme.palette.custom;
    const { user } = useAuth();

    const teamId = user?.teamId ?? null;
    const currentUserId = String(user?.id ?? user?.userId ?? "");

    const [activeTab, setActiveTab] = useState(0);

    // student files
    const [myFiles, setMyFiles] = useState([]);
    const [myLoading, setMyLoading] = useState(true);
    const [myError, setMyError] = useState(null);
    const [deleteError, setDeleteError] = useState(null);

    // supervisor files (read-only)
    const [supFiles, setSupFiles] = useState([]);
    const [supLoading, setSupLoading] = useState(true);
    const [supError, setSupError] = useState(null);

    // feedback — keyed by file.id (taskItemId from backend)
    const [feedbackMap, setFeedbackMap] = useState({});

    // add/edit dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    // reply
    const [replyOpen, setReplyOpen] = useState({});
    const [replyContent, setReplyContent] = useState({});
    const [replySaving, setReplySaving] = useState({});

    // edit reply — stores { replyId, content }
    const [editingReply, setEditingReply] = useState(null);
    const [editReplySave, setEditReplySave] = useState(false);

    // ── fetch ─────────────────────────────────────────────────────────────────

    const fetchMyFiles = useCallback(async () => {
        setMyLoading(true); setMyError(null);
        try {
            const data = await fileSystemApi.getStudentFiles();
            setMyFiles(Array.isArray(data) ? data : []);
        } catch (err) {
            setMyError(err?.response?.data?.message ?? err?.message ?? "Failed to load your files.");
        } finally { setMyLoading(false); }
    }, []);

    const fetchFeedback = useCallback(async () => {
        if (!teamId) return;
        try {
            // feedbackApi.getFeedbackByTeam already maps:
            //   id → feedbackId, senderName → authorName, senderRole → authorRole
            //   replies: id → replyId, senderName → authorName, senderRole → authorRole
            const fbData = await feedbackApi.getFeedbackByTeam(Number(teamId));
            const map = {};
            (Array.isArray(fbData) ? fbData : []).forEach((fb) => {
                const key = fb.taskItemId; // matches file.id
                if (key == null) return;
                if (!map[key]) map[key] = [];
                map[key].push(fb);
            });
            setFeedbackMap(map);
        } catch { /* silent */ }
    }, [teamId]);

    const fetchSupFiles = useCallback(async () => {
        setSupLoading(true); setSupError(null);
        try {
            const data = await fileSystemApi.getSupervisorFiles();
            setSupFiles(Array.isArray(data) ? data : []);
        } catch (err) {
            setSupError(err?.response?.data?.message ?? err?.message ?? "Failed to load supervisor files.");
        } finally { setSupLoading(false); }
    }, []);

    useEffect(() => {
        fetchMyFiles();
        fetchFeedback();
        fetchSupFiles();
    }, [fetchMyFiles, fetchFeedback, fetchSupFiles]);

    // ── pending badge: feedbacks without a Student reply ─────────────────────
    // authorId is NOT in ReplyDto → use authorRole instead
    const pendingCount = myFiles.reduce((acc, f) => {
        const fbs = feedbackMap[f.id] ?? [];
        return acc + fbs.filter(
            (fb) => !(fb.replies ?? []).some((r) => r.authorRole === "Student")
        ).length;
    }, 0);

    // ── dialog ────────────────────────────────────────────────────────────────

    const openAdd = () => {
        setEditTarget(null); setForm(EMPTY_FORM); setFormError(""); setDialogOpen(true);
    };
    const openEdit = (f) => {
        setEditTarget(f);
        setForm({ filePath: f.filePath, description: f.description ?? "" });
        setFormError(""); setDialogOpen(true);
    };
    const closeDialog = () => { if (!saving) setDialogOpen(false); };

    const handleSaveLink = async () => {
        if (!form.filePath.trim()) { setFormError("Please enter a link."); return; }
        try { new URL(form.filePath.trim()); }
        catch { setFormError("Please enter a valid URL starting with https://"); return; }

        setSaving(true); setFormError("");
        try {
            if (editTarget) {
                await fileSystemApi.editFile(editTarget.id, {
                    filePath: form.filePath.trim(), description: form.description.trim(),
                });
            } else {
                await fileSystemApi.addFile({
                    filePath: form.filePath.trim(), description: form.description.trim(),
                });
            }
            await fetchMyFiles();
            setDialogOpen(false);
        } catch (err) {
            setFormError(
                err?.response?.data?.message ??
                (typeof err?.response?.data === "string" ? err.response.data : null) ??
                err?.message ??
                "Something went wrong."
            );
        } finally { setSaving(false); }
    };

    const handleDeleteFile = async (id) => {
        setDeleteError(null);
        setMyFiles((p) => p.filter((f) => f.id !== id)); // optimistic
        try {
            await fileSystemApi.deleteFile(id);
        } catch (err) {
            await fetchMyFiles(); // rollback
            setDeleteError(
                err?.response?.data?.message ??
                (typeof err?.response?.data === "string" ? err.response.data : null) ??
                err?.message ??
                "Failed to delete file."
            );
        }
    };

    // ── reply ─────────────────────────────────────────────────────────────────

    const toggleReply = (feedbackId) => {
        setReplyOpen((p) => ({ ...p, [feedbackId]: !p[feedbackId] }));
        setReplyContent((p) => ({ ...p, [feedbackId]: "" }));
    };

    const handleSubmitReply = async (feedbackId) => {
        const content = (replyContent[feedbackId] ?? "").trim();
        if (!content) return;
        setReplySaving((p) => ({ ...p, [feedbackId]: true }));
        try {
            await feedbackApi.replyToFeedback({ content, parentFeedbackId: feedbackId });
            setReplyOpen((p) => ({ ...p, [feedbackId]: false }));
            await fetchFeedback();
        } catch { /* keep open */ }
        finally { setReplySaving((p) => ({ ...p, [feedbackId]: false })); }
    };

    const handleSaveEditReply = async () => {
        if (!editingReply?.content.trim()) return;
        setEditReplySave(true);
        try {
            // editingReply.replyId is already mapped correctly from feedbackApi
            await feedbackApi.editReply(editingReply.replyId, editingReply.content.trim());
            setEditingReply(null);
            await fetchFeedback();
        } catch { /* keep */ }
        finally { setEditReplySave(false); }
    };

    const handleDeleteReply = async (replyId) => {
        try {
            await feedbackApi.deleteReply(replyId);
            await fetchFeedback();
        } catch { /* ignore */ }
    };

    // ── render feedback thread ────────────────────────────────────────────────

    const renderFeedbackThread = (file) => {
        const feedbacks = feedbackMap[file.id] ?? [];
        if (!feedbacks.length) return null;

        return (
            <>
                <Divider sx={{ borderColor: t.borderLight }} />
                <Box sx={{ px: 2.5, py: 2, bgcolor: `${t.surfaceHover}50` }}>
                    <Typography sx={{
                        fontSize: "0.7rem", fontWeight: 700, color: t.accentPrimary,
                        textTransform: "uppercase", letterSpacing: "0.07em", mb: 1.5,
                    }}>
                        💬 Supervisor Feedback
                    </Typography>
                    <Stack spacing={2.5}>
                        {feedbacks.map((fb) => (
                            // ✅ fb.feedbackId — mapped in feedbackApi from fb.id
                            <Box key={fb.feedbackId}>
                                <Stack direction="row" gap={1.2} alignItems="flex-start">
                                    <Avatar sx={{
                                        width: 32, height: 32,
                                        bgcolor: colorFor(fb.authorName ?? ""),
                                        fontSize: "0.72rem", fontWeight: 700,
                                    }}>
                                        {getInitials(fb.authorName ?? "")}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Stack direction="row" gap={1} alignItems="center" mb={0.4}>
                                            {/* ✅ fb.authorName — mapped from fb.senderName */}
                                            <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: t.textPrimary }}>
                                                {fb.authorName}
                                            </Typography>
                                            <Typography sx={{ fontSize: "0.68rem", color: t.textTertiary }}>
                                                {formatDate(fb.createdAt)}
                                            </Typography>
                                        </Stack>
                                        <Paper elevation={0} sx={{
                                            p: 1.2, borderRadius: "4px 12px 12px 12px",
                                            bgcolor: `${t.accentPrimary}08`,
                                            border: `1px solid ${t.accentPrimary}22`,
                                        }}>
                                            <Typography sx={{ fontSize: "0.84rem", color: t.textSecondary, lineHeight: 1.55 }}>
                                                {fb.content}
                                            </Typography>
                                        </Paper>
                                        <Button size="small"
                                            startIcon={<ReplyOutlinedIcon sx={{ fontSize: 13 }} />}
                                            onClick={() => toggleReply(fb.feedbackId)}
                                            sx={{
                                                mt: 0.4, fontSize: "0.71rem", color: t.textTertiary,
                                                px: 0.5, "&:hover": { color: t.accentPrimary }
                                            }}>
                                            {replyOpen[fb.feedbackId] ? "Cancel" : "Reply"}
                                        </Button>
                                    </Box>
                                </Stack>

                                {/* Existing replies */}
                                {(fb.replies ?? []).length > 0 && (
                                    <Box sx={{ mt: 1.2, ml: 5.5, pl: 1.5, borderLeft: `2px solid ${t.borderLight}` }}>
                                        <Stack spacing={1.2}>
                                            {fb.replies.map((reply) => {
                                                // ✅ authorRole replaces authorId (not in ReplyDto)
                                                const isMe = reply.authorRole === "Student";
                                                // ✅ reply.replyId — mapped from reply.id
                                                const isEditing = editingReply?.replyId === reply.replyId;
                                                return (
                                                    <Stack key={reply.replyId} direction="row" gap={1} alignItems="flex-start">
                                                        <Avatar sx={{
                                                            width: 24, height: 24,
                                                            bgcolor: colorFor(reply.authorName ?? ""),
                                                            fontSize: "0.6rem",
                                                        }}>
                                                            {/* ✅ reply.authorName — mapped from reply.senderName */}
                                                            {getInitials(reply.authorName ?? "")}
                                                        </Avatar>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                                <Stack direction="row" gap={0.8} alignItems="center">
                                                                    <Typography sx={{ fontWeight: 600, fontSize: "0.75rem", color: t.textPrimary }}>
                                                                        {reply.authorName}
                                                                    </Typography>
                                                                    <Typography sx={{ fontSize: "0.65rem", color: t.textTertiary }}>
                                                                        {formatDate(reply.createdAt)}
                                                                    </Typography>
                                                                </Stack>
                                                                {isMe && !isEditing && (
                                                                    <Stack direction="row">
                                                                        <Tooltip title="Edit reply">
                                                                            <IconButton size="small"
                                                                                onClick={() => setEditingReply({
                                                                                    replyId: reply.replyId,
                                                                                    content: reply.content,
                                                                                })}
                                                                                sx={{ color: t.textTertiary, "&:hover": { color: t.accentPrimary } }}>
                                                                                <EditOutlinedIcon sx={{ fontSize: 13 }} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        <Tooltip title="Delete reply">
                                                                            <IconButton size="small"
                                                                                onClick={() => handleDeleteReply(reply.replyId)}
                                                                                sx={{ color: t.textTertiary, "&:hover": { color: t.error } }}>
                                                                                <DeleteOutlineIcon sx={{ fontSize: 13 }} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </Stack>
                                                                )}
                                                            </Stack>
                                                            {isEditing ? (
                                                                <Stack gap={0.8} mt={0.4}>
                                                                    <TextField fullWidth size="small"
                                                                        value={editingReply.content}
                                                                        onChange={(e) => setEditingReply((p) => ({ ...p, content: e.target.value }))}
                                                                    />
                                                                    <Stack direction="row" gap={1}>
                                                                        <Button size="small" variant="contained"
                                                                            startIcon={editReplySave
                                                                                ? <CircularProgress size={11} color="inherit" />
                                                                                : <CheckOutlinedIcon sx={{ fontSize: 12 }} />}
                                                                            onClick={handleSaveEditReply}
                                                                            disabled={editReplySave}
                                                                            sx={{ bgcolor: t.accentPrimary, borderRadius: 2, fontSize: "0.7rem" }}>
                                                                            Save
                                                                        </Button>
                                                                        <Button size="small"
                                                                            startIcon={<CloseOutlinedIcon sx={{ fontSize: 12 }} />}
                                                                            onClick={() => setEditingReply(null)}
                                                                            sx={{ color: t.textSecondary, fontSize: "0.7rem" }}>
                                                                            Cancel
                                                                        </Button>
                                                                    </Stack>
                                                                </Stack>
                                                            ) : (
                                                                <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, mt: 0.2 }}>
                                                                    {reply.content}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Stack>
                                                );
                                            })}
                                        </Stack>
                                    </Box>
                                )}

                                {/* Reply input */}
                                <Collapse in={Boolean(replyOpen[fb.feedbackId])}>
                                    <Stack direction="row" gap={1} alignItems="flex-start" sx={{ mt: 1, ml: 5.5 }}>
                                        <Avatar sx={{ width: 24, height: 24, bgcolor: t.accentPrimary, fontSize: "0.6rem" }}>
                                            {getInitials(user?.name ?? "Me")}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <TextField fullWidth size="small" multiline minRows={1}
                                                placeholder="Write your reply…"
                                                value={replyContent[fb.feedbackId] ?? ""}
                                                onChange={(e) => setReplyContent((p) => ({ ...p, [fb.feedbackId]: e.target.value }))}
                                                onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleSubmitReply(fb.feedbackId); }}
                                                sx={{ mb: 0.8 }}
                                            />
                                            <Button size="small" variant="contained"
                                                endIcon={replySaving[fb.feedbackId]
                                                    ? <CircularProgress size={11} color="inherit" />
                                                    : <SendOutlinedIcon sx={{ fontSize: 13 }} />}
                                                onClick={() => handleSubmitReply(fb.feedbackId)}
                                                disabled={replySaving[fb.feedbackId] || !(replyContent[fb.feedbackId] ?? "").trim()}
                                                sx={{ bgcolor: t.accentPrimary, borderRadius: 2, fontSize: "0.72rem" }}>
                                                {replySaving[fb.feedbackId] ? "Sending…" : "Send Reply"}
                                            </Button>
                                        </Box>
                                    </Stack>
                                </Collapse>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </>
        );
    };

    // ── render file cards ─────────────────────────────────────────────────────

    const renderMyFileCard = (file) => {
        const meta = TYPE_META[getFileType(file.filePath)];
        const displayName = getDisplayName(file.filePath, file.description);
        const hasFeedback = (feedbackMap[file.id] ?? []).length > 0;
        const isOwner = String(file.uploadedByUserId) === currentUserId;

        return (
            <Paper key={file.id} elevation={0} sx={{
                borderRadius: 3,
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${hasFeedback ? t.accentPrimary + "35" : t.borderLight}`,
                overflow: "hidden",
                transition: "box-shadow .15s",
                "&:hover": { boxShadow: theme.shadows[2] },
            }}>
                <Stack direction={{ xs: "column", sm: "row" }}
                    alignItems={{ sm: "center" }} justifyContent="space-between"
                    gap={1.5} sx={{ p: 2.5 }}>
                    <Stack direction="row" alignItems="center" gap={1.5} sx={{ minWidth: 0 }}>
                        <Box sx={{
                            p: 0.9, borderRadius: 2, flexShrink: 0,
                            bgcolor: `${meta.color}15`, color: meta.color,
                            "& svg": { fontSize: 20 },
                        }}>
                            {meta.icon}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: t.textPrimary }}>
                                {displayName}
                            </Typography>
                            <Typography component="a" href={file.filePath}
                                target="_blank" rel="noopener noreferrer"
                                sx={{
                                    fontSize: "0.72rem", color: t.accentPrimary,
                                    textDecoration: "none", display: "block",
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                    maxWidth: 360,
                                    "&:hover": { textDecoration: "underline" },
                                }}>
                                {file.filePath}
                            </Typography>
                            {!isOwner && file.uploadedByName && (
                                <Typography sx={{ fontSize: "0.68rem", color: t.textTertiary, mt: 0.3 }}>
                                    Uploaded by {file.uploadedByName}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap={0.5} sx={{ flexShrink: 0 }}>
                        {hasFeedback && (
                            <Chip size="small"
                                icon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: "13px !important" }} />}
                                label="Feedback"
                                sx={{
                                    bgcolor: `${t.accentPrimary}12`, color: t.accentPrimary,
                                    fontWeight: 600, fontSize: "0.68rem"
                                }}
                            />
                        )}
                        <Tooltip title="Open link">
                            <IconButton size="small" component="a"
                                href={file.filePath} target="_blank" rel="noopener noreferrer"
                                sx={{ color: t.textTertiary, "&:hover": { color: t.accentPrimary } }}>
                                <OpenInNewOutlinedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                        </Tooltip>
                        {isOwner && (
                            <>
                                <Tooltip title="Edit">
                                    <IconButton size="small" onClick={() => openEdit(file)}
                                        sx={{ color: t.textTertiary, "&:hover": { color: t.accentPrimary } }}>
                                        <EditOutlinedIcon sx={{ fontSize: 17 }} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <IconButton size="small" onClick={() => handleDeleteFile(file.id)}
                                        sx={{ color: t.textTertiary, "&:hover": { color: t.error } }}>
                                        <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                                    </IconButton>
                                </Tooltip>
                            </>
                        )}
                    </Stack>
                </Stack>
                {renderFeedbackThread(file)}
            </Paper>
        );
    };

    const renderSupFileCard = (file) => {
        const meta = TYPE_META[getFileType(file.filePath)];
        const displayName = getDisplayName(file.filePath, file.description);
        return (
            <Paper key={file.id} elevation={0} sx={{
                borderRadius: 3,
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${t.borderLight}`,
                overflow: "hidden",
                transition: "box-shadow .15s",
                "&:hover": { boxShadow: theme.shadows[2] },
            }}>
                <Stack direction={{ xs: "column", sm: "row" }}
                    alignItems={{ sm: "center" }} justifyContent="space-between"
                    gap={1.5} sx={{ p: 2.5 }}>
                    <Stack direction="row" alignItems="center" gap={1.5} sx={{ minWidth: 0 }}>
                        <Box sx={{
                            p: 0.9, borderRadius: 2, flexShrink: 0,
                            bgcolor: `${meta.color}15`, color: meta.color,
                            "& svg": { fontSize: 20 },
                        }}>
                            {meta.icon}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: t.textPrimary }}>
                                {displayName}
                            </Typography>
                            <Typography component="a" href={file.filePath}
                                target="_blank" rel="noopener noreferrer"
                                sx={{
                                    fontSize: "0.72rem", color: t.accentPrimary,
                                    textDecoration: "none", display: "block",
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                    maxWidth: 360,
                                    "&:hover": { textDecoration: "underline" },
                                }}>
                                {file.filePath}
                            </Typography>
                        </Box>
                    </Stack>
                    <Tooltip title="Open link">
                        <IconButton size="small" component="a"
                            href={file.filePath} target="_blank" rel="noopener noreferrer"
                            sx={{ color: t.textTertiary, flexShrink: 0, "&:hover": { color: t.accentPrimary } }}>
                            <OpenInNewOutlinedIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Paper>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <Box sx={{ width: "100%" }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                    <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>Files</Typography>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.88rem" }}>
                        Manage your files and view resources from your supervisor
                    </Typography>
                </Box>
                {activeTab === 0 && (
                    <Button variant="contained" startIcon={<AddLinkOutlinedIcon />}
                        onClick={openAdd}
                        sx={{ bgcolor: t.accentPrimary, borderRadius: 2, flexShrink: 0 }}>
                        Add Link
                    </Button>
                )}
            </Stack>

            {/* Tabs */}
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{
                borderBottom: `1px solid ${t.borderLight}`,
                "& .MuiTab-root": { fontSize: "0.85rem", textTransform: "none", fontWeight: 600, minHeight: 44 },
                "& .MuiTabs-indicator": { height: 2 },
            }}>
                <Tab iconPosition="start"
                    icon={
                        <Badge badgeContent={pendingCount} color="error" max={9}
                            sx={{ "& .MuiBadge-badge": { fontSize: "0.58rem", minWidth: 15, height: 15 } }}>
                            <FolderOutlinedIcon sx={{ fontSize: 17 }} />
                        </Badge>
                    }
                    label="My Files"
                />
                <Tab iconPosition="start"
                    icon={<SupervisorAccountOutlinedIcon sx={{ fontSize: 17 }} />}
                    label="Supervisor Files"
                />
            </Tabs>

            {/* ── TAB 0: MY FILES ── */}
            <TabPanel value={activeTab} index={0}>
                <Paper elevation={0} sx={{
                    p: 2, mb: 3, borderRadius: 3,
                    bgcolor: `${t.accentPrimary}08`,
                    border: `1px solid ${t.accentPrimary}25`,
                    display: "flex", alignItems: "flex-start", gap: 1.5,
                }}>
                    <LinkOutlinedIcon sx={{ color: t.accentPrimary, mt: "2px", flexShrink: 0 }} />
                    <Box>
                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: t.textPrimary, mb: 0.3 }}>
                            Share links, not files
                        </Typography>
                        <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, lineHeight: 1.6 }}>
                            Upload to <strong>Google Drive</strong>, <strong>OneDrive</strong>, or{" "}
                            <strong>GitHub</strong>, then paste the shareable link here.
                            Your supervisor can review and leave feedback.
                        </Typography>
                    </Box>
                </Paper>

                {deleteError && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}
                        onClose={() => setDeleteError(null)}>
                        {deleteError}
                    </Alert>
                )}

                {myLoading && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                        <CircularProgress sx={{ color: t.accentPrimary }} />
                    </Box>
                )}
                {!myLoading && myError && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>{myError}</Alert>
                )}
                {!myLoading && !myError && myFiles.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                        <AddLinkOutlinedIcon sx={{ fontSize: 46, color: t.textTertiary, mb: 1.5 }} />
                        <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem", mb: 0.5 }}>No links yet.</Typography>
                        <Typography sx={{ color: t.textTertiary, fontSize: "0.8rem" }}>
                            Click <strong>Add Link</strong> to share a file with your supervisor.
                        </Typography>
                    </Box>
                )}
                {!myLoading && !myError && myFiles.length > 0 && (
                    <Stack spacing={2}>{myFiles.map((f) => renderMyFileCard(f))}</Stack>
                )}
            </TabPanel>

            {/* ── TAB 1: SUPERVISOR FILES ── */}
            <TabPanel value={activeTab} index={1}>
                <Paper elevation={0} sx={{
                    p: 2, mb: 3, borderRadius: 3,
                    bgcolor: `${t.accentPrimary}08`,
                    border: `1px solid ${t.accentPrimary}25`,
                    display: "flex", alignItems: "flex-start", gap: 1.5,
                }}>
                    <SupervisorAccountOutlinedIcon sx={{ color: t.accentPrimary, mt: "2px", flexShrink: 0 }} />
                    <Box>
                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: t.textPrimary, mb: 0.3 }}>
                            Resources from your supervisor
                        </Typography>
                        <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, lineHeight: 1.6 }}>
                            Templates, examples, and reference documents shared by your supervisor.
                        </Typography>
                    </Box>
                </Paper>

                {supLoading && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                        <CircularProgress sx={{ color: t.accentPrimary }} />
                    </Box>
                )}
                {!supLoading && supError && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>{supError}</Alert>
                )}
                {!supLoading && !supError && supFiles.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                        <RateReviewOutlinedIcon sx={{ fontSize: 46, color: t.textTertiary, mb: 1.5 }} />
                        <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                            No files from your supervisor yet.
                        </Typography>
                    </Box>
                )}
                {!supLoading && !supError && supFiles.length > 0 && (
                    <Stack spacing={2}>{supFiles.map((f) => renderSupFileCard(f))}</Stack>
                )}
            </TabPanel>

            {/* ── Add / Edit Dialog ── */}
            <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ color: t.textPrimary, fontWeight: 700, pb: 1 }}>
                    {editTarget ? "Edit Link" : "Add New Link"}
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Paper elevation={0} sx={{
                        p: 1.5, mb: 2.5, borderRadius: 2,
                        bgcolor: `${t.accentPrimary}08`, border: `1px dashed ${t.accentPrimary}35`,
                    }}>
                        <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, lineHeight: 1.6 }}>
                            💡 Upload your file to <strong>Google Drive</strong>, <strong>OneDrive</strong>,
                            or <strong>GitHub</strong> first, then paste the shareable link below.
                        </Typography>
                    </Paper>
                    <TextField fullWidth label="File Link *"
                        placeholder="https://drive.google.com/file/…"
                        value={form.filePath}
                        onChange={(e) => setForm((p) => ({ ...p, filePath: e.target.value }))}
                        error={Boolean(formError)}
                        sx={{ mb: 2 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LinkOutlinedIcon sx={{ color: t.textTertiary, fontSize: 18 }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField fullWidth label="Description (optional)"
                        placeholder="e.g. Final report PDF"
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        multiline minRows={2}
                    />
                    {formError && (
                        <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2, fontSize: "0.8rem" }}>
                            {formError}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button onClick={closeDialog} disabled={saving} sx={{ color: t.textSecondary }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveLink} disabled={saving}
                        startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <AddLinkOutlinedIcon />}
                        sx={{ bgcolor: t.accentPrimary, borderRadius: 2 }}>
                        {saving ? "Saving…" : editTarget ? "Save Changes" : "Add Link"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}