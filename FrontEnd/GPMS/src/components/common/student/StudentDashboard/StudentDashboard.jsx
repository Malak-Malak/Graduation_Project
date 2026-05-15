import { useEffect, useState, useCallback, useRef } from "react";
import {
    Box, Grid, Typography, Paper, Stack, Avatar, Chip, Button,
    LinearProgress, AvatarGroup, CircularProgress, IconButton, Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import DoneAllIcon from "@mui/icons-material/DoneAll";

import { useAuth } from "../../../../contexts/AuthContext";
import { getKanbanBoard } from "../../../../api/handler/endpoints/Kanbanapi";
import { notificationApi } from "../../../../api/handler/endpoints/notificationApi";
import { getMyDiscussionSlot } from "../../../../api/handler/endpoints/headOfDepartmentApi";
import studentApi from "../../../../api/handler/endpoints/studentApi";

// ── helpers ───────────────────────────────────────────────────────────────────
const TASK_CLR = { Todo: "#9AA9B9", "In Progress": "#C49A6C", Done: "#6D8A7D" };
const TASK_LBL = { Todo: "To Do", "In Progress": "In Progress", Done: "Done" };
const MBR_COLORS = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8", "#C47E7E"];

const fmtDateTime = (dt) => {
    if (!dt) return "—";
    try {
        return new Date(dt).toLocaleString("en-GB", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    } catch { return dt; }
};

const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

// ── Confetti Component ────────────────────────────────────────────────────────
function Confetti({ accent }) {
    const ref = useRef(null);
    const colors = [accent, "#C49A6C", "#6D8A7D", "#7E9FC4", "#9B7EC8", "#e8c4a0"];

    const launch = () => {
        const container = ref.current;
        if (!container) return;
        for (let i = 0; i < 22; i++) {
            setTimeout(() => {
                const el = document.createElement("div");
                Object.assign(el.style, {
                    position: "absolute",
                    width: "7px", height: "7px",
                    borderRadius: "2px",
                    background: colors[Math.floor(Math.random() * colors.length)],
                    left: Math.random() * 100 + "%",
                    top: "-8px",
                    animation: `confettiFall ${1.2 + Math.random() * 0.8}s ease-out forwards`,
                    transform: `rotate(${Math.random() * 180}deg)`,
                    pointerEvents: "none",
                });
                container.appendChild(el);
                setTimeout(() => el.remove(), 2200);
            }, i * 60);
        }
    };

    useEffect(() => {
        // inject keyframe once
        if (!document.getElementById("confetti-kf")) {
            const style = document.createElement("style");
            style.id = "confetti-kf";
            style.textContent = `
                @keyframes confettiFall {
                    0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
                    100% { transform: translateY(90px)  rotate(720deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        launch();
        const t = setTimeout(launch, 2800);
        return () => clearTimeout(t);
    }, []);

    return (
        <Box ref={ref} sx={{
            position: "absolute", top: 0, left: 0,
            width: "100%", height: "100%",
            pointerEvents: "none", overflow: "hidden",
        }} />
    );
}

// ── Discussion Slot Card (student view) ───────────────────────────────────────
function DiscussionSlotCard({ t, accent }) {
    const [slot, setSlot] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyDiscussionSlot()
            .then(d => setSlot(d ?? null))
            .catch(() => setSlot(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return null; // don't show card at all while loading
    if (!slot) return null;   // no slot assigned yet — hide card

    return (
        <Paper elevation={1} sx={{
            p: 2.5, borderRadius: 3, mb: 2,
            bgcolor: `${accent}08`,
            border: `1.5px solid ${accent}35`,
            position: "relative",
            overflow: "hidden",
            animation: "cardGlow 3s ease-in-out infinite",
            "@keyframes cardGlow": {
                "0%, 100%": { boxShadow: "none" },
                "50%": { boxShadow: `0 0 18px 2px ${accent}30` },
            },
        }}>
            <Confetti accent={accent} />
            <Stack direction="row" alignItems="center" gap={1} mb={1.2}>
                <Box sx={{
                    width: 32, height: 32, borderRadius: "10px",
                    bgcolor: `${accent}15`, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <EventOutlinedIcon sx={{ fontSize: 17, color: accent }} />
                </Box>
                <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: t.textPrimary }}>
                    Final Discussion Scheduled
                </Typography>
                <Typography fontSize="1.1rem">🎉</Typography>
                <Chip label="Confirmed" size="small" sx={{
                    height: 20, fontSize: "0.62rem", fontWeight: 700,
                    bgcolor: "#3a9e6f18", color: "#3a9e6f", borderRadius: "6px",
                }} />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
                <Stack direction="row" alignItems="center" gap={0.8}>
                    <EventOutlinedIcon sx={{ fontSize: 14, color: t.textSecondary }} />
                    <Typography fontSize="0.84rem" fontWeight={600} sx={{ color: t.textPrimary }}>
                        {fmtDateTime(slot.dateTime ?? slot.date)}
                    </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap={0.8}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 14, color: t.textSecondary }} />
                    <Typography fontSize="0.84rem" sx={{ color: t.textSecondary }}>
                        {slot.location ?? "—"}
                    </Typography>
                </Stack>
            </Stack>
            {slot.notes && (
                <Typography fontSize="0.75rem" sx={{ color: t.textTertiary, mt: 0.8 }}>
                    {slot.notes}
                </Typography>
            )}
            <Typography fontSize="0.75rem" sx={{ color: accent, fontWeight: 600, mt: 0.8 }}>
                🏆 Congratulations! Your team's hard work paid off.
            </Typography>
        </Paper>
    );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function StudentDashboard() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useAuth();
    const t = theme.palette.custom;
    const accent = t.accentPrimary ?? "#B46F4C";

    // ── state ────────────────────────────────────────────────────────────────
    const [tasks, setTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(true);

    const [notifications, setNotifications] = useState([]);
    const [notiLoading, setNotiLoading] = useState(true);

    const [teamData, setTeamData] = useState(null);

    // ── computed stats from tasks ─────────────────────────────────────────────
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(tk => tk.status === "Done").length;
    const tasksStat = totalTasks ? `${doneTasks}/${totalTasks}` : "—";

    // ── load kanban tasks ─────────────────────────────────────────────────────
    const loadTasks = useCallback(async () => {
        setTasksLoading(true);
        try {
            const res = await getKanbanBoard();
            const board = res?.data ?? res;
            // board is array of columns: [{ title, tasks: [...] }]
            const allTasks = Array.isArray(board)
                ? board.flatMap(col => (col.tasks ?? []).map(tk => ({ ...tk, status: col.title ?? tk.status })))
                : [];
            setTasks(allTasks);
        } catch {
            setTasks([]);
        } finally {
            setTasksLoading(false);
        }
    }, []);

    // ── load notifications ────────────────────────────────────────────────────
    const loadNotifications = useCallback(async () => {
        setNotiLoading(true);
        try {
            const res = await notificationApi.getMyNotifications();
            const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
            setNotifications(list.slice(0, 6));
        } catch {
            setNotifications([]);
        } finally {
            setNotiLoading(false);
        }
    }, []);

    // ── load team info ────────────────────────────────────────────────────────
    const loadTeam = useCallback(async () => {
        try {
            const d = await studentApi.getMyTeam();
            setTeamData(d ?? null);
        } catch {
            setTeamData(null);
        }
    }, []);

    useEffect(() => {
        loadTasks();
        loadNotifications();
        loadTeam();
    }, [loadTasks, loadNotifications, loadTeam]);

    // ── mark all read ─────────────────────────────────────────────────────────
    const handleMarkAllRead = async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
        } catch { /* silent */ }
    };

    // ── stats ─────────────────────────────────────────────────────────────────
    const STATS = [
        { label: "Tasks Done", value: tasksLoading ? null : tasksStat, icon: <ViewKanbanOutlinedIcon />, color: "#B46F4C", path: "/student/kanban" },
        { label: "Files", value: "—", icon: <FolderOutlinedIcon />, color: "#6D8A7D", path: "/student/files" },
        { label: "Meetings", value: "—", icon: <CalendarMonthOutlinedIcon />, color: "#C49A6C", path: "/student/meetings" },
        { label: "Progress", value: totalTasks ? `${Math.round((doneTasks / totalTasks) * 100)}%` : "—", icon: <QueryStatsOutlinedIcon />, color: "#7E9FC4", path: "/student/analytics" },
    ];

    const progressPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // recent tasks — last 4, sorted by not-done first
    const recentTasks = [...tasks]
        .sort((a, b) => (a.status === "Done" ? 1 : -1))
        .slice(0, 4);

    return (
        <Box sx={{ maxWidth: 1200 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>
                    Welcome back,{" "}
                    <Box
                        component="span"
                        sx={{
                            background: `linear-gradient(90deg, ${accent} 30%, #e8c4a0 50%, ${accent} 70%)`,
                            backgroundSize: "200% auto",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            cursor: "default",
                            "&:hover": {
                                animation: "shimmer 1.2s linear infinite",
                            },
                            "@keyframes shimmer": {
                                "0%": { backgroundPosition: "-200% center" },
                                "100%": { backgroundPosition: "200% center" },
                            },
                        }}
                    >
                        {user?.name?.split(" ")[0] ?? user?.username ?? "Student"}
                    </Box>
                </Typography>
                <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                        {user?.department ?? teamData?.department ?? ""}{user?.year ? ` · ${user.year}` : ""}
                    </Typography>
                    {(teamData?.teamName ?? teamData?.name ?? user?.teamName) && (
                        <Chip
                            label={`Team: ${teamData?.teamName ?? teamData?.name ?? user?.teamName}`}
                            size="small"
                            sx={{ bgcolor: `${accent}15`, color: accent, fontWeight: 600, fontSize: "0.72rem", height: 22 }}
                        />
                    )}
                </Stack>
            </Box>

            {/* Discussion Slot Banner */}
            <DiscussionSlotCard t={t} accent={accent} />

            {/* Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {STATS.map((s) => (
                    <Grid size={{ xs: 6, lg: 3 }} key={s.label}>
                        <Paper elevation={1} onClick={() => navigate(s.path)} sx={{
                            p: 2, borderRadius: 3, cursor: "pointer", bgcolor: theme.palette.background.paper,
                            "&:hover": { transform: "translateY(-2px)", boxShadow: t.shadowMd }, transition: "all 0.2s",
                        }}>
                            <Stack direction="row" alignItems="center" gap={1.5}>
                                <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${s.color}15`, color: s.color, "& svg": { fontSize: 20 } }}>
                                    {s.icon}
                                </Box>
                                <Box>
                                    {s.value === null
                                        ? <CircularProgress size={18} sx={{ color: s.color }} />
                                        : <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: t.textPrimary, lineHeight: 1 }}>{s.value}</Typography>
                                    }
                                    <Typography sx={{ fontSize: "0.7rem", color: t.textTertiary, mt: 0.3 }}>{s.label}</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Project Progress */}
            <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper, mb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h5" sx={{ color: t.textPrimary }}>Project Progress</Typography>
                    <Typography sx={{ fontWeight: 700, color: accent }}>{progressPct}%</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={progressPct}
                    sx={{ height: 8, borderRadius: 4, bgcolor: t.borderLight, "& .MuiLinearProgress-bar": { bgcolor: accent, borderRadius: 4 } }} />
                {(teamData?.projectTitle ?? teamData?.projectName) && (
                    <Typography sx={{ fontSize: "0.75rem", color: t.textTertiary, mt: 0.8 }}>
                        {teamData?.teamName ?? ""}{teamData?.teamName ? " — " : ""}{teamData?.projectTitle ?? teamData?.projectName}
                    </Typography>
                )}
            </Paper>

            <Grid container spacing={2}>
                {/* Recent Tasks */}
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h4" sx={{ color: t.textPrimary }}>Recent Tasks</Typography>
                            <Stack direction="row" alignItems="center" gap={1}>
                                <Tooltip title="Refresh">
                                    <IconButton size="small" onClick={loadTasks} sx={{ color: t.textSecondary }}>
                                        {tasksLoading
                                            ? <CircularProgress size={14} sx={{ color: accent }} />
                                            : <RefreshOutlinedIcon sx={{ fontSize: 16 }} />}
                                    </IconButton>
                                </Tooltip>
                                <Button endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />} size="small"
                                    onClick={() => navigate("/student/kanban")}
                                    sx={{ color: accent, fontSize: "0.8rem", textTransform: "none" }}>
                                    Kanban Board
                                </Button>
                            </Stack>
                        </Stack>

                        {tasksLoading ? (
                            <Box display="flex" justifyContent="center" py={4}>
                                <CircularProgress sx={{ color: accent }} size={28} />
                            </Box>
                        ) : recentTasks.length === 0 ? (
                            <Box sx={{ textAlign: "center", py: 4 }}>
                                <CheckCircleOutlineIcon sx={{ fontSize: 32, color: t.textTertiary, opacity: 0.4, mb: 1 }} />
                                <Typography fontSize="0.84rem" sx={{ color: t.textTertiary }}>No tasks yet</Typography>
                            </Box>
                        ) : (
                            <Stack spacing={1}>
                                {recentTasks.map((task, i) => {
                                    const status = task.status ?? "Todo";
                                    const clr = TASK_CLR[status] ?? "#9AA9B9";
                                    const lbl = TASK_LBL[status] ?? status;
                                    const assignees = task.assignedUsers ?? task.assignees ?? [];
                                    return (
                                        <Stack key={task.taskId ?? task.id ?? i} direction="row" alignItems="center" justifyContent="space-between"
                                            sx={{
                                                p: 1.2, borderRadius: 2, border: `1px solid ${t.borderLight}`,
                                                "&:hover": { bgcolor: t.surfaceHover }, transition: "background 0.15s", cursor: "pointer",
                                            }}
                                            onClick={() => navigate("/student/kanban")}>
                                            <Box>
                                                <Typography sx={{
                                                    fontSize: "0.875rem", fontWeight: 600,
                                                    color: status === "Done" ? t.textTertiary : t.textPrimary,
                                                    textDecoration: status === "Done" ? "line-through" : "none",
                                                }}>
                                                    {task.title ?? task.taskTitle ?? "—"}
                                                </Typography>
                                                {task.deadline && (
                                                    <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>
                                                        Due: {new Date(task.deadline).toLocaleDateString("en-GB")}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Stack direction="row" alignItems="center" gap={1}>
                                                {assignees.length > 0 && (
                                                    <AvatarGroup max={3} sx={{ "& .MuiAvatar-root": { width: 22, height: 22, fontSize: "0.6rem", fontWeight: 700 } }}>
                                                        {assignees.map((a, j) => (
                                                            <Avatar key={j} sx={{ bgcolor: MBR_COLORS[j % MBR_COLORS.length] }}>
                                                                {(a.fullName ?? a.name ?? a.username ?? "?").charAt(0).toUpperCase()}
                                                            </Avatar>
                                                        ))}
                                                    </AvatarGroup>
                                                )}
                                                <Chip label={lbl} size="small"
                                                    sx={{ bgcolor: `${clr}18`, color: clr, fontWeight: 600, fontSize: "0.68rem", height: 22 }} />
                                            </Stack>
                                        </Stack>
                                    );
                                })}
                            </Stack>
                        )}
                    </Paper>
                </Grid>

                {/* Notifications */}
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Stack direction="row" alignItems="center" gap={1}>
                                <NotificationsOutlinedIcon sx={{ fontSize: 18, color: accent }} />
                                <Typography variant="h4" sx={{ color: t.textPrimary }}>Notifications</Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" gap={0.5}>
                                <Tooltip title="Refresh">
                                    <IconButton size="small" onClick={loadNotifications} sx={{ color: t.textSecondary }}>
                                        {notiLoading
                                            ? <CircularProgress size={12} sx={{ color: accent }} />
                                            : <RefreshOutlinedIcon sx={{ fontSize: 15 }} />}
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Mark all as read">
                                    <IconButton size="small" onClick={handleMarkAllRead} sx={{ color: t.textSecondary }}>
                                        <DoneAllIcon sx={{ fontSize: 15 }} />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Stack>

                        {notiLoading ? (
                            <Box display="flex" justifyContent="center" py={4}>
                                <CircularProgress sx={{ color: accent }} size={28} />
                            </Box>
                        ) : notifications.length === 0 ? (
                            <Box sx={{ textAlign: "center", py: 4 }}>
                                <NotificationsOutlinedIcon sx={{ fontSize: 32, color: t.textTertiary, opacity: 0.4, mb: 1 }} />
                                <Typography fontSize="0.84rem" sx={{ color: t.textTertiary }}>No notifications</Typography>
                            </Box>
                        ) : (
                            <Stack spacing={1}>
                                {notifications.map((n, i) => {
                                    const unread = !(n.isRead ?? n.read ?? false);
                                    return (
                                        <Box key={n.id ?? n.notificationId ?? i}
                                            onClick={async () => {
                                                if (unread && (n.id ?? n.notificationId)) {
                                                    await notificationApi.markAsRead(n.id ?? n.notificationId).catch(() => { });
                                                    setNotifications(prev => prev.map((x, xi) => xi === i ? { ...x, isRead: true } : x));
                                                }
                                            }}
                                            sx={{
                                                p: 1.2, borderRadius: 2, cursor: unread ? "pointer" : "default",
                                                bgcolor: unread ? `${accent}08` : "transparent",
                                                border: `1px solid ${unread ? `${accent}25` : t.borderLight}`,
                                                borderLeft: unread ? `3px solid ${accent}` : `1px solid ${t.borderLight}`,
                                                transition: "background 0.15s",
                                            }}>
                                            <Typography sx={{ fontSize: "0.82rem", fontWeight: unread ? 600 : 400, color: t.textPrimary, lineHeight: 1.4 }}>
                                                {n.message ?? n.text ?? n.content ?? "—"}
                                            </Typography>
                                            <Typography sx={{ fontSize: "0.7rem", color: t.textTertiary, mt: 0.3 }}>
                                                {timeAgo(n.createdAt ?? n.sentAt ?? n.date)}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}