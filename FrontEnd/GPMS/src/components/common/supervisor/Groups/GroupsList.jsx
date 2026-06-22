// src/components/common/supervisor/Groups/GroupsList.jsx

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box, Paper, Typography, Stack, Avatar, Chip, Button, LinearProgress,
    AvatarGroup, Grid, IconButton, Tooltip, CircularProgress,
    Snackbar, Alert, TextField,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import TuneOutlinedIcon         from "@mui/icons-material/TuneOutlined";
import CheckCircleOutlineIcon   from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon       from "@mui/icons-material/CancelOutlined";
import RefreshOutlinedIcon      from "@mui/icons-material/RefreshOutlined";
import HowToRegOutlinedIcon     from "@mui/icons-material/HowToRegOutlined";
import ExitToAppOutlinedIcon    from "@mui/icons-material/ExitToAppOutlined";
import SchoolOutlinedIcon       from "@mui/icons-material/SchoolOutlined";
import Dialog                   from "@mui/material/Dialog";

import {
    getPendingTeamRequests,
    getPendingLeaveRequests,
    respondToTeamRequest,
    respondToLeaveRequest,
    setMaxTeams,
    getSupervisorTeams,
    getSupervisorTotalTeams,
} from "../../../../api/handler/endpoints/supervisorApi";

import GroupCard             from "./GroupCard";
import SupervisorKanbanModal from "./SupervisorKanbanModal";
import DiscussionSlotModal   from "./DiscussionSlotModal";

/* ─── constants ──────────────────────────────────────────────── */
const MBR_COLORS = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8"];
const PRIMARY    = "#d0895b";

