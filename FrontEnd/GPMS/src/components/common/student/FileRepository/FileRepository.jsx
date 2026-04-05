// src/components/common/student/FileRepository/FileRepository.jsx
//
// Student sees their uploaded links.
// Under each file they see supervisor feedback and can reply.
//
// FIX: feedbackMap is keyed by taskItemId (which supervisor sets = attachmentId).
//      So the lookup feedbackMap[file.attachmentId] is correct ONLY when
//      the backend echoes taskItemId === attachmentId on feedback items.
//      We keep that contract and add a safety fallback.

import { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Stack, Paper, Button, IconButton, Tooltip,
    CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, InputAdornment, Avatar, Divider, Collapse, Tabs, Tab, Badge,
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
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";

import fileSystemApi from "../../../../api/handler/endpoints/fileSystemApi";
import feedbackApi from "../../../../api/handler/endpoints/feedbackApi";
import { useAuth } from "../../../../contexts/AuthContext";

// ── helpers ───────────────────────────────────────────────────────────────────

const getFileType = (filePath = "") => {
    const lower = filePath.toLowerCase();
    if (lower.includes("drive.google") || lower.includes("docs.google")) return "gdrive";
    if (lower.includes("github.com")) return "github";
    if (lower.includes("onedrive") || lower.includes("sharepoint")) return "onedrive";
    return "link";
};

const TYPE_META = {
    gdrive: { color: "#4285F4", icon: <CloudOutlinedIcon /> },
    github: { color: "#6D8A7D", icon: <InsertDriveFileOutlinedIcon /> },
    onedrive: { color: "#0078D4", icon: <CloudOutlinedIcon /> },
    link: { color: "#9E9E9E", icon: <LinkOutlinedIcon /> },
};

const getDisplayName = (filePath = "", description = "") => {
    if (description) return description;
    try {
        const url = new URL(filePath);
        return url.hostname + (url.pathname.length > 1 ? url.pathname.slice(0, 36) + "…" : "");
    } catch { return filePath.slice(0, 50) || "Untitled link"; }
};

const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
    });
};

const getInitials = (name = "") =>
    name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

