// src/components/common/supervisor/Pendingrequests/Pendingrequests.jsx
//
// Supervisor "Pending Requests" page.
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
    CircularProgress, Alert, Snackbar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import {
    getPendingTeamRequests,
    getPendingLeaveRequests,
    respondToTeamRequest,
    respondToLeaveRequest,
} from "../../../../api/handler/endpoints/supervisorApi";

const DEPT_CLR = { CS: "#B46F4C", IT: "#6D8A7D", CE: "#7E9FC4" };
const MBR_COLORS = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8"];

// ─── normalisers ─────────────────────────────────────────────────────────────

// Map a single backend team-request object to the shape the UI expects
const mapTeamReq = (r) => ({
    id: r.teamId ?? r.id,
    teamId: r.teamId ?? r.id,
    team: r.teamName ?? r.team ?? `Team #${r.teamId ?? r.id}`,
    project: r.projectTitle ?? r.project ?? "N/A",
    leader: r.leaderName ?? r.leader ?? "—",
    members: r.members ?? r.memberInitials ?? [],
    dept: r.department ?? r.dept ?? "",
    submitted: r.requestedAt
        ? new Date(r.requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : r.submitted ?? "",
    description: r.description ?? "",
});

// Map a single backend leave-request object to the shape the UI expects
const mapLeaveReq = (r) => ({
    id: r.teamMemberId ?? r.id,
    teamMemberId: r.teamMemberId ?? r.id,
    team: r.teamName ?? r.team ?? "—",
    studentName: r.studentName ?? r.memberName ?? `Member #${r.teamMemberId ?? r.id}`,
    submitted: r.requestedAt
        ? new Date(r.requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : r.submitted ?? "",
    description: r.reason ?? r.description ?? "",
});

export default function PendingRequests() {
    const theme = useTheme();
    const t = theme.palette.custom;

    // ── state ──────────────────────────────────────────────────────────────────
    const [teamRequests, setTeamRequests] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [processed, setProcessed] = useState([]);

    const [fetchLoading, setFetchLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    // "approve-<id>" | "reject-<id>" | null
    const [actionLoading, setActionLoading] = useState(null);

    // reject dialog
    const [selected, setSelected] = useState(null);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectNote, setRejectNote] = useState("");
    const [rejectType, setRejectType] = useState("team"); // "team" | "leave"

    // snackbar
    const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

    // ── fetch ──────────────────────────────────────────────────────────────────
    // Fetches team join requests and leave requests in parallel.
    // getPendingLeaveRequests() falls back to [] until the backend is ready,
    // so this will never throw even if that endpoint is missing.
    const fetchRequests = useCallback(async () => {
        setFetchLoading(true);
        setFetchError(null);
        try {
            const [teamData, leaveData] = await Promise.all([
                getPendingTeamRequests(),
                getPendingLeaveRequests(), // ⚠ returns [] until backend ships
            ]);

            // teamData may be a plain array — normalise either way
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

    // ── approve request ────────────────────────────────────────────────────────
    // Routes to the correct endpoint based on type:
    //   "team"  → POST /api/Supervisor/respond-to-team-request
    //   "leave" → POST /api/Supervisor/respond-to-leave-request
    const handleApprove = async (req, type) => {
        const key = `approve-${req.id}`;
        setActionLoading(key);
        try {
            if (type === "team") {
                await respondToTeamRequest({ teamId: req.teamId, isApproved: true });
                setTeamRequests((p) => p.filter((r) => r.id !== req.id));
            } else {
                await respondToLeaveRequest({ teamMemberId: req.teamMemberId, isApproved: true });
                setLeaveRequests((p) => p.filter((r) => r.id !== req.id));
            }
            setProcessed((p) => [...p, { ...req, status: "approved", kind: type }]);
            setSnack({ open: true, msg: "Request approved successfully.", severity: "success" });
        } catch (err) {
            setSnack({ open: true, msg: err?.response?.data?.message || "Approval failed.", severity: "error" });
        } finally {
            setActionLoading(null);
        }
    };

    // ── open reject dialog ─────────────────────────────────────────────────────
    const openReject = (req, type) => {
        setSelected(req);
        setRejectType(type);
        setRejectNote("");
        setRejectOpen(true);
    };

    // ── confirm reject ─────────────────────────────────────────────────────────
    // Routes to the correct endpoint based on rejectType, same as handleApprove.
    const handleReject = async () => {
        const key = `reject-${selected.id}`;
        setActionLoading(key);
        try {
            if (rejectType === "team") {
                await respondToTeamRequest({ teamId: selected.teamId, isApproved: false });
                setTeamRequests((p) => p.filter((r) => r.id !== selected.id));
            } else {
                await respondToLeaveRequest({ teamMemberId: selected.teamMemberId, isApproved: false });
                setLeaveRequests((p) => p.filter((r) => r.id !== selected.id));
            }
            setProcessed((p) => [...p, { ...selected, status: "rejected", note: rejectNote, kind: rejectType }]);
            setSnack({ open: true, msg: "Request rejected.", severity: "info" });
        } catch (err) {
            setSnack({ open: true, msg: err?.response?.data?.message || "Rejection failed.", severity: "error" });
        } finally {
            setActionLoading(null);
            setRejectOpen(false);
        }
    };

    // ── shared request card ────────────────────────────────────────────────────
    const RequestCard = ({ req, type }) => {
        const isLoading = (k) => actionLoading === k;
        const label = type === "team" ? req.team : req.studentName;
        const sub = type === "team" ? req.project : `Leave from: ${req.team}`;

        return (
            <Paper key={req.id} elevation={1} sx={{
                p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper,
                borderLeft: `4px solid ${t.accentTertiary}`,
            }}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between"
                    alignItems={{ sm: "flex-start" }} gap={2}>
                    <Box sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" gap={1.5} mb={0.5}>
                            <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: `${t.accentPrimary}15` }}>
                                <GroupsOutlinedIcon sx={{ fontSize: 18, color: t.accentPrimary }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: t.textPrimary }}>{label}</Typography>
                                <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary }}>{sub}</Typography>
                            </Box>
                            {req.dept && (
                                <Chip label={req.dept} size="small" sx={{
                                    bgcolor: `${DEPT_CLR[req.dept] ?? t.accentPrimary}15`,
                                    color: DEPT_CLR[req.dept] ?? t.accentPrimary,
                                    fontWeight: 600, fontSize: "0.68rem", height: 22,
                                }} />
                            )}
                        </Stack>

                        {req.description && (
                            <Typography sx={{ fontSize: "0.82rem", color: t.textSecondary, mb: 1.5, lineHeight: 1.6 }}>
                                {req.description}
                            </Typography>
                        )}

                        <Stack direction="row" alignItems="center" gap={2}>
                            {req.leader && (
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <Typography sx={{ fontSize: "0.78rem", color: t.textTertiary }}>Leader:</Typography>
                                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: t.textPrimary }}>{req.leader}</Typography>
                                </Stack>
                            )}
                            {req.members?.length > 0 && (
                                <AvatarGroup max={5} sx={{ "& .MuiAvatar-root": { width: 24, height: 24, fontSize: "0.62rem", fontWeight: 700 } }}>
                                    {req.members.map((m, j) => (
                                        <Avatar key={j} sx={{ bgcolor: MBR_COLORS[j % MBR_COLORS.length] }}>
                                            {typeof m === "string" ? m[0] : m}
                                        </Avatar>
                                    ))}
                                </AvatarGroup>
                            )}
                            <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>{req.submitted}</Typography>
                        </Stack>
                    </Box>

                    <Stack direction={{ xs: "row", sm: "column" }} gap={1} sx={{ flexShrink: 0 }}>
                        <Button
                            variant="contained"
                            startIcon={
                                isLoading(`approve-${req.id}`)
                                    ? <CircularProgress size={14} color="inherit" />
                                    : <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
                            }
                            disabled={!!actionLoading}
                            onClick={() => handleApprove(req, type)}
                            sx={{ bgcolor: t.success, fontSize: "0.8rem", fontWeight: 600, "&:hover": { bgcolor: "#5a7a6b" }, whiteSpace: "nowrap" }}
                        >
                            Approve
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={
                                isLoading(`reject-${req.id}`)
                                    ? <CircularProgress size={14} color="inherit" />
                                    : <CancelOutlinedIcon sx={{ fontSize: 16 }} />
                            }
                            disabled={!!actionLoading}
                            onClick={() => openReject(req, type)}
                            sx={{
                                borderColor: t.error, color: t.error, fontSize: "0.8rem", fontWeight: 600,
                                "&:hover": { bgcolor: `${t.error}10`, borderColor: t.error }, whiteSpace: "nowrap",
                            }}
                        >
                            Reject
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        );
    };

    const allRequests = [...teamRequests, ...leaveRequests];

    // ── render ─────────────────────────────────────────────────────────────────
    return (
        <Box sx={{ maxWidth: 860 }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                <Box>
                    <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>Pending Requests</Typography>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                        {allRequests.length} awaiting review · {processed.length} processed
                    </Typography>
                </Box>
                <Button
                    size="small" startIcon={fetchLoading ? <CircularProgress size={14} /> : <RefreshOutlinedIcon />}
                    onClick={fetchRequests} disabled={fetchLoading}
                    sx={{ color: t.textSecondary, fontSize: "0.8rem" }}
                >
                    Refresh
                </Button>
            </Stack>

            {/* Fetch error */}
            {fetchError && <Alert severity="error" sx={{ mb: 2 }}>{fetchError}</Alert>}

            {/* Loading skeleton */}
            {fetchLoading && (
                <Box textAlign="center" py={6}><CircularProgress /></Box>
            )}

            {/* Team join requests */}
            {!fetchLoading && teamRequests.length > 0 && (
                <>
                    <Typography variant="h5" sx={{
                        color: t.textSecondary, fontSize: "0.78rem", fontWeight: 600,
                        mb: 1, textTransform: "uppercase", letterSpacing: 1,
                    }}>
                        Team Join Requests
                    </Typography>
                    <Stack spacing={2} sx={{ mb: 3 }}>
                        {teamRequests.map((r) => <RequestCard key={r.id} req={r} type="team" />)}
                    </Stack>
                </>
            )}

            {/* Leave requests — shown when backend returns data */}
            {!fetchLoading && leaveRequests.length > 0 && (
                <>
                    <Typography variant="h5" sx={{
                        color: t.textSecondary, fontSize: "0.78rem", fontWeight: 600,
                        mb: 1, textTransform: "uppercase", letterSpacing: 1,
                    }}>
                        Leave Requests
                    </Typography>
                    <Stack spacing={2} sx={{ mb: 3 }}>
                        {leaveRequests.map((r) => <RequestCard key={r.id} req={r} type="leave" />)}
                    </Stack>
                </>
            )}

            {/* Empty state */}
            {!fetchLoading && allRequests.length === 0 && !fetchError && (
                <Paper elevation={1} sx={{
                    p: 4, borderRadius: 3, textAlign: "center",
                    bgcolor: theme.palette.background.paper, mb: 4,
                }}>
                    <Typography sx={{ color: t.textTertiary }}>No pending requests.</Typography>
                </Paper>
            )}

            {/* Processed history */}
            {processed.length > 0 && (
                <>
                    <Typography variant="h4" sx={{ color: t.textPrimary, mb: 2 }}>Processed</Typography>
                    <Stack spacing={1.5}>
                        {processed.map((r) => (
                            <Paper key={`${r.id}-${r.status}`} elevation={0} sx={{
                                p: 2, borderRadius: 3, bgcolor: theme.palette.background.paper,
                                border: `1px solid ${t.borderLight}`, opacity: 0.8,
                            }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography sx={{ fontWeight: 600, color: t.textPrimary }}>
                                            {r.team ?? r.studentName}
                                        </Typography>
                                        <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary }}>
                                            {r.project ?? `Leave from: ${r.team}`}
                                        </Typography>
                                        {r.note && (
                                            <Typography sx={{ fontSize: "0.75rem", color: t.textTertiary, mt: 0.3 }}>
                                                Note: {r.note}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Chip
                                        label={r.status === "approved" ? "Approved" : "Rejected"}
                                        size="small"
                                        sx={{
                                            bgcolor: r.status === "approved" ? `${t.success}18` : `${t.error}18`,
                                            color: r.status === "approved" ? t.success : t.error,
                                            fontWeight: 700, fontSize: "0.72rem", height: 24,
                                        }}
                                    />
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                </>
            )}

            {/* Reject dialog */}
            <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, color: t.error }}>Reject Request</DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: "0.875rem", color: t.textSecondary, mb: 2 }}>
                        Rejecting <strong style={{ color: t.textPrimary }}>{selected?.team ?? selected?.studentName}</strong>. Optionally add a reason:
                    </Typography>
                    <TextField
                        label="Reason (optional)" multiline rows={3} fullWidth size="small"
                        value={rejectNote} onChange={(e) => setRejectNote(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setRejectOpen(false)} sx={{ color: t.textSecondary }} disabled={!!actionLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained" onClick={handleReject}
                        disabled={!!actionLoading}
                        startIcon={actionLoading?.startsWith("reject") && <CircularProgress size={14} color="inherit" />}
                        sx={{ bgcolor: t.error }}
                    >
                        Reject
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snack.open} autoHideDuration={4000}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity={snack.severity} variant="filled"
                    onClose={() => setSnack((s) => ({ ...s, open: false }))}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}