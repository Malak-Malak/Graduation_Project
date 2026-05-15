// src/components/common/supervisor/Groups/GroupsList.jsx

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
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";

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
import { getMyTeamsSlots } from "../../../../api/handler/endpoints/headOfDepartmentApi";
import GroupCard from "./GroupCard";

/* ─── constants ──────────────────────────────────────────────── */
const MBR_COLORS = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8"];
const PRIMARY = "#d0895b";
const RISK_CLR = { low: "#6D8A7D", medium: "#C49A6C", high: "#C47E7E" };

const initials = (name = "") =>
    (name ?? "?").split(" ").map((w) => w[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";

const fmtDateTime = (iso) => {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleString("en-GB", {
            weekday: "short", day: "2-digit", month: "short",
            year: "numeric", hour: "2-digit", minute: "2-digit",
        });
    } catch { return iso; }
};

/* ─── normaliseRequests ──────────────────────────────────────── */
const normaliseRequests = (raw) =>
    (Array.isArray(raw) ? raw : []).map((r) => ({
        teamId: r.teamId ?? r.id,
        projectTitle:
            r.projectTitle ?? r.project ?? r.teamName ?? r.name ??
            (r.teamId ? `Team #${r.teamId}` : `Team #${r.id}`),
        teamName: r.teamName ?? r.name ?? r.team ?? `Team #${r.teamId ?? r.id}`,
        projectDescription: r.projectDescription ?? r.description ?? "",
        studentName:
            r.studentName ?? r.memberName ?? r.fullName ?? r.leaderName ??
            r.requestedBy ?? null,  // ← null بدل "Unknown Student"
        studentId: r.studentId ?? r.userId ?? null,
        members: r.members ?? r.students ?? [],
        requestedAt: r.requestedAt ?? r.createdAt ?? null,
        type: r.type ?? "team",
        memberId: r.teamMemberId ?? r.memberId ?? null,
    }));

/* ─── normaliseTeams ─────────────────────────────────────────── */
const normaliseTeams = (raw) =>
    (Array.isArray(raw) ? raw : [])
        .filter((t) => {
            const s = (t.status ?? t.teamStatus ?? "").toLowerCase();
            return s !== "rejected" && s !== "pending"; // ← أضف && s !== "pending"
        })
        .map((t) => ({
            id: t.teamId ?? t.id,
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

/* ─── DiscussionSlotTab ──────────────────────────────────────── */
function DiscussionSlotTab({ teamId, slotsMap, isDark, border, tPri, tSec }) {
    // slotsMap: { [teamId]: { assignedSlot, projectName, ... } | null }
    const entry = slotsMap[teamId];

    // still loading (entry is undefined)
    if (entry === undefined) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress size={22} sx={{ color: PRIMARY }} />
            </Box>
        );
    }

    const slot = entry?.assignedSlot ?? null;

    // no slot assigned
    if (!slot) {
        return (
            <Box sx={{ textAlign: "center", py: 5 }}>
                <Box sx={{
                    width: 56, height: 56, borderRadius: 3, mx: "auto", mb: 2,
                    bgcolor: `${PRIMARY}10`, border: `1px solid ${PRIMARY}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <HourglassEmptyOutlinedIcon sx={{ fontSize: 26, color: PRIMARY, opacity: 0.7 }} />
                </Box>
                <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: tPri, mb: 0.5 }}>
                    No Discussion Slot Assigned
                </Typography>
                <Typography fontSize="0.78rem" sx={{ color: tSec, maxWidth: 280, mx: "auto" }}>
                    This team hasn't been assigned a final discussion slot yet.
                </Typography>
            </Box>
        );
    }

    // slot assigned — display details
    const rows = [
        {
            icon: <EventOutlinedIcon sx={{ fontSize: 16, color: PRIMARY }} />,
            label: "Date & Time",
            value: fmtDateTime(slot.dateTime),
            highlight: true,
        },
        {
            icon: <LocationOnOutlinedIcon sx={{ fontSize: 16, color: "#7E9FC4" }} />,
            label: "Location",
            value: slot.location ?? "—",
            highlight: false,
        },
        {
            icon: <SchoolOutlined sx={{ fontSize: 16, color: "#6D8A7D" }} />,
            label: "Department",
            value: slot.department ?? "—",
            highlight: false,
        },
        ...(slot.notes ? [{
            icon: <NotesOutlinedIcon sx={{ fontSize: 16, color: "#C49A6C" }} />,
            label: "Notes",
            value: slot.notes,
            highlight: false,
        }] : []),
    ];

    return (
        <Stack spacing={2} sx={{ mt: 0.5 }}>
            {/* Confirmed banner */}
            <Box sx={{
                p: 1.5, borderRadius: 2.5,
                bgcolor: "#3a9e6f14",
                border: "1px solid #3a9e6f30",
                display: "flex", alignItems: "center", gap: 1.2,
            }}>
                <CheckCircleIcon sx={{ fontSize: 18, color: "#3a9e6f", flexShrink: 0 }} />
                <Box>
                    <Typography fontSize="0.8rem" fontWeight={700} sx={{ color: "#3a9e6f" }}>
                        Discussion Slot Confirmed
                    </Typography>
                    <Typography fontSize="0.72rem" sx={{ color: tSec }}>
                        Slot #{slot.id} — assigned by Head of Department
                    </Typography>
                </Box>
            </Box>

            {/* Detail rows */}
            {rows.map((row) => (
                <Stack
                    key={row.label}
                    direction="row"
                    alignItems="flex-start"
                    gap={1.5}
                    sx={{
                        p: 1.5, borderRadius: 2.5,
                        border: `1px solid ${border}`,
                        bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                    }}
                >
                    <Box sx={{
                        width: 30, height: 30, borderRadius: 2, flexShrink: 0,
                        bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        {row.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography fontSize="0.68rem" fontWeight={700} sx={{
                            color: tSec, textTransform: "uppercase",
                            letterSpacing: "0.07em", mb: 0.3,
                        }}>
                            {row.label}
                        </Typography>
                        <Typography fontSize="0.86rem" fontWeight={row.highlight ? 700 : 500}
                            sx={{ color: row.highlight ? tPri : tSec, wordBreak: "break-word" }}>
                            {row.value}
                        </Typography>
                    </Box>
                </Stack>
            ))}
        </Stack>
    );
}

/* ─── Request row ────────────────────────────────────────────── */
function RequestRow({ req, onApprove, onReject, busy }) {
    const theme = useTheme();
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
                border: isLeave ? "1px solid rgba(229,115,115,0.25)" : `1px solid ${PRIMARY}28`,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                {isLeave
                    ? <ExitToAppOutlinedIcon sx={{ fontSize: 18, color: "#e57373" }} />
                    : <HowToRegOutlinedIcon sx={{ fontSize: 18, color: PRIMARY }} />}
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
export default function GroupsList() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    /* ── data ── */
    const [groups, setGroups] = useState([]);
    const [requests, setRequests] = useState([]);
    const [maxTeams, setMaxTeamsState] = useState(6);

    // slotsMap: { [teamId]: slotEntry | null }
    // undefined = not yet fetched, null = fetched but no slot
    const [slotsMap, setSlotsMap] = useState({});

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

    /* ─── fetch slots for all teams ──────────────────────────── */
    const fetchSlots = useCallback(async () => {
        try {
            const res = await getMyTeamsSlots();
            // res: [{ teamId, projectName, assignedSlot, ... }]
            const list = Array.isArray(res) ? res : (res?.data ?? []);
            const map = {};
            list.forEach((entry) => {
                if (entry.teamId != null) map[entry.teamId] = entry;
            });
            setSlotsMap(map);
        } catch {
            setSlotsMap({});
        }
    }, []);

    /* ─── fetch pending requests ─────────────────────────────── */
    const fetchRequests = useCallback(async () => {
        try {
            setLoadingRequests(true);
            const [teamData, leaveData] = await Promise.all([
                getPendingTeamRequests(),
                getPendingLeaveRequests(),
            ]);
            const teamReqs = normaliseRequests(Array.isArray(teamData) ? teamData : []).map((r) => ({ ...r, type: "team" }));
            const leaveReqs = normaliseRequests(Array.isArray(leaveData) ? leaveData : []).map((r) => ({ ...r, type: "leave" }));
            setRequests([...teamReqs, ...leaveReqs]);
        } catch {
            setRequests([]);
        } finally {
            setLoadingRequests(false);
        }
    }, []);

    /* ─── fetch supervised groups ────────────────────────────── */
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
        fetchSlots();
    }, [fetchRequests, fetchGroups, fetchTotals, fetchSlots]);

    /* ─── open detail ────────────────────────────────────────── */
    const openDetail = async (g) => {
        setSelected(g);
        setTab(0);
        setDetailOpen(true);
        try {
            setDetailBusy(true);
            const fresh = await getSupervisorTeamById(g.id);
            const normalised = normaliseTeams([fresh]);
            if (normalised.length > 0) setSelected(normalised[0]);
        } catch { /* keep stale */ } finally {
            setDetailBusy(false);
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

    /* ─── size ───────────────────────────────────────────────── */
    const openSize = (g) => { setSizeGroup(g); setSizeVal(g.maxMembers ?? 5); setSizeOpen(true); };
    const handleSaveSize = () => {
        setGroups((prev) => prev.map((g) => g.id === sizeGroup.id ? { ...g, maxMembers: sizeVal } : g));
        setSizeOpen(false);
        snap("Team size updated.");
    };

    /* ─── style helpers ──────────────────────────────────────── */
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

    // Check if selected team has a confirmed slot (for tab badge)
    const selectedHasSlot = selected
        ? Boolean(slotsMap[selected.id]?.assignedSlot)
        : false;

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
                                onClick={() => { fetchGroups(); fetchRequests(); fetchTotals(); fetchSlots(); }}
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
                                        onReject={(r) => handleRespond(r, false)} />
                                ))
                            )}
                        </Stack>
                    </Paper>
                )}

                {/* GROUPS GRID */}
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
                <Dialog open={detailOpen} onClose={() => setDetailOpen(false)}
                    maxWidth="sm" fullWidth
                    PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg } }}>

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

                    {detailBusy && (
                        <Box display="flex" justifyContent="center" py={1.5} sx={{ borderBottom: `1px solid ${border}` }}>
                            <CircularProgress size={18} sx={{ color: PRIMARY }} />
                        </Box>
                    )}

                    {/* tabs — 4 tabs now */}
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
                        px: 1,
                        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                        "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.82rem", minHeight: 44, color: tSec },
                        "& .Mui-selected": { color: PRIMARY },
                        "& .MuiTabs-indicator": { bgcolor: PRIMARY, height: 2.5, borderRadius: 2 },
                    }}>
                        <Tab label="Overview" />
                        <Tab label={`Members (${(selected.members ?? []).length})`} />
                        <Tab label="Tasks" />
                        <Tab
                            label={
                                <Stack direction="row" alignItems="center" gap={0.7}>
                                    <EventOutlinedIcon sx={{ fontSize: 14 }} />
                                    <span>Discussion</span>
                                    {selectedHasSlot && (
                                        <Box sx={{
                                            width: 7, height: 7, borderRadius: "50%",
                                            bgcolor: "#3a9e6f", flexShrink: 0,
                                        }} />
                                    )}
                                </Stack>
                            }
                        />
                    </Tabs>

                    <DialogContent sx={{ px: 3, py: 2.5 }}>

                        {/* Overview */}
                        {tab === 0 && (
                            <Stack spacing={2.5}>
                                <Box>
                                    <Typography fontSize="0.68rem" fontWeight={700} sx={{
                                        color: tSec, textTransform: "uppercase", letterSpacing: "0.08em", mb: 1,
                                    }}>Progress</Typography>
                                    <Stack direction="row" justifyContent="space-between" mb={0.6}>
                                        <Typography fontSize="0.84rem" sx={{ color: tSec }}>Completion</Typography>
                                        <Typography fontSize="0.84rem" fontWeight={700} sx={{ color: tPri }}>N/A</Typography>
                                    </Stack>
                                    <LinearProgress variant="determinate" value={0} sx={{
                                        height: 6, borderRadius: 3,
                                        bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
                                        "& .MuiLinearProgress-bar": { bgcolor: RISK_CLR[selected.risk ?? "low"], borderRadius: 3 },
                                    }} />
                                </Box>
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
                                        color: tSec, textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.8,
                                    }}>Last Active</Typography>
                                    <Typography fontSize="0.84rem" fontWeight={600} sx={{ color: tPri }}>
                                        {selected.lastActive ?? "—"}
                                    </Typography>
                                </Box>
                            </Stack>
                        )}

                        {/* Members */}
                        {tab === 1 && (
                            <Stack spacing={1.2} sx={{ mt: 0.5 }}>
                                {(selected.members ?? []).length === 0 ? (
                                    <Typography sx={{ color: tSec, fontSize: "0.84rem", textAlign: "center", mt: 3 }}>
                                        No members yet
                                    </Typography>
                                ) : (
                                    (selected.members ?? []).map((m, i) => (
                                        <Stack key={i} direction="row" alignItems="center" gap={1.5} sx={{
                                            p: 1.5, borderRadius: 2.5, border: `1px solid ${border}`,
                                            bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                                        }}>
                                            <Avatar sx={{ width: 36, height: 36, fontWeight: 700, fontSize: "0.8rem", bgcolor: MBR_COLORS[i % MBR_COLORS.length] }}>
                                                {initials(m.fullName)}
                                            </Avatar>
                                            <Box flex={1} minWidth={0}>
                                                <Typography fontWeight={600} fontSize="0.86rem" noWrap sx={{ color: tPri }}>
                                                    {m.fullName ?? "—"}
                                                </Typography>
                                                <Typography fontSize="0.72rem" sx={{ color: tSec }}>{m.email ?? ""}</Typography>
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

                        {/* Tasks */}
                        {tab === 2 && (
                            <Stack spacing={1.2} sx={{ mt: 0.5 }}>
                                {[
                                    { label: "To Do", val: selected.tasks?.todo, color: tSec },
                                    { label: "In Progress", val: selected.tasks?.inProgress, color: PRIMARY },
                                    { label: "Done", val: selected.tasks?.done, color: "#3DB97A" },
                                ].map((item) => (
                                    <Stack key={item.label} direction="row" justifyContent="space-between" alignItems="center" sx={{
                                        p: 1.5, borderRadius: 2.5, border: `1px solid ${border}`,
                                        bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                                    }}>
                                        <Typography fontSize="0.86rem" sx={{ color: tSec }}>{item.label}</Typography>
                                        <Chip label={item.val ?? "0"} size="small" sx={{
                                            bgcolor: `${item.color}18`, color: item.color,
                                            fontWeight: 700, height: 22, fontSize: "0.75rem",
                                        }} />
                                    </Stack>
                                ))}
                            </Stack>
                        )}

                        {/* Discussion Slot */}
                        {tab === 3 && (
                            <DiscussionSlotTab
                                teamId={selected.id}
                                slotsMap={slotsMap}
                                isDark={isDark}
                                border={border}
                                tPri={tPri}
                                tSec={tSec}
                            />
                        )}
                    </DialogContent>

                    <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${border}`, display: "flex", justifyContent: "flex-end" }}>
                        <Button onClick={() => setDetailOpen(false)}
                            sx={{ color: tSec, textTransform: "none", fontWeight: 500, borderRadius: 2 }}>
                            Close
                        </Button>
                    </Box>
                </Dialog>
            )}

            {/* ══ TEAM SIZE DIALOG ═══════════════════════════════════ */}
            {sizeGroup && (
                <Dialog open={sizeOpen} onClose={() => setSizeOpen(false)} maxWidth="xs" fullWidth
                    PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg } }}>
                    <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${border}` }}>
                        <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: tPri }}>
                            Team Size — {sizeGroup.name}
                        </Typography>
                    </Box>
                    <Box sx={{ px: 3, py: 2.5 }}>
                        <Typography fontSize="0.84rem" sx={{ color: tSec, mb: 2 }}>
                            Set the maximum number of members allowed in this team.
                        </Typography>
                        <TextField label="Max Members" type="number" size="small" fullWidth
                            value={sizeVal} onChange={(e) => setSizeVal(Number(e.target.value))}
                            inputProps={{ min: (sizeGroup.members?.length ?? 1), max: 10 }}
                            sx={inputSx} />
                        <Typography fontSize="0.73rem" sx={{ color: tSec, mt: 1 }}>
                            Current: {sizeGroup.members?.length ?? 0} member(s).
                        </Typography>
                    </Box>
                    <Box sx={{ px: 3, pb: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        <Button onClick={() => setSizeOpen(false)} sx={{ color: tSec, textTransform: "none", fontWeight: 500, borderRadius: 2 }}>Cancel</Button>
                        <Button variant="contained" onClick={handleSaveSize} sx={{
                            bgcolor: PRIMARY, "&:hover": { bgcolor: "#b06f47", boxShadow: "none" },
                            textTransform: "none", fontWeight: 700, borderRadius: 2, boxShadow: "none",
                        }}>Save</Button>
                    </Box>
                </Dialog>
            )}

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
                    <Button onClick={() => setLimitOpen(false)} sx={{ color: tSec, textTransform: "none", fontWeight: 500, borderRadius: 2 }}>Cancel</Button>
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