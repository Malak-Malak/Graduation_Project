import { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Stack, Paper, Chip, Button,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Divider, alpha, Tab, Tabs, CircularProgress, Alert,
    Pagination,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import AddIcon from "@mui/icons-material/Add";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SignalWifi4BarRoundedIcon from "@mui/icons-material/SignalWifi4BarRounded";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import studentApi from "../../../../api/handler/endpoints/studentApi";

const PRIMARY = "#d0895b";
const ITEMS_PER_PAGE = 5;

// ── Date helpers ──────────────────────────────────────────────────────────────
function isPast(isoString) {
    if (!isoString) return false;
    return new Date(isoString) < new Date();
}

function hoursUntil(isoString) {
    if (!isoString) return Infinity;
    return (new Date(isoString) - new Date()) / 3_600_000;
}

function formatFromISO(isoString) {
    if (!isoString) return { short: "—", time: "—", full: "—" };
    const d = new Date(isoString);
    const short = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return { short, time, full: `${short} · ${time}` };
}

// ── Config ────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    pending: { label: "Pending", color: "#C49A6C" },
    approved: { label: "Approved", color: "#6D8A7D" },
    rejected: { label: "Rejected", color: "#C47E7E" },
    passed: { label: "Passed", color: "#9E86C4" },
};

const DAY_COLOR = {
    Sunday: "#C47E7E", Monday: "#7E9FC4", Tuesday: "#9E86C4",
    Wednesday: "#6D8A7D", Thursday: "#C49A6C", Friday: "#C47E7E", Saturday: "#7E9FC4",
};

// ── Online Badge ──────────────────────────────────────────────────────────────
function OnlineBadge({ isOnline, size = "medium" }) {
    const small = size === "small";
    const color = isOnline ? "#7E9FC4" : "#6D8A7D";
    return (
        <Stack direction="row" alignItems="center" gap={small ? 0.4 : 0.6}>
            {isOnline
                ? <SignalWifi4BarRoundedIcon sx={{ fontSize: small ? 12 : 14, color }} />
                : <BusinessOutlinedIcon sx={{ fontSize: small ? 12 : 14, color }} />}
            <Typography variant="caption" sx={{ fontSize: small ? "0.65rem" : "0.72rem", fontWeight: 600, color, lineHeight: 1 }}>
                {isOnline ? "Online" : "In-person"}
            </Typography>
        </Stack>
    );
}

