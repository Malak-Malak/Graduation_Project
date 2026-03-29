// // src/components/common/student/MyTeam/MyTeamPage.jsx
// //
// // Student "My Team" page.
// //
// // Data sources:
// //   studentApi.getMyTeam()          → GET /api/Student/my-team
// //   studentApi.getMyInvitations()   → GET /api/Student/my-invitations
// //   studentApi.getAvailableStudents()→ GET /api/Student/available-students
// //   studentApi.getMyJoinRequests()  → GET /api/Student/my-join-requests   (⚠ pending backend, falls back to [])
// //   studentApi.getTeamJoinRequests()→ GET /api/Student/team-join-requests  (leader only)
// //   studentApi.respondToInvitation()→ POST /api/Student/respond-to-invitation
// //   studentApi.respondToJoinRequest()→POST /api/Student/respond-to-join-request
// //   studentApi.rejectJoinRequest()  → POST /api/Student/reject-join-request/{requestId}
// //   studentApi.sendInvitation()     → POST /api/Student/send-invitation
// //   studentApi.requestLeave()       → POST /api/Student/request-leave
// //   studentApi.updateProjectInfo()  → PUT  /api/Student/update-project-info
// //   studentApi.deleteJoinRequest()  → DELETE /api/Student/delete-join-request/{requestId}

// import { useState, useEffect, useCallback } from "react";
// import { useTheme } from "@mui/material/styles";
// import {
//     Box, Typography, Stack, Paper, Avatar,
//     Button, Chip, Tab, Tabs, CircularProgress,
//     Snackbar, Alert, Tooltip, IconButton,
//     Dialog, TextField,
// } from "@mui/material";

// import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
// import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
// import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
// import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
// import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
// import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
// import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
// import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
// import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
// import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
// import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
// import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
// import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
// import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

// import studentApi from "../../../../api/handler/endpoints/studentApi";
// import JoinOrCreateModal from "../Onboarding/JoinOrCreateModal";
// import CreateTeamFlow from "../Onboarding/CreateTeamFlow";
// import JoinTeamFlow from "../Onboarding/JoinTeamFlow";

// /* ─── palette ─────────────────────────────────────────────────── */
// const ACCENT = "#d0895b";
// const MBR_CLR = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8"];

// const initials = (name = "") =>
//     (name ?? "?")
//         .split(" ").map((w) => w[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";

// /* ─── status color helper ─────────────────────────────────────── */
// const statusColor = (status) => {
//     const s = (status ?? "").toLowerCase();
//     if (s.includes("accept") || s === "accepted") return { bg: "rgba(61,185,122,0.12)", fg: "#3DB97A" };
//     if (s.includes("reject") || s === "rejected") return { bg: "rgba(229,115,115,0.12)", fg: "#e57373" };
//     return { bg: `${ACCENT}15`, fg: ACCENT }; // pending
// };

// /* ─── Invitation row ──────────────────────────────────────────── */
// // Used for invitations received by the student FROM a team.
// // API shape (GET /api/Student/my-invitations):
// // { id, joinRequestId?, teamName, projectTitle, projectDescription?,
// //   sender: { userId, fullName, email }, status, sentAt }
// function InviteRow({ inv, onAccept, onDecline, busy }) {
//     const theme = useTheme();
//     const isDark = theme.palette.mode === "dark";

//     const id = inv.joinRequestId ?? inv.id;
//     const teamName = inv.teamName ?? "A team";
//     const projectDesc = inv.projectDescription ?? inv.description ?? null;
//     const status = inv.status ?? "Pending";
//     const sentAt = inv.sentAt ? new Date(inv.sentAt).toLocaleDateString() : null;
//     const senderName = inv.sender?.fullName ?? inv.senderName ?? inv.sentBy ?? null;
//     const senderEmail = inv.sender?.email ?? inv.senderEmail ?? null;
//     const clr = statusColor(status);

//     return (
//         <Stack direction="row" alignItems="flex-start" gap={1.5}
//             sx={{
//                 p: 1.5, borderRadius: 2,
//                 border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
//                 bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
//             }}>

//             <Avatar sx={{ width: 36, height: 36, bgcolor: MBR_CLR[1], fontSize: "0.72rem", fontWeight: 700, flexShrink: 0 }}>
//                 {initials(teamName)}
//             </Avatar>

//             <Box flex={1} minWidth={0}>
//                 <Typography fontWeight={600} fontSize="0.83rem" noWrap sx={{ color: theme.palette.text.primary }}>
//                     <Box component="span" sx={{ color: ACCENT }}>{teamName}</Box>{" "}invited you to join
//                 </Typography>

//                 {senderName && (
//                     <Typography fontSize="0.75rem" sx={{ color: theme.palette.text.secondary, mt: 0.2 }}>
//                         From: <Box component="span" sx={{ fontWeight: 600 }}>{senderName}</Box>
//                         {senderEmail && ` · ${senderEmail}`}
//                     </Typography>
//                 )}

//                 {projectDesc && (
//                     <Typography fontSize="0.75rem" sx={{
//                         color: theme.palette.text.secondary, mt: 0.4,
//                         display: "-webkit-box", WebkitLineClamp: 2,
//                         WebkitBoxOrient: "vertical", overflow: "hidden",
//                     }}>
//                         {projectDesc}
//                     </Typography>
//                 )}

//                 <Stack direction="row" alignItems="center" gap={0.8} mt={0.5}>
//                     <Chip label={status} size="small" sx={{
//                         height: 16, fontSize: "0.6rem", fontWeight: 700,
//                         bgcolor: clr.bg, color: clr.fg,
//                     }} />
//                     {sentAt && (
//                         <Typography fontSize="0.68rem" sx={{ color: theme.palette.text.secondary }}>{sentAt}</Typography>
//                     )}
//                 </Stack>
//             </Box>

//             {/* Accept / Decline — only for pending invitations */}
//             {status === "Pending" && (
//                 <Stack direction="row" gap={0.5} flexShrink={0}>
//                     <Tooltip title="Accept">
//                         <IconButton size="small" disabled={busy} onClick={() => onAccept(id)}
//                             sx={{ color: "#3DB97A", "&:hover": { bgcolor: "rgba(61,185,122,0.1)" } }}>
//                             <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
//                         </IconButton>
//                     </Tooltip>
//                     <Tooltip title="Decline">
//                         <IconButton size="small" disabled={busy} onClick={() => onDecline(id)}
//                             sx={{ color: "#e57373", "&:hover": { bgcolor: "rgba(229,115,115,0.1)" } }}>
//                             <CancelOutlinedIcon sx={{ fontSize: 20 }} />
//                         </IconButton>
//                     </Tooltip>
//                 </Stack>
//             )}
//         </Stack>
//     );
// }

// /* ─── My Join Request row ─────────────────────────────────────── */
// // Outgoing join requests the student sent to teams.
// // API shape (GET /api/Student/my-join-requests):
// // { id, joinRequestId?, teamId, teamName, projectTitle, projectDescription?, status, sentAt }
// function MyJoinRequestRow({ req, onCancel, busy }) {
//     const theme = useTheme();
//     const isDark = theme.palette.mode === "dark";

//     const id = req.joinRequestId ?? req.id;
//     const teamName = req.teamName ?? "A team";
//     const projectDesc = req.projectDescription ?? req.description ?? null;
//     const status = req.status ?? "Pending";
//     const sentAt = req.sentAt ? new Date(req.sentAt).toLocaleDateString() : null;
//     const clr = statusColor(status);

//     return (
//         <Stack direction="row" alignItems="flex-start" gap={1.5}
//             sx={{
//                 p: 1.5, borderRadius: 2,
//                 border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
//                 bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
//             }}>

//             {/* outgoing icon */}
//             <Box sx={{
//                 width: 36, height: 36, borderRadius: 2, flexShrink: 0,
//                 bgcolor: `${ACCENT}12`, border: `1px solid ${ACCENT}28`,
//                 display: "flex", alignItems: "center", justifyContent: "center",
//             }}>
//                 <SendOutlinedIcon sx={{ fontSize: 16, color: ACCENT }} />
//             </Box>

//             <Box flex={1} minWidth={0}>
//                 <Typography fontWeight={600} fontSize="0.83rem" noWrap sx={{ color: theme.palette.text.primary }}>
//                     Request to join{" "}
//                     <Box component="span" sx={{ color: ACCENT }}>{teamName}</Box>
//                 </Typography>

//                 {projectDesc && (
//                     <Typography fontSize="0.75rem" sx={{
//                         color: theme.palette.text.secondary, mt: 0.4,
//                         display: "-webkit-box", WebkitLineClamp: 2,
//                         WebkitBoxOrient: "vertical", overflow: "hidden",
//                     }}>
//                         {projectDesc}
//                     </Typography>
//                 )}

//                 <Stack direction="row" alignItems="center" gap={0.8} mt={0.5}>
//                     <Chip label={status} size="small" sx={{
//                         height: 16, fontSize: "0.6rem", fontWeight: 700,
//                         bgcolor: clr.bg, color: clr.fg,
//                     }} />
//                     {sentAt && (
//                         <Typography fontSize="0.68rem" sx={{ color: theme.palette.text.secondary }}>{sentAt}</Typography>
//                     )}
//                 </Stack>
//             </Box>

//             {/* Cancel — only for pending requests (DELETE /api/Student/delete-join-request/{id}) */}
//             {status === "Pending" && (
//                 <Tooltip title="Cancel request">
//                     <IconButton size="small" disabled={busy} onClick={() => onCancel(id)}
//                         sx={{ color: "#e57373", flexShrink: 0, "&:hover": { bgcolor: "rgba(229,115,115,0.1)" } }}>
//                         <DeleteOutlineIcon sx={{ fontSize: 19 }} />
//                     </IconButton>
//                 </Tooltip>
//             )}
//         </Stack>
//     );
// }

// /* ─── Incoming team join request row (leader view) ────────────── */
// // Requests received by the team from students who want to join.
// // API shape (GET /api/Student/team-join-requests):
// // { id, joinRequestId, studentId, studentName, studentEmail?, status, sentAt }
// function TeamJoinRequestRow({ req, onAccept, onReject, busy }) {
//     const theme = useTheme();
//     const isDark = theme.palette.mode === "dark";

//     const id = req.joinRequestId ?? req.id;
//     const studentName = req.studentName ?? req.fullName ?? "Student";
//     const studentEmail = req.studentEmail ?? req.email ?? null;
//     const status = req.status ?? "Pending";
//     const sentAt = req.sentAt ? new Date(req.sentAt).toLocaleDateString() : null;
//     const clr = statusColor(status);

//     return (
//         <Stack direction="row" alignItems="flex-start" gap={1.5}
//             sx={{
//                 p: 1.5, borderRadius: 2,
//                 border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
//                 bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
//             }}>

//             <Avatar sx={{ width: 36, height: 36, bgcolor: MBR_CLR[3], fontSize: "0.72rem", fontWeight: 700, flexShrink: 0 }}>
//                 {initials(studentName)}
//             </Avatar>

//             <Box flex={1} minWidth={0}>
//                 <Typography fontWeight={600} fontSize="0.83rem" noWrap sx={{ color: theme.palette.text.primary }}>
//                     <Box component="span" sx={{ color: ACCENT }}>{studentName}</Box>{" "}wants to join
//                 </Typography>

//                 {studentEmail && (
//                     <Typography fontSize="0.75rem" sx={{ color: theme.palette.text.secondary, mt: 0.2 }}>
//                         {studentEmail}
//                     </Typography>
//                 )}

//                 <Stack direction="row" alignItems="center" gap={0.8} mt={0.5}>
//                     <Chip label={status} size="small" sx={{
//                         height: 16, fontSize: "0.6rem", fontWeight: 700,
//                         bgcolor: clr.bg, color: clr.fg,
//                     }} />
//                     {sentAt && (
//                         <Typography fontSize="0.68rem" sx={{ color: theme.palette.text.secondary }}>{sentAt}</Typography>
//                     )}
//                 </Stack>
//             </Box>

//             {/* Accept / Reject — only for pending (POST /api/Student/respond-to-join-request) */}
//             {status === "Pending" && (
//                 <Stack direction="row" gap={0.5} flexShrink={0}>
//                     <Tooltip title="Accept">
//                         <IconButton size="small" disabled={busy} onClick={() => onAccept(id)}
//                             sx={{ color: "#3DB97A", "&:hover": { bgcolor: "rgba(61,185,122,0.1)" } }}>
//                             <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
//                         </IconButton>
//                     </Tooltip>
//                     <Tooltip title="Reject">
//                         <IconButton size="small" disabled={busy} onClick={() => onReject(id)}
//                             sx={{ color: "#e57373", "&:hover": { bgcolor: "rgba(229,115,115,0.1)" } }}>
//                             <CancelOutlinedIcon sx={{ fontSize: 20 }} />
//                         </IconButton>
//                     </Tooltip>
//                 </Stack>
//             )}
//         </Stack>
//     );
// }

// /* ─── Available student row ───────────────────────────────────── */
// function StudentRow({ student, onInvite, busy }) {
//     const theme = useTheme();
//     const isDark = theme.palette.mode === "dark";
//     const name = student.fullName ?? student.name ?? "Student";

