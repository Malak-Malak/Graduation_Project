// src/components/common/supervisor/Meetings/SupervisorMeetings.jsx

import { useState, useEffect, useCallback } from "react";
import {
    Box, Paper, Typography, Stack, Chip, Button, Grid, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    CircularProgress, Alert, alpha, IconButton, Tooltip,
    FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WifiOutlinedIcon from "@mui/icons-material/WifiOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import {
    getPendingAppointments,
    respondToAppointment,
    getOfficeHours,
    createOfficeHour,
    deleteOfficeHour,
    getAllAppointments,
} from "../../../../api/handler/endpoints/supervisorApi";

// ── ثوابت خارج الـ component ─────────────────────────────────────────────────
const PRIMARY = "#d0895b";
const PAGE_SIZE = 5;

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DAY_SHORT = {
    Sunday: "Sun", Monday: "Mon", Tuesday: "Tue",
    Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat",
};

const DAY_COLOR = {
    Sunday: "#C47E7E", Monday: "#7E9FC4", Tuesday: "#9E86C4",
    Wednesday: "#6D8A7D", Thursday: "#C49A6C", Friday: "#C47E7E", Saturday: "#7E9FC4",
};

const STATUS_COLOR = {
    Pending: "#C49A6C", pending: "#C49A6C",
    Approved: "#6D8A7D", approved: "#6D8A7D",
    Rejected: "#C47E7E", rejected: "#C47E7E",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── Pagination Component ──────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPageChange, totalItems, pageSize, isDark, accentColor }) {
    if (totalPages <= 1) return null;

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalItems);

    // بناء قائمة أرقام الصفحات مع ...
    const getPageNumbers = () => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages = [];
        if (page <= 3) {
            pages.push(1, 2, 3, 4, "...", totalPages);
        } else if (page >= totalPages - 2) {
            pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
        }
        return pages;
    };

    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const btnBase = {
        minWidth: 32, height: 32, borderRadius: 1.5,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.78rem", fontWeight: 500, cursor: "pointer",
        border: `1px solid ${border}`,
        transition: "all 0.15s ease",
        userSelect: "none",
    };

    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between"
            sx={{ mt: 2, pt: 2, borderTop: `1px solid ${border}` }}>

            {/* Info */}
            <Typography sx={{ fontSize: "0.72rem", color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
                Showing {start}–{end} of {totalItems}
            </Typography>

            {/* Controls */}
            <Stack direction="row" alignItems="center" gap={0.5}>
                {/* Prev */}
                <Box
                    onClick={() => page > 1 && onPageChange(page - 1)}
                    sx={{
                        ...btnBase,
                        px: 0.5,
                        opacity: page === 1 ? 0.35 : 1,
                        cursor: page === 1 ? "not-allowed" : "pointer",
                        bgcolor: "transparent",
                        "&:hover": page > 1 ? { bgcolor: `${accentColor}12`, borderColor: accentColor } : {},
                    }}
                >
                    <ChevronLeftIcon sx={{ fontSize: 18 }} />
                </Box>

                {/* Page numbers */}
                {getPageNumbers().map((p, i) =>
                    p === "..." ? (
                        <Typography key={`dots-${i}`} sx={{ fontSize: "0.75rem", px: 0.5, color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}>
                            ···
                        </Typography>
                    ) : (
                        <Box
                            key={p}
                            onClick={() => onPageChange(p)}
                            sx={{
                                ...btnBase,
                                px: 1,
                                bgcolor: page === p ? accentColor : "transparent",
                                color: page === p ? "#fff" : isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.65)",
                                borderColor: page === p ? accentColor : border,
                                fontWeight: page === p ? 700 : 400,
                                "&:hover": page !== p ? { bgcolor: `${accentColor}12`, borderColor: accentColor } : {},
                            }}
                        >
                            {p}
                        </Box>
                    )
                )}

                {/* Next */}
                <Box
                    onClick={() => page < totalPages && onPageChange(page + 1)}
                    sx={{
                        ...btnBase,
                        px: 0.5,
                        opacity: page === totalPages ? 0.35 : 1,
                        cursor: page === totalPages ? "not-allowed" : "pointer",
                        bgcolor: "transparent",
                        "&:hover": page < totalPages ? { bgcolor: `${accentColor}12`, borderColor: accentColor } : {},
                    }}
                >
                    <ChevronRightIcon sx={{ fontSize: 18 }} />
                </Box>
            </Stack>
        </Stack>
    );
}