const initials = (name = "") =>
    (name ?? "?").split(" ").map((w) => w[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";

/* ─── normaliseRequests ──────────────────────────────────────── */
const normaliseRequests = (raw) =>
    (Array.isArray(raw) ? raw : []).map((r) => ({
        teamId:             r.teamId ?? r.id,
        projectTitle:       r.projectTitle ?? r.project ?? r.teamName ?? r.name ?? (r.teamId ? `Team #${r.teamId}` : `Team #${r.id}`),
        teamName:           r.teamName ?? r.name ?? r.team ?? `Team #${r.teamId ?? r.id}`,
        projectDescription: r.projectDescription ?? r.description ?? "",
        studentName:        r.studentName ?? r.memberName ?? r.fullName ?? r.leaderName ?? r.requestedBy ?? null,
        studentId:          r.studentId ?? r.userId ?? null,
        members:            r.members ?? r.students ?? [],
        requestedAt:        r.requestedAt ?? r.createdAt ?? null,
        type:               r.type ?? "team",
        memberId:           r.teamMemberId ?? r.memberId ?? null,
    }));

/* ─── normaliseTeams ─────────────────────────────────────────── */
const normaliseTeams = (raw) =>
    (Array.isArray(raw) ? raw : [])
        .filter((t) => {
            const s = (t.status ?? t.teamStatus ?? "").toLowerCase();
            return s !== "rejected" && s !== "pending";
        })
        .map((t) => ({
            id:                 t.teamId ?? t.id,
            name:               t.projectTitle ?? t.teamName ?? t.name ?? "Unnamed Project",
            teamName:           t.teamName ?? t.name ?? null,
            projectTitle:       t.projectTitle ?? t.projectName ?? "—",
            projectDescription: t.projectDescription ?? t.description ?? "",
            status:             t.status ?? t.teamStatus ?? "Active",
            maxMembers:         t.maxMembers ?? t.maxSize ?? 5,
            lastActive:         t.lastActive ?? null,
            members: (t.members ?? t.students ?? []).map((m) => ({
                userId:   m.userId ?? m.id,
                fullName: m.fullName ?? m.name ?? "—",
                email:    m.email ?? "",
                isLeader: m.isLeader ?? m.role === "Leader" ?? false,
            })),
        }));

/* ─── Request row ────────────────────────────────────────────── */
function RequestRow({ req, onApprove, onReject, busy }) {
    const theme  = useTheme();
    const isDark = theme.palette.mode === "dark";
    const isLeave = req.type === "leave";

    return (
        <Stack direction="row" alignItems="flex-start" gap={1.5} sx={{
            p: 1.8, borderRadius: 2.5,
            border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
            bgcolor: theme.palette.background.paper,
        }}>
            <Box sx={{
                width: 38, height: 38, borderRadius: 2, flexShrink: 0,
                bgcolor: isLeave ? "rgba(229,115,115,0.1)" : `${PRIMARY}12`,
                border:  isLeave ? "1px solid rgba(229,115,115,0.25)" : `1px solid ${PRIMARY}28`,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                {isLeave
                    ? <ExitToAppOutlinedIcon sx={{ fontSize: 18, color: "#e57373" }} />
                    : <HowToRegOutlinedIcon  sx={{ fontSize: 18, color: PRIMARY }} />}
            </Box>

            <Box flex={1} minWidth={0}>
                <Typography fontWeight={700} fontSize="0.86rem" noWrap sx={{ color: theme.palette.text.primary }}>
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
                                <><Box component="span">{" — "}</Box><Box component="span">{req.studentName}</Box></>
                            )}
                        </>
                    )}
                </Typography>
                {req.projectDescription && (
                    <Typography fontSize="0.75rem" sx={{ color: theme.palette.text.secondary, mt: 0.3, mb: 0.5 }}>
                        {req.projectDescription}
                    </Typography>
                )}
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
                {req.requestedAt && (
                    <Typography fontSize="0.68rem" sx={{ color: theme.palette.text.secondary, mt: 0.4 }}>
                        {new Date(req.requestedAt).toLocaleDateString()}
                    </Typography>
                )}
            </Box>

            <Stack direction="row" gap={0.5} flexShrink={0}>
                <Tooltip title="Approve">
                    <IconButton size="small" disabled={busy} onClick={() => onApprove(req)}
                        sx={{ color: "#3DB97A", "&:hover": { bgcolor: "rgba(61,185,122,0.1)" } }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Reject">
                    <IconButton size="small" disabled={busy} onClick={() => onReject(req)}
                        sx={{ color: "#e57373", "&:hover": { bgcolor: "rgba(229,115,115,0.1)" } }}>
                        <CancelOutlinedIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Tooltip>
            </Stack>
        </Stack>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════ */
export default function GroupsList({ onNavigateToFiles }) {
    const theme  = useTheme();
    const isDark = theme.palette.mode === "dark";

    let navigate;
    try { navigate = useNavigate(); } catch { navigate = null; }

    /* ── data ── */
    const [groups,   setGroups]        = useState([]);
    const [requests, setRequests]      = useState([]);
    const [maxTeams, setMaxTeamsState] = useState(6);

    /* ── loading ── */
    const [loadingGroups,   setLoadingGroups]   = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [actionBusy,      setActionBusy]      = useState(false);

    /* ── Kanban modal — team + phase ── */
    const [kanbanOpen,  setKanbanOpen]  = useState(false);
    const [kanbanTeam,  setKanbanTeam]  = useState(null);
    const [kanbanPhase, setKanbanPhase] = useState(1);      // ← NEW

    /* ── Discussion slot modal ── */
    const [slotOpen, setSlotOpen] = useState(false);
    const [slotTeam, setSlotTeam] = useState(null);

    /* ── limit dialog ── */
    const [limitOpen,  setLimitOpen]  = useState(false);
    const [limitInput, setLimitInput] = useState(6);

    /* ── snackbar ── */
    const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
    const snap = (msg, sev = "success") => setSnack({ open: true, msg, sev });

    /* ─── fetch requests ─────────────────────────────────────── */
    const fetchRequests = useCallback(async () => {
        try {
            setLoadingRequests(true);
            const [teamData, leaveData] = await Promise.all([
                getPendingTeamRequests(),
                getPendingLeaveRequests(),
            ]);
            const teamReqs  = normaliseRequests(Array.isArray(teamData)  ? teamData  : []).map((r) => ({ ...r, type: "team"  }));
            const leaveReqs = normaliseRequests(Array.isArray(leaveData) ? leaveData : []).map((r) => ({ ...r, type: "leave" }));
            setRequests([...teamReqs, ...leaveReqs]);
        } catch {
            setRequests([]);
        } finally {
            setLoadingRequests(false);
        }
    }, []);

    /* ─── fetch groups ───────────────────────────────────────── */
    const fetchGroups = useCallback(async () => {
        try {
            setLoadingGroups(true);
            const data = await getSupervisorTeams();
            setGroups(normaliseTeams(data));
        } catch {
            setGroups([]);
        } finally {
            setLoadingGroups(false);
        }
    }, []);

    /* ─── fetch totals ───────────────────────────────────────── */
    const fetchTotals = useCallback(async () => {
        try {
            const data = await getSupervisorTotalTeams();
            if (data?.maxTeams != null) setMaxTeamsState(data.maxTeams);
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        fetchRequests();
        fetchGroups();
        fetchTotals();
    }, [fetchRequests, fetchGroups, fetchTotals]);

    /* ─── open Kanban modal — now receives phase ─────────────── */
    const openKanban = (g, phase) => {          // ← phase param
        setKanbanTeam(g);
        setKanbanPhase(phase ?? 1);
        setKanbanOpen(true);
    };

    /* ─── open Discussion Slot modal ─────────────────────────── */
    const openSlot = (g) => {
        setSlotTeam(g);
        setSlotOpen(true);
    };

    /* ─── open Files — passes back-navigation state ──────────── */
    const openFiles = (g) => {
        if (typeof onNavigateToFiles === "function") {
            onNavigateToFiles(g.id);
            return;
        }
        if (navigate) {
            // state.backTo lets the Files page render a "← My Groups" back button
            navigate(`/supervisor/files?teamId=${g.id}`, {
                state: { backTo: "/supervisor/groups", backLabel: "My Groups" },
            });
        }
    };

    /* ─── respond to request ─────────────────────────────────── */
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
                    fetchGroups();
                    fetchTotals();
                } else {
                    snap(`"${req.projectTitle}" rejected.`);
                }
            }
            fetchRequests();
        } catch (e) {
            snap(e?.response?.data?.message ?? "Action failed.", "error");
        } finally {
            setActionBusy(false);
        }
    };

    /* ─── limit ──────────────────────────────────────────────── */
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

    /* ─── style helpers ──────────────────────────────────────── */
    const border  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const paperBg = theme.palette.background.paper;
    const tPri    = theme.palette.text.primary;
    const tSec    = theme.palette.text.secondary;

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: 2, fontSize: "0.875rem",
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PRIMARY },
        },
        "& .MuiInputLabel-root.Mui-focused": { color: PRIMARY },
        "& .MuiInputLabel-root": { fontSize: "0.875rem" },
    };

    const pendingCount = requests.filter((r) => r.type !== "leave").length;
    const leaveCount   = requests.filter((r) => r.type === "leave").length;

    /* ═══════════════════════════════════════════════════════════
       RENDER
    ═══════════════════════════════════════════════════════════ */
    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

                {/* PAGE HEADER */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="h2" sx={{ color: tPri, mb: 0.4 }}>My Groups</Typography>
                        <Typography sx={{ color: tSec, fontSize: "0.85rem" }}>
                            {groups.length} / {maxTeams} supervised teams
                        </Typography>
                    </Box>
                    <Stack direction="row" gap={1}>
                        <Tooltip title="Refresh">
                            <IconButton size="small"
                                onClick={() => { fetchGroups(); fetchRequests(); fetchTotals(); }}
                                sx={{ color: tSec, border: `1px solid ${border}`, borderRadius: 2, "&:hover": { color: PRIMARY } }}>
                                <RefreshOutlinedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Set max groups you can supervise">
                            <Button variant="outlined" size="small"
                                startIcon={<TuneOutlinedIcon sx={{ fontSize: 15 }} />}
                                onClick={() => { setLimitInput(maxTeams); setLimitOpen(true); }}
                                sx={{
                                    borderColor: border, color: tSec, fontSize: "0.78rem",
                                    borderRadius: 2, textTransform: "none", fontWeight: 600,
                                    "&:hover": { borderColor: PRIMARY, color: PRIMARY, bgcolor: `${PRIMARY}08` },
                                }}>
                                Limit: {maxTeams}
                            </Button>
                        </Tooltip>
                    </Stack>
                </Stack>

                {/* CAPACITY BAR */}
                <Paper elevation={0} sx={{ p: 2.2, borderRadius: 2.5, border: `1px solid ${border}`, bgcolor: paperBg }}>
                    <Stack direction="row" justifyContent="space-between" mb={0.8}>
                        <Typography fontSize="0.75rem" fontWeight={700} sx={{ color: tSec }}>
                            Supervision Capacity
                        </Typography>
                        <Typography fontSize="0.75rem" fontWeight={700}
                            sx={{ color: groups.length >= maxTeams ? "#C47E7E" : "#3DB97A" }}>
                            {groups.length} / {maxTeams} groups
                        </Typography>
                    </Stack>
                    <LinearProgress variant="determinate"
                        value={Math.min((groups.length / maxTeams) * 100, 100)}
                        sx={{
                            height: 6, borderRadius: 3,
                            bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
                            "& .MuiLinearProgress-bar": {
                                bgcolor: groups.length >= maxTeams ? "#C47E7E" : PRIMARY, borderRadius: 3,
                            },
                        }}
                    />
                    {groups.length >= maxTeams && (
                        <Typography fontSize="0.72rem" sx={{ color: "#C47E7E", mt: 0.6 }}>
                            ⚠ You have reached your maximum supervision limit.
                        </Typography>
                    )}
                </Paper>

                {/* PENDING REQUESTS */}
                {(loadingRequests || requests.length > 0) && (
                    <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg, overflow: "hidden" }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{
                            px: 2.5, py: 1.8,
                            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                            bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                        }}>
                            <Stack direction="row" alignItems="center" gap={1}>
                                <HowToRegOutlinedIcon sx={{ fontSize: 18, color: PRIMARY }} />
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
                                    <RequestRow key={`${req.type}-${req.teamId ?? i}`} req={req}
                                        busy={actionBusy}
                                        onApprove={(r) => handleRespond(r, true)}
                                        onReject={(r)  => handleRespond(r, false)} />
                                ))
                            )}
                        </Stack>
                    </Paper>
                )}

                {/* GROUPS GRID — same layout as ArchivedProjectCard grid */}
                {loadingGroups ? (
                    <Box display="flex" justifyContent="center" py={6}>
                        <CircularProgress sx={{ color: PRIMARY }} />
                    </Box>
                ) : groups.length === 0 ? (
                    <Paper elevation={0} sx={{ p: 5, borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg, textAlign: "center" }}>
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
                    /* ↓ exact same grid as ArchivedProjectCard */
                    <Box sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
                        gap: 2,
                    }}>
                        {groups.map((g) => (
                            <GroupCard
                                key={g.id}
                                g={g}
                                onOpenKanban={openKanban}   // (group, phase)
                                onOpenFiles={openFiles}
                                onOpenSlot={openSlot}
                            />
                        ))}
                    </Box>
                )}
            </Box>

            {/* ══ KANBAN MODAL — passes phase ════════════════════════ */}
            <SupervisorKanbanModal
                open={kanbanOpen}
                team={kanbanTeam}
                phase={kanbanPhase}                        // ← passes phase
                onClose={() => { setKanbanOpen(false); setKanbanTeam(null); }}
            />

            {/* ══ DISCUSSION SLOT MODAL ══════════════════════════════ */}
            <DiscussionSlotModal
                open={slotOpen}
                team={slotTeam}
                onClose={() => { setSlotOpen(false); setSlotTeam(null); }}
            />

            {/* ══ SUPERVISION LIMIT DIALOG ═══════════════════════════ */}
            <Dialog open={limitOpen} onClose={() => setLimitOpen(false)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg } }}>
                <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${border}` }}>
                    <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: tPri }}>Supervision Limit</Typography>
                </Box>
                <Box sx={{ px: 3, py: 2.5 }}>
                    <Typography fontSize="0.84rem" sx={{ color: tSec, mb: 2 }}>
                        Set the maximum number of groups you are willing to supervise this semester.
                    </Typography>
                    <TextField label="Max Groups" type="number" size="small" fullWidth
                        value={limitInput} onChange={(e) => setLimitInput(Number(e.target.value))}
                        inputProps={{ min: groups.length, max: 20 }} sx={inputSx} />
                    <Typography fontSize="0.73rem" sx={{ color: tSec, mt: 1 }}>
                        You currently supervise {groups.length} group(s). Min cannot be below current count.
                    </Typography>
                </Box>
                <Box sx={{ px: 3, pb: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <Button onClick={() => setLimitOpen(false)}
                        sx={{ color: tSec, textTransform: "none", fontWeight: 500, borderRadius: 2 }}>
                        Cancel
                    </Button>
                    <Button variant="contained" disabled={actionBusy} onClick={handleSaveLimit} sx={{
                        bgcolor: PRIMARY, "&:hover": { bgcolor: "#b06f47", boxShadow: "none" },
                        textTransform: "none", fontWeight: 700, borderRadius: 2, boxShadow: "none",
                    }}>
                        {actionBusy ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Save"}
                    </Button>
                </Box>
            </Dialog>

            {/* SNACKBAR */}
            <Snackbar open={snack.open} autoHideDuration={3500}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity={snack.sev} variant="filled" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
            </Snackbar>
        </>
    );
}