//     return (
//         <Stack direction="row" alignItems="center" gap={1.5}
//             sx={{
//                 p: 1.5, borderRadius: 2,
//                 border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
//                 bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
//             }}>
//             <Avatar sx={{ width: 34, height: 34, bgcolor: MBR_CLR[2], fontSize: "0.7rem", fontWeight: 700 }}>
//                 {initials(name)}
//             </Avatar>
//             <Box flex={1} minWidth={0}>
//                 <Typography fontWeight={600} fontSize="0.82rem" noWrap sx={{ color: theme.palette.text.primary }}>{name}</Typography>
//                 <Typography fontSize="0.72rem" noWrap sx={{ color: theme.palette.text.secondary }}>
//                     {student.email ?? student.studentId ?? ""}
//                 </Typography>
//             </Box>
//             <Tooltip title="Send invitation">
//                 <span>
//                     <IconButton size="small" disabled={busy}
//                         onClick={() => onInvite(student.userId ?? student.id)}
//                         sx={{ color: ACCENT, "&:hover": { bgcolor: `${ACCENT}14` } }}>
//                         <PersonAddOutlinedIcon sx={{ fontSize: 18 }} />
//                     </IconButton>
//                 </span>
//             </Tooltip>
//         </Stack>
//     );
// }

// /* ═══════════════════════════════════════════════════════════════ */
// /*  MAIN PAGE                                                      */
// /* ═══════════════════════════════════════════════════════════════ */
// export default function MyTeamPage() {
//     const theme = useTheme();
//     const isDark = theme.palette.mode === "dark";
//     const tPri = theme.palette.text.primary;
//     const tSec = theme.palette.text.secondary;

//     /* ── data ── */
//     const [myTeam, setMyTeam] = useState(null);
//     const [invitations, setInvitations] = useState([]);        // invitations received by student
//     const [myJoinRequests, setMyJoinRequests] = useState([]);  // join requests student sent to teams
//     const [teamJoinRequests, setTeamJoinRequests] = useState([]); // join requests received by team (leader)
//     const [available, setAvailable] = useState([]);

//     /* ── loading ── */
//     const [loadingTeam, setLoadingTeam] = useState(true);
//     const [loadingInv, setLoadingInv] = useState(false);
//     const [loadingMyJoinReqs, setLoadingMyJoinReqs] = useState(false);
//     const [loadingTeamJoinReqs, setLoadingTeamJoinReqs] = useState(false);
//     const [loadingAvail, setLoadingAvail] = useState(false);
//     const [actionBusy, setActionBusy] = useState(false);

//     /* ── UI ── */
//     const [tab, setTab] = useState(0);
//     const [searchStr, setSearchStr] = useState("");

//     /* ── onboarding modals ── */
//     const [showGate, setShowGate] = useState(false);
//     const [showCreate, setShowCreate] = useState(false);
//     const [showJoin, setShowJoin] = useState(false);

//     /* ── leave confirm ── */
//     const [leaveOpen, setLeaveOpen] = useState(false);

//     /* ── edit project info dialog ── */
//     const [editOpen, setEditOpen] = useState(false);
//     const [editTitle, setEditTitle] = useState("");
//     const [editDesc, setEditDesc] = useState("");
//     const [editBusy, setEditBusy] = useState(false);

//     /* ── snackbar ── */
//     const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
//     const snap = (msg, sev = "success") => setSnack({ open: true, msg, sev });

//     /* ─── style helpers ─────────────────────────────────────────── */
//     const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
//     const paperBg = theme.palette.background.paper;

//     const inputSx = {
//         "& .MuiOutlinedInput-root": {
//             borderRadius: 2, fontSize: "0.875rem",
//             "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: ACCENT },
//         },
//         "& .MuiInputLabel-root.Mui-focused": { color: ACCENT },
//         "& .MuiInputLabel-root": { fontSize: "0.875rem" },
//     };

//     /* ─── fetchers ──────────────────────────────────────────────── */
//     const fetchTeam = useCallback(async () => {
//         try {
//             setLoadingTeam(true);
//             const data = await studentApi.getMyTeam();
//             setMyTeam(data ?? null);
//         } catch {
//             setMyTeam(null);
//         } finally {
//             setLoadingTeam(false);
//         }
//     }, []);

//     // Invitations the student received from teams
//     const fetchInvitations = useCallback(async () => {
//         try {
//             setLoadingInv(true);
//             const data = await studentApi.getMyInvitations();
//             setInvitations(Array.isArray(data) ? data : []);
//         } catch {
//             setInvitations([]);
//         } finally {
//             setLoadingInv(false);
//         }
//     }, []);

//     // Join requests the student sent to teams (outgoing)
//     // GET /api/Student/my-join-requests — falls back to [] until backend ships
//     const fetchMyJoinRequests = useCallback(async () => {
//         try {
//             setLoadingMyJoinReqs(true);
//             const data = await studentApi.getMyJoinRequests();
//             setMyJoinRequests(Array.isArray(data) ? data : []);
//         } catch {
//             setMyJoinRequests([]);
//         } finally {
//             setLoadingMyJoinReqs(false);
//         }
//     }, []);

//     // Join requests the team received from students (incoming — leader only)
//     // GET /api/Student/team-join-requests
//     const fetchTeamJoinRequests = useCallback(async () => {
//         try {
//             setLoadingTeamJoinReqs(true);
//             const data = await studentApi.getTeamJoinRequests();
//             setTeamJoinRequests(Array.isArray(data) ? data : []);
//         } catch {
//             setTeamJoinRequests([]);
//         } finally {
//             setLoadingTeamJoinReqs(false);
//         }
//     }, []);

//     const fetchAvailable = useCallback(async () => {
//         try {
//             setLoadingAvail(true);
//             const data = await studentApi.getAvailableStudents();
//             setAvailable(Array.isArray(data) ? data : []);
//         } catch {
//             setAvailable([]);
//         } finally {
//             setLoadingAvail(false);
//         }
//     }, []);

//     // Initial load — always fetch team, invitations, and outgoing join requests
//     useEffect(() => {
//         fetchTeam();
//         fetchInvitations();
//         fetchMyJoinRequests();
//     }, [fetchTeam, fetchInvitations, fetchMyJoinRequests]);

//     // Load tab-specific data lazily
//     useEffect(() => {
//         if (!myTeam) return;
//         if (tab === 2) fetchAvailable();           // Invite Students tab
//         if (tab === 3) fetchTeamJoinRequests();    // Join Requests (leader) tab
//     }, [tab, myTeam, fetchAvailable, fetchTeamJoinRequests]);

//     /* ─── derived ───────────────────────────────────────────────── */
//     const isLeader = (myTeam?.members ?? []).some((m) => m.isLeader && m.userId === myTeam?.currentUserId)
//         || myTeam?.isLeader
//         || false;

//     const filteredAvailable = available.filter((s) =>
//         (s.fullName ?? s.name ?? "").toLowerCase().includes(searchStr.toLowerCase())
//     );

//     // Badge counts for tabs
//     const pendingInvCount = invitations.filter((i) => (i.status ?? "Pending") === "Pending").length;
//     const pendingMyJoinCount = myJoinRequests.filter((r) => (r.status ?? "Pending") === "Pending").length;
//     const pendingTeamJoinCount = teamJoinRequests.filter((r) => (r.status ?? "Pending") === "Pending").length;

//     /* ─── open edit dialog — pre-fill current values ────────────── */
//     const openEdit = () => {
//         setEditTitle(myTeam?.projectTitle ?? myTeam?.project ?? "");
//         setEditDesc(myTeam?.projectDescription ?? myTeam?.description ?? "");
//         setEditOpen(true);
//     };

//     /* ─── save project info (PUT /api/Student/update-project-info) ─ */
//     const handleSaveProjectInfo = async () => {
//         if (!editTitle.trim()) { snap("Project title cannot be empty.", "error"); return; }
//         try {
//             setEditBusy(true);
//             await studentApi.updateProjectInfo({
//                 projectTitle: editTitle.trim(),
//                 projectDescription: editDesc.trim(),
//             });
//             snap("Project info updated!");
//             setEditOpen(false);
//             fetchTeam();
//         } catch (e) {
//             snap(e?.response?.data?.message ?? "Failed to update project info.", "error");
//         } finally {
//             setEditBusy(false);
//         }
//     };

//     /* ─── invitation actions ────────────────────────────────────── */

//     // POST /api/Student/respond-to-invitation  (isAccepted: true)
//     const handleAcceptInv = async (joinRequestId) => {
//         try {
//             setActionBusy(true);
//             await studentApi.respondToInvitation(joinRequestId, true);
//             snap("Invitation accepted!");
//             fetchTeam();
//             fetchInvitations();
//         } catch (e) {
//             snap(e?.response?.data?.message ?? "Failed to accept invitation", "error");
//         } finally { setActionBusy(false); }
//     };

//     // POST /api/Student/respond-to-invitation  (isAccepted: false)
//     const handleDeclineInv = async (joinRequestId) => {
//         try {
//             setActionBusy(true);
//             await studentApi.respondToInvitation(joinRequestId, false);
//             snap("Invitation declined.");
//             fetchInvitations();
//         } catch (e) {
//             snap(e?.response?.data?.message ?? "Failed to decline invitation", "error");
//         } finally { setActionBusy(false); }
//     };

//     /* ─── outgoing join request actions ─────────────────────────── */

//     // DELETE /api/Student/delete-join-request/{requestId}
//     const handleCancelJoinRequest = async (requestId) => {
//         try {
//             setActionBusy(true);
//             await studentApi.deleteJoinRequest(requestId);
//             snap("Join request cancelled.");
//             fetchMyJoinRequests();
//         } catch (e) {
//             snap(e?.response?.data?.message ?? "Failed to cancel request", "error");
//         } finally { setActionBusy(false); }
//     };

//     /* ─── incoming team join request actions (leader) ────────────── */

//     // POST /api/Student/respond-to-join-request  (isAccepted: true)
//     const handleAcceptTeamJoinReq = async (joinRequestId) => {
//         try {
//             setActionBusy(true);
//             await studentApi.respondToJoinRequest(joinRequestId, true);
//             snap("Join request accepted!");
//             fetchTeam();
//             fetchTeamJoinRequests();
//         } catch (e) {
//             snap(e?.response?.data?.message ?? "Failed to accept request", "error");
//         } finally { setActionBusy(false); }
//     };

//     // POST /api/Student/reject-join-request/{requestId}
//     const handleRejectTeamJoinReq = async (joinRequestId) => {
//         try {
//             setActionBusy(true);
//             await studentApi.rejectJoinRequest(joinRequestId);
//             snap("Join request rejected.");
//             fetchTeamJoinRequests();
//         } catch (e) {
//             snap(e?.response?.data?.message ?? "Failed to reject request", "error");
//         } finally { setActionBusy(false); }
//     };

//     /* ─── invite student (POST /api/Student/send-invitation) ────── */
//     const handleInviteStudent = async (studentId) => {
//         try {
//             setActionBusy(true);
//             await studentApi.sendInvitation(studentId);
//             snap("Invitation sent!");
//             fetchAvailable();
//             fetchInvitations();
//         } catch (e) {
//             snap(e?.response?.data?.message ?? "Failed to send invitation", "error");
//         } finally { setActionBusy(false); }
//     };

//     /* ─── leave team (POST /api/Student/request-leave) ─────────── */
//     const handleLeave = async () => {
//         try {
//             setActionBusy(true);
//             await studentApi.requestLeave();
//             snap("Leave request submitted.");
//             setLeaveOpen(false);
//             fetchTeam();
//         } catch (e) {
//             snap(e?.response?.data?.message ?? "Failed to send leave request", "error");
//         } finally { setActionBusy(false); }
//     };

//     /* ══════════════════════════════════════════════════════════════
//        LOADING
//     ══════════════════════════════════════════════════════════════ */
//     if (loadingTeam) {
//         return (
//             <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
//                 <Stack alignItems="center" gap={2}>
//                     <CircularProgress sx={{ color: ACCENT }} />
//                     <Typography sx={{ color: tSec, fontSize: "0.84rem" }}>Loading team info…</Typography>
//                 </Stack>
//             </Box>
//         );
//     }

//     /* ══════════════════════════════════════════════════════════════
//        NO TEAM
//     ══════════════════════════════════════════════════════════════ */
//     if (!myTeam) {
//         return (
//             <>
//                 <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
//                     <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
//                         <Box>
//                             <Typography variant="h2" sx={{ color: tPri, mb: 0.4 }}>My Team</Typography>
//                             <Typography sx={{ color: tSec, fontSize: "0.85rem" }}>
//                                 You are not part of any team yet
//                             </Typography>
//                         </Box>
//                     </Stack>

//                     {/* Invitations received — visible even without a team */}
//                     {invitations.length > 0 && (
//                         <Paper elevation={0} sx={{
//                             mb: 3, borderRadius: 3, overflow: "hidden",
//                             border: `1px solid ${border}`, bgcolor: paperBg,
//                         }}>
//                             <Stack direction="row" alignItems="center" gap={1} sx={{
//                                 px: 2.5, py: 1.8,
//                                 borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
//                                 bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
//                             }}>
//                                 <Box sx={{ color: ACCENT }}><HowToRegOutlinedIcon sx={{ fontSize: 18 }} /></Box>
//                                 <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: tPri }}>
//                                     Pending Invitations
//                                 </Typography>
//                                 {pendingInvCount > 0 && (
//                                     <Chip label={pendingInvCount} size="small" sx={{
//                                         height: 18, fontSize: "0.65rem", fontWeight: 700,
//                                         bgcolor: `${ACCENT}18`, color: ACCENT,
//                                     }} />
//                                 )}
//                             </Stack>
//                             <Stack gap={1} sx={{ p: 2.5 }}>
//                                 {loadingInv
//                                     ? <CircularProgress size={22} sx={{ color: ACCENT, mx: "auto" }} />
//                                     : invitations.map((inv, i) => (
//                                         <InviteRow
//                                             key={inv.joinRequestId ?? inv.id ?? i}
//                                             inv={inv} busy={actionBusy}
//                                             onAccept={handleAcceptInv}
//                                             onDecline={handleDeclineInv}
//                                         />
//                                     ))
//                                 }
//                             </Stack>
//                         </Paper>
//                     )}

