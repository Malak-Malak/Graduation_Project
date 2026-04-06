import { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Stack, Paper, Chip, Button,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Divider, alpha, Tab, Tabs, CircularProgress, Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import AddIcon from "@mui/icons-material/Add";
import ScheduleIcon from "@mui/icons-material/Schedule";
import WifiOutlinedIcon from "@mui/icons-material/WifiOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import studentApi from "../../../../api/handler/endpoints/studentApi";

const PRIMARY = "#d0895b";

const DAY_COLOR = {
    Sunday: "#C47E7E", Monday: "#7E9FC4", Tuesday: "#9E86C4",
    Wednesday: "#6D8A7D", Thursday: "#C49A6C", Friday: "#C47E7E", Saturday: "#7E9FC4",
};

const STATUS_CONFIG = {
    Pending: { label: "Pending", color: "#C49A6C" },
    Approved: { label: "Approved", color: "#6D8A7D" },
    Rejected: { label: "Rejected", color: "#C47E7E" },
    pending: { label: "Pending", color: "#C49A6C" },
    approved: { label: "Approved", color: "#6D8A7D" },
    rejected: { label: "Rejected", color: "#C47E7E" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatSlotTime(startTime, endTime) {
    if (!startTime) return "—";
    const fmt = (t) => {
        const [h, m] = t.split(":");
        const hour = parseInt(h, 10);
        return `${hour % 12 || 12}:${m} ${hour < 12 ? "AM" : "PM"}`;
    };
    return endTime ? `${fmt(startTime)} – ${fmt(endTime)}` : fmt(startTime);
}

function formatDateTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
        + " · "
        + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// ── Office Hour Slot Selector ─────────────────────────────────────────────────
// ✅ Each slot shows its type (Online / In-person) as set by the supervisor.
// The student cannot change the type — they only choose the time slot.
function SlotSelector({ slots, selectedId, onSelect }) {
    const theme = useTheme();
    const t = theme.palette.custom;

    if (!slots.length) return (
        <Box sx={{ textAlign: "center", py: 3, border: `2px dashed ${alpha(PRIMARY, 0.2)}`, borderRadius: 2 }}>
            <ScheduleIcon sx={{ fontSize: 32, color: alpha(PRIMARY, 0.3), mb: 0.5 }} />
            <Typography sx={{ fontSize: "0.82rem", color: t?.textTertiary }}>
                No availability slots from your supervisor yet.
            </Typography>
        </Box>
    );

    const byDay = {};
    slots.forEach((s) => {
        if (!byDay[s.dayOfWeek]) byDay[s.dayOfWeek] = [];
        byDay[s.dayOfWeek].push(s);
    });

    return (
        <Stack spacing={1.5}>
            {Object.entries(byDay).map(([day, daySlots]) => (
                <Box key={day}>
                    <Stack direction="row" alignItems="center" gap={0.8} mb={0.8}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: DAY_COLOR[day] ?? PRIMARY, flexShrink: 0 }} />
                        <Typography variant="caption" sx={{
                            fontWeight: 700, color: DAY_COLOR[day] ?? PRIMARY,
                            textTransform: "uppercase", letterSpacing: "0.07em", fontSize: "0.65rem",
                        }}>
                            {day}
                        </Typography>
                    </Stack>
                    <Stack spacing={0.7}>
                        {daySlots.map((slot) => {
                            const slotId = slot.officeHourId ?? slot.id;
                            const isSelected = selectedId === slotId;
                            // ✅ isOnline is set by supervisor — read from slot
                            const isOnline = Boolean(slot.isOnline);
                            const typeColor = isOnline ? "#7E9FC4" : "#6D8A7D";
                            const dayColor = DAY_COLOR[day] ?? PRIMARY;

                            return (
                                <Box key={slotId} onClick={() => onSelect(slotId)} sx={{
                                    px: 2, py: 1.5, borderRadius: 2, cursor: "pointer",
                                    border: `1.5px solid ${isSelected ? dayColor : alpha(dayColor, 0.2)}`,
                                    bgcolor: isSelected ? alpha(dayColor, 0.08) : "transparent",
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    transition: "all 0.15s",
                                    "&:hover": { borderColor: dayColor, bgcolor: alpha(dayColor, 0.05) },
                                }}>
                                    <Stack direction="row" alignItems="center" gap={1.5}>
                                        <AccessTimeOutlinedIcon sx={{ fontSize: 15, color: isSelected ? dayColor : t?.textTertiary }} />
                                        <Box>
                                            <Typography variant="body2" fontWeight={isSelected ? 700 : 500}
                                                sx={{ color: isSelected ? dayColor : t?.textPrimary, lineHeight: 1.3 }}>
                                                {formatSlotTime(slot.startTime, slot.endTime)}
                                            </Typography>
                                            {/* ✅ Meeting type badge — set by supervisor, shown read-only */}
                                            <Stack direction="row" alignItems="center" gap={0.5} mt={0.3}>
                                                {isOnline
                                                    ? <WifiOutlinedIcon sx={{ fontSize: 12, color: typeColor }} />
                                                    : <BusinessOutlinedIcon sx={{ fontSize: 12, color: typeColor }} />}
                                                <Typography variant="caption"
                                                    sx={{ fontSize: "0.65rem", color: typeColor, fontWeight: 600 }}>
                                                    {isOnline ? "Online Meeting" : "Office Hour (In-person)"}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    </Stack>

                                    <Stack direction="row" alignItems="center" gap={1}>
                                        {/* Type badge pill */}
                                        <Chip
                                            size="small"
                                            icon={isOnline
                                                ? <WifiOutlinedIcon sx={{ fontSize: "11px !important" }} />
                                                : <BusinessOutlinedIcon sx={{ fontSize: "11px !important" }} />}
                                            label={isOnline ? "Online" : "In-person"}
                                            sx={{
                                                height: 18, fontSize: "0.6rem", fontWeight: 600,
                                                bgcolor: alpha(typeColor, isSelected ? 0.18 : 0.1),
                                                color: typeColor,
                                                "& .MuiChip-label": { px: 0.7 },
                                            }}
                                        />
                                        {isSelected && (
                                            <CheckCircleOutlineIcon sx={{ fontSize: 16, color: dayColor }} />
                                        )}
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Stack>
                </Box>
            ))}
        </Stack>
    );
}

// ── Request Appointment Dialog ────────────────────────────────────────────────
function RequestAppointmentDialog({ open, onClose, onSuccess }) {
    const theme = useTheme();
    const t = theme.palette.custom;

    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlotId, setSelectedSlotId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;
        setLoadingSlots(true);
        setError("");
        setSelectedSlotId(null);
        studentApi.getSupervisorOfficeHours()
            .then((data) => setSlots(Array.isArray(data) ? data : []))
            .catch(() => setError("Could not load available slots."))
            .finally(() => setLoadingSlots(false));
    }, [open]);

    // ✅ isOnline comes from the slot itself — supervisor set it, student can't change it
    const selectedSlot = slots.find((s) => (s.officeHourId ?? s.id) === selectedSlotId);
    const isOnline = Boolean(selectedSlot?.isOnline);

    const handleSubmit = async () => {
        if (!selectedSlotId) { setError("Please select a time slot."); return; }
        setLoading(true);
        setError("");
        try {
            await studentApi.requestAppointment({ officeHourId: selectedSlotId, isOnline });
            onSuccess?.();
            handleClose();
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
        setSelectedSlotId(null);
        setError("");
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(PRIMARY, 0.12) }}>
                        <AddIcon sx={{ color: PRIMARY, fontSize: 22, display: "block" }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>Request Appointment</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Choose an available slot from your supervisor
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                    <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5, color: "text.primary" }}>
                            Available Time Slots
                        </Typography>
                        {/* ✅ Hint: student knows type is supervisor-defined */}
                        <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mb: 1.2 }}>
                            Meeting type (online / in-person) is set by your supervisor for each slot.
                        </Typography>
                        {loadingSlots ? (
                            <Stack alignItems="center" py={3}>
                                <CircularProgress size={24} sx={{ color: PRIMARY }} />
                            </Stack>
                        ) : (
                            <SlotSelector
                                slots={slots}
                                selectedId={selectedSlotId}
                                onSelect={setSelectedSlotId}
                            />
                        )}
                    </Box>

                    {/* Summary preview */}
                    {selectedSlot && (
                        <>
                            <Divider />
                            <Box sx={{
                                p: 1.5, borderRadius: 2,
                                bgcolor: alpha(PRIMARY, 0.06),
                                border: `1px solid ${alpha(PRIMARY, 0.15)}`,
                            }}>
                                <Typography variant="caption" sx={{
                                    fontWeight: 700, color: PRIMARY,
                                    textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.63rem",
                                }}>
                                    Summary
                                </Typography>
                                <Stack direction="row" alignItems="center" gap={1} mt={0.6}>
                                    <CalendarMonthOutlinedIcon sx={{ fontSize: 14, color: PRIMARY }} />
                                    <Typography variant="body2" fontWeight={600}>
                                        {selectedSlot.dayOfWeek} · {formatSlotTime(selectedSlot.startTime, selectedSlot.endTime)}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" gap={1} mt={0.4}>
                                    {isOnline
                                        ? <WifiOutlinedIcon sx={{ fontSize: 14, color: "#7E9FC4" }} />
                                        : <BusinessOutlinedIcon sx={{ fontSize: 14, color: "#6D8A7D" }} />}
                                    <Typography variant="body2" color="text.secondary">
                                        {isOnline ? "Online Meeting" : "Office Hour (In-person)"}
                                    </Typography>
                                </Stack>
                            </Box>
                        </>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button onClick={handleClose} disabled={loading}
                    sx={{ borderRadius: 2, textTransform: "none", color: "text.secondary" }}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!selectedSlotId || loading}
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

// ── Update Appointment Dialog ─────────────────────────────────────────────────
function UpdateAppointmentDialog({ appointment, open, onClose, onSuccess }) {
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlotId, setSelectedSlotId] = useState(null);
    const [excuse, setExcuse] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open || !appointment) return;
        setLoadingSlots(true);
        setError("");
        setExcuse("");
        setSelectedSlotId(null);
        studentApi.getSupervisorOfficeHours()
            .then((data) => setSlots(Array.isArray(data) ? data : []))
            .catch(() => setError("Could not load available slots."))
            .finally(() => setLoadingSlots(false));
    }, [open, appointment]);

    // ✅ isOnline derived from selected slot — not chosen by student
    const selectedSlot = slots.find((s) => (s.officeHourId ?? s.id) === selectedSlotId);
    const isOnline = Boolean(selectedSlot?.isOnline);

    const handleSubmit = async () => {
        if (!selectedSlotId) { setError("Please select a new time slot."); return; }
        setLoading(true);
        setError("");
        try {
            await studentApi.updateAppointment({
                appointmentId: appointment.appointmentId ?? appointment.id,
                officeHourId: selectedSlotId,
                isOnline,
                excuse,
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message ?? "Failed to update appointment.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        setError("");
        onClose();
    };

    if (!appointment) return null;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha("#7E9FC4", 0.12) }}>
                        <EditOutlinedIcon sx={{ color: "#7E9FC4", fontSize: 22, display: "block" }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>Update Appointment</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Reschedule to a different slot
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                    <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5, color: "text.primary" }}>
                            New Time Slot
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mb: 1.2 }}>
                            Meeting type is defined by your supervisor.
                        </Typography>
                        {loadingSlots ? (
                            <Stack alignItems="center" py={3}>
                                <CircularProgress size={24} sx={{ color: PRIMARY }} />
                            </Stack>
                        ) : (
                            <SlotSelector slots={slots} selectedId={selectedSlotId} onSelect={setSelectedSlotId} />
                        )}
                    </Box>

                    <Divider />

                    <TextField
                        label="Reason for change (optional)"
                        placeholder="e.g. I have a class conflict at that time…"
                        multiline minRows={2}
                        fullWidth size="small"
                        value={excuse}
                        onChange={(e) => setExcuse(e.target.value)}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button onClick={handleClose} disabled={loading}
                    sx={{ borderRadius: 2, textTransform: "none", color: "text.secondary" }}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!selectedSlotId || loading}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                    sx={{
                        bgcolor: "#7E9FC4", "&:hover": { bgcolor: "#6080a0" },
                        borderRadius: 2, textTransform: "none", fontWeight: 600, px: 3,
                    }}>
                    {loading ? "Updating…" : "Update Appointment"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ── Appointment Card ──────────────────────────────────────────────────────────
function AppointmentCard({ appt, onEdit }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    const cfg = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.Pending;
    const isPending = (appt.status ?? "").toLowerCase() === "pending";

    return (
        <Paper elevation={0} sx={{
            p: 2.5, borderRadius: 3,
            border: `1px solid ${alpha(cfg.color, isPending ? 0.3 : 0.12)}`,
            bgcolor: theme.palette.background.paper,
            transition: "all 0.2s ease",
            "&:hover": {
                borderColor: alpha(cfg.color, 0.4),
                boxShadow: `0 4px 20px ${alpha(cfg.color, 0.08)}`,
            },
        }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack spacing={1.2} flex={1}>
                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: t?.textPrimary }}>
                            Meeting Request
                        </Typography>
                        <Chip label={cfg.label} size="small" sx={{
                            bgcolor: alpha(cfg.color, 0.12), color: cfg.color,
                            fontWeight: 600, fontSize: "0.7rem", height: 22,
                        }} />
                        <Chip
                            size="small"
                            icon={appt.isOnline
                                ? <WifiOutlinedIcon sx={{ fontSize: "11px !important" }} />
                                : <BusinessOutlinedIcon sx={{ fontSize: "11px !important" }} />}
                            label={appt.isOnline ? "Online" : "In-person"}
                            sx={{
                                height: 22, fontSize: "0.68rem", fontWeight: 600,
                                bgcolor: alpha(appt.isOnline ? "#7E9FC4" : "#6D8A7D", 0.1),
                                color: appt.isOnline ? "#7E9FC4" : "#6D8A7D",
                                "& .MuiChip-label": { px: 0.7 },
                            }}
                        />
                    </Stack>

                    {appt.supervisorName && (
                        <Stack direction="row" alignItems="center" spacing={0.8}>
                            <PersonOutlinedIcon sx={{ fontSize: 14, color: t?.textTertiary }} />
                            <Typography variant="body2" color="text.secondary">
                                {appt.supervisorName}
                            </Typography>
                        </Stack>
                    )}

                    <Stack direction="row" alignItems="center" spacing={0.8}>
                        <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: PRIMARY }} />
                        <Typography variant="body2" sx={{ color: t?.textSecondary, fontWeight: 500 }}>
                            {appt.dayOfWeek
                                ? `${appt.dayOfWeek} · ${appt.startTime ? formatSlotTime(appt.startTime, appt.endTime) : ""}`
                                : formatDateTime(appt.dateTime)}
                        </Typography>
                    </Stack>

                    {appt.link && (
                        <Stack direction="row" alignItems="center" spacing={0.8}>
                            <VideocamOutlinedIcon sx={{ fontSize: 14, color: "#7E9FC4" }} />
                            <Typography
                                variant="body2" component="a" href={appt.link} target="_blank"
                                onClick={(e) => e.stopPropagation()}
                                sx={{ color: "#7E9FC4", fontWeight: 500 }}>
                                Join Meeting
                            </Typography>
                        </Stack>
                    )}
                </Stack>

                {isPending && (
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                        onClick={() => onEdit(appt)}
                        sx={{
                            borderColor: alpha("#7E9FC4", 0.4), color: "#7E9FC4",
                            "&:hover": { borderColor: "#7E9FC4", bgcolor: alpha("#7E9FC4", 0.05) },
                            borderRadius: 2, textTransform: "none", fontSize: "0.75rem",
                            ml: 1, flexShrink: 0,
                        }}
                    >
                        Edit
                    </Button>
                )}
            </Stack>
        </Paper>
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
    const [requestOpen, setRequestOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await studentApi.getMyAppointments();
            setAppointments(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.response?.data?.message ?? "Failed to load appointments.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

    const upcoming = appointments.filter(
        (a) => ["pending", "approved"].includes((a.status ?? "").toLowerCase())
    );
    const rejected = appointments.filter(
        (a) => (a.status ?? "").toLowerCase() === "rejected"
    );

    const nextAppt = appointments.find(
        (a) => (a.status ?? "").toLowerCase() === "approved"
    );

    return (
        <Box sx={{ width: "100%" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h2" sx={{ color: t?.textPrimary, mb: 0.5 }}>Meetings</Typography>
                    <Typography sx={{ color: t?.textSecondary, fontSize: "0.9rem" }}>
                        {upcoming.length} upcoming · {rejected.length} rejected
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

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            {nextAppt && (
                <Paper elevation={0} sx={{
                    p: 2.5, mb: 3, borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(PRIMARY, 0.12)} 0%, ${alpha(PRIMARY, 0.05)} 100%)`,
                    border: `1px solid ${alpha(PRIMARY, 0.25)}`,
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
                                    {nextAppt.dayOfWeek
                                        ? `${nextAppt.dayOfWeek} · ${formatSlotTime(nextAppt.startTime, nextAppt.endTime)}`
                                        : formatDateTime(nextAppt.dateTime)}
                                    {" · "}
                                    {nextAppt.isOnline ? "🌐 Online" : "🏢 In-person"}
                                </Typography>
                            </Box>
                        </Stack>
                        {nextAppt.link && (
                            <Button
                                variant="contained" size="small"
                                href={nextAppt.link} target="_blank"
                                startIcon={<VideocamOutlinedIcon />}
                                sx={{
                                    bgcolor: PRIMARY, "&:hover": { bgcolor: "#b06f47" },
                                    borderRadius: 2, textTransform: "none", fontWeight: 600,
                                }}>
                                Join
                            </Button>
                        )}
                    </Stack>
                </Paper>
            )}

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
                mb: 2.5,
                "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.9rem" },
                "& .Mui-selected": { color: PRIMARY },
                "& .MuiTabs-indicator": { bgcolor: PRIMARY },
            }}>
                <Tab label={`Upcoming (${upcoming.length})`} />
                <Tab label={`Rejected (${rejected.length})`} />
            </Tabs>

            {loading && (
                <Stack alignItems="center" py={6}>
                    <CircularProgress sx={{ color: PRIMARY }} />
                </Stack>
            )}

            {!loading && (
                <Stack spacing={2}>
                    {(tab === 0 ? upcoming : rejected).map((a) => (
                        <AppointmentCard
                            key={a.appointmentId ?? a.id}
                            appt={a}
                            onEdit={setEditTarget}
                        />
                    ))}
                    {(tab === 0 ? upcoming : rejected).length === 0 && (
                        <Box sx={{ textAlign: "center", py: 6 }}>
                            <ScheduleIcon sx={{ fontSize: 40, color: alpha(PRIMARY, 0.25), mb: 1 }} />
                            <Typography sx={{ color: t?.textTertiary }}>
                                No appointments found.
                            </Typography>
                        </Box>
                    )}
                </Stack>
            )}

            <RequestAppointmentDialog
                open={requestOpen}
                onClose={() => setRequestOpen(false)}
                onSuccess={fetchAppointments}
            />
            <UpdateAppointmentDialog
                open={Boolean(editTarget)}
                appointment={editTarget}
                onClose={() => setEditTarget(null)}
                onSuccess={fetchAppointments}
            />
        </Box>
    );
}