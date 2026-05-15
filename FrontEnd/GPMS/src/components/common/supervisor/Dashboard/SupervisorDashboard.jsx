// src/components/common/supervisor/Dashboard/SupervisorDashboard.jsx

import { useEffect, useState } from "react";
import {
    Box, Grid, Typography, Paper, Stack, Avatar, Chip, Button,
    LinearProgress, AvatarGroup, CircularProgress, Skeleton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";

import { useAuth } from "../../../../contexts/AuthContext";
import {
    getPendingTeamRequests,
    getSupervisorTeams,
} from "../../../../api/handler/endpoints/supervisorApi";

// ── helpers ───────────────────────────────────────────────────────────────────

const PALETTE = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8", "#C47E7E"];
const avatarBg = (name = "") => PALETTE[(name?.charCodeAt(0) ?? 0) % PALETTE.length];
const initials = (name = "") =>
    (name || "?").split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

/** Derive a stable-ish progress % from team data (placeholder until real endpoint exists) */
const deriveProgress = (team) => {
    // If the backend ever adds a progress field, use it directly.
    if (typeof team.progress === "number") return team.progress;
    // Fallback: hash the team id into 20–90 range so it's stable, not random.
    return 20 + ((team.id * 37) % 71);
};

/** Map backend status → risk label */
const deriveRisk = (team) => {
    if (team.risk) return team.risk;
    const s = (team.status ?? "").toLowerCase();
    if (s === "active") return "low";
    if (s === "inactive") return "high";
    return "medium";
};

const RISK_COLOR = { low: "#6D8A7D", medium: "#C49A6C", high: "#C47E7E" };

// ── TeamCard ──────────────────────────────────────────────────────────────────

function TeamCard({ team, onClick, t, theme }) {
    const progress = deriveProgress(team);
    const risk = deriveRisk(team);
    const members = Array.isArray(team.members) ? team.members : [];

    return (
        <Box
            onClick={onClick}
            sx={{
                p: 2, borderRadius: 2.5,
                border: `1px solid ${t.borderLight}`,
                cursor: "pointer",
                transition: "background 0.15s, box-shadow 0.15s",
                "&:hover": { bgcolor: t.surfaceHover, boxShadow: theme.shadows[1] },
            }}
        >
            {/* Top row */}
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={1}>
                <Box sx={{ minWidth: 0, flex: 1, mr: 1 }}>
                    <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                        <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: t.textPrimary }}>
                            {team.projectTitle ?? `Team #${team.id}`}
                        </Typography>
                        <Chip
                            label={risk}
                            size="small"
                            sx={{
                                bgcolor: `${RISK_COLOR[risk]}18`,
                                color: RISK_COLOR[risk],
                                fontWeight: 600, fontSize: "0.65rem",
                                height: 20, textTransform: "capitalize",
                            }}
                        />
                    </Stack>
                    {team.projectDescription?.trim() && (
                        <Typography
                            sx={{
                                fontSize: "0.76rem", color: t.textSecondary, mt: 0.3,
                                overflow: "hidden", textOverflow: "ellipsis",
                                display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical",
                            }}
                        >
                            {team.projectDescription}
                        </Typography>
                    )}
                </Box>

                {/* Member avatars */}
                {members.length > 0 && (
                    <AvatarGroup
                        max={4}
                        sx={{ "& .MuiAvatar-root": { width: 26, height: 26, fontSize: "0.62rem", fontWeight: 700 } }}
                    >
                        {members.map((m, i) => {
                            const name = m?.name ?? m?.fullName ?? m?.username ?? String(m);
                            return (
                                <Avatar key={i} sx={{ bgcolor: avatarBg(name) }}>
                                    {initials(name)}
                                </Avatar>
                            );
                        })}
                    </AvatarGroup>
                )}

                {members.length === 0 && (
                    <Stack direction="row" alignItems="center" gap={0.5}
                        sx={{ px: 1, py: 0.4, borderRadius: 1.5, bgcolor: `${t.textTertiary}10` }}>
                        <PeopleOutlinedIcon sx={{ fontSize: 13, color: t.textTertiary }} />
                        <Typography sx={{ fontSize: "0.65rem", color: t.textTertiary }}>No members</Typography>
                    </Stack>
                )}
            </Stack>

            {/* Progress bar */}
            <Stack direction="row" justifyContent="space-between" mb={0.4}>
                <Typography sx={{ fontSize: "0.7rem", color: t.textTertiary }}>Progress</Typography>
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: t.textPrimary }}>{progress}%</Typography>
            </Stack>
            <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                    borderRadius: 4, height: 5,
                    bgcolor: t.borderLight,
                    "& .MuiLinearProgress-bar": { bgcolor: RISK_COLOR[risk], borderRadius: 4 },
                }}
            />

            {/* Member names — subtle single line */}
            {members.length > 0 && (
                <Typography
                    sx={{
                        mt: 1, fontSize: "0.68rem", color: t.textTertiary,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}
                >
                    {members
                        .map((m) => m?.name ?? m?.fullName ?? m?.username ?? "")
                        .filter(Boolean)
                        .join(" · ")}
                </Typography>
            )}
        </Box>
    );
}

// ── TeamCard skeleton ─────────────────────────────────────────────────────────

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

// ── Main component ────────────────────────────────────────────────────────────

