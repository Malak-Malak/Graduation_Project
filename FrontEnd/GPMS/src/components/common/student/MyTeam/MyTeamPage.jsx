// C:\Users\Dell\Desktop\Graduation_Project\FrontEnd\GPMS\src\components\common\student\MyTeam\MyTeamPage.jsx

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@mui/material/styles";
import {
    Box, Typography, Stack, Paper, Avatar, AvatarGroup,
    Button, Chip, Tab, Tabs, CircularProgress,
    Snackbar, Alert, Tooltip, IconButton, Divider,
    Dialog, DialogContent, DialogActions, TextField,
} from "@mui/material";

import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";

import studentApi from "../../../../api/handler/endpoints/studentApi";
import JoinOrCreateModal from "../Onboarding/JoinOrCreateModal";
import CreateTeamFlow from "../Onboarding/CreateTeamFlow";
import JoinTeamFlow from "../Onboarding/JoinTeamFlow";

/* ─── palette ─────────────────────────────────────────────────── */
const ACCENT = "#d0895b";
const MBR_CLR = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8"];

const initials = (name = "") =>
    (name ?? "?")
        .split(" ")
        .map((w) => w[0] ?? "")
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?";

/* ─── small reusable pieces ───────────────────────────────────── */
function InfoRow({ icon, label, value }) {
    const theme = useTheme();
    return (
        <Stack direction="row" alignItems="flex-start" gap={1.4}>
            <Box sx={{ color: ACCENT, mt: 0.15, flexShrink: 0 }}>{icon}</Box>
            <Box>
                <Typography sx={{
                    fontSize: "0.7rem", color: theme.palette.text.secondary,
                    fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.2
                }}>
                    {label}
                </Typography>
                <Typography sx={{ fontSize: "0.87rem", color: theme.palette.text.primary, fontWeight: 600 }}>
                    {value ?? "—"}
                </Typography>
            </Box>
        </Stack>
    );
}

function SectionCard({ title, icon, children, action }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    return (
        <Paper elevation={0} sx={{
            borderRadius: 3,
            border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
            bgcolor: theme.palette.background.paper,
            overflow: "hidden",
        }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between"
                sx={{
                    px: 2.5, py: 1.8,
                    borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                    bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)"
                }}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <Box sx={{ color: ACCENT }}>{icon}</Box>
                    <Typography fontWeight={700} fontSize="0.88rem"
                        sx={{ color: theme.palette.text.primary }}>{title}</Typography>
                </Stack>
                {action}
            </Stack>
            <Box sx={{ p: 2.5 }}>{children}</Box>
        </Paper>
    );
}

/* ─── Invitation row ──────────────────────────────────────────── */
// API shape: { id, teamName, status, sentAt }
// هاي الدعوات دايماً incoming (تيم دعاك) — ما في type field
function InviteRow({ inv, onAccept, onDecline, busy }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const id = inv.id;
    const teamName = inv.teamName ?? "A team";
    const status = inv.status ?? "Pending";
    const sentAt = inv.sentAt
        ? new Date(inv.sentAt).toLocaleDateString()
        : null;

    return (
        <Stack direction="row" alignItems="center" gap={1.5}
            sx={{
                p: 1.5, borderRadius: 2,
                border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
                bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
            }}>
            {/* team avatar */}
            <Avatar sx={{ width: 36, height: 36, bgcolor: MBR_CLR[1], fontSize: "0.72rem", fontWeight: 700 }}>
                {initials(teamName)}
            </Avatar>

            <Box flex={1} minWidth={0}>
                {/* main text */}
                <Typography fontWeight={600} fontSize="0.83rem" noWrap
                    sx={{ color: theme.palette.text.primary }}>
                    <Box component="span" sx={{ color: ACCENT }}>{teamName}</Box>
                    {" "}invited you to join
                </Typography>
                {/* sub row: status + date */}
                <Stack direction="row" alignItems="center" gap={0.8} mt={0.4}>
                    <Chip label={status} size="small" sx={{
                        height: 16, fontSize: "0.6rem", fontWeight: 700,
                        bgcolor: status === "Pending" ? `${ACCENT}15` :
                            status === "Accepted" ? "rgba(61,185,122,0.12)" :
                                "rgba(229,115,115,0.12)",
                        color: status === "Pending" ? ACCENT :
                            status === "Accepted" ? "#3DB97A" : "#e57373",
                    }} />
                    {sentAt && (
                        <Typography fontSize="0.68rem" sx={{ color: theme.palette.text.secondary }}>
                            {sentAt}
                        </Typography>
                    )}
                </Stack>
            </Box>

            {/* Accept / Decline — only for pending */}
            {status === "Pending" && (
                <Stack direction="row" gap={0.5}>
                    <Tooltip title="Accept">
                        <IconButton size="small" disabled={busy}
                            onClick={() => onAccept(id)}
                            sx={{ color: "#3DB97A", "&:hover": { bgcolor: "rgba(61,185,122,0.1)" } }}>
                            <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Decline">
                        <IconButton size="small" disabled={busy}
                            onClick={() => onDecline(id)}
                            sx={{ color: "#e57373", "&:hover": { bgcolor: "rgba(229,115,115,0.1)" } }}>
                            <CancelOutlinedIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )}
        </Stack>
    );
}

