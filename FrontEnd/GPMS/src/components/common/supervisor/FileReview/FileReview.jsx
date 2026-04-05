// src/components/common/supervisor/FileReview/FileReview.jsx
//
// Supervisor has two tabs:
//   1. "My Files"     – supervisor uploads their own links (templates, examples, etc.)
//                       Students can view these but NOT delete them.
//   2. "Review Teams" – supervisor reviews student files and sends feedback.
//
// FIX: feedbackMap keyed by taskItemId (= attachmentId) — consistent with student side.
// FIX: supervisor files use the same /api/FileSystem endpoints (backend scopes by user).

import { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Stack, Paper, Button, IconButton, Tooltip,
    CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, Select, FormControl,
    InputLabel, Chip, Avatar, Divider, Tabs, Tab,
    InputAdornment,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import AddLinkOutlinedIcon from "@mui/icons-material/AddLinkOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FolderSharedOutlinedIcon from "@mui/icons-material/FolderSharedOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

import { getSupervisorTeams } from "../../../../api/handler/endpoints/supervisorApi";
import fileSystemApi from "../../../../api/handler/endpoints/fileSystemApi";
import feedbackApi from "../../../../api/handler/endpoints/feedbackApi";

// ── helpers ───────────────────────────────────────────────────────────────────

const getFileType = (filePath = "") => {
    const lower = filePath.toLowerCase();
    if (lower.includes("drive.google") || lower.includes("docs.google")) return "gdrive";
    if (lower.includes("github.com")) return "github";
    if (lower.includes("onedrive") || lower.includes("sharepoint")) return "onedrive";
    return "link";
};

const TYPE_META = {
    gdrive: { label: "Google Drive", color: "#4285F4", icon: <CloudOutlinedIcon /> },
    github: { label: "GitHub", color: "#6D8A7D", icon: <InsertDriveFileOutlinedIcon /> },
    onedrive: { label: "OneDrive", color: "#0078D4", icon: <CloudOutlinedIcon /> },
    link: { label: "Link", color: "#9E9E9E", icon: <LinkOutlinedIcon /> },
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

export default function FileReview() {
    const theme = useTheme();
    const t = theme.palette.custom;

    // ── tab ───────────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState(0);

    // ── supervisor's own files ────────────────────────────────────────────────
    const [myFiles, setMyFiles] = useState([]);
    const [myFilesLoading, setMyFilesLoading] = useState(true);
    const [myFilesError, setMyFilesError] = useState(null);

    // add/edit own file dialog
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState("");
    const [formSaving, setFormSaving] = useState(false);

    // ── review: teams + student files ─────────────────────────────────────────
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState("");
    const [studentFiles, setStudentFiles] = useState([]);
    const [feedbackMap, setFeedbackMap] = useState({}); // attachmentId → feedback[]
    const [loadingTeams, setLoadingTeams] = useState(true);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [teamsError, setTeamsError] = useState(null);
    const [filesError, setFilesError] = useState(null);

    // feedback send dialog
    const [fbDialogOpen, setFbDialogOpen] = useState(false);
    const [fbDialogFile, setFbDialogFile] = useState(null);
    const [fbContent, setFbContent] = useState("");
    const [fbSaving, setFbSaving] = useState(false);
    const [fbError, setFbError] = useState("");

    // ── load supervisor's own files ───────────────────────────────────────────
    const fetchMyFiles = useCallback(async () => {
        setMyFilesLoading(true);
        setMyFilesError(null);
        try {
            const data = await fileSystemApi.getAllFiles();
            setMyFiles(Array.isArray(data) ? data : []);
        } catch (err) {
            setMyFilesError(err?.response?.data?.message ?? err?.message ?? "Failed to load files.");
        } finally {
            setMyFilesLoading(false);
        }
    }, []);

    useEffect(() => { fetchMyFiles(); }, [fetchMyFiles]);

    // ── load teams once ───────────────────────────────────────────────────────
    useEffect(() => {
        getSupervisorTeams()
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setTeams(list);
                if (list.length > 0) setSelectedTeam(String(list[0].teamId));
            })
            .catch((err) => setTeamsError(err?.message ?? "Failed to load teams."))
            .finally(() => setLoadingTeams(false));
    }, []);

    // ── load student files + feedback when team changes ───────────────────────
    const loadStudentFilesAndFeedback = useCallback(async (teamId) => {
        if (!teamId) return;
        setLoadingFiles(true);
        setFilesError(null);
        setStudentFiles([]);
        setFeedbackMap({});
        try {
            const [filesData, fbData] = await Promise.all([
                fileSystemApi.getAllFiles(),           // scoped to selected team by backend
                feedbackApi.getFeedbackByTeam(Number(teamId)),
            ]);
            setStudentFiles(Array.isArray(filesData) ? filesData : []);

            // KEY FIX: taskItemId on feedback === attachmentId of the file
            const map = {};
            (Array.isArray(fbData) ? fbData : []).forEach((fb) => {
                const key = fb.taskItemId;
                if (key === undefined || key === null) return;
                if (!map[key]) map[key] = [];
                map[key].push(fb);
            });
            setFeedbackMap(map);
        } catch (err) {
            setFilesError(err?.response?.data?.message ?? err?.message ?? "Failed to load data.");
        } finally {
            setLoadingFiles(false);
        }
    }, []);

    useEffect(() => {
        if (selectedTeam) loadStudentFilesAndFeedback(selectedTeam);
    }, [selectedTeam, loadStudentFilesAndFeedback]);

    // ── own file: add / edit / delete ─────────────────────────────────────────
    const openAdd = () => {
        setEditTarget(null);
        setForm(EMPTY_FORM);
        setFormError("");
        setAddDialogOpen(true);
    };

    const openEdit = (f) => {
        setEditTarget(f);
        setForm({ filePath: f.filePath, description: f.description ?? "" });
        setFormError("");
        setAddDialogOpen(true);
    };

    const handleSaveOwnFile = async () => {
        if (!form.filePath.trim()) { setFormError("Please enter a link."); return; }
        try { new URL(form.filePath.trim()); }
        catch { setFormError("Please enter a valid URL starting with https://"); return; }

        setFormSaving(true);
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
            await fetchMyFiles();
            setAddDialogOpen(false);
        } catch (err) {
            setFormError(err?.response?.data?.message ?? "Something went wrong.");
        } finally {
            setFormSaving(false);
        }
    };

    const handleDeleteOwnFile = async (attachmentId) => {
        setMyFiles((prev) => prev.filter((f) => f.attachmentId !== attachmentId));
        try { await fileSystemApi.deleteFile(attachmentId); }
        catch { await fetchMyFiles(); }
    };

    // ── open feedback dialog ──────────────────────────────────────────────────
    const openFeedback = (file) => {
        setFbDialogFile(file);
        setFbContent("");
        setFbError("");
        setFbDialogOpen(true);
    };

    // ── submit feedback ───────────────────────────────────────────────────────
    const handleSendFeedback = async () => {
        if (!fbContent.trim()) { setFbError("Please write feedback first."); return; }
        setFbSaving(true);
        setFbError("");
        try {
            await feedbackApi.createFeedback({
                content: fbContent.trim(),
                teamId: Number(selectedTeam),
                // KEY: taskItemId = attachmentId so student's feedbackMap lookup works
                taskItemId: fbDialogFile.attachmentId,
            });
            setFbDialogOpen(false);
            await loadStudentFilesAndFeedback(selectedTeam);
        } catch (err) {
            setFbError(err?.response?.data?.message ?? "Failed to send feedback.");
        } finally {
            setFbSaving(false);
        }
    };

    // ── delete feedback ───────────────────────────────────────────────────────
    const handleDeleteFeedback = async (feedbackId, attachmentId) => {
        try {
            await feedbackApi.deleteFeedback(feedbackId);
            setFeedbackMap((prev) => ({
                ...prev,
                [attachmentId]: (prev[attachmentId] ?? []).filter((f) => f.feedbackId !== feedbackId),
            }));
        } catch { /* ignore */ }
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <Box sx={{ maxWidth: 940 }}>

            {/* ── Header ── */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                    <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>Files</Typography>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                        Share resources with students or review their submitted links
                    </Typography>
                </Box>

                {/* Show Add button only on My Files tab */}
                {activeTab === 0 && (
                    <Button variant="contained" startIcon={<AddLinkOutlinedIcon />}
                        onClick={openAdd}
                        sx={{ bgcolor: t.accentPrimary, borderRadius: 2 }}>
                        Add Link
                    </Button>
                )}

                {/* Team selector on Review tab */}
                {activeTab === 1 && !loadingTeams && teams.length > 0 && (
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>Team</InputLabel>
                        <Select
                            label="Team"
                            value={selectedTeam}
                            onChange={(e) => setSelectedTeam(e.target.value)}
                        >
                            {teams.map((tm) => (
                                <MenuItem key={tm.teamId} value={String(tm.teamId)}>
                                    {tm.teamName ?? tm.projectTitle ?? `Team #${tm.teamId}`}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </Stack>

            {/* ── Tabs ── */}
            <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                sx={{
                    borderBottom: `1px solid ${t.borderLight}`,
                    "& .MuiTab-root": { fontSize: "0.85rem", textTransform: "none", fontWeight: 600 },
                }}
            >
                <Tab
                    icon={<FolderSharedOutlinedIcon sx={{ fontSize: 17 }} />}
                    iconPosition="start"
                    label="My Files"
                />
                <Tab
                    icon={<RateReviewOutlinedIcon sx={{ fontSize: 17 }} />}
                    iconPosition="start"
                    label="Review Teams"
                />
            </Tabs>

            {/* ══════════════════════════════════════════════════════════════
                TAB 0 — MY FILES (supervisor's own uploads / templates)
            ══════════════════════════════════════════════════════════════ */}
            <TabPanel value={activeTab} index={0}>

                {/* Info banner */}
                <Paper elevation={0} sx={{
                    p: 2, mb: 3, borderRadius: 3,
                    bgcolor: `${t.accentPrimary}10`,
                    border: `1px solid ${t.accentPrimary}30`,
                    display: "flex", alignItems: "flex-start", gap: 1.5,
                }}>
                    <FolderSharedOutlinedIcon sx={{ color: t.accentPrimary, mt: "2px", flexShrink: 0 }} />
                    <Box>
                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: t.textPrimary, mb: 0.3 }}>
                            Share resources with your students
                        </Typography>
                        <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, lineHeight: 1.6 }}>
                            Add links to templates, example projects, reference documents, or any resource you want your students to access.
                        </Typography>
                    </Box>
                </Paper>

                {myFilesLoading && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                        <CircularProgress sx={{ color: t.accentPrimary }} />
                    </Box>
                )}

                {!myFilesLoading && myFilesError && (
                    <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>{myFilesError}</Alert>
                )}

                {!myFilesLoading && !myFilesError && myFiles.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                        <AddLinkOutlinedIcon sx={{ fontSize: 48, color: t.textTertiary, mb: 1.5 }} />
                        <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem", mb: 0.5 }}>
                            No files shared yet.
                        </Typography>
                        <Typography sx={{ color: t.textTertiary, fontSize: "0.8rem" }}>
                            Click <strong>Add Link</strong> to share a template or resource with your students.
                        </Typography>
                    </Box>
                )}

                {!myFilesLoading && !myFilesError && myFiles.length > 0 && (
                    <Stack spacing={2}>
                        {myFiles.map((file) => {
                            const type = getFileType(file.filePath);
                            const meta = TYPE_META[type];
                            const displayName = getDisplayName(file.filePath, file.description);

                            return (
                                <Paper key={file.attachmentId} elevation={1} sx={{
                                    borderRadius: 3,
                                    bgcolor: theme.palette.background.paper,
                                    overflow: "hidden",
                                }}>
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
                                                        display: "block", maxWidth: 400,
                                                        overflow: "hidden", textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}>
                                                    {file.filePath}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Stack direction="row" alignItems="center" gap={0.5} sx={{ flexShrink: 0 }}>
                                            <Chip size="small" label="Shared with students"
                                                sx={{
                                                    bgcolor: `${t.accentPrimary}12`,
                                                    color: t.accentPrimary,
                                                    fontSize: "0.68rem", fontWeight: 600,
                                                }} />
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
                                            <Tooltip title="Delete">
                                                <IconButton size="small"
                                                    onClick={() => handleDeleteOwnFile(file.attachmentId)}
                                                    sx={{ color: t.textTertiary, "&:hover": { color: t.error } }}>
                                                    <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            );
                        })}
                    </Stack>
                )}
            </TabPanel>

            {/* ══════════════════════════════════════════════════════════════
                TAB 1 — REVIEW TEAMS (student files + feedback)
            ══════════════════════════════════════════════════════════════ */}
            <TabPanel value={activeTab} index={1}>

                {loadingTeams && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                        <CircularProgress sx={{ color: t.accentPrimary }} />
                    </Box>
                )}

                {!loadingTeams && teamsError && (
                    <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>{teamsError}</Alert>
                )}

                {!loadingTeams && !teamsError && teams.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                        <PeopleOutlinedIcon sx={{ fontSize: 48, color: t.textTertiary, mb: 1.5 }} />
                        <Typography sx={{ color: t.textSecondary }}>No teams assigned to you yet.</Typography>
                    </Box>
                )}

                {!loadingTeams && teams.length > 0 && (
                    <>
                        {loadingFiles && (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                                <CircularProgress sx={{ color: t.accentPrimary }} />
                            </Box>
                        )}

                        {!loadingFiles && filesError && (
                            <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>{filesError}</Alert>
                        )}

                        {!loadingFiles && !filesError && studentFiles.length === 0 && (
                            <Box sx={{ textAlign: "center", py: 8 }}>
                                <LinkOutlinedIcon sx={{ fontSize: 48, color: t.textTertiary, mb: 1.5 }} />
                                <Typography sx={{ color: t.textSecondary }}>
                                    This team hasn't uploaded any links yet.
                                </Typography>
                            </Box>
                        )}

                        {!loadingFiles && !filesError && studentFiles.length > 0 && (
                            <Stack spacing={2}>
                                {studentFiles.map((file) => {
                                    const type = getFileType(file.filePath);
                                    const meta = TYPE_META[type];
                                    const displayName = getDisplayName(file.filePath, file.description);
                                    // KEY FIX: lookup by attachmentId which equals taskItemId set on feedback
                                    const fileFeedbacks = feedbackMap[file.attachmentId] ?? [];

                                    return (
                                        <Paper key={file.attachmentId} elevation={1} sx={{
                                            borderRadius: 3,
                                            bgcolor: theme.palette.background.paper,
                                            overflow: "hidden",
                                        }}>
                                            {/* File row */}
                                            <Stack
                                                direction={{ xs: "column", sm: "row" }}
                                                alignItems={{ sm: "center" }}
                                                justifyContent="space-between"
                                                gap={2}
                                                sx={{ p: 2.5 }}
                                            >
                                                <Stack direction="row" alignItems="center" gap={1.5}>
                                                    <Box sx={{
                                                        p: 1, borderRadius: 2,
                                                        bgcolor: `${meta.color}15`,
                                                        color: meta.color,
                                                        "& svg": { fontSize: 22 },
                                                    }}>
                                                        {meta.icon}
                                                    </Box>
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: t.textPrimary }}>
                                                            {displayName}
                                                        </Typography>
                                                        <Typography
                                                            component="a"
                                                            href={file.filePath}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            sx={{
                                                                fontSize: "0.72rem", color: t.accentPrimary,
                                                                textDecoration: "none",
                                                                "&:hover": { textDecoration: "underline" },
                                                                display: "block", maxWidth: 380,
                                                                overflow: "hidden", textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            {file.filePath}
                                                        </Typography>
                                                    </Box>
                                                </Stack>

                                                <Stack direction="row" alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
                                                    {fileFeedbacks.length > 0 && (
                                                        <Chip
                                                            size="small"
                                                            icon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: "13px !important" }} />}
                                                            label={`${fileFeedbacks.length} feedback`}
                                                            sx={{
                                                                bgcolor: `${t.accentPrimary}15`,
                                                                color: t.accentPrimary,
                                                                fontWeight: 600, fontSize: "0.7rem",
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
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<CommentOutlinedIcon sx={{ fontSize: 15 }} />}
                                                        onClick={() => openFeedback(file)}
                                                        sx={{
                                                            borderColor: t.accentPrimary,
                                                            color: t.accentPrimary,
                                                            borderRadius: 2,
                                                            fontSize: "0.78rem",
                                                            "&:hover": { bgcolor: `${t.accentPrimary}10` },
                                                        }}
                                                    >
                                                        Add Feedback
                                                    </Button>
                                                </Stack>
                                            </Stack>

                                            {/* Feedback thread */}
                                            {fileFeedbacks.length > 0 && (
                                                <>
                                                    <Divider sx={{ borderColor: t.borderLight }} />
                                                    <Box sx={{ px: 2.5, py: 2, bgcolor: `${t.surfaceHover}60` }}>
                                                        <Typography sx={{
                                                            fontSize: "0.72rem", fontWeight: 700,
                                                            color: t.textTertiary, textTransform: "uppercase",
                                                            letterSpacing: "0.06em", mb: 1.5,
                                                        }}>
                                                            Your Feedback
                                                        </Typography>
                                                        <Stack spacing={1.5}>
                                                            {fileFeedbacks.map((fb) => (
                                                                <Stack key={fb.feedbackId} direction="row" gap={1.2} alignItems="flex-start">
                                                                    <Avatar sx={{
                                                                        width: 30, height: 30,
                                                                        bgcolor: colorFor(fb.authorName),
                                                                        fontSize: "0.72rem", fontWeight: 700,
                                                                    }}>
                                                                        {getInitials(fb.authorName)}
                                                                    </Avatar>
                                                                    <Box sx={{ flex: 1 }}>
                                                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                                            <Stack direction="row" gap={1} alignItems="center">
                                                                                <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: t.textPrimary }}>
                                                                                    {fb.authorName}
                                                                                </Typography>
                                                                                <Typography sx={{ fontSize: "0.68rem", color: t.textTertiary }}>
                                                                                    {formatDate(fb.createdAt)}
                                                                                </Typography>
                                                                            </Stack>
                                                                            <Tooltip title="Delete feedback">
                                                                                <IconButton size="small"
                                                                                    onClick={() => handleDeleteFeedback(fb.feedbackId, file.attachmentId)}
                                                                                    sx={{ color: t.textTertiary, "&:hover": { color: t.error } }}>
                                                                                    <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </Stack>
                                                                        <Typography sx={{ fontSize: "0.84rem", color: t.textSecondary, lineHeight: 1.5 }}>
                                                                            {fb.content}
                                                                        </Typography>
                                                                        {/* Student replies */}
                                                                        {(fb.replies ?? []).length > 0 && (
                                                                            <Box sx={{ mt: 1, pl: 2, borderLeft: `2px solid ${t.borderLight}` }}>
                                                                                {fb.replies.map((reply) => (
                                                                                    <Stack key={reply.replyId} direction="row" gap={1} alignItems="flex-start" mb={0.8}>
                                                                                        <Avatar sx={{
                                                                                            width: 22, height: 22,
                                                                                            bgcolor: colorFor(reply.authorName),
                                                                                            fontSize: "0.6rem",
                                                                                        }}>
                                                                                            {getInitials(reply.authorName)}
                                                                                        </Avatar>
                                                                                        <Box>
                                                                                            <Stack direction="row" gap={0.8} alignItems="center">
                                                                                                <Typography sx={{ fontWeight: 600, fontSize: "0.75rem", color: t.textPrimary }}>
                                                                                                    {reply.authorName}
                                                                                                </Typography>
                                                                                                <Typography sx={{ fontSize: "0.65rem", color: t.textTertiary }}>
                                                                                                    {formatDate(reply.createdAt)}
                                                                                                </Typography>
                                                                                            </Stack>
                                                                                            <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary }}>
                                                                                                {reply.content}
                                                                                            </Typography>
                                                                                        </Box>
                                                                                    </Stack>
                                                                                ))}
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                </Stack>
                                                            ))}
                                                        </Stack>
                                                    </Box>
                                                </>
                                            )}
                                        </Paper>
                                    );
                                })}
                            </Stack>
                        )}
                    </>
                )}
            </TabPanel>

            {/* ══════════════════════════════════════════════════════════════
                DIALOG — Add / Edit own file
            ══════════════════════════════════════════════════════════════ */}
            <Dialog open={addDialogOpen} onClose={() => !formSaving && setAddDialogOpen(false)}
                maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ color: t.textPrimary, fontWeight: 700, pb: 1 }}>
                    {editTarget ? "Edit File Link" : "Share a File with Students"}
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Paper elevation={0} sx={{
                        p: 1.5, mb: 2.5, borderRadius: 2,
                        bgcolor: `${t.accentPrimary}08`,
                        border: `1px dashed ${t.accentPrimary}40`,
                    }}>
                        <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, lineHeight: 1.6 }}>
                            💡 Upload the file to <strong>Google Drive</strong>, <strong>OneDrive</strong>,
                            or <strong>GitHub</strong> first, then paste the shareable link below.
                            All your students will be able to view this link.
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
                        placeholder="e.g. Project report template"
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
                    <Button onClick={() => setAddDialogOpen(false)} disabled={formSaving}
                        sx={{ color: t.textSecondary }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSaveOwnFile} disabled={formSaving}
                        startIcon={formSaving
                            ? <CircularProgress size={14} color="inherit" />
                            : <AddLinkOutlinedIcon />}
                        sx={{ bgcolor: t.accentPrimary, borderRadius: 2 }}>
                        {formSaving ? "Saving…" : editTarget ? "Save Changes" : "Share Link"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ══════════════════════════════════════════════════════════════
                DIALOG — Send Feedback
            ══════════════════════════════════════════════════════════════ */}
            <Dialog open={fbDialogOpen} onClose={() => !fbSaving && setFbDialogOpen(false)}
                maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, color: t.textPrimary, pb: 0.5 }}>
                    Send Feedback
                </DialogTitle>
                <DialogContent sx={{ pt: 1.5 }}>
                    {fbDialogFile && (
                        <Paper elevation={0} sx={{
                            p: 1.5, mb: 2, borderRadius: 2,
                            bgcolor: t.surfaceHover,
                            border: `1px solid ${t.borderLight}`,
                        }}>
                            <Stack direction="row" gap={1} alignItems="center">
                                <LinkOutlinedIcon sx={{ fontSize: 16, color: t.textTertiary }} />
                                <Typography sx={{
                                    fontSize: "0.8rem", color: t.textSecondary,
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                                }}>
                                    {getDisplayName(fbDialogFile.filePath, fbDialogFile.description)}
                                </Typography>
                            </Stack>
                        </Paper>
                    )}
                    <TextField
                        fullWidth multiline minRows={3}
                        label="Your feedback"
                        placeholder="Write your comments or revision requests…"
                        value={fbContent}
                        onChange={(e) => setFbContent(e.target.value)}
                        error={Boolean(fbError)}
                    />
                    {fbError && (
                        <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2, fontSize: "0.8rem" }}>
                            {fbError}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button onClick={() => setFbDialogOpen(false)} disabled={fbSaving}
                        sx={{ color: t.textSecondary }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSendFeedback} disabled={fbSaving}
                        endIcon={fbSaving
                            ? <CircularProgress size={14} color="inherit" />
                            : <SendOutlinedIcon sx={{ fontSize: 15 }} />}
                        sx={{ bgcolor: t.accentPrimary, borderRadius: 2 }}>
                        {fbSaving ? "Sending…" : "Send Feedback"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}