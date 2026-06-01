import {
    Box, Typography, Stack, Paper, Chip, Avatar, LinearProgress, alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";

import TrendingUpIcon            from "@mui/icons-material/TrendingUp";
import AssignmentTurnedInIcon    from "@mui/icons-material/AssignmentTurnedIn";
import FolderOutlinedIcon        from "@mui/icons-material/FolderOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import GroupsOutlinedIcon        from "@mui/icons-material/GroupsOutlined";

import studentApi    from "../../../../api/handler/endpoints/studentApi";
import fileSystemApi from "../../../../api/handler/endpoints/fileSystemApi";
import { getKanbanBoard } from "../../../../api/handler/endpoints/Kanbanapi";

const PRIMARY = "#d0895b";
const SAGE    = "#6D8A7D";
const GOLD    = "#C49A6C";
const BLUE    = "#7E9FC4";
const RED     = "#C47E7E";
const MEMBER_COLORS = [PRIMARY, SAGE, GOLD, BLUE, RED];

// ── helpers ───────────────────────────────────────────────────────────────────

function toMonthLabel(iso) {
    return new Date(iso).toLocaleString("en-US", { month: "short" });
}

function buildAppointmentsByMonth(appointments) {
    const map = {};
    for (const a of appointments) {
        const m = toMonthLabel(a.dateTime);
        if (!map[m]) map[m] = { month: m, Approved: 0, Rejected: 0, _ts: new Date(a.dateTime) };
        map[m][a.status] = (map[m][a.status] || 0) + 1;
        if (new Date(a.dateTime) < map[m]._ts) map[m]._ts = new Date(a.dateTime);
    }
    return Object.values(map).sort((a, b) => a._ts - b._ts);
}

function buildFilesByMonth(files) {
    const map = {};
    for (const f of files) {
        const m = toMonthLabel(f.uploadedAt);
        if (!map[m]) map[m] = { month: m, files: 0, _ts: new Date(f.uploadedAt) };
        map[m].files += 1;
        if (new Date(f.uploadedAt) < map[m]._ts) map[m]._ts = new Date(f.uploadedAt);
    }
    return Object.values(map).sort((a, b) => a._ts - b._ts);
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ s }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    return (
        <Paper elevation={0} sx={{
            p: 2.5, borderRadius: 3, border: `1px solid ${alpha(s.color, 0.2)}`,
            bgcolor: theme.palette.background.paper, position: "relative", overflow: "hidden",
        }}>
            <Box sx={{
                position: "absolute", top: -16, right: -16, width: 72, height: 72,
                borderRadius: "50%", bgcolor: alpha(s.color, 0.08),
            }} />
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                    <Typography sx={{
                        fontSize: "0.72rem", fontWeight: 600, color: t.textTertiary,
                        textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.5,
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
    const theme  = useTheme();
    const t      = theme.palette.custom;
    const isDark = theme.palette.mode === "dark";

    const gridColor = isDark ? alpha("#fff", 0.06) : alpha("#000", 0.06);
    const axisColor = t.textTertiary;

    // ── state ─────────────────────────────────────────────────────────────────
    const [appointments, setAppointments] = useState([]);
    const [files,        setFiles]        = useState([]);
    const [tasks,        setTasks]        = useState({ toDo: [], inProgress: [], done: [] });
    const [team,         setTeam]         = useState(null);
    const [loading,      setLoading]      = useState(true);

    useEffect(() => {
        Promise.allSettled([
            studentApi.getMyAppointments(),
            studentApi.getMyTeam(),
            fileSystemApi.getStudentFiles(),
            getKanbanBoard(),
        ]).then(([apptRes, teamRes, filesRes, kanbanRes]) => {
            if (apptRes.status   === "fulfilled") setAppointments(apptRes.value   ?? []);
            if (teamRes.status   === "fulfilled") setTeam(teamRes.value           ?? null);
            if (filesRes.status  === "fulfilled") setFiles(filesRes.value         ?? []);
            if (kanbanRes.status === "fulfilled") {
                // getKanbanBoard returns axios response → .data has the board
                const board = kanbanRes.value?.data ?? kanbanRes.value ?? {};
                setTasks({
                    toDo:       board.toDo       ?? [],
                    inProgress: board.inProgress ?? [],
                    done:       board.done       ?? [],
                });
            }
            setLoading(false);
        });
    }, []);

    // ── derived data ──────────────────────────────────────────────────────────

    // appointments
    const approved    = appointments.filter((a) => a.status === "Approved").length;
    const rejected    = appointments.filter((a) => a.status === "Rejected").length;
    const online      = appointments.filter((a) => a.isOnline).length;
    const offline     = appointments.filter((a) => !a.isOnline).length;
    const apptByMonth = buildAppointmentsByMonth(appointments);

    const APPT_STATUS = [
        { name: "Approved", value: approved, color: SAGE },
        { name: "Rejected", value: rejected, color: RED  },
    ];
    const APPT_MODE = [
        { name: "Online",  value: online,  color: BLUE },
        { name: "Offline", value: offline, color: GOLD },
    ];

    // tasks (from kanban)
    const totalTasks  = tasks.toDo.length + tasks.inProgress.length + tasks.done.length;
    const TASKS_STATUS = [
        { name: "Done",        value: tasks.done.length,       color: SAGE },
        { name: "In Progress", value: tasks.inProgress.length, color: GOLD },
        { name: "To Do",       value: tasks.toDo.length,       color: BLUE },
    ];

    // files
    const filesByMonth = buildFilesByMonth(files);

    // team members
    const members = team?.members ?? [];

    // stat cards
    const STATS = [
        {
            label: "Appointments",
            value: String(appointments.length),
            delta: `${approved} approved · ${rejected} rejected`,
            color: PRIMARY,
            icon:  <CalendarMonthOutlinedIcon />,
        },
        {
            label: "Tasks",
            value: totalTasks > 0 ? `${tasks.done.length}/${totalTasks}` : "—",
            delta: `${tasks.inProgress.length} in progress`,
            color: SAGE,
            icon:  <AssignmentTurnedInIcon />,
        },
        {
            label: "Files Uploaded",
            value: String(files.length),
            delta: `${members.length} team member${members.length !== 1 ? "s" : ""}`,
            color: GOLD,
            icon:  <FolderOutlinedIcon />,
        },
        {
            label: "Team Members",
            value: String(members.length),
            delta: team?.projectTitle ?? "—",
            color: BLUE,
            icon:  <GroupsOutlinedIcon />,
        },
    ];

    // ── render ────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography sx={{ color: t.textSecondary }}>Loading analytics…</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1100 }}>

            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>Analytics</Typography>
                <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                    {team?.projectTitle ?? "Project"} · Spring 2026
                </Typography>
            </Box>

            {/* Stat Cards */}
            <Box sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" },
                gap: 2, mb: 3,
            }}>
                {STATS.map((s) => <StatCard key={s.label} s={s} />)}
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2.5 }}>

                {/* ── Appointments per Month ── */}
                <Paper elevation={0} sx={{
                    p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper,
                    border: `1px solid ${alpha(PRIMARY, 0.12)}`,
                }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                        <Box>
                            <Typography variant="h6" fontWeight={700} sx={{ color: t.textPrimary }}>
                                Appointments
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Approved vs rejected per month
                            </Typography>
                        </Box>
                        <Chip
                            label={`${appointments.length} total`}
                            size="small"
                            sx={{ bgcolor: alpha(PRIMARY, 0.12), color: PRIMARY, fontWeight: 700 }}
                        />
                    </Stack>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={apptByMonth} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="Approved" fill={SAGE} radius={[4, 4, 0, 0]} maxBarSize={22} />
                            <Bar dataKey="Rejected" fill={RED}  radius={[4, 4, 0, 0]} maxBarSize={22} />
                        </BarChart>
                    </ResponsiveContainer>
                    <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                        {[{ label: "Approved", color: SAGE }, { label: "Rejected", color: RED }].map((l) => (
                            <Stack key={l.label} direction="row" alignItems="center" spacing={0.8}>
                                <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: l.color }} />
                                <Typography variant="caption" sx={{ color: t.textSecondary }}>{l.label}</Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Paper>

                {/* ── Appointment Status & Mode Donuts ── */}
                <Paper elevation={0} sx={{
                    p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper,
                    border: `1px solid ${alpha(PRIMARY, 0.12)}`,
                }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ color: t.textPrimary }}>
                            Appointment Breakdown
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Status · Online vs offline
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        {/* Status donut */}
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: t.textTertiary, mb: 0.5, display: "block" }}>
                                By status
                            </Typography>
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie data={APPT_STATUS} cx="50%" cy="50%"
                                        innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                                        {APPT_STATUS.map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <Stack spacing={0.8} sx={{ mt: 1 }}>
                                {APPT_STATUS.map((item) => (
                                    <Stack key={item.name} direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack direction="row" alignItems="center" spacing={0.8}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: item.color }} />
                                            <Typography variant="caption" sx={{ color: t.textSecondary }}>{item.name}</Typography>
                                        </Stack>
                                        <Typography variant="caption" fontWeight={700} sx={{ color: t.textPrimary }}>
                                            {item.value}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Box>

                        {/* Mode donut */}
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: t.textTertiary, mb: 0.5, display: "block" }}>
                                By mode
                            </Typography>
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie data={APPT_MODE} cx="50%" cy="50%"
                                        innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                                        {APPT_MODE.map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <Stack spacing={0.8} sx={{ mt: 1 }}>
                                {APPT_MODE.map((item) => (
                                    <Stack key={item.name} direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack direction="row" alignItems="center" spacing={0.8}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: item.color }} />
                                            <Typography variant="caption" sx={{ color: t.textSecondary }}>{item.name}</Typography>
                                        </Stack>
                                        <Typography variant="caption" fontWeight={700} sx={{ color: t.textPrimary }}>
                                            {item.value}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Box>
                    </Stack>
                </Paper>

                {/* ── Tasks Status (Kanban) ── */}
                <Paper elevation={0} sx={{
                    p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper,
                    border: `1px solid ${alpha(PRIMARY, 0.12)}`,
                }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ color: t.textPrimary }}>Tasks Status</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {totalTasks > 0 ? `${totalTasks} total tasks` : "No tasks yet"}
                        </Typography>
                    </Box>
                    {totalTasks > 0 ? (
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <ResponsiveContainer width="50%" height={180}>
                                <PieChart>
                                    <Pie data={TASKS_STATUS} cx="50%" cy="50%"
                                        innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                                        {TASKS_STATUS.map((e, i) => <Cell key={i} fill={e.color} />)}
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
                                        <LinearProgress
                                            variant="determinate"
                                            value={(item.value / totalTasks) * 100}
                                            sx={{
                                                height: 4, borderRadius: 2,
                                                bgcolor: alpha(item.color, 0.15),
                                                "& .MuiLinearProgress-bar": { bgcolor: item.color, borderRadius: 2 },
                                            }}
                                        />
                                    </Stack>
                                ))}
                            </Stack>
                        </Stack>
                    ) : (
                        <Typography variant="body2" sx={{ color: t.textTertiary, textAlign: "center", py: 4 }}>
                            No tasks found in Kanban board
                        </Typography>
                    )}
                </Paper>

                {/* ── Files per Month ── */}
                <Paper elevation={0} sx={{
                    p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper,
                    border: `1px solid ${alpha(PRIMARY, 0.12)}`,
                }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Box>
                            <Typography variant="h6" fontWeight={700} sx={{ color: t.textPrimary }}>File Uploads</Typography>
                            <Typography variant="caption" color="text.secondary">Files submitted per month</Typography>
                        </Box>
                        <Chip
                            label={`${files.length} total`}
                            size="small"
                            sx={{ bgcolor: alpha(GOLD, 0.12), color: GOLD, fontWeight: 700 }}
                        />
                    </Stack>
                    {filesByMonth.length > 0 ? (
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={filesByMonth} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="files" name="Files" fill={GOLD} radius={[4, 4, 0, 0]} maxBarSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <Typography variant="body2" sx={{ color: t.textTertiary, textAlign: "center", py: 4 }}>
                            No files uploaded yet
                        </Typography>
                    )}
                </Paper>

                {/* ── Team Members + file count per member ── */}
                {members.length > 0 && (
                    <Paper elevation={0} sx={{
                        p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper,
                        border: `1px solid ${alpha(PRIMARY, 0.12)}`,
                        gridColumn: { lg: "1 / 3" },
                    }}>
                        <Typography variant="h6" fontWeight={700} sx={{ color: t.textPrimary, mb: 2 }}>
                            Team Members
                        </Typography>
                        <Box sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
                            gap: 2,
                        }}>
                            {members.map((m, i) => {
                                const color       = MEMBER_COLORS[i % MEMBER_COLORS.length];
                                const initials    = m.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                                const memberFiles = files.filter((f) => f.uploadedByUserId === m.userId).length;
                                const totalFiles  = files.length;
                                const pct         = totalFiles > 0 ? Math.round((memberFiles / totalFiles) * 100) : 0;
                                return (
                                    <Paper key={m.userId} elevation={0} sx={{
                                        p: 2, borderRadius: 2,
                                        border: `1px solid ${alpha(color, 0.15)}`,
                                        bgcolor: alpha(color, 0.03),
                                    }}>
                                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.2 }}>
                                            <Avatar sx={{ width: 36, height: 36, bgcolor: color, fontSize: "0.8rem", fontWeight: 700 }}>
                                                {initials}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{ color: t.textPrimary, fontWeight: 600, lineHeight: 1.2 }}>
                                                    {m.fullName}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: t.textTertiary }}>
                                                    @{m.username}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.6 }}>
                                            <Typography variant="caption" sx={{ color: t.textSecondary }}>Files uploaded</Typography>
                                            <Typography variant="caption" fontWeight={700} sx={{ color: t.textPrimary }}>
                                                {memberFiles} ({pct}%)
                                            </Typography>
                                        </Stack>
                                        <LinearProgress
                                            variant="determinate"
                                            value={pct}
                                            sx={{
                                                height: 5, borderRadius: 2,
                                                bgcolor: alpha(color, 0.12),
                                                "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 2 },
                                            }}
                                        />
                                    </Paper>
                                );
                            })}
                        </Box>
                    </Paper>
                )}

            </Box>
        </Box>
    );
}