// src/components/common/supervisor/FileReview/FileReview.jsx
//
// Two tabs:
//   Tab 0 "My Files"     — supervisor uploads their own links (templates, etc.)
//   Tab 1 "Review Teams" — supervisor reviews student files and sends feedback
//
// API:
//   GET    /api/FileSystem/supervisor-files
//   GET    /api/FileSystem/student-files
//   POST   /api/FileSystem/add                    → { filePath, description }
//   PUT    /api/FileSystem/edit/{id}
//   DELETE /api/FileSystem/delete/{id}
//   GET    /api/Feedback/team/{teamId}
//   POST   /api/Feedback/create                   → { content, teamId, taskItemId }
//   DELETE /api/Feedback/delete/{feedbackId}
//
// Backend FeedbackDto shape (after mapping in feedbackApi.js):
//   { feedbackId, content, createdAt, authorName, authorRole, taskItemId,
//     replies: [{ replyId, content, createdAt, authorName, authorRole }] }

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

const extractTeamId = (tm) => tm?.teamId ?? tm?.id ?? null;
const extractTeamName = (tm) => tm?.teamName ?? tm?.projectTitle ?? tm?.name ?? null;

const EMPTY_FORM = { filePath: "", description: "" };

function TabPanel({ children, value, index }) {
    return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function FileReview() {
    const theme = useTheme();
    const t = theme.palette.custom;

    const [activeTab, setActiveTab] = useState(0);

    // ── supervisor's own files ────────────────────────────────────────────────
    const [myFiles, setMyFiles] = useState([]);
    const [myLoading, setMyLoading] = useState(true);
    const [myError, setMyError] = useState(null);

    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState("");
    const [formSaving, setFormSaving] = useState(false);

    // ── review: teams + student files ─────────────────────────────────────────
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState("");
    const [studentFiles, setStudentFiles] = useState([]);
    const [feedbackMap, setFeedbackMap] = useState({});
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [filesLoading, setFilesLoading] = useState(false);
    const [teamsError, setTeamsError] = useState(null);
    const [filesError, setFilesError] = useState(null);

    // feedback dialog
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
                    const firstId = extractTeamId(list[0]);
                    if (firstId != null) setSelectedTeam(String(firstId));
                }
            })
            .catch((err) => setTeamsError(err?.message ?? "Failed to load teams."))
            .finally(() => setTeamsLoading(false));
    }, []);

    // ── fetch student files + feedback ────────────────────────────────────────
    const loadStudentData = useCallback(async (teamIdStr) => {
        const teamIdNum = Number(teamIdStr);
        if (!teamIdStr || isNaN(teamIdNum)) return;

        setFilesLoading(true); setFilesError(null);
        setStudentFiles([]); setFeedbackMap({});
        try {
            const [filesData, fbData] = await Promise.all([
                fileSystemApi.getStudentFiles(),
                // feedbackApi maps: id→feedbackId, senderName→authorName, senderRole→authorRole
                feedbackApi.getFeedbackByTeam(teamIdNum),
            ]);
            setStudentFiles(Array.isArray(filesData) ? filesData : []);

            const map = {};
            (Array.isArray(fbData) ? fbData : []).forEach((fb) => {
                // ✅ fb.taskItemId matches file.id
                const key = fb.taskItemId;
                if (key == null) return;
                if (!map[key]) map[key] = [];
                map[key].push(fb);
            });
            setFeedbackMap(map);
        } catch (err) {
            setFilesError(err?.response?.data?.message ?? err?.message ?? "Failed to load student data.");
        } finally { setFilesLoading(false); }
    }, []);

    useEffect(() => {
        if (selectedTeam) loadStudentData(selectedTeam);
    }, [selectedTeam, loadStudentData]);

    // ── own file handlers ─────────────────────────────────────────────────────
    const openAdd = () => {
        setEditTarget(null); setForm(EMPTY_FORM); setFormError(""); setAddOpen(true);
    };
    const openEdit = (f) => {
        setEditTarget(f);
        setForm({ filePath: f.filePath, description: f.description ?? "" });
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
                    filePath: form.filePath.trim(), description: form.description.trim(),
                });
            } else {
                await fileSystemApi.addFile({
                    filePath: form.filePath.trim(), description: form.description.trim(),
                });
            }
            await fetchMyFiles();
            setAddOpen(false);
        } catch (err) {
            setFormError(err?.response?.data?.message ?? "Something went wrong.");
        } finally { setFormSaving(false); }
    };

    const handleDeleteOwnFile = async (id) => {
        setMyFiles((p) => p.filter((f) => f.id !== id));
        try { await fileSystemApi.deleteFile(id); }
        catch { await fetchMyFiles(); }
    };

    // ── feedback handlers ─────────────────────────────────────────────────────
    const openFeedback = (file) => {
        setFbFile(file); setFbContent(""); setFbError(""); setFbOpen(true);
    };

    const handleSendFeedback = async () => {
        if (!fbContent.trim()) { setFbError("Please write feedback first."); return; }
        const teamIdNum = Number(selectedTeam);
        if (isNaN(teamIdNum) || teamIdNum === 0) { setFbError("No team selected."); return; }

        setFbSaving(true); setFbError("");
        try {
            await feedbackApi.createFeedback({
                content: fbContent.trim(),
                teamId: teamIdNum,
                taskItemId: fbFile.id, // ✅ matches backend CreateFeedbackDto.TaskItemId
            });
            setFbOpen(false);
            await loadStudentData(selectedTeam);
        } catch (err) {
            setFbError(err?.response?.data?.message ?? "Failed to send feedback.");
        } finally { setFbSaving(false); }
    };

    const handleDeleteFeedback = async (feedbackId, fileId) => {
        try {
            await feedbackApi.deleteFeedback(feedbackId);
            // ✅ fb.feedbackId — already mapped from fb.id in feedbackApi
            setFeedbackMap((prev) => ({
                ...prev,
                [fileId]: (prev[fileId] ?? []).filter((f) => f.feedbackId !== feedbackId),
            }));
        } catch { /* ignore */ }
    };

    // ── render file card ──────────────────────────────────────────────────────
    const renderFileCard = (file, { isOwn = false } = {}) => {
        const meta = TYPE_META[getFileType(file.filePath)];
        const displayName = getDisplayName(file.filePath, file.description);
        // ✅ feedbackMap keyed by file.id (= taskItemId from backend)
        const feedbacks = isOwn ? [] : (feedbackMap[file.id] ?? []);

        return (
            <Paper key={file.id} elevation={0} sx={{
                borderRadius: 3,
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${feedbacks.length ? t.accentPrimary + "30" : t.borderLight}`,
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
                                    maxWidth: 380,
                                    "&:hover": { textDecoration: "underline" },
                                }}>
                                {file.filePath}
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack direction="row" alignItems="center" gap={0.5} sx={{ flexShrink: 0 }}>
                        {isOwn && (
                            <Chip size="small" label="Shared with students"
                                sx={{
                                    bgcolor: `${t.accentPrimary}12`, color: t.accentPrimary,
                                    fontWeight: 600, fontSize: "0.68rem"
                                }} />
                        )}
                        {!isOwn && feedbacks.length > 0 && (
                            <Chip size="small"
                                icon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: "13px !important" }} />}
                                label={`${feedbacks.length} feedback`}
                                sx={{
                                    bgcolor: `${t.accentPrimary}12`, color: t.accentPrimary,
                                    fontWeight: 600, fontSize: "0.68rem"
                                }} />
                        )}
                        <Tooltip title="Open link">
                            <IconButton size="small" component="a"
                                href={file.filePath} target="_blank" rel="noopener noreferrer"
                                sx={{ color: t.textTertiary, "&:hover": { color: t.accentPrimary } }}>
                                <OpenInNewOutlinedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                        </Tooltip>
                        {isOwn && (
                            <>
                                <Tooltip title="Edit">
                                    <IconButton size="small" onClick={() => openEdit(file)}
                                        sx={{ color: t.textTertiary, "&:hover": { color: t.accentPrimary } }}>
                                        <EditOutlinedIcon sx={{ fontSize: 17 }} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <IconButton size="small"
                                        onClick={() => handleDeleteOwnFile(file.id)}
                                        sx={{ color: t.textTertiary, "&:hover": { color: t.error } }}>
                                        <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                                    </IconButton>
                                </Tooltip>
                            </>
                        )}
                        {!isOwn && (
                            <Button size="small" variant="outlined"
                                startIcon={<CommentOutlinedIcon sx={{ fontSize: 15 }} />}
                                onClick={() => openFeedback(file)}
                                sx={{
                                    borderColor: t.accentPrimary, color: t.accentPrimary,
                                    borderRadius: 2, fontSize: "0.78rem",
                                    "&:hover": { bgcolor: `${t.accentPrimary}10` },
                                }}>
                                Add Feedback
                            </Button>
                        )}
                    </Stack>
                </Stack>

                {/* Feedback thread */}
                {!isOwn && feedbacks.length > 0 && (
                    <>
                        <Divider sx={{ borderColor: t.borderLight }} />
                        <Box sx={{ px: 2.5, py: 2, bgcolor: `${t.surfaceHover}60` }}>
                            <Typography sx={{
                                fontSize: "0.7rem", fontWeight: 700, color: t.textTertiary,
                                textTransform: "uppercase", letterSpacing: "0.07em", mb: 1.5,
                            }}>
                                Your Feedback
                            </Typography>
                            <Stack spacing={1.5}>
                                {feedbacks.map((fb) => (
                                    // ✅ fb.feedbackId — mapped from fb.id in feedbackApi
                                    <Stack key={fb.feedbackId} direction="row" gap={1.2} alignItems="flex-start">
                                        <Avatar sx={{
                                            width: 30, height: 30,
                                            bgcolor: colorFor(fb.authorName ?? ""),
                                            fontSize: "0.72rem", fontWeight: 700,
                                        }}>
                                            {/* ✅ fb.authorName — mapped from fb.senderName */}
                                            {getInitials(fb.authorName ?? "")}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.3}>
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
                                                        onClick={() => handleDeleteFeedback(fb.feedbackId, file.id)}
                                                        sx={{ color: t.textTertiary, "&:hover": { color: t.error } }}>
                                                        <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                            <Typography sx={{ fontSize: "0.84rem", color: t.textSecondary, lineHeight: 1.5 }}>
                                                {fb.content}
                                            </Typography>

                                            {(fb.replies ?? []).length > 0 && (
                                                <Box sx={{ mt: 1, pl: 2, borderLeft: `2px solid ${t.borderLight}` }}>
                                                    {fb.replies.map((reply) => (
                                                        // ✅ reply.replyId — mapped from reply.id in feedbackApi
                                                        <Stack key={reply.replyId} direction="row" gap={1}
                                                            alignItems="flex-start" mb={0.8}>
                                                            <Avatar sx={{
                                                                width: 22, height: 22,
                                                                bgcolor: colorFor(reply.authorName ?? ""),
                                                                fontSize: "0.6rem",
                                                            }}>
                                                                {/* ✅ reply.authorName — mapped from reply.senderName */}
                                                                {getInitials(reply.authorName ?? "")}
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
                            onClick={openAdd}
                            sx={{ bgcolor: t.accentPrimary, borderRadius: 2 }}>
                            Add Link
                        </Button>
                    )}
                    {activeTab === 1 && !teamsLoading && teams.length > 0 && (
                        <FormControl size="small" sx={{ minWidth: 190 }}>
                            <InputLabel>Team</InputLabel>
                            <Select label="Team" value={selectedTeam}
                                onChange={(e) => setSelectedTeam(e.target.value)}>
                                {teams.map((tm) => {
                                    const id = extractTeamId(tm);
                                    const name = extractTeamName(tm);
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
                    bgcolor: `${t.accentPrimary}08`,
                    border: `1px solid ${t.accentPrimary}25`,
                    display: "flex", alignItems: "flex-start", gap: 1.5,
                }}>
                    <FolderSharedOutlinedIcon sx={{ color: t.accentPrimary, mt: "2px", flexShrink: 0 }} />
                    <Box>
                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: t.textPrimary, mb: 0.3 }}>
                            Share resources with your students
                        </Typography>
                        <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, lineHeight: 1.6 }}>
                            Add links to templates, example projects, or reference documents.
                            All your supervised teams will be able to view these files.
                        </Typography>
                    </Box>
                </Paper>

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
                        <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem", mb: 0.5 }}>No files shared yet.</Typography>
                        <Typography sx={{ color: t.textTertiary, fontSize: "0.8rem" }}>
                            Click <strong>Add Link</strong> to share a template or resource with your students.
                        </Typography>
                    </Box>
                )}
                {!myLoading && !myError && myFiles.length > 0 && (
                    <Stack spacing={2}>{myFiles.map((f) => renderFileCard(f, { isOwn: true }))}</Stack>
                )}
            </TabPanel>

            {/* ── TAB 1: REVIEW TEAMS ── */}
            <TabPanel value={activeTab} index={1}>
                {teamsLoading && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                        <CircularProgress sx={{ color: t.accentPrimary }} />
                    </Box>
                )}
                {!teamsLoading && teamsError && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>{teamsError}</Alert>
                )}
                {!teamsLoading && !teamsError && teams.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                        <PeopleOutlinedIcon sx={{ fontSize: 46, color: t.textTertiary, mb: 1.5 }} />
                        <Typography sx={{ color: t.textSecondary }}>No teams assigned to you yet.</Typography>
                    </Box>
                )}
                {!teamsLoading && teams.length > 0 && (
                    <>
                        {filesLoading && (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                                <CircularProgress sx={{ color: t.accentPrimary }} />
                            </Box>
                        )}
                        {!filesLoading && filesError && (
                            <Alert severity="error" sx={{ borderRadius: 2 }}>{filesError}</Alert>
                        )}
                        {!filesLoading && !filesError && studentFiles.length === 0 && (
                            <Box sx={{ textAlign: "center", py: 8 }}>
                                <LinkOutlinedIcon sx={{ fontSize: 46, color: t.textTertiary, mb: 1.5 }} />
                                <Typography sx={{ color: t.textSecondary }}>
                                    This team hasn't uploaded any links yet.
                                </Typography>
                            </Box>
                        )}
                        {!filesLoading && !filesError && studentFiles.length > 0 && (
                            <Stack spacing={2}>
                                {studentFiles.map((f) => renderFileCard(f, { isOwn: false }))}
                            </Stack>
                        )}
                    </>
                )}
            </TabPanel>

            {/* ── DIALOG: Add / Edit ── */}
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
                            bgcolor: t.surfaceHover, border: `1px solid ${t.borderLight}`,
                        }}>
                            <Stack direction="row" gap={1} alignItems="center">
                                <LinkOutlinedIcon sx={{ fontSize: 16, color: t.textTertiary }} />
                                <Typography sx={{
                                    fontSize: "0.8rem", color: t.textSecondary,
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                }}>
                                    {getDisplayName(fbFile.filePath, fbFile.description)}
                                </Typography>
                            </Stack>
                        </Paper>
                    )}
                    <TextField fullWidth multiline minRows={3}
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
                    <Button onClick={() => setFbOpen(false)} disabled={fbSaving} sx={{ color: t.textSecondary }}>Cancel</Button>
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