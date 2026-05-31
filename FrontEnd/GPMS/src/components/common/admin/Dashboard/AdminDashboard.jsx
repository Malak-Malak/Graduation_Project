import { useEffect, useState } from "react";
import {
    Box, Grid, Typography, Paper, Button, Stack, Avatar, Chip, LinearProgress, CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SupervisorAccountOutlinedIcon from "@mui/icons-material/SupervisorAccountOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { getAllUsers, getAllRequests } from "../../../../api/handler/endpoints/adminApi";

// ── helpers ───────────────────────────────────────────────────────────────────
const ROLE_CLR = {
    Student:    "#B46F4C",
    Supervisor: "#6D8A7D",
    Admin:      "#C47E7E",
};

const STATUS_CLR = {
    Approved: "#6D8A7D",
    Pending:  "#C49A6C",
    Rejected: "#C47E7E",
};

function avatarLetter(username) {
    return (username ?? "?").charAt(0).toUpperCase();
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, color, loading }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    return (
        <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, position: "relative", overflow: "hidden", bgcolor: theme.palette.background.paper }}>
            <Box sx={{ position: "absolute", top: -20, right: -20, width: 90, height: 90, borderRadius: "50%", bgcolor: `${color}10` }} />
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                <Box>
                    <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: t.textTertiary, textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.5 }}>
                        {label}
                    </Typography>
                    {loading ? (
                        <CircularProgress size={22} sx={{ color, mt: 0.5 }} />
                    ) : (
                        <Typography sx={{ fontSize: "2rem", fontWeight: 700, color: t.textPrimary, lineHeight: 1.1 }}>
                            {value}
                        </Typography>
                    )}
                    {!loading && sub && (
                        <Stack direction="row" alignItems="center" gap={0.5} mt={0.5}>
                            <TrendingUpIcon sx={{ fontSize: 13, color: t.success }} />
                            <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>{sub}</Typography>
                        </Stack>
                    )}
                </Box>
                <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: `${color}15`, color, "& svg": { fontSize: 22 } }}>
                    {icon}
                </Box>
            </Stack>
        </Paper>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const theme    = useTheme();
    const navigate = useNavigate();
    const t        = theme.palette.custom;

    const [users,        setUsers]        = useState([]);
    const [requests,     setRequests]     = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingReqs,  setLoadingReqs]  = useState(true);

    // ── fetch ────────────────────────────────────────────────────────────────
    useEffect(() => {
        getAllUsers()
            .then((r) => setUsers(r.data ?? []))
            .catch(() => setUsers([]))
            .finally(() => setLoadingUsers(false));

        getAllRequests()
            .then((r) => setRequests(r.data ?? []))
            .catch(() => setRequests([]))
            .finally(() => setLoadingReqs(false));
    }, []);

    // ── derived stats ────────────────────────────────────────────────────────
    const totalUsers    = users.length;
    const totalStudents = users.filter((u) => u.role === "Student").length;
    const totalSupervisors = users.filter((u) => u.role === "Supervisor").length;
    const pendingCount  = requests.filter((r) => r.status === "Pending").length;
    const approvedCount = requests.filter((r) => r.status === "Approved").length;

    // last 5 users sorted by createdAt desc
    const recentUsers = [...users]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    // last 5 pending requests
    const recentPending = requests
        .filter((r) => r.status === "Pending")
        .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))
        .slice(0, 5);

    // dept breakdown for completion bars
    const deptMap = {};
    users.filter((u) => u.role === "Student" && u.department).forEach((u) => {
        deptMap[u.department] = (deptMap[u.department] ?? 0) + 1;
    });
    const deptEntries = Object.entries(deptMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);
    const deptMax = deptEntries[0]?.[1] ?? 1;

    const loading = loadingUsers || loadingReqs;

    // ── alerts (dynamic) ────────────────────────────────────────────────────
    const alerts = [];
    if (pendingCount > 0)
        alerts.push({ text: `${pendingCount} pending user approval${pendingCount > 1 ? "s" : ""}`, severity: "warning" });
    if (approvedCount > 0)
        alerts.push({ text: `${approvedCount} approved registrations total`, severity: "info" });
    if (alerts.length === 0)
        alerts.push({ text: "No pending actions — all clear", severity: "info" });

    const STATS = [
        { label: "Total Users",   value: totalUsers,       sub: `${totalStudents} students`,       icon: <PeopleOutlineIcon />,               color: "#B46F4C" },
        { label: "Students",      value: totalStudents,    sub: `${totalSupervisors} supervisors`,  icon: <SchoolOutlinedIcon />,              color: "#6D8A7D" },
        { label: "Supervisors",   value: totalSupervisors, sub: `across all departments`,           icon: <SupervisorAccountOutlinedIcon />,   color: "#C49A6C" },
        { label: "Pending Reqs",  value: pendingCount,     sub: `${approvedCount} approved`,        icon: <HourglassEmptyOutlinedIcon />,      color: "#7E9FC4" },
    ];

    return (
        <Box sx={{ maxWidth: 1100 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>Control Center</Typography>
                <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>System overview — live data</Typography>
            </Box>

            {/* ── Stats ── */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {STATS.map((s) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={s.label}>
                        <StatCard {...s} loading={loading} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={2}>

                {/* ── Recent Users ── */}
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h4" sx={{ color: t.textPrimary }}>Recent Users</Typography>
                            <Button endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />} size="small"
                                onClick={() => navigate("/admin/users")}
                                sx={{ color: t.accentPrimary, fontSize: "0.8rem", textTransform: "none" }}>
                                View all
                            </Button>
                        </Stack>

                        {loadingUsers ? (
                            <Box display="flex" justifyContent="center" py={3}>
                                <CircularProgress size={24} sx={{ color: t.accentPrimary }} />
                            </Box>
                        ) : recentUsers.length === 0 ? (
                            <Typography fontSize="0.83rem" sx={{ color: t.textTertiary }}>No users found.</Typography>
                        ) : (
                            <Stack spacing={1}>
                                {recentUsers.map((u) => (
                                    <Stack key={u.id} direction="row" alignItems="center" justifyContent="space-between"
                                        sx={{
                                            p: 1.2, borderRadius: 2,
                                            border: `1px solid ${t.borderLight}`,
                                            "&:hover": { bgcolor: t.surfaceHover },
                                            transition: "background 0.15s",
                                        }}>
                                        <Stack direction="row" alignItems="center" gap={1.5}>
                                            <Avatar sx={{
                                                width: 34, height: 34,
                                                bgcolor: ROLE_CLR[u.role] ?? "#888",
                                                fontSize: "0.8rem", fontWeight: 600,
                                            }}>
                                                {avatarLetter(u.username)}
                                            </Avatar>
                                            <Box>
                                                <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: t.textPrimary }}>
                                                    {u.username}
                                                </Typography>
                                                <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>
                                                    {u.email}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                        <Stack direction="row" gap={1} alignItems="center">
                                            <Chip label={u.role} size="small" sx={{
                                                bgcolor: `${ROLE_CLR[u.role] ?? "#888"}15`,
                                                color: ROLE_CLR[u.role] ?? "#888",
                                                fontWeight: 600, fontSize: "0.68rem",
                                                textTransform: "capitalize", height: 22,
                                            }} />
                                            {u.department && (
                                                <Chip label={u.department} size="small" sx={{
                                                    bgcolor: t.borderLight,
                                                    color: t.textSecondary,
                                                    fontWeight: 500, fontSize: "0.65rem",
                                                    height: 22,
                                                }} />
                                            )}
                                            {u.isHeadOfDepartment && (
                                                <Chip label="HoD" size="small" sx={{
                                                    bgcolor: "rgba(208,137,91,0.12)",
                                                    color: "#d0895b",
                                                    fontWeight: 700, fontSize: "0.65rem",
                                                    height: 22,
                                                }} />
                                            )}
                                        </Stack>
                                    </Stack>
                                ))}
                            </Stack>
                        )}
                    </Paper>
                </Grid>

                {/* ── Right column ── */}
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Stack spacing={2}>

                        {/* Alerts */}
                        <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                            <Typography variant="h4" sx={{ color: t.textPrimary, mb: 1.5 }}>System Alerts</Typography>
                            <Stack spacing={1}>
                                {alerts.map((a, i) => (
                                    <Stack key={i} direction="row" alignItems="center" gap={1.5} sx={{
                                        p: 1.2, borderRadius: 2,
                                        bgcolor: a.severity === "warning"
                                            ? `${t.warning}10`
                                            : `${t.accentSecondary}10`,
                                        border: `1px solid ${a.severity === "warning"
                                            ? `${t.warning}30`
                                            : `${t.accentSecondary}30`}`,
                                    }}>
                                        {a.severity === "warning"
                                            ? <WarningAmberOutlinedIcon sx={{ fontSize: 17, flexShrink: 0, color: t.warning }} />
                                            : <CheckCircleOutlineIcon   sx={{ fontSize: 17, flexShrink: 0, color: t.accentSecondary }} />
                                        }
                                        <Typography sx={{ fontSize: "0.82rem", color: t.textPrimary }}>{a.text}</Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Paper>

                        {/* Quick actions */}
                        <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                            <Typography variant="h4" sx={{ color: t.textPrimary, mb: 1.5 }}>Quick Actions</Typography>
                            <Grid container spacing={1}>
                                {[
                                    { label: "Add User",      path: "/admin/users",    color: t.accentPrimary },
                                    { label: "View Requests", path: "/admin/requests", color: t.accentSecondary },
                                    { label: "Activity Logs", path: "/admin/logs",     color: t.accentTertiary },
                                    { label: "Settings",      path: "/admin/settings", color: "#7E9FC4" },
                                ].map((a) => (
                                    <Grid size={{ xs: 6 }} key={a.label}>
                                        <Button variant="outlined" fullWidth onClick={() => navigate(a.path)} sx={{
                                            borderColor: t.borderLight, color: a.color,
                                            fontSize: "0.8rem", fontWeight: 600,
                                            py: 1.2, borderRadius: 2,
                                            "&:hover": { borderColor: a.color, bgcolor: `${a.color}08` },
                                        }}>
                                            {a.label}
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>

                        {/* Students by department */}
                        <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                                <Typography variant="h4" sx={{ color: t.textPrimary }}>Students by Dept.</Typography>
                                {loadingUsers && <CircularProgress size={14} sx={{ color: t.accentPrimary }} />}
                            </Stack>
                            {deptEntries.length === 0 && !loadingUsers ? (
                                <Typography fontSize="0.8rem" sx={{ color: t.textTertiary }}>No data yet.</Typography>
                            ) : (
                                deptEntries.map(([dept, count]) => (
                                    <Box key={dept} sx={{ mb: 1.8 }}>
                                        <Stack direction="row" justifyContent="space-between" mb={0.5}>
                                            <Typography sx={{ fontSize: "0.8rem", color: t.textSecondary }} noWrap>
                                                {dept}
                                            </Typography>
                                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: t.textPrimary, ml: 1, flexShrink: 0 }}>
                                                {count}
                                            </Typography>
                                        </Stack>
                                        <LinearProgress
                                            variant="determinate"
                                            value={Math.round((count / deptMax) * 100)}
                                            sx={{
                                                bgcolor: t.borderLight,
                                                "& .MuiLinearProgress-bar": { bgcolor: t.accentPrimary },
                                            }}
                                        />
                                    </Box>
                                ))
                            )}
                        </Paper>

                        {/* Recent pending requests */}
                        {recentPending.length > 0 && (
                            <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                                    <Typography variant="h4" sx={{ color: t.textPrimary }}>Pending Requests</Typography>
                                    <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                                        onClick={() => navigate("/admin/requests")}
                                        sx={{ color: t.accentPrimary, fontSize: "0.75rem", textTransform: "none" }}>
                                        Review
                                    </Button>
                                </Stack>
                                <Stack spacing={0.8}>
                                    {recentPending.map((req) => (
                                        <Stack key={req.id} direction="row" alignItems="center" justifyContent="space-between"
                                            sx={{ p: 1, borderRadius: 1.5, border: `1px solid ${t.borderLight}` }}>
                                            <Typography sx={{ fontSize: "0.78rem", color: t.textPrimary }} noWrap>
                                                {req.universityEmail}
                                            </Typography>
                                            <Chip label="Pending" size="small" sx={{
                                                height: 20, fontSize: "0.62rem", fontWeight: 700,
                                                bgcolor: `${STATUS_CLR.Pending}18`,
                                                color: STATUS_CLR.Pending,
                                                flexShrink: 0, ml: 1,
                                            }} />
                                        </Stack>
                                    ))}
                                </Stack>
                            </Paper>
                        )}

                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}