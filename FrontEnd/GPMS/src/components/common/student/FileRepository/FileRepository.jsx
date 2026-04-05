import { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Stack, Paper, Button, IconButton, Tooltip,
    CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, InputAdornment,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import SlideshowOutlinedIcon from "@mui/icons-material/SlideshowOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import AddLinkOutlinedIcon from "@mui/icons-material/AddLinkOutlined";

import fileSystemApi from "../../../../api/handler/endpoints/fileSystemApi";

// ── helpers ───────────────────────────────────────────────────────────────────

const getFileType = (filePath = "") => {
    const lower = filePath.toLowerCase();
    if (lower.includes("drive.google") || lower.includes("docs.google")) return "gdrive";
    if (lower.includes("github.com")) return "github";
    if (lower.includes("onedrive") || lower.includes("sharepoint")) return "onedrive";
    const ext = lower.split(".").pop();
    if (ext === "pdf") return "pdf";
    if (["pptx", "ppt"].includes(ext)) return "pptx";
    if (["docx", "doc"].includes(ext)) return "docx";
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "img";
    return "link";
};

const getDisplayName = (filePath = "", description = "") => {
    if (description) return description;
    try {
        const url = new URL(filePath);
        return url.hostname + (url.pathname.length > 1 ? url.pathname.slice(0, 40) + "…" : "");
    } catch {
        return filePath.slice(0, 60) || "Untitled link";
    }
};

const TYPE_META = {
    gdrive: { label: "Google Drive", color: "#4285F4", icon: <CloudOutlinedIcon /> },
    github: { label: "GitHub", color: "#6D8A7D", icon: <InsertDriveFileOutlinedIcon /> },
    onedrive: { label: "OneDrive", color: "#0078D4", icon: <CloudOutlinedIcon /> },
    pdf: { label: "PDF", color: "#C47E7E", icon: <PictureAsPdfOutlinedIcon /> },
    pptx: { label: "Presentation", color: "#C49A6C", icon: <SlideshowOutlinedIcon /> },
    docx: { label: "Document", color: "#7E9FC4", icon: <DescriptionOutlinedIcon /> },
    img: { label: "Image", color: "#6D8A7D", icon: <ImageOutlinedIcon /> },
    link: { label: "Link", color: "#9E9E9E", icon: <LinkOutlinedIcon /> },
};

const CLOUD_HINTS = ["Google Drive", "OneDrive", "GitHub", "Dropbox"];

const EMPTY_FORM = { filePath: "", description: "", taskItemId: 0 };

// ─────────────────────────────────────────────────────────────────────────────

export default function FileRepository() {
    const theme = useTheme();
    const t = theme.palette.custom;

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    // ── fetch ─────────────────────────────────────────────────────────────────
    const fetchFiles = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fileSystemApi.getAllFiles();
            setFiles(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.response?.data?.message ?? err?.message ?? "Failed to load files.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchFiles(); }, [fetchFiles]);

    // ── dialog helpers ────────────────────────────────────────────────────────
    const openAdd = () => {
        setEditTarget(null);
        setForm(EMPTY_FORM);
        setFormError("");
        setDialogOpen(true);
    };

    const openEdit = (f) => {
        setEditTarget(f);
        setForm({ filePath: f.filePath, description: f.description ?? "", taskItemId: f.taskItemId ?? 0 });
        setFormError("");
        setDialogOpen(true);
    };

    const closeDialog = () => { if (!saving) setDialogOpen(false); };

    // ── save ──────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!form.filePath.trim()) {
            setFormError("Please enter a link.");
            return;
        }
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
                    taskItemId: form.taskItemId,
                });
            }
            await fetchFiles();
            setDialogOpen(false);
        } catch (err) {
            setFormError(err?.response?.data?.message ?? "Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // ── delete ────────────────────────────────────────────────────────────────
    const handleDelete = async (attachmentId) => {
        setFiles((prev) => prev.filter((f) => f.attachmentId !== attachmentId));
        try {
            await fileSystemApi.deleteFile(attachmentId);
        } catch {
            await fetchFiles();
        }
    };

    // ── group by task ─────────────────────────────────────────────────────────
    const grouped = files.reduce((acc, f) => {
        const key = f.taskItemId ? `Task #${f.taskItemId}` : "General";
        if (!acc[key]) acc[key] = [];
        acc[key].push(f);
        return acc;
    }, {});

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
                <Button
                    variant="contained"
                    startIcon={<AddLinkOutlinedIcon />}
                    onClick={openAdd}
                    sx={{ bgcolor: t.accentPrimary, borderRadius: 2 }}
                >
                    Add Link
                </Button>
            </Stack>

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
                        Upload your file to a cloud service and paste the shareable link here.
                        Works great with{" "}
                        {CLOUD_HINTS.map((name, i) => (
                            <span key={name}>
                                <strong>{name}</strong>{i < CLOUD_HINTS.length - 1 ? ", " : "."}
                            </span>
                        ))}
                    </Typography>
                </Box>
            </Paper>

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

            {/* Empty state */}
            {!loading && !error && files.length === 0 && (
                <Box sx={{ textAlign: "center", py: 8 }}>
                    <AddLinkOutlinedIcon sx={{ fontSize: 48, color: t.textTertiary, mb: 1.5 }} />
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem", mb: 0.5 }}>
                        No links yet.
                    </Typography>
                    <Typography sx={{ color: t.textTertiary, fontSize: "0.8rem" }}>
                        Click <strong>Add Link</strong> to share a file from Google Drive, GitHub, or any cloud service.
                    </Typography>
                </Box>
            )}

            {/* File list */}
            {!loading && !error && files.length > 0 && (
                <Stack spacing={2.5}>
                    {Object.entries(grouped).map(([groupName, groupFiles]) => (
                        <Box key={groupName}>
                            <Typography sx={{
                                fontSize: "0.8rem", fontWeight: 700, color: t.textTertiary,
                                textTransform: "uppercase", letterSpacing: "0.07em", mb: 1.2,
                            }}>
                                🔗 {groupName} ({groupFiles.length})
                            </Typography>
                            <Stack spacing={1}>
                                {groupFiles.map((f) => {
                                    const type = getFileType(f.filePath);
                                    const meta = TYPE_META[type];
                                    const displayName = getDisplayName(f.filePath, f.description);
                                    return (
                                        <Paper key={f.attachmentId} elevation={1} sx={{
                                            p: 2, borderRadius: 3,
                                            bgcolor: theme.palette.background.paper,
                                        }}>
                                            <Stack
                                                direction={{ xs: "column", sm: "row" }}
                                                alignItems={{ sm: "center" }}
                                                justifyContent="space-between"
                                                gap={1.5}
                                            >
                                                {/* Left */}
                                                <Stack direction="row" alignItems="center" gap={1.5}>
                                                    <Box sx={{
                                                        p: 0.8, borderRadius: 2,
                                                        bgcolor: `${meta.color}15`,
                                                        color: meta.color,
                                                        "& svg": { fontSize: 20 },
                                                    }}>
                                                        {meta.icon}
                                                    </Box>
                                                    <Box>
                                                        <Typography sx={{
                                                            fontWeight: 600, fontSize: "0.875rem",
                                                            color: t.textPrimary,
                                                        }}>
                                                            {displayName}
                                                        </Typography>
                                                        <Typography
                                                            component="a"
                                                            href={f.filePath}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            sx={{
                                                                fontSize: "0.72rem", color: t.accentPrimary,
                                                                textDecoration: "none",
                                                                "&:hover": { textDecoration: "underline" },
                                                                display: "block", maxWidth: 400,
                                                                overflow: "hidden", textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            {f.filePath}
                                                        </Typography>
                                                        {f.description && (
                                                            <Stack direction="row" alignItems="flex-start" gap={0.5} mt={0.4}>
                                                                <CommentOutlinedIcon sx={{
                                                                    fontSize: 12, color: t.textTertiary,
                                                                    mt: "2px", flexShrink: 0,
                                                                }} />
                                                                <Typography sx={{
                                                                    fontSize: "0.75rem", color: t.textTertiary, lineHeight: 1.4,
                                                                }}>
                                                                    {f.description}
                                                                </Typography>
                                                            </Stack>
                                                        )}
                                                    </Box>
                                                </Stack>

                                                {/* Right */}
                                                <Stack direction="row" alignItems="center" gap={0.5} sx={{ flexShrink: 0 }}>
                                                    <Tooltip title="Open link">
                                                        <IconButton size="small" component="a"
                                                            href={f.filePath} target="_blank" rel="noopener noreferrer"
                                                            sx={{ color: t.textTertiary, "&:hover": { color: t.accentPrimary } }}>
                                                            <DownloadOutlinedIcon sx={{ fontSize: 17 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" onClick={() => openEdit(f)}
                                                            sx={{ color: t.textTertiary, "&:hover": { color: t.accentPrimary } }}>
                                                            <EditOutlinedIcon sx={{ fontSize: 17 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" onClick={() => handleDelete(f.attachmentId)}
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
                        </Box>
                    ))}
                </Stack>
            )}

            {/* Add / Edit Dialog */}
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

                    <TextField
                        fullWidth
                        label="File Link *"
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

                    <TextField
                        fullWidth
                        label="Description (optional)"
                        placeholder="e.g. Final proposal PDF"
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        multiline
                        minRows={2}
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
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                        startIcon={saving
                            ? <CircularProgress size={14} color="inherit" />
                            : <AddLinkOutlinedIcon />}
                        sx={{ bgcolor: t.accentPrimary, borderRadius: 2 }}
                    >
                        {saving ? "Saving…" : editTarget ? "Save Changes" : "Add Link"}
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}