//                     {/* Outgoing join requests — visible even without a team */}
//                     {myJoinRequests.length > 0 && (
//                         <Paper elevation={0} sx={{
//                             mb: 3, borderRadius: 3, overflow: "hidden",
//                             border: `1px solid ${border}`, bgcolor: paperBg,
//                         }}>
//                             <Stack direction="row" alignItems="center" gap={1} sx={{
//                                 px: 2.5, py: 1.8,
//                                 borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
//                                 bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
//                             }}>
//                                 <Box sx={{ color: ACCENT }}><SendOutlinedIcon sx={{ fontSize: 18 }} /></Box>
//                                 <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: tPri }}>
//                                     My Join Requests
//                                 </Typography>
//                                 {pendingMyJoinCount > 0 && (
//                                     <Chip label={pendingMyJoinCount} size="small" sx={{
//                                         height: 18, fontSize: "0.65rem", fontWeight: 700,
//                                         bgcolor: `${ACCENT}18`, color: ACCENT,
//                                     }} />
//                                 )}
//                             </Stack>
//                             <Stack gap={1} sx={{ p: 2.5 }}>
//                                 {loadingMyJoinReqs
//                                     ? <CircularProgress size={22} sx={{ color: ACCENT, mx: "auto" }} />
//                                     : myJoinRequests.map((req, i) => (
//                                         <MyJoinRequestRow
//                                             key={req.joinRequestId ?? req.id ?? i}
//                                             req={req} busy={actionBusy}
//                                             onCancel={handleCancelJoinRequest}
//                                         />
//                                     ))
//                                 }
//                             </Stack>
//                         </Paper>
//                     )}

//                     {/* CTA */}
//                     <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
//                         <Stack alignItems="center" gap={3} sx={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
//                             <Box sx={{
//                                 width: 72, height: 72, borderRadius: 4,
//                                 bgcolor: `${ACCENT}12`, border: `1.5px solid ${ACCENT}30`,
//                                 display: "flex", alignItems: "center", justifyContent: "center",
//                             }}>
//                                 <GroupsOutlinedIcon sx={{ fontSize: 34, color: ACCENT }} />
//                             </Box>
//                             <Box>
//                                 <Typography fontWeight={700} fontSize="1.05rem" sx={{ color: tPri, mb: 0.6 }}>
//                                     You're not in a team yet
//                                 </Typography>
//                                 <Typography fontSize="0.84rem" sx={{ color: tSec, lineHeight: 1.7 }}>
//                                     Create a new team with a supervisor, or join an existing one to start your graduation project.
//                                 </Typography>
//                             </Box>
//                             <Stack gap={1.5} width="100%">
//                                 <Paper elevation={0} onClick={() => setShowGate(true)}
//                                     sx={{
//                                         p: 2.2, borderRadius: 2.5, cursor: "pointer",
//                                         border: `1.5px solid ${ACCENT}`, bgcolor: `${ACCENT}08`,
//                                         transition: "all 0.15s ease",
//                                         "&:hover": { bgcolor: `${ACCENT}14`, transform: "translateY(-1px)" },
//                                     }}>
//                                     <Stack direction="row" alignItems="center" gap={2}>
//                                         <Box sx={{
//                                             width: 42, height: 42, borderRadius: 2, flexShrink: 0,
//                                             bgcolor: `${ACCENT}18`, border: `1px solid ${ACCENT}35`,
//                                             display: "flex", alignItems: "center", justifyContent: "center",
//                                         }}>
//                                             <AddCircleOutlineIcon sx={{ fontSize: 22, color: ACCENT }} />
//                                         </Box>
//                                         <Box textAlign="left">
//                                             <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: tPri }}>
//                                                 Create or Join a Team
//                                             </Typography>
//                                             <Typography fontSize="0.77rem" sx={{ color: tSec }}>
//                                                 Start fresh or browse available teams
//                                             </Typography>
//                                         </Box>
//                                     </Stack>
//                                 </Paper>
//                             </Stack>
//                         </Stack>
//                     </Box>
//                 </Box>

//                 <JoinOrCreateModal
//                     open={showGate}
//                     onClose={() => setShowGate(false)}
//                     onCreate={() => { setShowGate(false); setShowCreate(true); }}
//                     onJoin={() => { setShowGate(false); setShowJoin(true); }}
//                 />
//                 <CreateTeamFlow
//                     open={showCreate}
//                     onClose={() => setShowCreate(false)}
//                     onSuccess={(msg) => { snap(msg); setShowCreate(false); fetchTeam(); }}
//                 />
//                 <JoinTeamFlow
//                     open={showJoin}
//                     onClose={() => setShowJoin(false)}
//                     onSuccess={(msg) => { snap(msg); setShowJoin(false); fetchTeam(); fetchMyJoinRequests(); }}
//                 />

//                 <Snackbar open={snack.open} autoHideDuration={3500}
//                     onClose={() => setSnack(s => ({ ...s, open: false }))}
//                     anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
//                     <Alert severity={snack.sev} variant="filled" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
//                 </Snackbar>
//             </>
//         );
//     }

//     /* ══════════════════════════════════════════════════════════════
//        HAS TEAM
//     ══════════════════════════════════════════════════════════════ */
//     const members = myTeam.members ?? myTeam.students ?? [];
//     const supervisor = myTeam.supervisor ?? myTeam.supervisorName ?? null;
//     const project = myTeam.projectTitle ?? myTeam.project ?? "—";
//     const projectDesc = myTeam.projectDescription ?? myTeam.description ?? null;
//     const status = myTeam.status ?? myTeam.teamStatus ?? null;
//     const teamName = myTeam.teamName ?? myTeam.name ?? null;

//     return (
//         <>
//             <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 2.5 }}>

//                 {/* ── PAGE HEADER ─────────────────────────────────────── */}
//                 <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
//                     <Box>
//                         <Typography variant="h2" sx={{ color: tPri, mb: 0.4 }}>My Team</Typography>
//                         <Typography sx={{ color: tSec, fontSize: "0.85rem" }}>
//                             {teamName ? `Team: ${teamName}` : "Your current team & project"}
//                         </Typography>
//                     </Box>
//                     <Stack direction="row" gap={1}>
//                         <Tooltip title="Refresh">
//                             <IconButton size="small"
//                                 onClick={() => {
//                                     fetchTeam();
//                                     fetchInvitations();
//                                     fetchMyJoinRequests();
//                                     if (myTeam) fetchTeamJoinRequests();
//                                 }}
//                                 sx={{
//                                     color: tSec, border: `1px solid ${border}`,
//                                     borderRadius: 2, "&:hover": { color: ACCENT },
//                                 }}>
//                                 <RefreshOutlinedIcon sx={{ fontSize: 17 }} />
//                             </IconButton>
//                         </Tooltip>
//                         <Button size="small" variant="outlined"
//                             startIcon={<ExitToAppOutlinedIcon />}
//                             onClick={() => setLeaveOpen(true)}
//                             sx={{
//                                 borderColor: "#e57373", color: "#e57373", borderRadius: 2,
//                                 textTransform: "none", fontWeight: 600, fontSize: "0.78rem",
//                                 "&:hover": { bgcolor: "rgba(229,115,115,0.08)", borderColor: "#e57373" },
//                             }}>
//                             Leave Team
//                         </Button>
//                     </Stack>
//                 </Stack>

//                 {/* ── TOP CARDS: Project + Supervisor ─────────────────── */}
//                 <Stack direction={{ xs: "column", sm: "row" }} gap={2}>

//                     {/* Project card */}
//                     <Paper elevation={0} sx={{ flex: 1, p: 2.5, borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg }}>
//                         <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.8}>
//                             <Stack direction="row" alignItems="center" gap={1.2}>
//                                 <Box sx={{
//                                     width: 36, height: 36, borderRadius: 2, flexShrink: 0,
//                                     bgcolor: `${ACCENT}12`, border: `1px solid ${ACCENT}28`,
//                                     display: "flex", alignItems: "center", justifyContent: "center",
//                                 }}>
//                                     <FolderOutlinedIcon sx={{ fontSize: 18, color: ACCENT }} />
//                                 </Box>
//                                 <Typography fontWeight={700} fontSize="0.85rem" sx={{
//                                     color: tSec, textTransform: "uppercase", letterSpacing: "0.07em",
//                                 }}>Project</Typography>
//                             </Stack>
//                             <Tooltip title="Edit project info">
//                                 <IconButton size="small" onClick={openEdit}
//                                     sx={{ color: tSec, borderRadius: 1.5, "&:hover": { color: ACCENT, bgcolor: `${ACCENT}10` } }}>
//                                     <EditOutlinedIcon sx={{ fontSize: 16 }} />
//                                 </IconButton>
//                             </Tooltip>
//                         </Stack>

//                         <Typography fontWeight={700} fontSize="1rem" sx={{ color: tPri, mb: 0.5 }}>{project}</Typography>

//                         {projectDesc && (
//                             <Typography fontSize="0.78rem" sx={{
//                                 color: tSec, lineHeight: 1.6, mb: 0.8,
//                                 display: "-webkit-box", WebkitLineClamp: 3,
//                                 WebkitBoxOrient: "vertical", overflow: "hidden",
//                             }}>{projectDesc}</Typography>
//                         )}

//                         {status && (
//                             <Chip label={status} size="small" sx={{
//                                 height: 20, fontSize: "0.65rem", fontWeight: 700,
//                                 bgcolor: status.toLowerCase().includes("approved") ? "rgba(61,185,122,0.12)" :
//                                     status.toLowerCase().includes("pending") ? `${ACCENT}15` :
//                                         status.toLowerCase().includes("rejected") ? "rgba(229,115,115,0.12)" : `${ACCENT}12`,
//                                 color: status.toLowerCase().includes("approved") ? "#3DB97A" :
//                                     status.toLowerCase().includes("pending") ? ACCENT :
//                                         status.toLowerCase().includes("rejected") ? "#e57373" : ACCENT,
//                             }} />
//                         )}
//                     </Paper>

//                     {/* Supervisor card */}
//                     <Paper elevation={0} sx={{ flex: 1, p: 2.5, borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg }}>
//                         <Stack direction="row" alignItems="center" gap={1.2} mb={1.8}>
//                             <Box sx={{
//                                 width: 36, height: 36, borderRadius: 2, flexShrink: 0,
//                                 bgcolor: "rgba(109,138,125,0.12)", border: "1px solid rgba(109,138,125,0.25)",
//                                 display: "flex", alignItems: "center", justifyContent: "center",
//                             }}>
//                                 <SchoolOutlinedIcon sx={{ fontSize: 18, color: "#6D8A7D" }} />
//                             </Box>
//                             <Typography fontWeight={700} fontSize="0.85rem" sx={{
//                                 color: tSec, textTransform: "uppercase", letterSpacing: "0.07em",
//                             }}>Supervisor</Typography>
//                         </Stack>

//                         {supervisor ? (
//                             <Stack direction="row" alignItems="center" gap={1.5}>
//                                 <Avatar sx={{ width: 40, height: 40, bgcolor: "#6D8A7D", fontWeight: 700, fontSize: "0.9rem" }}>
//                                     {initials(typeof supervisor === "string" ? supervisor : supervisor.fullName ?? supervisor.name ?? "?")}
//                                 </Avatar>
//                                 <Box>
//                                     <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: tPri }}>
//                                         {typeof supervisor === "string" ? supervisor : supervisor.fullName ?? supervisor.name ?? "—"}
//                                     </Typography>
//                                     {typeof supervisor === "object" && supervisor?.department && (
//                                         <Typography fontSize="0.74rem" sx={{ color: tSec }}>{supervisor.department}</Typography>
//                                     )}
//                                 </Box>
//                             </Stack>
//                         ) : (
//                             <Typography fontSize="0.84rem" sx={{ color: tSec }}>Not assigned yet</Typography>
//                         )}
//                     </Paper>
//                 </Stack>

//                 {/* ── TABS ────────────────────────────────────────────── */}
//                 <Paper elevation={0} sx={{
//                     flex: 1, borderRadius: 3, overflow: "hidden",
//                     border: `1px solid ${border}`, bgcolor: paperBg,
//                     display: "flex", flexDirection: "column",
//                 }}>
//                     <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
//                         px: 1, minHeight: 44,
//                         borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
//                         "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.82rem", minHeight: 44, color: tSec },
//                         "& .Mui-selected": { color: ACCENT },
//                         "& .MuiTabs-indicator": { bgcolor: ACCENT, height: 2.5, borderRadius: 2 },
//                     }}>
//                         {/* Tab 0 — Members */}
//                         <Tab label={
//                             <Stack direction="row" alignItems="center" gap={0.7}>
//                                 <PeopleOutlineIcon sx={{ fontSize: 16 }} />
//                                 <span>Members ({members.length})</span>
//                             </Stack>
//                         } />

//                         {/* Tab 1 — Invitations received by the student */}
//                         <Tab label={
//                             <Stack direction="row" alignItems="center" gap={0.7}>
//                                 <HowToRegOutlinedIcon sx={{ fontSize: 16 }} />
//                                 <span>Invitations</span>
//                                 {pendingInvCount > 0 && (
//                                     <Chip label={pendingInvCount} size="small" sx={{
//                                         height: 16, fontSize: "0.6rem", fontWeight: 700,
//                                         bgcolor: `${ACCENT}20`, color: ACCENT,
//                                     }} />
//                                 )}
//                             </Stack>
//                         } />