/* ─── Available student row (for invite) ─────────────────────── */
function StudentRow({ student, onInvite, busy }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const name = student.fullName ?? student.name ?? "Student";

    return (
        <Stack direction="row" alignItems="center" gap={1.5}
            sx={{
                p: 1.5, borderRadius: 2,
                border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
                bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
            }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: MBR_CLR[2], fontSize: "0.7rem", fontWeight: 700 }}>
                {initials(name)}
            </Avatar>
            <Box flex={1} minWidth={0}>
                <Typography fontWeight={600} fontSize="0.82rem" noWrap
                    sx={{ color: theme.palette.text.primary }}>{name}</Typography>
                <Typography fontSize="0.72rem" noWrap
                    sx={{ color: theme.palette.text.secondary }}>
                    {student.email ?? student.studentId ?? ""}
                </Typography>
            </Box>
            <Tooltip title="Send invitation">
                <span>
                    <IconButton size="small" disabled={busy}
                        onClick={() => onInvite(student.id ?? student.userId)}
                        sx={{ color: ACCENT, "&:hover": { bgcolor: `${ACCENT}14` } }}>
                        <PersonAddOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </span>
            </Tooltip>
        </Stack>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                      */
/* ═══════════════════════════════════════════════════════════════ */
export default function MyTeamPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;

    /* ── data ── */
    const [myTeam, setMyTeam] = useState(null);   // null = no team yet
    const [invitations, setInvitations] = useState([]);
    const [available, setAvailable] = useState([]);     // available students

    /* ── loading ── */
    const [loadingTeam, setLoadingTeam] = useState(true);
    const [loadingInv, setLoadingInv] = useState(false);
    const [loadingAvail, setLoadingAvail] = useState(false);
    const [actionBusy, setActionBusy] = useState(false);

    /* ── UI ── */
    const [tab, setTab] = useState(0);    // 0=Members 1=Invitations 2=Students
    const [searchStr, setSearchStr] = useState("");

    /* ── onboarding modals ── */
    const [showGate, setShowGate] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);

    /* ── leave confirm ── */
    const [leaveOpen, setLeaveOpen] = useState(false);

    /* ── snackbar ── */
    const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
    const snap = (msg, sev = "success") => setSnack({ open: true, msg, sev });

    /* ─── fetchers ─────────────────────────────────────────────── */
    const fetchTeam = useCallback(async () => {
        try {
            setLoadingTeam(true);
            const data = await studentApi.getMyTeam();
            setMyTeam(data ?? null);
        } catch {
            setMyTeam(null);
        } finally {
            setLoadingTeam(false);
        }
    }, []);

    const fetchInvitations = useCallback(async () => {
        try {
            setLoadingInv(true);
            const data = await studentApi.getMyInvitations();
            setInvitations(Array.isArray(data) ? data : []);
        } catch {
            setInvitations([]);
        } finally {
            setLoadingInv(false);
        }
    }, []);

    const fetchAvailable = useCallback(async () => {
        try {
            setLoadingAvail(true);
            const data = await studentApi.getAvailableStudents();
            setAvailable(Array.isArray(data) ? data : []);
        } catch {
            setAvailable([]);
        } finally {
            setLoadingAvail(false);
        }
    }, []);

    useEffect(() => {
        fetchTeam();
        fetchInvitations();
    }, [fetchTeam, fetchInvitations]);

    /* load available students only when that tab opens */
    useEffect(() => {
        if (tab === 2 && myTeam) fetchAvailable();
    }, [tab, myTeam, fetchAvailable]);

    /* ─── actions ──────────────────────────────────────────────── */
    const handleAcceptInv = async (joinRequestId) => {
        try {
            setActionBusy(true);
            await studentApi.respondToInvitation(joinRequestId, true);
            snap("Invitation accepted!");
            fetchTeam();
            fetchInvitations();
        } catch (e) {
            snap(e?.response?.data?.message ?? "Failed to accept invitation", "error");
        } finally { setActionBusy(false); }
    };

    const handleDeclineInv = async (joinRequestId) => {
        try {
            setActionBusy(true);
            await studentApi.respondToInvitation(joinRequestId, false);
            snap("Invitation declined.");
            fetchInvitations();
        } catch (e) {
            snap(e?.response?.data?.message ?? "Failed to decline invitation", "error");
        } finally { setActionBusy(false); }
    };

    const handleInviteStudent = async (studentId) => {
        try {
            setActionBusy(true);
            await studentApi.sendInvitation(studentId);
            snap("Invitation sent!");
            fetchAvailable();
            fetchInvitations();
        } catch (e) {
            snap(e?.response?.data?.message ?? "Failed to send invitation", "error");
        } finally { setActionBusy(false); }
    };

    const handleLeave = async () => {
        try {
            setActionBusy(true);
            await studentApi.requestLeave();
            snap("Leave request submitted.");
            setLeaveOpen(false);
            fetchTeam();
        } catch (e) {
            snap(e?.response?.data?.message ?? "Failed to send leave request", "error");
        } finally { setActionBusy(false); }
    };

    /* ─── filtered lists ────────────────────────────────────────── */
    const filteredAvailable = available.filter((s) =>
        (s.fullName ?? s.name ?? "").toLowerCase().includes(searchStr.toLowerCase())
    );

    /* ─── pending invite count badge ───────────────────────────── */
    const pendingCount = invitations.filter(
        (i) => (i.status ?? "Pending") === "Pending"
    ).length;

    /* ══════════════════════════════════════════════════════════════
       LOADING STATE
    ══════════════════════════════════════════════════════════════ */
    if (loadingTeam) {
        return (
            <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Stack alignItems="center" gap={2}>
                    <CircularProgress sx={{ color: ACCENT }} />
                    <Typography sx={{ color: tSec, fontSize: "0.84rem" }}>Loading team info…</Typography>
                </Stack>
            </Box>
        );
    }

    /* ══════════════════════════════════════════════════════════════
       NO TEAM — show join/create options inline (not modal)
    ══════════════════════════════════════════════════════════════ */
    if (!myTeam) {
        return (
            <>
                <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    {/* header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                        <Box>
                            <Typography variant="h2" sx={{ color: tPri, mb: 0.4 }}>My Team</Typography>
                            <Typography sx={{ color: tSec, fontSize: "0.85rem" }}>
                                You are not part of any team yet
                            </Typography>
                        </Box>
                    </Stack>

                    {/* pending invitations — يشوفها حتى لو ما عنده تيم */}
                    {invitations.length > 0 && (
                        <Paper elevation={0} sx={{
                            mb: 3, borderRadius: 3, overflow: "hidden",
                            border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
                            bgcolor: theme.palette.background.paper,
                        }}>
                            <Stack direction="row" alignItems="center" gap={1}
                                sx={{
                                    px: 2.5, py: 1.8,
                                    borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                                    bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)"
                                }}>
                                <Box sx={{ color: ACCENT }}><HowToRegOutlinedIcon sx={{ fontSize: 18 }} /></Box>
                                <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: tPri }}>
                                    Pending Invitations
                                </Typography>
                                {pendingCount > 0 && (
                                    <Chip label={pendingCount} size="small" sx={{
                                        height: 18, fontSize: "0.65rem", fontWeight: 700,
                                        bgcolor: `${ACCENT}18`, color: ACCENT,
                                    }} />
                                )}
                            </Stack>
                            <Stack gap={1} sx={{ p: 2.5 }}>
                                {loadingInv
                                    ? <CircularProgress size={22} sx={{ color: ACCENT, mx: "auto" }} />
                                    : invitations.map((inv, i) => (
                                        <InviteRow key={inv.joinRequestId ?? inv.id ?? i}
                                            inv={inv} busy={actionBusy}
                                            onAccept={handleAcceptInv}
                                            onDecline={handleDeclineInv} />
                                    ))
                                }
                            </Stack>
                        </Paper>
                    )}

                    {/* no-team options */}
                    <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Stack alignItems="center" gap={3} sx={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
                            {/* icon */}
                            <Box sx={{
                                width: 72, height: 72, borderRadius: 4,
                                bgcolor: `${ACCENT}12`,
                                border: `1.5px solid ${ACCENT}30`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <GroupsOutlinedIcon sx={{ fontSize: 34, color: ACCENT }} />
                            </Box>

                            <Box>
                                <Typography fontWeight={700} fontSize="1.05rem" sx={{ color: tPri, mb: 0.6 }}>
                                    You're not in a team yet
                                </Typography>
                                <Typography fontSize="0.84rem" sx={{ color: tSec, lineHeight: 1.7 }}>
                                    Create a new team with a supervisor, or join an existing one to start your graduation project.
                                </Typography>
                            </Box>

                            {/* action cards */}
                            <Stack gap={1.5} width="100%">
                                {/* Create */}
                                <Paper elevation={0} onClick={() => setShowGate(true)}
                                    sx={{
                                        p: 2.2, borderRadius: 2.5, cursor: "pointer",
                                        border: `1.5px solid ${ACCENT}`,
                                        bgcolor: `${ACCENT}08`,
                                        transition: "all 0.15s ease",
                                        "&:hover": { bgcolor: `${ACCENT}14`, transform: "translateY(-1px)" },
                                    }}>
                                    <Stack direction="row" alignItems="center" gap={2}>
                                        <Box sx={{
                                            width: 42, height: 42, borderRadius: 2, flexShrink: 0,
                                            bgcolor: `${ACCENT}18`, border: `1px solid ${ACCENT}35`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            <AddCircleOutlineIcon sx={{ fontSize: 22, color: ACCENT }} />
                                        </Box>
                                        <Box textAlign="left">
                                            <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: tPri }}>
                                                Create or Join a Team
                                            </Typography>
                                            <Typography fontSize="0.77rem" sx={{ color: tSec }}>
                                                Start fresh or browse available teams
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Stack>
                        </Stack>
                    </Box>
                </Box>

                {/* onboarding modals */}
                <JoinOrCreateModal
                    open={showGate}
                    onClose={() => setShowGate(false)}
                    onCreate={() => { setShowGate(false); setShowCreate(true); }}
                    onJoin={() => { setShowGate(false); setShowJoin(true); }}
                />
                <CreateTeamFlow
                    open={showCreate}
                    onClose={() => setShowCreate(false)}
                    onSuccess={(msg) => { snap(msg); setShowCreate(false); fetchTeam(); }}
                />
                <JoinTeamFlow
                    open={showJoin}
                    onClose={() => setShowJoin(false)}
                    onSuccess={(msg) => { snap(msg); setShowJoin(false); fetchTeam(); }}
                />

                <Snackbar open={snack.open} autoHideDuration={3500}
                    onClose={() => setSnack(s => ({ ...s, open: false }))}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                    <Alert severity={snack.sev} variant="filled" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
                </Snackbar>
            </>
        );
    }

    /* ══════════════════════════════════════════════════════════════
       HAS TEAM — full info page
    ══════════════════════════════════════════════════════════════ */
    const members = myTeam.members ?? myTeam.students ?? [];
    const supervisor = myTeam.supervisor ?? myTeam.supervisorName ?? null;
    const project = myTeam.projectTitle ?? myTeam.project ?? myTeam.name ?? "—";
    const status = myTeam.status ?? myTeam.teamStatus ?? null;
    const teamName = myTeam.teamName ?? myTeam.name ?? null;

    return (
        <>
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 2.5 }}>

                {/* ── PAGE HEADER ─────────────────────────────────────── */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="h2" sx={{ color: tPri, mb: 0.4 }}>My Team</Typography>
                        <Typography sx={{ color: tSec, fontSize: "0.85rem" }}>
                            {teamName ? `Team: ${teamName}` : "Your current team & project"}
                        </Typography>
                    </Box>
                    <Stack direction="row" gap={1}>
                        <Tooltip title="Refresh">
                            <IconButton size="small"
                                onClick={() => { fetchTeam(); fetchInvitations(); }}
                                sx={{
                                    color: tSec, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                                    borderRadius: 2, "&:hover": { color: ACCENT }
                                }}>
                                <RefreshOutlinedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                        </Tooltip>
                        <Button
                            size="small" variant="outlined" startIcon={<ExitToAppOutlinedIcon />}
                            onClick={() => setLeaveOpen(true)}
                            sx={{
                                borderColor: "#e57373", color: "#e57373", borderRadius: 2,
                                textTransform: "none", fontWeight: 600, fontSize: "0.78rem",
                                "&:hover": { bgcolor: "rgba(229,115,115,0.08)", borderColor: "#e57373" },
                            }}>
                            Leave Team
                        </Button>
                    </Stack>
                </Stack>

                {/* ── TOP: project + supervisor cards (side by side) ──── */}
                <Stack direction={{ xs: "column", sm: "row" }} gap={2}>

                    {/* Project card */}
                    <Paper elevation={0} sx={{
                        flex: 1, p: 2.5, borderRadius: 3,
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
                        bgcolor: theme.palette.background.paper,
                    }}>
                        <Stack direction="row" alignItems="center" gap={1.2} mb={1.8}>
                            <Box sx={{
                                width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                                bgcolor: `${ACCENT}12`, border: `1px solid ${ACCENT}28`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <FolderOutlinedIcon sx={{ fontSize: 18, color: ACCENT }} />
                            </Box>
                            <Typography fontWeight={700} fontSize="0.85rem" sx={{
                                color: tSec,
                                textTransform: "uppercase", letterSpacing: "0.07em"
                            }}>
                                Project
                            </Typography>
                        </Stack>
                        <Typography fontWeight={700} fontSize="1rem" sx={{ color: tPri, mb: 0.5 }}>
                            {project}
                        </Typography>
                        {status && (
                            <Chip label={status} size="small" sx={{
                                height: 20, fontSize: "0.65rem", fontWeight: 700,
                                bgcolor: status.toLowerCase().includes("approved") ? "rgba(61,185,122,0.12)" :
                                    status.toLowerCase().includes("pending") ? `${ACCENT}15` :
                                        status.toLowerCase().includes("rejected") ? "rgba(229,115,115,0.12)" :
                                            `${ACCENT}12`,
                                color: status.toLowerCase().includes("approved") ? "#3DB97A" :
                                    status.toLowerCase().includes("pending") ? ACCENT :
                                        status.toLowerCase().includes("rejected") ? "#e57373" :
                                            ACCENT,
                            }} />
                        )}
                    </Paper>

                    {/* Supervisor card */}
                    <Paper elevation={0} sx={{
                        flex: 1, p: 2.5, borderRadius: 3,
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
                        bgcolor: theme.palette.background.paper,
                    }}>
                        <Stack direction="row" alignItems="center" gap={1.2} mb={1.8}>
                            <Box sx={{
                                width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                                bgcolor: "rgba(109,138,125,0.12)", border: "1px solid rgba(109,138,125,0.25)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <SchoolOutlinedIcon sx={{ fontSize: 18, color: "#6D8A7D" }} />
                            </Box>
                            <Typography fontWeight={700} fontSize="0.85rem" sx={{
                                color: tSec,
                                textTransform: "uppercase", letterSpacing: "0.07em"
                            }}>
                                Supervisor
                            </Typography>
                        </Stack>
                        {supervisor ? (
                            <Stack direction="row" alignItems="center" gap={1.5}>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: "#6D8A7D", fontWeight: 700, fontSize: "0.9rem" }}>
                                    {initials(
                                        typeof supervisor === "string"
                                            ? supervisor
                                            : supervisor.fullName ?? supervisor.name ?? "?"
                                    )}
                                </Avatar>
                                <Box>
                                    <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: tPri }}>
                                        {typeof supervisor === "string"
                                            ? supervisor
                                            : supervisor.fullName ?? supervisor.name ?? "—"}
                                    </Typography>
                                    {typeof supervisor === "object" && supervisor?.department && (
                                        <Typography fontSize="0.74rem" sx={{ color: tSec }}>
                                            {supervisor.department}
                                        </Typography>
                                    )}
                                </Box>
                            </Stack>
                        ) : (
                            <Typography fontSize="0.84rem" sx={{ color: tSec }}>Not assigned yet</Typography>
                        )}
                    </Paper>
                </Stack>

                {/* ── TABS: Members / Invitations / Invite Students ───── */}
                <Paper elevation={0} sx={{
                    flex: 1, borderRadius: 3, overflow: "hidden",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
                    bgcolor: theme.palette.background.paper,
                    display: "flex", flexDirection: "column",
                }}>
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        sx={{
                            px: 1, minHeight: 44,
                            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                            "& .MuiTab-root": {
                                textTransform: "none", fontWeight: 600, fontSize: "0.82rem",
                                minHeight: 44, color: tSec
                            },
                            "& .Mui-selected": { color: ACCENT },
                            "& .MuiTabs-indicator": { bgcolor: ACCENT, height: 2.5, borderRadius: 2 },
                        }}
                    >
                        <Tab label={
                            <Stack direction="row" alignItems="center" gap={0.7}>
                                <PeopleOutlineIcon sx={{ fontSize: 16 }} />
                                <span>Members ({members.length})</span>
                            </Stack>
                        } />
                        <Tab label={
                            <Stack direction="row" alignItems="center" gap={0.7}>
                                <HowToRegOutlinedIcon sx={{ fontSize: 16 }} />
                                <span>Invitations</span>
                                {pendingCount > 0 && (
                                    <Chip label={pendingCount} size="small" sx={{
                                        height: 16, fontSize: "0.6rem", fontWeight: 700,
                                        bgcolor: `${ACCENT}20`, color: ACCENT,
                                    }} />
                                )}
                            </Stack>
                        } />
                        <Tab label={
                            <Stack direction="row" alignItems="center" gap={0.7}>
                                <PersonAddOutlinedIcon sx={{ fontSize: 16 }} />
                                <span>Invite Students</span>
                            </Stack>
                        } />
                    </Tabs>

                    {/* ── TAB 0: Members ─────────────────────────────────── */}
                    {tab === 0 && (
                        <Box sx={{ p: 2.5, flex: 1, overflowY: "auto" }}>
                            {members.length === 0 ? (
                                <Typography sx={{ color: tSec, fontSize: "0.84rem", textAlign: "center", mt: 4 }}>
                                    No members yet
                                </Typography>
                            ) : (
                                <Stack gap={1.2}>
                                    {members.map((m, i) => {
                                        const name = m.fullName ?? m.name ?? "Student";
                                        const isLeader = m.isLeader ?? m.role === "leader" ?? i === 0;
                                        return (
                                            <Stack key={m.id ?? m.userId ?? i} direction="row" alignItems="center" gap={1.5}
                                                sx={{
                                                    p: 1.5, borderRadius: 2.5,
                                                    border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
                                                    bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                                                }}>
                                                <Avatar sx={{
                                                    width: 40, height: 40, fontWeight: 700,
                                                    bgcolor: MBR_CLR[i % MBR_CLR.length], fontSize: "0.85rem",
                                                }}>
                                                    {initials(name)}
                                                </Avatar>
                                                <Box flex={1} minWidth={0}>
                                                    <Stack direction="row" alignItems="center" gap={0.8}>
                                                        <Typography fontWeight={600} fontSize="0.87rem" noWrap
                                                            sx={{ color: tPri }}>{name}</Typography>
                                                        {isLeader && (
                                                            <Chip label="Leader" size="small" sx={{
                                                                height: 17, fontSize: "0.6rem", fontWeight: 700,
                                                                bgcolor: `${ACCENT}15`, color: ACCENT,
                                                            }} />
                                                        )}
                                                    </Stack>
                                                    <Typography fontSize="0.73rem" noWrap sx={{ color: tSec }}>
                                                        {m.email ?? m.studentId ?? ""}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        );
                                    })}
                                </Stack>
                            )}
                        </Box>
                    )}

                    {/* ── TAB 1: Invitations ─────────────────────────────── */}
                    {tab === 1 && (
                        <Box sx={{ p: 2.5, flex: 1, overflowY: "auto" }}>
                            {loadingInv ? (
                                <Box display="flex" justifyContent="center" pt={4}>
                                    <CircularProgress size={24} sx={{ color: ACCENT }} />
                                </Box>
                            ) : invitations.length === 0 ? (
                                <Typography sx={{ color: tSec, fontSize: "0.84rem", textAlign: "center", mt: 4 }}>
                                    No invitations yet
                                </Typography>
                            ) : (
                                <Stack gap={1.2}>
                                    {invitations.map((inv, i) => (
                                        <InviteRow
                                            key={inv.joinRequestId ?? inv.id ?? i}
                                            inv={inv}
                                            busy={actionBusy}
                                            onAccept={handleAcceptInv}
                                            onDecline={handleDeclineInv}
                                        />
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    )}

                    {/* ── TAB 2: Invite Students ─────────────────────────── */}
                    {tab === 2 && (
                        <Box sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                            {/* search */}
                            <TextField
                                size="small" fullWidth
                                placeholder="Search students…"
                                value={searchStr}
                                onChange={(e) => setSearchStr(e.target.value)}
                                InputProps={{ startAdornment: <SearchOutlinedIcon sx={{ fontSize: 17, color: tSec, mr: 0.8 }} /> }}
                                sx={{
                                    mb: 2,
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 2, fontSize: "0.875rem",
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: ACCENT },
                                    },
                                }}
                            />
                            <Box sx={{ flex: 1, overflowY: "auto" }}>
                                {loadingAvail ? (
                                    <Box display="flex" justifyContent="center" pt={4}>
                                        <CircularProgress size={24} sx={{ color: ACCENT }} />
                                    </Box>
                                ) : filteredAvailable.length === 0 ? (
                                    <Typography sx={{ color: tSec, fontSize: "0.84rem", textAlign: "center", mt: 4 }}>
                                        No available students found
                                    </Typography>
                                ) : (
                                    <Stack gap={1.2}>
                                        {filteredAvailable.map((s, i) => (
                                            <StudentRow
                                                key={s.id ?? s.userId ?? i}
                                                student={s}
                                                busy={actionBusy}
                                                onInvite={handleInviteStudent}
                                            />
                                        ))}
                                    </Stack>
                                )}
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Box>

            {/* ── LEAVE CONFIRM DIALOG ──────────────────────────────── */}
            <Dialog open={leaveOpen} onClose={() => setLeaveOpen(false)} maxWidth="xs" fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
                        bgcolor: theme.palette.background.paper
                    }
                }}>
                <Box sx={{ p: 3 }}>
                    <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: tPri, mb: 0.8 }}>
                        Leave Team?
                    </Typography>
                    <Typography fontSize="0.84rem" sx={{ color: tSec, lineHeight: 1.7, mb: 2.5 }}>
                        A leave request will be submitted. You'll be removed from the team after it's approved.
                    </Typography>
                    <Stack direction="row" gap={1} justifyContent="flex-end">
                        <Button onClick={() => setLeaveOpen(false)}
                            sx={{ textTransform: "none", color: tSec, borderRadius: 2, fontWeight: 500 }}>
                            Cancel
                        </Button>
                        <Button variant="contained" disabled={actionBusy} onClick={handleLeave}
                            sx={{
                                bgcolor: "#e57373", "&:hover": { bgcolor: "#d32f2f", boxShadow: "none" },
                                textTransform: "none", fontWeight: 700, borderRadius: 2,
                                boxShadow: "none", px: 3,
                            }}>
                            {actionBusy
                                ? <CircularProgress size={16} sx={{ color: "#fff" }} />
                                : "Confirm Leave"}
                        </Button>
                    </Stack>
                </Box>
            </Dialog>

            {/* ── SNACKBAR ──────────────────────────────────────────── */}
            <Snackbar open={snack.open} autoHideDuration={3500}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity={snack.sev} variant="filled" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
            </Snackbar>
        </>
    );
}