const AVATAR_COLORS = ["#C47E7E", "#C49A6C", "#7E9FC4", "#6D8A7D", "#9E86C4"];
const colorFor = (name = "") => AVATAR_COLORS[(name.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

const EMPTY_FORM = { filePath: "", description: "" };

// ── Tab panel wrapper ─────────────────────────────────────────────────────────
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

    // ── tab ───────────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState(0);

    // ── data ──────────────────────────────────────────────────────────────────
    const [files, setFiles] = useState([]);
    // feedbackMap: keyed by taskItemId (= attachmentId set by supervisor when creating feedback)
    const [feedbackMap, setFeedbackMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // add/edit link dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    // reply state
    const [replyBoxOpen, setReplyBoxOpen] = useState({});
    const [replyContent, setReplyContent] = useState({});
    const [replySaving, setReplySaving] = useState({});

    // edit reply state
    const [editingReply, setEditingReply] = useState(null);
    const [editReplySave, setEditReplySave] = useState(false);

    // ── fetch files + feedback ────────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const filesData = await fileSystemApi.getAllFiles();
            const fileList = Array.isArray(filesData) ? filesData : [];
            setFiles(fileList);

            if (teamId && fileList.length > 0) {
                const fbData = await feedbackApi.getFeedbackByTeam(Number(teamId));
                const map = {};
                // KEY FIX: taskItemId on feedback = attachmentId of the file
                (Array.isArray(fbData) ? fbData : []).forEach((fb) => {
                    const key = fb.taskItemId;
                    if (key === undefined || key === null) return; // skip unlinked feedback
                    if (!map[key]) map[key] = [];
                    map[key].push(fb);
                });
                setFeedbackMap(map);
            }
        } catch (err) {
            setError(err?.response?.data?.message ?? err?.message ?? "Failed to load files.");
        } finally {
            setLoading(false);
        }
    }, [teamId]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ── derived: files that have feedback (for "Review Requests" tab) ─────────
    const filesWithFeedback = files.filter(
        (f) => (feedbackMap[f.attachmentId] ?? []).length > 0
    );
    const totalPendingReplies = filesWithFeedback.reduce((acc, f) => {
        const fbs = feedbackMap[f.attachmentId] ?? [];
        // count feedback items that have NO reply from the current student yet
        const unanswered = fbs.filter(
            (fb) => !(fb.replies ?? []).some((r) => String(r.authorId) === currentUserId)
        ).length;
        return acc + unanswered;
    }, 0);

    // ── add / edit link dialog ────────────────────────────────────────────────
    const openAdd = () => {
        setEditTarget(null);
        setForm(EMPTY_FORM);
        setFormError("");
        setDialogOpen(true);
    };

    const openEdit = (f) => {
        setEditTarget(f);
        setForm({ filePath: f.filePath, description: f.description ?? "" });
        setFormError("");
        setDialogOpen(true);
    };

    const closeDialog = () => { if (!saving) setDialogOpen(false); };

    const handleSaveLink = async () => {
        if (!form.filePath.trim()) { setFormError("Please enter a link."); return; }
        try { new URL(form.filePath.trim()); }
        catch { setFormError("Please enter a valid URL starting with https://"); return; }

        setSaving(true);
        setFormError("");
        try {
            if (editTarget) {
                await fileSystemApi.editFile(editTarget.attachmentId, {
                    filePath: form.filePath.trim(),
                    description: form.description.trim(),
                });
            } else {
                await fileSystemApi.addFile({
                    filePath: form.filePath.trim(),
                    description: form.description.trim(),
                    taskItemId: 0,
                });
            }
            await fetchAll();
            setDialogOpen(false);
        } catch (err) {
            setFormError(err?.response?.data?.message ?? "Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    // ── delete file ───────────────────────────────────────────────────────────
    const handleDeleteFile = async (attachmentId) => {
        setFiles((prev) => prev.filter((f) => f.attachmentId !== attachmentId));
        try { await fileSystemApi.deleteFile(attachmentId); }
        catch { await fetchAll(); }
    };

    // ── reply to feedback ─────────────────────────────────────────────────────
    const toggleReplyBox = (feedbackId) => {
        setReplyBoxOpen((prev) => ({ ...prev, [feedbackId]: !prev[feedbackId] }));
        setReplyContent((prev) => ({ ...prev, [feedbackId]: "" }));
    };

    const handleSubmitReply = async (feedbackId) => {
        const content = (replyContent[feedbackId] ?? "").trim();
        if (!content) return;
        setReplySaving((prev) => ({ ...prev, [feedbackId]: true }));
        try {
            await feedbackApi.replyToFeedback({ content, parentFeedbackId: feedbackId });
            setReplyBoxOpen((prev) => ({ ...prev, [feedbackId]: false }));
            await fetchAll();
        } catch { /* keep box open */ }
        finally { setReplySaving((prev) => ({ ...prev, [feedbackId]: false })); }
    };

    // ── edit reply ────────────────────────────────────────────────────────────
    const handleSaveEditReply = async () => {
        if (!editingReply?.content.trim()) return;
        setEditReplySave(true);
        try {
            await feedbackApi.editReply(editingReply.replyId, editingReply.content.trim());
            setEditingReply(null);
            await fetchAll();
        } catch { /* keep open */ }
        finally { setEditReplySave(false); }
    };

    // ── delete reply ──────────────────────────────────────────────────────────
    const handleDeleteReply = async (replyId) => {
        try {
            await feedbackApi.deleteReply(replyId);
            await fetchAll();
        } catch { /* ignore */ }
    };

    // ── shared: render a single file card ────────────────────────────────────
    const renderFileCard = (file, { showFeedback = false, allowDelete = true } = {}) => {
        const type = getFileType(file.filePath);
        const meta = TYPE_META[type];
        const displayName = getDisplayName(file.filePath, file.description);
        const fileFeedbacks = feedbackMap[file.attachmentId] ?? [];
        const hasFeedback = fileFeedbacks.length > 0;

        return (
            <Paper key={file.attachmentId} elevation={1} sx={{
                borderRadius: 3,
                bgcolor: theme.palette.background.paper,
                overflow: "hidden",
                border: hasFeedback && showFeedback
                    ? `1px solid ${t.accentPrimary}40`
                    : "1px solid transparent",
            }}>
                {/* File row */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ sm: "center" }}
                    justifyContent="space-between"
                    gap={1.5}
                    sx={{ p: 2.5 }}
                >
                    <Stack direction="row" alignItems="center" gap={1.5}>
                        <Box sx={{
                            p: 0.8, borderRadius: 2,
                            bgcolor: `${meta.color}15`, color: meta.color,
                            "& svg": { fontSize: 20 },
                        }}>
                            {meta.icon}
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: t.textPrimary }}>
                                {displayName}
                            </Typography>
                            <Typography component="a" href={file.filePath}
                                target="_blank" rel="noopener noreferrer"
                                sx={{
                                    fontSize: "0.72rem", color: t.accentPrimary,
                                    textDecoration: "none",
                                    "&:hover": { textDecoration: "underline" },
                                    display: "block", maxWidth: 380,
                                    overflow: "hidden", textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}>
                                {file.filePath}
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack direction="row" alignItems="center" gap={0.5} sx={{ flexShrink: 0 }}>
                        {hasFeedback && (
                            <Tooltip title="Has supervisor feedback">
                                <ChatBubbleOutlineOutlinedIcon
                                    sx={{ fontSize: 16, color: t.accentPrimary, mr: 0.5 }} />
                            </Tooltip>
                        )}
                        <Tooltip title="Open link">
                            <IconButton size="small" component="a"
                                href={file.filePath} target="_blank" rel="noopener noreferrer"
                                sx={{ color: t.textTertiary, "&:hover": { color: t.accentPrimary } }}>
                                <OpenInNewOutlinedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => openEdit(file)}
                                sx={{ color: t.textTertiary, "&:hover": { color: t.accentPrimary } }}>
                                <EditOutlinedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                        </Tooltip>
                        {allowDelete && (
                            <Tooltip title="Delete">
                                <IconButton size="small" onClick={() => handleDeleteFile(file.attachmentId)}
                                    sx={{ color: t.textTertiary, "&:hover": { color: t.error } }}>
                                    <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                </Stack>

                {/* Feedback + replies */}
                {showFeedback && hasFeedback && (
                    <>
                        <Divider sx={{ borderColor: t.borderLight }} />
                        <Box sx={{ px: 2.5, py: 2, bgcolor: `${t.surfaceHover}50` }}>
                            <Typography sx={{
                                fontSize: "0.72rem", fontWeight: 700,
                                color: t.accentPrimary, textTransform: "uppercase",
                                letterSpacing: "0.06em", mb: 1.5,
                            }}>
                                💬 Supervisor Feedback
                            </Typography>

                            <Stack spacing={2}>
                                {fileFeedbacks.map((fb) => (
                                    <Box key={fb.feedbackId}>
                                        {/* Feedback bubble */}
                                        <Stack direction="row" gap={1.2} alignItems="flex-start">
                                            <Avatar sx={{
                                                width: 32, height: 32,
                                                bgcolor: colorFor(fb.authorName),
                                                fontSize: "0.72rem", fontWeight: 700,
                                            }}>
                                                {getInitials(fb.authorName)}
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.3}>
                                                    <Stack direction="row" gap={1} alignItems="center">
                                                        <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: t.textPrimary }}>
                                                            {fb.authorName}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: "0.68rem", color: t.textTertiary }}>
                                                            {formatDate(fb.createdAt)}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                                <Paper elevation={0} sx={{
                                                    p: 1.2, borderRadius: 2,
                                                    bgcolor: `${t.accentPrimary}08`,
                                                    border: `1px solid ${t.accentPrimary}20`,
                                                }}>
                                                    <Typography sx={{ fontSize: "0.84rem", color: t.textSecondary, lineHeight: 1.5 }}>
                                                        {fb.content}
                                                    </Typography>
                                                </Paper>

                                                {/* Reply button */}
                                                <Button size="small"
                                                    startIcon={<ReplyOutlinedIcon sx={{ fontSize: 13 }} />}
                                                    onClick={() => toggleReplyBox(fb.feedbackId)}
                                                    sx={{
                                                        mt: 0.5, fontSize: "0.72rem",
                                                        color: t.textTertiary,
                                                        "&:hover": { color: t.accentPrimary },
                                                    }}>
                                                    {replyBoxOpen[fb.feedbackId] ? "Cancel" : "Reply"}
                                                </Button>
                                            </Box>
                                        </Stack>

                                        {/* Existing replies */}
                                        {(fb.replies ?? []).length > 0 && (
                                            <Box sx={{ mt: 1, ml: 5.5, pl: 1.5, borderLeft: `2px solid ${t.borderLight}` }}>
                                                <Stack spacing={1}>
                                                    {fb.replies.map((reply) => {
                                                        const isMyReply = String(reply.authorId) === currentUserId;
                                                        const isEditingThis = editingReply?.replyId === reply.replyId;
                                                        return (
                                                            <Stack key={reply.replyId} direction="row" gap={1} alignItems="flex-start">
                                                                <Avatar sx={{
                                                                    width: 24, height: 24,
                                                                    bgcolor: colorFor(reply.authorName),
                                                                    fontSize: "0.6rem",
                                                                }}>
                                                                    {getInitials(reply.authorName)}
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
                                                                        {isMyReply && !isEditingThis && (
                                                                            <Stack direction="row">
                                                                                <Tooltip title="Edit">
                                                                                    <IconButton size="small"
                                                                                        onClick={() => setEditingReply({ replyId: reply.replyId, content: reply.content })}
                                                                                        sx={{ color: t.textTertiary, "&:hover": { color: t.accentPrimary } }}>
                                                                                        <EditOutlinedIcon sx={{ fontSize: 13 }} />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                                <Tooltip title="Delete">
                                                                                    <IconButton size="small"
                                                                                        onClick={() => handleDeleteReply(reply.replyId)}
                                                                                        sx={{ color: t.textTertiary, "&:hover": { color: t.error } }}>
                                                                                        <DeleteOutlineIcon sx={{ fontSize: 13 }} />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                            </Stack>
                                                                        )}
                                                                    </Stack>
                                                                    {isEditingThis ? (
                                                                        <Stack gap={0.8} mt={0.5}>
                                                                            <TextField fullWidth size="small"
                                                                                value={editingReply.content}
                                                                                onChange={(e) => setEditingReply((p) => ({ ...p, content: e.target.value }))} />
                                                                            <Stack direction="row" gap={1}>
                                                                                <Button size="small" variant="contained"
                                                                                    startIcon={editReplySave ? <CircularProgress size={11} color="inherit" /> : <CheckOutlinedIcon sx={{ fontSize: 12 }} />}
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
                                                                        <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary }}>
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

                                        {/* Reply input box */}
                                        <Collapse in={Boolean(replyBoxOpen[fb.feedbackId])}>
                                            <Stack direction="row" gap={1} alignItems="flex-start"
                                                sx={{ mt: 1, ml: 5.5 }}>
                                                <Avatar sx={{
                                                    width: 24, height: 24,
                                                    bgcolor: t.accentPrimary,
                                                    fontSize: "0.6rem",
                                                }}>
                                                    {getInitials(user?.name ?? "Me")}
                                                </Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <TextField fullWidth size="small" multiline minRows={1}
                                                        placeholder="Write your reply…"
                                                        value={replyContent[fb.feedbackId] ?? ""}
                                                        onChange={(e) => setReplyContent((p) => ({ ...p, [fb.feedbackId]: e.target.value }))}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter" && e.ctrlKey) handleSubmitReply(fb.feedbackId);
                                                        }}
                                                        sx={{ mb: 0.8 }}
                                                    />
                                                    <Button size="small" variant="contained"
                                                        endIcon={replySaving[fb.feedbackId]
                                                            ? <CircularProgress size={11} color="inherit" />
                                                            : <SendOutlinedIcon sx={{ fontSize: 13 }} />}
                                                        onClick={() => handleSubmitReply(fb.feedbackId)}
                                                        disabled={replySaving[fb.feedbackId] || !(replyContent[fb.feedbackId] ?? "").trim()}
                                                        sx={{ bgcolor: t.accentPrimary, borderRadius: 2, fontSize: "0.72rem" }}>
                                                        {replySaving[fb.feedbackId] ? "Sending…" : "Reply"}
                                                    </Button>
                                                </Box>
                                            </Stack>
                                        </Collapse>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    </>
                )}
            </Paper>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <Box sx={{ maxWidth: 900 }}>

            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                    <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>Files</Typography>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                        {files.length} link{files.length !== 1 ? "s" : ""} saved
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddLinkOutlinedIcon />}
                    onClick={openAdd} sx={{ bgcolor: t.accentPrimary, borderRadius: 2 }}>
                    Add Link
                </Button>
            </Stack>

            {/* Tabs */}
            <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                sx={{
                    borderBottom: `1px solid ${t.borderLight}`,
                    mb: 0,
                    "& .MuiTab-root": { fontSize: "0.85rem", textTransform: "none", fontWeight: 600 },
                }}
            >
                <Tab
                    icon={<FolderOutlinedIcon sx={{ fontSize: 17 }} />}
                    iconPosition="start"
                    label="My Files"
                />
                <Tab
                    icon={
                        <Badge badgeContent={totalPendingReplies} color="error" max={9}
                            sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", minWidth: 16, height: 16 } }}>
                            <RateReviewOutlinedIcon sx={{ fontSize: 17 }} />
                        </Badge>
                    }
                    iconPosition="start"
                    label="Review Requests"
                />
            </Tabs>

            {/* Loading */}
            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress sx={{ color: t.accentPrimary }} />
                </Box>
            )}

            {/* Error */}
            {!loading && error && (
                <Alert severity="error" sx={{ borderRadius: 2, mt: 2 }}>{error}</Alert>
            )}

            {/* ── Tab 0: My Files ── */}
            {!loading && !error && (
                <TabPanel value={activeTab} index={0}>
                    {/* Info banner */}
                    <Paper elevation={0} sx={{
                        p: 2, mb: 3, borderRadius: 3,
                        bgcolor: `${t.accentPrimary}10`,
                        border: `1px solid ${t.accentPrimary}30`,
                        display: "flex", alignItems: "flex-start", gap: 1.5,
                    }}>
                        <LinkOutlinedIcon sx={{ color: t.accentPrimary, mt: "2px", flexShrink: 0 }} />
                        <Box>
                            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: t.textPrimary, mb: 0.3 }}>
                                Share links, not files
                            </Typography>
                            <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, lineHeight: 1.6 }}>
                                Upload your files to <strong>Google Drive</strong>, <strong>OneDrive</strong>,
                                or <strong>GitHub</strong>, then paste the shareable link here.
                            </Typography>
                        </Box>
                    </Paper>

                    {files.length === 0 ? (
                        <Box sx={{ textAlign: "center", py: 8 }}>
                            <AddLinkOutlinedIcon sx={{ fontSize: 48, color: t.textTertiary, mb: 1.5 }} />
                            <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem", mb: 0.5 }}>
                                No links yet.
                            </Typography>
                            <Typography sx={{ color: t.textTertiary, fontSize: "0.8rem" }}>
                                Click <strong>Add Link</strong> to share a file from Google Drive, GitHub, or any cloud service.
                            </Typography>
                        </Box>
                    ) : (
                        <Stack spacing={2}>
                            {files.map((file) => renderFileCard(file, { showFeedback: false, allowDelete: true }))}
                        </Stack>
                    )}
                </TabPanel>
            )}

            {/* ── Tab 1: Review Requests ── */}
            {!loading && !error && (
                <TabPanel value={activeTab} index={1}>
                    {filesWithFeedback.length === 0 ? (
                        <Box sx={{ textAlign: "center", py: 8 }}>
                            <RateReviewOutlinedIcon sx={{ fontSize: 48, color: t.textTertiary, mb: 1.5 }} />
                            <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem", mb: 0.5 }}>
                                No review requests yet.
                            </Typography>
                            <Typography sx={{ color: t.textTertiary, fontSize: "0.8rem" }}>
                                Your supervisor's feedback on your files will appear here.
                            </Typography>
                        </Box>
                    ) : (
                        <Stack spacing={2}>
                            {filesWithFeedback.map((file) =>
                                renderFileCard(file, { showFeedback: true, allowDelete: false })
                            )}
                        </Stack>
                    )}
                </TabPanel>
            )}

            {/* Add / Edit Link Dialog */}
            <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ color: t.textPrimary, fontWeight: 700, pb: 1 }}>
                    {editTarget ? "Edit Link" : "Add New Link"}
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Paper elevation={0} sx={{
                        p: 1.5, mb: 2.5, borderRadius: 2,
                        bgcolor: `${t.accentPrimary}08`,
                        border: `1px dashed ${t.accentPrimary}40`,
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
                        placeholder="e.g. Final proposal PDF"
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
                    <Button onClick={closeDialog} disabled={saving} sx={{ color: t.textSecondary }}>
                        Cancel
                    </Button>
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