//                         {/* Tab 2 — Invite students (send invitation to available students) */}
//                         <Tab label={
//                             <Stack direction="row" alignItems="center" gap={0.7}>
//                                 <PersonAddOutlinedIcon sx={{ fontSize: 16 }} />
//                                 <span>Invite Students</span>
//                             </Stack>
//                         } />

//                         {/* Tab 3 — Incoming join requests to the team (leader only) */}
//                         <Tab label={
//                             <Stack direction="row" alignItems="center" gap={0.7}>
//                                 <SendOutlinedIcon sx={{ fontSize: 16 }} />
//                                 <span>Join Requests</span>
//                                 {pendingTeamJoinCount > 0 && (
//                                     <Chip label={pendingTeamJoinCount} size="small" sx={{
//                                         height: 16, fontSize: "0.6rem", fontWeight: 700,
//                                         bgcolor: `${ACCENT}20`, color: ACCENT,
//                                     }} />
//                                 )}
//                             </Stack>
//                         } />

//                         {/* Tab 4 — Outgoing join requests the student sent */}
//                         <Tab label={
//                             <Stack direction="row" alignItems="center" gap={0.7}>
//                                 <SendOutlinedIcon sx={{ fontSize: 16, transform: "scaleX(-1)" }} />
//                                 <span>My Requests</span>
//                                 {pendingMyJoinCount > 0 && (
//                                     <Chip label={pendingMyJoinCount} size="small" sx={{
//                                         height: 16, fontSize: "0.6rem", fontWeight: 700,
//                                         bgcolor: `${ACCENT}20`, color: ACCENT,
//                                     }} />
//                                 )}
//                             </Stack>
//                         } />
//                     </Tabs>

//                     {/* ── TAB 0: Members ──────────────────────────────── */}
//                     {tab === 0 && (
//                         <Box sx={{ p: 2.5, flex: 1, overflowY: "auto" }}>
//                             {members.length === 0 ? (
//                                 <Typography sx={{ color: tSec, fontSize: "0.84rem", textAlign: "center", mt: 4 }}>
//                                     No members yet
//                                 </Typography>
//                             ) : (
//                                 <Stack gap={1.2}>
//                                     {members.map((m, i) => {
//                                         const name = m.fullName ?? m.name ?? "Student";
//                                         const leader = m.isLeader ?? m.role === "leader" ?? i === 0;
//                                         return (
//                                             <Stack key={m.userId ?? m.id ?? i} direction="row" alignItems="center" gap={1.5}
//                                                 sx={{
//                                                     p: 1.5, borderRadius: 2.5,
//                                                     border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
//                                                     bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
//                                                 }}>
//                                                 <Avatar sx={{ width: 40, height: 40, fontWeight: 700, bgcolor: MBR_CLR[i % MBR_CLR.length], fontSize: "0.85rem" }}>
//                                                     {initials(name)}
//                                                 </Avatar>
//                                                 <Box flex={1} minWidth={0}>
//                                                     <Stack direction="row" alignItems="center" gap={0.8}>
//                                                         <Typography fontWeight={600} fontSize="0.87rem" noWrap sx={{ color: tPri }}>{name}</Typography>
//                                                         {leader && (
//                                                             <Chip label="Leader" size="small" sx={{
//                                                                 height: 17, fontSize: "0.6rem", fontWeight: 700,
//                                                                 bgcolor: `${ACCENT}15`, color: ACCENT,
//                                                             }} />
//                                                         )}
//                                                     </Stack>
//                                                     <Typography fontSize="0.73rem" noWrap sx={{ color: tSec }}>
//                                                         {m.email ?? m.studentId ?? ""}
//                                                     </Typography>
//                                                 </Box>
//                                             </Stack>
//                                         );
//                                     })}
//                                 </Stack>
//                             )}
//                         </Box>
//                     )}

//                     {/* ── TAB 1: Invitations received ─────────────────── */}
//                     {tab === 1 && (
//                         <Box sx={{ p: 2.5, flex: 1, overflowY: "auto" }}>
//                             {loadingInv ? (
//                                 <Box display="flex" justifyContent="center" pt={4}>
//                                     <CircularProgress size={24} sx={{ color: ACCENT }} />
//                                 </Box>
//                             ) : invitations.length === 0 ? (
//                                 <Typography sx={{ color: tSec, fontSize: "0.84rem", textAlign: "center", mt: 4 }}>
//                                     No invitations yet
//                                 </Typography>
//                             ) : (
//                                 <Stack gap={1.2}>
//                                     {invitations.map((inv, i) => (
//                                         <InviteRow
//                                             key={inv.joinRequestId ?? inv.id ?? i}
//                                             inv={inv} busy={actionBusy}
//                                             onAccept={handleAcceptInv}
//                                             onDecline={handleDeclineInv}
//                                         />
//                                     ))}
//                                 </Stack>
//                             )}
//                         </Box>
//                     )}

//                     {/* ── TAB 2: Invite Students ──────────────────────── */}
//                     {tab === 2 && (
//                         <Box sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
//                             <TextField size="small" fullWidth placeholder="Search students…"
//                                 value={searchStr} onChange={(e) => setSearchStr(e.target.value)}
//                                 InputProps={{ startAdornment: <SearchOutlinedIcon sx={{ fontSize: 17, color: tSec, mr: 0.8 }} /> }}
//                                 sx={{
//                                     mb: 2,
//                                     "& .MuiOutlinedInput-root": {
//                                         borderRadius: 2, fontSize: "0.875rem",
//                                         "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: ACCENT },
//                                     },
//                                 }}
//                             />
//                             <Box sx={{ flex: 1, overflowY: "auto" }}>
//                                 {loadingAvail ? (
//                                     <Box display="flex" justifyContent="center" pt={4}>
//                                         <CircularProgress size={24} sx={{ color: ACCENT }} />
//                                     </Box>
//                                 ) : filteredAvailable.length === 0 ? (
//                                     <Typography sx={{ color: tSec, fontSize: "0.84rem", textAlign: "center", mt: 4 }}>
//                                         No available students found
//                                     </Typography>
//                                 ) : (
//                                     <Stack gap={1.2}>
//                                         {filteredAvailable.map((s, i) => (
//                                             <StudentRow key={s.userId ?? s.id ?? i} student={s} busy={actionBusy} onInvite={handleInviteStudent} />
//                                         ))}
//                                     </Stack>
//                                 )}
//                             </Box>
//                         </Box>
//                     )}

//                     {/* ── TAB 3: Incoming join requests (leader) ───────── */}
//                     {/* Students who requested to join this team — leader accepts/rejects */}
//                     {tab === 3 && (
//                         <Box sx={{ p: 2.5, flex: 1, overflowY: "auto" }}>
//                             {loadingTeamJoinReqs ? (
//                                 <Box display="flex" justifyContent="center" pt={4}>
//                                     <CircularProgress size={24} sx={{ color: ACCENT }} />
//                                 </Box>
//                             ) : teamJoinRequests.length === 0 ? (
//                                 <Typography sx={{ color: tSec, fontSize: "0.84rem", textAlign: "center", mt: 4 }}>
//                                     No join requests yet
//                                 </Typography>
//                             ) : (
//                                 <Stack gap={1.2}>
//                                     {teamJoinRequests.map((req, i) => (
//                                         <TeamJoinRequestRow
//                                             key={req.joinRequestId ?? req.id ?? i}
//                                             req={req} busy={actionBusy}
//                                             onAccept={handleAcceptTeamJoinReq}
//                                             onReject={handleRejectTeamJoinReq}
//                                         />
//                                     ))}
//                                 </Stack>
//                             )}
//                         </Box>
//                     )}

//                     {/* ── TAB 4: My outgoing join requests ────────────── */}
//                     {/* Join requests the current student sent to other teams */}
//                     {tab === 4 && (
//                         <Box sx={{ p: 2.5, flex: 1, overflowY: "auto" }}>
//                             {loadingMyJoinReqs ? (
//                                 <Box display="flex" justifyContent="center" pt={4}>
//                                     <CircularProgress size={24} sx={{ color: ACCENT }} />
//                                 </Box>
//                             ) : myJoinRequests.length === 0 ? (
//                                 <Typography sx={{ color: tSec, fontSize: "0.84rem", textAlign: "center", mt: 4 }}>
//                                     You haven't sent any join requests
//                                 </Typography>
//                             ) : (
//                                 <Stack gap={1.2}>
//                                     {myJoinRequests.map((req, i) => (
//                                         <MyJoinRequestRow
//                                             key={req.joinRequestId ?? req.id ?? i}
//                                             req={req} busy={actionBusy}
//                                             onCancel={handleCancelJoinRequest}
//                                         />
//                                     ))}
//                                 </Stack>
//                             )}
//                         </Box>
//                     )}
//                 </Paper>
//             </Box>

//             {/* ══ EDIT PROJECT INFO DIALOG ═══════════════════════════ */}
//             {/* PUT /api/Student/update-project-info */}
//             <Dialog open={editOpen} onClose={() => !editBusy && setEditOpen(false)}
//                 maxWidth="xs" fullWidth
//                 PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg } }}>
//                 <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${border}` }}>
//                     <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: tPri }}>Edit Project Info</Typography>
//                 </Box>
//                 <Box sx={{ px: 3, py: 2.5 }}>
//                     <Stack gap={2}>
//                         <TextField label="Project Title" size="small" fullWidth required
//                             value={editTitle} onChange={(e) => setEditTitle(e.target.value)} sx={inputSx} />
//                         <TextField label="Project Description" size="small" fullWidth multiline rows={3}
//                             value={editDesc} onChange={(e) => setEditDesc(e.target.value)} sx={inputSx} />
//                     </Stack>
//                 </Box>
//                 <Box sx={{ px: 3, pb: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}>
//                     <Button disabled={editBusy} onClick={() => setEditOpen(false)}
//                         sx={{ color: tSec, textTransform: "none", fontWeight: 500, borderRadius: 2 }}>Cancel</Button>
//                     <Button variant="contained" disabled={editBusy} onClick={handleSaveProjectInfo}
//                         sx={{ bgcolor: ACCENT, "&:hover": { bgcolor: "#b06f47", boxShadow: "none" }, textTransform: "none", fontWeight: 700, borderRadius: 2, boxShadow: "none" }}>
//                         {editBusy ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Save"}
//                     </Button>
//                 </Box>
//             </Dialog>

//             {/* ══ LEAVE CONFIRM DIALOG ═══════════════════════════════ */}
//             <Dialog open={leaveOpen} onClose={() => setLeaveOpen(false)} maxWidth="xs" fullWidth
//                 PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg } }}>
//                 <Box sx={{ p: 3 }}>
//                     <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: tPri, mb: 0.8 }}>Leave Team?</Typography>
//                     <Typography fontSize="0.84rem" sx={{ color: tSec, lineHeight: 1.7, mb: 2.5 }}>
//                         A leave request will be submitted. You'll be removed from the team after it's approved.
//                     </Typography>
//                     <Stack direction="row" gap={1} justifyContent="flex-end">
//                         <Button onClick={() => setLeaveOpen(false)}
//                             sx={{ textTransform: "none", color: tSec, borderRadius: 2, fontWeight: 500 }}>Cancel</Button>
//                         <Button variant="contained" disabled={actionBusy} onClick={handleLeave}
//                             sx={{ bgcolor: "#e57373", "&:hover": { bgcolor: "#d32f2f", boxShadow: "none" }, textTransform: "none", fontWeight: 700, borderRadius: 2, boxShadow: "none", px: 3 }}>
//                             {actionBusy ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Confirm Leave"}
//                         </Button>
//                     </Stack>
//                 </Box>
//             </Dialog>

