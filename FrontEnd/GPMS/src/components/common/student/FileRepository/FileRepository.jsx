// src/components/common/student/FileRepository/FileRepository.jsx
//
// File shape:  { id, fileName, filePath, description, uploadedAt, uploadedByName, uploadedByUserId }
// Feedback shape (mapped by feedbackApi):
//   { feedbackId, content, createdAt, authorName, authorRole, taskItemId,
//     replies: [{ replyId, content, createdAt, authorName, authorRole }] }
//
// Strategy:
//   After loading student files → for each file call GET /api/Feedback/file/{file.id}
//   Build feedbackMap: { [file.id]: MappedFeedback[] }
//   Student can reply to any feedback, edit/delete own replies.
//
// Tab 0 "My Files":
//   - GET /api/FileSystem/student-files
//   - GET /api/Feedback/file/{fileId}  (once per file)
//   - Only uploader can edit/delete the file itself
//
// Tab 1 "Supervisor Files":
//   - GET /api/FileSystem/supervisor-files  (read-only)

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
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";

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
    gdrive: { color: "#4285F4", icon: <CloudOutlinedIcon />, label: "Google Drive" },
    github: { color: "#6D8A7D", icon: <InsertDriveFileOutlinedIcon />, label: "GitHub" },
    onedrive: { color: "#0078D4", icon: <CloudOutlinedIcon />, label: "OneDrive" },
    link: { color: "#9E9E9E", icon: <LinkOutlinedIcon />, label: "Link" },
};

const getDisplayName = (file) => {
    if (file.fileName?.trim()) return file.fileName.trim();
    if (file.description?.trim()) return file.description.trim();
    try { return new URL(file.filePath ?? "").hostname; }
    catch { return file.filePath?.slice(0, 50) || "Untitled link"; }
};

const fmtDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const initials = (name = "") =>
    (name || "?").split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

const PALETTE = ["#C47E7E", "#C49A6C", "#7E9FC4", "#6D8A7D", "#9E86C4"];
const avatarColor = (name = "") => PALETTE[(name?.charCodeAt(0) ?? 0) % PALETTE.length];

const EMPTY_FORM = { filePath: "", fileName: "", description: "" };

