import { useState, useEffect, useCallback } from "react";
import {
    Box, Paper, Typography, Stack, Chip, Button, Grid, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    CircularProgress, Alert, alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import {
    getPendingAppointments,
    respondToAppointment,
} from "../../../../api/handler/endpoints/supervisorApi";

const PRIMARY = "#d0895b";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDateTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    const datePart = d.toLocaleDateString("en-GB", {
        weekday: "short", day: "numeric", month: "short",
    });
    const timePart = d.toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit",
    });
    return `${datePart} · ${timePart}`;
}

// ── Approve Dialog (asks for meeting link) ────────────────────────────────────
function ApproveDialog({ appointment, open, onClose, onConfirm }) {
    const [link, setLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleConfirm = async () => {
        setLoading(true);
        setError("");
        try {
            await onConfirm(appointment.appointmentId, true, link);
            setLink("");
            onClose();
        } catch (err) {
            setError(
                err?.response?.data?.message
                ?? err?.response?.data
                ?? "Failed to approve. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        setLink("");
        setError("");
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha("#6D8A7D", 0.12) }}>
                        <CheckCircleOutlineIcon sx={{ color: "#6D8A7D", fontSize: 22, display: "block" }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>Approve Appointment</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Add a meeting link (optional)
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                    {appointment && (
                        <Stack spacing={0.8}>
                            <Stack direction="row" alignItems="center" spacing={0.8}>
                                <PersonOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                                <Typography variant="body2" color="text.secondary">
                                    {appointment.studentName}
                                </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={0.8}>
                                <CalendarMonthOutlinedIcon sx={{ fontSize: 15, color: PRIMARY }} />
                                <Typography variant="body2" fontWeight={500}>
                                    {formatDateTime(appointment.dateTime)}
                                </Typography>
                            </Stack>
                        </Stack>
                    )}

                    <TextField
                        label="Meeting Link"
                        placeholder="https://meet.google.com/… (optional)"
                        size="small"
                        fullWidth
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <VideocamOutlinedIcon sx={{ fontSize: 18, color: "text.disabled", mr: 0.5 }} />
                            ),
                        }}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button
                    onClick={handleClose} disabled={loading}
                    sx={{ borderRadius: 2, textTransform: "none", color: "text.secondary" }}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutlineIcon />}
                    sx={{
                        bgcolor: "#6D8A7D", "&:hover": { bgcolor: "#556e63" },
                        borderRadius: 2, textTransform: "none", fontWeight: 600, px: 3,
                    }}>
                    {loading ? "Approving…" : "Confirm Approval"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SupervisorMeetings() {
    const theme = useTheme();
    const t = theme.palette.custom;

    // ── State ─────────────────────────────────────────────────────────────────
    const [pending, setPending] = useState([]);
    const [approved, setApproved] = useState([]);   // locally promoted after approval
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");

    // Approve dialog state
    const [approveTarget, setApproveTarget] = useState(null); // appointment object

    // Inline reject loading per appointmentId
    const [rejectingId, setRejectingId] = useState(null);

    // ── Fetch pending appointments ────────────────────────────────────────────
    const fetchPending = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getPendingAppointments();
            setPending(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(
                err?.response?.data?.message
                ?? err?.response?.data
                ?? "Failed to load appointments."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPending(); }, [fetchPending]);

    // ── Respond handler (shared for approve & reject) ─────────────────────────
    /**
     * @param {number} appointmentId
     * @param {boolean} isApproved
     * @param {string} link  — empty string when rejecting
     */
    const handleRespond = async (appointmentId, isApproved, link = "") => {
        setActionError("");
        await respondToAppointment({ appointmentId, isApproved, link });

        // Optimistic update: remove from pending list
        setPending((prev) => {
            const found = prev.find((a) => a.appointmentId === appointmentId);
            if (isApproved && found) {
                // Move to approved list with the link attached
                setApproved((ap) => [...ap, { ...found, status: "Approved", link }]);
            }
            return prev.filter((a) => a.appointmentId !== appointmentId);
        });
    };

    // ── Reject handler (no dialog needed) ────────────────────────────────────
    const handleReject = async (appt) => {
        setRejectingId(appt.appointmentId);
        setActionError("");
        try {
            await handleRespond(appt.appointmentId, false, "");
        } catch (err) {
            setActionError(
                err?.response?.data?.message
                ?? err?.response?.data
                ?? "Failed to reject appointment."
            );
        } finally {
            setRejectingId(null);
        }
    };

    return (
        <Box sx={{ maxWidth: 960 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h2" sx={{ color: t?.textPrimary, mb: 0.5 }}>Meetings</Typography>
                <Typography sx={{ color: t?.textSecondary, fontSize: "0.9rem" }}>
                    {pending.length} pending · {approved.length} approved this session
                </Typography>
            </Box>

            {/* Global error */}
            {(error || actionError) && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {error || actionError}
                </Alert>
            )}

            <Grid container spacing={2}>
                {/* ── Pending Requests ── */}
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper, mb: 2 }}>
                        <Typography variant="h4" sx={{ color: t?.textPrimary, mb: 2 }}>
                            Appointment Requests
                        </Typography>

                        {loading && (
                            <Stack alignItems="center" py={4}>
                                <CircularProgress sx={{ color: PRIMARY }} />
                            </Stack>
                        )}

                        {!loading && (
                            <Stack spacing={1.5}>
                                {pending.map((appt) => (
                                    <Box
                                        key={appt.appointmentId}
                                        sx={{
                                            p: 1.8, borderRadius: 2.5,
                                            border: `1px solid ${t?.borderLight ?? "#e0e0e0"}`,
                                            borderLeft: `3px solid ${PRIMARY}`,
                                        }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                            <Box flex={1} mr={1}>
                                                <Typography sx={{ fontWeight: 600, color: t?.textPrimary }}>
                                                    {appt.studentName}
                                                </Typography>
                                                {appt.teamName && (
                                                    <Typography sx={{ fontSize: "0.78rem", color: t?.textSecondary, mt: 0.2 }}>
                                                        {appt.teamName}
                                                    </Typography>
                                                )}
                                                <Stack direction="row" alignItems="center" gap={0.8} mt={0.8}>
                                                    <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: t?.textTertiary }} />
                                                    <Typography sx={{ fontSize: "0.78rem", color: t?.textTertiary }}>
                                                        {formatDateTime(appt.dateTime)}
                                                    </Typography>
                                                </Stack>
                                            </Box>

                                            <Stack direction="row" gap={0.8} flexShrink={0}>
                                                {/* Approve — opens link dialog */}
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    onClick={() => setApproveTarget(appt)}
                                                    startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 14 }} />}
                                                    sx={{
                                                        bgcolor: "#6D8A7D",
                                                        "&:hover": { bgcolor: "#556e63" },
                                                        fontSize: "0.75rem", py: 0.5, px: 1.2,
                                                        textTransform: "none",
                                                    }}>
                                                    Approve
                                                </Button>

                                                {/* Reject — inline, no dialog */}
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => handleReject(appt)}
                                                    disabled={rejectingId === appt.appointmentId}
                                                    startIcon={
                                                        rejectingId === appt.appointmentId
                                                            ? <CircularProgress size={12} color="inherit" />
                                                            : null
                                                    }
                                                    sx={{
                                                        borderColor: "#C47E7E", color: "#C47E7E",
                                                        "&:hover": { borderColor: "#a85f5f", color: "#a85f5f" },
                                                        fontSize: "0.75rem", py: 0.5, px: 1.2,
                                                        textTransform: "none",
                                                    }}>
                                                    Decline
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Box>
                                ))}

                                {pending.length === 0 && (
                                    <Typography sx={{ textAlign: "center", color: t?.textTertiary, py: 2 }}>
                                        No pending appointment requests.
                                    </Typography>
                                )}
                            </Stack>
                        )}
                    </Paper>

                    {/* ── Approved Appointments (this session) ── */}
                    {approved.length > 0 && (
                        <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                            <Typography variant="h4" sx={{ color: t?.textPrimary, mb: 2 }}>
                                Approved Appointments
                            </Typography>
                            <Stack spacing={1}>
                                {approved.map((appt) => (
                                    <Stack
                                        key={appt.appointmentId}
                                        direction="row" alignItems="center" justifyContent="space-between"
                                        sx={{
                                            p: 1.5, borderRadius: 2,
                                            border: `1px solid ${t?.borderLight ?? "#e0e0e0"}`,
                                        }}>
                                        <Box>
                                            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: t?.textPrimary }}>
                                                {appt.studentName}
                                            </Typography>
                                            <Typography sx={{ fontSize: "0.72rem", color: t?.textSecondary }}>
                                                {formatDateTime(appt.dateTime)}
                                            </Typography>
                                            {appt.link && (
                                                <Typography
                                                    variant="caption"
                                                    component="a"
                                                    href={appt.link}
                                                    target="_blank"
                                                    sx={{ color: PRIMARY, display: "block", wordBreak: "break-all", mt: 0.3 }}>
                                                    {appt.link}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Chip
                                            label="Approved" size="small"
                                            sx={{
                                                bgcolor: alpha("#6D8A7D", 0.12), color: "#6D8A7D",
                                                fontWeight: 600, fontSize: "0.7rem", height: 22,
                                            }}
                                        />
                                    </Stack>
                                ))}
                            </Stack>
                        </Paper>
                    )}
                </Grid>

                {/* ── Info Panel ── */}
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                        <Typography variant="h4" sx={{ color: t?.textPrimary, mb: 0.5 }}>
                            How It Works
                        </Typography>
                        <Typography sx={{ fontSize: "0.78rem", color: t?.textTertiary, mb: 2 }}>
                            Students request a date &amp; time — you approve or decline.
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Stack spacing={2}>
                            {[
                                {
                                    icon: <PersonOutlinedIcon sx={{ fontSize: 18, color: PRIMARY }} />,
                                    title: "Student Requests",
                                    desc: "A student picks a preferred date and time and sends you a request.",
                                },
                                {
                                    icon: <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "#6D8A7D" }} />,
                                    title: "You Approve",
                                    desc: "Click Approve and optionally add a Google Meet / Zoom link.",
                                },
                                {
                                    icon: <CancelOutlinedIcon sx={{ fontSize: 18, color: "#C47E7E" }} />,
                                    title: "Or Decline",
                                    desc: "Click Decline if the time doesn't work — the student is notified.",
                                },
                                {
                                    icon: <VideocamOutlinedIcon sx={{ fontSize: 18, color: "#7E9FC4" }} />,
                                    title: "Student Joins",
                                    desc: "Once approved, the student sees the meeting link and can join.",
                                },
                            ].map(({ icon, title, desc }) => (
                                <Stack key={title} direction="row" spacing={1.5} alignItems="flex-start">
                                    <Box sx={{ mt: 0.2 }}>{icon}</Box>
                                    <Box>
                                        <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: t?.textPrimary }}>
                                            {title}
                                        </Typography>
                                        <Typography sx={{ fontSize: "0.78rem", color: t?.textSecondary, mt: 0.3 }}>
                                            {desc}
                                        </Typography>
                                    </Box>
                                </Stack>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            {/* ── Approve dialog (with link field) ── */}
            <ApproveDialog
                open={Boolean(approveTarget)}
                appointment={approveTarget}
                onClose={() => setApproveTarget(null)}
                onConfirm={handleRespond}
            />
        </Box>
    );
}