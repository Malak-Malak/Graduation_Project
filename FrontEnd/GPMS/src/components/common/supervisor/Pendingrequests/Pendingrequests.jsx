// src/components/common/supervisor/Pendingrequests/Pendingrequests.jsx
//
// Supervisor "Pending Requests" page.
//
// FIXES applied in this version:
//   • projectTitle used as primary label for team join requests (not teamName/id)
//   • Leave requests show the actual student full name clearly
//   • Cards are full-width and visually expanded
//   • Processed history also uses projectTitle / studentName correctly
//
// Data sources:
//   getPendingTeamRequests()  → GET /api/Supervisor/pending-team-requests
//   getPendingLeaveRequests() → GET /api/Supervisor/leave-requests  (⚠ pending backend, falls back to [])
//   respondToTeamRequest()    → POST /api/Supervisor/respond-to-team-request
//   respondToLeaveRequest()   → POST /api/Supervisor/respond-to-leave-request

import { useState, useEffect, useCallback } from "react";
import {
    Box, Paper, Typography, Stack, Avatar, Chip, Button, AvatarGroup,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    CircularProgress, Alert, Snackbar, IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

import {
    getPendingTeamRequests,
    getPendingLeaveRequests,
    respondToTeamRequest,
    respondToLeaveRequest,
} from "../../../../api/handler/endpoints/supervisorApi";

/* ─── design tokens ─────────────────────────────────────────── */
const PRIMARY = "#d0895b";
const GREEN = "#4caf7d";
const RED = "#e57373";
const MBR_COLORS = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8"];

const initials = (name = "") =>
    (name ?? "?").split(" ").map((w) => w[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";

/* ─── mapTeamReq ─────────────────────────────────────────────────
 * Maps a raw team-join request to a consistent UI shape.
 * PRIMARY label = projectTitle (what the team is working on).
 */
const mapTeamReq = (r) => ({
    id: r.teamId ?? r.id,
    teamId: r.teamId ?? r.id,

    // ← PRIMARY label: always show what the project is called
    projectTitle:
        r.projectTitle ??
        r.project ??
        r.teamName ??
        r.name ??
        (r.teamId ? `Team #${r.teamId}` : r.id ? `Team #${r.id}` : "New Team"),

    // secondary info
    teamName: r.teamName ?? r.name ?? null,
    projectDescription: r.projectDescription ?? r.description ?? "",

    // who submitted the request (team leader / student)
    leader:
        r.leaderName ??
        r.leader ??
        r.studentName ??
        r.requestedBy ??
        r.fullName ??
        r.memberName ??
        (r.leaderId ? `Student #${r.leaderId}` : null),

    members: r.members ?? r.memberInitials ?? [],
    dept: r.department ?? r.dept ?? "",
    submitted: r.requestedAt
        ? new Date(r.requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : r.submitted ?? "",
});

/* ─── mapLeaveReq ────────────────────────────────────────────────
 * Maps a raw leave request.
 * PRIMARY label = student's full name (who wants to leave).
 */
const mapLeaveReq = (r) => ({
    id: r.teamMemberId ?? r.id,
    teamMemberId: r.teamMemberId ?? r.id,

    // which project/team they're leaving
    projectTitle:
        r.projectTitle ??
        r.project ??
        r.teamName ??
        r.team ??
        r.name ??
        (r.teamId ? `Team #${r.teamId}` : "—"),

    teamName: r.teamName ?? r.team ?? null,

    // ← PRIMARY label for leave requests: the student's actual name
    studentName:
        r.studentName ??
        r.memberName ??
        r.fullName ??
        r.name ??
        r.requestedBy ??
        r.leaderName ??
        (r.teamMemberId
            ? `Member #${r.teamMemberId}`
            : r.memberId
                ? `Member #${r.memberId}`
                : r.studentId
                    ? `Student #${r.studentId}`
                    : "Unknown Member"),

    submitted: r.requestedAt
        ? new Date(r.requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : r.submitted ?? "",
    description: r.reason ?? r.description ?? "",
});

/* ════════════════════════════════════════════════════════════════
   REQUEST CARD
════════════════════════════════════════════════════════════════ */
function RequestCard({ req, type, actionLoading, onApprove, onReject }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const isLeave = type === "leave";

    const isApproveBusy = actionLoading === `approve-${req.id}`;
    const isRejectBusy = actionLoading === `reject-${req.id}`;
    const anyBusy = !!actionLoading;

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: "16px",
                border: `1px solid ${border}`,
                bgcolor: theme.palette.background.paper,
                overflow: "hidden",
            }}
        >
            {/* coloured left accent bar */}
            <Box sx={{
                height: 3,
                bgcolor: isLeave ? RED : PRIMARY,
            }} />

            <Box sx={{ p: 2.5 }}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between"
                    alignItems={{ sm: "flex-start" }} gap={2}>

                    {/* ── Left content ── */}
                    <Box flex={1} minWidth={0}>

                        {/* icon + primary label */}
                        <Stack direction="row" alignItems="flex-start" gap={1.5} mb={1}>
                            <Box sx={{
                                width: 40, height: 40, borderRadius: "12px", flexShrink: 0,
                                bgcolor: isLeave ? "rgba(229,115,115,0.10)" : `${PRIMARY}12`,
                                border: `1px solid ${isLeave ? "rgba(229,115,115,0.25)" : `${PRIMARY}28`}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                {isLeave
                                    ? <ExitToAppOutlinedIcon sx={{ fontSize: 19, color: RED }} />
                                    : <FolderOutlinedIcon sx={{ fontSize: 19, color: PRIMARY }} />
                                }
                            </Box>

                            <Box minWidth={0} flex={1}>
                                {isLeave ? (
                                    <>
                                        {/* Leave: show student name as headline */}
                                        <Stack direction="row" alignItems="center" gap={0.8} flexWrap="wrap">
                                            <PersonOutlineIcon sx={{ fontSize: 15, color: RED }} />
                                            <Typography fontWeight={700} fontSize="1rem" sx={{ color: tPri }}>
                                                {req.studentName}
                                            </Typography>
                                            <Chip
                                                label="Leave Request"
                                                size="small"
                                                sx={{
                                                    height: 20, fontSize: "0.62rem", fontWeight: 700,
                                                    bgcolor: "rgba(229,115,115,0.12)", color: RED,
                                                    borderRadius: "6px",
                                                }}
                                            />
                                        </Stack>
                                        <Typography fontSize="0.78rem" sx={{ color: tSec, mt: 0.3 }}>
                                            Wants to leave:{" "}
                                            <Box component="span" sx={{ fontWeight: 600, color: PRIMARY }}>
                                                {req.projectTitle}
                                            </Box>
                                        </Typography>
                                    </>
                                ) : (
                                    <>
                                        {/* Team join: show projectTitle as headline */}
                                        <Stack direction="row" alignItems="center" gap={0.8} flexWrap="wrap">
                                            <Typography fontWeight={700} fontSize="1rem" sx={{ color: tPri }}>
                                                {req.projectTitle}
                                            </Typography>
                                            {req.dept && (
                                                <Chip
                                                    label={req.dept}
                                                    size="small"
                                                    sx={{
                                                        height: 20, fontSize: "0.62rem", fontWeight: 700,
                                                        bgcolor: `${PRIMARY}15`, color: PRIMARY,
                                                        borderRadius: "6px",
                                                    }}
                                                />
                                            )}
                                        </Stack>
                                        {req.teamName && req.teamName !== req.projectTitle && (
                                            <Typography fontSize="0.74rem" sx={{ color: tSec, mt: 0.1 }}>
                                                {req.teamName}
                                            </Typography>
                                        )}
                                    </>
                                )}
                            </Box>
                        </Stack>

                        {/* description */}
                        {req.projectDescription && (
                            <Typography fontSize="0.82rem" sx={{
                                color: tSec, mb: 1.5, lineHeight: 1.6,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}>
                                {req.projectDescription}
                            </Typography>
                        )}
                        {isLeave && req.description && (
                            <Typography fontSize="0.82rem" sx={{ color: tSec, mb: 1.5, lineHeight: 1.6 }}>
                                Reason: {req.description}
                            </Typography>
                        )}

                        {/* leader + members + date */}
                        <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1.5} mt={0.5}>
                            {!isLeave && req.leader && (
                                <Stack direction="row" alignItems="center" gap={0.7}>
                                    <Box sx={{
                                        width: 24, height: 24, borderRadius: "7px",
                                        bgcolor: `${PRIMARY}15`, border: `1px solid ${PRIMARY}25`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "0.58rem", fontWeight: 800, color: PRIMARY,
                                    }}>
                                        {initials(req.leader)}
                                    </Box>
                                    <Typography fontSize="0.78rem" sx={{ color: tSec }}>
                                        Leader:{" "}
                                        <Box component="span" sx={{ fontWeight: 600, color: tPri }}>
                                            {req.leader}
                                        </Box>
                                    </Typography>
                                </Stack>
                            )}

                            {!isLeave && req.members?.length > 0 && (
                                <AvatarGroup max={5} sx={{
                                    "& .MuiAvatar-root": {
                                        width: 24, height: 24,
                                        fontSize: "0.62rem", fontWeight: 700,
                                    },
                                }}>
                                    {req.members.map((m, j) => (
                                        <Avatar key={j} sx={{ bgcolor: MBR_COLORS[j % MBR_COLORS.length] }}>
                                            {typeof m === "string" ? m[0] : initials(m.fullName ?? m.name ?? "?")}
                                        </Avatar>
                                    ))}
                                </AvatarGroup>
                            )}

                            {req.submitted && (
                                <Typography fontSize="0.72rem" sx={{ color: tSec }}>
                                    {req.submitted}
                                </Typography>
                            )}
                        </Stack>
                    </Box>

                    {/* ── Action buttons ── */}
                    <Stack direction={{ xs: "row", sm: "column" }} gap={1} sx={{ flexShrink: 0, minWidth: 120 }}>
                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={
                                isApproveBusy
                                    ? <CircularProgress size={14} color="inherit" />
                                    : <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
                            }
                            disabled={anyBusy}
                            onClick={() => onApprove(req)}
                            sx={{
                                bgcolor: GREEN,
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                textTransform: "none",
                                borderRadius: "10px",
                                boxShadow: "none",
                                "&:hover": { bgcolor: "#3d9068", boxShadow: "none" },
                                whiteSpace: "nowrap",
                            }}
                        >
                            Approve
                        </Button>
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={
                                isRejectBusy
                                    ? <CircularProgress size={14} color="inherit" />
                                    : <CancelOutlinedIcon sx={{ fontSize: 16 }} />
                            }
                            disabled={anyBusy}
                            onClick={() => onReject(req, type)}
                            sx={{
                                borderColor: RED,
                                color: RED,
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                textTransform: "none",
                                borderRadius: "10px",
                                "&:hover": { bgcolor: `${RED}10`, borderColor: RED },
                                whiteSpace: "nowrap",
                            }}
                        >
                            Reject
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Paper>
    );
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
export default function PendingRequests() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";

    /* ── state ── */
    const [teamRequests, setTeamRequests] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [processed, setProcessed] = useState([]);

    const [fetchLoading, setFetchLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null); // "approve-<id>" | "reject-<id>" | null

    /* reject dialog */
    const [selected, setSelected] = useState(null);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectNote, setRejectNote] = useState("");
    const [rejectType, setRejectType] = useState("team");

    /* snackbar */
    const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
    const snap = (msg, severity = "success") => setSnack({ open: true, msg, severity });

    /* ── fetch ── */
    const fetchRequests = useCallback(async () => {
        setFetchLoading(true);
        setFetchError(null);
        try {
            const [teamData, leaveData] = await Promise.all([
                getPendingTeamRequests(),
                getPendingLeaveRequests(),
            ]);

            const teamArr = Array.isArray(teamData)
                ? teamData
                : (teamData?.teamRequests ?? teamData?.pendingTeamRequests ?? []);

            const leaveArr = Array.isArray(leaveData) ? leaveData : [];

            setTeamRequests(teamArr.map(mapTeamReq));
            setLeaveRequests(leaveArr.map(mapLeaveReq));
        } catch (err) {
            setFetchError(err?.response?.data?.message || "Failed to load requests.");
        } finally {
            setFetchLoading(false);
        }
    }, []);

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    /* ── approve ── */
    const handleApprove = async (req) => {
        const type = req.teamMemberId != null ? "leave" : "team";
        const key = `approve-${req.id}`;
        setActionLoading(key);
        try {
            if (type === "leave") {
                await respondToLeaveRequest({ teamMemberId: req.teamMemberId, isApproved: true });
                setLeaveRequests((p) => p.filter((r) => r.id !== req.id));
                snap(`Leave approved for ${req.studentName}.`);
            } else {
                await respondToTeamRequest({ teamId: req.teamId, isApproved: true });
                setTeamRequests((p) => p.filter((r) => r.id !== req.id));
                snap(`"${req.projectTitle}" approved! ✓`);
            }
            setProcessed((p) => [...p, { ...req, status: "approved", kind: type }]);
        } catch (err) {
            snap(err?.response?.data?.message || "Approval failed.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    /* ── open reject dialog ── */
    const openReject = (req, type) => {
        setSelected({ ...req, _type: type });
        setRejectType(type);
        setRejectNote("");
        setRejectOpen(true);
    };

    /* ── confirm reject ── */
    const handleReject = async () => {
        const type = rejectType;
        const key = `reject-${selected.id}`;
        setActionLoading(key);
        try {
            if (type === "leave") {
                await respondToLeaveRequest({ teamMemberId: selected.teamMemberId, isApproved: false });
                setLeaveRequests((p) => p.filter((r) => r.id !== selected.id));
                snap(`Leave request from ${selected.studentName} rejected.`, "info");
            } else {
                await respondToTeamRequest({ teamId: selected.teamId, isApproved: false });
                setTeamRequests((p) => p.filter((r) => r.id !== selected.id));
                snap(`"${selected.projectTitle}" rejected.`, "info");
            }
            setProcessed((p) => [...p, { ...selected, status: "rejected", note: rejectNote, kind: type }]);
        } catch (err) {
            snap(err?.response?.data?.message || "Rejection failed.", "error");
        } finally {
            setActionLoading(null);
            setRejectOpen(false);
        }
    };

    const allRequests = [...teamRequests, ...leaveRequests];

    /* ── render ── */
    return (
        <Box sx={{ maxWidth: 900 }}>

            {/* ── Header ── */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                <Box>
                    <Typography variant="h2" sx={{ color: tPri, mb: 0.5 }}>Pending Requests</Typography>
                    <Typography sx={{ color: tSec, fontSize: "0.9rem" }}>
                        {allRequests.length} awaiting review · {processed.length} processed
                    </Typography>
                </Box>
                <Button
                    size="small"
                    startIcon={fetchLoading ? <CircularProgress size={14} /> : <RefreshOutlinedIcon />}
                    onClick={fetchRequests}
                    disabled={fetchLoading}
                    sx={{ color: tSec, fontSize: "0.8rem", textTransform: "none" }}
                >
                    Refresh
                </Button>
            </Stack>

            {/* ── Fetch error ── */}
            {fetchError && <Alert severity="error" sx={{ mb: 2 }}>{fetchError}</Alert>}

            {/* ── Loading ── */}
            {fetchLoading && (
                <Box textAlign="center" py={6}><CircularProgress sx={{ color: PRIMARY }} /></Box>
            )}

            {/* ── Team join requests ── */}
            {!fetchLoading && teamRequests.length > 0 && (
                <>
                    <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                        <FolderOutlinedIcon sx={{ fontSize: 15, color: PRIMARY }} />
                        <Typography sx={{
                            color: tSec, fontSize: "0.78rem", fontWeight: 700,
                            textTransform: "uppercase", letterSpacing: 1,
                        }}>
                            Team Join Requests
                        </Typography>
                        <Chip label={teamRequests.length} size="small" sx={{
                            height: 18, fontSize: "0.62rem", fontWeight: 700,
                            bgcolor: `${PRIMARY}18`, color: PRIMARY,
                        }} />
                    </Stack>
                    <Stack spacing={2} sx={{ mb: 3 }}>
                        {teamRequests.map((r) => (
                            <RequestCard
                                key={r.id}
                                req={r}
                                type="team"
                                actionLoading={actionLoading}
                                onApprove={handleApprove}
                                onReject={(req) => openReject(req, "team")}
                            />
                        ))}
                    </Stack>
                </>
            )}

            {/* ── Leave requests ── */}
            {!fetchLoading && leaveRequests.length > 0 && (
                <>
                    <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                        <ExitToAppOutlinedIcon sx={{ fontSize: 15, color: RED }} />
                        <Typography sx={{
                            color: tSec, fontSize: "0.78rem", fontWeight: 700,
                            textTransform: "uppercase", letterSpacing: 1,
                        }}>
                            Leave Requests
                        </Typography>
                        <Chip label={leaveRequests.length} size="small" sx={{
                            height: 18, fontSize: "0.62rem", fontWeight: 700,
                            bgcolor: "rgba(229,115,115,0.12)", color: RED,
                        }} />
                    </Stack>
                    <Stack spacing={2} sx={{ mb: 3 }}>
                        {leaveRequests.map((r) => (
                            <RequestCard
                                key={r.id}
                                req={r}
                                type="leave"
                                actionLoading={actionLoading}
                                onApprove={handleApprove}
                                onReject={(req) => openReject(req, "leave")}
                            />
                        ))}
                    </Stack>
                </>
            )}

            {/* ── Empty state ── */}
            {!fetchLoading && allRequests.length === 0 && !fetchError && (
                <Paper elevation={0} sx={{
                    p: 5, borderRadius: "16px", textAlign: "center",
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${border}`, mb: 4,
                }}>
                    <Box sx={{
                        width: 52, height: 52, borderRadius: "14px", mx: "auto", mb: 2,
                        bgcolor: `${PRIMARY}10`, border: `1px solid ${PRIMARY}25`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 26, color: PRIMARY }} />
                    </Box>
                    <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: tPri, mb: 0.5 }}>
                        All caught up!
                    </Typography>
                    <Typography sx={{ color: tSec, fontSize: "0.82rem" }}>
                        No pending requests at the moment.
                    </Typography>
                </Paper>
            )}

            {/* ── Processed history ── */}
            {processed.length > 0 && (
                <>
                    <Typography variant="h4" sx={{ color: tPri, mb: 2 }}>Processed</Typography>
                    <Stack spacing={1.5}>
                        {processed.map((r) => (
                            <Paper
                                key={`${r.id}-${r.status}`}
                                elevation={0}
                                sx={{
                                    p: 2, borderRadius: "12px",
                                    bgcolor: theme.palette.background.paper,
                                    border: `1px solid ${border}`,
                                    opacity: 0.8,
                                }}
                            >
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        {/* leave → show student name; team → show project title */}
                                        <Typography sx={{ fontWeight: 600, color: tPri }}>
                                            {r.kind === "leave" ? r.studentName : r.projectTitle}
                                        </Typography>
                                        <Typography sx={{ fontSize: "0.78rem", color: tSec }}>
                                            {r.kind === "leave"
                                                ? `Leave from: ${r.projectTitle}`
                                                : r.leader ? `Leader: ${r.leader}` : ""}
                                        </Typography>
                                        {r.note && (
                                            <Typography sx={{ fontSize: "0.75rem", color: tSec, mt: 0.3 }}>
                                                Note: {r.note}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Chip
                                        label={r.status === "approved" ? "Approved" : "Rejected"}
                                        size="small"
                                        sx={{
                                            bgcolor: r.status === "approved"
                                                ? `${GREEN}18`
                                                : `${RED}18`,
                                            color: r.status === "approved" ? GREEN : RED,
                                            fontWeight: 700, fontSize: "0.72rem", height: 24,
                                            borderRadius: "7px",
                                        }}
                                    />
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                </>
            )}

            {/* ── Reject dialog ── */}
            <Dialog
                open={rejectOpen}
                onClose={() => setRejectOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: "16px",
                        border: `1px solid ${border}`,
                        bgcolor: theme.palette.background.paper,
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, color: RED, pb: 1 }}>
                    Reject Request
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: "0.875rem", color: tSec, mb: 2, lineHeight: 1.65 }}>
                        Rejecting{" "}
                        <strong style={{ color: tPri }}>
                            {rejectType === "leave"
                                ? selected?.studentName
                                : selected?.projectTitle}
                        </strong>
                        {rejectType === "leave" && selected?.projectTitle && (
                            <>
                                {" "}from{" "}
                                <strong style={{ color: tPri }}>{selected.projectTitle}</strong>
                            </>
                        )}
                        . Optionally add a reason:
                    </Typography>
                    <TextField
                        label="Reason (optional)"
                        multiline
                        rows={3}
                        fullWidth
                        size="small"
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "10px",
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PRIMARY },
                            },
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button
                        onClick={() => setRejectOpen(false)}
                        disabled={!!actionLoading}
                        sx={{ color: tSec, textTransform: "none", borderRadius: "10px" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleReject}
                        disabled={!!actionLoading}
                        startIcon={
                            actionLoading?.startsWith("reject")
                                ? <CircularProgress size={14} color="inherit" />
                                : null
                        }
                        sx={{
                            bgcolor: RED,
                            "&:hover": { bgcolor: "#d05050", boxShadow: "none" },
                            textTransform: "none",
                            fontWeight: 700,
                            borderRadius: "10px",
                            boxShadow: "none",
                        }}
                    >
                        Reject
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Snackbar ── */}
            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    severity={snack.severity}
                    variant="filled"
                    onClose={() => setSnack((s) => ({ ...s, open: false }))}
                    sx={{ borderRadius: "10px" }}
                >
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}