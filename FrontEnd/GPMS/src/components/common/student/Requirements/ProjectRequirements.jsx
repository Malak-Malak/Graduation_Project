// src/components/common/student/Requirements/ProjectRequirements.jsx
//
// Phase 2 only — shown in student sidebar when currentPhase === "Phase2"
// Student can: view, add, edit, delete requirements
//
// API:
//   GET    /api/Requirement
//   POST   /api/Requirement/add          → { description }
//   PUT    /api/Requirement/update/{id}  → { description }
//   DELETE /api/Requirement/delete/{id}

import { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Stack, Paper, Button, IconButton, Tooltip,
    CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Chip,
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

// ── constants ─────────────────────────────────────────────────────────────────
const ACCENT = "#6D8A7D"; // Phase 2 color (P2.color من الـ Sidebar)
const EMPTY_FORM = { description: "" };

// ─────────────────────────────────────────────────────────────────────────────

export default function ProjectRequirements() {
    const theme = useTheme();
    const t = theme.palette.custom ?? {};

    const accentColor = t.accentPrimary ?? ACCENT;

    // ── state ─────────────────────────────────────────────────────────────────
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // add/edit dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null); // null = add, object = edit
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    // inline delete confirmation
    const [deletingId, setDeletingId] = useState(null);

    // ── fetch ─────────────────────────────────────────────────────────────────
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

    useEffect(() => {
        fetchRequirements();
    }, [fetchRequirements]);

    // ── dialog helpers ────────────────────────────────────────────────────────
    const openAdd = () => {
        setEditTarget(null);
        setForm(EMPTY_FORM);
        setFormError("");
        setDialogOpen(true);
    };

    const openEdit = (req) => {
        setEditTarget(req);
        setForm({ description: req.description ?? "" });
        setFormError("");
        setDialogOpen(true);
    };

    const closeDialog = () => {
        if (!saving) setDialogOpen(false);
    };

    // ── save (add or edit) ────────────────────────────────────────────────────
    const handleSave = async () => {
        const desc = form.description.trim();
        if (!desc) {
            setFormError("Description is required.");
            return;
        }

        setSaving(true);
        setFormError("");
        try {
            if (editTarget) {
                await requirementApi.update(editTarget.requirementId, desc);
            } else {
                await requirementApi.add(desc);
            }
            await fetchRequirements();
            setDialogOpen(false);
        } catch (err) {
            setFormError(
                err?.response?.data?.message ?? "Something went wrong."
            );
        } finally {
            setSaving(false);
        }
    };

    // ── delete ────────────────────────────────────────────────────────────────
    const handleDelete = async (requirementId) => {
        // optimistic remove
        setRequirements((prev) =>
            prev.filter((r) => r.requirementId !== requirementId)
        );
        setDeletingId(null);
        try {
            await requirementApi.remove(requirementId);
        } catch {
            // rollback on failure
            await fetchRequirements();
        }
    };

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <Box sx={{ maxWidth: 780 }}>
            {/* Header */}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                mb={3}
            >
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
                        bgcolor: accentColor,
                        borderRadius: 2,
                        flexShrink: 0,
                        "&:hover": { bgcolor: accentColor, filter: "brightness(0.92)" },
                    }}
                >
                    Add Requirement
                </Button>
            </Stack>

            {/* Phase 2 info banner */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 3,
                    bgcolor: `${accentColor}08`,
                    border: `1px solid ${accentColor}25`,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                }}
            >
                <AssignmentOutlinedIcon
                    sx={{ color: accentColor, mt: "2px", flexShrink: 0 }}
                />
                <Box>
                    <Typography
                        sx={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: t.textPrimary,
                            mb: 0.3,
                        }}
                    >
                        Project Phase Requirements
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: "0.78rem",
                            color: t.textSecondary,
                            lineHeight: 1.6,
                        }}
                    >
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
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Empty state */}
            {!loading && !error && requirements.length === 0 && (
                <Box sx={{ textAlign: "center", py: 8 }}>
                    <AssignmentTurnedInOutlinedIcon
                        sx={{ fontSize: 48, color: t.textTertiary, mb: 1.5 }}
                    />
                    <Typography
                        sx={{ color: t.textSecondary, fontSize: "0.9rem", mb: 0.5 }}
                    >
                        No requirements yet.
                    </Typography>
                    <Typography sx={{ color: t.textTertiary, fontSize: "0.8rem" }}>
                        Click <strong>Add Requirement</strong> to define your first project
                        requirement.
                    </Typography>
                </Box>
            )}

            {/* Requirements list */}
            {!loading && !error && requirements.length > 0 && (
                <Stack spacing={1.5}>
                    {requirements.map((req, index) => (
                        <Paper
                            key={req.requirementId}
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
                            <Stack
                                direction="row"
                                alignItems="center"
                                gap={2}
                                sx={{ px: 2.5, py: 2 }}
                            >
                                {/* Index badge */}
                                <Box
                                    sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: "50%",
                                        bgcolor: `${accentColor}15`,
                                        color: accentColor,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.75rem",
                                        fontWeight: 700,
                                        flexShrink: 0,
                                    }}
                                >
                                    {index + 1}
                                </Box>

                                {/* Description */}
                                <Typography
                                    sx={{
                                        flex: 1,
                                        fontSize: "0.875rem",
                                        color: t.textPrimary,
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {req.description}
                                </Typography>

                                {/* Actions */}
                                {deletingId === req.requirementId ? (
                                    // Confirm delete inline
                                    <Stack direction="row" alignItems="center" gap={0.5}>
                                        <Typography
                                            sx={{
                                                fontSize: "0.75rem",
                                                color: t.error ?? "#C47E7E",
                                                mr: 0.5,
                                            }}
                                        >
                                            Delete?
                                        </Typography>
                                        <Tooltip title="Confirm delete">
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    handleDelete(req.requirementId)
                                                }
                                                sx={{
                                                    color: t.error ?? "#C47E7E",
                                                    "&:hover": {
                                                        bgcolor: `${t.error ?? "#C47E7E"}14`,
                                                    },
                                                }}
                                            >
                                                <CheckOutlinedIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Cancel">
                                            <IconButton
                                                size="small"
                                                onClick={() => setDeletingId(null)}
                                                sx={{ color: t.textTertiary }}
                                            >
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
                                                sx={{
                                                    color: t.textTertiary,
                                                    "&:hover": { color: accentColor },
                                                }}
                                            >
                                                <EditOutlinedIcon sx={{ fontSize: 17 }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    setDeletingId(req.requirementId)
                                                }
                                                sx={{
                                                    color: t.textTertiary,
                                                    "&:hover": {
                                                        color: t.error ?? "#C47E7E",
                                                    },
                                                }}
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
                        sx={{
                            bgcolor: `${accentColor}12`,
                            color: accentColor,
                            fontWeight: 600,
                            fontSize: "0.72rem",
                        }}
                    />
                </Box>
            )}

            {/* ── Add / Edit Dialog ── */}
            <Dialog
                open={dialogOpen}
                onClose={closeDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle
                    sx={{ color: t.textPrimary, fontWeight: 700, pb: 1 }}
                >
                    {editTarget ? "Edit Requirement" : "Add Requirement"}
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <TextField
                        fullWidth
                        label="Description *"
                        placeholder="e.g. The system shall allow users to login using email and password"
                        value={form.description}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, description: e.target.value }))
                        }
                        multiline
                        minRows={3}
                        maxRows={8}
                        error={Boolean(formError)}
                        sx={{ mt: 1 }}
                        onKeyDown={(e) => {
                            // Ctrl+Enter to save
                            if (e.key === "Enter" && e.ctrlKey) handleSave();
                        }}
                    />
                    {formError && (
                        <Alert
                            severity="error"
                            sx={{ mt: 1.5, borderRadius: 2, fontSize: "0.8rem" }}
                        >
                            {formError}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button
                        onClick={closeDialog}
                        disabled={saving}
                        sx={{ color: t.textSecondary }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                        startIcon={
                            saving ? (
                                <CircularProgress size={14} color="inherit" />
                            ) : editTarget ? (
                                <CheckOutlinedIcon />
                            ) : (
                                <AddOutlinedIcon />
                            )
                        }
                        sx={{
                            bgcolor: accentColor,
                            borderRadius: 2,
                            "&:hover": {
                                bgcolor: accentColor,
                                filter: "brightness(0.92)",
                            },
                        }}
                    >
                        {saving
                            ? "Saving…"
                            : editTarget
                                ? "Save Changes"
                                : "Add"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}