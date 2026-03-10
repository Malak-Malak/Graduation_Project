import {
    Box, Grid, Typography, Paper, Button, Stack, Avatar, Chip, LinearProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SupervisorAccountOutlinedIcon from "@mui/icons-material/SupervisorAccountOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

const STATS = [
    { label: "Total Users", value: "342", delta: "+12 this week", up: true, icon: <PeopleOutlineIcon />, color: "#B46F4C" },
    { label: "Students", value: "318", delta: "+8 this week", up: true, icon: <SchoolOutlinedIcon />, color: "#6D8A7D" },
    { label: "Supervisors", value: "24", delta: "8 departments", up: null, icon: <SupervisorAccountOutlinedIcon />, color: "#C49A6C" },
    { label: "Active Projects", value: "48", delta: "+3 this week", up: true, icon: <AssignmentTurnedInOutlinedIcon />, color: "#7E9FC4" },
];

const RECENT_USERS = [
    { name: "Aya Abu Ghozeh", role: "student", email: "aya@ptu.edu.ps", status: "active" },
    { name: "Dr. Thaer Sammar", role: "supervisor", email: "thaer@ptu.edu.ps", status: "active" },
    { name: "Hanan Awad", role: "student", email: "hanan@ptu.edu.ps", status: "active" },
    { name: "Omar Jawad", role: "student", email: "omar@ptu.edu.ps", status: "pending" },
    { name: "Dr. Layla Hassan", role: "supervisor", email: "layla@ptu.edu.ps", status: "leave" },
];

const ALERTS = [
    { text: "4 pending user approvals", severity: "warning" },
    { text: "CodeCraft group behind schedule", severity: "error" },
    { text: "System backup due tomorrow", severity: "info" },
];

const ROLE_CLR = { student: "#B46F4C", supervisor: "#6D8A7D", admin: "#C47E7E" };
const STATUS_CLR = { active: "#6D8A7D", pending: "#C49A6C", leave: "#9AA9B9" };
const STATUS_LBL = { active: "Active", pending: "Pending", leave: "On Leave" };

function StatCard({ s }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    return (
        <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, position: "relative", overflow: "hidden", bgcolor: theme.palette.background.paper }}>
            <Box sx={{ position: "absolute", top: -20, right: -20, width: 90, height: 90, borderRadius: "50%", bgcolor: `${s.color}10` }} />
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                <Box>
                    <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: t.textTertiary, textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.5 }}>
                        {s.label}
                    </Typography>
                    <Typography sx={{ fontSize: "2rem", fontWeight: 700, color: t.textPrimary, lineHeight: 1.1 }}>{s.value}</Typography>
                    <Stack direction="row" alignItems="center" gap={0.5} mt={0.5}>
                        {s.up === true && <TrendingUpIcon sx={{ fontSize: 13, color: t.success }} />}
                        <Typography sx={{ fontSize: "0.72rem", color: s.up ? t.success : t.textTertiary }}>{s.delta}</Typography>
                    </Stack>
                </Box>
                <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: `${s.color}15`, color: s.color, "& svg": { fontSize: 22 } }}>{s.icon}</Box>
            </Stack>
        </Paper>
    );
}

