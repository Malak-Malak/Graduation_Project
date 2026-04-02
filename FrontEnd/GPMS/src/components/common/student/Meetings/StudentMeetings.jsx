import { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Stack, Paper, Chip, Avatar, Button, IconButton,
    Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Divider, alpha, Tab, Tabs, CircularProgress, Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import AddIcon from "@mui/icons-material/Add";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import studentApi from "../../../../api/handler/endpoints/studentApi";

const PRIMARY = "#d0895b";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    Pending: { label: "Pending", color: "#C49A6C" },
    Approved: { label: "Approved", color: "#6D8A7D" },
    Rejected: { label: "Rejected", color: "#C47E7E" },
    // lowercase fallbacks in case backend sends lowercase
    pending: { label: "Pending", color: "#C49A6C" },
    approved: { label: "Approved", color: "#6D8A7D" },
    rejected: { label: "Rejected", color: "#C47E7E" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
/**
 * Format an ISO date string into a readable label.
 * e.g.  "2026-04-10T10:00:00.000Z"  →  "Fri, 10 Apr · 10:00 AM"
 */
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

/**
 * Build a local ISO string suitable for <input type="datetime-local">
 * from the user's selected value so we can POST to the API.
 */
function toApiIso(localDateTimeString) {
    if (!localDateTimeString) return "";
    return new Date(localDateTimeString).toISOString();
}

// ── Appointment Card ──────────────────────────────────────────────────────────
function AppointmentCard({ appt, onClick }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    const cfg = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.Pending;
    const isPast = appt.status === "Approved" || appt.status === "Rejected"
        || appt.status === "approved" || appt.status === "rejected";

    return (
        <Paper
            onClick={() => onClick(appt)}
            elevation={0}
            sx={{
                p: 2.5, borderRadius: 3, cursor: "pointer",
                border: `1px solid ${alpha(PRIMARY, isPast ? 0.08 : 0.18)}`,
                bgcolor: theme.palette.background.paper,
                opacity: isPast ? 0.82 : 1,
                transition: "all 0.2s ease",
                "&:hover": {
                    borderColor: alpha(PRIMARY, 0.4),
                    boxShadow: `0 4px 20px ${alpha(PRIMARY, 0.1)}`,
                    transform: "translateY(-1px)",
                },
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack spacing={1.5} flex={1}>
                    {/* Status chip */}
                    <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: t?.textPrimary }}>
                            Meeting Request
                        </Typography>
                        <Chip
                            label={cfg.label} size="small"
                            sx={{
                                bgcolor: alpha(cfg.color, 0.12), color: cfg.color,
                                fontWeight: 600, fontSize: "0.7rem", height: 22,
                            }}
                        />
                    </Stack>

                    {/* Supervisor */}
                    {appt.supervisorName && (
                        <Stack direction="row" alignItems="center" spacing={0.8}>
                            <PersonOutlinedIcon sx={{ fontSize: 15, color: t?.textTertiary }} />
                            <Typography variant="body2" color="text.secondary">
                                {appt.supervisorName}
                            </Typography>
                        </Stack>
                    )}

                    {/* Date / Time */}
                    <Stack direction="row" alignItems="center" spacing={0.6}>
                        <CalendarMonthOutlinedIcon sx={{ fontSize: 15, color: PRIMARY }} />
                        <Typography variant="body2" sx={{ color: t?.textSecondary, fontWeight: 500 }}>
                            {formatDateTime(appt.dateTime)}
                        </Typography>
                    </Stack>

                    {/* Link (if approved) */}
                    {appt.link && (
                        <Stack direction="row" alignItems="center" spacing={0.6}>
                            <VideocamOutlinedIcon sx={{ fontSize: 15, color: "#7E9FC4" }} />
                            <Typography
                                variant="body2"
                                component="a"
                                href={appt.link}
                                target="_blank"
                                onClick={(e) => e.stopPropagation()}
                                sx={{ color: "#7E9FC4", fontWeight: 500, wordBreak: "break-all" }}
                            >
                                Join Link
                            </Typography>
                        </Stack>
                    )}
                </Stack>

                <ArrowForwardIosIcon sx={{ fontSize: 14, color: t?.textTertiary, mt: 0.5, ml: 1 }} />
            </Stack>
        </Paper>
    );
}

// ── Detail Dialog ─────────────────────────────────────────────────────────────
function AppointmentDetailDialog({ appt, onClose }) {
    if (!appt) return null;
    const cfg = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.Pending;
    const isApproved = appt.status === "Approved" || appt.status === "approved";

    return (
        <Dialog open={Boolean(appt)} onClose={onClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(PRIMARY, 0.12) }}>
                        <CalendarMonthOutlinedIcon sx={{ color: PRIMARY, fontSize: 22, display: "block" }} />
                    </Box>
                    <Box flex={1}>
                        <Typography variant="h6" fontWeight={700}>Appointment Details</Typography>
                        <Chip
                            label={cfg.label} size="small"
                            sx={{
                                bgcolor: alpha(cfg.color, 0.12), color: cfg.color,
                                fontWeight: 600, fontSize: "0.68rem", height: 20, mt: 0.3,
                            }}
                        />
                    </Box>
                </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    {appt.supervisorName && (
                        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                            <Box sx={{ color: PRIMARY, "& svg": { fontSize: 19 }, mt: 0.2 }}>
                                <PersonOutlinedIcon />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary"
                                    sx={{ textTransform: "uppercase", fontSize: "0.67rem", letterSpacing: "0.05em" }}>
                                    Supervisor
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>{appt.supervisorName}</Typography>
                            </Box>
                        </Stack>
                    )}

                    <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                        <Box sx={{ color: PRIMARY, "& svg": { fontSize: 19 }, mt: 0.2 }}>
                            <CalendarMonthOutlinedIcon />
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary"
                                sx={{ textTransform: "uppercase", fontSize: "0.67rem", letterSpacing: "0.05em" }}>
                                Date &amp; Time
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                                {formatDateTime(appt.dateTime)}
                            </Typography>
                        </Box>
                    </Stack>

                    {appt.link && (
                        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                            <Box sx={{ color: PRIMARY, "& svg": { fontSize: 19 }, mt: 0.2 }}>
                                <VideocamOutlinedIcon />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary"
                                    sx={{ textTransform: "uppercase", fontSize: "0.67rem", letterSpacing: "0.05em" }}>
                                    Meeting Link
                                </Typography>
                                <Typography
                                    variant="body2" component="a" href={appt.link} target="_blank"
                                    sx={{ display: "block", color: PRIMARY, fontWeight: 500, wordBreak: "break-all" }}>
                                    {appt.link}
                                </Typography>
                            </Box>
                        </Stack>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button onClick={onClose} sx={{ borderRadius: 2, textTransform: "none" }}>Close</Button>
                {isApproved && appt.link && (
                    <Button
                        variant="contained" href={appt.link} target="_blank"
                        startIcon={<VideocamOutlinedIcon />}
                        sx={{
                            bgcolor: PRIMARY, "&:hover": { bgcolor: "#b06f47" },
                            borderRadius: 2, textTransform: "none", fontWeight: 600,
                        }}>
                        Join Meeting
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

// ── Request Appointment Dialog ────────────────────────────────────────────────
function RequestAppointmentDialog({ open, onClose, onSuccess }) {
    // datetime-local input value  (local time, e.g. "2026-04-10T10:00")
    const [dateTime, setDateTime] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Minimum selectable date = now (browser local)
    const minDateTime = new Date(Date.now() + 60_000)
        .toISOString()
        .slice(0, 16);   // "YYYY-MM-DDTHH:MM"

    const handleSubmit = async () => {
        if (!dateTime) return;
        setLoading(true);
        setError("");
        try {
            // Convert local datetime-local value to full ISO string for the API
            await studentApi.requestAppointment(toApiIso(dateTime));
            setDateTime("");
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(
                err?.response?.data?.message
                ?? err?.response?.data
                ?? "Failed to send request. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        setDateTime("");
        setError("");
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(PRIMARY, 0.12) }}>
                        <AddIcon sx={{ color: PRIMARY, fontSize: 22, display: "block" }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>Request Appointment</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Pick a date &amp; time to meet your supervisor
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                    <TextField
                        label="Date &amp; Time"
                        type="datetime-local"
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: minDateTime }}
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button
                    onClick={handleClose}
                    disabled={loading}
                    sx={{ borderRadius: 2, textTransform: "none", color: "text.secondary" }}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!dateTime || loading}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                    sx={{
                        bgcolor: PRIMARY, "&:hover": { bgcolor: "#b06f47" },
                        borderRadius: 2, textTransform: "none", fontWeight: 600, px: 3,
                    }}>
                    {loading ? "Sending…" : "Send Request"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentMeetings() {
    const theme = useTheme();
    const t = theme.palette.custom;

    const [tab, setTab] = useState(0);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [requestOpen, setRequestOpen] = useState(false);

    // ── Fetch appointments ────────────────────────────────────────────────────
    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await studentApi.getMyAppointments();
            setAppointments(Array.isArray(data) ? data : []);
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

    useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

    // ── Derived lists ─────────────────────────────────────────────────────────
    const upcoming = appointments.filter(
        (a) => a.status === "Pending" || a.status === "pending"
            || a.status === "Approved" || a.status === "approved"
    );
    const past = appointments.filter(
        (a) => a.status === "Rejected" || a.status === "rejected"
    );

    // Next confirmed (approved) upcoming appointment
    const nextAppt = appointments.find(
        (a) => (a.status === "Approved" || a.status === "approved") && new Date(a.dateTime) > new Date()
    );

    return (
        <Box sx={{ maxWidth: 1000 }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h2" sx={{ color: t?.textPrimary, mb: 0.5 }}>Meetings</Typography>
                    <Typography sx={{ color: t?.textSecondary, fontSize: "0.9rem" }}>
                        {upcoming.length} upcoming · {past.length} rejected
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setRequestOpen(true)}
                    sx={{
                        bgcolor: PRIMARY, "&:hover": { bgcolor: "#b06f47" },
                        borderRadius: 2, textTransform: "none", fontWeight: 600,
                    }}>
                    Request Meeting
                </Button>
            </Stack>

            {/* Error banner */}
            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
            )}

            {/* Next confirmed appointment banner */}
            {nextAppt && (
                <Paper
                    onClick={() => setSelectedAppt(nextAppt)}
                    elevation={0}
                    sx={{
                        p: 2.5, mb: 3, borderRadius: 3, cursor: "pointer",
                        background: `linear-gradient(135deg, ${alpha(PRIMARY, 0.12)} 0%, ${alpha(PRIMARY, 0.05)} 100%)`,
                        border: `1px solid ${alpha(PRIMARY, 0.25)}`,
                        "&:hover": { borderColor: alpha(PRIMARY, 0.5) },
                        transition: "border-color 0.2s",
                    }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(PRIMARY, 0.15) }}>
                                <ScheduleIcon sx={{ color: PRIMARY, fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography variant="caption"
                                    sx={{ color: PRIMARY, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                                    Next Appointment
                                </Typography>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ color: t?.textPrimary }}>
                                    {nextAppt.supervisorName ?? "Supervisor"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {formatDateTime(nextAppt.dateTime)}
                                </Typography>
                            </Box>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            {nextAppt.link && (
                                <Button
                                    variant="contained" size="small"
                                    href={nextAppt.link} target="_blank"
                                    startIcon={<VideocamOutlinedIcon />}
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{
                                        bgcolor: PRIMARY, "&:hover": { bgcolor: "#b06f47" },
                                        borderRadius: 2, textTransform: "none", fontWeight: 600, fontSize: "0.8rem",
                                    }}>
                                    Join
                                </Button>
                            )}
                            <ArrowForwardIosIcon sx={{ fontSize: 14, color: t?.textTertiary }} />
                        </Stack>
                    </Stack>
                </Paper>
            )}

            {/* Tabs */}
            <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{
                    mb: 2.5,
                    "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.9rem" },
                    "& .Mui-selected": { color: PRIMARY },
                    "& .MuiTabs-indicator": { bgcolor: PRIMARY },
                }}>
                <Tab label={`Upcoming (${upcoming.length})`} />
                <Tab label={`Rejected (${past.length})`} />
            </Tabs>

            {/* Loading */}
            {loading && (
                <Stack alignItems="center" py={6}>
                    <CircularProgress sx={{ color: PRIMARY }} />
                </Stack>
            )}

            {/* Appointment list */}
            {!loading && (
                <Stack spacing={2}>
                    {(tab === 0 ? upcoming : past).map((a) => (
                        <AppointmentCard key={a.appointmentId ?? a.id} appt={a} onClick={setSelectedAppt} />
                    ))}
                    {(tab === 0 ? upcoming : past).length === 0 && (
                        <Typography sx={{ textAlign: "center", color: t?.textTertiary, py: 4 }}>
                            No appointments found.
                        </Typography>
                    )}
                </Stack>
            )}

            {/* Detail dialog */}
            <AppointmentDetailDialog
                appt={selectedAppt}
                onClose={() => setSelectedAppt(null)}
            />

            {/* Request dialog */}
            <RequestAppointmentDialog
                open={requestOpen}
                onClose={() => setRequestOpen(false)}
                onSuccess={fetchAppointments}   // re-fetch after successful request
            />
        </Box>
    );
}