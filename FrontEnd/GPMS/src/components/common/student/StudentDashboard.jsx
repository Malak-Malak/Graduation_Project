import {
    Box, Grid, Typography, Paper, Stack, Avatar, Chip, Button, LinearProgress, AvatarGroup,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import { useAuth } from "../../../contexts/AuthContext";

const STATS = [
    { label: "Tasks Done", value: "8/15", icon: <ViewKanbanOutlinedIcon />, color: "#B46F4C", path: "/student/kanban" },
    { label: "Files", value: "12", icon: <FolderOutlinedIcon />, color: "#6D8A7D", path: "/student/files" },
    { label: "Meetings", value: "3", icon: <CalendarMonthOutlinedIcon />, color: "#C49A6C", path: "/student/meetings" },
    { label: "Progress", value: "65%", icon: <QueryStatsOutlinedIcon />, color: "#7E9FC4", path: "/student/analytics" },
];

const RECENT_TASKS = [
    { title: "Database Design", status: "inProgress", due: "Tomorrow", assignees: ["A", "S"] },
    { title: "UI Mockups", status: "todo", due: "2 days", assignees: ["M"] },
    { title: "API Integration", status: "todo", due: "5 days", assignees: ["H", "A"] },
    { title: "Project Setup", status: "done", due: null, assignees: ["A"] },
];

const NOTIFICATIONS = [
    { text: "Dr. Sammar commented on your file", time: "10m ago", unread: true },
    { text: "Meeting confirmed for tomorrow 2pm", time: "1h ago", unread: true },
    { text: "New task assigned: UI Mockups", time: "3h ago", unread: false },
    { text: "Hanan completed: Team Contract", time: "1d ago", unread: false },
];

const TASK_CLR = { todo: "#9AA9B9", inProgress: "#C49A6C", done: "#6D8A7D" };
const TASK_LBL = { todo: "To Do", inProgress: "In Progress", done: "Done" };

export default function StudentDashboard() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useAuth();
    const t = theme.palette.custom;

    return (
        <Box sx={{ maxWidth: 1200 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>
                    Welcome back, {user?.name?.split(" ")[0] ?? "Student"}
                </Typography>
                <Stack direction="row" alignItems="center" gap={1.5}>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                        {user?.department} · {user?.year}
                    </Typography>
                    {user?.teamName && (
                        <Chip label={`Team: ${user.teamName}`} size="small"
                            sx={{ bgcolor: `${t.accentPrimary}15`, color: t.accentPrimary, fontWeight: 600, fontSize: "0.72rem", height: 22 }} />
                    )}
                </Stack>
            </Box>

            {/* Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {STATS.map((s) => (
                    <Grid item xs={6} lg={3} key={s.label}>
                        <Paper elevation={1} onClick={() => navigate(s.path)}
                            sx={{
                                p: 2, borderRadius: 3, cursor: "pointer", bgcolor: theme.palette.background.paper,
                                "&:hover": { transform: "translateY(-2px)", boxShadow: t.shadowMd }, transition: "all 0.2s"
                            }}>
                            <Stack direction="row" alignItems="center" gap={1.5}>
                                <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${s.color}15`, color: s.color, "& svg": { fontSize: 20 } }}>{s.icon}</Box>
                                <Box>
                                    <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: t.textPrimary, lineHeight: 1 }}>{s.value}</Typography>
                                    <Typography sx={{ fontSize: "0.7rem", color: t.textTertiary, mt: 0.3 }}>{s.label}</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Overall progress */}
            <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper, mb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h5" sx={{ color: t.textPrimary }}>Project Progress</Typography>
                    <Typography sx={{ fontWeight: 700, color: t.accentPrimary }}>65%</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={65}
                    sx={{ height: 8, borderRadius: 4, bgcolor: t.borderLight, "& .MuiLinearProgress-bar": { bgcolor: t.accentPrimary, borderRadius: 4 } }} />
                <Typography sx={{ fontSize: "0.75rem", color: t.textTertiary, mt: 0.8 }}>
                    EcoTrackers — AI-Based Waste Management System
                </Typography>
            </Paper>

            <Grid container spacing={2}>
                {/* Recent tasks */}
                <Grid item xs={12} lg={7}>
                    <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h4" sx={{ color: t.textPrimary }}>Recent Tasks</Typography>
                            <Button endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />} size="small"
                                onClick={() => navigate("/student/kanban")} sx={{ color: t.accentPrimary, fontSize: "0.8rem", textTransform: "none" }}>
                                Kanban Board
                            </Button>
                        </Stack>
                        <Stack spacing={1}>
                            {RECENT_TASKS.map((task, i) => (
                                <Stack key={i} direction="row" alignItems="center" justifyContent="space-between"
                                    sx={{
                                        p: 1.2, borderRadius: 2, border: `1px solid ${t.borderLight}`,
                                        "&:hover": { bgcolor: t.surfaceHover }, transition: "background 0.15s", cursor: "pointer"
                                    }}
                                    onClick={() => navigate("/student/kanban")}>
                                    <Box>
                                        <Typography sx={{
                                            fontSize: "0.875rem", fontWeight: 600, color: task.status === "done" ? t.textTertiary : t.textPrimary,
                                            textDecoration: task.status === "done" ? "line-through" : "none"
                                        }}>
                                            {task.title}
                                        </Typography>
                                        {task.due && <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>Due: {task.due}</Typography>}
                                    </Box>
                                    <Stack direction="row" alignItems="center" gap={1}>
                                        <AvatarGroup max={3} sx={{ "& .MuiAvatar-root": { width: 22, height: 22, fontSize: "0.6rem", fontWeight: 700 } }}>
                                            {task.assignees.map((a, j) => <Avatar key={j} sx={{ bgcolor: ["#B46F4C", "#6D8A7D", "#C49A6C"][j % 3] }}>{a}</Avatar>)}
                                        </AvatarGroup>
                                        <Chip label={TASK_LBL[task.status]} size="small"
                                            sx={{ bgcolor: `${TASK_CLR[task.status]}18`, color: TASK_CLR[task.status], fontWeight: 600, fontSize: "0.68rem", height: 22 }} />
                                    </Stack>
                                </Stack>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>

                {/* Notifications */}
                <Grid item xs={12} lg={5}>
                    <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Stack direction="row" alignItems="center" gap={1}>
                                <NotificationsOutlinedIcon sx={{ fontSize: 18, color: t.accentPrimary }} />
                                <Typography variant="h4" sx={{ color: t.textPrimary }}>Notifications</Typography>
                            </Stack>
                            <Typography sx={{ fontSize: "0.75rem", color: t.accentPrimary, cursor: "pointer" }}>Mark all read</Typography>
                        </Stack>
                        <Stack spacing={1}>
                            {NOTIFICATIONS.map((n, i) => (
                                <Box key={i} sx={{
                                    p: 1.2, borderRadius: 2,
                                    bgcolor: n.unread ? `${t.accentPrimary}08` : "transparent",
                                    border: `1px solid ${n.unread ? `${t.accentPrimary}25` : t.borderLight}`,
                                    borderLeft: n.unread ? `3px solid ${t.accentPrimary}` : `1px solid ${t.borderLight}`,
                                }}>
                                    <Typography sx={{ fontSize: "0.82rem", fontWeight: n.unread ? 600 : 400, color: t.textPrimary, lineHeight: 1.4 }}>
                                        {n.text}
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.7rem", color: t.textTertiary, mt: 0.3 }}>{n.time}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}