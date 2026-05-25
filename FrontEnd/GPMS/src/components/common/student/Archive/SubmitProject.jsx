import { useState } from "react";
import {
    Box, Typography, Stack, Button, CircularProgress,
    Alert, Paper, Chip, Dialog, DialogTitle,
    DialogContent, DialogActions,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";

import archiveApi from "../../../../api/handler/endpoints/archiveApi";

const ACCENT = "#6D8A7D";

export default function SubmitProject({ teamStatus, version = 0, onSubmitSuccess }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const t = theme.palette.custom ?? {};
    const accentColor = t.accentPrimary ?? ACCENT;

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const isActive = teamStatus?.isActive ?? false;
    const isSubmitted = teamStatus?.isSubmitted ?? false;
    const isArchived = teamStatus?.isArchived ?? false;

    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const paperBg = theme.palette.background.paper;

    const phaseLabel = version === 0 ? "Phase 1" : "Phase 2";

    const handleSubmit = async () => {
        setConfirmOpen(false);
        setSubmitting(true);
        setError(null);
        try {
            await archiveApi.submitProject(version);
            onSubmitSuccess?.();
        } catch (err) {
            setError(
                err?.response?.data?.message ??
                err?.response?.data ??
                "Could not submit project. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ── Archived ──────────────────────────────────────────────────────────────
    if (isArchived) {
        return (
            <Paper elevation={0} sx={{
                borderRadius: 3, border: `1px solid ${border}`,
                bgcolor: paperBg, overflow: "hidden",
            }}>
                <Box sx={{ height: 3, bgcolor: "#3DB97A" }} />
                <Box sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" gap={1.5} mb={1}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: 2,
                            bgcolor: "rgba(61,185,122,0.12)",
                            border: "1px solid rgba(61,185,122,0.25)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <CheckCircleOutlineIcon sx={{ fontSize: 20, color: "#3DB97A" }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: t.textPrimary }}>
                                {phaseLabel} Archived
                            </Typography>
                            <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary }}>
                                Your project has been successfully archived and is now publicly visible.
                            </Typography>
                        </Box>
                    </Stack>
                    <Chip
                        label="Archived"
                        size="small"
                        sx={{
                            bgcolor: "rgba(61,185,122,0.1)",
                            color: "#3DB97A",
                            border: "1px solid rgba(61,185,122,0.25)",
                            fontWeight: 700, fontSize: "0.72rem", borderRadius: 1.5,
                        }}
                    />
                </Box>
            </Paper>
        );
    }

    // ── Submitted / Pending ───────────────────────────────────────────────────
    if (isSubmitted) {
        return (
            <Paper elevation={0} sx={{
                borderRadius: 3, border: `1px solid ${border}`,
                bgcolor: paperBg, overflow: "hidden",
            }}>
                <Box sx={{ height: 3, bgcolor: "#BA7517" }} />
                <Box sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" gap={1.5} mb={1}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: 2,
                            bgcolor: "rgba(186,117,23,0.10)",
                            border: "1px solid rgba(186,117,23,0.25)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <HourglassEmptyOutlinedIcon sx={{ fontSize: 20, color: "#BA7517" }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: t.textPrimary }}>
                                Under Supervisor Review
                            </Typography>
                            <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary }}>
                                {phaseLabel} submitted. Waiting for supervisor approval to archive.
                            </Typography>
                        </Box>
                    </Stack>
                    <Chip
                        label="Pending Review"
                        size="small"
                        sx={{
                            bgcolor: "rgba(186,117,23,0.10)",
                            color: "#BA7517",
                            border: "1px solid rgba(186,117,23,0.25)",
                            fontWeight: 700, fontSize: "0.72rem", borderRadius: 1.5,
                        }}
                    />
                </Box>
            </Paper>
        );
    }

    // ── Not active ────────────────────────────────────────────────────────────
    if (!isActive) {
        return (
            <Paper elevation={0} sx={{
                borderRadius: 3, border: `1px solid ${border}`,
                bgcolor: paperBg, p: 3,
            }}>
                <Typography sx={{ fontSize: "0.85rem", color: t.textSecondary }}>
                    Your team must be active before you can submit the project for archiving.
                </Typography>
            </Paper>
        );
    }

    // ── Default: can submit ───────────────────────────────────────────────────
    return (
        <>
            <Paper elevation={0} sx={{
                borderRadius: 3, border: `1px solid ${border}`,
                bgcolor: paperBg, overflow: "hidden",
            }}>
                <Box sx={{ height: 3, bgcolor: accentColor }} />
                <Box sx={{ p: 3 }}>
                    {/* Header */}
                    <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: 2,
                            bgcolor: `${accentColor}15`,
                            border: `1px solid ${accentColor}30`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <ArchiveOutlinedIcon sx={{ fontSize: 20, color: accentColor }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: t.textPrimary }}>
                                Submit {phaseLabel} for Archive
                            </Typography>
                            <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary }}>
                                Notify your supervisor to review and archive this phase
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Info box */}
                    <Box sx={{
                        p: 2, borderRadius: 2, mb: 2,
                        bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                        border: `1px solid ${border}`,
                    }}>
                        <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, lineHeight: 1.7 }}>
                            Once submitted, your supervisor will be notified to review your uploaded
                            files and select which ones to keep in the archive. After approval,
                            task data, feedback, and progress reports for this phase will be cleaned up.
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ borderRadius: 2, mb: 2, fontSize: "0.8rem" }}>
                            {error}
                        </Alert>
                    )}

                    <Button
                        variant="contained"
                        startIcon={submitting
                            ? <CircularProgress size={14} color="inherit" />
                            : <SendOutlinedIcon />
                        }
                        onClick={() => setConfirmOpen(true)}
                        disabled={submitting}
                        sx={{
                            bgcolor: accentColor, borderRadius: 2, boxShadow: "none",
                            fontWeight: 600, fontSize: "0.85rem",
                            "&:hover": { bgcolor: accentColor, filter: "brightness(0.92)", boxShadow: "none" },
                            "&.Mui-disabled": { opacity: 0.5 },
                        }}
                    >
                        {submitting ? "Submitting…" : `Submit ${phaseLabel}`}
                    </Button>
                </Box>
            </Paper>

            {/* Confirm Dialog */}
            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                maxWidth="xs" fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        border: `1px solid ${border}`,
                        bgcolor: paperBg,
                        boxShadow: isDark
                            ? "0 20px 60px rgba(0,0,0,0.5)"
                            : "0 20px 40px rgba(0,0,0,0.10)",
                    },
                }}
            >
                <Box sx={{ height: 3, bgcolor: accentColor }} />
                <DialogTitle sx={{
                    fontWeight: 700, fontSize: "0.95rem",
                    color: t.textPrimary, pb: 0.5,
                }}>
                    <Stack direction="row" alignItems="center" gap={1.2}>
                        <Box sx={{
                            width: 28, height: 28, borderRadius: 1.5,
                            bgcolor: `${accentColor}15`,
                            border: `1px solid ${accentColor}30`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <InventoryOutlinedIcon sx={{ fontSize: 15, color: accentColor }} />
                        </Box>
                        Confirm Submission
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Typography sx={{
                        fontSize: "0.82rem",
                        color: t.textSecondary,
                        lineHeight: 1.7,
                    }}>
                        Are you sure you want to submit <strong style={{ color: "inherit" }}>{phaseLabel}</strong> for
                        archiving? Your supervisor will be notified to review your files.
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button
                        onClick={() => setConfirmOpen(false)}
                        sx={{ color: t.textSecondary, textTransform: "none", borderRadius: 2 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        startIcon={<SendOutlinedIcon />}
                        sx={{
                            bgcolor: accentColor, borderRadius: 2, boxShadow: "none",
                            textTransform: "none", fontWeight: 600,
                            "&:hover": { bgcolor: accentColor, filter: "brightness(0.92)", boxShadow: "none" },
                        }}
                    >
                        Yes, Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}