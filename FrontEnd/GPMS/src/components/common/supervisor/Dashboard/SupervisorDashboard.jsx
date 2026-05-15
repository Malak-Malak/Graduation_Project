// src/components/common/supervisor/Dashboard/SupervisorDashboard.jsx

import { useEffect, useState } from "react";
import {
    Box, Grid, Typography, Paper, Stack, Avatar, Chip, Button,
    LinearProgress, AvatarGroup, CircularProgress, Skeleton, Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";

import { useAuth } from "../../../../contexts/AuthContext";
import {
    getPendingTeamRequests,
    getSupervisorTeams,
} from "../../../../api/handler/endpoints/supervisorApi";
import { notificationApi } from "../../../../api/handler/endpoints/notificationApi";

// ── helpers ───────────────────────────────────────────────────────────────────

const PALETTE = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8", "#C47E7E"];
const avatarBg = (name = "") => PALETTE[(name?.charCodeAt(0) ?? 0) % PALETTE.length];
const initials = (name = "") =>
    (name || "?").split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

const deriveProgress = (team) => {
    if (typeof team.progress === "number") return team.progress;
    return 20 + ((team.id * 37) % 71);
};

const deriveRisk = (team) => {
    if (team.risk) return team.risk;
    const s = (team.status ?? "").toLowerCase();
    if (s === "active") return "low";
    if (s === "inactive") return "high";
    return "medium";
};

const RISK_COLOR = { low: "#6D8A7D", medium: "#C49A6C", high: "#C47E7E" };

const fmtDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const diff = Math.floor((Date.now() - d) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

// Map notification title → icon + accent color
const getNotifMeta = (title = "") => {
    const t = title.toLowerCase();
    if (t.includes("appointment") && t.includes("approv"))
        return { icon: <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 15 }} />, color: "#6D8A7D" };
    if (t.includes("appointment") && t.includes("reject"))
        return { icon: <CancelOutlinedIcon sx={{ fontSize: 15 }} />, color: "#C47E7E" };
    if (t.includes("appointment") || t.includes("discussion"))
        return { icon: <CalendarTodayOutlinedIcon sx={{ fontSize: 15 }} />, color: "#7E9FC4" };
    if (t.includes("team"))
        return { icon: <GroupAddOutlinedIcon sx={{ fontSize: 15 }} />, color: "#C49A6C" };
    if (t.includes("feedback"))
        return { icon: <FolderOpenOutlinedIcon sx={{ fontSize: 15 }} />, color: "#9B7EC8" };
    if (t.includes("reply"))
        return { icon: <ReplyOutlinedIcon sx={{ fontSize: 15 }} />, color: "#B46F4C" };
    if (t.includes("rescheduled"))
        return { icon: <EventOutlinedIcon sx={{ fontSize: 15 }} />, color: "#7E9FC4" };
    return { icon: <NotificationsNoneOutlinedIcon sx={{ fontSize: 15 }} />, color: "#9E9E9E" };
};

// ── NotificationItem ──────────────────────────────────────────────────────────

function NotificationItem({ notif, t }) {
    const { icon, color } = getNotifMeta(notif.title);
    const isUnread = !notif.isRead;

    return (
        <Stack direction="row" gap={1.5} alignItems="flex-start" sx={{
            px: 2, py: 1.4,
            bgcolor: isUnread ? `${color}07` : "transparent",
            "&:hover": { bgcolor: `${color}0D` },
            transition: "background 0.15s",
        }}>
            {/* Icon */}
            <Box sx={{
                width: 30, height: 30, borderRadius: 2, flexShrink: 0,
                bgcolor: `${color}15`, color,
                display: "flex", alignItems: "center", justifyContent: "center",
                mt: 0.2,
            }}>
                {icon}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                    <Typography sx={{
                        fontSize: "0.8rem",
                        fontWeight: isUnread ? 700 : 500,
                        color: t.textPrimary,
                        lineHeight: 1.3,
                    }}>
                        {notif.title}
                    </Typography>
                    <Typography sx={{ fontSize: "0.63rem", color: t.textTertiary, flexShrink: 0, mt: 0.1 }}>
                        {fmtDate(notif.createdAt)}
                    </Typography>
                </Stack>
                {notif.message && (
                    <Typography sx={{
                        fontSize: "0.74rem", color: t.textSecondary,
                        mt: 0.3, lineHeight: 1.45,
                        overflow: "hidden", textOverflow: "ellipsis",
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    }}>
                        {notif.message}
                    </Typography>
                )}
            </Box>

            {/* Unread dot */}
            {isUnread && (
                <Box sx={{
                    width: 7, height: 7, borderRadius: "50%",
                    bgcolor: color, flexShrink: 0, mt: 0.9,
                }} />
            )}
        </Stack>
    );
}

