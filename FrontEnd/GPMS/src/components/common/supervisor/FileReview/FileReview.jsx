// src/components/common/supervisor/FileReview/FileReview.jsx
//
// File shape:  { id, fileName, filePath, description, uploadedAt, uploadedByName, uploadedByUserId }
// Feedback shape (mapped by feedbackApi):
//   { feedbackId, content, createdAt, authorName, authorRole, taskItemId,
//     replies: [{ replyId, content, createdAt, authorName, authorRole }] }
//
// KEY FLOW:
//   Supervisor creates feedback → POST /api/Feedback/create { taskItemId: file.id }
//   Feedback is fetched per file → GET /api/Feedback/file/{fileId}
//   Student replies are nested inside each feedback's replies[]
//
// Tab 0 "My Files":     GET /api/FileSystem/supervisor-files → supervisor's own uploads
// Tab 1 "Review Teams": GET /api/FileSystem/student-files   → student files per team
//                        + GET /api/Feedback/file/{fileId}  → per-file feedback with replies

import { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Stack, Paper, Button, IconButton, Tooltip,
    CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, Select, FormControl,
    InputLabel, Chip, Avatar, Divider, Tabs, Tab, InputAdornment,
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
import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";

import { getSupervisorTeams } from "../../../../api/handler/endpoints/supervisorApi";
import fileSystemApi from "../../../../api/handler/endpoints/fileSystemApi";
import feedbackApi from "../../../../api/handler/endpoints/feedbackApi";

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

const getTeamId = (tm) => tm?.teamId ?? tm?.id ?? null;
const getTeamName = (tm) => tm?.teamName ?? tm?.projectTitle ?? tm?.name ?? null;

const EMPTY_FORM = { filePath: "", fileName: "", description: "" };

function TabPanel({ children, value, index }) {
    return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function FileReview() {
    const theme = useTheme();
    const t = theme.palette.custom;

    const [activeTab, setActiveTab] = useState(0);

    // ── supervisor's own files (Tab 0) ────────────────────────────────────────
    const [myFiles, setMyFiles] = useState([]);
    const [myLoading, setMyLoading] = useState(true);
    const [myError, setMyError] = useState(null);
    const [deleteErr, setDeleteErr] = useState(null);

    // add/edit dialog
    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState("");
    const [formSaving, setFormSaving] = useState(false);

    // ── review tab (Tab 1) ────────────────────────────────────────────────────
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState("");
    const [studentFiles, setStudentFiles] = useState([]);
    // feedbackMap: { [file.id]: MappedFeedback[] }
    const [feedbackMap, setFeedbackMap] = useState({});
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [filesLoading, setFilesLoading] = useState(false);
    const [teamsError, setTeamsError] = useState(null);
    const [filesError, setFilesError] = useState(null);

    // per-file refresh spinner after feedback create/delete
    const [fileRefreshing, setFileRefreshing] = useState({});   // { [fileId]: bool }

    // feedback creation dialog
    const [fbOpen, setFbOpen] = useState(false);
    const [fbFile, setFbFile] = useState(null);
    const [fbContent, setFbContent] = useState("");
    const [fbSaving, setFbSaving] = useState(false);
    const [fbError, setFbError] = useState("");

    // ── fetch supervisor's own files ──────────────────────────────────────────
    const fetchMyFiles = useCallback(async () => {
        setMyLoading(true); setMyError(null);
        try {
            const data = await fileSystemApi.getSupervisorFiles();
            setMyFiles(Array.isArray(data) ? data : []);
        } catch (err) {
            setMyError(err?.response?.data?.message ?? err?.message ?? "Failed to load files.");
        } finally { setMyLoading(false); }
    }, []);

    useEffect(() => { fetchMyFiles(); }, [fetchMyFiles]);

    // ── fetch teams ───────────────────────────────────────────────────────────
    useEffect(() => {
        getSupervisorTeams()
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setTeams(list);
                if (list.length > 0) {
                    const firstId = getTeamId(list[0]);
                    if (firstId != null) setSelectedTeam(String(firstId));
                }
            })
            .catch((err) => setTeamsError(err?.message ?? "Failed to load teams."))
            .finally(() => setTeamsLoading(false));
    }, []);

    // ── fetch feedback for a single file ──────────────────────────────────────
    const fetchFileFeedback = useCallback(async (fileId) => {
        try {
            const list = await feedbackApi.getFeedbackByFile(fileId);
            setFeedbackMap((prev) => ({ ...prev, [fileId]: list }));
        } catch (err) {
            console.error(`Feedback fetch error for file ${fileId}:`, err);
        }
    }, []);

    // ── fetch student files + feedback for selected team ──────────────────────
    const loadStudentData = useCallback(async (teamIdStr) => {
        if (!teamIdStr) return;

        setFilesLoading(true); setFilesError(null);
        setStudentFiles([]); setFeedbackMap({});
        try {
            const filesData = await fileSystemApi.getStudentFiles();
            const files = Array.isArray(filesData) ? filesData : [];
            setStudentFiles(files);

            // Fetch feedback for every file in parallel
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
            setFilesError(err?.response?.data?.message ?? err?.message ?? "Failed to load data.");
        } finally { setFilesLoading(false); }
    }, []);

    useEffect(() => {
        if (selectedTeam) loadStudentData(selectedTeam);
    }, [selectedTeam, loadStudentData]);

    // ── refresh feedback for one file after create/delete ─────────────────────
    const refreshOneFeedback = useCallback(async (fileId) => {
        setFileRefreshing((p) => ({ ...p, [fileId]: true }));
        await fetchFileFeedback(fileId);
        setFileRefreshing((p) => ({ ...p, [fileId]: false }));
    }, [fetchFileFeedback]);

    // ── own file handlers ─────────────────────────────────────────────────────
    const openAdd = () => {
        setEditTarget(null); setForm(EMPTY_FORM); setFormError(""); setAddOpen(true);
    };
    const openEdit = (f) => {
        setEditTarget(f);
        setForm({ filePath: f.filePath ?? "", fileName: f.fileName ?? "", description: f.description ?? "" });
        setFormError(""); setAddOpen(true);
    };

    const handleSaveOwnFile = async () => {
        if (!form.filePath.trim()) { setFormError("Please enter a link."); return; }
        try { new URL(form.filePath.trim()); }
        catch { setFormError("Please enter a valid URL starting with https://"); return; }

        setFormSaving(true); setFormError("");
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
            setAddOpen(false);
        } catch (err) {
            setFormError(
                err?.response?.data?.message ??
                (typeof err?.response?.data === "string" ? err.response.data : null) ??
                err?.message ?? "Something went wrong."
            );
        } finally { setFormSaving(false); }
    };

    const handleDeleteOwnFile = async (id) => {
        setDeleteErr(null);
        setMyFiles((p) => p.filter((f) => f.id !== id));
        try { await fileSystemApi.deleteFile(id); }
        catch (err) {
            await fetchMyFiles();
            setDeleteErr(err?.response?.data?.message ?? err?.message ?? "Failed to delete.");
        }
    };

    // ── feedback handlers ─────────────────────────────────────────────────────
    const openFeedbackDialog = (file) => {
        setFbFile(file); setFbContent(""); setFbError(""); setFbOpen(true);
    };

    const handleSendFeedback = async () => {
        if (!fbContent.trim()) { setFbError("Please write feedback first."); return; }
        const teamIdNum = Number(selectedTeam);
        if (isNaN(teamIdNum) || teamIdNum === 0) { setFbError("No valid team selected."); return; }

        setFbSaving(true); setFbError("");
        try {
            await feedbackApi.createFeedback({
                content: fbContent.trim(),
                teamId: teamIdNum,
                taskItemId: fbFile.id,   // ← file.id
            });
            setFbOpen(false);
            // Refresh only the affected file's feedback
            await refreshOneFeedback(fbFile.id);
        } catch (err) {
            setFbError(err?.response?.data?.message ?? "Failed to send feedback.");
        } finally { setFbSaving(false); }
    };

    const handleDeleteFeedback = async (feedbackId, fileId) => {
        // Optimistic update
        setFeedbackMap((prev) => ({
            ...prev,
            [fileId]: (prev[fileId] ?? []).filter((f) => f.feedbackId !== feedbackId),
        }));
        try {
            await feedbackApi.deleteFeedback(feedbackId);
        } catch (err) {
            console.error("Delete feedback error:", err);
            await refreshOneFeedback(fileId);
        }
    };

    // ── render supervisor's own file card ─────────────────────────────────────

    const renderMyFileCard = (file) => {
        const meta = TYPE_META[getFileType(file.filePath)];
        const displayName = getDisplayName(file);
        return (
            <Paper key={file.id} elevation={0} sx={{
                borderRadius: 3, bgcolor: theme.palette.background.paper,
                border: `1px solid ${t.borderLight}`, overflow: "hidden",
                transition: "box-shadow .15s", "&:hover": { boxShadow: theme.shadows[2] },
            }}>
                <Stack direction={{ xs: "column", sm: "row" }}
                    alignItems={{ sm: "center" }} justifyContent="space-between"
                    gap={1.5} sx={{ p: 2.5 }}>

                    <Stack direction="row" alignItems="flex-start" gap={1.5} sx={{ minWidth: 0, flex: 1 }}>
                        <Box sx={{
                            p: 0.9, borderRadius: 2, flexShrink: 0, mt: 0.2,
                            bgcolor: `${meta.color}15`, color: meta.color, "& svg": { fontSize: 22 },
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
                                    bgcolor: `${meta.color}12`, color: meta.color, "& .MuiChip-label": { px: 0.7 },
                                }} />
                                <Chip label="Shared with students" size="small" sx={{
                                    height: 16, fontSize: "0.58rem", fontWeight: 600,
                                    bgcolor: `${t.accentPrimary}10`, color: t.accentPrimary,
                                    "& .MuiChip-label": { px: 0.7 },
                                }} />
                            </Stack>
                            <Typography component="a" href={file.filePath}
                                target="_blank" rel="noopener noreferrer"
                                sx={{
                                    fontSize: "0.72rem", color: t.accentPrimary,
                                    textDecoration: "none", display: "block",
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                    maxWidth: 420, "&:hover": { textDecoration: "underline" },
                                }}>
                                {file.filePath}
                            </Typography>
                            {file.description?.trim() && file.description.trim() !== file.fileName?.trim() && (
                                <Typography sx={{ fontSize: "0.72rem", color: t.textSecondary, mt: 0.3 }}>
                                    {file.description}
                                </Typography>
                            )}
                            {file.uploadedAt && (
                                <Typography sx={{ fontSize: "0.64rem", color: t.textTertiary, mt: 0.5 }}>
                                    Added {fmtDate(file.uploadedAt)}
                                </Typography>
                            )}
                        </Box>
                    </Stack>

                    <Stack direction="row" alignItems="center" gap={0.5} sx={{ flexShrink: 0 }}>
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
                            <IconButton size="small" onClick={() => handleDeleteOwnFile(file.id)}
                                sx={{ color: t.textTertiary, "&:hover": { color: t.error ?? "#C47E7E" } }}>
                                <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>
            </Paper>
        );
    };

    // ── render student file card with feedback thread + student replies ────────

    const renderStudentFileCard = (file) => {
        const meta = TYPE_META[getFileType(file.filePath)];
        const displayName = getDisplayName(file);
        const feedbacks = feedbackMap[file.id] ?? [];
        const isRefreshing = Boolean(fileRefreshing[file.id]);

        return (
            <Paper key={file.id} elevation={0} sx={{
                borderRadius: 3, bgcolor: theme.palette.background.paper,
                border: `1px solid ${feedbacks.length ? t.accentPrimary + "28" : t.borderLight}`,
                overflow: "hidden",
                transition: "box-shadow .15s", "&:hover": { boxShadow: theme.shadows[2] },
            }}>
                <Stack direction={{ xs: "column", sm: "row" }}
                    alignItems={{ sm: "center" }} justifyContent="space-between"
                    gap={1.5} sx={{ p: 2.5 }}>

                    {/* Left */}
                    <Stack direction="row" alignItems="flex-start" gap={1.5} sx={{ minWidth: 0, flex: 1 }}>
                        <Box sx={{
                            p: 0.9, borderRadius: 2, flexShrink: 0, mt: 0.2,
                            bgcolor: `${meta.color}15`, color: meta.color, "& svg": { fontSize: 22 },
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
                                    bgcolor: `${meta.color}12`, color: meta.color, "& .MuiChip-label": { px: 0.7 },
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
                                    {file.uploadedByName ? `Uploaded by ${file.uploadedByName}` : "Uploaded by student"}
                                </Typography>
                                {file.uploadedAt && (
                                    <Typography sx={{ fontSize: "0.64rem", color: t.textTertiary }}>
                                        · {fmtDate(file.uploadedAt)}
                                    </Typography>
                                )}
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Right */}
                    <Stack direction="row" alignItems="center" gap={0.5} sx={{ flexShrink: 0 }}>
                        {isRefreshing && <CircularProgress size={14} sx={{ color: t.accentPrimary }} />}
                        {feedbacks.length > 0 && (
                            <Chip size="small"
                                icon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: "12px !important" }} />}
                                label={`${feedbacks.length} feedback`}
                                sx={{
                                    bgcolor: `${t.accentPrimary}12`, color: t.accentPrimary,
                                    fontWeight: 600, fontSize: "0.65rem",
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
                        <Button size="small" variant="outlined"
                            startIcon={<CommentOutlinedIcon sx={{ fontSize: 15 }} />}
                            onClick={() => openFeedbackDialog(file)}
                            sx={{
                                borderColor: t.accentPrimary, color: t.accentPrimary,
                                borderRadius: 2, fontSize: "0.78rem",
                                "&:hover": { bgcolor: `${t.accentPrimary}10` },
                            }}>
                            Add Feedback
                        </Button>
                    </Stack>
                </Stack>

                {/* ── Feedback thread with student replies ── */}
                {feedbacks.length > 0 && (
                    <>
                        <Divider sx={{ borderColor: t.borderLight }} />
                        <Box sx={{ px: 2.5, py: 2.5, bgcolor: `${t.surfaceHover ?? "#F8F9FA"}80` }}>
                            <Typography sx={{
                                fontSize: "0.7rem", fontWeight: 700, color: t.textTertiary,
                                textTransform: "uppercase", letterSpacing: "0.07em", mb: 1.5,
                            }}>
                                Your Feedback ({feedbacks.length})
                            </Typography>
                            <Stack spacing={2.5}>
                                {feedbacks.map((fb) => (
                                    <Box key={fb.feedbackId}>

                                        {/* ── Supervisor feedback bubble ── */}
                                        <Stack direction="row" gap={1.5} alignItems="flex-start">
                                            <Avatar sx={{
                                                width: 32, height: 32, flexShrink: 0,
                                                bgcolor: avatarColor(fb.authorName),
                                                fontSize: "0.72rem", fontWeight: 700,
                                            }}>
                                                {initials(fb.authorName)}
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Stack direction="row" justifyContent="space-between"
                                                    alignItems="center" mb={0.4}>
                                                    <Stack direction="row" gap={1} alignItems="center">
                                                        <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: t.textPrimary }}>
                                                            {fb.authorName || "You"}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: "0.67rem", color: t.textTertiary }}>
                                                            {fmtDate(fb.createdAt)}
                                                        </Typography>
                                                    </Stack>
                                                    <Tooltip title="Delete feedback">
                                                        <IconButton size="small"
                                                            onClick={() => handleDeleteFeedback(fb.feedbackId, file.id)}
                                                            sx={{ color: t.textTertiary, "&:hover": { color: t.error ?? "#C47E7E" } }}>
                                                            <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>

                                                <Paper elevation={0} sx={{
                                                    p: "8px 12px",
                                                    borderRadius: "4px 12px 12px 12px",
                                                    bgcolor: `${t.accentPrimary}08`,
                                                    border: `1px solid ${t.accentPrimary}20`,
                                                }}>
                                                    <Typography sx={{ fontSize: "0.84rem", color: t.textSecondary, lineHeight: 1.55 }}>
                                                        {fb.content}
                                                    </Typography>
                                                </Paper>
                                            </Box>
                                        </Stack>

                                        {/* ── Student replies ── */}
                                        {(fb.replies ?? []).length > 0 && (
                                            <Box sx={{ mt: 1.5, ml: 6, pl: 2, borderLeft: `2px solid ${t.borderLight}` }}>
                                                <Stack direction="row" alignItems="center" gap={0.8} mb={1}>
                                                    <ReplyOutlinedIcon sx={{ fontSize: 13, color: t.textTertiary }} />
                                                    <Typography sx={{
                                                        fontSize: "0.65rem", fontWeight: 700,
                                                        color: t.textTertiary, textTransform: "uppercase",
                                                        letterSpacing: "0.06em",
                                                    }}>
                                                        Student Replies ({fb.replies.length})
                                                    </Typography>
                                                </Stack>
                                                <Stack spacing={1.5}>
                                                    {fb.replies.map((rep) => {
                                                        const isStudent = rep.authorRole === "Student";
                                                        return (
                                                            <Stack key={rep.replyId} direction="row" gap={1} alignItems="flex-start">
                                                                <Avatar sx={{
                                                                    width: 26, height: 26, flexShrink: 0,
                                                                    bgcolor: isStudent
                                                                        ? "#6D8A7D"
                                                                        : avatarColor(rep.authorName ?? ""),
                                                                    fontSize: "0.6rem", fontWeight: 700,
                                                                }}>
                                                                    {initials(rep.authorName ?? "")}
                                                                </Avatar>
                                                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                                                    <Stack direction="row" gap={0.8} alignItems="center" mb={0.3} flexWrap="wrap">
                                                                        <Typography sx={{ fontWeight: 600, fontSize: "0.75rem", color: t.textPrimary }}>
                                                                            {rep.authorName || "Student"}
                                                                        </Typography>
                                                                        {rep.authorRole && (
                                                                            <Chip label={rep.authorRole} size="small" sx={{
                                                                                height: 14, fontSize: "0.55rem",
                                                                                bgcolor: isStudent ? "#6D8A7D15" : `${t.accentPrimary}10`,
                                                                                color: isStudent ? "#6D8A7D" : t.accentPrimary,
                                                                                "& .MuiChip-label": { px: 0.6 },
                                                                            }} />
                                                                        )}
                                                                        <Typography sx={{ fontSize: "0.64rem", color: t.textTertiary }}>
                                                                            {fmtDate(rep.createdAt)}
                                                                        </Typography>
                                                                    </Stack>
                                                                    <Paper elevation={0} sx={{
                                                                        px: 1.2, py: 0.8,
                                                                        borderRadius: "4px 10px 10px 10px",
                                                                        bgcolor: isStudent
                                                                            ? "#6D8A7D10"
                                                                            : `${t.surfaceHover ?? "#F5F5F5"}`,
                                                                        border: `1px solid ${isStudent ? "#6D8A7D25" : t.borderLight}`,
                                                                    }}>
                                                                        <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, lineHeight: 1.5 }}>
                                                                            {rep.content}
                                                                        </Typography>
                                                                    </Paper>
                                                                </Box>
                                                            </Stack>
                                                        );
                                                    })}
                                                </Stack>
                                            </Box>
                                        )}

                                        {/* No reply yet indicator */}
                                        {(fb.replies ?? []).filter((r) => r.authorRole === "Student").length === 0 && (
                                            <Box sx={{ mt: 1, ml: 6, pl: 1 }}>
                                                <Typography sx={{ fontSize: "0.67rem", color: t.textTertiary, fontStyle: "italic" }}>
                                                    No student reply yet
                                                </Typography>
                                            </Box>
                                        )}
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
        <Box sx={{ width: "100%" }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                    <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>Files</Typography>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.88rem" }}>
                        Share resources with students or review their submitted links
                    </Typography>
                </Box>
                <Stack direction="row" gap={1.5} alignItems="center">
                    {activeTab === 0 && (
                        <Button variant="contained" startIcon={<AddLinkOutlinedIcon />}
                            onClick={openAdd} sx={{ bgcolor: t.accentPrimary, borderRadius: 2 }}>
                            Add Link
                        </Button>
                    )}
                    {activeTab === 1 && !teamsLoading && teams.length > 0 && (
                        <FormControl size="small" sx={{ minWidth: 190 }}>
                            <InputLabel>Team</InputLabel>
                            <Select label="Team" value={selectedTeam}
                                onChange={(e) => setSelectedTeam(e.target.value)}>
                                {teams.map((tm) => {
                                    const id = getTeamId(tm);
                                    const name = getTeamName(tm);
                                    return (
                                        <MenuItem key={id} value={String(id)}>
                                            {name ?? `Team #${id}`}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                    )}
                </Stack>
            </Stack>

            {/* Tabs */}
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{
                borderBottom: `1px solid ${t.borderLight}`,
                "& .MuiTab-root": { fontSize: "0.85rem", textTransform: "none", fontWeight: 600, minHeight: 44 },
                "& .MuiTabs-indicator": { height: 2 },
            }}>
                <Tab iconPosition="start" icon={<FolderSharedOutlinedIcon sx={{ fontSize: 17 }} />} label="My Files" />
                <Tab iconPosition="start" icon={<RateReviewOutlinedIcon sx={{ fontSize: 17 }} />} label="Review Teams" />
            </Tabs>

            {/* ── TAB 0: MY FILES ── */}
            <TabPanel value={activeTab} index={0}>
                <Paper elevation={0} sx={{
                    p: 2, mb: 3, borderRadius: 3,
                    bgcolor: `${t.accentPrimary}08`, border: `1px solid ${t.accentPrimary}25`,
                    display: "flex", alignItems: "flex-start", gap: 1.5,
                }}>
                    <FolderSharedOutlinedIcon sx={{ color: t.accentPrimary, mt: "2px", flexShrink: 0 }} />
                    <Box>
                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: t.textPrimary, mb: 0.3 }}>
                            Share resources with your students
                        </Typography>
                        <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, lineHeight: 1.6 }}>
                            Add links to templates, example projects, or reference documents.
                            All your supervised teams will be able to view these.
                        </Typography>
                    </Box>
                </Paper>

                {deleteErr && (
                    <Alert severity="error" onClose={() => setDeleteErr(null)} sx={{ mb: 2, borderRadius: 2 }}>
                        {deleteErr}
                    </Alert>
                )}
                {myLoading && <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress sx={{ color: t.accentPrimary }} /></Box>}
                {!myLoading && myError && <Alert severity="error" sx={{ borderRadius: 2 }}>{myError}</Alert>}
                {!myLoading && !myError && myFiles.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                        <AddLinkOutlinedIcon sx={{ fontSize: 46, color: t.textTertiary, mb: 1.5 }} />
                        <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem", mb: 0.5 }}>No files shared yet.</Typography>
                        <Typography sx={{ color: t.textTertiary, fontSize: "0.8rem" }}>
                            Click <strong>Add Link</strong> to share a resource with your students.
                        </Typography>
                    </Box>
                )}
                {!myLoading && !myError && myFiles.length > 0 && (
                    <Stack spacing={2}>{myFiles.map((f) => renderMyFileCard(f))}</Stack>
                )}
            </TabPanel>

            {/* ── TAB 1: REVIEW TEAMS ── */}
            <TabPanel value={activeTab} index={1}>
                {teamsLoading && <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress sx={{ color: t.accentPrimary }} /></Box>}
                {!teamsLoading && teamsError && <Alert severity="error" sx={{ borderRadius: 2 }}>{teamsError}</Alert>}
                {!teamsLoading && !teamsError && teams.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                        <PeopleOutlinedIcon sx={{ fontSize: 46, color: t.textTertiary, mb: 1.5 }} />
                        <Typography sx={{ color: t.textSecondary }}>No teams assigned to you yet.</Typography>
                    </Box>
                )}
                {!teamsLoading && teams.length > 0 && (
                    <>
                        {filesLoading && <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress sx={{ color: t.accentPrimary }} /></Box>}
                        {!filesLoading && filesError && <Alert severity="error" sx={{ borderRadius: 2 }}>{filesError}</Alert>}
                        {!filesLoading && !filesError && studentFiles.length === 0 && (
                            <Box sx={{ textAlign: "center", py: 8 }}>
                                <RateReviewOutlinedIcon sx={{ fontSize: 46, color: t.textTertiary, mb: 1.5 }} />
                                <Typography sx={{ color: t.textSecondary }}>This team hasn't uploaded any links yet.</Typography>
                            </Box>
                        )}
                        {!filesLoading && !filesError && studentFiles.length > 0 && (
                            <Stack spacing={2}>{studentFiles.map((f) => renderStudentFileCard(f))}</Stack>
                        )}
                    </>
                )}
            </TabPanel>

            {/* ── DIALOG: Add / Edit own file ── */}
            <Dialog open={addOpen} onClose={() => !formSaving && setAddOpen(false)}
                maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ color: t.textPrimary, fontWeight: 700, pb: 1 }}>
                    {editTarget ? "Edit File Link" : "Share a File with Students"}
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Paper elevation={0} sx={{
                        p: 1.5, mb: 2.5, borderRadius: 2,
                        bgcolor: `${t.accentPrimary}08`, border: `1px dashed ${t.accentPrimary}35`,
                    }}>
                        <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, lineHeight: 1.6 }}>
                            💡 Upload the file to <strong>Google Drive</strong>, <strong>OneDrive</strong>,
                            or <strong>GitHub</strong> first, then paste the link below.
                        </Typography>
                    </Paper>
                    <TextField fullWidth label="File Name"
                        placeholder="e.g. Project Report Template"
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
                        placeholder="e.g. Official template for final project report"
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        multiline minRows={2}
                    />
                    {formError && <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2, fontSize: "0.8rem" }}>{formError}</Alert>}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button onClick={() => setAddOpen(false)} disabled={formSaving} sx={{ color: t.textSecondary }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveOwnFile} disabled={formSaving}
                        startIcon={formSaving ? <CircularProgress size={14} color="inherit" /> : <AddLinkOutlinedIcon />}
                        sx={{ bgcolor: t.accentPrimary, borderRadius: 2 }}>
                        {formSaving ? "Saving…" : editTarget ? "Save Changes" : "Share Link"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── DIALOG: Send Feedback ── */}
            <Dialog open={fbOpen} onClose={() => !fbSaving && setFbOpen(false)}
                maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, color: t.textPrimary, pb: 0.5 }}>
                    Send Feedback
                </DialogTitle>
                <DialogContent sx={{ pt: 1.5 }}>
                    {fbFile && (
                        <Paper elevation={0} sx={{
                            p: 1.5, mb: 2, borderRadius: 2,
                            bgcolor: `${t.surfaceHover ?? "#F5F5F5"}`, border: `1px solid ${t.borderLight}`,
                        }}>
                            <Stack direction="row" gap={1} alignItems="center">
                                <LinkOutlinedIcon sx={{ fontSize: 16, color: t.textTertiary, flexShrink: 0 }} />
                                <Typography sx={{
                                    fontSize: "0.82rem", fontWeight: 600, color: t.textPrimary,
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                }}>
                                    {getDisplayName(fbFile)}
                                </Typography>
                            </Stack>
                            {fbFile.uploadedByName && (
                                <Typography sx={{ fontSize: "0.67rem", color: t.textTertiary, mt: 0.4, pl: 3 }}>
                                    by {fbFile.uploadedByName}
                                </Typography>
                            )}
                        </Paper>
                    )}
                    <TextField fullWidth multiline minRows={3}
                        label="Your feedback"
                        placeholder="Write your comments or revision requests…"
                        value={fbContent}
                        onChange={(e) => setFbContent(e.target.value)}
                        error={Boolean(fbError)}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                    {fbError && <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2, fontSize: "0.8rem" }}>{fbError}</Alert>}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button onClick={() => setFbOpen(false)} disabled={fbSaving} sx={{ color: t.textSecondary }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSendFeedback} disabled={fbSaving}
                        endIcon={fbSaving ? <CircularProgress size={14} color="inherit" /> : <SendOutlinedIcon sx={{ fontSize: 15 }} />}
                        sx={{ bgcolor: t.accentPrimary, borderRadius: 2 }}>
                        {fbSaving ? "Sending…" : "Send Feedback"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}