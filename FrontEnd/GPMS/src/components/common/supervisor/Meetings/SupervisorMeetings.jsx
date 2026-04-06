import { useState, useEffect, useCallback } from "react";
import {
    Box, Paper, Typography, Stack, Chip, Button, Grid, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    CircularProgress, Alert, alpha, IconButton, Tooltip, Select,
    MenuItem, FormControl, InputLabel, ToggleButton, ToggleButtonGroup,
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
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WifiOutlinedIcon from "@mui/icons-material/WifiOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import {
    getPendingAppointments,
    respondToAppointment,
    getOfficeHours,
    createOfficeHour,
    deleteOfficeHour,
    getAllAppointments,
} from "../../../../api/handler/endpoints/supervisorApi";

const PRIMARY = "#d0895b";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DAY_SHORT = {
    Sunday: "Sun", Monday: "Mon", Tuesday: "Tue",
    Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat",
};

const DAY_COLOR = {
    Sunday: "#C47E7E", Monday: "#7E9FC4", Tuesday: "#9E86C4",
    Wednesday: "#6D8A7D", Thursday: "#C49A6C", Friday: "#C47E7E", Saturday: "#7E9FC4",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatSlotTime(startTime, endTime) {
    if (!startTime) return "—";
    const fmt = (t) => {
        const [h, m] = t.split(":");
        const hour = parseInt(h, 10);
        return `${hour % 12 || 12}:${m} ${hour < 12 ? "AM" : "PM"}`;
    };
    return `${fmt(startTime)} – ${fmt(endTime)}`;
}

function formatDateTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
        + " · "
        + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// ─── Add Office Hour Dialog ───────────────────────────────────────────────────
function AddOfficeHourDialog({ open, onClose, onSuccess }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    const [day, setDay] = useState("Monday");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("11:00");
    // ✅ NEW: supervisor specifies the meeting type when creating the slot
    const [isOnline, setIsOnline] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSave = async () => {
        if (!day || !startTime || !endTime) {
            setError("Please fill all fields.");
            return;
        }
        if (startTime >= endTime) {
            setError("End time must be after start time.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            // ✅ Pass isOnline to the API
            await createOfficeHour({ dayOfWeek: day, startTime, endTime, isOnline });
            onSuccess?.();
            handleClose();
        } catch (err) {
            setError(err?.response?.data?.message ?? err?.response?.data ?? "Failed to add slot.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        setDay("Monday");
        setStartTime("09:00");
        setEndTime("11:00");
        setIsOnline(false);
        setError("");
        onClose();
    };

    const onlineColor = "#7E9FC4";
    const officeColor = "#6D8A7D";

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(PRIMARY, 0.12) }}>
                        <AddCircleOutlineIcon sx={{ color: PRIMARY, fontSize: 22, display: "block" }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>Add Office Hours</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Set a weekly availability slot for students
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Stack spacing={2.5} sx={{ mt: 1.5 }}>
                    {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                    <FormControl fullWidth size="small">
                        <InputLabel>Day of Week</InputLabel>
                        <Select
                            value={day}
                            label="Day of Week"
                            onChange={(e) => setDay(e.target.value)}
                            sx={{ borderRadius: 2 }}
                        >
                            {DAYS_OF_WEEK.map((d) => (
                                <MenuItem key={d} value={d}>
                                    <Stack direction="row" alignItems="center" gap={1}>
                                        <Box sx={{
                                            width: 10, height: 10, borderRadius: "50%",
                                            bgcolor: DAY_COLOR[d],
                                        }} />
                                        {d}
                                    </Stack>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="Start Time"
                            type="time"
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                        <TextField
                            label="End Time"
                            type="time"
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                    </Stack>

                    {/* ✅ NEW: Meeting type selector — supervisor sets this, student sees it read-only */}
                    <Box>
                        <Typography variant="caption" fontWeight={700} sx={{ color: "text.secondary", mb: 1, display: "block" }}>
                            Meeting Type
                        </Typography>
                        <Stack direction="row" spacing={1.5}>
                            {/* Office Hour option */}
                            <Box
                                onClick={() => setIsOnline(false)}
                                sx={{
                                    flex: 1, p: 1.5, borderRadius: 2, cursor: "pointer",
                                    border: `1.5px solid ${!isOnline ? officeColor : alpha(officeColor, 0.2)}`,
                                    bgcolor: !isOnline ? alpha(officeColor, 0.08) : "transparent",
                                    transition: "all 0.15s",
                                    "&:hover": { borderColor: officeColor, bgcolor: alpha(officeColor, 0.05) },
                                }}
                            >
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <BusinessOutlinedIcon sx={{ fontSize: 18, color: officeColor }} />
                                    <Box>
                                        <Typography variant="body2" fontWeight={!isOnline ? 700 : 500} sx={{ color: !isOnline ? officeColor : "text.primary", lineHeight: 1.2 }}>
                                            Office Hour
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.65rem" }}>
                                            In-person meeting
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>

                            {/* Online option */}
                            <Box
                                onClick={() => setIsOnline(true)}
                                sx={{
                                    flex: 1, p: 1.5, borderRadius: 2, cursor: "pointer",
                                    border: `1.5px solid ${isOnline ? onlineColor : alpha(onlineColor, 0.2)}`,
                                    bgcolor: isOnline ? alpha(onlineColor, 0.08) : "transparent",
                                    transition: "all 0.15s",
                                    "&:hover": { borderColor: onlineColor, bgcolor: alpha(onlineColor, 0.05) },
                                }}
                            >
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <WifiOutlinedIcon sx={{ fontSize: 18, color: onlineColor }} />
                                    <Box>
                                        <Typography variant="body2" fontWeight={isOnline ? 700 : 500} sx={{ color: isOnline ? onlineColor : "text.primary", lineHeight: 1.2 }}>
                                            Online Meeting
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.65rem" }}>
                                            Virtual session
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </Stack>
                    </Box>

                    {/* Preview */}
                    {startTime && endTime && startTime < endTime && (
                        <Box sx={{
                            p: 1.5, borderRadius: 2,
                            bgcolor: alpha(DAY_COLOR[day] ?? PRIMARY, 0.08),
                            border: `1px solid ${alpha(DAY_COLOR[day] ?? PRIMARY, 0.2)}`,
                        }}>
                            <Stack direction="row" alignItems="center" gap={1}>
                                <ScheduleOutlinedIcon sx={{ fontSize: 15, color: DAY_COLOR[day] ?? PRIMARY }} />
                                <Typography variant="body2" fontWeight={600} sx={{ color: DAY_COLOR[day] ?? PRIMARY }}>
                                    {day} · {formatSlotTime(startTime, endTime)}
                                </Typography>
                                <Box sx={{ ml: "auto" }}>
                                    <Chip
                                        size="small"
                                        icon={isOnline
                                            ? <WifiOutlinedIcon sx={{ fontSize: "11px !important" }} />
                                            : <BusinessOutlinedIcon sx={{ fontSize: "11px !important" }} />}
                                        label={isOnline ? "Online" : "In-person"}
                                        sx={{
                                            height: 18, fontSize: "0.6rem", fontWeight: 600,
                                            bgcolor: alpha(isOnline ? onlineColor : officeColor, 0.12),
                                            color: isOnline ? onlineColor : officeColor,
                                            "& .MuiChip-label": { px: 0.7 },
                                        }}
                                    />
                                </Box>
                            </Stack>
                        </Box>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button onClick={handleClose} disabled={loading}
                    sx={{ borderRadius: 2, textTransform: "none", color: "text.secondary" }}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={handleSave} disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AddCircleOutlineIcon />}
                    sx={{
                        bgcolor: PRIMARY, "&:hover": { bgcolor: "#b06f47" },
                        borderRadius: 2, textTransform: "none", fontWeight: 600, px: 3,
                    }}>
                    {loading ? "Saving…" : "Add Slot"}
                </Button>
            </DialogActions>
        </Dialog>
    );
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
            await onConfirm(appointment.appointmentId ?? appointment.id, true, link);
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
                            {appointment.isOnline ? "Online meeting — add a link below" : "In-person meeting"}
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                    <Stack spacing={0.8} sx={{
                        p: 1.5, borderRadius: 2,
                        bgcolor: alpha(PRIMARY, 0.06),
                        border: `1px solid ${alpha(PRIMARY, 0.15)}`,
                    }}>
                        {(appointment.projectName ?? appointment.teamName) && (
                            <Stack direction="row" alignItems="center" spacing={0.8}>
                                <FolderOutlinedIcon sx={{ fontSize: 15, color: PRIMARY }} />
                                <Typography variant="body2" fontWeight={700}>
                                    {appointment.projectName ?? appointment.teamName}
                                </Typography>
                            </Stack>
                        )}
                        {appointment.studentName && (
                            <Stack direction="row" alignItems="center" spacing={0.8}>
                                <PersonOutlinedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                                <Typography variant="caption" color="text.secondary">{appointment.studentName}</Typography>
                            </Stack>
                        )}
                        <Stack direction="row" alignItems="center" spacing={0.8}>
                            <CalendarMonthOutlinedIcon sx={{ fontSize: 15, color: PRIMARY }} />
                            <Typography variant="body2" fontWeight={500}>
                                {appointment.dayOfWeek
                                    ? `${appointment.dayOfWeek} · ${formatSlotTime(appointment.startTime, appointment.endTime)}`
                                    : formatDateTime(appointment.dateTime)}
                            </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.8}>
                            {appointment.isOnline
                                ? <WifiOutlinedIcon sx={{ fontSize: 15, color: "#7E9FC4" }} />
                                : <BusinessOutlinedIcon sx={{ fontSize: 15, color: "#6D8A7D" }} />}
                            <Typography variant="body2" color="text.secondary">
                                {appointment.isOnline ? "Online" : "In-person"}
                            </Typography>
                        </Stack>
                    </Stack>

                    {appointment.isOnline && (
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
                    )}
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

// ─── Office Hour Slot Card ────────────────────────────────────────────────────
function OfficeHourCard({ slot, onDelete, deleting }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    const color = DAY_COLOR[slot.dayOfWeek] ?? PRIMARY;
    const typeColor = slot.isOnline ? "#7E9FC4" : "#6D8A7D";

    return (
        <Box sx={{
            p: 1.8, borderRadius: 2.5,
            border: `1px solid ${alpha(color, 0.2)}`,
            bgcolor: alpha(color, 0.04),
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 1,
        }}>
            <Stack direction="row" alignItems="center" gap={1.5}>
                <Box sx={{
                    width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                    bgcolor: alpha(color, 0.15),
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.7rem", color, letterSpacing: "0.03em" }}>
                        {DAY_SHORT[slot.dayOfWeek] ?? slot.dayOfWeek?.slice(0, 3)}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="body2" fontWeight={700} sx={{ color: t?.textPrimary }}>
                        {slot.dayOfWeek}
                    </Typography>
                    <Stack direction="row" alignItems="center" gap={0.5}>
                        <AccessTimeOutlinedIcon sx={{ fontSize: 12, color: t?.textTertiary }} />
                        <Typography variant="caption" sx={{ color: t?.textSecondary }}>
                            {formatSlotTime(slot.startTime, slot.endTime)}
                        </Typography>
                    </Stack>
                </Box>
                {/* ✅ Show meeting type badge on each slot */}
                <Chip
                    size="small"
                    icon={slot.isOnline
                        ? <WifiOutlinedIcon sx={{ fontSize: "11px !important" }} />
                        : <BusinessOutlinedIcon sx={{ fontSize: "11px !important" }} />}
                    label={slot.isOnline ? "Online" : "In-person"}
                    sx={{
                        height: 18, fontSize: "0.6rem", fontWeight: 600,
                        bgcolor: alpha(typeColor, 0.12),
                        color: typeColor,
                        "& .MuiChip-label": { px: 0.7 },
                    }}
                />
            </Stack>

            <Tooltip title="Delete slot">
                <IconButton
                    size="small"
                    onClick={() => onDelete(slot.officeHourId ?? slot.id)}
                    disabled={deleting}
                    sx={{ color: "text.disabled", "&:hover": { color: "#C47E7E" } }}
                >
                    {deleting
                        ? <CircularProgress size={14} color="inherit" />
                        : <DeleteOutlineIcon sx={{ fontSize: 17 }} />}
                </IconButton>
            </Tooltip>
        </Box>
    );
}

// ─── Pending Appointment Card ─────────────────────────────────────────────────
function PendingApptCard({ appt, onApprove, onReject, rejectingId }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    const apptId = appt.appointmentId ?? appt.id;

    return (
        <Box sx={{
            p: 1.8, borderRadius: 2.5,
            border: `1px solid ${t?.borderLight ?? "#e0e0e0"}`,
            borderLeft: `3px solid ${PRIMARY}`,
        }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box flex={1} mr={1}>
                    <Stack direction="row" alignItems="center" spacing={0.8}>
                        <FolderOutlinedIcon sx={{ fontSize: 14, color: PRIMARY }} />
                        <Typography sx={{ fontWeight: 700, color: t?.textPrimary }}>
                            {appt.projectName ?? appt.teamName ?? "Project"}
                        </Typography>
                        <Chip
                            size="small"
                            icon={appt.isOnline
                                ? <WifiOutlinedIcon sx={{ fontSize: "11px !important" }} />
                                : <BusinessOutlinedIcon sx={{ fontSize: "11px !important" }} />}
                            label={appt.isOnline ? "Online" : "In-person"}
                            sx={{
                                height: 18, fontSize: "0.6rem", fontWeight: 600,
                                bgcolor: alpha(appt.isOnline ? "#7E9FC4" : "#6D8A7D", 0.12),
                                color: appt.isOnline ? "#7E9FC4" : "#6D8A7D",
                                "& .MuiChip-label": { px: 0.7 },
                            }}
                        />
                    </Stack>

                    {appt.studentName && (
                        <Stack direction="row" alignItems="center" spacing={0.8} mt={0.4}>
                            <PersonOutlinedIcon sx={{ fontSize: 13, color: t?.textTertiary }} />
                            <Typography sx={{ fontSize: "0.73rem", color: t?.textSecondary }}>
                                {appt.studentName}
                            </Typography>
                        </Stack>
                    )}

                    <Stack direction="row" alignItems="center" spacing={0.8} mt={0.6}>
                        <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: t?.textTertiary }} />
                        <Typography sx={{ fontSize: "0.78rem", color: t?.textTertiary }}>
                            {appt.dayOfWeek
                                ? `${appt.dayOfWeek} · ${formatSlotTime(appt.startTime, appt.endTime)}`
                                : formatDateTime(appt.dateTime)}
                        </Typography>
                    </Stack>

                    {appt.excuse && (
                        <Stack direction="row" alignItems="flex-start" spacing={0.8} mt={0.4}>
                            <Typography sx={{ fontSize: "0.7rem", color: "#C49A6C", fontStyle: "italic" }}>
                                💬 {appt.excuse}
                            </Typography>
                        </Stack>
                    )}
                </Box>

                <Stack direction="row" gap={0.8} flexShrink={0}>
                    <Button size="small" variant="contained"
                        onClick={() => onApprove(appt)}
                        startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 14 }} />}
                        sx={{
                            bgcolor: "#6D8A7D", "&:hover": { bgcolor: "#556e63" },
                            fontSize: "0.75rem", py: 0.5, px: 1.2, textTransform: "none",
                        }}>
                        Approve
                    </Button>
                    <Button size="small" variant="outlined"
                        onClick={() => onReject(appt)}
                        disabled={rejectingId === apptId}
                        startIcon={rejectingId === apptId
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
    );
}

// ─── All Appointments Tab ─────────────────────────────────────────────────────
function AllAppointmentsSection({ appointments, loading }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    const [filter, setFilter] = useState("All");

    const STATUS_COLOR = {
        Pending: "#C49A6C", Approved: "#6D8A7D", Rejected: "#C47E7E",
        pending: "#C49A6C", approved: "#6D8A7D", rejected: "#C47E7E",
    };

    const filtered = filter === "All"
        ? appointments
        : appointments.filter((a) => (a.status ?? "").toLowerCase() === filter.toLowerCase());

    if (loading) return (
        <Stack alignItems="center" py={4}>
            <CircularProgress sx={{ color: PRIMARY }} />
        </Stack>
    );

    return (
        <Stack spacing={2}>
            <Stack direction="row" gap={1} flexWrap="wrap">
                {["All", "Pending", "Approved", "Rejected"].map((s) => (
                    <Chip
                        key={s}
                        label={s}
                        size="small"
                        onClick={() => setFilter(s)}
                        sx={{
                            cursor: "pointer",
                            fontWeight: filter === s ? 700 : 500,
                            bgcolor: filter === s
                                ? alpha(STATUS_COLOR[s] ?? PRIMARY, 0.15)
                                : alpha(t?.borderLight ?? "#e0e0e0", 0.5),
                            color: filter === s ? (STATUS_COLOR[s] ?? PRIMARY) : t?.textSecondary,
                            border: `1px solid ${filter === s ? alpha(STATUS_COLOR[s] ?? PRIMARY, 0.3) : "transparent"}`,
                        }}
                    />
                ))}
                <Typography variant="caption" sx={{ color: t?.textTertiary, alignSelf: "center", ml: 0.5 }}>
                    {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </Typography>
            </Stack>

            {filtered.length === 0 && (
                <Typography sx={{ textAlign: "center", color: t?.textTertiary, py: 3 }}>
                    No appointments found.
                </Typography>
            )}

            {filtered.map((appt) => {
                const apptId = appt.appointmentId ?? appt.id;
                const statusColor = STATUS_COLOR[appt.status] ?? "#9E9E9E";
                return (
                    <Box key={apptId} sx={{
                        p: 1.8, borderRadius: 2.5,
                        border: `1px solid ${alpha(statusColor, 0.2)}`,
                        borderLeft: `3px solid ${statusColor}`,
                    }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box flex={1}>
                                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                                    <Typography variant="body2" fontWeight={700} sx={{ color: t?.textPrimary }}>
                                        {appt.projectName ?? appt.teamName ?? "Project"}
                                    </Typography>
                                    <Chip size="small" label={appt.status ?? "Unknown"}
                                        sx={{
                                            height: 18, fontSize: "0.6rem", fontWeight: 700,
                                            bgcolor: alpha(statusColor, 0.12), color: statusColor,
                                            "& .MuiChip-label": { px: 0.7 },
                                        }} />
                                    <Chip
                                        size="small"
                                        icon={appt.isOnline
                                            ? <WifiOutlinedIcon sx={{ fontSize: "11px !important" }} />
                                            : <BusinessOutlinedIcon sx={{ fontSize: "11px !important" }} />}
                                        label={appt.isOnline ? "Online" : "In-person"}
                                        sx={{
                                            height: 18, fontSize: "0.6rem", fontWeight: 600,
                                            bgcolor: alpha(appt.isOnline ? "#7E9FC4" : "#6D8A7D", 0.1),
                                            color: appt.isOnline ? "#7E9FC4" : "#6D8A7D",
                                            "& .MuiChip-label": { px: 0.7 },
                                        }}
                                    />
                                </Stack>
                                {appt.studentName && (
                                    <Stack direction="row" alignItems="center" gap={0.5} mt={0.3}>
                                        <PersonOutlinedIcon sx={{ fontSize: 12, color: t?.textTertiary }} />
                                        <Typography variant="caption" sx={{ color: t?.textTertiary }}>
                                            {appt.studentName}
                                        </Typography>
                                    </Stack>
                                )}
                                <Stack direction="row" alignItems="center" gap={0.6} mt={0.6}>
                                    <AccessTimeOutlinedIcon sx={{ fontSize: 13, color: t?.textTertiary }} />
                                    <Typography variant="caption" sx={{ color: t?.textSecondary }}>
                                        {appt.dayOfWeek
                                            ? `${appt.dayOfWeek} · ${formatSlotTime(appt.startTime, appt.endTime)}`
                                            : formatDateTime(appt.dateTime)}
                                    </Typography>
                                </Stack>
                                {appt.teamName && !appt.projectName && (
                                    <Stack direction="row" alignItems="center" gap={0.5} mt={0.3}>
                                        <FolderOutlinedIcon sx={{ fontSize: 12, color: t?.textTertiary }} />
                                        <Typography variant="caption" sx={{ color: t?.textTertiary }}>
                                            {appt.teamName}
                                        </Typography>
                                    </Stack>
                                )}
                                {appt.excuse && (
                                    <Typography variant="caption" sx={{ color: "#C49A6C", fontStyle: "italic", display: "block", mt: 0.3 }}>
                                        💬 {appt.excuse}
                                    </Typography>
                                )}
                                {appt.link && (
                                    <Typography
                                        variant="caption"
                                        component="a"
                                        href={appt.link}
                                        target="_blank"
                                        sx={{ color: "#7E9FC4", display: "block", mt: 0.4 }}
                                    >
                                        🔗 {appt.link}
                                    </Typography>
                                )}
                            </Box>
                        </Stack>
                    </Box>
                );
            })}
        </Stack>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SupervisorMeetings() {
    const theme = useTheme();
    const t = theme.palette.custom;

    const [pending, setPending] = useState([]);
    const [allAppts, setAllAppts] = useState([]);
    const [officeHours, setOfficeHours] = useState([]);

    const [loadingPending, setLoadingPending] = useState(true);
    const [loadingAll, setLoadingAll] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(true);

    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [approveTarget, setApproveTarget] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);
    const [deletingSlotId, setDeletingSlotId] = useState(null);
    const [addSlotOpen, setAddSlotOpen] = useState(false);

    const fetchPending = useCallback(async () => {
        setLoadingPending(true);
        try {
            const data = await getPendingAppointments();
            setPending(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.response?.data?.message ?? "Failed to load pending appointments.");
        } finally { setLoadingPending(false); }
    }, []);

    const fetchAll = useCallback(async () => {
        setLoadingAll(true);
        try {
            const data = await getAllAppointments();
            setAllAppts(Array.isArray(data) ? data : []);
        } catch {
            setAllAppts([]);
        } finally { setLoadingAll(false); }
    }, []);

    const fetchSlots = useCallback(async () => {
        setLoadingSlots(true);
        try {
            const data = await getOfficeHours();
            setOfficeHours(Array.isArray(data) ? data : []);
        } catch {
            setOfficeHours([]);
        } finally { setLoadingSlots(false); }
    }, []);

    useEffect(() => {
        fetchPending();
        fetchAll();
        fetchSlots();
    }, [fetchPending, fetchAll, fetchSlots]);

    const handleRespond = async (id, isApproved, link = "") => {
        setActionError("");
        await respondToAppointment({ appointmentId: id, isApproved, link });
        await fetchPending();
        await fetchAll();
    };

    const handleReject = async (appt) => {
        const apptId = appt.appointmentId ?? appt.id;
        setRejectingId(apptId);
        setActionError("");
        try {
            await handleRespond(apptId, false, "");
        } catch (err) {
            setActionError(err?.response?.data?.message ?? "Failed to reject.");
        } finally {
            setRejectingId(null);
        }
    };

    const handleDeleteSlot = async (slotId) => {
        setDeletingSlotId(slotId);
        try {
            await deleteOfficeHour(slotId);
            setOfficeHours((prev) => prev.filter((s) => (s.officeHourId ?? s.id) !== slotId));
        } catch (err) {
            setActionError(err?.response?.data?.message ?? "Failed to delete slot.");
        } finally {
            setDeletingSlotId(null);
        }
    };

    const slotsByDay = DAYS_OF_WEEK.reduce((acc, day) => {
        const slots = officeHours.filter((s) => s.dayOfWeek === day);
        if (slots.length) acc[day] = slots;
        return acc;
    }, {});

    return (
        <Box sx={{ maxWidth: 1100 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h2" sx={{ color: t?.textPrimary, mb: 0.5 }}>Meetings</Typography>
                <Typography sx={{ color: t?.textSecondary, fontSize: "0.9rem" }}>
                    {pending.length} pending requests · {officeHours.length} office hour slot{officeHours.length !== 1 ? "s" : ""}
                </Typography>
            </Box>

            {(error || actionError) && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => { setError(""); setActionError(""); }}>
                    {error || actionError}
                </Alert>
            )}

            <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Paper elevation={0} sx={{
                        p: 2.5, borderRadius: 3,
                        bgcolor: theme.palette.background.paper,
                        border: `1px solid ${t?.borderLight ?? "#e0e0e0"}`,
                        mb: 2.5,
                    }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                            <Stack direction="row" alignItems="center" gap={1}>
                                <Typography variant="h4" sx={{ color: t?.textPrimary }}>
                                    Appointment Requests
                                </Typography>
                                {pending.length > 0 && (
                                    <Chip
                                        label={pending.length}
                                        size="small"
                                        sx={{
                                            bgcolor: alpha(PRIMARY, 0.12), color: PRIMARY,
                                            fontWeight: 700, fontSize: "0.7rem", height: 20,
                                        }}
                                    />
                                )}
                            </Stack>
                        </Stack>

                        {loadingPending ? (
                            <Stack alignItems="center" py={4}>
                                <CircularProgress sx={{ color: PRIMARY }} />
                            </Stack>
                        ) : (
                            <Stack spacing={1.5}>
                                {pending.map((appt) => (
                                    <PendingApptCard
                                        key={appt.appointmentId ?? appt.id}
                                        appt={appt}
                                        onApprove={setApproveTarget}
                                        onReject={handleReject}
                                        rejectingId={rejectingId}
                                    />
                                ))}
                                {pending.length === 0 && (
                                    <Typography sx={{ textAlign: "center", color: t?.textTertiary, py: 2 }}>
                                        No pending appointment requests.
                                    </Typography>
                                )}
                            </Stack>
                        )}
                    </Paper>

                    <Paper elevation={0} sx={{
                        p: 2.5, borderRadius: 3,
                        bgcolor: theme.palette.background.paper,
                        border: `1px solid ${t?.borderLight ?? "#e0e0e0"}`,
                    }}>
                        <Stack direction="row" alignItems="center" gap={1} mb={2}>
                            <PeopleOutlinedIcon sx={{ fontSize: 18, color: PRIMARY }} />
                            <Typography variant="h4" sx={{ color: t?.textPrimary }}>
                                All Appointments
                            </Typography>
                        </Stack>
                        <AllAppointmentsSection appointments={allAppts} loading={loadingAll} />
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, lg: 5 }}>
                    <Paper elevation={0} sx={{
                        p: 2.5, borderRadius: 3,
                        bgcolor: theme.palette.background.paper,
                        border: `1px solid ${t?.borderLight ?? "#e0e0e0"}`,
                        position: { lg: "sticky" }, top: 16,
                    }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
                            <Stack direction="row" alignItems="center" gap={1}>
                                <ScheduleOutlinedIcon sx={{ color: PRIMARY, fontSize: 20 }} />
                                <Typography variant="h4" sx={{ color: t?.textPrimary }}>
                                    Office Hours
                                </Typography>
                            </Stack>
                            <Button
                                size="small"
                                variant="contained"
                                startIcon={<AddCircleOutlineIcon sx={{ fontSize: 16 }} />}
                                onClick={() => setAddSlotOpen(true)}
                                sx={{
                                    bgcolor: PRIMARY, "&:hover": { bgcolor: "#b06f47" },
                                    borderRadius: 2, textTransform: "none", fontWeight: 600,
                                    fontSize: "0.78rem", py: 0.6,
                                }}
                            >
                                Add Slot
                            </Button>
                        </Stack>
                        <Typography sx={{ fontSize: "0.78rem", color: t?.textTertiary, mb: 2 }}>
                            Weekly slots when students can book appointments.
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {loadingSlots ? (
                            <Stack alignItems="center" py={4}>
                                <CircularProgress sx={{ color: PRIMARY }} />
                            </Stack>
                        ) : officeHours.length === 0 ? (
                            <Box sx={{
                                textAlign: "center", py: 4,
                                border: `2px dashed ${alpha(PRIMARY, 0.2)}`,
                                borderRadius: 3,
                            }}>
                                <ScheduleOutlinedIcon sx={{ fontSize: 36, color: alpha(PRIMARY, 0.3), mb: 1 }} />
                                <Typography sx={{ color: t?.textTertiary, fontSize: "0.85rem" }}>
                                    No office hours set yet.
                                </Typography>
                                <Typography sx={{ color: t?.textTertiary, fontSize: "0.75rem", mt: 0.3 }}>
                                    Click <strong>Add Slot</strong> to get started.
                                </Typography>
                            </Box>
                        ) : (
                            <Stack spacing={1.5}>
                                {Object.entries(slotsByDay).map(([day, slots]) => (
                                    <Box key={day}>
                                        <Typography variant="caption" sx={{
                                            fontWeight: 700, color: DAY_COLOR[day],
                                            textTransform: "uppercase", letterSpacing: "0.08em",
                                            fontSize: "0.65rem", mb: 0.8, display: "block",
                                        }}>
                                            {day}
                                        </Typography>
                                        <Stack spacing={0.8}>
                                            {slots.map((slot) => (
                                                <OfficeHourCard
                                                    key={slot.officeHourId ?? slot.id}
                                                    slot={slot}
                                                    onDelete={handleDeleteSlot}
                                                    deleting={deletingSlotId === (slot.officeHourId ?? slot.id)}
                                                />
                                            ))}
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        )}

                        <Divider sx={{ my: 2.5 }} />
                        <Typography variant="h6" sx={{ color: t?.textPrimary, mb: 1.5, fontSize: "0.9rem", fontWeight: 700 }}>
                            How It Works
                        </Typography>
                        <Stack spacing={1.5}>
                            {[
                                { icon: <ScheduleOutlinedIcon sx={{ fontSize: 16, color: PRIMARY }} />, text: "Add weekly slots and specify if each is in-person or online." },
                                { icon: <PersonOutlinedIcon sx={{ fontSize: 16, color: "#7E9FC4" }} />, text: "Students see your slots with their type and choose a time." },
                                { icon: <CheckCircleOutlineIcon sx={{ fontSize: 16, color: "#6D8A7D" }} />, text: "You approve and optionally attach a meeting link for online sessions." },
                            ].map(({ icon, text }, i) => (
                                <Stack key={i} direction="row" alignItems="flex-start" gap={1.2}>
                                    <Box sx={{ mt: 0.1 }}>{icon}</Box>
                                    <Typography sx={{ fontSize: "0.78rem", color: t?.textSecondary, lineHeight: 1.5 }}>
                                        {text}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            <ApproveDialog
                open={Boolean(approveTarget)}
                appointment={approveTarget}
                onClose={() => setApproveTarget(null)}
                onConfirm={handleRespond}
            />
            <AddOfficeHourDialog
                open={addSlotOpen}
                onClose={() => setAddSlotOpen(false)}
                onSuccess={fetchSlots}
            />
        </Box>
    );
}