// ── TeamCard ──────────────────────────────────────────────────────────────────

function TeamCard({ team, onClick, t, theme }) {
    const progress = deriveProgress(team);
    const risk = deriveRisk(team);
    const members = Array.isArray(team.members) ? team.members : [];

    return (
        <Box onClick={onClick} sx={{
            p: 2, borderRadius: 2.5,
            border: `1px solid ${t.borderLight}`,
            cursor: "pointer",
            transition: "background 0.15s, box-shadow 0.15s",
            "&:hover": { bgcolor: t.surfaceHover, boxShadow: theme.shadows[1] },
        }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={1}>
                <Box sx={{ minWidth: 0, flex: 1, mr: 1 }}>
                    <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                        <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: t.textPrimary }}>
                            {team.projectTitle ?? `Team #${team.id}`}
                        </Typography>
                        <Chip label={risk} size="small" sx={{
                            bgcolor: `${RISK_COLOR[risk]}18`, color: RISK_COLOR[risk],
                            fontWeight: 600, fontSize: "0.65rem", height: 20, textTransform: "capitalize",
                        }} />
                    </Stack>
                    {team.projectDescription?.trim() && (
                        <Typography sx={{
                            fontSize: "0.76rem", color: t.textSecondary, mt: 0.3,
                            overflow: "hidden", textOverflow: "ellipsis",
                            display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical",
                        }}>
                            {team.projectDescription}
                        </Typography>
                    )}
                </Box>

                {members.length > 0 ? (
                    <AvatarGroup max={4} sx={{ "& .MuiAvatar-root": { width: 26, height: 26, fontSize: "0.62rem", fontWeight: 700 } }}>
                        {members.map((m, i) => {
                            const name = m?.name ?? m?.fullName ?? m?.username ?? String(m);
                            return <Avatar key={i} sx={{ bgcolor: avatarBg(name) }}>{initials(name)}</Avatar>;
                        })}
                    </AvatarGroup>
                ) : (
                    <Stack direction="row" alignItems="center" gap={0.5}
                        sx={{ px: 1, py: 0.4, borderRadius: 1.5, bgcolor: `${t.textTertiary}10` }}>
                        <PeopleOutlinedIcon sx={{ fontSize: 13, color: t.textTertiary }} />
                        <Typography sx={{ fontSize: "0.65rem", color: t.textTertiary }}>No members</Typography>
                    </Stack>
                )}
            </Stack>

            <Stack direction="row" justifyContent="space-between" mb={0.4}>
                <Typography sx={{ fontSize: "0.7rem", color: t.textTertiary }}>Progress</Typography>
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: t.textPrimary }}>{progress}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={progress} sx={{
                borderRadius: 4, height: 5, bgcolor: t.borderLight,
                "& .MuiLinearProgress-bar": { bgcolor: RISK_COLOR[risk], borderRadius: 4 },
            }} />

            {members.length > 0 && (
                <Typography sx={{
                    mt: 1, fontSize: "0.68rem", color: t.textTertiary,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                    {members.map((m) => m?.name ?? m?.fullName ?? m?.username ?? "").filter(Boolean).join(" · ")}
                </Typography>
            )}
        </Box>
    );
}

