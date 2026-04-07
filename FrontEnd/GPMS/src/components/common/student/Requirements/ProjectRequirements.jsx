// src/components/common/student/Requirements/ProjectRequirements.jsx

import { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Stack, Paper, Button, IconButton, Tooltip,
    CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Chip, MenuItem, Select, InputLabel,
    FormControl, FormHelperText,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";

import requirementApi from "../../../../api/handler/endpoints/requirementApi";

const ACCENT = "#6D8A7D";

const PRIORITY_OPTIONS = ["Low", "Medium", "High"];
const TYPE_OPTIONS = ["Functional", "Non-Functional"];

const EMPTY_FORM = { title: "", description: "", priority: "", type: "" };

const PRIORITY_COLORS = {
    Low: { bg: "#E8F5E9", color: "#388E3C" },
    Medium: { bg: "#FFF8E1", color: "#F9A825" },
    High: { bg: "#FFEBEE", color: "#C62828" },
};

const TYPE_COLORS = {
    Functional: { bg: "#E3F2FD", color: "#1565C0" },
    "Non-Functional": { bg: "#F3E5F5", color: "#6A1B9A" },
};

export default function ProjectRequirements() {
    const theme = useTheme();
    const t = theme.palette.custom ?? {};
    const accentColor = t.accentPrimary ?? ACCENT;

    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const [deletingId, setDeletingId] = useState(null);

    // ── fetch ────────────────────────────────────────────────────────────────
    const fetchRequirements = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await requirementApi.getAll();
            setRequirements(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(
                err?.response?.data?.message ??
                err?.message ??
                "Failed to load requirements."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRequirements(); }, [fetchRequirements]);

    // ── dialog helpers ───────────────────────────────────────────────────────
    const openAdd = () => {
        setEditTarget(null);
        setForm(EMPTY_FORM);
        setFormErrors({});
        setDialogOpen(true);
    };

    const openEdit = (req) => {
        setEditTarget(req);
        setForm({
            title: req.title ?? "",
            description: req.description ?? "",
            priority: req.priority ?? "",
            type: req.type ?? "",
        });
        setFormErrors({});
        setDialogOpen(true);
    };

    const closeDialog = () => { if (!saving) setDialogOpen(false); };

    // ── validate ─────────────────────────────────────────────────────────────
    const validate = () => {
        const errs = {};
        if (!form.title.trim()) errs.title = "Title is required.";
        if (!form.description.trim()) errs.description = "Description is required.";
        if (!form.priority) errs.priority = "Priority is required.";
        if (!form.type) errs.type = "Type is required.";
        return errs;
    };

    // ── save ─────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setFormErrors(errs); return; }

        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            priority: form.priority,
            type: form.type,
        };

        setSaving(true);
        setFormErrors({});
        try {
            if (editTarget) {
                await requirementApi.update(editTarget.id, payload);
            } else {
                await requirementApi.add(payload);
            }
            await fetchRequirements();
            setDialogOpen(false);
        } catch (err) {
            setFormErrors({ api: err?.response?.data?.message ?? "Something went wrong." });
        } finally {
            setSaving(false);
        }
    };

    // ── delete ───────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        setRequirements((prev) => prev.filter((r) => r.id !== id));
        setDeletingId(null);
        try {
            await requirementApi.remove(id);
        } catch {
            await fetchRequirements();
        }
    };

    // ── shared field sx ──────────────────────────────────────────────────────
    const fieldSx = { mt: 1.5 };

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <Box sx={{ width: "100%" }}>

            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                    <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>
                        Project Requirements
                    </Typography>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.88rem" }}>
                        Define and manage the requirements for your project
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddOutlinedIcon />}
                    onClick={openAdd}
                    sx={{
                        bgcolor: accentColor, borderRadius: 2, flexShrink: 0,
                        "&:hover": { bgcolor: accentColor, filter: "brightness(0.92)" },
                    }}
                >
                    Add Requirement
                </Button>
            </Stack>

            {/* Banner */}
            <Paper elevation={0} sx={{
                p: 2, mb: 3, borderRadius: 3,
                bgcolor: `${accentColor}08`, border: `1px solid ${accentColor}25`,
                display: "flex", alignItems: "flex-start", gap: 1.5,
            }}>
                <AssignmentOutlinedIcon sx={{ color: accentColor, mt: "2px", flexShrink: 0 }} />
                <Box>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: t.textPrimary, mb: 0.3 }}>
                        Project Phase Requirements
                    </Typography>
                    <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, lineHeight: 1.6 }}>
                        List all functional and non-functional requirements for your project.
                        Keep them clear and specific so your supervisor can review them easily.
                    </Typography>
                </Box>
            </Paper>

            {/* Loading */}
            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress sx={{ color: accentColor }} />
                </Box>
            )}

            {/* Error */}
            {!loading && error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
            )}

            {/* Empty state */}
            {!loading && !error && requirements.length === 0 && (
                <Box sx={{ textAlign: "center", py: 8 }}>
                    <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 48, color: t.textTertiary, mb: 1.5 }} />
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem", mb: 0.5 }}>
                        No requirements yet.
                    </Typography>
                    <Typography sx={{ color: t.textTertiary, fontSize: "0.8rem" }}>
                        Click <strong>Add Requirement</strong> to define your first project requirement.
                    </Typography>
                </Box>
            )}

            {/* List */}
            {!loading && !error && requirements.length > 0 && (
                <Stack spacing={1.5}>
                    {requirements.map((req, index) => (
                        <Paper
                            key={req.id}
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                bgcolor: theme.palette.background.paper,
                                border: `1px solid ${t.borderLight}`,
                                transition: "box-shadow .15s",
                                "&:hover": { boxShadow: theme.shadows[2] },
                                overflow: "hidden",
                            }}
                        >
                            <Stack direction="row" alignItems="flex-start" gap={2} sx={{ px: 2.5, py: 2 }}>

                                {/* Index badge */}
                                <Box sx={{
                                    width: 28, height: 28, borderRadius: "50%",
                                    bgcolor: `${accentColor}15`, color: accentColor,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "0.75rem", fontWeight: 700, flexShrink: 0, mt: "2px",
                                }}>
                                    {index + 1}
                                </Box>

                                {/* Content */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{
                                        fontSize: "0.875rem", fontWeight: 600,
                                        color: t.textPrimary, mb: 0.4,
                                    }}>
                                        {req.title}
                                    </Typography>
                                    <Typography sx={{
                                        fontSize: "0.82rem", color: t.textSecondary,
                                        lineHeight: 1.6, mb: 1,
                                    }}>
                                        {req.description}
                                    </Typography>

                                    {/* Chips row */}
                                    <Stack direction="row" gap={0.8} flexWrap="wrap">
                                        {req.priority && (
                                            <Chip
                                                label={req.priority}
                                                size="small"
                                                sx={{
                                                    bgcolor: PRIORITY_COLORS[req.priority]?.bg ?? "#F5F5F5",
                                                    color: PRIORITY_COLORS[req.priority]?.color ?? "#555",
                                                    fontWeight: 600, fontSize: "0.7rem", height: 22,
                                                }}
                                            />
                                        )}
                                        {req.type && (
                                            <Chip
                                                label={req.type}
                                                size="small"
                                                sx={{
                                                    bgcolor: TYPE_COLORS[req.type]?.bg ?? "#F5F5F5",
                                                    color: TYPE_COLORS[req.type]?.color ?? "#555",
                                                    fontWeight: 600, fontSize: "0.7rem", height: 22,
                                                }}
                                            />
                                        )}
                                    </Stack>
                                </Box>

                                {/* Actions */}
                                {deletingId === req.id ? (
                                    <Stack direction="row" alignItems="center" gap={0.5}>
                                        <Typography sx={{ fontSize: "0.75rem", color: t.error ?? "#C47E7E", mr: 0.5 }}>
                                            Delete?
                                        </Typography>
                                        <Tooltip title="Confirm delete">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(req.id)}
                                                sx={{ color: t.error ?? "#C47E7E", "&:hover": { bgcolor: `${t.error ?? "#C47E7E"}14` } }}
                                            >
                                                <CheckOutlinedIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Cancel">
                                            <IconButton size="small" onClick={() => setDeletingId(null)} sx={{ color: t.textTertiary }}>
                                                <CloseOutlinedIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                ) : (
                                    <Stack direction="row" gap={0.5} sx={{ flexShrink: 0 }}>
                                        <Tooltip title="Edit">
                                            <IconButton
                                                size="small"
                                                onClick={() => openEdit(req)}
                                                sx={{ color: t.textTertiary, "&:hover": { color: accentColor } }}
                                            >
                                                <EditOutlinedIcon sx={{ fontSize: 17 }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                size="small"
                                                onClick={() => setDeletingId(req.id)}
                                                sx={{ color: t.textTertiary, "&:hover": { color: t.error ?? "#C47E7E" } }}
                                            >
                                                <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                )}
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            )}

            {/* Count chip */}
            {!loading && !error && requirements.length > 0 && (
                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                    <Chip
                        label={`${requirements.length} requirement${requirements.length !== 1 ? "s" : ""}`}
                        size="small"
                        sx={{ bgcolor: `${accentColor}12`, color: accentColor, fontWeight: 600, fontSize: "0.72rem" }}
                    />
                </Box>
            )}

            {/* ── Dialog ── */}
            <Dialog
                open={dialogOpen}
                onClose={closeDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ color: t.textPrimary, fontWeight: 700, pb: 1 }}>
                    {editTarget ? "Edit Requirement" : "Add Requirement"}
                </DialogTitle>

                <DialogContent sx={{ pt: 0.5 }}>

                    {/* Title */}
                    <TextField
                        fullWidth
                        label="Title *"
                        placeholder="e.g. User Authentication"
                        value={form.title}
                        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                        error={Boolean(formErrors.title)}
                        helperText={formErrors.title}
                        sx={fieldSx}
                    />

                    {/* Description */}
                    <TextField
                        fullWidth
                        label="Description *"
                        placeholder="e.g. The system shall allow users to login using email and password"
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        multiline
                        minRows={3}
                        maxRows={8}
                        error={Boolean(formErrors.description)}
                        helperText={formErrors.description}
                        sx={fieldSx}
                        onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleSave(); }}
                    />

                    {/* Priority + Type — side by side */}
                    <Stack direction="row" gap={2} sx={fieldSx}>
                        <FormControl fullWidth error={Boolean(formErrors.priority)}>
                            <InputLabel>Priority *</InputLabel>
                            <Select
                                value={form.priority}
                                label="Priority *"
                                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                            >
                                {PRIORITY_OPTIONS.map((o) => (
                                    <MenuItem key={o} value={o}>
                                        <Stack direction="row" alignItems="center" gap={1}>
                                            <Box sx={{
                                                width: 10, height: 10, borderRadius: "50%",
                                                bgcolor: PRIORITY_COLORS[o]?.color ?? "#999",
                                            }} />
                                            {o}
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </Select>
                            {formErrors.priority && <FormHelperText>{formErrors.priority}</FormHelperText>}
                        </FormControl>

                        <FormControl fullWidth error={Boolean(formErrors.type)}>
                            <InputLabel>Type *</InputLabel>
                            <Select
                                value={form.type}
                                label="Type *"
                                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                            >
                                {TYPE_OPTIONS.map((o) => (
                                    <MenuItem key={o} value={o}>
                                        <Stack direction="row" alignItems="center" gap={1}>
                                            <Box sx={{
                                                width: 10, height: 10, borderRadius: "50%",
                                                bgcolor: TYPE_COLORS[o]?.color ?? "#999",
                                            }} />
                                            {o}
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </Select>
                            {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
                        </FormControl>
                    </Stack>

                    {/* API error */}
                    {formErrors.api && (
                        <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2, fontSize: "0.8rem" }}>
                            {formErrors.api}
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
                            : editTarget ? <CheckOutlinedIcon /> : <AddOutlinedIcon />}
                        sx={{
                            bgcolor: accentColor, borderRadius: 2,
                            "&:hover": { bgcolor: accentColor, filter: "brightness(0.92)" },
                        }}
                    >
                        {saving ? "Saving…" : editTarget ? "Save Changes" : "Add"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}