function TabPanel({ children, value, index }) {
    return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function FileRepository() {
    const theme = useTheme();
    const t = theme.palette.custom;
    const { user } = useAuth();

    const currentUserId = Number(user?.id ?? user?.userId ?? 0);

    const [activeTab, setActiveTab] = useState(0);

    // ── student files ─────────────────────────────────────────────────────────
    const [myFiles, setMyFiles] = useState([]);
    const [myLoading, setMyLoading] = useState(true);
    const [myError, setMyError] = useState(null);
    const [deleteErr, setDeleteErr] = useState(null);

    // ── supervisor files ──────────────────────────────────────────────────────
    const [supFiles, setSupFiles] = useState([]);
    const [supLoading, setSupLoading] = useState(true);
    const [supError, setSupError] = useState(null);

    // feedbackMap: { [file.id]: MappedFeedback[] }
    const [feedbackMap, setFeedbackMap] = useState({});
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    // ── add/edit dialog ───────────────────────────────────────────────────────
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    // ── reply state ───────────────────────────────────────────────────────────
    const [replyOpen, setReplyOpen] = useState({});   // { [feedbackId]: bool }
    const [replyText, setReplyText] = useState({});   // { [feedbackId]: string }
    const [replySaving, setReplySaving] = useState({});   // { [feedbackId]: bool }
    const [replyError, setReplyError] = useState({});   // { [feedbackId]: string }

    // ── edit-reply state ──────────────────────────────────────────────────────
    // editReply: { replyId, content, feedbackId, fileId }
    const [editReply, setEditReply] = useState(null);
    const [editReplySaving, setEditReplySaving] = useState(false);
    const [editReplyError, setEditReplyError] = useState("");

    // per-thread refresh spinner
    const [threadRefreshing, setThreadRefreshing] = useState({});  // { [feedbackId]: bool }

    // ── data fetching ─────────────────────────────────────────────────────────

    /**
     * Fetch feedback for every file using GET /api/Feedback/file/{fileId}.
     * Builds feedbackMap: { [file.id]: MappedFeedback[] }
     */
    const fetchFeedbackForFiles = useCallback(async (files) => {
        if (!files.length) return;
        setFeedbackLoading(true);
        try {
            const results = await Promise.allSettled(
                files.map((f) =>
                    feedbackApi.getFeedbackByFile(f.id).then((list) => ({ fileId: f.id, list }))
                )
            );
            const map = {};
            results.forEach((r) => {
                if (r.status === "fulfilled") {
                    map[r.value.fileId] = r.value.list;
                }
            });
            setFeedbackMap(map);
        } catch (err) {
            console.error("Feedback batch fetch error:", err);
        } finally {
            setFeedbackLoading(false);
        }
    }, []);

    const fetchMyFiles = useCallback(async () => {
        setMyLoading(true); setMyError(null);
        try {
            const data = await fileSystemApi.getStudentFiles();
            const files = Array.isArray(data) ? data : [];
            setMyFiles(files);
            await fetchFeedbackForFiles(files);
        } catch (err) {
            setMyError(err?.response?.data?.message ?? err?.message ?? "Failed to load files.");
        } finally {
            setMyLoading(false);
        }
    }, [fetchFeedbackForFiles]);

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
        fetchSupFiles();
    }, [fetchMyFiles, fetchSupFiles]);

    /**
     * Refresh a single feedback thread — called after reply/edit/delete.
     */
    const refreshFileFeedback = useCallback(async (fileId) => {
        setThreadRefreshing((p) => ({ ...p, [fileId]: true }));
        try {
            const list = await feedbackApi.getFeedbackByFile(fileId);
            setFeedbackMap((prev) => ({ ...prev, [fileId]: list }));
        } catch (err) {
            console.error("Refresh feedback error:", err);
        } finally {
            setThreadRefreshing((p) => ({ ...p, [fileId]: false }));
        }
    }, []);

    // Badge: feedbacks with no student reply yet
    const pendingCount = myFiles.reduce((acc, f) => {
        const fbs = feedbackMap[f.id] ?? [];
        return acc + fbs.filter(
            (fb) => !(fb.replies ?? []).some((r) => r.authorRole === "Student")
        ).length;
    }, 0);

    // ── file dialog ───────────────────────────────────────────────────────────

    const openAdd = () => {
        setEditTarget(null); setForm(EMPTY_FORM); setFormError(""); setDialogOpen(true);
    };
    const openEdit = (f) => {
        setEditTarget(f);
        setForm({ filePath: f.filePath ?? "", fileName: f.fileName ?? "", description: f.description ?? "" });
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
                    filePath: form.filePath.trim(), fileName: form.fileName.trim(), description: form.description.trim(),
                });
            } else {
                await fileSystemApi.addFile({
                    filePath: form.filePath.trim(), fileName: form.fileName.trim(), description: form.description.trim(),
                });
            }
            await fetchMyFiles();
            setDialogOpen(false);
        } catch (err) {
            setFormError(
                err?.response?.data?.message ??
                (typeof err?.response?.data === "string" ? err.response.data : null) ??
                err?.message ?? "Something went wrong."
            );
        } finally { setSaving(false); }
    };

    const handleDeleteFile = async (id) => {
        setDeleteErr(null);
        setMyFiles((p) => p.filter((f) => f.id !== id));
        try { await fileSystemApi.deleteFile(id); }
        catch (err) {
            await fetchMyFiles();
            setDeleteErr(err?.response?.data?.message ?? err?.message ?? "Failed to delete.");
        }
    };

    // ── reply handlers ────────────────────────────────────────────────────────

    const toggleReply = (feedbackId) => {
        setReplyOpen((p) => ({ ...p, [feedbackId]: !p[feedbackId] }));
        setReplyText((p) => ({ ...p, [feedbackId]: "" }));
        setReplyError((p) => ({ ...p, [feedbackId]: "" }));
    };

    const handleSendReply = async (feedbackId, fileId) => {
        const content = (replyText[feedbackId] ?? "").trim();
        if (!content) {
            setReplyError((p) => ({ ...p, [feedbackId]: "Please write something before sending." }));
            return;
        }
        setReplySaving((p) => ({ ...p, [feedbackId]: true }));
        setReplyError((p) => ({ ...p, [feedbackId]: "" }));
        try {
            await feedbackApi.replyToFeedback({ content, parentFeedbackId: feedbackId });
            setReplyOpen((p) => ({ ...p, [feedbackId]: false }));
            setReplyText((p) => ({ ...p, [feedbackId]: "" }));
            await refreshFileFeedback(fileId);
        } catch (err) {
            setReplyError((p) => ({
                ...p,
                [feedbackId]: err?.response?.data?.message ?? err?.message ?? "Failed to send reply.",
            }));
        } finally {
            setReplySaving((p) => ({ ...p, [feedbackId]: false }));
        }
    };

    const handleSaveEditReply = async () => {
        if (!editReply?.content.trim()) { setEditReplyError("Reply cannot be empty."); return; }
        setEditReplySaving(true); setEditReplyError("");
        try {
            await feedbackApi.editReply(editReply.replyId, editReply.content.trim());
            const { fileId } = editReply;
            setEditReply(null);
            await refreshFileFeedback(fileId);
        } catch (err) {
            setEditReplyError(err?.response?.data?.message ?? err?.message ?? "Failed to save changes.");
        } finally { setEditReplySaving(false); }
    };

    const handleDeleteReply = async (replyId, feedbackId, fileId) => {
        // Optimistic update
        setFeedbackMap((prev) => {
            const current = prev[fileId] ?? [];
            return {
                ...prev,
                [fileId]: current.map((fb) =>
                    fb.feedbackId === feedbackId
                        ? { ...fb, replies: fb.replies.filter((r) => r.replyId !== replyId) }
                        : fb
                ),
            };
        });
        try {
            await feedbackApi.deleteReply(replyId);
        } catch (err) {
            console.error("Delete reply error:", err);
            await refreshFileFeedback(fileId);
        }
    };

    // ── render feedback thread ────────────────────────────────────────────────

    const renderFeedbackThread = (file) => {
        const feedbacks = feedbackMap[file.id] ?? [];
        const isFileRefreshing = Boolean(threadRefreshing[file.id]);

        if (!feedbacks.length && !isFileRefreshing) return null;

        return (
            <>
                <Divider sx={{ borderColor: t.borderLight }} />
                <Box sx={{ px: 2.5, py: 2.5, bgcolor: `${t.surfaceHover ?? "#F8F9FA"}80` }}>

                    {/* Header */}
                    <Stack direction="row" alignItems="center" gap={1} mb={2}>
                        <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 14, color: t.accentPrimary }} />
                        <Typography sx={{
                            fontSize: "0.7rem", fontWeight: 700, color: t.accentPrimary,
                            textTransform: "uppercase", letterSpacing: "0.07em",
                        }}>
                            Supervisor Feedback ({feedbacks.length})
                        </Typography>
                        {isFileRefreshing && (
                            <CircularProgress size={11} sx={{ color: t.accentPrimary, ml: 0.5 }} />
                        )}
                    </Stack>

                    <Stack spacing={3}>
                        {feedbacks.map((fb) => (
                            <Box key={fb.feedbackId}>

                                {/* ── Feedback bubble ── */}
                                <Stack direction="row" gap={1.5} alignItems="flex-start">
                                    <Avatar sx={{
                                        width: 34, height: 34, flexShrink: 0,
                                        bgcolor: avatarColor(fb.authorName),
                                        fontSize: "0.75rem", fontWeight: 700,
                                    }}>
                                        {initials(fb.authorName)}
                                    </Avatar>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Stack direction="row" gap={1} alignItems="center" mb={0.5} flexWrap="wrap">
                                            <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: t.textPrimary }}>
                                                {fb.authorName || "Supervisor"}
                                            </Typography>
                                            {fb.authorRole && (
                                                <Chip label={fb.authorRole} size="small" sx={{
                                                    height: 16, fontSize: "0.6rem", fontWeight: 600,
                                                    bgcolor: `${t.accentPrimary}15`, color: t.accentPrimary,
                                                    "& .MuiChip-label": { px: 0.8 },
                                                }} />
                                            )}
                                            <Typography sx={{ fontSize: "0.67rem", color: t.textTertiary }}>
                                                {fmtDate(fb.createdAt)}
                                            </Typography>
                                        </Stack>

                                        <Paper elevation={0} sx={{
                                            p: "10px 14px",
                                            borderRadius: "4px 12px 12px 12px",
                                            bgcolor: `${t.accentPrimary}08`,
                                            border: `1px solid ${t.accentPrimary}20`,
                                        }}>
                                            <Typography sx={{ fontSize: "0.84rem", color: t.textSecondary, lineHeight: 1.6 }}>
                                                {fb.content}
                                            </Typography>
                                        </Paper>

                                        <Button size="small"
                                            startIcon={<ReplyOutlinedIcon sx={{ fontSize: 13 }} />}
                                            onClick={() => toggleReply(fb.feedbackId)}
                                            sx={{
                                                mt: 0.5, px: 0.8, fontSize: "0.72rem",
                                                color: t.textTertiary, minWidth: 0,
                                                "&:hover": { color: t.accentPrimary, bgcolor: "transparent" },
                                            }}>
                                            {replyOpen[fb.feedbackId] ? "Cancel" : "Reply"}
                                        </Button>
                                    </Box>
                                </Stack>

                                {/* ── Existing replies ── */}
                                {(fb.replies ?? []).length > 0 && (
                                    <Box sx={{ mt: 1.5, ml: 6, pl: 2, borderLeft: `2px solid ${t.borderLight}` }}>
                                        <Stack spacing={1.5}>
                                            {fb.replies.map((rep) => {
                                                const isMe = rep.authorRole === "Student";
                                                const isEditing = editReply?.replyId === rep.replyId;
                                                return (
                                                    <Stack key={rep.replyId} direction="row" gap={1} alignItems="flex-start">
                                                        <Avatar sx={{
                                                            width: 26, height: 26, flexShrink: 0,
                                                            bgcolor: isMe ? t.accentPrimary : avatarColor(rep.authorName),
                                                            fontSize: "0.62rem", fontWeight: 700,
                                                        }}>
                                                            {initials(rep.authorName)}
                                                        </Avatar>
                                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                                            <Stack direction="row" justifyContent="space-between"
                                                                alignItems="center" mb={0.3}>
                                                                <Stack direction="row" gap={0.8} alignItems="center">
                                                                    <Typography sx={{ fontWeight: 600, fontSize: "0.76rem", color: t.textPrimary }}>
                                                                        {isMe ? "You" : (rep.authorName || "Unknown")}
                                                                    </Typography>
                                                                    <Typography sx={{ fontSize: "0.64rem", color: t.textTertiary }}>
                                                                        {fmtDate(rep.createdAt)}
                                                                    </Typography>
                                                                </Stack>
                                                                {isMe && !isEditing && (
                                                                    <Stack direction="row">
                                                                        <Tooltip title="Edit reply">
                                                                            <IconButton size="small"
                                                                                onClick={() => {
                                                                                    setEditReply({
                                                                                        replyId: rep.replyId,
                                                                                        content: rep.content,
                                                                                        feedbackId: fb.feedbackId,
                                                                                        fileId: file.id,
                                                                                    });
                                                                                    setEditReplyError("");
                                                                                }}
                                                                                sx={{ color: t.textTertiary, "&:hover": { color: t.accentPrimary } }}>
                                                                                <EditOutlinedIcon sx={{ fontSize: 13 }} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        <Tooltip title="Delete reply">
                                                                            <IconButton size="small"
                                                                                onClick={() => handleDeleteReply(rep.replyId, fb.feedbackId, file.id)}
                                                                                sx={{ color: t.textTertiary, "&:hover": { color: t.error ?? "#C47E7E" } }}>
                                                                                <DeleteOutlineIcon sx={{ fontSize: 13 }} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </Stack>
                                                                )}
                                                            </Stack>

                                                            {isEditing ? (
                                                                <Stack gap={1} mt={0.5}>
                                                                    <TextField fullWidth size="small" multiline minRows={1}
                                                                        value={editReply.content}
                                                                        onChange={(e) =>
                                                                            setEditReply((p) => ({ ...p, content: e.target.value }))
                                                                        }
                                                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.82rem" } }}
                                                                    />
                                                                    {editReplyError && (
                                                                        <Alert severity="error" sx={{ py: 0.3, fontSize: "0.75rem", borderRadius: 2 }}>
                                                                            {editReplyError}
                                                                        </Alert>
                                                                    )}
                                                                    <Stack direction="row" gap={1}>
                                                                        <Button size="small" variant="contained"
                                                                            startIcon={editReplySaving
                                                                                ? <CircularProgress size={11} color="inherit" />
                                                                                : <CheckOutlinedIcon sx={{ fontSize: 12 }} />}
                                                                            onClick={handleSaveEditReply}
                                                                            disabled={editReplySaving}
                                                                            sx={{ bgcolor: t.accentPrimary, borderRadius: 2, fontSize: "0.72rem" }}>
                                                                            Save
                                                                        </Button>
                                                                        <Button size="small"
                                                                            startIcon={<CloseOutlinedIcon sx={{ fontSize: 12 }} />}
                                                                            onClick={() => { setEditReply(null); setEditReplyError(""); }}
                                                                            sx={{ color: t.textSecondary, fontSize: "0.72rem" }}>
                                                                            Cancel
                                                                        </Button>
                                                                    </Stack>
                                                                </Stack>
                                                            ) : (
                                                                <Paper elevation={0} sx={{
                                                                    px: 1.2, py: 0.8,
                                                                    borderRadius: "4px 10px 10px 10px",
                                                                    bgcolor: isMe
                                                                        ? `${t.accentPrimary}10`
                                                                        : `${t.surfaceHover ?? "#F5F5F5"}`,
                                                                    border: `1px solid ${isMe ? t.accentPrimary + "20" : t.borderLight}`,
                                                                }}>
                                                                    <Typography sx={{ fontSize: "0.8rem", color: t.textSecondary, lineHeight: 1.5 }}>
                                                                        {rep.content}
                                                                    </Typography>
                                                                </Paper>
                                                            )}
                                                        </Box>
                                                    </Stack>
                                                );
                                            })}
                                        </Stack>
                                    </Box>
                                )}

                                {/* ── Reply input ── */}
                                <Collapse in={Boolean(replyOpen[fb.feedbackId])}>
                                    <Stack direction="row" gap={1.2} alignItems="flex-start" sx={{ mt: 1.5, ml: 6 }}>
                                        <Avatar sx={{
                                            width: 26, height: 26, flexShrink: 0,
                                            bgcolor: t.accentPrimary, fontSize: "0.62rem", fontWeight: 700,
                                        }}>
                                            {initials(user?.name ?? user?.fullName ?? "Me")}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <TextField fullWidth size="small" multiline minRows={2}
                                                placeholder="Write your reply…"
                                                value={replyText[fb.feedbackId] ?? ""}
                                                onChange={(e) =>
                                                    setReplyText((p) => ({ ...p, [fb.feedbackId]: e.target.value }))
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && e.ctrlKey)
                                                        handleSendReply(fb.feedbackId, file.id);
                                                }}
                                                error={Boolean(replyError[fb.feedbackId])}
                                                sx={{ mb: 0.5, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.82rem" } }}
                                            />
                                            {replyError[fb.feedbackId] && (
                                                <Alert severity="error" sx={{ mb: 0.5, py: 0.3, fontSize: "0.75rem", borderRadius: 2 }}>
                                                    {replyError[fb.feedbackId]}
                                                </Alert>
                                            )}
                                            <Stack direction="row" gap={1} alignItems="center">
                                                <Button size="small" variant="contained"
                                                    endIcon={replySaving[fb.feedbackId]
                                                        ? <CircularProgress size={11} color="inherit" />
                                                        : <SendOutlinedIcon sx={{ fontSize: 13 }} />}
                                                    onClick={() => handleSendReply(fb.feedbackId, file.id)}
                                                    disabled={
                                                        replySaving[fb.feedbackId] ||
                                                        !(replyText[fb.feedbackId] ?? "").trim()
                                                    }
                                                    sx={{ bgcolor: t.accentPrimary, borderRadius: 2, fontSize: "0.72rem" }}>
                                                    {replySaving[fb.feedbackId] ? "Sending…" : "Send Reply"}
                                                </Button>
                                                <Typography sx={{ fontSize: "0.64rem", color: t.textTertiary }}>
                                                    Ctrl + Enter
                                                </Typography>
                                            </Stack>
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

    // ── student file card ─────────────────────────────────────────────────────

    const renderMyFileCard = (file) => {
        const meta = TYPE_META[getFileType(file.filePath)];
        const displayName = getDisplayName(file);
        const feedbacks = feedbackMap[file.id] ?? [];
        const hasFeedback = feedbacks.length > 0;
        const needsReply = feedbacks.some(
            (fb) => !(fb.replies ?? []).some((r) => r.authorRole === "Student")
        );
        const isOwner = file.uploadedByUserId === currentUserId;

        return (
            <Paper key={file.id} elevation={0} sx={{
                borderRadius: 3,
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${needsReply ? t.accentPrimary + "55" :
                    hasFeedback ? t.accentPrimary + "28" :
                        t.borderLight
                    }`,
                overflow: "hidden",
                transition: "box-shadow .15s",
                "&:hover": { boxShadow: theme.shadows[2] },
            }}>
                <Stack direction={{ xs: "column", sm: "row" }}
                    alignItems={{ sm: "center" }} justifyContent="space-between"
                    gap={1.5} sx={{ p: 2.5 }}>

                    {/* Left */}
                    <Stack direction="row" alignItems="flex-start" gap={1.5} sx={{ minWidth: 0, flex: 1 }}>
                        <Box sx={{
                            p: 0.9, borderRadius: 2, flexShrink: 0, mt: 0.2,
                            bgcolor: `${meta.color}15`, color: meta.color,
                            "& svg": { fontSize: 22 },
                        }}>
                            {meta.icon}
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Stack direction="row" alignItems="center" gap={0.8} mb={0.3} flexWrap="wrap">
                                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: t.textPrimary }}>
                                    {displayName}
                                </Typography>
                                <Chip label={meta.label} size="small" sx={{
                                    height: 16, fontSize: "0.58rem", fontWeight: 600,
                                    bgcolor: `${meta.color}12`, color: meta.color,
                                    "& .MuiChip-label": { px: 0.7 },
                                }} />
                            </Stack>
                            <Typography component="a" href={file.filePath}
                                target="_blank" rel="noopener noreferrer"
                                sx={{
                                    fontSize: "0.72rem", color: t.accentPrimary,
                                    textDecoration: "none", display: "block",
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                    maxWidth: 400, "&:hover": { textDecoration: "underline" },
                                }}>
                                {file.filePath}
                            </Typography>
                            {file.description?.trim() && file.description.trim() !== file.fileName?.trim() && (
                                <Typography sx={{ fontSize: "0.72rem", color: t.textSecondary, mt: 0.3 }}>
                                    {file.description}
                                </Typography>
                            )}
                            <Stack direction="row" alignItems="center" gap={0.7} mt={0.7}>
                                <Avatar sx={{
                                    width: 18, height: 18,
                                    bgcolor: avatarColor(file.uploadedByName ?? ""),
                                    fontSize: "0.55rem", fontWeight: 700,
                                }}>
                                    {initials(file.uploadedByName ?? "?")}
                                </Avatar>
                                <Typography sx={{ fontSize: "0.68rem", color: t.textTertiary }}>
                                    {isOwner
                                        ? "Uploaded by you"
                                        : file.uploadedByName
                                            ? `Uploaded by ${file.uploadedByName}`
                                            : "Uploaded by teammate"}
                                </Typography>
                                {file.uploadedAt && (
                                    <Typography sx={{ fontSize: "0.65rem", color: t.textTertiary }}>
                                        · {fmtDate(file.uploadedAt)}
                                    </Typography>
                                )}
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Right */}
                    <Stack direction="row" alignItems="center" gap={0.5} sx={{ flexShrink: 0 }}>
                        {needsReply && (
                            <Chip size="small"
                                icon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: "12px !important" }} />}
                                label="Reply needed"
                                sx={{
                                    bgcolor: `${t.accentPrimary}15`, color: t.accentPrimary,
                                    fontWeight: 700, fontSize: "0.65rem",
                                    border: `1px solid ${t.accentPrimary}30`,
                                }}
                            />
                        )}
                        {!needsReply && hasFeedback && (
                            <Chip size="small"
                                icon={<CheckOutlinedIcon sx={{ fontSize: "12px !important" }} />}
                                label="Replied"
                                sx={{ bgcolor: "#6D8A7D15", color: "#6D8A7D", fontWeight: 600, fontSize: "0.65rem" }}
                            />
                        )}
                        <Tooltip title="Open link">
                            <IconButton size="small" component="a"
                                href={file.filePath} target="_blank" rel="noopener noreferrer"
                                sx={{ color: t.textTertiary, "&:hover": { color: t.accentPrimary } }}>
                                <OpenInNewOutlinedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                        </Tooltip>
                        {isOwner ? (
                            <>
                                <Tooltip title="Edit">
                                    <IconButton size="small" onClick={() => openEdit(file)}
                                        sx={{ color: t.textTertiary, "&:hover": { color: t.accentPrimary } }}>
                                        <EditOutlinedIcon sx={{ fontSize: 17 }} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <IconButton size="small" onClick={() => handleDeleteFile(file.id)}
                                        sx={{ color: t.textTertiary, "&:hover": { color: t.error ?? "#C47E7E" } }}>
                                        <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                                    </IconButton>
                                </Tooltip>
                            </>
                        ) : (
                            <Tooltip title="Only the uploader can edit or delete">
                                <Stack direction="row" alignItems="center" gap={0.4} sx={{
                                    px: 0.8, py: 0.4, borderRadius: 1.5, bgcolor: `${t.textTertiary}10`,
                                }}>
                                    <LockOutlinedIcon sx={{ fontSize: 12, color: t.textTertiary }} />
                                    <Typography sx={{ fontSize: "0.65rem", color: t.textTertiary }}>View only</Typography>
                                </Stack>
                            </Tooltip>
                        )}
                    </Stack>
                </Stack>

                {/* Feedback thread */}
                {renderFeedbackThread(file)}
            </Paper>
        );
    };

    // ── supervisor file card (read-only) ──────────────────────────────────────

    const renderSupFileCard = (file) => {
        const meta = TYPE_META[getFileType(file.filePath)];
        const displayName = getDisplayName(file);
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
                    <Stack direction="row" alignItems="flex-start" gap={1.5} sx={{ minWidth: 0 }}>
                        <Box sx={{
                            p: 0.9, borderRadius: 2, flexShrink: 0, mt: 0.2,
                            bgcolor: `${meta.color}15`, color: meta.color, "& svg": { fontSize: 22 },
                        }}>
                            {meta.icon}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Stack direction="row" alignItems="center" gap={0.8} mb={0.3} flexWrap="wrap">
                                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: t.textPrimary }}>
                                    {displayName}
                                </Typography>
                                <Chip label={meta.label} size="small" sx={{
                                    height: 16, fontSize: "0.58rem", fontWeight: 600,
                                    bgcolor: `${meta.color}12`, color: meta.color,
                                    "& .MuiChip-label": { px: 0.7 },
                                }} />
                            </Stack>
                            <Typography component="a" href={file.filePath}
                                target="_blank" rel="noopener noreferrer"
                                sx={{
                                    fontSize: "0.72rem", color: t.accentPrimary,
                                    textDecoration: "none", display: "block",
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                    maxWidth: 380, "&:hover": { textDecoration: "underline" },
                                }}>
                                {file.filePath}
                            </Typography>
                            {file.description?.trim() && (
                                <Typography sx={{ fontSize: "0.72rem", color: t.textSecondary, mt: 0.3 }}>
                                    {file.description}
                                </Typography>
                            )}
                            <Stack direction="row" alignItems="center" gap={0.6} mt={0.6}>
                                <SupervisorAccountOutlinedIcon sx={{ fontSize: 13, color: t.textTertiary }} />
                                <Typography sx={{ fontSize: "0.68rem", color: t.textTertiary }}>
                                    {file.uploadedByName
                                        ? `Shared by ${file.uploadedByName}`
                                        : "Shared by your supervisor"}
                                </Typography>
                                {file.uploadedAt && (
                                    <Typography sx={{ fontSize: "0.64rem", color: t.textTertiary }}>
                                        · {fmtDate(file.uploadedAt)}
                                    </Typography>
                                )}
                            </Stack>
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
                        onClick={openAdd} sx={{ bgcolor: t.accentPrimary, borderRadius: 2, flexShrink: 0 }}>
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
                    bgcolor: `${t.accentPrimary}08`, border: `1px solid ${t.accentPrimary}25`,
                    display: "flex", alignItems: "flex-start", gap: 1.5,
                }}>
                    <LinkOutlinedIcon sx={{ color: t.accentPrimary, mt: "2px", flexShrink: 0 }} />
                    <Box>
                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: t.textPrimary, mb: 0.3 }}>
                            Share links, not files
                        </Typography>
                        <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, lineHeight: 1.6 }}>
                            Upload to <strong>Google Drive</strong>, <strong>OneDrive</strong>, or{" "}
                            <strong>GitHub</strong>, then paste the link here.
                            Your supervisor can leave feedback and you can reply.{" "}
                            <strong>Only you can edit or delete files you uploaded.</strong>
                        </Typography>
                    </Box>
                </Paper>

                {deleteErr && (
                    <Alert severity="error" onClose={() => setDeleteErr(null)} sx={{ mb: 2, borderRadius: 2 }}>
                        {deleteErr}
                    </Alert>
                )}

                {(myLoading || feedbackLoading) && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                        <CircularProgress sx={{ color: t.accentPrimary }} />
                    </Box>
                )}
                {!myLoading && !feedbackLoading && myError && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>{myError}</Alert>
                )}
                {!myLoading && !feedbackLoading && !myError && myFiles.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                        <AddLinkOutlinedIcon sx={{ fontSize: 46, color: t.textTertiary, mb: 1.5 }} />
                        <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem", mb: 0.5 }}>No links yet.</Typography>
                        <Typography sx={{ color: t.textTertiary, fontSize: "0.8rem" }}>
                            Click <strong>Add Link</strong> to share a file with your supervisor.
                        </Typography>
                    </Box>
                )}
                {!myLoading && !feedbackLoading && !myError && myFiles.length > 0 && (
                    <Stack spacing={2}>{myFiles.map((f) => renderMyFileCard(f))}</Stack>
                )}
            </TabPanel>

            {/* ── TAB 1: SUPERVISOR FILES ── */}
            <TabPanel value={activeTab} index={1}>
                <Paper elevation={0} sx={{
                    p: 2, mb: 3, borderRadius: 3,
                    bgcolor: `${t.accentPrimary}08`, border: `1px solid ${t.accentPrimary}25`,
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
                {!supLoading && supError && <Alert severity="error" sx={{ borderRadius: 2 }}>{supError}</Alert>}
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
                            💡 Upload to <strong>Google Drive</strong>, <strong>OneDrive</strong>, or{" "}
                            <strong>GitHub</strong> first, then paste the link below.
                        </Typography>
                    </Paper>
                    <TextField fullWidth label="File Name"
                        placeholder="e.g. Project Report Phase 2"
                        value={form.fileName}
                        onChange={(e) => setForm((p) => ({ ...p, fileName: e.target.value }))}
                        sx={{ mb: 2 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <DriveFileRenameOutlineOutlinedIcon sx={{ color: t.textTertiary, fontSize: 18 }} />
                                </InputAdornment>
                            ),
                        }}
                    />
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
                        placeholder="e.g. Final report PDF for Phase 2"
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
                        startIcon={saving
                            ? <CircularProgress size={14} color="inherit" />
                            : <AddLinkOutlinedIcon />}
                        sx={{ bgcolor: t.accentPrimary, borderRadius: 2 }}>
                        {saving ? "Saving…" : editTarget ? "Save Changes" : "Add Link"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}