function TeamCardSkeleton() {
    return (
        <Box sx={{ p: 2, borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
            <Stack direction="row" justifyContent="space-between" mb={1}>
                <Box sx={{ flex: 1, mr: 1 }}>
                    <Skeleton width="55%" height={20} />
                    <Skeleton width="80%" height={16} sx={{ mt: 0.5 }} />
                </Box>
                <Skeleton variant="circular" width={26} height={26} />
            </Stack>
            <Skeleton width="100%" height={8} sx={{ borderRadius: 4 }} />
        </Box>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SupervisorDashboard() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useAuth();
    const t = theme.palette.custom;

    const [pendingCount, setPendingCount] = useState(null);
    const [pendingLoading, setPendingLoading] = useState(true);
    const [teams, setTeams] = useState([]);
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [teamsError, setTeamsError] = useState(null);
    const [notifs, setNotifs] = useState([]);
    const [notifsLoading, setNotifsLoading] = useState(true);

    useEffect(() => {
        // Pending requests
        getPendingTeamRequests()
            .then((raw) => {
                const count = Array.isArray(raw)
                    ? raw.length
                    : ((raw.teamRequests?.length ?? 0) + (raw.leaveRequests?.length ?? 0));
                setPendingCount(count);
            })
            .catch(() => setPendingCount("—"))
            .finally(() => setPendingLoading(false));

        // Teams
        getSupervisorTeams()
            .then((data) => setTeams(Array.isArray(data) ? data : []))
            .catch((err) => setTeamsError(err?.message ?? "Failed to load teams."))
            .finally(() => setTeamsLoading(false));

        // Notifications — latest 3 only
        notificationApi.getMyNotifications()
            .then((res) => {
                const list = Array.isArray(res.data) ? res.data : [];
                setNotifs(list.slice(0, 3));
            })
            .catch(() => setNotifs([]))
            .finally(() => setNotifsLoading(false));
    }, []);

    const STATS = [
        {
            label: "My Groups",
            value: teamsLoading ? null : String(teams.length),
            icon: <GroupsOutlinedIcon />, color: "#B46F4C",
            path: "/supervisor/groups",
        },
        {
            label: "Pending Requests",
            value: pendingLoading ? null : String(pendingCount ?? "—"),
            icon: <PendingActionsOutlinedIcon />, color: "#C49A6C",
            path: "/supervisor/requests",
        },
        {
            label: "Files to Review",
            value: "—",
            icon: <FolderOutlinedIcon />, color: "#6D8A7D",
            path: "/supervisor/files",
        },
        {
            label: "Meetings This Wk",
            value: "—",
            icon: <CalendarMonthOutlinedIcon />, color: "#7E9FC4",
            path: "/supervisor/meetings",
        },
    ];

    return (
        <Box sx={{ maxWidth: 1200 }}>

            {/* Welcome */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h2" sx={{ mb: 0.5 }}>
                    <Box component="span" sx={{ color: t.textPrimary }}>Welcome, </Box>
                    <Box component="span" sx={{
                        background: "linear-gradient(90deg, #6D8A7D, #9EC4B5)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}>
                        {user?.name ?? user?.fullName ?? user?.username ?? "Supervisor"}
                    </Box>
                </Typography>
                <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                    {user?.department ?? "Computer Systems Engineering"} · Spring 2025
                </Typography>
            </Box>

            {/* Stat cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {STATS.map((s) => (
                    <Grid size={{ xs: 6, lg: 3 }} key={s.label}>
                        <Paper elevation={1} onClick={() => navigate(s.path)} sx={{
                            p: 2, borderRadius: 3, cursor: "pointer",
                            bgcolor: theme.palette.background.paper,
                            transition: "all 0.2s",
                            "&:hover": { transform: "translateY(-2px)" },
                        }}>
                            <Stack direction="row" alignItems="center" gap={1.5}>
                                <Box sx={{
                                    p: 1, borderRadius: 2,
                                    bgcolor: `${s.color}15`, color: s.color,
                                    "& svg": { fontSize: 20 },
                                }}>
                                    {s.icon}
                                </Box>
                                <Box>
                                    {s.value === null ? (
                                        <CircularProgress size={20} sx={{ color: s.color }} />
                                    ) : (
                                        <Typography sx={{ fontSize: "1.6rem", fontWeight: 700, color: t.textPrimary, lineHeight: 1 }}>
                                            {s.value}
                                        </Typography>
                                    )}
                                    <Typography sx={{ fontSize: "0.7rem", color: t.textTertiary, mt: 0.3 }}>
                                        {s.label}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Groups + sidebar */}
            <Grid container spacing={2}>

                {/* Teams */}
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

                        {teamsLoading && (
                            <Stack spacing={1.5}>
                                {[1, 2, 3].map((i) => <TeamCardSkeleton key={i} />)}
                            </Stack>
                        )}
                        {!teamsLoading && teamsError && (
                            <Box sx={{ py: 4, textAlign: "center" }}>
                                <Typography sx={{ color: t.textTertiary, fontSize: "0.85rem" }}>{teamsError}</Typography>
                            </Box>
                        )}
                        {!teamsLoading && !teamsError && teams.length === 0 && (
                            <Box sx={{ py: 6, textAlign: "center" }}>
                                <GroupsOutlinedIcon sx={{ fontSize: 40, color: t.textTertiary, mb: 1 }} />
                                <Typography sx={{ color: t.textSecondary, fontSize: "0.88rem" }}>No teams assigned yet.</Typography>
                            </Box>
                        )}
                        {!teamsLoading && !teamsError && teams.length > 0 && (
                            <Stack spacing={1.5}>
                                {teams.slice(0, 4).map((team) => (
                                    <TeamCard key={team.id} team={team}
                                        onClick={() => navigate("/supervisor/groups")}
                                        t={t} theme={theme} />
                                ))}
                            </Stack>
                        )}
                    </Paper>
                </Grid>

                {/* Notifications + Quick Actions */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Stack spacing={2}>

                        {/* Recent Notifications */}
                        <Paper elevation={1} sx={{
                            borderRadius: 3,
                            bgcolor: theme.palette.background.paper,
                            overflow: "hidden",
                        }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center"
                                sx={{ px: 2.5, pt: 2, pb: 1.5, borderBottom: `1px solid ${t.borderLight}` }}>
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <NotificationsNoneOutlinedIcon sx={{ fontSize: 17, color: t.accentPrimary }} />
                                    <Typography variant="h4" sx={{ color: t.textPrimary }}>Recent</Typography>
                                </Stack>
                                <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
                                    sx={{ fontSize: "0.72rem", color: t.accentPrimary, textTransform: "none", minWidth: 0 }}>
                                    All
                                </Button>
                            </Stack>

                            {notifsLoading && (
                                <Box sx={{ py: 3, display: "flex", justifyContent: "center" }}>
                                    <CircularProgress size={22} sx={{ color: t.accentPrimary }} />
                                </Box>
                            )}

                            {!notifsLoading && notifs.length === 0 && (
                                <Box sx={{ py: 5, textAlign: "center" }}>
                                    <NotificationsNoneOutlinedIcon sx={{ fontSize: 34, color: t.textTertiary, mb: 1 }} />
                                    <Typography sx={{ fontSize: "0.82rem", color: t.textSecondary }}>
                                        No notifications yet
                                    </Typography>
                                </Box>
                            )}

                            {!notifsLoading && notifs.length > 0 && (
                                <Stack divider={<Divider sx={{ borderColor: `${t.borderLight}80` }} />}>
                                    {notifs.map((n) => (
                                        <NotificationItem key={n.id} notif={n} t={t} />
                                    ))}
                                </Stack>
                            )}
                        </Paper>

                        {/* Quick Actions */}
                        <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                            <Typography variant="h4" sx={{ color: t.textPrimary, mb: 1.5 }}>Quick Actions</Typography>
                            <Stack spacing={1}>
                                {[
                                    { label: "Pending Requests", path: "/supervisor/requests", color: t.accentPrimary },
                                    { label: "Review Files", path: "/supervisor/files", color: t.accentSecondary ?? "#6D8A7D" },
                                    { label: "AI Reports", path: "/supervisor/ai-reports", color: "#9B7EC8" },
                                    { label: "My Availability", path: "/supervisor/meetings", color: t.accentTertiary ?? "#7E9FC4" },
                                ].map((a) => (
                                    <Button key={a.label} variant="outlined" fullWidth
                                        onClick={() => navigate(a.path)}
                                        sx={{
                                            borderColor: t.borderLight, color: a.color,
                                            fontSize: "0.8rem", fontWeight: 600,
                                            justifyContent: "flex-start", textTransform: "none",
                                            "&:hover": { borderColor: a.color, bgcolor: `${a.color}08` },
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