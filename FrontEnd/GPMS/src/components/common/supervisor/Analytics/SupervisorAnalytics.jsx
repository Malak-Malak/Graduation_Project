import {
    Box, Typography, Stack, Paper, Chip, Avatar, LinearProgress, alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";

import GroupsOutlinedIcon        from "@mui/icons-material/GroupsOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircleOutlineIcon    from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon        from "@mui/icons-material/CancelOutlined";

import {
    getSupervisorTeams,
    getAllAppointments,
    getSupervisorTotalTeams,
} from "../../../../api/handler/endpoints/supervisorApi";

const PRIMARY = "#d0895b";
const SAGE    = "#6D8A7D";
const GOLD    = "#C49A6C";
const BLUE    = "#7E9FC4";
const RED     = "#C47E7E";
const TEAM_COLORS = [PRIMARY, SAGE, GOLD, BLUE, RED];

// ── helpers ───────────────────────────────────────────────────────────────────

function toMonthLabel(iso) {
    return new Date(iso).toLocaleString("en-US", { month: "short" });
}

/** appointments per month → [{ month, Approved, Rejected }] sorted by date */
function buildApptByMonth(appointments) {
    const map = {};
    for (const a of appointments) {
        const m = toMonthLabel(a.dateTime);
        if (!map[m]) map[m] = { month: m, Approved: 0, Rejected: 0, _ts: new Date(a.dateTime) };
        map[m][a.status] = (map[m][a.status] || 0) + 1;
        if (new Date(a.dateTime) < map[m]._ts) map[m]._ts = new Date(a.dateTime);
    }
    return Object.values(map).sort((a, b) => a._ts - b._ts);
}

/** appointments per project name → [{ project, Approved, Rejected, total }] */
function buildApptByTeam(appointments) {
    const map = {};
    for (const a of appointments) {
        const p = a.projectName ?? "Unknown";
        if (!map[p]) map[p] = { project: p, Approved: 0, Rejected: 0 };
        map[p][a.status] = (map[p][a.status] || 0) + 1;
    }
    return Object.values(map).map((r) => ({ ...r, total: r.Approved + r.Rejected }));
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
        <Paper elevation={3} sx={{ p: 1.5, borderRadius: 2, minWidth: 130 }}>
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
export default function SupervisorAnalytics() {
    const theme  = useTheme();
    const t      = theme.palette.custom;
    const isDark = theme.palette.mode === "dark";

    const gridColor = isDark ? alpha("#fff", 0.06) : alpha("#000", 0.06);
    const axisColor = t.textTertiary;

    // ── state ─────────────────────────────────────────────────────────────────
    const [teams,        setTeams]        = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [totalTeams,   setTotalTeams]   = useState(0);
    const [loading,      setLoading]      = useState(true);

    useEffect(() => {
        Promise.allSettled([
            getSupervisorTeams(),
            getAllAppointments(),
            getSupervisorTotalTeams(),
        ]).then(([teamsRes, apptRes, totalRes]) => {
            if (teamsRes.status === "fulfilled") setTeams(teamsRes.value        ?? []);
            if (apptRes.status  === "fulfilled") setAppointments(apptRes.value  ?? []);
            if (totalRes.status === "fulfilled") {
                const val = totalRes.value;
                setTotalTeams(typeof val === "number" ? val : (val?.totalTeams ?? 0));
            }
            setLoading(false);
        });
    }, []);

    // ── derived ───────────────────────────────────────────────────────────────
    const approved    = appointments.filter((a) => a.status === "Approved").length;
    const rejected    = appointments.filter((a) => a.status === "Rejected").length;
    const online      = appointments.filter((a) => a.isOnline).length;
    const offline     = appointments.filter((a) => !a.isOnline).length;

    const apptByMonth = buildApptByMonth(appointments);
    const apptByTeam  = buildApptByTeam(appointments);

    const APPT_STATUS_PIE = [
        { name: "Approved", value: approved, color: SAGE },
        { name: "Rejected", value: rejected, color: RED  },
    ];
    const APPT_MODE_PIE = [
        { name: "Online",  value: online,  color: BLUE },
        { name: "Offline", value: offline, color: GOLD },
    ];

    const STATS = [
        {
            label: "Total Teams",
            value: String(totalTeams),
            delta: `${teams.filter((t) => t.status === "Active").length} active`,
            color: PRIMARY,
            icon:  <GroupsOutlinedIcon />,
        },
        {
            label: "Total Appointments",
            value: String(appointments.length),
            delta: `across ${apptByTeam.length} project${apptByTeam.length !== 1 ? "s" : ""}`,
            color: BLUE,
            icon:  <CalendarMonthOutlinedIcon />,
        },
        {
            label: "Approved",
            value: String(approved),
            delta: `${appointments.length > 0 ? Math.round((approved / appointments.length) * 100) : 0}% approval rate`,
            color: SAGE,
            icon:  <CheckCircleOutlineIcon />,
        },
        {
            label: "Rejected",
            value: String(rejected),
            delta: `${appointments.length > 0 ? Math.round((rejected / appointments.length) * 100) : 0}% rejection rate`,
            color: RED,
            icon:  <CancelOutlinedIcon />,
        },
    ];

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
                    Group performance overview · Spring 2026
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
                                Appointments per Month
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Approved vs rejected
                            </Typography>
                        </Box>
                        <Chip
                            label={`${appointments.length} total`}
                            size="small"
                            sx={{ bgcolor: alpha(PRIMARY, 0.12), color: PRIMARY, fontWeight: 700 }}
                        />
                    </Stack>
                    <ResponsiveContainer width="100%" height={210}>
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

                {/* ── Appointments per Team ── */}
                <Paper elevation={0} sx={{
                    p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper,
                    border: `1px solid ${alpha(PRIMARY, 0.12)}`,
                }}>
                    <Box sx={{ mb: 2.5 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ color: t.textPrimary }}>
                            Appointments per Project
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Breakdown by team
                        </Typography>
                    </Box>
                    <ResponsiveContainer width="100%" height={210}>
                        <BarChart data={apptByTeam} barGap={4} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <YAxis type="category" dataKey="project" tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} width={80} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="Approved" fill={SAGE} radius={[0, 4, 4, 0]} maxBarSize={22} />
                            <Bar dataKey="Rejected" fill={RED}  radius={[0, 4, 4, 0]} maxBarSize={22} />
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

                {/* ── Status & Mode Donuts ── */}
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
                                    <Pie data={APPT_STATUS_PIE} cx="50%" cy="50%"
                                        innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                                        {APPT_STATUS_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <Stack spacing={0.8} sx={{ mt: 1 }}>
                                {APPT_STATUS_PIE.map((item) => (
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
                                    <Pie data={APPT_MODE_PIE} cx="50%" cy="50%"
                                        innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                                        {APPT_MODE_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <Stack spacing={0.8} sx={{ mt: 1 }}>
                                {APPT_MODE_PIE.map((item) => (
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

                {/* ── Teams Overview ── */}
                <Paper elevation={0} sx={{
                    p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper,
                    border: `1px solid ${alpha(PRIMARY, 0.12)}`,
                }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Box>
                            <Typography variant="h6" fontWeight={700} sx={{ color: t.textPrimary }}>
                                My Teams
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {teams.length} team{teams.length !== 1 ? "s" : ""} supervised
                            </Typography>
                        </Box>
                        <Chip
                            label={`${totalTeams} total`}
                            size="small"
                            sx={{ bgcolor: alpha(BLUE, 0.12), color: BLUE, fontWeight: 700 }}
                        />
                    </Stack>
                    <Stack spacing={2}>
                        {teams.map((team, i) => {
                            const color       = TEAM_COLORS[i % TEAM_COLORS.length];
                            const teamAppts   = appointments.filter((a) => a.teamId === team.id);
                            const teamApproved = teamAppts.filter((a) => a.status === "Approved").length;
                            const pct = teamAppts.length > 0
                                ? Math.round((teamApproved / teamAppts.length) * 100)
                                : 0;
                            return (
                                <Paper key={team.id} elevation={0} sx={{
                                    p: 2, borderRadius: 2,
                                    border: `1px solid ${alpha(color, 0.18)}`,
                                    bgcolor: alpha(color, 0.03),
                                }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.2 }}>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600} sx={{ color: t.textPrimary }}>
                                                {team.projectTitle}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: t.textTertiary }}>
                                                {team.members.length} member{team.members.length !== 1 ? "s" : ""} · {team.status}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={`${teamAppts.length} appts`}
                                            size="small"
                                            sx={{ bgcolor: alpha(color, 0.12), color, fontWeight: 600, fontSize: "0.7rem" }}
                                        />
                                    </Stack>

                                    {/* members row */}
                                    <Stack direction="row" spacing={0.8} sx={{ mb: 1.2 }}>
                                        {team.members.map((m) => {
                                            const initials = m.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                                            return (
                                                <Avatar key={m.userId} sx={{
                                                    width: 26, height: 26, bgcolor: alpha(color, 0.2),
                                                    color, fontSize: "0.65rem", fontWeight: 700,
                                                }}>
                                                    {initials}
                                                </Avatar>
                                            );
                                        })}
                                    </Stack>

                                    {/* approval rate bar */}
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                        <Typography variant="caption" sx={{ color: t.textSecondary }}>
                                            Appointment approval rate
                                        </Typography>
                                        <Typography variant="caption" fontWeight={700} sx={{ color: t.textPrimary }}>
                                            {pct}%
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
                    </Stack>
                </Paper>

            </Box>
        </Box>
    );
}