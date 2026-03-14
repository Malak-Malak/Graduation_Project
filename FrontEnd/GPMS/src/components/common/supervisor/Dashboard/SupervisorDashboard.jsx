import {
    Box, Grid, Typography, Paper, Stack, Avatar, Chip, Button, LinearProgress, AvatarGroup,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { useAuth } from "../../../../contexts/AuthContext";

const STATS = [
    { label: "My Groups", value: "4", icon: <GroupsOutlinedIcon />, color: "#B46F4C", path: "/supervisor/groups" },
    { label: "Pending Requests", value: "3", icon: <PendingActionsOutlinedIcon />, color: "#C49A6C", path: "/supervisor/requests" },
    { label: "Files to Review", value: "7", icon: <FolderOutlinedIcon />, color: "#6D8A7D", path: "/supervisor/files" },
    { label: "Meetings This Wk", value: "4", icon: <CalendarMonthOutlinedIcon />, color: "#7E9FC4", path: "/supervisor/meetings" },
];

const GROUPS = [
    { name: "EcoTrackers", project: "AI-Based Waste Management", members: ["A", "H", "M", "S"], progress: 65, risk: "low", last: "Today" },
    { name: "CodeCraft", project: "Smart Campus Navigation", members: ["O", "L", "N"], progress: 42, risk: "medium", last: "2 days ago" },
    { name: "InnovateX", project: "Blockchain Voting System", members: ["Y", "K", "R"], progress: 80, risk: "low", last: "Today" },
    { name: "SmartCampus", project: "IoT Energy Monitor", members: ["D", "F"], progress: 28, risk: "high", last: "4 days ago" },
];

const RISK_CLR = { low: "#6D8A7D", medium: "#C49A6C", high: "#C47E7E" };
const MBR_COLORS = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8", "#C47E7E"];

export default function SupervisorDashboard() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useAuth();
    const t = theme.palette.custom;

    return (
        <Box sx={{ maxWidth: 1200 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>
                    Welcome, {user?.name ?? user?.fullName ?? user?.username ?? "Supervisor"}
                </Typography>
                <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                    {user?.department ?? "Computer Systems Engineering"} · Spring 2025
                </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                {STATS.map((s) => (
                    <Grid size={{ xs: 6, lg: 3 }} key={s.label}>
                        <Paper elevation={1} onClick={() => navigate(s.path)} sx={{
                            p: 2, borderRadius: 3, cursor: "pointer",
                            bgcolor: theme.palette.background.paper,
                            "&:hover": { transform: "translateY(-2px)" }, transition: "all 0.2s",
                        }}>
                            <Stack direction="row" alignItems="center" gap={1.5}>
                                <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${s.color}15`, color: s.color, "& svg": { fontSize: 20 } }}>{s.icon}</Box>
                                <Box>
                                    <Typography sx={{ fontSize: "1.6rem", fontWeight: 700, color: t.textPrimary, lineHeight: 1 }}>{s.value}</Typography>
                                    <Typography sx={{ fontSize: "0.7rem", color: t.textTertiary, mt: 0.3 }}>{s.label}</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h4" sx={{ color: t.textPrimary }}>My Groups</Typography>
                            <Button endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />} size="small"
                                onClick={() => navigate("/supervisor/groups")}
                                sx={{ color: t.accentPrimary, fontSize: "0.8rem", textTransform: "none" }}>
                                View all
                            </Button>
                        </Stack>
                        <Stack spacing={1.5}>
                            {GROUPS.map((g) => (
                                <Box key={g.name} onClick={() => navigate("/supervisor/groups")}
                                    sx={{
                                        p: 1.8, borderRadius: 2.5, border: `1px solid ${t.borderLight}`,
                                        "&:hover": { bgcolor: t.surfaceHover }, transition: "background 0.15s", cursor: "pointer"
                                    }}>
                                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={1}>
                                        <Box>
                                            <Stack direction="row" alignItems="center" gap={1}>
                                                <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: t.textPrimary }}>{g.name}</Typography>
                                                <Chip label={g.risk} size="small"
                                                    sx={{ bgcolor: `${RISK_CLR[g.risk]}18`, color: RISK_CLR[g.risk], fontWeight: 600, fontSize: "0.65rem", height: 20, textTransform: "capitalize" }} />
                                            </Stack>
                                            <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, mt: 0.2 }}>{g.project}</Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>{g.last}</Typography>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                                        <Box sx={{ flex: 1, mr: 2 }}>
                                            <Stack direction="row" justifyContent="space-between" mb={0.4}>
                                                <Typography sx={{ fontSize: "0.7rem", color: t.textTertiary }}>Progress</Typography>
                                                <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: t.textPrimary }}>{g.progress}%</Typography>
                                            </Stack>
                                            <LinearProgress variant="determinate" value={g.progress}
                                                sx={{ bgcolor: t.borderLight, "& .MuiLinearProgress-bar": { bgcolor: RISK_CLR[g.risk] } }} />
                                        </Box>
                                        <AvatarGroup max={4} sx={{ "& .MuiAvatar-root": { width: 26, height: 26, fontSize: "0.65rem", fontWeight: 700 } }}>
                                            {g.members.map((m, j) => <Avatar key={j} sx={{ bgcolor: MBR_COLORS[j % MBR_COLORS.length] }}>{m}</Avatar>)}
                                        </AvatarGroup>
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                    <Stack spacing={2}>
                        <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                            <Typography variant="h4" sx={{ color: t.textPrimary, mb: 1.5 }}>Alerts</Typography>
                            <Stack spacing={1}>
                                {[
                                    { text: "CodeCraft: 3 overdue tasks", sev: "error" },
                                    { text: "SmartCampus: no activity 4d", sev: "warning" },
                                    { text: "7 files awaiting your review", sev: "info" },
                                ].map((a, i) => (
                                    <Stack key={i} direction="row" gap={1.5} alignItems="center"
                                        sx={{
                                            p: 1.2, borderRadius: 2,
                                            bgcolor: a.sev === "error" ? `${t.error}10` : a.sev === "warning" ? `${t.warning}10` : `${t.accentSecondary}10`,
                                            border: `1px solid ${a.sev === "error" ? `${t.error}30` : a.sev === "warning" ? `${t.warning}30` : `${t.accentSecondary}30`}`
                                        }}>
                                        <WarningAmberOutlinedIcon sx={{
                                            fontSize: 16, flexShrink: 0,
                                            color: a.sev === "error" ? t.error : a.sev === "warning" ? t.warning : t.accentSecondary
                                        }} />
                                        <Typography sx={{ fontSize: "0.82rem", color: t.textPrimary }}>{a.text}</Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Paper>
                        <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                            <Typography variant="h4" sx={{ color: t.textPrimary, mb: 1.5 }}>Quick Actions</Typography>
                            <Stack spacing={1}>
                                {[
                                    { label: "Pending Requests", path: "/supervisor/requests", color: t.accentPrimary },
                                    { label: "Review Files", path: "/supervisor/files", color: t.accentSecondary },
                                    { label: "AI Reports", path: "/supervisor/ai-reports", color: "#9B7EC8" },
                                    { label: "My Availability", path: "/supervisor/meetings", color: t.accentTertiary },
                                ].map((a) => (
                                    <Button key={a.label} variant="outlined" fullWidth onClick={() => navigate(a.path)}
                                        sx={{
                                            borderColor: t.borderLight, color: a.color, fontSize: "0.8rem", fontWeight: 600,
                                            justifyContent: "flex-start", "&:hover": { borderColor: a.color, bgcolor: `${a.color}08` }
                                        }}>
                                        {a.label}
                                    </Button>
                                ))}
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}