// src/components/common/student/MyTeam/MyTeamPage.jsx
//
// Student "My Team" page.
//
// Data sources:
//   studentApi.getMyTeam()          → GET /api/Student/my-team
//   studentApi.getMyInvitations()   → GET /api/Student/my-invitations
//   studentApi.getAvailableStudents()→ GET /api/Student/available-students
//   studentApi.getMyJoinRequests()  → GET /api/Student/my-join-requests   (⚠ pending backend, falls back to [])
//   studentApi.getTeamJoinRequests()→ GET /api/Student/team-join-requests  (leader only)
//   studentApi.respondToInvitation()→ POST /api/Student/respond-to-invitation
//   studentApi.respondToJoinRequest()→POST /api/Student/respond-to-join-request
//   studentApi.rejectJoinRequest()  → POST /api/Student/reject-join-request/{requestId}
//   studentApi.sendInvitation()     → POST /api/Student/send-invitation
//   studentApi.requestLeave()       → POST /api/Student/request-leave
//   studentApi.updateProjectInfo()  → PUT  /api/Student/update-project-info
//   studentApi.deleteJoinRequest()  → DELETE /api/Student/delete-join-request/{requestId}

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@mui/material/styles";
import {
    Box, Typography, Stack, Paper, Avatar,
    Button, Chip, Tab, Tabs, CircularProgress,
    Snackbar, Alert, Tooltip, IconButton,
    Dialog, TextField,
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
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import studentApi from "../../../../api/handler/endpoints/studentApi";
import JoinOrCreateModal from "../Onboarding/JoinOrCreateModal";
import CreateTeamFlow from "../Onboarding/CreateTeamFlow";
import JoinTeamFlow from "../Onboarding/JoinTeamFlow";

/* ─── palette ─────────────────────────────────────────────────── */
const ACCENT = "#d0895b";
const MBR_CLR = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8"];

const initials = (name = "") =>
    (name ?? "?")
        .split(" ").map((w) => w[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";

/* ─── status color helper ─────────────────────────────────────── */
const statusColor = (status) => {
    const s = (status ?? "").toLowerCase();
    if (s.includes("accept") || s === "accepted") return { bg: "rgba(61,185,122,0.12)", fg: "#3DB97A" };
    if (s.includes("reject") || s === "rejected") return { bg: "rgba(229,115,115,0.12)", fg: "#e57373" };
    return { bg: `${ACCENT}15`, fg: ACCENT }; // pending
};

/* ─── Invitation row ──────────────────────────────────────────── */
// Used for invitations received by the student FROM a team.
// API shape (GET /api/Student/my-invitations):
// { id, joinRequestId?, teamName, projectTitle, projectDescription?,
//   sender: { userId, fullName, email }, status, sentAt }
function InviteRow({ inv, onAccept, onDecline, busy }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const id = inv.joinRequestId ?? inv.id;
    const teamName = inv.teamName ?? "A team";
    const projectDesc = inv.projectDescription ?? inv.description ?? null;
    const status = inv.status ?? "Pending";
    const sentAt = inv.sentAt ? new Date(inv.sentAt).toLocaleDateString() : null;
    const senderName = inv.sender?.fullName ?? inv.senderName ?? inv.sentBy ?? null;
    const senderEmail = inv.sender?.email ?? inv.senderEmail ?? null;
    const clr = statusColor(status);

    return (
        <Stack direction="row" alignItems="flex-start" gap={1.5}
            sx={{
                p: 1.5, borderRadius: 2,
                border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
                bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
            }}>

            <Avatar sx={{ width: 36, height: 36, bgcolor: MBR_CLR[1], fontSize: "0.72rem", fontWeight: 700, flexShrink: 0 }}>
                {initials(teamName)}
            </Avatar>

            <Box flex={1} minWidth={0}>
                <Typography fontWeight={600} fontSize="0.83rem" noWrap sx={{ color: theme.palette.text.primary }}>
                    <Box component="span" sx={{ color: ACCENT }}>{teamName}</Box>{" "}invited you to join
                </Typography>

                {senderName && (
                    <Typography fontSize="0.75rem" sx={{ color: theme.palette.text.secondary, mt: 0.2 }}>
                        From: <Box component="span" sx={{ fontWeight: 600 }}>{senderName}</Box>
                        {senderEmail && ` · ${senderEmail}`}
                    </Typography>
                )}

                {projectDesc && (
                    <Typography fontSize="0.75rem" sx={{
                        color: theme.palette.text.secondary, mt: 0.4,
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                        {projectDesc}
                    </Typography>
                )}

                <Stack direction="row" alignItems="center" gap={0.8} mt={0.5}>
                    <Chip label={status} size="small" sx={{
                        height: 16, fontSize: "0.6rem", fontWeight: 700,
                        bgcolor: clr.bg, color: clr.fg,
                    }} />
                    {sentAt && (
                        <Typography fontSize="0.68rem" sx={{ color: theme.palette.text.secondary }}>{sentAt}</Typography>
                    )}
                </Stack>
            </Box>

            {/* Accept / Decline — only for pending invitations */}
            {status === "Pending" && (
                <Stack direction="row" gap={0.5} flexShrink={0}>
                    <Tooltip title="Accept">
                        <IconButton size="small" disabled={busy} onClick={() => onAccept(id)}
                            sx={{ color: "#3DB97A", "&:hover": { bgcolor: "rgba(61,185,122,0.1)" } }}>
                            <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Decline">
                        <IconButton size="small" disabled={busy} onClick={() => onDecline(id)}
                            sx={{ color: "#e57373", "&:hover": { bgcolor: "rgba(229,115,115,0.1)" } }}>
                            <CancelOutlinedIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )}
        </Stack>
    );
}

/* ─── My Join Request row ─────────────────────────────────────── */
// Outgoing join requests the student sent to teams.
// API shape (GET /api/Student/my-join-requests):
// { id, joinRequestId?, teamId, teamName, projectTitle, projectDescription?, status, sentAt }
function MyJoinRequestRow({ req, onCancel, busy }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const id = req.joinRequestId ?? req.id;
    const teamName = req.teamName ?? "A team";
    const projectDesc = req.projectDescription ?? req.description ?? null;
    const status = req.status ?? "Pending";
    const sentAt = req.sentAt ? new Date(req.sentAt).toLocaleDateString() : null;
    const clr = statusColor(status);

    return (
        <Stack direction="row" alignItems="flex-start" gap={1.5}
            sx={{
                p: 1.5, borderRadius: 2,
                border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
                bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
            }}>

            {/* outgoing icon */}
            <Box sx={{
                width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                bgcolor: `${ACCENT}12`, border: `1px solid ${ACCENT}28`,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <SendOutlinedIcon sx={{ fontSize: 16, color: ACCENT }} />
            </Box>

            <Box flex={1} minWidth={0}>
                <Typography fontWeight={600} fontSize="0.83rem" noWrap sx={{ color: theme.palette.text.primary }}>
                    Request to join{" "}
                    <Box component="span" sx={{ color: ACCENT }}>{teamName}</Box>
                </Typography>

                {projectDesc && (
                    <Typography fontSize="0.75rem" sx={{
                        color: theme.palette.text.secondary, mt: 0.4,
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                        {projectDesc}
                    </Typography>
                )}

                <Stack direction="row" alignItems="center" gap={0.8} mt={0.5}>
                    <Chip label={status} size="small" sx={{
                        height: 16, fontSize: "0.6rem", fontWeight: 700,
                        bgcolor: clr.bg, color: clr.fg,
                    }} />
                    {sentAt && (
                        <Typography fontSize="0.68rem" sx={{ color: theme.palette.text.secondary }}>{sentAt}</Typography>
                    )}
                </Stack>
            </Box>

            {/* Cancel — only for pending requests (DELETE /api/Student/delete-join-request/{id}) */}
            {status === "Pending" && (
                <Tooltip title="Cancel request">
                    <IconButton size="small" disabled={busy} onClick={() => onCancel(id)}
                        sx={{ color: "#e57373", flexShrink: 0, "&:hover": { bgcolor: "rgba(229,115,115,0.1)" } }}>
                        <DeleteOutlineIcon sx={{ fontSize: 19 }} />
                    </IconButton>
                </Tooltip>
            )}
        </Stack>
    );
}

/* ─── Incoming team join request row (leader view) ────────────── */
// Requests received by the team from students who want to join.
// API shape (GET /api/Student/team-join-requests):
// { id, joinRequestId, studentId, studentName, studentEmail?, status, sentAt }
function TeamJoinRequestRow({ req, onAccept, onReject, busy }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const id = req.joinRequestId ?? req.id;
    const studentName = req.studentName ?? req.fullName ?? "Student";
    const studentEmail = req.studentEmail ?? req.email ?? null;
    const status = req.status ?? "Pending";
    const sentAt = req.sentAt ? new Date(req.sentAt).toLocaleDateString() : null;
    const clr = statusColor(status);

    return (
        <Stack direction="row" alignItems="flex-start" gap={1.5}
            sx={{
                p: 1.5, borderRadius: 2,
                border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
                bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
            }}>

            <Avatar sx={{ width: 36, height: 36, bgcolor: MBR_CLR[3], fontSize: "0.72rem", fontWeight: 700, flexShrink: 0 }}>
                {initials(studentName)}
            </Avatar>

            <Box flex={1} minWidth={0}>
                <Typography fontWeight={600} fontSize="0.83rem" noWrap sx={{ color: theme.palette.text.primary }}>
                    <Box component="span" sx={{ color: ACCENT }}>{studentName}</Box>{" "}wants to join
                </Typography>

                {studentEmail && (
                    <Typography fontSize="0.75rem" sx={{ color: theme.palette.text.secondary, mt: 0.2 }}>
                        {studentEmail}
                    </Typography>
                )}

                <Stack direction="row" alignItems="center" gap={0.8} mt={0.5}>
                    <Chip label={status} size="small" sx={{
                        height: 16, fontSize: "0.6rem", fontWeight: 700,
                        bgcolor: clr.bg, color: clr.fg,
                    }} />
                    {sentAt && (
                        <Typography fontSize="0.68rem" sx={{ color: theme.palette.text.secondary }}>{sentAt}</Typography>
                    )}
                </Stack>
            </Box>

            {/* Accept / Reject — only for pending (POST /api/Student/respond-to-join-request) */}
            {status === "Pending" && (
                <Stack direction="row" gap={0.5} flexShrink={0}>
                    <Tooltip title="Accept">
                        <IconButton size="small" disabled={busy} onClick={() => onAccept(id)}
                            sx={{ color: "#3DB97A", "&:hover": { bgcolor: "rgba(61,185,122,0.1)" } }}>
                            <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject">
                        <IconButton size="small" disabled={busy} onClick={() => onReject(id)}
                            sx={{ color: "#e57373", "&:hover": { bgcolor: "rgba(229,115,115,0.1)" } }}>
                            <CancelOutlinedIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )}
        </Stack>
    );
}

/* ─── Available student row ───────────────────────────────────── */
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
                <Typography fontWeight={600} fontSize="0.82rem" noWrap sx={{ color: theme.palette.text.primary }}>{name}</Typography>
                <Typography fontSize="0.72rem" noWrap sx={{ color: theme.palette.text.secondary }}>
                    {student.email ?? student.studentId ?? ""}
                </Typography>
            </Box>
            <Tooltip title="Send invitation">
                <span>
                    <IconButton size="small" disabled={busy}
                        onClick={() => onInvite(student.userId ?? student.id)}
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
    const [myTeam, setMyTeam] = useState(null);
    const [invitations, setInvitations] = useState([]);        // invitations received by student
    const [myJoinRequests, setMyJoinRequests] = useState([]);  // join requests student sent to teams
    const [teamJoinRequests, setTeamJoinRequests] = useState([]); // join requests received by team (leader)
    const [available, setAvailable] = useState([]);

    /* ── loading ── */
    const [loadingTeam, setLoadingTeam] = useState(true);
    const [loadingInv, setLoadingInv] = useState(false);
    const [loadingMyJoinReqs, setLoadingMyJoinReqs] = useState(false);
    const [loadingTeamJoinReqs, setLoadingTeamJoinReqs] = useState(false);
    const [loadingAvail, setLoadingAvail] = useState(false);
    const [actionBusy, setActionBusy] = useState(false);

    /* ── UI ── */
    const [tab, setTab] = useState(0);
    const [searchStr, setSearchStr] = useState("");

    /* ── onboarding modals ── */
    const [showGate, setShowGate] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);

    /* ── leave confirm ── */
    const [leaveOpen, setLeaveOpen] = useState(false);

    /* ── edit project info dialog ── */
    const [editOpen, setEditOpen] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editBusy, setEditBusy] = useState(false);

    /* ── snackbar ── */
    const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
    const snap = (msg, sev = "success") => setSnack({ open: true, msg, sev });

    /* ─── style helpers ─────────────────────────────────────────── */
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const paperBg = theme.palette.background.paper;

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: 2, fontSize: "0.875rem",
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: ACCENT },
        },
        "& .MuiInputLabel-root.Mui-focused": { color: ACCENT },
        "& .MuiInputLabel-root": { fontSize: "0.875rem" },
    };

    /* ─── fetchers ──────────────────────────────────────────────── */
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

    // Invitations the student received from teams
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

    // Join requests the student sent to teams (outgoing)
    // GET /api/Student/my-join-requests — falls back to [] until backend ships
    const fetchMyJoinRequests = useCallback(async () => {
        try {
            setLoadingMyJoinReqs(true);
            const data = await studentApi.getMyJoinRequests();
            setMyJoinRequests(Array.isArray(data) ? data : []);
        } catch {
            setMyJoinRequests([]);
        } finally {
            setLoadingMyJoinReqs(false);
        }
    }, []);

    // Join requests the team received from students (incoming — leader only)
    // GET /api/Student/team-join-requests
    const fetchTeamJoinRequests = useCallback(async () => {
        try {
            setLoadingTeamJoinReqs(true);
            const data = await studentApi.getTeamJoinRequests();
            setTeamJoinRequests(Array.isArray(data) ? data : []);
        } catch {
            setTeamJoinRequests([]);
        } finally {
            setLoadingTeamJoinReqs(false);
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

    // Initial load — always fetch team, invitations, and outgoing join requests
    useEffect(() => {
        fetchTeam();
        fetchInvitations();
        fetchMyJoinRequests();
    }, [fetchTeam, fetchInvitations, fetchMyJoinRequests]);

    // Load tab-specific data lazily
    useEffect(() => {
        if (!myTeam) return;
        if (tab === 2) fetchAvailable();           // Invite Students tab
        if (tab === 3) fetchTeamJoinRequests();    // Join Requests (leader) tab
    }, [tab, myTeam, fetchAvailable, fetchTeamJoinRequests]);

    /* ─── derived ───────────────────────────────────────────────── */
    const isLeader = (myTeam?.members ?? []).some((m) => m.isLeader && m.userId === myTeam?.currentUserId)
        || myTeam?.isLeader
        || false;

    const filteredAvailable = available.filter((s) =>
        (s.fullName ?? s.name ?? "").toLowerCase().includes(searchStr.toLowerCase())
    );

    // Badge counts for tabs
    const pendingInvCount = invitations.filter((i) => (i.status ?? "Pending") === "Pending").length;
    const pendingMyJoinCount = myJoinRequests.filter((r) => (r.status ?? "Pending") === "Pending").length;
    const pendingTeamJoinCount = teamJoinRequests.filter((r) => (r.status ?? "Pending") === "Pending").length;

    /* ─── open edit dialog — pre-fill current values ────────────── */
    const openEdit = () => {
        setEditTitle(myTeam?.projectTitle ?? myTeam?.project ?? "");
        setEditDesc(myTeam?.projectDescription ?? myTeam?.description ?? "");
        setEditOpen(true);
    };

    /* ─── save project info (PUT /api/Student/update-project-info) ─ */
    const handleSaveProjectInfo = async () => {
        if (!editTitle.trim()) { snap("Project title cannot be empty.", "error"); return; }
        try {
            setEditBusy(true);
            await studentApi.updateProjectInfo({
                projectTitle: editTitle.trim(),
                projectDescription: editDesc.trim(),
            });
            snap("Project info updated!");
            setEditOpen(false);
            fetchTeam();
        } catch (e) {
            snap(e?.response?.data?.message ?? "Failed to update project info.", "error");
        } finally {
            setEditBusy(false);
        }
    };

    /* ─── invitation actions ────────────────────────────────────── */

    // POST /api/Student/respond-to-invitation  (isAccepted: true)
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

    // POST /api/Student/respond-to-invitation  (isAccepted: false)
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

    /* ─── outgoing join request actions ─────────────────────────── */

    // DELETE /api/Student/delete-join-request/{requestId}
    const handleCancelJoinRequest = async (requestId) => {
        try {
            setActionBusy(true);
            await studentApi.deleteJoinRequest(requestId);
            snap("Join request cancelled.");
            fetchMyJoinRequests();
        } catch (e) {
            snap(e?.response?.data?.message ?? "Failed to cancel request", "error");
        } finally { setActionBusy(false); }
    };

    /* ─── incoming team join request actions (leader) ────────────── */

    // POST /api/Student/respond-to-join-request  (isAccepted: true)
    const handleAcceptTeamJoinReq = async (joinRequestId) => {
        try {
            setActionBusy(true);
            await studentApi.respondToJoinRequest(joinRequestId, true);
            snap("Join request accepted!");
            fetchTeam();
            fetchTeamJoinRequests();
        } catch (e) {
            snap(e?.response?.data?.message ?? "Failed to accept request", "error");
        } finally { setActionBusy(false); }
    };

    // POST /api/Student/reject-join-request/{requestId}
    const handleRejectTeamJoinReq = async (joinRequestId) => {
        try {
            setActionBusy(true);
            await studentApi.rejectJoinRequest(joinRequestId);
            snap("Join request rejected.");
            fetchTeamJoinRequests();
        } catch (e) {
            snap(e?.response?.data?.message ?? "Failed to reject request", "error");
        } finally { setActionBusy(false); }
    };

    /* ─── invite student (POST /api/Student/send-invitation) ────── */
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

    /* ─── leave team (POST /api/Student/request-leave) ─────────── */
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

    /* ══════════════════════════════════════════════════════════════
       LOADING
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
       NO TEAM
    ══════════════════════════════════════════════════════════════ */
    if (!myTeam) {
        return (
            <>
                <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                        <Box>
                            <Typography variant="h2" sx={{ color: tPri, mb: 0.4 }}>My Team</Typography>
                            <Typography sx={{ color: tSec, fontSize: "0.85rem" }}>
                                You are not part of any team yet
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Invitations received — visible even without a team */}
                    {invitations.length > 0 && (
                        <Paper elevation={0} sx={{
                            mb: 3, borderRadius: 3, overflow: "hidden",
                            border: `1px solid ${border}`, bgcolor: paperBg,
                        }}>
                            <Stack direction="row" alignItems="center" gap={1} sx={{
                                px: 2.5, py: 1.8,
                                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                                bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                            }}>
                                <Box sx={{ color: ACCENT }}><HowToRegOutlinedIcon sx={{ fontSize: 18 }} /></Box>
                                <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: tPri }}>
                                    Pending Invitations
                                </Typography>
                                {pendingInvCount > 0 && (
                                    <Chip label={pendingInvCount} size="small" sx={{
                                        height: 18, fontSize: "0.65rem", fontWeight: 700,
                                        bgcolor: `${ACCENT}18`, color: ACCENT,
                                    }} />
                                )}
                            </Stack>
                            <Stack gap={1} sx={{ p: 2.5 }}>
                                {loadingInv
                                    ? <CircularProgress size={22} sx={{ color: ACCENT, mx: "auto" }} />
                                    : invitations.map((inv, i) => (
                                        <InviteRow
                                            key={inv.joinRequestId ?? inv.id ?? i}
                                            inv={inv} busy={actionBusy}
                                            onAccept={handleAcceptInv}
                                            onDecline={handleDeclineInv}
                                        />
                                    ))
                                }
                            </Stack>
                        </Paper>
                    )}

                    {/* Outgoing join requests — visible even without a team */}
                    {myJoinRequests.length > 0 && (
                        <Paper elevation={0} sx={{
                            mb: 3, borderRadius: 3, overflow: "hidden",
                            border: `1px solid ${border}`, bgcolor: paperBg,
                        }}>
                            <Stack direction="row" alignItems="center" gap={1} sx={{
                                px: 2.5, py: 1.8,
                                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                                bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                            }}>
                                <Box sx={{ color: ACCENT }}><SendOutlinedIcon sx={{ fontSize: 18 }} /></Box>
                                <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: tPri }}>
                                    My Join Requests
                                </Typography>
                                {pendingMyJoinCount > 0 && (
                                    <Chip label={pendingMyJoinCount} size="small" sx={{
                                        height: 18, fontSize: "0.65rem", fontWeight: 700,
                                        bgcolor: `${ACCENT}18`, color: ACCENT,
                                    }} />
                                )}
                            </Stack>
                            <Stack gap={1} sx={{ p: 2.5 }}>
                                {loadingMyJoinReqs
                                    ? <CircularProgress size={22} sx={{ color: ACCENT, mx: "auto" }} />
                                    : myJoinRequests.map((req, i) => (
                                        <MyJoinRequestRow
                                            key={req.joinRequestId ?? req.id ?? i}
                                            req={req} busy={actionBusy}
                                            onCancel={handleCancelJoinRequest}
                                        />
                                    ))
                                }
                            </Stack>
                        </Paper>
                    )}

                    {/* CTA */}
                    <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Stack alignItems="center" gap={3} sx={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
                            <Box sx={{
                                width: 72, height: 72, borderRadius: 4,
                                bgcolor: `${ACCENT}12`, border: `1.5px solid ${ACCENT}30`,
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
                            <Stack gap={1.5} width="100%">
                                <Paper elevation={0} onClick={() => setShowGate(true)}
                                    sx={{
                                        p: 2.2, borderRadius: 2.5, cursor: "pointer",
                                        border: `1.5px solid ${ACCENT}`, bgcolor: `${ACCENT}08`,
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
                    onSuccess={(msg) => { snap(msg); setShowJoin(false); fetchTeam(); fetchMyJoinRequests(); }}
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
       HAS TEAM
    ══════════════════════════════════════════════════════════════ */
    const members = myTeam.members ?? myTeam.students ?? [];
    const supervisor = myTeam.supervisor ?? myTeam.supervisorName ?? null;
    const project = myTeam.projectTitle ?? myTeam.project ?? "—";
    const projectDesc = myTeam.projectDescription ?? myTeam.description ?? null;
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
                                onClick={() => {
                                    fetchTeam();
                                    fetchInvitations();
                                    fetchMyJoinRequests();
                                    if (myTeam) fetchTeamJoinRequests();
                                }}
                                sx={{
                                    color: tSec, border: `1px solid ${border}`,
                                    borderRadius: 2, "&:hover": { color: ACCENT },
                                }}>
                                <RefreshOutlinedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                        </Tooltip>
                        <Button size="small" variant="outlined"
                            startIcon={<ExitToAppOutlinedIcon />}
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

                {/* ── TOP CARDS: Project + Supervisor ─────────────────── */}
                <Stack direction={{ xs: "column", sm: "row" }} gap={2}>

                    {/* Project card */}
                    <Paper elevation={0} sx={{ flex: 1, p: 2.5, borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.8}>
                            <Stack direction="row" alignItems="center" gap={1.2}>
                                <Box sx={{
                                    width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                                    bgcolor: `${ACCENT}12`, border: `1px solid ${ACCENT}28`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <FolderOutlinedIcon sx={{ fontSize: 18, color: ACCENT }} />
                                </Box>
                                <Typography fontWeight={700} fontSize="0.85rem" sx={{
                                    color: tSec, textTransform: "uppercase", letterSpacing: "0.07em",
                                }}>Project</Typography>
                            </Stack>
                            <Tooltip title="Edit project info">
                                <IconButton size="small" onClick={openEdit}
                                    sx={{ color: tSec, borderRadius: 1.5, "&:hover": { color: ACCENT, bgcolor: `${ACCENT}10` } }}>
                                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                        </Stack>

                        <Typography fontWeight={700} fontSize="1rem" sx={{ color: tPri, mb: 0.5 }}>{project}</Typography>

                        {projectDesc && (
                            <Typography fontSize="0.78rem" sx={{
                                color: tSec, lineHeight: 1.6, mb: 0.8,
                                display: "-webkit-box", WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical", overflow: "hidden",
                            }}>{projectDesc}</Typography>
                        )}

                        {status && (
                            <Chip label={status} size="small" sx={{
                                height: 20, fontSize: "0.65rem", fontWeight: 700,
                                bgcolor: status.toLowerCase().includes("approved") ? "rgba(61,185,122,0.12)" :
                                    status.toLowerCase().includes("pending") ? `${ACCENT}15` :
                                        status.toLowerCase().includes("rejected") ? "rgba(229,115,115,0.12)" : `${ACCENT}12`,
                                color: status.toLowerCase().includes("approved") ? "#3DB97A" :
                                    status.toLowerCase().includes("pending") ? ACCENT :
                                        status.toLowerCase().includes("rejected") ? "#e57373" : ACCENT,
                            }} />
                        )}
                    </Paper>

                    {/* Supervisor card */}
                    <Paper elevation={0} sx={{ flex: 1, p: 2.5, borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg }}>
                        <Stack direction="row" alignItems="center" gap={1.2} mb={1.8}>
                            <Box sx={{
                                width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                                bgcolor: "rgba(109,138,125,0.12)", border: "1px solid rgba(109,138,125,0.25)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <SchoolOutlinedIcon sx={{ fontSize: 18, color: "#6D8A7D" }} />
                            </Box>
                            <Typography fontWeight={700} fontSize="0.85rem" sx={{
                                color: tSec, textTransform: "uppercase", letterSpacing: "0.07em",
                            }}>Supervisor</Typography>
                        </Stack>

                        {supervisor ? (
                            <Stack direction="row" alignItems="center" gap={1.5}>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: "#6D8A7D", fontWeight: 700, fontSize: "0.9rem" }}>
                                    {initials(typeof supervisor === "string" ? supervisor : supervisor.fullName ?? supervisor.name ?? "?")}
                                </Avatar>
                                <Box>
                                    <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: tPri }}>
                                        {typeof supervisor === "string" ? supervisor : supervisor.fullName ?? supervisor.name ?? "—"}
                                    </Typography>
                                    {typeof supervisor === "object" && supervisor?.department && (
                                        <Typography fontSize="0.74rem" sx={{ color: tSec }}>{supervisor.department}</Typography>
                                    )}
                                </Box>
                            </Stack>
                        ) : (
                            <Typography fontSize="0.84rem" sx={{ color: tSec }}>Not assigned yet</Typography>
                        )}
                    </Paper>
                </Stack>

                {/* ── TABS ────────────────────────────────────────────── */}
                <Paper elevation={0} sx={{
                    flex: 1, borderRadius: 3, overflow: "hidden",
                    border: `1px solid ${border}`, bgcolor: paperBg,
                    display: "flex", flexDirection: "column",
                }}>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
                        px: 1, minHeight: 44,
                        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                        "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.82rem", minHeight: 44, color: tSec },
                        "& .Mui-selected": { color: ACCENT },
                        "& .MuiTabs-indicator": { bgcolor: ACCENT, height: 2.5, borderRadius: 2 },
                    }}>
                        {/* Tab 0 — Members */}
                        <Tab label={
                            <Stack direction="row" alignItems="center" gap={0.7}>
                                <PeopleOutlineIcon sx={{ fontSize: 16 }} />
                                <span>Members ({members.length})</span>
                            </Stack>
                        } />

                        {/* Tab 1 — Invitations received by the student */}
                        <Tab label={
                            <Stack direction="row" alignItems="center" gap={0.7}>
                                <HowToRegOutlinedIcon sx={{ fontSize: 16 }} />
                                <span>Invitations</span>
                                {pendingInvCount > 0 && (
                                    <Chip label={pendingInvCount} size="small" sx={{
                                        height: 16, fontSize: "0.6rem", fontWeight: 700,
                                        bgcolor: `${ACCENT}20`, color: ACCENT,
                                    }} />
                                )}
                            </Stack>
                        } />

                        {/* Tab 2 — Invite students (send invitation to available students) */}
                        <Tab label={
                            <Stack direction="row" alignItems="center" gap={0.7}>
                                <PersonAddOutlinedIcon sx={{ fontSize: 16 }} />
                                <span>Invite Students</span>
                            </Stack>
                        } />

                        {/* Tab 3 — Incoming join requests to the team (leader only) */}
                        <Tab label={
                            <Stack direction="row" alignItems="center" gap={0.7}>
                                <SendOutlinedIcon sx={{ fontSize: 16 }} />
                                <span>Join Requests</span>
                                {pendingTeamJoinCount > 0 && (
                                    <Chip label={pendingTeamJoinCount} size="small" sx={{
                                        height: 16, fontSize: "0.6rem", fontWeight: 700,
                                        bgcolor: `${ACCENT}20`, color: ACCENT,
                                    }} />
                                )}
                            </Stack>
                        } />

                        {/* Tab 4 — Outgoing join requests the student sent */}
                        <Tab label={
                            <Stack direction="row" alignItems="center" gap={0.7}>
                                <SendOutlinedIcon sx={{ fontSize: 16, transform: "scaleX(-1)" }} />
                                <span>My Requests</span>
                                {pendingMyJoinCount > 0 && (
                                    <Chip label={pendingMyJoinCount} size="small" sx={{
                                        height: 16, fontSize: "0.6rem", fontWeight: 700,
                                        bgcolor: `${ACCENT}20`, color: ACCENT,
                                    }} />
                                )}
                            </Stack>
                        } />
                    </Tabs>

                    {/* ── TAB 0: Members ──────────────────────────────── */}
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
                                        const leader = m.isLeader ?? m.role === "leader" ?? i === 0;
                                        return (
                                            <Stack key={m.userId ?? m.id ?? i} direction="row" alignItems="center" gap={1.5}
                                                sx={{
                                                    p: 1.5, borderRadius: 2.5,
                                                    border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
                                                    bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                                                }}>
                                                <Avatar sx={{ width: 40, height: 40, fontWeight: 700, bgcolor: MBR_CLR[i % MBR_CLR.length], fontSize: "0.85rem" }}>
                                                    {initials(name)}
                                                </Avatar>
                                                <Box flex={1} minWidth={0}>
                                                    <Stack direction="row" alignItems="center" gap={0.8}>
                                                        <Typography fontWeight={600} fontSize="0.87rem" noWrap sx={{ color: tPri }}>{name}</Typography>
                                                        {leader && (
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

                    {/* ── TAB 1: Invitations received ─────────────────── */}
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
                                            inv={inv} busy={actionBusy}
                                            onAccept={handleAcceptInv}
                                            onDecline={handleDeclineInv}
                                        />
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    )}

                    {/* ── TAB 2: Invite Students ──────────────────────── */}
                    {tab === 2 && (
                        <Box sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                            <TextField size="small" fullWidth placeholder="Search students…"
                                value={searchStr} onChange={(e) => setSearchStr(e.target.value)}
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
                                            <StudentRow key={s.userId ?? s.id ?? i} student={s} busy={actionBusy} onInvite={handleInviteStudent} />
                                        ))}
                                    </Stack>
                                )}
                            </Box>
                        </Box>
                    )}

                    {/* ── TAB 3: Incoming join requests (leader) ───────── */}
                    {/* Students who requested to join this team — leader accepts/rejects */}
                    {tab === 3 && (
                        <Box sx={{ p: 2.5, flex: 1, overflowY: "auto" }}>
                            {loadingTeamJoinReqs ? (
                                <Box display="flex" justifyContent="center" pt={4}>
                                    <CircularProgress size={24} sx={{ color: ACCENT }} />
                                </Box>
                            ) : teamJoinRequests.length === 0 ? (
                                <Typography sx={{ color: tSec, fontSize: "0.84rem", textAlign: "center", mt: 4 }}>
                                    No join requests yet
                                </Typography>
                            ) : (
                                <Stack gap={1.2}>
                                    {teamJoinRequests.map((req, i) => (
                                        <TeamJoinRequestRow
                                            key={req.joinRequestId ?? req.id ?? i}
                                            req={req} busy={actionBusy}
                                            onAccept={handleAcceptTeamJoinReq}
                                            onReject={handleRejectTeamJoinReq}
                                        />
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    )}

                    {/* ── TAB 4: My outgoing join requests ────────────── */}
                    {/* Join requests the current student sent to other teams */}
                    {tab === 4 && (
                        <Box sx={{ p: 2.5, flex: 1, overflowY: "auto" }}>
                            {loadingMyJoinReqs ? (
                                <Box display="flex" justifyContent="center" pt={4}>
                                    <CircularProgress size={24} sx={{ color: ACCENT }} />
                                </Box>
                            ) : myJoinRequests.length === 0 ? (
                                <Typography sx={{ color: tSec, fontSize: "0.84rem", textAlign: "center", mt: 4 }}>
                                    You haven't sent any join requests
                                </Typography>
                            ) : (
                                <Stack gap={1.2}>
                                    {myJoinRequests.map((req, i) => (
                                        <MyJoinRequestRow
                                            key={req.joinRequestId ?? req.id ?? i}
                                            req={req} busy={actionBusy}
                                            onCancel={handleCancelJoinRequest}
                                        />
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    )}
                </Paper>
            </Box>

            {/* ══ EDIT PROJECT INFO DIALOG ═══════════════════════════ */}
            {/* PUT /api/Student/update-project-info */}
            <Dialog open={editOpen} onClose={() => !editBusy && setEditOpen(false)}
                maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg } }}>
                <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${border}` }}>
                    <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: tPri }}>Edit Project Info</Typography>
                </Box>
                <Box sx={{ px: 3, py: 2.5 }}>
                    <Stack gap={2}>
                        <TextField label="Project Title" size="small" fullWidth required
                            value={editTitle} onChange={(e) => setEditTitle(e.target.value)} sx={inputSx} />
                        <TextField label="Project Description" size="small" fullWidth multiline rows={3}
                            value={editDesc} onChange={(e) => setEditDesc(e.target.value)} sx={inputSx} />
                    </Stack>
                </Box>
                <Box sx={{ px: 3, pb: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <Button disabled={editBusy} onClick={() => setEditOpen(false)}
                        sx={{ color: tSec, textTransform: "none", fontWeight: 500, borderRadius: 2 }}>Cancel</Button>
                    <Button variant="contained" disabled={editBusy} onClick={handleSaveProjectInfo}
                        sx={{ bgcolor: ACCENT, "&:hover": { bgcolor: "#b06f47", boxShadow: "none" }, textTransform: "none", fontWeight: 700, borderRadius: 2, boxShadow: "none" }}>
                        {editBusy ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Save"}
                    </Button>
                </Box>
            </Dialog>

            {/* ══ LEAVE CONFIRM DIALOG ═══════════════════════════════ */}
            <Dialog open={leaveOpen} onClose={() => setLeaveOpen(false)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg } }}>
                <Box sx={{ p: 3 }}>
                    <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: tPri, mb: 0.8 }}>Leave Team?</Typography>
                    <Typography fontSize="0.84rem" sx={{ color: tSec, lineHeight: 1.7, mb: 2.5 }}>
                        A leave request will be submitted. You'll be removed from the team after it's approved.
                    </Typography>
                    <Stack direction="row" gap={1} justifyContent="flex-end">
                        <Button onClick={() => setLeaveOpen(false)}
                            sx={{ textTransform: "none", color: tSec, borderRadius: 2, fontWeight: 500 }}>Cancel</Button>
                        <Button variant="contained" disabled={actionBusy} onClick={handleLeave}
                            sx={{ bgcolor: "#e57373", "&:hover": { bgcolor: "#d32f2f", boxShadow: "none" }, textTransform: "none", fontWeight: 700, borderRadius: 2, boxShadow: "none", px: 3 }}>
                            {actionBusy ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Confirm Leave"}
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