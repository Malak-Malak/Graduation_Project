import { useState } from "react";
import {
    Box, Typography, Stack, Paper, Chip, Avatar, Button, IconButton,
    Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Select, FormControl, InputLabel, Divider,
    Grid, alpha, Tab, Tabs,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const PRIMARY = "#d0895b";

// ── Static Data ───────────────────────────────────────────────────────────────
const UPCOMING = [
    {
        id: 1,
        title: "Project Progress Review",
        supervisor: "Dr. Thaer Sammar",
        date: "2026-03-12",
        time: "10:00 AM",
        duration: "45 min",
        type: "online",
        link: "https://meet.google.com/abc-xyz",
        notes: "Discuss milestone 2 deliverables and sprint review.",
        status: "confirmed",
    },
    {
        id: 2,
        title: "Requirements Discussion",
        supervisor: "Dr. Thaer Sammar",
        date: "2026-03-18",
        time: "02:00 PM",
        duration: "30 min",
        type: "in-person",
        location: "Room 204, Engineering Building",
        notes: "Bring printed documentation.",
        status: "pending",
    },
    {
        id: 3,
        title: "Final Presentation Prep",
        supervisor: "Dr. Thaer Sammar",
        date: "2026-03-25",
        time: "11:00 AM",
        duration: "60 min",
        type: "online",
        link: "https://zoom.us/j/123456",
        notes: "Prepare slides and demo.",
        status: "confirmed",
    },
];

const PAST = [
    {
        id: 4,
        title: "Kickoff Meeting",
        supervisor: "Dr. Thaer Sammar",
        date: "2026-02-10",
        time: "09:00 AM",
        duration: "60 min",
        type: "in-person",
        location: "Room 204, Engineering Building",
        notes: "Discussed project scope and initial requirements.",
        status: "completed",
    },
    {
        id: 5,
        title: "Milestone 1 Review",
        supervisor: "Dr. Thaer Sammar",
        date: "2026-02-24",
        time: "10:30 AM",
        duration: "45 min",
        type: "online",
        link: "https://meet.google.com/def-uvw",
        notes: "Reviewed initial prototype. Feedback: improve UI flow.",
        status: "completed",
    },
    {
        id: 6,
        title: "Technical Discussion",
        supervisor: "Dr. Thaer Sammar",
        date: "2026-03-03",
        time: "03:00 PM",
        duration: "30 min",
        type: "in-person",
        location: "Room 101",
        notes: "API design and database schema review.",
        status: "cancelled",
    },
];

const STATUS_CONFIG = {
    confirmed: { label: "Confirmed", color: "#6D8A7D" },
    pending: { label: "Pending", color: "#C49A6C" },
    completed: { label: "Completed", color: "#7E9FC4" },
    cancelled: { label: "Cancelled", color: "#C47E7E" },
};

const EMPTY_FORM = {
    title: "",
    date: "",
    time: "",
    duration: "30",
    type: "online",
    notes: "",
};

// ── Meeting Card ──────────────────────────────────────────────────────────────
function MeetingCard({ meeting, onClick }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    const cfg = STATUS_CONFIG[meeting.status];
    const isPast = meeting.status === "completed" || meeting.status === "cancelled";

    return (
        <Paper onClick={() => onClick(meeting)} elevation={0}
            sx={{
                p: 2.5, borderRadius: 3, cursor: "pointer",
                border: `1px solid ${alpha(PRIMARY, isPast ? 0.08 : 0.18)}`,
                bgcolor: theme.palette.background.paper,
                opacity: isPast ? 0.75 : 1,
                transition: "all 0.2s ease",
                "&:hover": { borderColor: alpha(PRIMARY, 0.4), boxShadow: `0 4px 20px ${alpha(PRIMARY, 0.1)}`, transform: "translateY(-1px)" },
            }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack spacing={1.5} flex={1}>
                    {/* Title + Status */}
                    <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: t.textPrimary }}>
                            {meeting.title}
                        </Typography>
                        <Chip label={cfg.label} size="small"
                            sx={{ bgcolor: alpha(cfg.color, 0.12), color: cfg.color, fontWeight: 600, fontSize: "0.7rem", height: 22 }} />
                    </Stack>

                    {/* Supervisor */}
                    <Stack direction="row" alignItems="center" spacing={0.8}>
                        <PersonOutlinedIcon sx={{ fontSize: 15, color: t.textTertiary }} />
                        <Typography variant="body2" color="text.secondary">{meeting.supervisor}</Typography>
                    </Stack>

                    {/* Date + Time + Duration */}
                    <Stack direction="row" spacing={2.5} flexWrap="wrap">
                        <Stack direction="row" alignItems="center" spacing={0.6}>
                            <CalendarMonthOutlinedIcon sx={{ fontSize: 15, color: PRIMARY }} />
                            <Typography variant="body2" sx={{ color: t.textSecondary, fontWeight: 500 }}>
                                {new Date(meeting.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                            </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.6}>
                            <AccessTimeOutlinedIcon sx={{ fontSize: 15, color: PRIMARY }} />
                            <Typography variant="body2" sx={{ color: t.textSecondary }}>
                                {meeting.time} · {meeting.duration}
                            </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.6}>
                            {meeting.type === "online"
                                ? <VideocamOutlinedIcon sx={{ fontSize: 15, color: "#7E9FC4" }} />
                                : <LocationOnOutlinedIcon sx={{ fontSize: 15, color: "#6D8A7D" }} />}
                            <Typography variant="body2" sx={{ color: t.textSecondary, textTransform: "capitalize" }}>
                                {meeting.type}
                            </Typography>
                        </Stack>
                    </Stack>

                    {/* Notes preview */}
                    {meeting.notes && (
                        <Typography variant="caption" color="text.disabled"
                            sx={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {meeting.notes}
                        </Typography>
                    )}
                </Stack>

                <ArrowForwardIosIcon sx={{ fontSize: 14, color: t.textTertiary, mt: 0.5, ml: 1 }} />
            </Stack>
        </Paper>
    );
}

// ── Detail Dialog ─────────────────────────────────────────────────────────────
function MeetingDetailDialog({ meeting, onClose }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    if (!meeting) return null;
    const cfg = STATUS_CONFIG[meeting.status];

    return (
        <Dialog open={Boolean(meeting)} onClose={onClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(PRIMARY, 0.12) }}>
                        <CalendarMonthOutlinedIcon sx={{ color: PRIMARY, fontSize: 22, display: "block" }} />
                    </Box>
                    <Box flex={1}>
                        <Typography variant="h6" fontWeight={700}>{meeting.title}</Typography>
                        <Chip label={cfg.label} size="small"
                            sx={{ bgcolor: alpha(cfg.color, 0.12), color: cfg.color, fontWeight: 600, fontSize: "0.68rem", height: 20, mt: 0.3 }} />
                    </Box>
                </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    {[
                        { icon: <PersonOutlinedIcon />, label: "Supervisor", value: meeting.supervisor },
                        { icon: <CalendarMonthOutlinedIcon />, label: "Date", value: new Date(meeting.date).toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) },
                        { icon: <AccessTimeOutlinedIcon />, label: "Time", value: `${meeting.time} · ${meeting.duration}` },
                        {
                            icon: meeting.type === "online" ? <VideocamOutlinedIcon /> : <LocationOnOutlinedIcon />,
                            label: meeting.type === "online" ? "Meeting Link" : "Location",
                            value: meeting.link ?? meeting.location ?? "—",
                            isLink: meeting.type === "online" && meeting.link,
                        },
                        { icon: <NotesOutlinedIcon />, label: "Notes", value: meeting.notes },
                    ].map(({ icon, label, value, isLink }) => value ? (
                        <Stack key={label} direction="row" alignItems="flex-start" spacing={1.5}>
                            <Box sx={{ color: PRIMARY, "& svg": { fontSize: 19 }, mt: 0.2 }}>{icon}</Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary"
                                    sx={{ textTransform: "uppercase", fontSize: "0.67rem", letterSpacing: "0.05em" }}>
                                    {label}
                                </Typography>
                                {isLink ? (
                                    <Typography variant="body2" component="a" href={value} target="_blank"
                                        sx={{ display: "block", color: PRIMARY, fontWeight: 500, wordBreak: "break-all" }}>
                                        {value}
                                    </Typography>
                                ) : (
                                    <Typography variant="body2" fontWeight={500}>{value}</Typography>
                                )}
                            </Box>
                        </Stack>
                    ) : null)}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button onClick={onClose} sx={{ borderRadius: 2, textTransform: "none" }}>Close</Button>
                {meeting.status === "confirmed" && meeting.type === "online" && meeting.link && (
                    <Button variant="contained" href={meeting.link} target="_blank"
                        startIcon={<VideocamOutlinedIcon />}
                        sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#b06f47" }, borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
                        Join Meeting
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

// ── Request Meeting Dialog ────────────────────────────────────────────────────
function RequestMeetingDialog({ open, onClose }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    const [form, setForm] = useState(EMPTY_FORM);

    const handleSubmit = () => {
        // TODO: ربط بالـ API
        console.log("Request meeting:", form);
        onClose();
        setForm(EMPTY_FORM);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(PRIMARY, 0.12) }}>
                        <AddIcon sx={{ color: PRIMARY, fontSize: 22, display: "block" }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>Request a Meeting</Typography>
                        <Typography variant="caption" color="text.secondary">Send a meeting request to your supervisor</Typography>
                    </Box>
                </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    <TextField label="Meeting Title" size="small" fullWidth value={form.title}
                        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />

                    <Stack direction="row" spacing={2}>
                        <TextField label="Date" type="date" size="small" fullWidth
                            InputLabelProps={{ shrink: true }} value={form.date}
                            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                        <TextField label="Time" type="time" size="small" fullWidth
                            InputLabelProps={{ shrink: true }} value={form.time}
                            onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                    </Stack>

                    <Stack direction="row" spacing={2}>
                        <FormControl size="small" fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                            <InputLabel>Duration</InputLabel>
                            <Select label="Duration" value={form.duration}
                                onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}>
                                <MenuItem value="15">15 min</MenuItem>
                                <MenuItem value="30">30 min</MenuItem>
                                <MenuItem value="45">45 min</MenuItem>
                                <MenuItem value="60">60 min</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                            <InputLabel>Type</InputLabel>
                            <Select label="Type" value={form.type}
                                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                                <MenuItem value="online">Online</MenuItem>
                                <MenuItem value="in-person">In-Person</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>

                    <TextField label="Notes" size="small" fullWidth multiline rows={3} value={form.notes}
                        onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                        placeholder="What would you like to discuss?"
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button onClick={onClose} sx={{ borderRadius: 2, textTransform: "none", color: "text.secondary" }}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={!form.title || !form.date || !form.time}
                    sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#b06f47" }, borderRadius: 2, textTransform: "none", fontWeight: 600, px: 3 }}>
                    Send Request
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
    const [selectedMeeting, setSelected] = useState(null);
    const [requestOpen, setRequestOpen] = useState(false);

    const nextMeeting = UPCOMING.find((m) => m.status === "confirmed");

    return (
        <Box sx={{ maxWidth: 1000 }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>Meetings</Typography>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                        {UPCOMING.length} upcoming · {PAST.filter(m => m.status === "completed").length} completed
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setRequestOpen(true)}
                    sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#b06f47" }, borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
                    Request Meeting
                </Button>
            </Stack>

            {/* Next meeting banner */}
            {nextMeeting && (
                <Paper onClick={() => setSelected(nextMeeting)} elevation={0}
                    sx={{
                        p: 2.5, mb: 3, borderRadius: 3, cursor: "pointer",
                        background: `linear-gradient(135deg, ${alpha(PRIMARY, 0.12)} 0%, ${alpha(PRIMARY, 0.05)} 100%)`,
                        border: `1px solid ${alpha(PRIMARY, 0.25)}`,
                        "&:hover": { borderColor: alpha(PRIMARY, 0.5) }, transition: "border-color 0.2s"
                    }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(PRIMARY, 0.15) }}>
                                <ScheduleIcon sx={{ color: PRIMARY, fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: PRIMARY, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                                    Next Meeting
                                </Typography>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ color: t.textPrimary }}>
                                    {nextMeeting.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {new Date(nextMeeting.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} · {nextMeeting.time} · {nextMeeting.duration}
                                </Typography>
                            </Box>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            {nextMeeting.type === "online" && (
                                <Button variant="contained" size="small" href={nextMeeting.link} target="_blank"
                                    startIcon={<VideocamOutlinedIcon />}
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#b06f47" }, borderRadius: 2, textTransform: "none", fontWeight: 600, fontSize: "0.8rem" }}>
                                    Join
                                </Button>
                            )}
                            <ArrowForwardIosIcon sx={{ fontSize: 14, color: t.textTertiary }} />
                        </Stack>
                    </Stack>
                </Paper>
            )}

            {/* Tabs */}
            <Tabs value={tab} onChange={(_, v) => setTab(v)}
                sx={{
                    mb: 2.5, "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.9rem" },
                    "& .Mui-selected": { color: PRIMARY }, "& .MuiTabs-indicator": { bgcolor: PRIMARY }
                }}>
                <Tab label={`Upcoming (${UPCOMING.length})`} />
                <Tab label={`Past (${PAST.length})`} />
            </Tabs>

            {/* Meeting list */}
            <Stack spacing={2}>
                {(tab === 0 ? UPCOMING : PAST).map((m) => (
                    <MeetingCard key={m.id} meeting={m} onClick={setSelected} />
                ))}
            </Stack>

            {/* Detail Dialog */}
            <MeetingDetailDialog meeting={selectedMeeting} onClose={() => setSelected(null)} />

            {/* Request Meeting Dialog */}
            <RequestMeetingDialog open={requestOpen} onClose={() => setRequestOpen(false)} />
        </Box>
    );
}