// ── Slot Selector ─────────────────────────────────────────────────────────────
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

    const fmtTime = (ts) => {
        if (!ts) return "";
        const [h, m] = ts.split(":");
        const hour = parseInt(h, 10);
        return `${hour % 12 || 12}:${m} ${hour < 12 ? "AM" : "PM"}`;
    };

    return (
        <Stack spacing={1.5}>
            {Object.entries(byDay).map(([day, daySlots]) => (
                <Box key={day}>
                    <Stack direction="row" alignItems="center" gap={0.8} mb={0.8}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: DAY_COLOR[day] ?? PRIMARY, flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: DAY_COLOR[day] ?? PRIMARY, textTransform: "uppercase", letterSpacing: "0.07em", fontSize: "0.65rem" }}>
                            {day}
                        </Typography>
                    </Stack>
                    <Stack spacing={0.7}>
                        {daySlots.map((slot) => {
                            const slotId = slot.officeHourId ?? slot.id;
                            const isSelected = selectedId === slotId;
                            const isOnline = Boolean(slot.isOnline);
                            const typeColor = isOnline ? "#7E9FC4" : "#6D8A7D";
                            const dayColor = DAY_COLOR[day] ?? PRIMARY;
                            const timeLabel = slot.endTime
                                ? `${fmtTime(slot.startTime)} – ${fmtTime(slot.endTime)}`
                                : fmtTime(slot.startTime);

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
                                                {timeLabel}
                                            </Typography>
                                            <Box mt={0.3}><OnlineBadge isOnline={isOnline} size="small" /></Box>
                                        </Box>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" gap={1}>
                                        <Chip size="small" label={isOnline ? "Online" : "In-person"} sx={{
                                            height: 18, fontSize: "0.6rem", fontWeight: 600,
                                            bgcolor: alpha(typeColor, isSelected ? 0.18 : 0.1), color: typeColor,
                                            "& .MuiChip-label": { px: 0.7 },
                                        }} />
                                        {isSelected && <CheckCircleOutlineIcon sx={{ fontSize: 16, color: dayColor }} />}
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

    const selectedSlot = slots.find((s) => (s.officeHourId ?? s.id) === selectedSlotId);
    const isOnline = Boolean(selectedSlot?.isOnline);

    const fmtTime = (ts) => {
        if (!ts) return "";
        const [h, m] = ts.split(":");
        const hour = parseInt(h, 10);
        return `${hour % 12 || 12}:${m} ${hour < 12 ? "AM" : "PM"}`;
    };

    const handleSubmit = async () => {
        if (!selectedSlotId) { setError("Please select a time slot."); return; }
        setLoading(true);
        setError("");
        try {
            // isOnline is NOT sent — backend determines it from the office hour slot
            await studentApi.requestAppointment({ officeHourId: selectedSlotId });
            onSuccess?.();
            handleClose();
        } catch (err) {
            setError(err?.response?.data?.message ?? err?.response?.data ?? "Failed to send request.");
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
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(PRIMARY, 0.12) }}>
                        <AddIcon sx={{ color: PRIMARY, fontSize: 22, display: "block" }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>Request Appointment</Typography>
                        <Typography variant="caption" color="text.secondary">Choose an available slot from your supervisor</Typography>
                    </Box>
                </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
                    <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>Available Time Slots</Typography>
                        <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mb: 1.2 }}>
                            Meeting type is set by your supervisor for each slot.
                        </Typography>
                        {loadingSlots
                            ? <Stack alignItems="center" py={3}><CircularProgress size={24} sx={{ color: PRIMARY }} /></Stack>
                            : <SlotSelector slots={slots} selectedId={selectedSlotId} onSelect={setSelectedSlotId} />}
                    </Box>
                    {selectedSlot && (
                        <>
                            <Divider />
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(PRIMARY, 0.06), border: `1px solid ${alpha(PRIMARY, 0.15)}` }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: PRIMARY, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.63rem" }}>
                                    Summary
                                </Typography>
                                <Stack direction="row" alignItems="center" gap={1} mt={0.6}>
                                    <CalendarMonthOutlinedIcon sx={{ fontSize: 14, color: PRIMARY }} />
                                    <Typography variant="body2" fontWeight={600}>
                                        {selectedSlot.dayOfWeek} · {fmtTime(selectedSlot.startTime)}
                                        {selectedSlot.endTime ? ` – ${fmtTime(selectedSlot.endTime)}` : ""}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" gap={1} mt={0.4}>
                                    <OnlineBadge isOnline={isOnline} />
                                </Stack>
                            </Box>
                        </>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button onClick={handleClose} disabled={loading} sx={{ borderRadius: 2, textTransform: "none", color: "text.secondary" }}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={!selectedSlotId || loading}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                    sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#b06f47" }, borderRadius: 2, textTransform: "none", fontWeight: 600, px: 3 }}>
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

    const handleSubmit = async () => {
        if (!selectedSlotId) { setError("Please select a new time slot."); return; }
        setLoading(true);
        setError("");
        try {
            // isOnline is NOT sent — backend determines it from the new office hour slot
            await studentApi.updateAppointment({
                appointmentId: appointment.appointmentId ?? appointment.id,
                officeHourId: selectedSlotId,
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
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha("#7E9FC4", 0.12) }}>
                        <EditOutlinedIcon sx={{ color: "#7E9FC4", fontSize: 22, display: "block" }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>Update Appointment</Typography>
                        <Typography variant="caption" color="text.secondary">Reschedule to a different slot</Typography>
                    </Box>
                </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
                    <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>New Time Slot</Typography>
                        <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mb: 1.2 }}>
                            Meeting type is defined by your supervisor.
                        </Typography>
                        {loadingSlots
                            ? <Stack alignItems="center" py={3}><CircularProgress size={24} sx={{ color: PRIMARY }} /></Stack>
                            : <SlotSelector slots={slots} selectedId={selectedSlotId} onSelect={setSelectedSlotId} />}
                    </Box>
                    <Divider />
                    <TextField
                        label="Reason for change (optional)"
                        placeholder="e.g. I have a class conflict at that time…"
                        multiline minRows={2} fullWidth size="small"
                        value={excuse} onChange={(e) => setExcuse(e.target.value)}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button onClick={handleClose} disabled={loading} sx={{ borderRadius: 2, textTransform: "none", color: "text.secondary" }}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={!selectedSlotId || loading}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                    sx={{ bgcolor: "#7E9FC4", "&:hover": { bgcolor: "#6080a0" }, borderRadius: 2, textTransform: "none", fontWeight: 600, px: 3 }}>
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
    const statusKey = (appt.status ?? "").toLowerCase();

    const isPassed = statusKey === "passed" || (statusKey === "approved" && isPast(appt.dateTime));
    const isPending = statusKey === "pending";

    const displayStatus = isPassed ? "passed" : statusKey;
    const cfg = STATUS_CONFIG[displayStatus] ?? STATUS_CONFIG.pending;
    const { full: dateLabel } = formatFromISO(appt.dateTime);

    return (
        <Paper elevation={0} sx={{
            p: 2.5, borderRadius: 3,
            border: `1px solid ${alpha(cfg.color, isPending ? 0.3 : 0.12)}`,
            bgcolor: isPassed ? alpha(cfg.color, 0.03) : theme.palette.background.paper,
            opacity: isPassed ? 0.72 : 1,
            transition: "all 0.2s ease",
            "&:hover": { borderColor: alpha(cfg.color, 0.4), boxShadow: `0 4px 20px ${alpha(cfg.color, 0.08)}`, opacity: 1 },
        }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack spacing={1.2} flex={1}>
                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: t?.textPrimary }}>
                            {appt.projectName ?? "Meeting Request"}
                        </Typography>
                        <Chip
                            label={cfg.label} size="small"
                            icon={isPassed ? <EventBusyOutlinedIcon sx={{ fontSize: "12px !important" }} /> : undefined}
                            sx={{
                                bgcolor: alpha(cfg.color, 0.12), color: cfg.color,
                                fontWeight: 600, fontSize: "0.7rem", height: 22,
                                "& .MuiChip-label": { pl: isPassed ? 0.5 : 1 },
                            }}
                        />
                        <Chip size="small"
                            label={<OnlineBadge isOnline={appt.isOnline} size="small" />}
                            sx={{
                                height: 22,
                                bgcolor: alpha(appt.isOnline ? "#7E9FC4" : "#6D8A7D", 0.1),
                                "& .MuiChip-label": { px: 0.8, display: "flex", alignItems: "center" },
                            }}
                        />
                    </Stack>

                    {appt.supervisorName && (
                        <Stack direction="row" alignItems="center" spacing={0.8}>
                            <PersonOutlinedIcon sx={{ fontSize: 14, color: t?.textTertiary }} />
                            <Typography variant="body2" color="text.secondary">{appt.supervisorName}</Typography>
                        </Stack>
                    )}

                    <Stack direction="row" alignItems="center" spacing={0.8}>
                        <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: isPassed ? t?.textTertiary : PRIMARY }} />
                        <Typography variant="body2" sx={{ color: t?.textSecondary, fontWeight: 500 }}>
                            {dateLabel}
                        </Typography>
                    </Stack>

                    {appt.excuse && (
                        <Typography variant="caption" sx={{ color: "#C49A6C", fontStyle: "italic" }}>
                            💬 {appt.excuse}
                        </Typography>
                    )}

                    {appt.link && !isPassed && (
                        <Stack direction="row" alignItems="center" spacing={0.8}>
                            <VideocamOutlinedIcon sx={{ fontSize: 14, color: "#7E9FC4" }} />
                            <Typography variant="body2" component="a" href={appt.link} target="_blank"
                                onClick={(e) => e.stopPropagation()}
                                sx={{ color: "#7E9FC4", fontWeight: 500 }}>
                                Join Meeting
                            </Typography>
                        </Stack>
                    )}
                </Stack>

                {isPending && (
                    <Button size="small" variant="outlined"
                        startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                        onClick={() => onEdit(appt)}
                        sx={{
                            borderColor: alpha("#7E9FC4", 0.4), color: "#7E9FC4",
                            "&:hover": { borderColor: "#7E9FC4", bgcolor: alpha("#7E9FC4", 0.05) },
                            borderRadius: 2, textTransform: "none", fontSize: "0.75rem", ml: 1, flexShrink: 0,
                        }}>
                        Edit
                    </Button>
                )}
            </Stack>
        </Paper>
    );
}

// ── Paginated List ────────────────────────────────────────────────────────────
function PaginatedList({ items, onEdit }) {
    const [page, setPage] = useState(1);
    const pageCount = Math.ceil(items.length / ITEMS_PER_PAGE);
    const visible = items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    useEffect(() => { setPage(1); }, [items.length]);

    if (!items.length) return (
        <Box sx={{ textAlign: "center", py: 6 }}>
            <ScheduleIcon sx={{ fontSize: 40, color: alpha(PRIMARY, 0.25), mb: 1 }} />
            <Typography sx={{ color: "text.disabled" }}>No appointments found.</Typography>
        </Box>
    );

    return (
        <Stack spacing={2}>
            {visible.map((a) => <AppointmentCard key={a.id} appt={a} onEdit={onEdit} />)}
            {pageCount > 1 && (
                <Stack alignItems="center" pt={1} spacing={0.5}>
                    <Pagination
                        count={pageCount} page={page}
                        onChange={(_, v) => setPage(v)} size="small"
                        sx={{
                            "& .MuiPaginationItem-root": { borderRadius: 2, fontWeight: 500 },
                            "& .Mui-selected": { bgcolor: `${alpha(PRIMARY, 0.15)} !important`, color: PRIMARY, fontWeight: 700 },
                            "& .MuiPaginationItem-root:hover": { bgcolor: alpha(PRIMARY, 0.08) },
                        }}
                    />
                    <Typography variant="caption" color="text.disabled">
                        Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, items.length)} of {items.length}
                    </Typography>
                </Stack>
            )}
        </Stack>
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

    // ── Categorise using dateTime ISO ─────────────────────────────────────────
    const upcoming = appointments.filter((a) => {
        const s = (a.status ?? "").toLowerCase();
        if (s === "pending") return true;
        if (s === "approved" && !isPast(a.dateTime)) return true;
        return false;
    });

    const passed = appointments.filter((a) => {
        const s = (a.status ?? "").toLowerCase();
        return s === "passed" || (s === "approved" && isPast(a.dateTime));
    });

    const rejected = appointments.filter((a) =>
        (a.status ?? "").toLowerCase() === "rejected"
    );

    // Next = soonest future approved
    const nextAppt = [...upcoming]
        .filter((a) => (a.status ?? "").toLowerCase() === "approved")
        .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))[0];

    // ── Reminder banner: approved & within 2 hours ────────────────────────────
    const reminderAppt = upcoming.find((a) => {
        const h = hoursUntil(a.dateTime);
        return (a.status ?? "").toLowerCase() === "approved" && h > 0 && h <= 2;
    });

    const tabLists = [upcoming, passed, rejected];
    const TAB_LABELS = [
        `Upcoming (${upcoming.length})`,
        `Passed (${passed.length})`,
        `Rejected (${rejected.length})`,
    ];

    return (
        <Box sx={{ width: "100%" }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h2" sx={{ color: t?.textPrimary, mb: 0.5 }}>Meetings</Typography>
                    <Typography sx={{ color: t?.textSecondary, fontSize: "0.9rem" }}>
                        {upcoming.length} upcoming · {passed.length} passed · {rejected.length} rejected
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setRequestOpen(true)}
                    sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#b06f47" }, borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
                    Request Meeting
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            {/* 2-hour reminder banner */}
            {reminderAppt && (
                <Paper elevation={0} sx={{
                    p: 2, mb: 2.5, borderRadius: 3,
                    bgcolor: alpha("#9E86C4", 0.07),
                    border: `1px solid ${alpha("#9E86C4", 0.3)}`,
                }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha("#9E86C4", 0.15), flexShrink: 0 }}>
                            <NotificationsActiveOutlinedIcon sx={{ color: "#9E86C4", fontSize: 20, display: "block" }} />
                        </Box>
                        <Box flex={1} minWidth={0}>
                            <Typography variant="body2" fontWeight={700} sx={{ color: "#9E86C4" }}>
                                Reminder — meeting in {Math.round(hoursUntil(reminderAppt.dateTime) * 60)} min
                            </Typography>
                            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                                <Typography variant="caption" color="text.secondary">
                                    {formatFromISO(reminderAppt.dateTime).full}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">·</Typography>
                                <OnlineBadge isOnline={reminderAppt.isOnline} size="small" />
                            </Stack>
                        </Box>
                        {reminderAppt.link && (
                            <Button size="small" variant="outlined"
                                href={reminderAppt.link} target="_blank"
                                startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}
                                sx={{ borderColor: alpha("#9E86C4", 0.5), color: "#9E86C4", borderRadius: 2, textTransform: "none", fontSize: "0.75rem", flexShrink: 0 }}>
                                Join
                            </Button>
                        )}
                    </Stack>
                </Paper>
            )}

            {/* Next appointment banner */}
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
                                <Typography variant="caption" sx={{ color: PRIMARY, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                                    Next Appointment
                                </Typography>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ color: t?.textPrimary }}>
                                    {nextAppt.supervisorName ?? "Supervisor"}
                                </Typography>
                                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                                    <Typography variant="body2" color="text.secondary">
                                        {formatFromISO(nextAppt.dateTime).full}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">·</Typography>
                                    <OnlineBadge isOnline={nextAppt.isOnline} />
                                </Stack>
                            </Box>
                        </Stack>
                        {nextAppt.link && (
                            <Button variant="contained" size="small" href={nextAppt.link} target="_blank"
                                startIcon={<VideocamOutlinedIcon />}
                                sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#b06f47" }, borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
                                Join
                            </Button>
                        )}
                    </Stack>
                </Paper>
            )}

            {/* Tabs */}
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
                mb: 2.5,
                "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.9rem" },
                "& .Mui-selected": { color: PRIMARY },
                "& .MuiTabs-indicator": { bgcolor: PRIMARY },
            }}>
                {TAB_LABELS.map((label) => <Tab key={label} label={label} />)}
            </Tabs>

            {loading
                ? <Stack alignItems="center" py={6}><CircularProgress sx={{ color: PRIMARY }} /></Stack>
                : <PaginatedList items={tabLists[tab]} onEdit={setEditTarget} />}

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