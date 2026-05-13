// src/components/common/supervisor/Groups/GroupsList.jsx
//
// Supervisor "My Groups" page.
//
// FIXES applied in this version:
//   • Rejected teams are filtered out of My Groups (normaliseTeams)
//   • Group cards are full-width (xs={12})
//   • projectTitle is used as the primary card label
//   • After approving a team request → groups + totals are re-fetched immediately
//
// Data sources:
//   getPendingTeamRequests()  → GET /api/Supervisor/pending-team-requests
//   getPendingLeaveRequests() → GET /api/Supervisor/leave-requests  (⚠ pending backend, falls back to [])
//   getSupervisorTeams()      → GET /api/Supervisor/my-teams
//   getSupervisorTeamById()   → GET /api/Supervisor/team/{teamId}
//   getSupervisorTotalTeams() → GET /api/Supervisor/total-teams
//   respondToTeamRequest()    → POST /api/Supervisor/respond-to-team-request
//   respondToLeaveRequest()   → POST /api/Supervisor/respond-to-leave-request
//   setMaxTeams()             → PUT  /api/Supervisor/set-max-teams

import { useState, useEffect, useCallback } from "react";
import {
    Box, Paper, Typography, Stack, Avatar, Chip, Button, LinearProgress,
    AvatarGroup, Grid, Dialog, DialogContent,
    TextField, Tabs, Tab, IconButton, Tooltip, CircularProgress,
    Snackbar, Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CloseIcon from "@mui/icons-material/Close";

import {
    getPendingTeamRequests,
    getPendingLeaveRequests,
    respondToTeamRequest,
    respondToLeaveRequest,
    setMaxTeams,
    getSupervisorTeams,
    getSupervisorTeamById,
    getSupervisorTotalTeams,
} from "../../../../api/handler/endpoints/supervisorApi";
import GroupCard from "./GroupCard";
/* ─── constants ──────────────────────────────────────────────── */
const MBR_COLORS = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8"];
const PRIMARY = "#d0895b";
const RISK_CLR = { low: "#6D8A7D", medium: "#C49A6C", high: "#C47E7E" };

const initials = (name = "") =>
    (name ?? "?")
        .split(" ").map((w) => w[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";

/* ─── normaliseRequests ──────────────────────────────────────────
 * Normalises pending request objects (team join + leave requests).
 */
const normaliseRequests = (raw) =>
    (Array.isArray(raw) ? raw : []).map((r) => ({
        teamId: r.teamId ?? r.id,
        // Use projectTitle as the main label — fall back to labelled ID
        projectTitle:
            r.projectTitle ??
            r.project ??
            r.teamName ??
            r.name ??
            (r.teamId ? `Team #${r.teamId}` : r.id ? `Team #${r.id}` : "New Team"),
        teamName:
            r.teamName ??
            r.name ??
            r.team ??
            (r.teamId ? `Team #${r.teamId}` : r.id ? `Team #${r.id}` : "New Team"),
        projectDescription: r.projectDescription ?? r.description ?? "",
        studentName:
            r.studentName ??
            r.memberName ??
            r.fullName ??
            r.leaderName ??
            r.leadName ??
            r.requestedBy ??
            (r.teamMemberId
                ? `Member #${r.teamMemberId}`
                : r.memberId
                    ? `Member #${r.memberId}`
                    : r.studentId
                        ? `Student #${r.studentId}`
                        : "Unknown Student"),
        studentId: r.studentId ?? r.userId ?? null,
        members: r.members ?? r.students ?? [],
        requestedAt: r.requestedAt ?? r.createdAt ?? null,
        type: r.type ?? "team",
        memberId: r.teamMemberId ?? r.memberId ?? null,
    }));

/* ─── normaliseTeams ─────────────────────────────────────────────
 * Normalises GET /api/Supervisor/my-teams response.
 *
 * FIX: Filters out teams with status "Rejected" — they should never
 *      appear in the supervisor's My Groups list.
 */
const normaliseTeams = (raw) =>
    (Array.isArray(raw) ? raw : [])
        // ← KEY FIX: exclude rejected teams
        .filter((t) => {
            const s = (t.status ?? t.teamStatus ?? "").toLowerCase();
            return s !== "rejected";
        })
        .map((t) => ({
            id: t.teamId ?? t.id,
            // Use projectTitle as the primary display name
            name: t.projectTitle ?? t.teamName ?? t.name ?? "Unnamed Project",
            teamName: t.teamName ?? t.name ?? null,
            projectTitle: t.projectTitle ?? t.projectName ?? "—",
            projectDescription: t.projectDescription ?? t.description ?? "",
            status: t.status ?? t.teamStatus ?? "Active",
            maxMembers: t.maxMembers ?? t.maxSize ?? 5,
            progress: t.progress ?? 0,
            risk: t.risk ?? "low",
            lastActive: t.lastActive ?? null,
            members: (t.members ?? t.students ?? []).map((m) => ({
                userId: m.userId ?? m.id,
                fullName: m.fullName ?? m.name ?? "—",
                email: m.email ?? "",
                isLeader: m.isLeader ?? m.role === "Leader" ?? false,
            })),
            tasks: {
                todo: t.tasks?.todo ?? t.todoCount ?? null,
                inProgress: t.tasks?.inProgress ?? t.inProgressCount ?? null,
                done: t.tasks?.done ?? t.doneCount ?? null,
            },
            files: {
                total: t.files?.total ?? t.filesCount ?? null,
                pending: t.files?.pending ?? t.pendingFiles ?? null,
            },
        }));

/* ─── Request row (pending) ───────────────────────────────────── */
function RequestRow({ req, onApprove, onReject, busy }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const isLeave = req.type === "leave";

    return (
        <Stack
            direction="row"
            alignItems="flex-start"
            gap={1.5}
            sx={{
                p: 1.8,
                borderRadius: 2.5,
                border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
                bgcolor: theme.palette.background.paper,
            }}
        >
            {/* type icon */}
            <Box sx={{
                width: 38, height: 38, borderRadius: 2, flexShrink: 0,
                bgcolor: isLeave ? "rgba(229,115,115,0.1)" : `${PRIMARY}12`,
                border: isLeave ? "1px solid rgba(229,115,115,0.25)" : `1px solid ${PRIMARY}28`,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                {isLeave
                    ? <ExitToAppOutlinedIcon sx={{ fontSize: 18, color: "#e57373" }} />
                    : <HowToRegOutlinedIcon sx={{ fontSize: 18, color: PRIMARY }} />
                }
            </Box>

            <Box flex={1} minWidth={0}>
                {/* title line — uses projectTitle for team requests, studentName for leave */}
                <Typography fontWeight={700} fontSize="0.86rem" noWrap
                    sx={{ color: theme.palette.text.primary }}>
                    {isLeave ? (
                        <>
                            <Box component="span" sx={{ color: "#e57373" }}>{req.studentName}</Box>
                            {" wants to leave "}
                            <Box component="span" sx={{ color: PRIMARY }}>{req.projectTitle}</Box>
                        </>
                    ) : (
                        <>
                            <Box component="span" sx={{ color: PRIMARY }}>{req.projectTitle}</Box>
                            {req.studentName && (
                                <>
                                    {" — "}
                                    <Box component="span">{req.studentName}</Box>
                                </>
                            )}
                        </>
                    )}
                </Typography>

                {/* project description */}
                {req.projectDescription && (
                    <Typography fontSize="0.75rem"
                        sx={{ color: theme.palette.text.secondary, mt: 0.3, mb: 0.5 }}>
                        {req.projectDescription}
                    </Typography>
                )}

                {/* members avatars */}
                {req.members.length > 0 && (
                    <AvatarGroup max={5} sx={{
                        justifyContent: "flex-start", mt: 0.5,
                        "& .MuiAvatar-root": { width: 22, height: 22, fontSize: "0.58rem", fontWeight: 700 },
                    }}>
                        {req.members.map((m, i) => (
                            <Tooltip key={i} title={m.fullName ?? m.name ?? "?"}>
                                <Avatar sx={{ bgcolor: MBR_COLORS[i % MBR_COLORS.length] }}>
                                    {initials(m.fullName ?? m.name ?? "?")}
                                </Avatar>
                            </Tooltip>
                        ))}
                    </AvatarGroup>
                )}

                {/* meta row */}
                <Stack direction="row" alignItems="center" gap={1} mt={0.4}>
                    {req.requestedAt && (
                        <Typography fontSize="0.68rem" sx={{ color: theme.palette.text.secondary, flexShrink: 0 }}>
                            {new Date(req.requestedAt).toLocaleDateString()}
                        </Typography>
                    )}
                </Stack>
            </Box>

            {/* approve / reject */}
            <Stack direction="row" gap={0.5} flexShrink={0}>
                <Tooltip title="Approve">
                    <IconButton size="small" disabled={busy}
                        onClick={() => onApprove(req)}
                        sx={{ color: "#3DB97A", "&:hover": { bgcolor: "rgba(61,185,122,0.1)" } }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Reject">
                    <IconButton size="small" disabled={busy}
                        onClick={() => onReject(req)}
                        sx={{ color: "#e57373", "&:hover": { bgcolor: "rgba(229,115,115,0.1)" } }}>
                        <CancelOutlinedIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Tooltip>
            </Stack>
        </Stack>
    );
}

/* ─── Group card ──────────────────────────────────────────────── */
// function GroupCard({ g, onOpenDetail, onOpenSize }) {
//     const theme = useTheme();
//     const isDark = theme.palette.mode === "dark";
//     const risk = g.risk ?? "low";

//     return (
//         <Paper
//             elevation={0}
//             onClick={() => onOpenDetail(g)}
//             sx={{
//                 p: 2.5,
//                 borderRadius: 3,
//                 cursor: "pointer",
//                 bgcolor: theme.palette.background.paper,
//                 border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
//                 transition: "all 0.18s ease",
//                 "&:hover": {
//                     transform: "translateY(-2px)",
//                     boxShadow: isDark
//                         ? "0 8px 24px rgba(0,0,0,0.3)"
//                         : "0 8px 24px rgba(0,0,0,0.08)",
//                 },
//             }}
//         >
//             {/* header */}
//             <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
//                 <Box flex={1} minWidth={0} pr={1}>
//                     <Stack direction="row" alignItems="center" gap={1} mb={0.3}>
//                         {/* project icon */}
//                         <Box sx={{
//                             width: 32, height: 32, borderRadius: "9px", flexShrink: 0,
//                             bgcolor: `${PRIMARY}12`, border: `1px solid ${PRIMARY}25`,
//                             display: "flex", alignItems: "center", justifyContent: "center",
//                         }}>
//                             <FolderOutlinedIcon sx={{ fontSize: 16, color: PRIMARY }} />
//                         </Box>

//                         {/* projectTitle as primary label */}
//                         <Typography
//                             fontSize="0.97rem"
//                             fontWeight={700}
//                             noWrap
//                             sx={{ color: theme.palette.text.primary }}
//                         >
//                             {g.name}
//                         </Typography>

//                         <Chip label={risk} size="small" sx={{
//                             bgcolor: `${RISK_CLR[risk]}18`,
//                             color: RISK_CLR[risk],
//                             fontWeight: 600,
//                             fontSize: "0.62rem",
//                             height: 19,
//                             textTransform: "capitalize",
//                             flexShrink: 0,
//                         }} />
//                     </Stack>

//                     {/* show teamName as subtitle if different from projectTitle */}
//                     {g.teamName && (
//                         <Typography fontSize="0.74rem" noWrap sx={{ color: theme.palette.text.secondary, ml: "40px" }}>
//                             {g.teamName}
//                         </Typography>
//                     )}

//                     {g.projectDescription && (
//                         <Typography
//                             fontSize="0.72rem"
//                             sx={{
//                                 color: theme.palette.text.secondary,
//                                 mt: 0.4,
//                                 ml: "40px",
//                                 display: "-webkit-box",
//                                 WebkitLineClamp: 2,
//                                 WebkitBoxOrient: "vertical",
//                                 overflow: "hidden",
//                             }}
//                         >
//                             {g.projectDescription}
//                         </Typography>
//                     )}
//                 </Box>

//                 <Tooltip title="Edit team size">
//                     <Button
//                         size="small"
//                         startIcon={<SettingsOutlinedIcon sx={{ fontSize: 13 }} />}
//                         onClick={(e) => { e.stopPropagation(); onOpenSize(g); }}
//                         sx={{
//                             fontSize: "0.7rem",
//                             color: theme.palette.text.secondary,
//                             textTransform: "none",
//                             minWidth: "auto",
//                             px: 1,
//                             py: 0.5,
//                             borderRadius: 1.5,
//                             "&:hover": { color: PRIMARY, bgcolor: `${PRIMARY}10` },
//                         }}
//                     >
//                         {g.members.length}/{g.maxMembers ?? "?"}
//                     </Button>
//                 </Tooltip>
//             </Stack>

//             {/* progress */}
//             <Box mb={1.5}>
//                 <Stack direction="row" justifyContent="space-between" mb={0.5}>
//                     <Typography fontSize="0.7rem" sx={{ color: theme.palette.text.secondary }}>
//                         Progress
//                     </Typography>
//                     <Typography fontSize="0.7rem" fontWeight={700} sx={{ color: theme.palette.text.primary }}>
//                         {g.progress ?? 0}%
//                     </Typography>
//                 </Stack>
//                 <LinearProgress
//                     variant="determinate"
//                     value={g.progress ?? 0}
//                     sx={{
//                         height: 5,
//                         borderRadius: 3,
//                         bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
//                         "& .MuiLinearProgress-bar": { bgcolor: RISK_CLR[risk], borderRadius: 3 },
//                     }}
//                 />
//             </Box>

//             {/* footer */}
//             <Stack direction="row" justifyContent="space-between" alignItems="center">
//                 <AvatarGroup max={4} sx={{
//                     "& .MuiAvatar-root": { width: 26, height: 26, fontSize: "0.62rem", fontWeight: 700 },
//                 }}>
//                     {g.members.map((m, j) => (
//                         <Tooltip key={j} title={m.fullName ?? "?"}>
//                             <Avatar sx={{ bgcolor: MBR_COLORS[j % MBR_COLORS.length] }}>
//                                 {initials(m.fullName)}
//                             </Avatar>
//                         </Tooltip>
//                     ))}
//                 </AvatarGroup>
//                 <Stack direction="row" gap={0.8}>
//                     {g.tasks?.inProgress != null && (
//                         <Chip label={`${g.tasks.inProgress} active`} size="small" sx={{
//                             bgcolor: `${PRIMARY}12`, color: PRIMARY,
//                             fontSize: "0.65rem", fontWeight: 600, height: 20,
//                         }} />
//                     )}
//                     {g.files?.pending != null && (
//                         <Chip label={`${g.files.pending} files`} size="small" sx={{
//                             bgcolor: "rgba(126,159,196,0.12)", color: "#7E9FC4",
//                             fontSize: "0.65rem", fontWeight: 600, height: 20,
//                         }} />
//                     )}
//                 </Stack>
//             </Stack>
//         </Paper>
//     );
// }

/* ═══════════════════════════════════════════════════════════════ */
/*  MAIN                                                           */
/* ═══════════════════════════════════════════════════════════════ */
export default function GroupsList() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    /* ── data ── */
    const [groups, setGroups] = useState([]);
    const [requests, setRequests] = useState([]);
    const [maxTeams, setMaxTeamsState] = useState(6);

    /* ── loading ── */
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [actionBusy, setActionBusy] = useState(false);

    /* ── detail dialog ── */
    const [selected, setSelected] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailBusy, setDetailBusy] = useState(false);
    const [tab, setTab] = useState(0);

    /* ── size dialog ── */
    const [sizeOpen, setSizeOpen] = useState(false);
    const [sizeGroup, setSizeGroup] = useState(null);
    const [sizeVal, setSizeVal] = useState(5);

    /* ── limit dialog ── */
    const [limitOpen, setLimitOpen] = useState(false);
    const [limitInput, setLimitInput] = useState(6);

    /* ── snackbar ── */
    const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
    const snap = (msg, sev = "success") => setSnack({ open: true, msg, sev });

    /* ─── fetch pending requests ─────────────────────────────── */
    const fetchRequests = useCallback(async () => {
        try {
            setLoadingRequests(true);
            const [teamData, leaveData] = await Promise.all([
                getPendingTeamRequests(),
                getPendingLeaveRequests(),
            ]);

            const teamReqs = normaliseRequests(
                Array.isArray(teamData) ? teamData : []
            ).map((r) => ({ ...r, type: "team" }));

            const leaveReqs = normaliseRequests(
                Array.isArray(leaveData) ? leaveData : []
            ).map((r) => ({ ...r, type: "leave" }));

            setRequests([...teamReqs, ...leaveReqs]);
        } catch {
            setRequests([]);
        } finally {
            setLoadingRequests(false);
        }
    }, []);

    /* ─── fetch supervised groups ─────────────────────────────── */
    const fetchGroups = useCallback(async () => {
        try {
            setLoadingGroups(true);
            const data = await getSupervisorTeams();
            // normaliseTeams already filters out Rejected teams
            setGroups(normaliseTeams(data));
        } catch {
            setGroups([]);
        } finally {
            setLoadingGroups(false);
        }
    }, []);

    /* ─── fetch total teams count + maxTeams setting ──────────── */
    const fetchTotals = useCallback(async () => {
        try {
            const data = await getSupervisorTotalTeams();
            if (data?.maxTeams != null) setMaxTeamsState(data.maxTeams);
        } catch {
            // silently fail
        }
    }, []);

    useEffect(() => {
        fetchRequests();
        fetchGroups();
        fetchTotals();
    }, [fetchRequests, fetchGroups, fetchTotals]);

    /* ─── open detail ──────────────────────────────────────────── */
    const openDetail = async (g) => {
        setSelected(g);
        setTab(0);
        setDetailOpen(true);
        try {
            setDetailBusy(true);
            const fresh = await getSupervisorTeamById(g.id);
            // normaliseTeams filters rejected, but detail is for an already-active team
            const normalised = normaliseTeams([fresh]);
            if (normalised.length > 0) setSelected(normalised[0]);
        } catch {
            // keep stale data
        } finally {
            setDetailBusy(false);
        }
    };

    /* ─── respond to team / leave request ────────────────────────
     * After approving a TEAM request → re-fetch groups + totals
     * so the new team appears immediately in My Groups.
     */
    const handleRespond = async (req, isApproved) => {
        try {
            setActionBusy(true);

            if (req.type === "leave") {
                await respondToLeaveRequest({ teamMemberId: req.memberId, isApproved });
                snap(isApproved ? "Leave request approved." : "Leave request rejected.");
            } else {
                await respondToTeamRequest({ teamId: req.teamId, isApproved });
                if (isApproved) {
                    snap(`"${req.projectTitle}" approved! ✓`);
                    // ← sync: refresh groups list + capacity counter
                    fetchGroups();
                    fetchTotals();
                } else {
                    snap(`"${req.projectTitle}" rejected.`);
                }
            }

            // always remove the request from the list after responding
            fetchRequests();
        } catch (e) {
            snap(e?.response?.data?.message ?? "Action failed.", "error");
        } finally {
            setActionBusy(false);
        }
    };

    /* ─── set supervision limit ───────────────────────────────── */
    const handleSaveLimit = async () => {
        try {
            setActionBusy(true);
            await setMaxTeams({ maxTeams: limitInput });
            setMaxTeamsState(limitInput);
            setLimitOpen(false);
            snap("Supervision limit updated.");
        } catch (e) {
            snap(e?.response?.data?.message ?? "Failed to update limit.", "error");
        } finally {
            setActionBusy(false);
        }
    };

    /* ─── open size dialog ────────────────────────────────────── */
    const openSize = (g) => {
        setSizeGroup(g);
        setSizeVal(g.maxMembers ?? 5);
        setSizeOpen(true);
    };

    /* ─── save team size (local until backend endpoint exists) ── */
    const handleSaveSize = () => {
        setGroups((prev) =>
            prev.map((g) => g.id === sizeGroup.id ? { ...g, maxMembers: sizeVal } : g)
        );
        setSizeOpen(false);
        snap("Team size updated.");
    };

    /* ─── style helpers ───────────────────────────────────────── */
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const paperBg = theme.palette.background.paper;
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: 2, fontSize: "0.875rem",
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PRIMARY },
        },
        "& .MuiInputLabel-root.Mui-focused": { color: PRIMARY },
        "& .MuiInputLabel-root": { fontSize: "0.875rem" },
    };

    const pendingCount = requests.filter((r) => r.type !== "leave").length;
    const leaveCount = requests.filter((r) => r.type === "leave").length;

    /* ═══════════════════════════════════════════════════════════
       RENDER
    ═══════════════════════════════════════════════════════════ */
    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

                {/* ── PAGE HEADER ───────────────────────────────────── */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="h2" sx={{ color: tPri, mb: 0.4 }}>My Groups</Typography>
                        <Typography sx={{ color: tSec, fontSize: "0.85rem" }}>
                            {groups.length} / {maxTeams} supervised teams
                        </Typography>
                    </Box>
                    <Stack direction="row" gap={1}>
                        <Tooltip title="Refresh">
                            <IconButton
                                size="small"
                                onClick={() => { fetchGroups(); fetchRequests(); fetchTotals(); }}
                                sx={{
                                    color: tSec,
                                    border: `1px solid ${border}`,
                                    borderRadius: 2,
                                    "&:hover": { color: PRIMARY },
                                }}
                            >
                                <RefreshOutlinedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Set max groups you can supervise">
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<TuneOutlinedIcon sx={{ fontSize: 15 }} />}
                                onClick={() => { setLimitInput(maxTeams); setLimitOpen(true); }}
                                sx={{
                                    borderColor: border,
                                    color: tSec,
                                    fontSize: "0.78rem",
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 600,
                                    "&:hover": { borderColor: PRIMARY, color: PRIMARY, bgcolor: `${PRIMARY}08` },
                                }}
                            >
                                Limit: {maxTeams}
                            </Button>
                        </Tooltip>
                    </Stack>
                </Stack>

                {/* ── CAPACITY BAR ──────────────────────────────────── */}
                <Paper elevation={0} sx={{
                    p: 2.2, borderRadius: 2.5, border: `1px solid ${border}`, bgcolor: paperBg,
                }}>
                    <Stack direction="row" justifyContent="space-between" mb={0.8}>
                        <Typography fontSize="0.75rem" fontWeight={700} sx={{ color: tSec }}>
                            Supervision Capacity
                        </Typography>
                        <Typography fontSize="0.75rem" fontWeight={700} sx={{
                            color: groups.length >= maxTeams ? "#C47E7E" : "#3DB97A",
                        }}>
                            {groups.length} / {maxTeams} groups
                        </Typography>
                    </Stack>
                    <LinearProgress
                        variant="determinate"
                        value={Math.min((groups.length / maxTeams) * 100, 100)}
                        sx={{
                            height: 6, borderRadius: 3,
                            bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
                            "& .MuiLinearProgress-bar": {
                                bgcolor: groups.length >= maxTeams ? "#C47E7E" : PRIMARY,
                                borderRadius: 3,
                            },
                        }}
                    />
                    {groups.length >= maxTeams && (
                        <Typography fontSize="0.72rem" sx={{ color: "#C47E7E", mt: 0.6 }}>
                            ⚠ You have reached your maximum supervision limit.
                        </Typography>
                    )}
                </Paper>

                {/* ── PENDING REQUESTS ──────────────────────────────── */}
                {(loadingRequests || requests.length > 0) && (
                    <Paper elevation={0} sx={{
                        borderRadius: 3,
                        border: `1px solid ${border}`,
                        bgcolor: paperBg,
                        overflow: "hidden",
                    }}>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{
                                px: 2.5, py: 1.8,
                                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                                bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                            }}
                        >
                            <Stack direction="row" alignItems="center" gap={1}>
                                <Box sx={{ color: PRIMARY }}>
                                    <HowToRegOutlinedIcon sx={{ fontSize: 18 }} />
                                </Box>
                                <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: tPri }}>
                                    Pending Requests
                                </Typography>
                                {pendingCount > 0 && (
                                    <Chip label={pendingCount} size="small" sx={{
                                        height: 18, fontSize: "0.62rem", fontWeight: 700,
                                        bgcolor: `${PRIMARY}18`, color: PRIMARY,
                                    }} />
                                )}
                                {leaveCount > 0 && (
                                    <Chip label={`${leaveCount} leave`} size="small" sx={{
                                        height: 18, fontSize: "0.62rem", fontWeight: 700,
                                        bgcolor: "rgba(229,115,115,0.12)", color: "#e57373",
                                    }} />
                                )}
                            </Stack>
                        </Stack>

                        <Stack gap={1.2} sx={{ p: 2.5 }}>
                            {loadingRequests ? (
                                <Box display="flex" justifyContent="center" py={2}>
                                    <CircularProgress size={22} sx={{ color: PRIMARY }} />
                                </Box>
                            ) : (
                                requests.map((req, i) => (
                                    <RequestRow
                                        key={`${req.type}-${req.teamId ?? i}`}
                                        req={req}
                                        busy={actionBusy}
                                        onApprove={(r) => handleRespond(r, true)}
                                        onReject={(r) => handleRespond(r, false)}
                                    />
                                ))
                            )}
                        </Stack>
                    </Paper>
                )}

                {/* ── GROUPS GRID ───────────────────────────────────── */}
                {loadingGroups ? (
                    <Box display="flex" justifyContent="center" py={6}>
                        <CircularProgress sx={{ color: PRIMARY }} />
                    </Box>
                ) : groups.length === 0 ? (
                    <Paper elevation={0} sx={{
                        p: 5, borderRadius: 3, border: `1px solid ${border}`,
                        bgcolor: paperBg, textAlign: "center",
                    }}>
                        <Box sx={{
                            width: 60, height: 60, borderRadius: 3, mx: "auto", mb: 2,
                            bgcolor: `${PRIMARY}10`, border: `1px solid ${PRIMARY}25`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <SchoolOutlinedIcon sx={{ fontSize: 28, color: PRIMARY }} />
                        </Box>
                        <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: tPri, mb: 0.5 }}>
                            No groups yet
                        </Typography>
                        <Typography fontSize="0.82rem" sx={{ color: tSec }}>
                            Groups will appear here once team requests are approved
                        </Typography>
                    </Paper>
                ) : (
                    /* FIX: xs={12} — cards are full-width, not half */
                    <Grid container spacing={2}>
                        {groups.map((g) => (
                            <Grid item xs={12} key={g.id}>
                                <GroupCard g={g} onOpenDetail={openDetail} onOpenSize={openSize} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* ══ DETAIL DIALOG ══════════════════════════════════════ */}
            {selected && (
                <Dialog
                    open={detailOpen}
                    onClose={() => setDetailOpen(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg } }}
                >
                    {/* header */}
                    <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${border}` }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box flex={1} minWidth={0} pr={1}>
                                <Stack direction="row" alignItems="center" gap={1} mb={0.3}>
                                    <Box sx={{
                                        width: 30, height: 30, borderRadius: "8px", flexShrink: 0,
                                        bgcolor: `${PRIMARY}12`, border: `1px solid ${PRIMARY}25`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <FolderOutlinedIcon sx={{ fontSize: 15, color: PRIMARY }} />
                                    </Box>
                                    <Typography fontWeight={700} fontSize="1rem" sx={{ color: tPri }}>
                                        {selected.name}
                                    </Typography>
                                    <Chip label={selected.risk ?? "low"} size="small" sx={{
                                        bgcolor: `${RISK_CLR[selected.risk ?? "low"]}18`,
                                        color: RISK_CLR[selected.risk ?? "low"],
                                        fontWeight: 600, fontSize: "0.62rem", textTransform: "capitalize",
                                    }} />
                                </Stack>
                                {selected.teamName && (
                                    <Typography fontSize="0.74rem" sx={{ color: tSec, ml: "38px" }}>
                                        {selected.teamName}
                                    </Typography>
                                )}
                                {selected.projectDescription && (
                                    <Typography fontSize="0.74rem" sx={{ color: tSec, mt: 0.5 }}>
                                        {selected.projectDescription}
                                    </Typography>
                                )}
                            </Box>
                            <IconButton size="small" onClick={() => setDetailOpen(false)} sx={{ color: tSec }}>
                                <CloseIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                        </Stack>
                    </Box>

                    {/* loading overlay */}
                    {detailBusy && (
                        <Box display="flex" justifyContent="center" py={1.5}
                            sx={{ borderBottom: `1px solid ${border}` }}>
                            <CircularProgress size={18} sx={{ color: PRIMARY }} />
                        </Box>
                    )}

                    {/* tabs */}
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
                        px: 1,
                        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                        "& .MuiTab-root": {
                            textTransform: "none", fontWeight: 600,
                            fontSize: "0.82rem", minHeight: 44, color: tSec,
                        },
                        "& .Mui-selected": { color: PRIMARY },
                        "& .MuiTabs-indicator": { bgcolor: PRIMARY, height: 2.5, borderRadius: 2 },
                    }}>
                        <Tab label="Overview" />
                        <Tab label={`Members (${(selected.members ?? []).length})`} />
                        <Tab label="Tasks" />
                    </Tabs>

                    <DialogContent sx={{ px: 3, py: 2.5 }}>

                        {/* ── Overview ── */}
                        {tab === 0 && (
                            <Stack spacing={2.5}>
                                <Box>
                                    <Typography fontSize="0.68rem" fontWeight={700} sx={{
                                        color: tSec, textTransform: "uppercase",
                                        letterSpacing: "0.08em", mb: 1,
                                    }}>Progress</Typography>
                                    <Stack direction="row" justifyContent="space-between" mb={0.6}>
                                        <Typography fontSize="0.84rem" sx={{ color: tSec }}>Completion</Typography>
                                        <Typography fontSize="0.84rem" fontWeight={700} sx={{ color: tPri }}>
                                            {"N/A"}
                                        </Typography>
                                    </Stack>
                                    <LinearProgress
                                        variant="determinate"
                                        value={0}
                                        sx={{
                                            height: 6, borderRadius: 3,
                                            bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
                                            "& .MuiLinearProgress-bar": {
                                                bgcolor: RISK_CLR[selected.risk ?? "low"], borderRadius: 3,
                                            },
                                        }}
                                    />
                                </Box>

                                {/* التغيير 1: stats grid الجديد */}
                                <Grid container spacing={1.5}>
                                    {[
                                        { label: "Members", val: (selected.members ?? []).length, color: "#6366f1" },
                                        { label: "Max Size", val: selected.maxMembers ?? "?", color: tSec },
                                    ].map((item) => (
                                        <Grid item xs={6} key={item.label}>
                                            <Box sx={{
                                                p: 1.8, borderRadius: 2.5, textAlign: "center",
                                                border: `1px solid ${border}`,
                                                bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                                            }}>
                                                <Typography fontSize="1.5rem" fontWeight={700} sx={{ color: item.color }}>
                                                    {item.val ?? "0"}
                                                </Typography>
                                                <Typography fontSize="0.7rem" sx={{ color: tSec }}>{item.label}</Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>

                                <Box sx={{
                                    p: 1.8, borderRadius: 2.5, border: `1px solid ${border}`,
                                    bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                                }}>
                                    <Typography fontSize="0.68rem" fontWeight={700} sx={{
                                        color: tSec, textTransform: "uppercase",
                                        letterSpacing: "0.08em", mb: 0.8,
                                    }}>Last Active</Typography>
                                    <Typography fontSize="0.84rem" fontWeight={600} sx={{ color: tPri }}>
                                        {selected.lastActive ?? "—"}
                                    </Typography>
                                </Box>
                            </Stack>
                        )}

                        {/* ── Members ── */}
                        {tab === 1 && (
                            <Stack spacing={1.2} sx={{ mt: 0.5 }}>
                                {(selected.members ?? []).length === 0 ? (
                                    <Typography sx={{
                                        color: tSec, fontSize: "0.84rem",
                                        textAlign: "center", mt: 3,
                                    }}>
                                        No members yet
                                    </Typography>
                                ) : (
                                    (selected.members ?? []).map((m, i) => (
                                        <Stack
                                            key={i}
                                            direction="row"
                                            alignItems="center"
                                            gap={1.5}
                                            sx={{
                                                p: 1.5, borderRadius: 2.5,
                                                border: `1px solid ${border}`,
                                                bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                                            }}
                                        >
                                            <Avatar sx={{
                                                width: 36, height: 36, fontWeight: 700,
                                                fontSize: "0.8rem",
                                                bgcolor: MBR_COLORS[i % MBR_COLORS.length],
                                            }}>
                                                {initials(m.fullName)}
                                            </Avatar>
                                            <Box flex={1} minWidth={0}>
                                                <Typography fontWeight={600} fontSize="0.86rem" noWrap sx={{ color: tPri }}>
                                                    {m.fullName ?? "—"}
                                                </Typography>
                                                <Typography fontSize="0.72rem" sx={{ color: tSec }}>
                                                    {m.email ?? ""}
                                                </Typography>
                                            </Box>
                                            {m.isLeader && (
                                                <Chip label="Leader" size="small" sx={{
                                                    height: 18, fontSize: "0.6rem", fontWeight: 700,
                                                    bgcolor: `${PRIMARY}15`, color: PRIMARY,
                                                }} />
                                            )}
                                        </Stack>
                                    ))
                                )}
                                <Typography fontSize="0.75rem" sx={{ color: tSec, textAlign: "center", mt: 0.5 }}>
                                    {(selected.members ?? []).length} / {selected.maxMembers ?? "?"} members
                                </Typography>
                            </Stack>
                        )}

                        {/* ── Tasks ── */}
                        {tab === 2 && (
                            <Stack spacing={1.2} sx={{ mt: 0.5 }}>
                                {[
                                    { label: "To Do", val: selected.tasks?.todo, color: tSec },
                                    { label: "In Progress", val: selected.tasks?.inProgress, color: PRIMARY },
                                    { label: "Done", val: selected.tasks?.done, color: "#3DB97A" },
                                ].map((item) => (
                                    <Stack
                                        key={item.label}
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        sx={{
                                            p: 1.5, borderRadius: 2.5,
                                            border: `1px solid ${border}`,
                                            bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                                        }}
                                    >
                                        <Typography fontSize="0.86rem" sx={{ color: tSec }}>{item.label}</Typography>
                                        <Chip label={item.val ?? "0"} size="small" sx={{
                                            bgcolor: `${item.color}18`, color: item.color,
                                            fontWeight: 700, height: 22, fontSize: "0.75rem",
                                        }} />
                                    </Stack>
                                ))}
                            </Stack>
                        )}
                    </DialogContent>

                    <Box sx={{
                        px: 3, py: 2, borderTop: `1px solid ${border}`,
                        display: "flex", justifyContent: "flex-end",
                    }}>
                        <Button
                            onClick={() => setDetailOpen(false)}
                            sx={{ color: tSec, textTransform: "none", fontWeight: 500, borderRadius: 2 }}
                        >
                            Close
                        </Button>
                    </Box>
                </Dialog>
            )}

            {/* ══ TEAM SIZE DIALOG ═══════════════════════════════════ */}
            {sizeGroup && (
                <Dialog
                    open={sizeOpen}
                    onClose={() => setSizeOpen(false)}
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg } }}
                >
                    <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${border}` }}>
                        <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: tPri }}>
                            Team Size — {sizeGroup.name}
                        </Typography>
                    </Box>
                    <Box sx={{ px: 3, py: 2.5 }}>
                        <Typography fontSize="0.84rem" sx={{ color: tSec, mb: 2 }}>
                            Set the maximum number of members allowed in this team.
                        </Typography>
                        <TextField
                            label="Max Members"
                            type="number"
                            size="small"
                            fullWidth
                            value={sizeVal}
                            onChange={(e) => setSizeVal(Number(e.target.value))}
                            inputProps={{ min: (sizeGroup.members?.length ?? 1), max: 10 }}
                            sx={inputSx}
                        />
                        <Typography fontSize="0.73rem" sx={{ color: tSec, mt: 1 }}>
                            Current: {sizeGroup.members?.length ?? 0} member(s).
                        </Typography>
                    </Box>
                    <Box sx={{ px: 3, pb: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        <Button
                            onClick={() => setSizeOpen(false)}
                            sx={{ color: tSec, textTransform: "none", fontWeight: 500, borderRadius: 2 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSaveSize}
                            sx={{
                                bgcolor: PRIMARY,
                                "&:hover": { bgcolor: "#b06f47", boxShadow: "none" },
                                textTransform: "none", fontWeight: 700, borderRadius: 2, boxShadow: "none",
                            }}
                        >
                            Save
                        </Button>
                    </Box>
                </Dialog>
            )}

            {/* ══ SUPERVISION LIMIT DIALOG ═══════════════════════════ */}
            <Dialog
                open={limitOpen}
                onClose={() => setLimitOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg } }}
            >
                <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${border}` }}>
                    <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: tPri }}>
                        Supervision Limit
                    </Typography>
                </Box>
                <Box sx={{ px: 3, py: 2.5 }}>
                    <Typography fontSize="0.84rem" sx={{ color: tSec, mb: 2 }}>
                        Set the maximum number of groups you are willing to supervise this semester.
                    </Typography>
                    <TextField
                        label="Max Groups"
                        type="number"
                        size="small"
                        fullWidth
                        value={limitInput}
                        onChange={(e) => setLimitInput(Number(e.target.value))}
                        inputProps={{ min: groups.length, max: 20 }}
                        sx={inputSx}
                    />
                    <Typography fontSize="0.73rem" sx={{ color: tSec, mt: 1 }}>
                        You currently supervise {groups.length} group(s). Min cannot be below current count.
                    </Typography>
                </Box>
                <Box sx={{ px: 3, pb: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <Button
                        onClick={() => setLimitOpen(false)}
                        sx={{ color: tSec, textTransform: "none", fontWeight: 500, borderRadius: 2 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disabled={actionBusy}
                        onClick={handleSaveLimit}
                        sx={{
                            bgcolor: PRIMARY,
                            "&:hover": { bgcolor: "#b06f47", boxShadow: "none" },
                            textTransform: "none", fontWeight: 700, borderRadius: 2, boxShadow: "none",
                        }}
                    >
                        {actionBusy
                            ? <CircularProgress size={16} sx={{ color: "#fff" }} />
                            : "Save"}
                    </Button>
                </Box>
            </Dialog>

            {/* ── SNACKBAR ──────────────────────────────────────────── */}
            <Snackbar
                open={snack.open}
                autoHideDuration={3500}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert severity={snack.sev} variant="filled" sx={{ borderRadius: 2 }}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </>
    );
}