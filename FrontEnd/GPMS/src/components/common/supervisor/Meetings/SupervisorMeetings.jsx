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
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import {
    getPendingAppointments,
    respondToAppointment,
} from "../../../../api/handler/endpoints/supervisorApi";

const PRIMARY = "#d0895b";
const STORAGE_KEY = "gpms_supervisor_scheduled_v2";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDateTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
        + " · "
        + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function isUpcoming(iso) {
    return new Date(iso) > new Date();
}

// ─── Approve Dialog ───────────────────────────────────────────────────────────
function ApproveDialog({ appointment, open, onClose, onConfirm }) {
    const [link, setLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleConfirm = async () => {
        setLoading(true);
        setError("");
        try {
            await onConfirm(appointment.id, true, link);
            setLink("");
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message ?? err?.response?.data ?? "Failed to approve.");
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

    if (!appointment) return null;

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
                            Optionally add a meeting link
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                    {/* Summary */}
                    <Stack spacing={0.8} sx={{
                        p: 1.5, borderRadius: 2,
                        bgcolor: alpha(PRIMARY, 0.06),
                        border: `1px solid ${alpha(PRIMARY, 0.15)}`,
                    }}>
                        <Stack direction="row" alignItems="center" spacing={0.8}>
                            <FolderOutlinedIcon sx={{ fontSize: 15, color: PRIMARY }} />
                            <Typography variant="body2" fontWeight={700}>
                                {appointment.projectName ?? `Team #${appointment.teamId}`}
                            </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.8}>
                            <PersonOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                            <Typography variant="body2" color="text.secondary">
                                {appointment.supervisorName}
                            </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.8}>
                            <CalendarMonthOutlinedIcon sx={{ fontSize: 15, color: PRIMARY }} />
                            <Typography variant="body2" fontWeight={500}>
                                {formatDateTime(appointment.dateTime)}
                            </Typography>
                        </Stack>
                    </Stack>

                    <TextField
                        label="Meeting Link (optional)"
                        placeholder="https://meet.google.com/…"
                        size="small" fullWidth
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        InputProps={{
                            startAdornment: <VideocamOutlinedIcon sx={{ fontSize: 18, color: "text.disabled", mr: 0.5 }} />,
                        }}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button onClick={handleClose} disabled={loading}
                    sx={{ borderRadius: 2, textTransform: "none", color: "text.secondary" }}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={handleConfirm} disabled={loading}
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

// ─── Scheduled Card ───────────────────────────────────────────────────────────
function ScheduledCard({ appt }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    const upcoming = isUpcoming(appt.dateTime);

    return (
        <Box sx={{
            p: 2, borderRadius: 2.5,
            border: `1px solid ${alpha(upcoming ? PRIMARY : "#7E9FC4", 0.2)}`,
            bgcolor: alpha(upcoming ? PRIMARY : "#7E9FC4", 0.03),
        }}>
            <Stack spacing={1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={0.8}>
                        <FolderOutlinedIcon sx={{ fontSize: 15, color: PRIMARY }} />
                        <Typography variant="body2" fontWeight={700} sx={{ color: t?.textPrimary }}>
                            {appt.projectName ?? `Team #${appt.teamId}`}
                        </Typography>
                    </Stack>
                    <Chip
                        label={upcoming ? "Upcoming" : "Done"}
                        size="small"
                        sx={{
                            bgcolor: alpha(upcoming ? "#6D8A7D" : "#7E9FC4", 0.12),
                            color: upcoming ? "#6D8A7D" : "#7E9FC4",
                            fontWeight: 600, fontSize: "0.68rem", height: 20,
                        }}
                    />
                </Stack>

                <Stack direction="row" alignItems="center" spacing={0.8}>
                    <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: t?.textTertiary }} />
                    <Typography variant="body2" sx={{ color: t?.textSecondary }}>
                        {formatDateTime(appt.dateTime)}
                    </Typography>
                </Stack>

                {appt.supervisorName && (
                    <Stack direction="row" alignItems="center" spacing={0.8}>
                        <PersonOutlinedIcon sx={{ fontSize: 14, color: t?.textTertiary }} />
                        <Typography variant="caption" color="text.secondary">
                            {appt.supervisorName}
                        </Typography>
                    </Stack>
                )}

                {appt.link && (
                    <Button
                        variant="outlined" size="small"
                        href={appt.link} target="_blank"
                        startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}
                        sx={{
                            borderColor: alpha(PRIMARY, 0.4), color: PRIMARY,
                            "&:hover": { borderColor: PRIMARY, bgcolor: alpha(PRIMARY, 0.05) },
                            borderRadius: 2, textTransform: "none", fontSize: "0.75rem",
                            alignSelf: "flex-start", py: 0.4,
                        }}>
                        Join Meeting
                    </Button>
                )}
            </Stack>
        </Box>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SupervisorMeetings() {
    const theme = useTheme();
    const t = theme.palette.custom;

    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [approveTarget, setApproveTarget] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);

    // Scheduled list — persisted in localStorage so it survives refresh
    const [scheduled, setScheduled] = useState(() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); }
        catch { return []; }
    });

    const persistScheduled = (list) => {
        setScheduled(list);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* ignore */ }
    };

    // ── Fetch pending ─────────────────────────────────────────────────────────
    const fetchPending = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getPendingAppointments();
            setPending(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.response?.data?.message ?? err?.response?.data ?? "Failed to load.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPending(); }, [fetchPending]);

    // ── Respond ───────────────────────────────────────────────────────────────
    const handleRespond = async (id, isApproved, link = "") => {
        setActionError("");
        // POST to backend
        await respondToAppointment({ appointmentId: id, isApproved, link });

        setPending((prev) => {
            const found = prev.find((a) => a.id === id);

            if (isApproved && found) {
                // ✅ Only add once — check by id before adding
                setScheduled((curr) => {
                    if (curr.some((s) => s.id === id)) return curr;
                    const updated = [{ ...found, status: "Approved", link }, ...curr];
                    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
                    return updated;
                });
            }

            return prev.filter((a) => a.id !== id);
        });
    };

    // ── Reject ────────────────────────────────────────────────────────────────
    const handleReject = async (appt) => {
        setRejectingId(appt.id);
        setActionError("");
        try {
            await handleRespond(appt.id, false, "");
        } catch (err) {
            setActionError(err?.response?.data?.message ?? err?.response?.data ?? "Failed to reject.");
        } finally {
            setRejectingId(null);
        }
    };

    const upcomingScheduled = scheduled.filter((s) => isUpcoming(s.dateTime));
    const pastScheduled = scheduled.filter((s) => !isUpcoming(s.dateTime));

    return (
        <Box sx={{ maxWidth: 960 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h2" sx={{ color: t?.textPrimary, mb: 0.5 }}>Meetings</Typography>
                <Typography sx={{ color: t?.textSecondary, fontSize: "0.9rem" }}>
                    {pending.length} pending · {upcomingScheduled.length} scheduled upcoming
                </Typography>
            </Box>

            {(error || actionError) && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error || actionError}</Alert>
            )}

            <Grid container spacing={2}>
                {/* ── Left column ── */}
                <Grid size={{ xs: 12, lg: 7 }}>

                    {/* Pending requests */}
                    <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper, mb: 2 }}>
                        <Typography variant="h4" sx={{ color: t?.textPrimary, mb: 2 }}>
                            Appointment Requests
                        </Typography>

                        {loading ? (
                            <Stack alignItems="center" py={4}>
                                <CircularProgress sx={{ color: PRIMARY }} />
                            </Stack>
                        ) : (
                            <Stack spacing={1.5}>
                                {pending.map((appt) => (
                                    <Box key={appt.id} sx={{
                                        p: 1.8, borderRadius: 2.5,
                                        border: `1px solid ${t?.borderLight ?? "#e0e0e0"}`,
                                        borderLeft: `3px solid ${PRIMARY}`,
                                    }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                            <Box flex={1} mr={1}>
                                                {/* Project name */}
                                                <Stack direction="row" alignItems="center" spacing={0.8}>
                                                    <FolderOutlinedIcon sx={{ fontSize: 14, color: PRIMARY }} />
                                                    <Typography sx={{ fontWeight: 700, color: t?.textPrimary }}>
                                                        {appt.projectName ?? `Team #${appt.teamId}`}
                                                    </Typography>
                                                </Stack>

                                                {/* Supervisor name (who the appointment is under) */}
                                                {appt.supervisorName && (
                                                    <Stack direction="row" alignItems="center" spacing={0.8} mt={0.4}>
                                                        <PersonOutlinedIcon sx={{ fontSize: 13, color: t?.textTertiary }} />
                                                        <Typography sx={{ fontSize: "0.75rem", color: t?.textSecondary }}>
                                                            {appt.supervisorName}
                                                        </Typography>
                                                    </Stack>
                                                )}

                                                {/* Date */}
                                                <Stack direction="row" alignItems="center" spacing={0.8} mt={0.6}>
                                                    <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: t?.textTertiary }} />
                                                    <Typography sx={{ fontSize: "0.78rem", color: t?.textTertiary }}>
                                                        {formatDateTime(appt.dateTime)}
                                                    </Typography>
                                                </Stack>
                                            </Box>

                                            <Stack direction="row" gap={0.8} flexShrink={0}>
                                                <Button size="small" variant="contained"
                                                    onClick={() => setApproveTarget(appt)}
                                                    startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 14 }} />}
                                                    sx={{
                                                        bgcolor: "#6D8A7D", "&:hover": { bgcolor: "#556e63" },
                                                        fontSize: "0.75rem", py: 0.5, px: 1.2, textTransform: "none",
                                                    }}>
                                                    Approve
                                                </Button>
                                                <Button size="small" variant="outlined"
                                                    onClick={() => handleReject(appt)}
                                                    disabled={rejectingId === appt.id}
                                                    startIcon={rejectingId === appt.id
                                                        ? <CircularProgress size={12} color="inherit" /> : null}
                                                    sx={{
                                                        borderColor: "#C47E7E", color: "#C47E7E",
                                                        "&:hover": { borderColor: "#a85f5f", color: "#a85f5f" },
                                                        fontSize: "0.75rem", py: 0.5, px: 1.2, textTransform: "none",
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

                    {/* Scheduled upcoming */}
                    {upcomingScheduled.length > 0 && (
                        <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper, mb: 2 }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <EventAvailableIcon sx={{ color: PRIMARY, fontSize: 20 }} />
                                    <Typography variant="h4" sx={{ color: t?.textPrimary }}>
                                        Scheduled Meetings
                                    </Typography>
                                </Stack>
                                <Chip label={`${upcomingScheduled.length} upcoming`} size="small"
                                    sx={{ bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY, fontWeight: 600, fontSize: "0.7rem" }} />
                            </Stack>
                            <Stack spacing={1.5}>
                                {upcomingScheduled.map((appt) => (
                                    <ScheduledCard key={appt.id} appt={appt} />
                                ))}
                            </Stack>
                        </Paper>
                    )}

                    {/* Past scheduled */}
                    {pastScheduled.length > 0 && (
                        <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                            <Typography variant="h4" sx={{ color: t?.textPrimary, mb: 2 }}>
                                Past Meetings
                            </Typography>
                            <Stack spacing={1.5}>
                                {pastScheduled.map((appt) => (
                                    <ScheduledCard key={appt.id} appt={appt} />
                                ))}
                            </Stack>
                        </Paper>
                    )}
                </Grid>

                {/* ── Right column: How It Works ── */}
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Paper elevation={1} sx={{
                        p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper,
                        position: "sticky", top: 16,
                    }}>
                        <Typography variant="h4" sx={{ color: t?.textPrimary, mb: 0.5 }}>How It Works</Typography>
                        <Typography sx={{ fontSize: "0.78rem", color: t?.textTertiary, mb: 2 }}>
                            Students request a date &amp; time — you approve or decline.
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={2}>
                            {[
                                { icon: <PersonOutlinedIcon sx={{ fontSize: 18, color: PRIMARY }} />, title: "Student Requests", desc: "A student picks a preferred date and time and sends you a request." },
                                { icon: <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "#6D8A7D" }} />, title: "You Approve", desc: "Click Approve and optionally add a Google Meet / Zoom link." },
                                { icon: <CancelOutlinedIcon sx={{ fontSize: 18, color: "#C47E7E" }} />, title: "Or Decline", desc: "Click Decline if the time doesn't work — the student is notified." },
                                { icon: <VideocamOutlinedIcon sx={{ fontSize: 18, color: "#7E9FC4" }} />, title: "Student Joins", desc: "Once approved, the student sees the meeting link and can join." },
                            ].map(({ icon, title, desc }) => (
                                <Stack key={title} direction="row" spacing={1.5} alignItems="flex-start">
                                    <Box sx={{ mt: 0.2 }}>{icon}</Box>
                                    <Box>
                                        <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: t?.textPrimary }}>{title}</Typography>
                                        <Typography sx={{ fontSize: "0.78rem", color: t?.textSecondary, mt: 0.3 }}>{desc}</Typography>
                                    </Box>
                                </Stack>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            {/* Approve dialog */}
            <ApproveDialog
                open={Boolean(approveTarget)}
                appointment={approveTarget}
                onClose={() => setApproveTarget(null)}
                onConfirm={handleRespond}
            />
        </Box>
    );
}