export default function AdminDashboard() {
    const theme = useTheme();
    const navigate = useNavigate();
    const t = theme.palette.custom;

    return (
        <Box sx={{ maxWidth: 1100 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>Control Center</Typography>
                <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>System overview — Spring 2025</Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                {STATS.map((s) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={s.label}>
                        <StatCard s={s} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={2}>
                {/* Recent users */}
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h4" sx={{ color: t.textPrimary }}>Recent Users</Typography>
                            <Button endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />} size="small" onClick={() => navigate("/admin/users")}
                                sx={{ color: t.accentPrimary, fontSize: "0.8rem", textTransform: "none" }}>View all</Button>
                        </Stack>
                        <Stack spacing={1}>
                            {RECENT_USERS.map((u) => (
                                <Stack key={u.email} direction="row" alignItems="center" justifyContent="space-between"
                                    sx={{ p: 1.2, borderRadius: 2, border: `1px solid ${t.borderLight}`, "&:hover": { bgcolor: t.surfaceHover }, transition: "background 0.15s" }}>
                                    <Stack direction="row" alignItems="center" gap={1.5}>
                                        <Avatar sx={{ width: 34, height: 34, bgcolor: ROLE_CLR[u.role], fontSize: "0.8rem", fontWeight: 600 }}>{u.name.charAt(0)}</Avatar>
                                        <Box>
                                            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: t.textPrimary }}>{u.name}</Typography>
                                            <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>{u.email}</Typography>
                                        </Box>
                                    </Stack>
                                    <Stack direction="row" gap={1}>
                                        <Chip label={u.role} size="small" sx={{ bgcolor: `${ROLE_CLR[u.role]}15`, color: ROLE_CLR[u.role], fontWeight: 600, fontSize: "0.68rem", textTransform: "capitalize", height: 22 }} />
                                        <Chip label={STATUS_LBL[u.status]} size="small" sx={{ bgcolor: `${STATUS_CLR[u.status]}18`, color: STATUS_CLR[u.status], fontWeight: 600, fontSize: "0.68rem", height: 22 }} />
                                    </Stack>
                                </Stack>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>

                {/* Right column */}
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Stack spacing={2}>
                        {/* Alerts */}
                        <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                            <Typography variant="h4" sx={{ color: t.textPrimary, mb: 1.5 }}>System Alerts</Typography>
                            <Stack spacing={1}>
                                {ALERTS.map((a, i) => (
                                    <Stack key={i} direction="row" alignItems="center" gap={1.5}
                                        sx={{
                                            p: 1.2, borderRadius: 2,
                                            bgcolor: a.severity === "error" ? `${t.error}10` : a.severity === "warning" ? `${t.warning}10` : `${t.accentSecondary}10`,
                                            border: `1px solid ${a.severity === "error" ? `${t.error}30` : a.severity === "warning" ? `${t.warning}30` : `${t.accentSecondary}30`}`,
                                        }}>
                                        <WarningAmberOutlinedIcon sx={{ fontSize: 17, flexShrink: 0, color: a.severity === "error" ? t.error : a.severity === "warning" ? t.warning : t.accentSecondary }} />
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
                                    { label: "Add User", path: "/admin/users", color: t.accentPrimary },
                                    { label: "View Reports", path: "/admin/reports", color: t.accentSecondary },
                                    { label: "Activity Logs", path: "/admin/logs", color: t.accentTertiary },
                                    { label: "Settings", path: "/admin/settings", color: "#7E9FC4" },
                                ].map((a) => (
                                    <Grid size={{ xs: 6 }} key={a.label}>
                                        <Button variant="outlined" fullWidth onClick={() => navigate(a.path)}
                                            sx={{ borderColor: t.borderLight, color: a.color, fontSize: "0.8rem", fontWeight: 600, py: 1.2, borderRadius: 2, "&:hover": { borderColor: a.color, bgcolor: `${a.color}08` } }}>
                                            {a.label}
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>

                        {/* Dept completion */}
                        <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                            <Typography variant="h4" sx={{ color: t.textPrimary, mb: 1.5 }}>Project Completion</Typography>
                            {[
                                { dept: "Computer Systems", pct: 72 },
                                { dept: "Electrical Eng.", pct: 58 },
                                { dept: "Civil Eng.", pct: 85 },
                            ].map((d) => (
                                <Box key={d.dept} sx={{ mb: 1.8 }}>
                                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                                        <Typography sx={{ fontSize: "0.8rem", color: t.textSecondary }}>{d.dept}</Typography>
                                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: t.textPrimary }}>{d.pct}%</Typography>
                                    </Stack>
                                    <LinearProgress variant="determinate" value={d.pct}
                                        sx={{ bgcolor: t.borderLight, "& .MuiLinearProgress-bar": { bgcolor: t.accentPrimary } }} />
                                </Box>
                            ))}
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}