//             {/* ── SNACKBAR ──────────────────────────────────────────── */}
//             <Snackbar open={snack.open} autoHideDuration={3500}
//                 onClose={() => setSnack(s => ({ ...s, open: false }))}
//                 anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
//                 <Alert severity={snack.sev} variant="filled" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
//             </Snackbar>
//         </>
//     );
// }

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@mui/material/styles";
import {
    Box, Typography, Stack, Paper, Avatar,
    Button, Chip, Tab, Tabs, CircularProgress,
    Snackbar, Alert, Tooltip, IconButton,
    Dialog, TextField, Divider, Fade,
    Pagination,
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
import CloseIcon from "@mui/icons-material/Close";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";

import studentApi from "../../../../api/handler/endpoints/studentApi";
import UserProfileApi from "../../../../api/handler/endpoints/UserProfileApi";
import JoinOrCreateModal from "../Onboarding/JoinOrCreateModal";
import CreateTeamFlow from "../Onboarding/CreateTeamFlow";
import JoinTeamFlow from "../Onboarding/JoinTeamFlow";

/* ════════════════════════════════════════════════════════════════
   DESIGN TOKENS
════════════════════════════════════════════════════════════════ */
const ACCENT = "#c87941";          // warm terracotta
const ACCENT_LIGHT = "#e8a96e";          // lighter for dark mode
const GREEN = "#3a9e6f";
const RED = "#d95555";

const SKILL_PALETTE = [
    "#c87941", "#5b8fa8", "#6d8a7d", "#9b7ec8",
    "#a85b6d", "#7a9e5b", "#c49a6c", "#7e9fc4",
];

const MBR_COLORS = ["#c87941", "#5b8fa8", "#6d8a7d", "#9b7ec8", "#a85b6d"];

const CARDS_PER_PAGE = 6;

/* ── helpers ─────────────────────────────────────────────────── */
const initials = (name = "") =>
    (name ?? "").split(" ").map(w => w[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";

const skillClr = (i) => SKILL_PALETTE[i % SKILL_PALETTE.length];

const statusMeta = (s) => {
    const v = (s ?? "").toLowerCase();
    if (v.includes("accept") || v === "accepted") return { bg: `${GREEN}18`, fg: GREEN };
    if (v.includes("reject") || v === "rejected") return { bg: `${RED}18`, fg: RED };
    return { bg: `${ACCENT}18`, fg: ACCENT };
};

/* ════════════════════════════════════════════════════════════════
   STUDENT PROFILE MODAL
════════════════════════════════════════════════════════════════ */
function StudentProfileModal({ open, onClose, student, onInvite, isInviting }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);

    const bg = theme.palette.background.paper;
    const brd = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const accent = isDark ? ACCENT_LIGHT : ACCENT;

    const sid = student?.userId ?? student?.id ?? null;
    const name = student?.fullName ?? student?.name ?? "Student";
    const dept = student?.department ?? "";

    useEffect(() => {
        if (!open || !sid) return;
        setProfile(null);
        setLoading(true);
        UserProfileApi.getProfileById(sid)
            .then(d => {
                if (!d) return;
                setProfile({
                    fullName: d.fullName ?? "",
                    phone: d.phoneNumber ?? "",
                    department: d.department ?? "",
                    skills: d.field ? d.field.split(",").map(s => s.trim()).filter(Boolean) : [],
                    github: d.gitHubLink ?? d.github ?? "",
                    linkedin: d.linkedinLink ?? d.linkedin ?? "",
                    email: d.personalEmail ?? d.email ?? "",
                    bio: d.bio ?? "",
                });
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [open, sid]);

    const skills = profile?.skills?.length
        ? profile.skills
        : (student?.field ? student.field.split(",").map(s => s.trim()).filter(Boolean) : []);
    const displayName = profile?.fullName || name;
    const displayDept = profile?.department || dept;
    const av = initials(displayName);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            TransitionComponent={Fade}
            transitionDuration={260}
            PaperProps={{
                sx: {
                    borderRadius: "20px",
                    overflow: "hidden",
                    border: `1px solid ${brd}`,
                    bgcolor: bg,
                    boxShadow: isDark ? "0 32px 80px rgba(0,0,0,0.65)" : "0 32px 80px rgba(0,0,0,0.13)",
                },
            }}
        >
            {/* banner */}
            <Box sx={{
                height: 118,
                background: isDark
                    ? "linear-gradient(135deg, #1e1208 0%, #261a0e 50%, #1a1a20 100%)"
                    : "linear-gradient(135deg, #fdf4ec 0%, #f5e4d0 60%, #eef2f8 100%)",
                position: "relative", overflow: "hidden",
            }}>
                <Box sx={{
                    position: "absolute", inset: 0,
                    backgroundImage: `
                        linear-gradient(${ACCENT}12 1px, transparent 1px),
                        linear-gradient(90deg, ${ACCENT}12 1px, transparent 1px)
                    `,
                    backgroundSize: "28px 28px",
                }} />
                <Box sx={{
                    position: "absolute", top: -40, right: -40,
                    width: 180, height: 180, borderRadius: "50%",
                    background: `radial-gradient(circle, ${ACCENT}22 0%, transparent 70%)`,
                }} />
                <IconButton onClick={onClose} size="small" sx={{
                    position: "absolute", top: 12, right: 12,
                    bgcolor: isDark ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.88)",
                    backdropFilter: "blur(6px)", border: `1px solid ${brd}`,
                    color: tSec, "&:hover": { color: accent },
                }}>
                    <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
            </Box>

            {/* avatar strip */}
            <Box sx={{ px: 3 }}>
                <Stack direction="row" alignItems="flex-end" justifyContent="space-between"
                    sx={{ mt: "-36px", mb: 1.5 }}>
                    <Box sx={{
                        width: 72, height: 72, borderRadius: "18px",
                        bgcolor: accent,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.55rem", fontWeight: 800, color: "#fff",
                        border: `4px solid ${bg}`,
                        boxShadow: `0 6px 20px ${ACCENT}45`,
                        letterSpacing: "-1px",
                    }}>{av}</Box>

                    <Stack direction="row" gap={0.8} pb={0.5}>
                        {profile?.linkedin && (
                            <Tooltip title="LinkedIn">
                                <IconButton component="a" href={profile.linkedin} target="_blank" size="small"
                                    sx={{
                                        width: 34, height: 34,
                                        bgcolor: isDark ? "rgba(0,119,181,0.14)" : "rgba(0,119,181,0.08)",
                                        border: `1px solid ${isDark ? "rgba(0,119,181,0.28)" : "rgba(0,119,181,0.18)"}`,
                                        "&:hover": { bgcolor: "#0077B5", color: "#fff", transform: "translateY(-2px)" },
                                        transition: "all 0.18s",
                                    }}>
                                    <LinkedInIcon sx={{ fontSize: 17 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        {profile?.github && (
                            <Tooltip title="GitHub">
                                <IconButton component="a" href={profile.github} target="_blank" size="small"
                                    sx={{
                                        width: 34, height: 34,
                                        bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)",
                                        border: `1px solid ${brd}`,
                                        "&:hover": { bgcolor: isDark ? "#fff" : "#000", color: isDark ? "#000" : "#fff", transform: "translateY(-2px)" },
                                        transition: "all 0.18s",
                                    }}>
                                    <GitHubIcon sx={{ fontSize: 17 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                </Stack>

                <Typography fontWeight={800} fontSize="1.15rem" sx={{ color: tPri, lineHeight: 1.2, mb: 0.5 }}>
                    {displayName}
                </Typography>

                <Stack direction="row" flexWrap="wrap" gap={1.2} mb={0.8}>
                    {(profile?.email || student?.email) && (
                        <Stack direction="row" alignItems="center" gap={0.5}>
                            <EmailOutlinedIcon sx={{ fontSize: 12, color: tSec }} />
                            <Typography fontSize="0.73rem" sx={{ color: tSec }}>
                                {profile?.email || student?.email}
                            </Typography>
                        </Stack>
                    )}
                    {profile?.phone && (
                        <Stack direction="row" alignItems="center" gap={0.5}>
                            <PhoneOutlinedIcon sx={{ fontSize: 12, color: tSec }} />
                            <Typography fontSize="0.73rem" sx={{ color: tSec }}>{profile.phone}</Typography>
                        </Stack>
                    )}
                </Stack>

                {displayDept && (
                    <Chip
                        icon={<SchoolOutlinedIcon sx={{ fontSize: "12px !important", color: `${accent} !important` }} />}
                        label={displayDept}
                        size="small"
                        sx={{
                            mb: 1, height: 24, borderRadius: "8px",
                            bgcolor: `${ACCENT}12`, color: accent,
                            fontWeight: 700, fontSize: "0.7rem",
                            border: `1px solid ${ACCENT}28`,
                        }}
                    />
                )}
            </Box>

            <Divider sx={{ borderColor: brd, mx: 3, my: 0.5 }} />

            {/* body */}
            <Box sx={{ px: 3, py: 2, overflowY: "auto", maxHeight: 340 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" py={5}>
                        <Stack alignItems="center" gap={1.5}>
                            <CircularProgress size={26} sx={{ color: accent }} />
                            <Typography fontSize="0.78rem" sx={{ color: tSec }}>Loading profile…</Typography>
                        </Stack>
                    </Box>
                ) : (
                    <Stack spacing={2.5}>
                        {profile?.bio && (
                            <Box>
                                <Stack direction="row" alignItems="center" gap={0.7} mb={1}>
                                    <AutoStoriesOutlinedIcon sx={{ fontSize: 14, color: accent }} />
                                    <Typography sx={{
                                        fontSize: "0.67rem", fontWeight: 700,
                                        textTransform: "uppercase", letterSpacing: "0.7px", color: tSec,
                                    }}>About</Typography>
                                </Stack>
                                <Typography fontSize="0.83rem" sx={{ color: tPri, lineHeight: 1.78, whiteSpace: "pre-line" }}>
                                    {profile.bio}
                                </Typography>
                            </Box>
                        )}

                        {skills.length > 0 && (
                            <Box>
                                <Stack direction="row" alignItems="center" gap={0.7} mb={1.2}>
                                    <CodeOutlinedIcon sx={{ fontSize: 14, color: accent }} />
                                    <Typography sx={{
                                        fontSize: "0.67rem", fontWeight: 700,
                                        textTransform: "uppercase", letterSpacing: "0.7px", color: tSec,
                                    }}>Skills & Expertise ({skills.length})</Typography>
                                </Stack>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.9 }}>
                                    {skills.map((sk, j) => {
                                        const c = skillClr(j);
                                        return (
                                            <Box key={sk} sx={{
                                                display: "flex", alignItems: "center", gap: 0.6,
                                                px: 1.3, py: 0.5, borderRadius: "20px",
                                                bgcolor: `${c}0D`, border: `1px solid ${c}30`,
                                                transition: "all 0.15s",
                                                "&:hover": { bgcolor: `${c}1C`, borderColor: c, transform: "translateY(-1px)" },
                                            }}>
                                                <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: c, flexShrink: 0 }} />
                                                <Typography fontSize="0.71rem" fontWeight={600} sx={{ color: c }}>{sk}</Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                        )}

                        {!loading && !profile?.bio && skills.length === 0 && (
                            <Box sx={{
                                textAlign: "center", py: 5,
                                border: `1px dashed ${ACCENT}30`, borderRadius: "14px", bgcolor: `${ACCENT}06`,
                            }}>
                                <PersonOutlineIcon sx={{ fontSize: 30, color: accent, opacity: 0.4, mb: 1 }} />
                                <Typography fontSize="0.83rem" sx={{ color: tSec }}>Profile not completed yet.</Typography>
                            </Box>
                        )}
                    </Stack>
                )}
            </Box>

            {/* footer */}
            <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${brd}`, display: "flex", gap: 1.2, justifyContent: "flex-end" }}>
                <Button onClick={onClose} sx={{ color: tSec, textTransform: "none", fontWeight: 500, borderRadius: "10px", px: 2 }}>
                    Close
                </Button>
                <Button variant="contained" disabled={isInviting}
                    startIcon={isInviting ? null : <PersonAddOutlinedIcon sx={{ fontSize: 15 }} />}
                    onClick={() => { onInvite(sid); onClose(); }}
                    sx={{
                        bgcolor: accent, "&:hover": { bgcolor: isDark ? ACCENT : "#a8622e", boxShadow: "none" },
                        borderRadius: "10px", px: 3, py: 0.85,
                        textTransform: "none", fontWeight: 700, boxShadow: "none", fontSize: "0.82rem",
                    }}>
                    {isInviting ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : "Send Invite"}
                </Button>
            </Box>
        </Dialog>
    );
}

/* ════════════════════════════════════════════════════════════════
   STUDENT CARD — grid card
════════════════════════════════════════════════════════════════ */
function StudentCard({ student, onInvite, onViewProfile, busy, colorIndex }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const brd = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const accent = isDark ? ACCENT_LIGHT : ACCENT;

    const name = student.fullName ?? student.name ?? "Student";
    const email = student.email ?? student.studentId ?? "";
    const dept = student.department ?? "";
    const skills = student.field
        ? student.field.split(",").map(s => s.trim()).filter(Boolean)
        : (student.skills ?? []);

    const av = initials(name);
    const barColor = MBR_COLORS[colorIndex % MBR_COLORS.length];

    return (
        <Paper elevation={0} sx={{
            borderRadius: "16px",
            border: `1px solid ${brd}`,
            bgcolor: theme.palette.background.paper,
            overflow: "hidden",
            display: "flex", flexDirection: "column",
            transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
            "&:hover": {
                borderColor: `${ACCENT}50`,
                boxShadow: isDark
                    ? `0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px ${ACCENT}20`
                    : `0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px ${ACCENT}15`,
                transform: "translateY(-3px)",
            },
        }}>
            {/* top accent bar */}
            <Box sx={{
                height: 4,
                background: `linear-gradient(90deg, ${barColor} 0%, ${barColor}70 100%)`,
            }} />

            <Box sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column", gap: 1.4 }}>
                {/* header */}
                <Stack direction="row" alignItems="center" gap={1.4}>
                    <Box sx={{
                        width: 44, height: 44, borderRadius: "13px",
                        bgcolor: `${barColor}15`,
                        border: `1.5px solid ${barColor}28`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1rem", fontWeight: 800,
                        color: barColor, flexShrink: 0,
                        letterSpacing: "-0.5px",
                    }}>{av}</Box>

                    <Box minWidth={0} flex={1}>
                        <Typography fontWeight={700} fontSize="0.88rem" noWrap sx={{ color: tPri }}>
                            {name}
                        </Typography>
                        {email && (
                            <Typography fontSize="0.7rem" noWrap sx={{ color: tSec, mt: 0.1 }}>
                                {email}
                            </Typography>
                        )}
                    </Box>
                </Stack>

                {/* department */}
                {dept && (
                    <Chip
                        icon={<SchoolOutlinedIcon sx={{ fontSize: "11px !important", color: `${accent} !important` }} />}
                        label={dept}
                        size="small"
                        sx={{
                            height: 22, width: "fit-content", borderRadius: "7px",
                            bgcolor: `${ACCENT}0D`, color: accent,
                            fontWeight: 600, fontSize: "0.66rem",
                            border: `1px solid ${ACCENT}20`,
                        }}
                    />
                )}

                {/* skills */}
                {skills.length > 0 && (
                    <Box>
                        <Typography sx={{
                            fontSize: "0.62rem", fontWeight: 700,
                            textTransform: "uppercase", letterSpacing: "0.5px",
                            color: tSec, mb: 0.8,
                        }}>Skills</Typography>
                        <Stack direction="row" flexWrap="wrap" gap={0.7}>
                            {skills.slice(0, 4).map((sk, j) => {
                                const c = skillClr(j);
                                return (
                                    <Box key={sk} sx={{
                                        px: 1.1, py: 0.32, borderRadius: "6px",
                                        bgcolor: `${c}0D`, border: `1px solid ${c}22`,
                                    }}>
                                        <Typography fontSize="0.63rem" fontWeight={600} sx={{ color: c }}>
                                            {sk.length > 14 ? sk.slice(0, 12) + "…" : sk}
                                        </Typography>
                                    </Box>
                                );
                            })}
                            {skills.length > 4 && (
                                <Box sx={{
                                    px: 1.1, py: 0.32, borderRadius: "6px",
                                    bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                                    border: `1px solid ${brd}`,
                                }}>
                                    <Typography fontSize="0.63rem" fontWeight={600} sx={{ color: tSec }}>
                                        +{skills.length - 4}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    </Box>
                )}

                {/* no info */}
                {!dept && skills.length === 0 && (
                    <Typography fontSize="0.73rem" sx={{ color: tSec, fontStyle: "italic" }}>
                        No additional info available
                    </Typography>
                )}

                <Box sx={{ flex: 1 }} />

                {/* actions */}
                <Stack direction="row" gap={1} mt={0.5}>
                    <Button
                        size="small" variant="outlined"
                        onClick={() => onViewProfile(student)}
                        startIcon={<BadgeOutlinedIcon sx={{ fontSize: 13 }} />}
                        sx={{
                            flex: 1,
                            borderColor: brd, color: tSec,
                            borderRadius: "9px", textTransform: "none",
                            fontWeight: 600, fontSize: "0.7rem", py: 0.6,
                            "&:hover": { borderColor: `${ACCENT}55`, color: accent, bgcolor: `${ACCENT}08` },
                            transition: "all 0.16s",
                        }}>
                        View Profile
                    </Button>
                    <Button
                        size="small" variant="contained"
                        disabled={busy}
                        onClick={() => onInvite(student.userId ?? student.id)}
                        startIcon={busy ? null : <PersonAddOutlinedIcon sx={{ fontSize: 13 }} />}
                        sx={{
                            flex: 1,
                            bgcolor: accent,
                            "&:hover": { bgcolor: isDark ? ACCENT : "#a8622e", boxShadow: "none" },
                            borderRadius: "9px", textTransform: "none",
                            fontWeight: 700, fontSize: "0.7rem", py: 0.6,
                            boxShadow: "none", transition: "all 0.16s",
                        }}>
                        {busy ? <CircularProgress size={12} sx={{ color: "#fff" }} /> : "Invite"}
                    </Button>
                </Stack>
            </Box>
        </Paper>
    );
}

/* ════════════════════════════════════════════════════════════════
   ROW COMPONENTS (Invitations / JoinRequests)
════════════════════════════════════════════════════════════════ */
function InviteRow({ inv, onAccept, onDecline, busy }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const brd = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
    const accent = isDark ? ACCENT_LIGHT : ACCENT;

    const id = inv.joinRequestId ?? inv.id;
    const teamName = inv.teamName ?? "A team";
    const projectDesc = inv.projectDescription ?? inv.description ?? null;
    const status = inv.status ?? "Pending";
    const sentAt = inv.sentAt ? new Date(inv.sentAt).toLocaleDateString() : null;
    const senderName = inv.sender?.fullName ?? inv.senderName ?? null;
    const senderEmail = inv.sender?.email ?? inv.senderEmail ?? null;
    const clr = statusMeta(status);

    return (
        <Stack direction="row" alignItems="flex-start" gap={1.5}
            sx={{
                p: 1.6, borderRadius: "12px", border: `1px solid ${brd}`,
                bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"
            }}>
            <Avatar sx={{
                width: 36, height: 36, bgcolor: MBR_COLORS[1],
                fontSize: "0.72rem", fontWeight: 700, borderRadius: "10px", flexShrink: 0,
            }}>{initials(teamName)}</Avatar>

            <Box flex={1} minWidth={0}>
                <Typography fontWeight={600} fontSize="0.83rem" noWrap sx={{ color: tPri }}>
                    <Box component="span" sx={{ color: accent }}>{teamName}</Box>{" "}invited you to join
                </Typography>
                {senderName && (
                    <Typography fontSize="0.74rem" sx={{ color: tSec, mt: 0.2 }}>
                        From: <Box component="span" sx={{ fontWeight: 600 }}>{senderName}</Box>
                        {senderEmail && ` · ${senderEmail}`}
                    </Typography>
                )}
                {projectDesc && (
                    <Typography fontSize="0.74rem" sx={{
                        color: tSec, mt: 0.35,
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>{projectDesc}</Typography>
                )}
                <Stack direction="row" alignItems="center" gap={0.8} mt={0.5}>
                    <Chip label={status} size="small" sx={{
                        height: 16, fontSize: "0.6rem", fontWeight: 700,
                        bgcolor: clr.bg, color: clr.fg, borderRadius: "5px",
                    }} />
                    {sentAt && <Typography fontSize="0.68rem" sx={{ color: tSec }}>{sentAt}</Typography>}
                </Stack>
            </Box>

            {status === "Pending" && (
                <Stack direction="row" gap={0.5} flexShrink={0}>
                    <Tooltip title="Accept">
                        <IconButton size="small" disabled={busy} onClick={() => onAccept(id)}
                            sx={{ color: GREEN, "&:hover": { bgcolor: `${GREEN}12` } }}>
                            <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Decline">
                        <IconButton size="small" disabled={busy} onClick={() => onDecline(id)}
                            sx={{ color: RED, "&:hover": { bgcolor: `${RED}12` } }}>
                            <CancelOutlinedIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )}
        </Stack>
    );
}

function MyJoinRequestRow({ req, onCancel, busy }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const brd = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
    const accent = isDark ? ACCENT_LIGHT : ACCENT;

    const id = req.joinRequestId ?? req.id;
    const teamName = req.teamName ?? "A team";
    const projectDesc = req.projectDescription ?? req.description ?? null;
    const status = req.status ?? "Pending";
    const sentAt = req.sentAt ? new Date(req.sentAt).toLocaleDateString() : null;
    const clr = statusMeta(status);

    return (
        <Stack direction="row" alignItems="flex-start" gap={1.5}
            sx={{
                p: 1.6, borderRadius: "12px", border: `1px solid ${brd}`,
                bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"
            }}>
            <Box sx={{
                width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
                bgcolor: `${ACCENT}12`, border: `1px solid ${ACCENT}28`,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <SendOutlinedIcon sx={{ fontSize: 16, color: accent }} />
            </Box>

            <Box flex={1} minWidth={0}>
                <Typography fontWeight={600} fontSize="0.83rem" noWrap sx={{ color: tPri }}>
                    Request to join{" "}
                    <Box component="span" sx={{ color: accent }}>{teamName}</Box>
                </Typography>
                {projectDesc && (
                    <Typography fontSize="0.74rem" sx={{
                        color: tSec, mt: 0.35,
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>{projectDesc}</Typography>
                )}
                <Stack direction="row" alignItems="center" gap={0.8} mt={0.5}>
                    <Chip label={status} size="small" sx={{
                        height: 16, fontSize: "0.6rem", fontWeight: 700,
                        bgcolor: clr.bg, color: clr.fg, borderRadius: "5px",
                    }} />
                    {sentAt && <Typography fontSize="0.68rem" sx={{ color: tSec }}>{sentAt}</Typography>}
                </Stack>
            </Box>

            {status === "Pending" && (
                <Tooltip title="Cancel request">
                    <IconButton size="small" disabled={busy} onClick={() => onCancel(id)}
                        sx={{ color: RED, flexShrink: 0, "&:hover": { bgcolor: `${RED}12` } }}>
                        <DeleteOutlineIcon sx={{ fontSize: 19 }} />
                    </IconButton>
                </Tooltip>
            )}
        </Stack>
    );
}

function TeamJoinRequestRow({ req, onAccept, onReject, busy }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const brd = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
    const accent = isDark ? ACCENT_LIGHT : ACCENT;

    const id = req.joinRequestId ?? req.id;
    const studentName = req.studentName ?? req.fullName ?? "Student";
    const studentEmail = req.studentEmail ?? req.email ?? null;
    const status = req.status ?? "Pending";
    const sentAt = req.sentAt ? new Date(req.sentAt).toLocaleDateString() : null;
    const clr = statusMeta(status);

    return (
        <Stack direction="row" alignItems="flex-start" gap={1.5}
            sx={{
                p: 1.6, borderRadius: "12px", border: `1px solid ${brd}`,
                bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"
            }}>
            <Avatar sx={{
                width: 36, height: 36, bgcolor: MBR_COLORS[3],
                fontSize: "0.72rem", fontWeight: 700, borderRadius: "10px", flexShrink: 0,
            }}>{initials(studentName)}</Avatar>

            <Box flex={1} minWidth={0}>
                <Typography fontWeight={600} fontSize="0.83rem" noWrap sx={{ color: tPri }}>
                    <Box component="span" sx={{ color: accent }}>{studentName}</Box>{" "}wants to join
                </Typography>
                {studentEmail && (
                    <Typography fontSize="0.74rem" sx={{ color: tSec, mt: 0.2 }}>{studentEmail}</Typography>
                )}
                <Stack direction="row" alignItems="center" gap={0.8} mt={0.5}>
                    <Chip label={status} size="small" sx={{
                        height: 16, fontSize: "0.6rem", fontWeight: 700,
                        bgcolor: clr.bg, color: clr.fg, borderRadius: "5px",
                    }} />
                    {sentAt && <Typography fontSize="0.68rem" sx={{ color: tSec }}>{sentAt}</Typography>}
                </Stack>
            </Box>

            {status === "Pending" && (
                <Stack direction="row" gap={0.5} flexShrink={0}>
                    <Tooltip title="Accept">
                        <IconButton size="small" disabled={busy} onClick={() => onAccept(id)}
                            sx={{ color: GREEN, "&:hover": { bgcolor: `${GREEN}12` } }}>
                            <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject">
                        <IconButton size="small" disabled={busy} onClick={() => onReject(id)}
                            sx={{ color: RED, "&:hover": { bgcolor: `${RED}12` } }}>
                            <CancelOutlinedIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )}
        </Stack>
    );
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
export default function MyTeamPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const brd = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    const paperBg = theme.palette.background.paper;
    const accent = isDark ? ACCENT_LIGHT : ACCENT;

    /* ── data ── */
    const [myTeam, setMyTeam] = useState(null);
    const [invitations, setInvitations] = useState([]);
    const [myJoinRequests, setMyJoinRequests] = useState([]);
    const [teamJoinRequests, setTeamJoinRequests] = useState([]);
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
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    /* ── modals ── */
    const [showGate, setShowGate] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [leaveOpen, setLeaveOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editBusy, setEditBusy] = useState(false);
    const [profileStudent, setProfileStudent] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);

    /* ── snack ── */
    const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
    const snap = (msg, sev = "success") => setSnack({ open: true, msg, sev });

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: "12px", fontSize: "0.875rem",
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: accent },
        },
        "& .MuiInputLabel-root.Mui-focused": { color: accent },
        "& .MuiInputLabel-root": { fontSize: "0.875rem" },
    };

    /* ── fetchers ─────────────────────────────────────────────── */
    const fetchTeam = useCallback(async () => {
        try { setLoadingTeam(true); setMyTeam(await studentApi.getMyTeam() ?? null); }
        catch { setMyTeam(null); }
        finally { setLoadingTeam(false); }
    }, []);

    const fetchInvitations = useCallback(async () => {
        try { setLoadingInv(true); const d = await studentApi.getMyInvitations(); setInvitations(Array.isArray(d) ? d : []); }
        catch { setInvitations([]); }
        finally { setLoadingInv(false); }
    }, []);

    const fetchMyJoinRequests = useCallback(async () => {
        try { setLoadingMyJoinReqs(true); const d = await studentApi.getMyJoinRequests(); setMyJoinRequests(Array.isArray(d) ? d : []); }
        catch { setMyJoinRequests([]); }
        finally { setLoadingMyJoinReqs(false); }
    }, []);

    const fetchTeamJoinRequests = useCallback(async () => {
        try { setLoadingTeamJoinReqs(true); const d = await studentApi.getTeamJoinRequests(); setTeamJoinRequests(Array.isArray(d) ? d : []); }
        catch { setTeamJoinRequests([]); }
        finally { setLoadingTeamJoinReqs(false); }
    }, []);

    const fetchAvailable = useCallback(async () => {
        try { setLoadingAvail(true); const d = await studentApi.getAvailableStudents(); setAvailable(Array.isArray(d) ? d : []); }
        catch { setAvailable([]); }
        finally { setLoadingAvail(false); }
    }, []);

    useEffect(() => { fetchTeam(); fetchInvitations(); fetchMyJoinRequests(); },
        [fetchTeam, fetchInvitations, fetchMyJoinRequests]);

    useEffect(() => {
        if (!myTeam) return;
        if (tab === 2) fetchAvailable();
        if (tab === 3) fetchTeamJoinRequests();
    }, [tab, myTeam, fetchAvailable, fetchTeamJoinRequests]);

    useEffect(() => { setPage(1); }, [search, tab]);

    /* ── derived ──────────────────────────────────────────────── */
    const filtered = available.filter(s =>
        (s.fullName ?? s.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (s.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (s.department ?? "").toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);
    const paginatedList = filtered.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE);

    const pendingInvCount = invitations.filter(i => (i.status ?? "Pending") === "Pending").length;
    const pendingMyJoinCount = myJoinRequests.filter(r => (r.status ?? "Pending") === "Pending").length;
    const pendingTeamJoinCount = teamJoinRequests.filter(r => (r.status ?? "Pending") === "Pending").length;

    /* ── actions ──────────────────────────────────────────────── */
    const openEdit = () => {
        setEditTitle(myTeam?.projectTitle ?? myTeam?.project ?? "");
        setEditDesc(myTeam?.projectDescription ?? myTeam?.description ?? "");
        setEditOpen(true);
    };

    const handleSaveProject = async () => {
        if (!editTitle.trim()) { snap("Project title cannot be empty.", "error"); return; }
        try {
            setEditBusy(true);
            await studentApi.updateProjectInfo({ projectTitle: editTitle.trim(), projectDescription: editDesc.trim() });
            snap("Project info updated!"); setEditOpen(false); fetchTeam();
        } catch (e) { snap(e?.response?.data?.message ?? "Failed.", "error"); }
        finally { setEditBusy(false); }
    };

    const act = (fn) => async (...args) => {
        try { setActionBusy(true); await fn(...args); }
        catch (e) { snap(e?.response?.data?.message ?? "Something went wrong.", "error"); }
        finally { setActionBusy(false); }
    };

    const handleAcceptInv = act(async id => { await studentApi.respondToInvitation(id, true); snap("Invitation accepted!"); fetchTeam(); fetchInvitations(); });
    const handleDeclineInv = act(async id => { await studentApi.respondToInvitation(id, false); snap("Invitation declined."); fetchInvitations(); });
    const handleCancelJoin = act(async id => { await studentApi.deleteJoinRequest(id); snap("Request cancelled."); fetchMyJoinRequests(); });
    const handleAcceptTeamJoin = act(async id => { await studentApi.respondToJoinRequest(id, true); snap("Accepted!"); fetchTeam(); fetchTeamJoinRequests(); });
    const handleRejectTeamJoin = act(async id => { await studentApi.rejectJoinRequest(id); snap("Rejected."); fetchTeamJoinRequests(); });
    const handleInvite = act(async id => { await studentApi.sendInvitation(id); snap("Invitation sent!"); fetchAvailable(); fetchInvitations(); });
    const handleLeave = act(async () => { await studentApi.requestLeave(); snap("Leave request submitted."); setLeaveOpen(false); fetchTeam(); });

    /* ══ LOADING ════════════════════════════════════════════════ */
    if (loadingTeam) return (
        <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Stack alignItems="center" gap={2}>
                <CircularProgress sx={{ color: accent }} />
                <Typography sx={{ color: tSec, fontSize: "0.84rem" }}>Loading team info…</Typography>
            </Stack>
        </Box>
    );

    /* ══ NO TEAM ════════════════════════════════════════════════ */
    if (!myTeam) return (
        <>
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                    <Box>
                        <Typography variant="h2" sx={{ color: tPri, mb: 0.4 }}>My Team</Typography>
                        <Typography sx={{ color: tSec, fontSize: "0.85rem" }}>You are not part of any team yet</Typography>
                    </Box>
                </Stack>

                {invitations.length > 0 && (
                    <Paper elevation={0} sx={{ mb: 3, borderRadius: "16px", overflow: "hidden", border: `1px solid ${brd}`, bgcolor: paperBg }}>
                        <Stack direction="row" alignItems="center" gap={1} sx={{
                            px: 2.5, py: 1.8,
                            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                        }}>
                            <HowToRegOutlinedIcon sx={{ fontSize: 18, color: accent }} />
                            <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: tPri }}>Pending Invitations</Typography>
                            {pendingInvCount > 0 && (
                                <Chip label={pendingInvCount} size="small" sx={{
                                    height: 18, fontSize: "0.65rem", fontWeight: 700,
                                    bgcolor: `${ACCENT}18`, color: accent, borderRadius: "6px",
                                }} />
                            )}
                        </Stack>
                        <Stack gap={1} sx={{ p: 2.5 }}>
                            {loadingInv ? <CircularProgress size={22} sx={{ color: accent, mx: "auto" }} />
                                : invitations.map((inv, i) => (
                                    <InviteRow key={inv.joinRequestId ?? inv.id ?? i} inv={inv} busy={actionBusy}
                                        onAccept={handleAcceptInv} onDecline={handleDeclineInv} />
                                ))}
                        </Stack>
                    </Paper>
                )}

                {myJoinRequests.length > 0 && (
                    <Paper elevation={0} sx={{ mb: 3, borderRadius: "16px", overflow: "hidden", border: `1px solid ${brd}`, bgcolor: paperBg }}>
                        <Stack direction="row" alignItems="center" gap={1} sx={{
                            px: 2.5, py: 1.8,
                            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                        }}>
                            <SendOutlinedIcon sx={{ fontSize: 18, color: accent }} />
                            <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: tPri }}>My Join Requests</Typography>
                            {pendingMyJoinCount > 0 && (
                                <Chip label={pendingMyJoinCount} size="small" sx={{
                                    height: 18, fontSize: "0.65rem", fontWeight: 700,
                                    bgcolor: `${ACCENT}18`, color: accent, borderRadius: "6px",
                                }} />
                            )}
                        </Stack>
                        <Stack gap={1} sx={{ p: 2.5 }}>
                            {loadingMyJoinReqs ? <CircularProgress size={22} sx={{ color: accent, mx: "auto" }} />
                                : myJoinRequests.map((req, i) => (
                                    <MyJoinRequestRow key={req.joinRequestId ?? req.id ?? i} req={req} busy={actionBusy}
                                        onCancel={handleCancelJoin} />
                                ))}
                        </Stack>
                    </Paper>
                )}

                <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Stack alignItems="center" gap={3} sx={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
                        <Box sx={{
                            width: 68, height: 68, borderRadius: "18px",
                            bgcolor: `${ACCENT}12`, border: `1.5px solid ${ACCENT}28`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <GroupsOutlinedIcon sx={{ fontSize: 32, color: accent }} />
                        </Box>
                        <Box>
                            <Typography fontWeight={700} fontSize="1.05rem" sx={{ color: tPri, mb: 0.6 }}>You're not in a team yet</Typography>
                            <Typography fontSize="0.83rem" sx={{ color: tSec, lineHeight: 1.75 }}>
                                Create a new team with a supervisor, or join an existing one to start your graduation project.
                            </Typography>
                        </Box>
                        <Paper elevation={0} onClick={() => setShowGate(true)} sx={{
                            p: 2.2, borderRadius: "14px", cursor: "pointer", width: "100%",
                            border: `1.5px solid ${ACCENT}50`, bgcolor: `${ACCENT}08`,
                            transition: "all 0.18s ease",
                            "&:hover": { bgcolor: `${ACCENT}12`, transform: "translateY(-2px)", boxShadow: `0 6px 20px ${ACCENT}18` },
                        }}>
                            <Stack direction="row" alignItems="center" gap={2}>
                                <Box sx={{
                                    width: 40, height: 40, borderRadius: "12px", flexShrink: 0,
                                    bgcolor: `${ACCENT}18`, border: `1px solid ${ACCENT}28`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <AddCircleOutlineIcon sx={{ fontSize: 22, color: accent }} />
                                </Box>
                                <Box textAlign="left">
                                    <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: tPri }}>Create or Join a Team</Typography>
                                    <Typography fontSize="0.76rem" sx={{ color: tSec }}>Start fresh or browse available teams</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Stack>
                </Box>
            </Box>

            <JoinOrCreateModal open={showGate} onClose={() => setShowGate(false)}
                onCreate={() => { setShowGate(false); setShowCreate(true); }}
                onJoin={() => { setShowGate(false); setShowJoin(true); }} />
            <CreateTeamFlow open={showCreate} onClose={() => setShowCreate(false)}
                onSuccess={msg => { snap(msg); setShowCreate(false); fetchTeam(); }} />
            <JoinTeamFlow open={showJoin} onClose={() => setShowJoin(false)}
                onSuccess={msg => { snap(msg); setShowJoin(false); fetchTeam(); fetchMyJoinRequests(); }} />

            <Snackbar open={snack.open} autoHideDuration={3500}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity={snack.sev} variant="filled" sx={{ borderRadius: "12px" }}>{snack.msg}</Alert>
            </Snackbar>
        </>
    );

    /* ══ HAS TEAM ═══════════════════════════════════════════════ */
    const members = myTeam.members ?? myTeam.students ?? [];
    const supervisor = myTeam.supervisor ?? myTeam.supervisorName ?? null;
    const project = myTeam.projectTitle ?? myTeam.project ?? "—";
    const projectDesc = myTeam.projectDescription ?? myTeam.description ?? null;
    const teamStatus = myTeam.status ?? myTeam.teamStatus ?? null;
    const teamName = myTeam.teamName ?? myTeam.name ?? null;

    return (
        <>
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 2.5 }}>

                {/* ── HEADER ─────────────────────────────────────── */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h2" sx={{ color: tPri, mb: 0.3 }}>My Team</Typography>
                        <Typography sx={{ color: tSec, fontSize: "0.84rem" }}>
                            {teamName ? `Team: ${teamName}` : "Your current team & project"}
                        </Typography>
                    </Box>
                    <Stack direction="row" gap={1}>
                        <Tooltip title="Refresh">
                            <IconButton size="small"
                                onClick={() => { fetchTeam(); fetchInvitations(); fetchMyJoinRequests(); fetchTeamJoinRequests(); }}
                                sx={{ color: tSec, border: `1px solid ${brd}`, borderRadius: "10px", "&:hover": { color: accent } }}>
                                <RefreshOutlinedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                        </Tooltip>
                        <Button size="small" variant="outlined" startIcon={<ExitToAppOutlinedIcon />}
                            onClick={() => setLeaveOpen(true)}
                            sx={{
                                borderColor: `${RED}55`, color: RED, borderRadius: "10px",
                                textTransform: "none", fontWeight: 600, fontSize: "0.78rem",
                                "&:hover": { bgcolor: `${RED}08`, borderColor: RED },
                            }}>
                            Leave Team
                        </Button>
                    </Stack>
                </Stack>

                {/* ── PROJECT + SUPERVISOR ───────────────────────── */}
                <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
                    <Paper elevation={0} sx={{ flex: 1, p: 2.5, borderRadius: "18px", border: `1px solid ${brd}`, bgcolor: paperBg }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.8}>
                            <Stack direction="row" alignItems="center" gap={1.2}>
                                <Box sx={{
                                    width: 36, height: 36, borderRadius: "11px", flexShrink: 0,
                                    bgcolor: `${ACCENT}12`, border: `1px solid ${ACCENT}25`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <FolderOutlinedIcon sx={{ fontSize: 18, color: accent }} />
                                </Box>
                                <Typography fontWeight={700} fontSize={"0.78rem"} sx={{
                                    color: tSec, textTransform: "uppercase", letterSpacing: "0.08em",
                                }}>Project</Typography>
                            </Stack>
                            <Tooltip title="Edit project info">
                                <IconButton size="small" onClick={openEdit} sx={{
                                    color: tSec, borderRadius: "8px",
                                    "&:hover": { color: accent, bgcolor: `${ACCENT}0D` },
                                }}>
                                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                        <Typography fontWeight={700} fontSize="1rem" sx={{ color: tPri, mb: 0.5 }}>{project}</Typography>
                        {projectDesc && (
                            <Typography fontSize="0.78rem" sx={{
                                color: tSec, lineHeight: 1.65, mb: 0.8,
                                display: "-webkit-box", WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical", overflow: "hidden",
                            }}>{projectDesc}</Typography>
                        )}
                        {teamStatus && (() => {
                            const m = statusMeta(teamStatus); return (
                                <Chip label={teamStatus} size="small" sx={{
                                    height: 20, fontSize: "0.65rem", fontWeight: 700,
                                    bgcolor: m.bg, color: m.fg, borderRadius: "7px",
                                }} />);
                        })()}
                    </Paper>

                    <Paper elevation={0} sx={{ flex: 1, p: 2.5, borderRadius: "18px", border: `1px solid ${brd}`, bgcolor: paperBg }}>
                        <Stack direction="row" alignItems="center" gap={1.2} mb={1.8}>
                            <Box sx={{
                                width: 36, height: 36, borderRadius: "11px", flexShrink: 0,
                                bgcolor: "rgba(109,138,125,0.12)", border: "1px solid rgba(109,138,125,0.22)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <SchoolOutlinedIcon sx={{ fontSize: 18, color: "#6D8A7D" }} />
                            </Box>
                            <Typography fontWeight={700} fontSize="0.78rem" sx={{
                                color: tSec, textTransform: "uppercase", letterSpacing: "0.08em",
                            }}>Supervisor</Typography>
                        </Stack>
                        {supervisor ? (
                            <Stack direction="row" alignItems="center" gap={1.5}>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: "#6D8A7D", fontWeight: 700, fontSize: "0.9rem", borderRadius: "12px" }}>
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
                </Stack >

                {/* ── TABS ──────────────────────────────────────── */}
                < Paper elevation={0} sx={{
                    flex: 1, borderRadius: "18px", overflow: "hidden",
                    border: `1px solid ${brd}`, bgcolor: paperBg,
                    display: "flex", flexDirection: "column",
                }
                }>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
                        px: 1.5, minHeight: 46,
                        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                        "& .MuiTab-root": {
                            textTransform: "none", fontWeight: 600,
                            fontSize: "0.8rem", minHeight: 46, color: tSec,
                        },
                        "& .Mui-selected": { color: accent },
                        "& .MuiTabs-indicator": { bgcolor: accent, height: 2.5, borderRadius: "2px" },
                    }}>
                        <Tab label={<Stack direction="row" alignItems="center" gap={0.7}><PeopleOutlineIcon sx={{ fontSize: 15 }} /><span>Members ({members.length})</span></Stack>} />
                        <Tab label={
                            <Stack direction="row" alignItems="center" gap={0.7}>
                                <HowToRegOutlinedIcon sx={{ fontSize: 15 }} /><span>Invitations</span>
                                {pendingInvCount > 0 && <Chip label={pendingInvCount} size="small" sx={{ height: 16, fontSize: "0.6rem", fontWeight: 700, bgcolor: `${ACCENT}20`, color: accent, borderRadius: "5px" }} />}
                            </Stack>
                        } />
                        <Tab label={
                            <Stack direction="row" alignItems="center" gap={0.7}>
                                <PersonAddOutlinedIcon sx={{ fontSize: 15 }} /><span>Invite Students</span>
                                {filtered.length > 0 && <Chip label={filtered.length} size="small" sx={{ height: 16, fontSize: "0.6rem", fontWeight: 700, bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)", color: tSec, borderRadius: "5px" }} />}
                            </Stack>
                        } />
                        <Tab label={
                            <Stack direction="row" alignItems="center" gap={0.7}>
                                <SendOutlinedIcon sx={{ fontSize: 15 }} /><span>Join Requests</span>
                                {pendingTeamJoinCount > 0 && <Chip label={pendingTeamJoinCount} size="small" sx={{ height: 16, fontSize: "0.6rem", fontWeight: 700, bgcolor: `${ACCENT}20`, color: accent, borderRadius: "5px" }} />}
                            </Stack>
                        } />
                        <Tab label={
                            <Stack direction="row" alignItems="center" gap={0.7}>
                                <SendOutlinedIcon sx={{ fontSize: 15, transform: "scaleX(-1)" }} /><span>My Requests</span>
                                {pendingMyJoinCount > 0 && <Chip label={pendingMyJoinCount} size="small" sx={{ height: 16, fontSize: "0.6rem", fontWeight: 700, bgcolor: `${ACCENT}20`, color: accent, borderRadius: "5px" }} />}
                            </Stack>
                        } />
                    </Tabs>

                    {/* TAB 0 — Members */}
                    {
                        tab === 0 && (
                            <Box sx={{ p: 2.5, flex: 1, overflowY: "auto" }}>
                                {members.length === 0 ? (
                                    <Typography sx={{ color: tSec, fontSize: "0.84rem", textAlign: "center", mt: 4 }}>No members yet</Typography>
                                ) : (
                                    <Stack gap={1.2}>
                                        {members.map((m, i) => {
                                            const mName = m.fullName ?? m.name ?? "Student";
                                            const leader = m.isLeader ?? m.role === "leader" ?? i === 0;
                                            const clr = MBR_COLORS[i % MBR_COLORS.length];
                                            return (
                                                <Stack key={m.userId ?? m.id ?? i} direction="row" alignItems="center" gap={1.5}
                                                    sx={{
                                                        p: 1.5, borderRadius: "12px",
                                                        border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
                                                        bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                                                    }}>
                                                    <Box sx={{
                                                        width: 40, height: 40, borderRadius: "12px",
                                                        bgcolor: `${clr}18`, border: `1.5px solid ${clr}28`,
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        fontSize: "0.85rem", fontWeight: 800, color: clr,
                                                    }}>{initials(mName)}</Box>
                                                    <Box flex={1} minWidth={0}>
                                                        <Stack direction="row" alignItems="center" gap={0.8}>
                                                            <Typography fontWeight={600} fontSize="0.87rem" noWrap sx={{ color: tPri }}>{mName}</Typography>
                                                            {leader && (
                                                                <Chip label="Leader" size="small" sx={{
                                                                    height: 17, fontSize: "0.6rem", fontWeight: 700,
                                                                    bgcolor: `${ACCENT}14`, color: accent, borderRadius: "5px",
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
                        )
                    }

                    {/* TAB 1 — Invitations */}
                    {
                        tab === 1 && (
                            <Box sx={{ p: 2.5, flex: 1, overflowY: "auto" }}>
                                {loadingInv ? <Box display="flex" justifyContent="center" pt={4}><CircularProgress size={24} sx={{ color: accent }} /></Box>
                                    : invitations.length === 0
                                        ? <Typography sx={{ color: tSec, fontSize: "0.84rem", textAlign: "center", mt: 4 }}>No invitations yet</Typography>
                                        : <Stack gap={1.2}>
                                            {invitations.map((inv, i) => (
                                                <InviteRow key={inv.joinRequestId ?? inv.id ?? i} inv={inv} busy={actionBusy}
                                                    onAccept={handleAcceptInv} onDecline={handleDeclineInv} />
                                            ))}
                                        </Stack>
                                }
                            </Box>
                        )
                    }

                    {/* TAB 2 — Invite Students (GRID + PAGINATION) */}
                    {
                        tab === 2 && (
                            <Box sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                                {/* search */}
                                <Stack direction="row" alignItems="center" gap={1.5} mb={2.5}>
                                    <TextField
                                        size="small" fullWidth
                                        placeholder="Search by name, email or department…"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        InputProps={{ startAdornment: <SearchOutlinedIcon sx={{ fontSize: 17, color: tSec, mr: 0.8 }} /> }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "12px", fontSize: "0.85rem",
                                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: accent },
                                            },
                                        }}
                                    />
                                    {!loadingAvail && filtered.length > 0 && (
                                        <Typography fontSize="0.76rem" sx={{ color: tSec, whiteSpace: "nowrap" }}>
                                            {filtered.length} student{filtered.length !== 1 ? "s" : ""}
                                        </Typography>
                                    )}
                                </Stack>

                                {/* grid */}
                                <Box sx={{ flex: 1, overflowY: "auto" }}>
                                    {loadingAvail ? (
                                        <Box display="flex" justifyContent="center" pt={5}>
                                            <CircularProgress size={28} sx={{ color: accent }} />
                                        </Box>
                                    ) : paginatedList.length === 0 ? (
                                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pt: 7, gap: 1.5 }}>
                                            <Box sx={{
                                                width: 56, height: 56, borderRadius: "16px",
                                                bgcolor: `${ACCENT}0D`, border: `1px solid ${ACCENT}1E`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}>
                                                <PersonAddOutlinedIcon sx={{ fontSize: 26, color: accent, opacity: 0.55 }} />
                                            </Box>
                                            <Typography fontSize="0.84rem" sx={{ color: tSec }}>
                                                {search ? "No students match your search." : "No available students found."}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                                            gap: 2, pb: 1,
                                        }}>
                                            {paginatedList.map((s, i) => (
                                                <StudentCard
                                                    key={s.userId ?? s.id ?? i}
                                                    student={s}
                                                    colorIndex={(page - 1) * CARDS_PER_PAGE + i}
                                                    busy={actionBusy}
                                                    onInvite={handleInvite}
                                                    onViewProfile={st => { setProfileStudent(st); setProfileOpen(true); }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                </Box>

                                {/* pagination */}
                                {totalPages > 1 && (
                                    <Stack alignItems="center" sx={{ pt: 2.5, mt: 1.5, borderTop: `1px solid ${brd}` }}>
                                        <Pagination
                                            count={totalPages}
                                            page={page}
                                            onChange={(_, v) => setPage(v)}
                                            size="small"
                                            sx={{
                                                "& .MuiPaginationItem-root": {
                                                    borderRadius: "8px", fontWeight: 600,
                                                    fontSize: "0.78rem", color: tSec,
                                                },
                                                "& .Mui-selected": { bgcolor: `${ACCENT} !important`, color: "#fff !important" },
                                                "& .MuiPaginationItem-root:hover:not(.Mui-selected)": {
                                                    bgcolor: `${ACCENT}12`, color: accent,
                                                },
                                            }}
                                        />
                                        <Typography fontSize="0.71rem" sx={{ color: tSec, mt: 0.8 }}>
                                            Showing {(page - 1) * CARDS_PER_PAGE + 1}–{Math.min(page * CARDS_PER_PAGE, filtered.length)} of {filtered.length}
                                        </Typography>
                                    </Stack>
                                )}
                            </Box>
                        )
                    }

                    {/* TAB 3 — Team join requests */}
                    {
                        tab === 3 && (
                            <Box sx={{ p: 2.5, flex: 1, overflowY: "auto" }}>
                                {loadingTeamJoinReqs ? <Box display="flex" justifyContent="center" pt={4}><CircularProgress size={24} sx={{ color: accent }} /></Box>
                                    : teamJoinRequests.length === 0
                                        ? <Typography sx={{ color: tSec, fontSize: "0.84rem", textAlign: "center", mt: 4 }}>No join requests yet</Typography>
                                        : <Stack gap={1.2}>
                                            {teamJoinRequests.map((req, i) => (
                                                <TeamJoinRequestRow key={req.joinRequestId ?? req.id ?? i} req={req} busy={actionBusy}
                                                    onAccept={handleAcceptTeamJoin} onReject={handleRejectTeamJoin} />
                                            ))}
                                        </Stack>
                                }
                            </Box>
                        )
                    }

                    {/* TAB 4 — My join requests */}
                    {
                        tab === 4 && (
                            <Box sx={{ p: 2.5, flex: 1, overflowY: "auto" }}>
                                {loadingMyJoinReqs ? <Box display="flex" justifyContent="center" pt={4}><CircularProgress size={24} sx={{ color: accent }} /></Box>
                                    : myJoinRequests.length === 0
                                        ? <Typography sx={{ color: tSec, fontSize: "0.84rem", textAlign: "center", mt: 4 }}>You haven't sent any join requests</Typography>
                                        : <Stack gap={1.2}>
                                            {myJoinRequests.map((req, i) => (
                                                <MyJoinRequestRow key={req.joinRequestId ?? req.id ?? i} req={req} busy={actionBusy} onCancel={handleCancelJoin} />
                                            ))}
                                        </Stack>
                                }
                            </Box>
                        )
                    }
                </Paper >
            </Box >

            {/* ══ PROFILE MODAL ════════════════════════════════════ */}
            < StudentProfileModal
                open={profileOpen}
                onClose={() => { setProfileOpen(false); setProfileStudent(null); }}
                student={profileStudent}
                onInvite={handleInvite}
                isInviting={actionBusy}
            />

            {/* ══ EDIT PROJECT DIALOG ══════════════════════════════ */}
            < Dialog open={editOpen} onClose={() => !editBusy && setEditOpen(false)}
                maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: "18px", border: `1px solid ${brd}`, bgcolor: paperBg } }}>
                <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${brd}` }}>
                    <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: tPri }}>Edit Project Info</Typography>
                </Box>
                <Box sx={{ px: 3, py: 2.5 }}>
                    <Stack gap={2}>
                        <TextField label="Project Title" size="small" fullWidth required
                            value={editTitle} onChange={e => setEditTitle(e.target.value)} sx={inputSx} />
                        <TextField label="Project Description" size="small" fullWidth multiline rows={3}
                            value={editDesc} onChange={e => setEditDesc(e.target.value)} sx={inputSx} />
                    </Stack>
                </Box>
                <Box sx={{ px: 3, pb: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <Button disabled={editBusy} onClick={() => setEditOpen(false)}
                        sx={{ color: tSec, textTransform: "none", fontWeight: 500, borderRadius: "10px" }}>Cancel</Button>
                    <Button variant="contained" disabled={editBusy} onClick={handleSaveProject}
                        sx={{ bgcolor: accent, "&:hover": { bgcolor: isDark ? ACCENT : "#a8622e", boxShadow: "none" }, textTransform: "none", fontWeight: 700, borderRadius: "10px", boxShadow: "none" }}>
                        {editBusy ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Save"}
                    </Button>
                </Box>
            </Dialog >

            {/* ══ LEAVE CONFIRM DIALOG ═════════════════════════════ */}
            < Dialog open={leaveOpen} onClose={() => setLeaveOpen(false)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: "18px", border: `1px solid ${brd}`, bgcolor: paperBg } }}>
                <Box sx={{ p: 3 }}>
                    <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: tPri, mb: 0.8 }}>Leave Team?</Typography>
                    <Typography fontSize="0.83rem" sx={{ color: tSec, lineHeight: 1.75, mb: 2.5 }}>
                        A leave request will be submitted. You'll be removed from the team after it's approved by a supervisor.
                    </Typography>
                    <Stack direction="row" gap={1} justifyContent="flex-end">
                        <Button onClick={() => setLeaveOpen(false)}
                            sx={{ textTransform: "none", color: tSec, borderRadius: "10px", fontWeight: 500 }}>Cancel</Button>
                        <Button variant="contained" disabled={actionBusy} onClick={handleLeave}
                            sx={{ bgcolor: RED, "&:hover": { bgcolor: "#b83f3f", boxShadow: "none" }, textTransform: "none", fontWeight: 700, borderRadius: "10px", boxShadow: "none", px: 3 }}>
                            {actionBusy ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Confirm Leave"}
                        </Button>
                    </Stack>
                </Box>
            </Dialog >

            {/* ── SNACKBAR ─────────────────────────────────────────── */}
            < Snackbar open={snack.open} autoHideDuration={3500}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity={snack.sev} variant="filled" sx={{ borderRadius: "12px" }}>{snack.msg}</Alert>
            </Snackbar >
        </>
    );
}