export default function SupervisorDashboard() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useAuth();
    const t = theme.palette.custom;

    // ── pending requests count (real API) ─────────────────────────────────────
    const [pendingCount, setPendingCount] = useState(null);
    const [pendingLoading, setPendingLoading] = useState(true);

    // ── teams (real API) ──────────────────────────────────────────────────────
    const [teams, setTeams] = useState([]);
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [teamsError, setTeamsError] = useState(null);

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
    }, []);

    // ── stat cards ────────────────────────────────────────────────────────────
    const STATS = [
        {
            label: "My Groups",
            value: teamsLoading ? null : String(teams.length),
            icon: <GroupsOutlinedIcon />,
            color: "#B46F4C",
            path: "/supervisor/groups",
        },
        {
            label: "Pending Requests",
            value: pendingLoading ? null : String(pendingCount ?? "—"),
            icon: <PendingActionsOutlinedIcon />,
            color: "#C49A6C",
            path: "/supervisor/requests",
        },
        {
            label: "Files to Review",
            value: "—",
            icon: <FolderOutlinedIcon />,
            color: "#6D8A7D",
            path: "/supervisor/files",
        },
        {
            label: "Meetings This Wk",
            value: "—",
            icon: <CalendarMonthOutlinedIcon />,
            color: "#7E9FC4",
            path: "/supervisor/meetings",
        },
    ];

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <Box sx={{ maxWidth: 1200 }}>

            {/* Welcome */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h2" sx={{ mb: 0.5 }}>
                    <Box component="span" sx={{ color: t.textPrimary }}>Welcome, </Box>
                    <Box
                        component="span"
                        sx={{
                            background: "linear-gradient(90deg, #6D8A7D, #9EC4B5)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
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
                        <Paper
                            elevation={1}
                            onClick={() => navigate(s.path)}
                            sx={{
                                p: 2, borderRadius: 3, cursor: "pointer",
                                bgcolor: theme.palette.background.paper,
                                transition: "all 0.2s",
                                "&:hover": { transform: "translateY(-2px)" },
                            }}
                        >
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
                                        <Typography sx={{
                                            fontSize: "1.6rem", fontWeight: 700,
                                            color: t.textPrimary, lineHeight: 1,
                                        }}>
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

                {/* ── Teams list ── */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h4" sx={{ color: t.textPrimary }}>My Groups</Typography>
                            <Button
                                endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
                                size="small"
                                onClick={() => navigate("/supervisor/groups")}
                                sx={{ color: t.accentPrimary, fontSize: "0.8rem", textTransform: "none" }}
                            >
                                View all
                            </Button>
                        </Stack>

                        {/* Loading skeletons */}
                        {teamsLoading && (
                            <Stack spacing={1.5}>
                                {[1, 2, 3].map((i) => <TeamCardSkeleton key={i} />)}
                            </Stack>
                        )}

                        {/* Error */}
                        {!teamsLoading && teamsError && (
                            <Box sx={{ py: 4, textAlign: "center" }}>
                                <Typography sx={{ color: t.textTertiary, fontSize: "0.85rem" }}>
                                    {teamsError}
                                </Typography>
                            </Box>
                        )}

                        {/* Empty */}
                        {!teamsLoading && !teamsError && teams.length === 0 && (
                            <Box sx={{ py: 6, textAlign: "center" }}>
                                <GroupsOutlinedIcon sx={{ fontSize: 40, color: t.textTertiary, mb: 1 }} />
                                <Typography sx={{ color: t.textSecondary, fontSize: "0.88rem" }}>
                                    No teams assigned yet.
                                </Typography>
                            </Box>
                        )}

                        {/* Team cards — show max 4 on dashboard */}
                        {!teamsLoading && !teamsError && teams.length > 0 && (
                            <Stack spacing={1.5}>
                                {teams.slice(0, 4).map((team) => (
                                    <TeamCard
                                        key={team.id}
                                        team={team}
                                        onClick={() => navigate("/supervisor/groups")}
                                        t={t}
                                        theme={theme}
                                    />
                                ))}
                            </Stack>
                        )}
                    </Paper>
                </Grid>

                {/* ── Alerts + Quick Actions ── */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Stack spacing={2}>

                        {/* Alerts */}
                        <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                            <Typography variant="h4" sx={{ color: t.textPrimary, mb: 1.5 }}>Alerts</Typography>
                            <Stack spacing={1}>
                                {[
                                    { text: "7 files awaiting your review", sev: "info" },
                                    { text: "Some teams have no recent activity", sev: "warning" },
                                    { text: "Pending appointment requests", sev: "info" },
                                ].map((a, i) => (
                                    <Stack
                                        key={i}
                                        direction="row" gap={1.5} alignItems="center"
                                        sx={{
                                            p: 1.2, borderRadius: 2,
                                            bgcolor: a.sev === "error"
                                                ? `${t.error}10`
                                                : a.sev === "warning"
                                                    ? `${t.warning ?? "#C49A6C"}10`
                                                    : `${t.accentSecondary ?? t.accentPrimary}10`,
                                            border: `1px solid ${a.sev === "error"
                                                ? `${t.error}30`
                                                : a.sev === "warning"
                                                    ? `${t.warning ?? "#C49A6C"}30`
                                                    : `${t.accentSecondary ?? t.accentPrimary}30`}`,
                                        }}
                                    >
                                        <WarningAmberOutlinedIcon sx={{
                                            fontSize: 16, flexShrink: 0,
                                            color: a.sev === "error"
                                                ? t.error
                                                : a.sev === "warning"
                                                    ? (t.warning ?? "#C49A6C")
                                                    : (t.accentSecondary ?? t.accentPrimary),
                                        }} />
                                        <Typography sx={{ fontSize: "0.82rem", color: t.textPrimary }}>
                                            {a.text}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
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
                                    <Button
                                        key={a.label}
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => navigate(a.path)}
                                        sx={{
                                            borderColor: t.borderLight,
                                            color: a.color,
                                            fontSize: "0.8rem",
                                            fontWeight: 600,
                                            justifyContent: "flex-start",
                                            textTransform: "none",
                                            "&:hover": { borderColor: a.color, bgcolor: `${a.color}08` },
                                        }}
                                    >
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