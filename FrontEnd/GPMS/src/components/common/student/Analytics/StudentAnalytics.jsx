import {
    Box, Typography, Stack, Paper, Grid, Chip, Avatar, LinearProgress, alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

const PRIMARY = "#d0895b";
const SAGE = "#6D8A7D";
const GOLD = "#C49A6C";
const BLUE = "#7E9FC4";
const RED = "#C47E7E";

// ── Static Data ───────────────────────────────────────────────────────────────
const PROJECT_PROGRESS = [
    { week: "W1", progress: 10 },
    { week: "W2", progress: 18 },
    { week: "W3", progress: 25 },
    { week: "W4", progress: 34 },
    { week: "W5", progress: 42 },
    { week: "W6", progress: 55 },
    { week: "W7", progress: 63 },
    { week: "W8", progress: 72 },
];

const TEAM_ACTIVITY = [
    { day: "Mon", commits: 4, tasks: 2 },
    { day: "Tue", commits: 7, tasks: 5 },
    { day: "Wed", commits: 3, tasks: 1 },
    { day: "Thu", commits: 9, tasks: 6 },
    { day: "Fri", commits: 5, tasks: 3 },
    { day: "Sat", commits: 2, tasks: 1 },
    { day: "Sun", commits: 1, tasks: 0 },
];

const TASKS_STATUS = [
    { name: "Completed", value: 18, color: SAGE },
    { name: "In Progress", value: 7, color: GOLD },
    { name: "Overdue", value: 3, color: RED },
    { name: "Not Started", value: 5, color: BLUE },
];

const FILES_DATA = [
    { month: "Jan", uploaded: 3, reviewed: 2 },
    { month: "Feb", uploaded: 6, reviewed: 5 },
    { month: "Mar", uploaded: 4, reviewed: 3 },
];

const TEAM_MEMBERS = [
    { name: "Aya Abu Ghozeh", tasks: 12, completed: 10, avatar: "A", color: PRIMARY },
    { name: "Hanan Awad", tasks: 10, completed: 8, avatar: "H", color: SAGE },
    { name: "Malak Malak", tasks: 11, completed: 9, avatar: "M", color: GOLD },
];

const STATS = [
    { label: "Project Progress", value: "72%", delta: "+9% this week", color: PRIMARY, icon: <TrendingUpIcon /> },
    { label: "Tasks Done", value: "18/33", delta: "3 overdue", color: SAGE, icon: <AssignmentTurnedInIcon /> },
    { label: "Files Uploaded", value: "13", delta: "3 under review", color: GOLD, icon: <FolderOutlinedIcon /> },
    { label: "Meetings", value: "7", delta: "2 upcoming", color: BLUE, icon: <CalendarMonthOutlinedIcon /> },
];

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ s }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    return (
        <Paper elevation={0} sx={{
            p: 2.5, borderRadius: 3, border: `1px solid ${alpha(s.color, 0.2)}`,
            bgcolor: theme.palette.background.paper, position: "relative", overflow: "hidden"
        }}>
            <Box sx={{
                position: "absolute", top: -16, right: -16, width: 72, height: 72,
                borderRadius: "50%", bgcolor: alpha(s.color, 0.08)
            }} />
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                    <Typography sx={{
                        fontSize: "0.72rem", fontWeight: 600, color: t.textTertiary,
                        textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.5
                    }}>
                        {s.label}
                    </Typography>
                    <Typography sx={{ fontSize: "1.9rem", fontWeight: 700, color: t.textPrimary, lineHeight: 1.1 }}>
                        {s.value}
                    </Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary, mt: 0.4 }}>
                        {s.delta}
                    </Typography>
                </Box>
                <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: alpha(s.color, 0.12), color: s.color, "& svg": { fontSize: 22 } }}>
                    {s.icon}
                </Box>
            </Stack>
        </Paper>
    );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <Paper elevation={3} sx={{ p: 1.5, borderRadius: 2, minWidth: 120 }}>
            <Typography variant="caption" fontWeight={700} sx={{ mb: 0.5, display: "block" }}>{label}</Typography>
            {payload.map((p) => (
                <Stack key={p.name} direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: p.color }} />
                    <Typography variant="caption" color="text.secondary">{p.name}:</Typography>
                    <Typography variant="caption" fontWeight={600}>{p.value}</Typography>
                </Stack>
            ))}
        </Paper>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentAnalytics() {
    const theme = useTheme();
    const t = theme.palette.custom;
    const isDark = theme.palette.mode === "dark";

    const gridColor = isDark ? alpha("#fff", 0.06) : alpha("#000", 0.06);
    const axisColor = t.textTertiary;

    const totalTasks = TASKS_STATUS.reduce((s, i) => s + i.value, 0);

    return (
        <Box sx={{ maxWidth: 1100 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>Analytics</Typography>
                <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                    Project performance · Spring 2026
                </Typography>
            </Box>

            {/* Stat Cards */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" }, gap: 2, mb: 3 }}>
                {STATS.map((s) => <StatCard key={s.label} s={s} />)}
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2.5 }}>

                {/* Project Progress — Area Chart */}
                <Box sx={{ gridColumn: { xs: "1", lg: "1 / 2" } }}>
                    <Paper elevation={0} sx={{
                        p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper,
                        border: `1px solid ${alpha(PRIMARY, 0.12)}`
                    }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                            <Box>
                                <Typography variant="h6" fontWeight={700} sx={{ color: t.textPrimary }}>Project Progress</Typography>
                                <Typography variant="caption" color="text.secondary">Weekly completion rate</Typography>
                            </Box>
                            <Chip label="72% Complete" size="small"
                                sx={{ bgcolor: alpha(PRIMARY, 0.12), color: PRIMARY, fontWeight: 700 }} />
                        </Stack>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={PROJECT_PROGRESS}>
                                <defs>
                                    <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis dataKey="week" tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} domain={[0, 100]} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="progress" name="Progress %" stroke={PRIMARY}
                                    strokeWidth={2.5} fill="url(#progressGrad)" dot={{ fill: PRIMARY, r: 4 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Paper>
                </Box>

                {/* Tasks Status — Pie */}
                <Box>
                    <Paper elevation={0} sx={{
                        p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper,
                        border: `1px solid ${alpha(PRIMARY, 0.12)}`
                    }}>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="h6" fontWeight={700} sx={{ color: t.textPrimary }}>Tasks Status</Typography>
                            <Typography variant="caption" color="text.secondary">{totalTasks} total tasks</Typography>
                        </Box>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <ResponsiveContainer width="55%" height={180}>
                                <PieChart>
                                    <Pie data={TASKS_STATUS} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                                        paddingAngle={3} dataKey="value">
                                        {TASKS_STATUS.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <Stack spacing={1.2} flex={1}>
                                {TASKS_STATUS.map((item) => (
                                    <Stack key={item.name} spacing={0.5}>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Stack direction="row" alignItems="center" spacing={0.8}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: item.color }} />
                                                <Typography variant="caption" sx={{ color: t.textSecondary }}>{item.name}</Typography>
                                            </Stack>
                                            <Typography variant="caption" fontWeight={700} sx={{ color: t.textPrimary }}>
                                                {item.value}
                                            </Typography>
                                        </Stack>
                                        <LinearProgress variant="determinate" value={(item.value / totalTasks) * 100}
                                            sx={{
                                                height: 4, borderRadius: 2, bgcolor: alpha(item.color, 0.15),
                                                "& .MuiLinearProgress-bar": { bgcolor: item.color, borderRadius: 2 }
                                            }} />
                                    </Stack>
                                ))}
                            </Stack>
                        </Stack>
                    </Paper>
                </Box>

                {/* Team Activity — Bar */}
                <Box sx={{ gridColumn: { xs: "1", lg: "1 / 2" } }}>
                    <Paper elevation={0} sx={{
                        p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper,
                        border: `1px solid ${alpha(PRIMARY, 0.12)}`
                    }}>
                        <Box sx={{ mb: 2.5 }}>
                            <Typography variant="h6" fontWeight={700} sx={{ color: t.textPrimary }}>Team Activity</Typography>
                            <Typography variant="caption" color="text.secondary">Commits & tasks this week</Typography>
                        </Box>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={TEAM_ACTIVITY} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                <XAxis dataKey="day" tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="commits" name="Commits" fill={PRIMARY} radius={[4, 4, 0, 0]} maxBarSize={20} />
                                <Bar dataKey="tasks" name="Tasks" fill={SAGE} radius={[4, 4, 0, 0]} maxBarSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Box>

                {/* Files + Team Contribution */}
                <Box>
                    <Stack spacing={2.5} height="100%">
                        {/* Files */}
                        <Paper elevation={0} sx={{
                            p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper,
                            border: `1px solid ${alpha(PRIMARY, 0.12)}`
                        }}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="h6" fontWeight={700} sx={{ color: t.textPrimary }}>File Activity</Typography>
                                <Typography variant="caption" color="text.secondary">Uploaded vs reviewed</Typography>
                            </Box>
                            <ResponsiveContainer width="100%" height={110}>
                                <BarChart data={FILES_DATA} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="uploaded" name="Uploaded" fill={GOLD} radius={[3, 3, 0, 0]} maxBarSize={18} />
                                    <Bar dataKey="reviewed" name="Reviewed" fill={BLUE} radius={[3, 3, 0, 0]} maxBarSize={18} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>

                        {/* Team members contribution */}
                        <Paper elevation={0} sx={{
                            p: 2.5, borderRadius: 3, flex: 1, bgcolor: theme.palette.background.paper,
                            border: `1px solid ${alpha(PRIMARY, 0.12)}`
                        }}>
                            <Typography variant="h6" fontWeight={700} sx={{ color: t.textPrimary, mb: 2 }}>
                                Team Contribution
                            </Typography>
                            <Stack spacing={1.8}>
                                {TEAM_MEMBERS.map((m) => (
                                    <Stack key={m.name} spacing={0.6}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Avatar sx={{ width: 26, height: 26, bgcolor: m.color, fontSize: "0.72rem", fontWeight: 700 }}>
                                                    {m.avatar}
                                                </Avatar>
                                                <Typography variant="body2" sx={{ color: t.textPrimary, fontWeight: 500 }}>
                                                    {m.name}
                                                </Typography>
                                            </Stack>
                                            <Typography variant="caption" sx={{ color: t.textTertiary }}>
                                                {m.completed}/{m.tasks}
                                            </Typography>
                                        </Stack>
                                        <LinearProgress variant="determinate" value={(m.completed / m.tasks) * 100}
                                            sx={{
                                                height: 5, borderRadius: 2, bgcolor: alpha(m.color, 0.12),
                                                "& .MuiLinearProgress-bar": { bgcolor: m.color, borderRadius: 2 }
                                            }} />
                                    </Stack>
                                ))}
                            </Stack>
                        </Paper>
                    </Stack>
                </Box>

            </Box>
        </Box>
    );
}