// ── All Appointments Section ───────────────────────────────────────────────────
function AllAppointmentsSection({ appointments, loading }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const t = theme.palette.custom ?? {};
    const [filter, setFilter] = useState("All");
    const [page, setPage] = useState(1);

    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const cardBg = isDark ? "rgba(255,255,255,0.025)" : "#fff";

    // إعادة تعيين الصفحة لما يتغير الـ filter
    const handleFilterChange = (f) => {
        setFilter(f);
        setPage(1);
    };

    const filtered = filter === "All"
        ? appointments
        : appointments.filter((a) => (a.status ?? "").toLowerCase() === filter.toLowerCase());

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    if (loading) return (
        <Stack alignItems="center" py={4}>
            <CircularProgress sx={{ color: PRIMARY }} size={24} />
        </Stack>
    );

    return (
        <Stack spacing={2}>

            {/* Filter + Count row */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                <Stack direction="row" alignItems="center" gap={0.5}>
                    <FilterListOutlinedIcon sx={{ fontSize: 15, color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }} />
                    <Stack direction="row" gap={0.6}>
                        {["All", "Pending", "Approved", "Rejected"].map((s) => {
                            const active = filter === s;
                            const sc = STATUS_COLOR[s] ?? PRIMARY;
                            return (
                                <Box
                                    key={s}
                                    onClick={() => handleFilterChange(s)}
                                    sx={{
                                        px: 1.2, py: 0.35, borderRadius: 99, cursor: "pointer",
                                        fontSize: "0.72rem", fontWeight: active ? 700 : 400,
                                        bgcolor: active ? sc : "transparent",
                                        color: active ? "#fff" : isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)",
                                        border: `1px solid ${active ? sc : border}`,
                                        transition: "all 0.15s ease",
                                        "&:hover": { bgcolor: active ? sc : `${sc}14`, borderColor: sc },
                                    }}
                                >
                                    {s}
                                </Box>
                            );
                        })}
                    </Stack>
                </Stack>

                {/* Badge عدد النتائج */}
                <Box sx={{
                    px: 1.2, py: 0.3, borderRadius: 99,
                    bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                    border: `1px solid ${border}`,
                }}>
                    <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)" }}>
                        {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                    </Typography>
                </Box>
            </Stack>

            {/* Empty state */}
            {filtered.length === 0 && (
                <Box sx={{
                    textAlign: "center", py: 4,
                    border: `1.5px dashed ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                    borderRadius: 2.5,
                }}>
                    <PeopleOutlinedIcon sx={{ fontSize: 28, color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)", mb: 0.8 }} />
                    <Typography sx={{ fontSize: "0.82rem", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>
                        No {filter !== "All" ? filter.toLowerCase() : ""} appointments found.
                    </Typography>
                </Box>
            )}

            {/* Appointment cards */}
            <Stack spacing={1}>
                {paginated.map((appt) => {
                    const apptId = appt.appointmentId ?? appt.id;
                    const statusColor = STATUS_COLOR[appt.status] ?? "#9E9E9E";
                    const typeColor = appt.isOnline ? "#7E9FC4" : "#6D8A7D";

                    return (
                        <Box key={apptId} sx={{
                            p: 1.8, borderRadius: 2.5,
                            bgcolor: cardBg,
                            border: `1px solid ${border}`,
                            borderLeft: `3px solid ${statusColor}`,
                            transition: "box-shadow 0.15s",
                            "&:hover": {
                                boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.2)" : "0 4px 12px rgba(0,0,0,0.06)",
                            },
                        }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                                <Box flex={1} minWidth={0}>

                                    {/* Row 1: Project name + badges */}
                                    <Stack direction="row" alignItems="center" gap={0.8} flexWrap="wrap" mb={0.5}>
                                        <FolderOutlinedIcon sx={{ fontSize: 13, color: PRIMARY, flexShrink: 0 }} />
                                        <Typography sx={{
                                            fontWeight: 700, fontSize: "0.85rem",
                                            color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)",
                                        }} noWrap>
                                            {appt.projectName ?? appt.teamName ?? "Project"}
                                        </Typography>

                                        {/* Status badge */}
                                        <Box sx={{
                                            px: 1, py: 0.15, borderRadius: 1,
                                            bgcolor: `${statusColor}18`,
                                            border: `1px solid ${statusColor}35`,
                                        }}>
                                            <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: statusColor, letterSpacing: "0.04em" }}>
                                                {appt.status ?? "Unknown"}
                                            </Typography>
                                        </Box>

                                        {/* Type badge */}
                                        <Box sx={{
                                            px: 1, py: 0.15, borderRadius: 1,
                                            bgcolor: `${typeColor}14`,
                                            border: `1px solid ${typeColor}30`,
                                            display: "flex", alignItems: "center", gap: 0.4,
                                        }}>
                                            {appt.isOnline
                                                ? <WifiOutlinedIcon sx={{ fontSize: 10, color: typeColor }} />
                                                : <BusinessOutlinedIcon sx={{ fontSize: 10, color: typeColor }} />
                                            }
                                            <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: typeColor }}>
                                                {appt.isOnline ? "Online" : "In-person"}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    {/* Row 2: Student */}
                                    {appt.studentName && (
                                        <Stack direction="row" alignItems="center" gap={0.5} mb={0.3}>
                                            <PersonOutlinedIcon sx={{ fontSize: 12, color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)", flexShrink: 0 }} />
                                            <Typography sx={{ fontSize: "0.72rem", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>
                                                {appt.studentName}
                                            </Typography>
                                        </Stack>
                                    )}

                                    {/* Row 3: Time */}
                                    <Stack direction="row" alignItems="center" gap={0.5} mb={appt.excuse || appt.link ? 0.4 : 0}>
                                        <AccessTimeOutlinedIcon sx={{ fontSize: 12, color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)", flexShrink: 0 }} />
                                        <Typography sx={{ fontSize: "0.75rem", color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)" }}>
                                            {appt.dayOfWeek
                                                ? `${appt.dayOfWeek} · ${formatSlotTime(appt.startTime, appt.endTime)}`
                                                : formatDateTime(appt.dateTime)}
                                        </Typography>
                                    </Stack>

                                    {/* Excuse */}
                                    {appt.excuse && (
                                        <Typography sx={{ fontSize: "0.7rem", color: "#C49A6C", fontStyle: "italic", mt: 0.3 }}>
                                            💬 {appt.excuse}
                                        </Typography>
                                    )}

                                    {/* Link */}
                                    {appt.link && (
                                        <Typography
                                            component="a" href={appt.link} target="_blank"
                                            sx={{ fontSize: "0.7rem", color: "#7E9FC4", display: "block", mt: 0.3, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
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

            {/* Pagination */}
            <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={filtered.length}
                pageSize={PAGE_SIZE}
                isDark={isDark}
                accentColor={PRIMARY}
            />
        </Stack>
    );
}

// ── Add Office Hour Dialog ─────────────────────────────────────────────────────
function AddOfficeHourDialog({ open, onClose, onSuccess }) {
    const theme = useTheme();
    const [day, setDay] = useState("Monday");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("11:00");
    const [isOnline, setIsOnline] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSave = async () => {
        if (!day || !startTime || !endTime) { setError("Please fill all fields."); return; }
        if (startTime >= endTime) { setError("End time must be after start time."); return; }
        setLoading(true);
        setError("");
        try {
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
        setDay("Monday"); setStartTime("09:00"); setEndTime("11:00");
        setIsOnline(false); setError(""); onClose();
    };

    const onlineColor = "#7E9FC4";
    const officeColor = "#6D8A7D";
    const isDark = theme.palette.mode === "dark";
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
            PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${border}`, overflow: "hidden" } }}>
            <Box sx={{ height: 3, bgcolor: PRIMARY }} />
            <DialogTitle sx={{ pt: 2.5 }}>
                <Stack direction="row" alignItems="center" gap={1.5}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(PRIMARY, 0.12) }}>
                        <AddCircleOutlineIcon sx={{ color: PRIMARY, fontSize: 20, display: "block" }} />
                    </Box>
                    <Box>
                        <Typography fontWeight={700} fontSize="0.95rem">Add Office Hours</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Set a weekly availability slot
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
                        <Select value={day} label="Day of Week"
                            onChange={(e) => setDay(e.target.value)}
                            sx={{ borderRadius: 2 }}>
                            {DAYS_OF_WEEK.map((d) => (
                                <MenuItem key={d} value={d}>
                                    <Stack direction="row" alignItems="center" gap={1}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: DAY_COLOR[d] }} />
                                        {d}
                                    </Stack>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Stack direction="row" spacing={2}>
                        <TextField label="Start Time" type="time" size="small" fullWidth
                            InputLabelProps={{ shrink: true }} value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                        <TextField label="End Time" type="time" size="small" fullWidth
                            InputLabelProps={{ shrink: true }} value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                    </Stack>

                    {/* Meeting type */}
                    <Box>
                        <Typography variant="caption" fontWeight={700} sx={{ color: "text.secondary", mb: 1, display: "block" }}>
                            Meeting Type
                        </Typography>
                        <Stack direction="row" spacing={1.5}>
                            {[
                                { label: "Office Hour", sub: "In-person meeting", val: false, color: officeColor, icon: <BusinessOutlinedIcon sx={{ fontSize: 18, color: officeColor }} /> },
                                { label: "Online Meeting", sub: "Virtual session", val: true, color: onlineColor, icon: <WifiOutlinedIcon sx={{ fontSize: 18, color: onlineColor }} /> },
                            ].map(({ label, sub, val, color, icon }) => {
                                const active = isOnline === val;
                                return (
                                    <Box key={label} onClick={() => setIsOnline(val)} sx={{
                                        flex: 1, p: 1.5, borderRadius: 2, cursor: "pointer",
                                        border: `1.5px solid ${active ? color : alpha(color, 0.2)}`,
                                        bgcolor: active ? alpha(color, 0.08) : "transparent",
                                        transition: "all 0.15s",
                                        "&:hover": { borderColor: color, bgcolor: alpha(color, 0.05) },
                                    }}>
                                        <Stack direction="row" alignItems="center" gap={1}>
                                            {icon}
                                            <Box>
                                                <Typography variant="body2" fontWeight={active ? 700 : 500}
                                                    sx={{ color: active ? color : "text.primary", lineHeight: 1.2 }}>
                                                    {label}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.65rem" }}>
                                                    {sub}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                );
                            })}
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
                                    <Box sx={{
                                        px: 1, py: 0.15, borderRadius: 1,
                                        bgcolor: alpha(isOnline ? onlineColor : officeColor, 0.12),
                                        border: `1px solid ${alpha(isOnline ? onlineColor : officeColor, 0.25)}`,
                                        display: "flex", alignItems: "center", gap: 0.4,
                                    }}>
                                        {isOnline
                                            ? <WifiOutlinedIcon sx={{ fontSize: 10, color: onlineColor }} />
                                            : <BusinessOutlinedIcon sx={{ fontSize: 10, color: officeColor }} />
                                        }
                                        <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: isOnline ? onlineColor : officeColor }}>
                                            {isOnline ? "Online" : "In-person"}
                                        </Typography>
                                    </Box>
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
                    startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <AddCircleOutlineIcon />}
                    sx={{
                        bgcolor: PRIMARY, "&:hover": { bgcolor: "#b06f47" },
                        borderRadius: 2, textTransform: "none", fontWeight: 600,
                        boxShadow: "none",
                    }}>
                    {loading ? "Saving…" : "Add Slot"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ── Approve Dialog ─────────────────────────────────────────────────────────────
function ApproveDialog({ appointment, open, onClose, onConfirm }) {
    const [link, setLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const isDark = useTheme().palette.mode === "dark";
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";

    const handleConfirm = async () => {
        setLoading(true); setError("");
        try {
            await onConfirm(appointment.appointmentId ?? appointment.id, true, link);
            setLink(""); onClose();
        } catch (err) {
            setError(err?.response?.data?.message ?? err?.response?.data ?? "Failed to approve.");
        } finally { setLoading(false); }
    };

    const handleClose = () => {
        if (loading) return;
        setLink(""); setError(""); onClose();
    };

    if (!appointment) return null;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
            PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${border}`, overflow: "hidden" } }}>
            <Box sx={{ height: 3, bgcolor: "#6D8A7D" }} />
            <DialogTitle sx={{ pt: 2.5 }}>
                <Stack direction="row" alignItems="center" gap={1.5}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha("#6D8A7D", 0.12) }}>
                        <CheckCircleOutlineIcon sx={{ color: "#6D8A7D", fontSize: 20, display: "block" }} />
                    </Box>
                    <Box>
                        <Typography fontWeight={700} fontSize="0.95rem">Approve Appointment</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {appointment.isOnline ? "Online — add a meeting link below" : "In-person meeting"}
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
                        bgcolor: alpha(PRIMARY, 0.06), border: `1px solid ${alpha(PRIMARY, 0.15)}`,
                    }}>
                        {(appointment.projectName ?? appointment.teamName) && (
                            <Stack direction="row" alignItems="center" gap={0.8}>
                                <FolderOutlinedIcon sx={{ fontSize: 14, color: PRIMARY }} />
                                <Typography variant="body2" fontWeight={700}>
                                    {appointment.projectName ?? appointment.teamName}
                                </Typography>
                            </Stack>
                        )}
                        {appointment.studentName && (
                            <Stack direction="row" alignItems="center" gap={0.8}>
                                <PersonOutlinedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                                <Typography variant="caption" color="text.secondary">{appointment.studentName}</Typography>
                            </Stack>
                        )}
                        <Stack direction="row" alignItems="center" gap={0.8}>
                            <CalendarMonthOutlinedIcon sx={{ fontSize: 14, color: PRIMARY }} />
                            <Typography variant="body2" fontWeight={500}>
                                {appointment.dayOfWeek
                                    ? `${appointment.dayOfWeek} · ${formatSlotTime(appointment.startTime, appointment.endTime)}`
                                    : formatDateTime(appointment.dateTime)}
                            </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" gap={0.8}>
                            {appointment.isOnline
                                ? <WifiOutlinedIcon sx={{ fontSize: 14, color: "#7E9FC4" }} />
                                : <BusinessOutlinedIcon sx={{ fontSize: 14, color: "#6D8A7D" }} />}
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
                                startAdornment: <VideocamOutlinedIcon sx={{ fontSize: 17, color: "text.disabled", mr: 0.5 }} />,
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
                    startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <CheckCircleOutlineIcon />}
                    sx={{
                        bgcolor: "#6D8A7D", "&:hover": { bgcolor: "#556e63" },
                        borderRadius: 2, textTransform: "none", fontWeight: 600,
                        boxShadow: "none",
                    }}>
                    {loading ? "Approving…" : "Confirm Approval"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ── Office Hour Slot Card ──────────────────────────────────────────────────────
function OfficeHourCard({ slot, onDelete, deleting }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const t = theme.palette.custom ?? {};
    const color = DAY_COLOR[slot.dayOfWeek] ?? PRIMARY;
    const typeColor = slot.isOnline ? "#7E9FC4" : "#6D8A7D";
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

    return (
        <Box sx={{
            p: 1.6, borderRadius: 2.5,
            border: `1px solid ${alpha(color, 0.2)}`,
            bgcolor: alpha(color, 0.04),
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1,
            transition: "box-shadow 0.15s",
            "&:hover": { boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.2)" : "0 2px 8px rgba(0,0,0,0.06)" },
        }}>
            <Stack direction="row" alignItems="center" gap={1.5}>
                <Box sx={{
                    width: 34, height: 34, borderRadius: 2, flexShrink: 0,
                    bgcolor: alpha(color, 0.15),
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.66rem", color, letterSpacing: "0.03em" }}>
                        {DAY_SHORT[slot.dayOfWeek] ?? slot.dayOfWeek?.slice(0, 3)}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="body2" fontWeight={700} sx={{ color: t?.textPrimary ?? "text.primary", fontSize: "0.82rem" }}>
                        {slot.dayOfWeek}
                    </Typography>
                    <Stack direction="row" alignItems="center" gap={0.5}>
                        <AccessTimeOutlinedIcon sx={{ fontSize: 11, color: t?.textTertiary ?? "text.disabled" }} />
                        <Typography variant="caption" sx={{ color: t?.textSecondary ?? "text.secondary", fontSize: "0.7rem" }}>
                            {formatSlotTime(slot.startTime, slot.endTime)}
                        </Typography>
                    </Stack>
                </Box>
                <Box sx={{
                    px: 1, py: 0.2, borderRadius: 1,
                    bgcolor: alpha(typeColor, 0.12), border: `1px solid ${alpha(typeColor, 0.25)}`,
                    display: "flex", alignItems: "center", gap: 0.4,
                }}>
                    {slot.isOnline
                        ? <WifiOutlinedIcon sx={{ fontSize: 10, color: typeColor }} />
                        : <BusinessOutlinedIcon sx={{ fontSize: 10, color: typeColor }} />
                    }
                    <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: typeColor }}>
                        {slot.isOnline ? "Online" : "In-person"}
                    </Typography>
                </Box>
            </Stack>
            <Tooltip title="Delete slot">
                <IconButton size="small" onClick={() => onDelete(slot.officeHourId ?? slot.id)}
                    disabled={deleting}
                    sx={{ color: "text.disabled", "&:hover": { color: "#C47E7E", bgcolor: alpha("#C47E7E", 0.08) } }}>
                    {deleting
                        ? <CircularProgress size={13} color="inherit" />
                        : <DeleteOutlineIcon sx={{ fontSize: 16 }} />}
                </IconButton>
            </Tooltip>
        </Box>
    );
}

// ── Pending Appointment Card ───────────────────────────────────────────────────
function PendingApptCard({ appt, onApprove, onReject, rejectingId }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const t = theme.palette.custom ?? {};
    const apptId = appt.appointmentId ?? appt.id;
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const cardBg = isDark ? "rgba(255,255,255,0.025)" : "#fff";

    return (
        <Box sx={{
            p: 1.8, borderRadius: 2.5,
            bgcolor: cardBg, border: `1px solid ${border}`,
            borderLeft: `3px solid ${PRIMARY}`,
            transition: "box-shadow 0.15s",
            "&:hover": { boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.2)" : "0 4px 12px rgba(0,0,0,0.06)" },
        }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                <Box flex={1} minWidth={0}>
                    <Stack direction="row" alignItems="center" gap={0.8} flexWrap="wrap" mb={0.4}>
                        <FolderOutlinedIcon sx={{ fontSize: 13, color: PRIMARY }} />
                        <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)" }} noWrap>
                            {appt.projectName ?? appt.teamName ?? "Project"}
                        </Typography>
                        <Box sx={{
                            px: 1, py: 0.15, borderRadius: 1,
                            bgcolor: alpha(appt.isOnline ? "#7E9FC4" : "#6D8A7D", 0.12),
                            border: `1px solid ${alpha(appt.isOnline ? "#7E9FC4" : "#6D8A7D", 0.25)}`,
                            display: "flex", alignItems: "center", gap: 0.4,
                        }}>
                            {appt.isOnline
                                ? <WifiOutlinedIcon sx={{ fontSize: 10, color: "#7E9FC4" }} />
                                : <BusinessOutlinedIcon sx={{ fontSize: 10, color: "#6D8A7D" }} />
                            }
                            <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: appt.isOnline ? "#7E9FC4" : "#6D8A7D" }}>
                                {appt.isOnline ? "Online" : "In-person"}
                            </Typography>
                        </Box>
                    </Stack>

                    {appt.studentName && (
                        <Stack direction="row" alignItems="center" gap={0.5} mb={0.3}>
                            <PersonOutlinedIcon sx={{ fontSize: 12, color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }} />
                            <Typography sx={{ fontSize: "0.72rem", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>
                                {appt.studentName}
                            </Typography>
                        </Stack>
                    )}

                    <Stack direction="row" alignItems="center" gap={0.5}>
                        <AccessTimeOutlinedIcon sx={{ fontSize: 12, color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }} />
                        <Typography sx={{ fontSize: "0.75rem", color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                            {appt.dayOfWeek
                                ? `${appt.dayOfWeek} · ${formatSlotTime(appt.startTime, appt.endTime)}`
                                : formatDateTime(appt.dateTime)}
                        </Typography>
                    </Stack>

                    {appt.excuse && (
                        <Typography sx={{ fontSize: "0.7rem", color: "#C49A6C", fontStyle: "italic", mt: 0.4 }}>
                            💬 {appt.excuse}
                        </Typography>
                    )}
                </Box>

                <Stack direction="column" gap={0.8} flexShrink={0}>
                    <Button size="small" variant="contained"
                        onClick={() => onApprove(appt)}
                        startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 13 }} />}
                        sx={{
                            bgcolor: "#6D8A7D", "&:hover": { bgcolor: "#556e63" },
                            fontSize: "0.73rem", py: 0.5, px: 1.4,
                            textTransform: "none", fontWeight: 600, boxShadow: "none",
                            borderRadius: 1.5,
                        }}>
                        Approve
                    </Button>
                    <Button size="small" variant="outlined"
                        onClick={() => onReject(appt)}
                        disabled={rejectingId === apptId}
                        startIcon={rejectingId === apptId ? <CircularProgress size={11} color="inherit" /> : null}
                        sx={{
                            borderColor: "#C47E7E", color: "#C47E7E",
                            "&:hover": { borderColor: "#a85f5f", color: "#a85f5f", bgcolor: alpha("#C47E7E", 0.05) },
                            fontSize: "0.73rem", py: 0.5, px: 1.4,
                            textTransform: "none", fontWeight: 600,
                            borderRadius: 1.5,
                        }}>
                        Decline
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function SupervisorMeetings() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const t = theme.palette.custom ?? {};
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const paperBg = theme.palette.background.paper;

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
        } catch { setAllAppts([]); }
        finally { setLoadingAll(false); }
    }, []);

    const fetchSlots = useCallback(async () => {
        setLoadingSlots(true);
        try {
            const data = await getOfficeHours();
            setOfficeHours(Array.isArray(data) ? data : []);
        } catch { setOfficeHours([]); }
        finally { setLoadingSlots(false); }
    }, []);

    useEffect(() => {
        fetchPending(); fetchAll(); fetchSlots();
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
        try { await handleRespond(apptId, false, ""); }
        catch (err) { setActionError(err?.response?.data?.message ?? "Failed to reject."); }
        finally { setRejectingId(null); }
    };

    const handleDeleteSlot = async (slotId) => {
        setDeletingSlotId(slotId);
        try {
            await deleteOfficeHour(slotId);
            setOfficeHours((prev) => prev.filter((s) => (s.officeHourId ?? s.id) !== slotId));
        } catch (err) {
            setActionError(err?.response?.data?.message ?? "Failed to delete slot.");
        } finally { setDeletingSlotId(null); }
    };

    const slotsByDay = DAYS_OF_WEEK.reduce((acc, day) => {
        const slots = officeHours.filter((s) => s.dayOfWeek === day);
        if (slots.length) acc[day] = slots;
        return acc;
    }, {});

    return (
        <Box sx={{ maxWidth: 1100 }}>

            {/* Header */}
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={3}>
                <Box>
                    <Typography variant="h2" sx={{ color: t?.textPrimary, mb: 0.4 }}>Meetings</Typography>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                        {pending.length > 0 && (
                            <Box sx={{
                                px: 1.2, py: 0.25, borderRadius: 99,
                                bgcolor: alpha(PRIMARY, 0.12), border: `1px solid ${alpha(PRIMARY, 0.25)}`,
                            }}>
                                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: PRIMARY }}>
                                    {pending.length} pending
                                </Typography>
                            </Box>
                        )}
                        <Box sx={{
                            px: 1.2, py: 0.25, borderRadius: 99,
                            bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                            border: `1px solid ${border}`,
                        }}>
                            <Typography sx={{ fontSize: "0.7rem", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)" }}>
                                {officeHours.length} slot{officeHours.length !== 1 ? "s" : ""}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
            </Stack>

            {(error || actionError) && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}
                    onClose={() => { setError(""); setActionError(""); }}>
                    {error || actionError}
                </Alert>
            )}

            <Grid container spacing={2.5}>

                {/* ── Left Column ── */}
                <Grid size={{ xs: 12, lg: 7 }}>

                    {/* Pending Requests */}
                    <Paper elevation={0} sx={{
                        p: 2.5, borderRadius: 3, mb: 2.5,
                        bgcolor: paperBg, border: `1px solid ${border}`,
                    }}>
                        <Stack direction="row" alignItems="center" gap={1} mb={2}>
                            <Box sx={{
                                width: 28, height: 28, borderRadius: 1.5,
                                bgcolor: alpha(PRIMARY, 0.12), border: `1px solid ${alpha(PRIMARY, 0.25)}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <CalendarMonthOutlinedIcon sx={{ fontSize: 15, color: PRIMARY }} />
                            </Box>
                            <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: t?.textPrimary ?? "text.primary" }}>
                                Appointment Requests
                            </Typography>
                            {pending.length > 0 && (
                                <Box sx={{
                                    px: 1, py: 0.1, borderRadius: 99,
                                    bgcolor: alpha(PRIMARY, 0.12), border: `1px solid ${alpha(PRIMARY, 0.25)}`,
                                }}>
                                    <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: PRIMARY }}>
                                        {pending.length}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>

                        {loadingPending ? (
                            <Stack alignItems="center" py={4}>
                                <CircularProgress sx={{ color: PRIMARY }} size={24} />
                            </Stack>
                        ) : (
                            <Stack spacing={1.2}>
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
                                    <Box sx={{
                                        textAlign: "center", py: 4,
                                        border: `1.5px dashed ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
                                        borderRadius: 2.5,
                                    }}>
                                        <CalendarMonthOutlinedIcon sx={{ fontSize: 28, color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)", mb: 0.8 }} />
                                        <Typography sx={{ fontSize: "0.82rem", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>
                                            No pending requests
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        )}
                    </Paper>

                    {/* All Appointments */}
                    <Paper elevation={0} sx={{
                        p: 2.5, borderRadius: 3,
                        bgcolor: paperBg, border: `1px solid ${border}`,
                    }}>
                        <Stack direction="row" alignItems="center" gap={1} mb={2}>
                            <Box sx={{
                                width: 28, height: 28, borderRadius: 1.5,
                                bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                                border: `1px solid ${border}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <PeopleOutlinedIcon sx={{ fontSize: 15, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)" }} />
                            </Box>
                            <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: t?.textPrimary ?? "text.primary" }}>
                                All Appointments
                            </Typography>
                            {allAppts.length > 0 && (
                                <Box sx={{
                                    px: 1, py: 0.1, borderRadius: 99,
                                    bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                                    border: `1px solid ${border}`,
                                }}>
                                    <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)" }}>
                                        {allAppts.length}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                        <AllAppointmentsSection appointments={allAppts} loading={loadingAll} />
                    </Paper>
                </Grid>

                {/* ── Right Column: Office Hours ── */}
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Paper elevation={0} sx={{
                        p: 2.5, borderRadius: 3,
                        bgcolor: paperBg, border: `1px solid ${border}`,
                        position: { lg: "sticky" }, top: 16,
                    }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
                            <Stack direction="row" alignItems="center" gap={1}>
                                <Box sx={{
                                    width: 28, height: 28, borderRadius: 1.5,
                                    bgcolor: alpha(PRIMARY, 0.12), border: `1px solid ${alpha(PRIMARY, 0.25)}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <ScheduleOutlinedIcon sx={{ fontSize: 15, color: PRIMARY }} />
                                </Box>
                                <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: t?.textPrimary ?? "text.primary" }}>
                                    Office Hours
                                </Typography>
                            </Stack>
                            <Button size="small" variant="contained"
                                startIcon={<AddCircleOutlineIcon sx={{ fontSize: 15 }} />}
                                onClick={() => setAddSlotOpen(true)}
                                sx={{
                                    bgcolor: PRIMARY, "&:hover": { bgcolor: "#b06f47" },
                                    borderRadius: 2, textTransform: "none", fontWeight: 600,
                                    fontSize: "0.75rem", py: 0.5, boxShadow: "none",
                                }}>
                                Add Slot
                            </Button>
                        </Stack>
                        <Typography sx={{ fontSize: "0.75rem", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)", mb: 2, pl: "36px" }}>
                            Weekly slots for student bookings
                        </Typography>
                        <Divider sx={{ mb: 2, borderColor: border }} />

                        {loadingSlots ? (
                            <Stack alignItems="center" py={4}>
                                <CircularProgress sx={{ color: PRIMARY }} size={24} />
                            </Stack>
                        ) : officeHours.length === 0 ? (
                            <Box sx={{
                                textAlign: "center", py: 4,
                                border: `1.5px dashed ${alpha(PRIMARY, 0.2)}`, borderRadius: 2.5,
                            }}>
                                <ScheduleOutlinedIcon sx={{ fontSize: 32, color: alpha(PRIMARY, 0.28), mb: 1 }} />
                                <Typography sx={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)", fontSize: "0.82rem" }}>
                                    No office hours set yet
                                </Typography>
                            </Box>
                        ) : (
                            <Stack spacing={1.5}>
                                {Object.entries(slotsByDay).map(([day, slots]) => (
                                    <Box key={day}>
                                        <Typography sx={{
                                            fontWeight: 700, color: DAY_COLOR[day],
                                            textTransform: "uppercase", letterSpacing: "0.08em",
                                            fontSize: "0.62rem", mb: 0.8, display: "block",
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

                        <Divider sx={{ my: 2.5, borderColor: border }} />

                        {/* How it works */}
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: t?.textPrimary ?? "text.primary", mb: 1.2 }}>
                            How it works
                        </Typography>
                        <Stack spacing={1.2}>
                            {[
                                { icon: <ScheduleOutlinedIcon sx={{ fontSize: 15, color: PRIMARY }} />, text: "Add weekly slots and specify in-person or online." },
                                { icon: <PersonOutlinedIcon sx={{ fontSize: 15, color: "#7E9FC4" }} />, text: "Students see your slots and choose a time." },
                                { icon: <CheckCircleOutlineIcon sx={{ fontSize: 15, color: "#6D8A7D" }} />, text: "Approve and optionally attach a meeting link." },
                            ].map(({ icon, text }, i) => (
                                <Stack key={i} direction="row" alignItems="flex-start" gap={1.2}>
                                    <Box sx={{ mt: 0.1, flexShrink: 0 }}>{icon}</Box>
                                    <Typography sx={{ fontSize: "0.75rem", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)", lineHeight: 1.55 }}>
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