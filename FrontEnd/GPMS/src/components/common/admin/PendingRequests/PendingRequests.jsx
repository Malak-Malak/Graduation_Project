import { useState, useEffect } from "react";
import {
    Box, Typography, Paper, Stack, Button, Chip, Avatar,
    CircularProgress, Alert, alpha, useTheme,
    Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, Tooltip, Radio, RadioGroup,
    FormControlLabel, FormControl, Divider,
} from "@mui/material";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import StarIcon from "@mui/icons-material/Star";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import {
    getPendingRequests,
    reviewRequest,
    setHeadOfDepartment,
    getAllUsers,
} from "../../../../api/handler/endpoints/adminApi";

const PRIMARY = "#d0895b";

/* ─── helper: is this request from a supervisor ─────────────────────────────── */
const isSupervisorRequest = (req) => {
    const role = (req.role ?? req.userRole ?? req.type ?? "").toLowerCase();
    return role === "supervisor";
};

/* ════════════════════════════════════════════════════════════════
   SUPERVISOR APPROVAL POPUP
   Shown when admin tries to approve a supervisor registration.
   Lets admin choose: plain Supervisor OR Head of Department.
════════════════════════════════════════════════════════════════ */
function SupervisorApprovalDialog({ open, request, onCancel, onConfirm, loading }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const brd = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";

    const [choice, setChoice] = useState("supervisor"); // "supervisor" | "head"
    const [existingHead, setExistingHead] = useState(null); // { name, id } if dept already has a head
    const [loadingHead, setLoadingHead] = useState(false);

    const department = request?.department ?? request?.dept ?? null;
    const name = request?.fullName ?? request?.name ?? request?.studentName ?? "—";

    /* When dialog opens, check if dept already has a head */
    useEffect(() => {
        if (!open) { setChoice("supervisor"); setExistingHead(null); return; }
        if (!department) return;

        setLoadingHead(true);
        getAllUsers()
            .then(res => {
                const users = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
                const head = users.find(u =>
                    (u.isHeadOfDepartment === true) &&
                    (u.department ?? "").toLowerCase() === department.toLowerCase()
                );
                setExistingHead(head ? { name: head.fullName ?? head.name ?? "Unknown", id: head.id ?? head.userId } : null);
            })
            .catch(() => setExistingHead(null))
            .finally(() => setLoadingHead(false));
    }, [open, department]);

    const showHeadWarning = choice === "head" && existingHead;

    return (
        <Dialog
            open={open}
            onClose={() => !loading && onCancel()}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "18px",
                    border: `1px solid ${brd}`,
                    bgcolor: theme.palette.background.paper,
                    overflow: "hidden",
                }
            }}
        >
            {/* Accent top bar */}
            <Box sx={{ height: 4, background: `linear-gradient(90deg, ${PRIMARY} 0%, #e8a96e 100%)` }} />

            <DialogTitle sx={{ px: 3, pt: 2.5, pb: 0 }}>
                <Stack direction="row" alignItems="center" gap={1.2}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: "10px",
                        bgcolor: `${PRIMARY}15`, border: `1px solid ${PRIMARY}30`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                        <SchoolOutlinedIcon sx={{ fontSize: 18, color: PRIMARY }} />
                    </Box>
                    <Box>
                        <Typography fontWeight={700} fontSize="0.95rem">Approve Supervisor Request</Typography>
                        <Typography fontSize="0.74rem" color="text.secondary">{name}</Typography>
                    </Box>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ px: 3, pt: 2, pb: 0 }}>
                <Stack spacing={2}>
                    {/* Department chip */}
                    {department && (
                        <Stack direction="row" alignItems="center" gap={0.8}>
                            <InfoOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                            <Typography fontSize="0.78rem" color="text.secondary">
                                Department: <Box component="span" fontWeight={700} sx={{ color: "text.primary" }}>{department}</Box>
                            </Typography>
                        </Stack>
                    )}

                    <Divider sx={{ borderColor: brd }} />

                    {/* Role choice */}
                    <Box>
                        <Typography fontSize="0.78rem" fontWeight={700} color="text.secondary"
                            sx={{ textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.2 }}>
                            Assign Role
                        </Typography>

                        <FormControl fullWidth>
                            <RadioGroup value={choice} onChange={e => setChoice(e.target.value)}>

                                {/* Option A: plain supervisor */}
                                <Paper elevation={0} sx={{
                                    mb: 1, p: 1.5, borderRadius: "12px", cursor: "pointer",
                                    border: `1.5px solid ${choice === "supervisor" ? PRIMARY : brd}`,
                                    bgcolor: choice === "supervisor" ? `${PRIMARY}08` : "transparent",
                                    transition: "all 0.17s",
                                }} onClick={() => setChoice("supervisor")}>
                                    <FormControlLabel
                                        value="supervisor"
                                        control={
                                            <Radio size="small" sx={{
                                                color: brd,
                                                "&.Mui-checked": { color: PRIMARY },
                                                p: 0.5, mr: 1,
                                            }} />
                                        }
                                        label={
                                            <Stack direction="row" alignItems="center" gap={1}>
                                                <PersonOutlinedIcon sx={{ fontSize: 16, color: choice === "supervisor" ? PRIMARY : "text.secondary" }} />
                                                <Box>
                                                    <Typography fontSize="0.84rem" fontWeight={700}>Supervisor</Typography>
                                                    <Typography fontSize="0.7rem" color="text.secondary">
                                                        Standard supervisor — can manage assigned teams
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        }
                                        sx={{ m: 0, width: "100%", alignItems: "flex-start" }}
                                    />
                                </Paper>

                                {/* Option B: head of department */}
                                <Paper elevation={0} sx={{
                                    p: 1.5, borderRadius: "12px", cursor: "pointer",
                                    border: `1.5px solid ${choice === "head" ? PRIMARY : brd}`,
                                    bgcolor: choice === "head" ? `${PRIMARY}08` : "transparent",
                                    transition: "all 0.17s",
                                }} onClick={() => setChoice("head")}>
                                    <FormControlLabel
                                        value="head"
                                        control={
                                            <Radio size="small" sx={{
                                                color: brd,
                                                "&.Mui-checked": { color: PRIMARY },
                                                p: 0.5, mr: 1,
                                            }} />
                                        }
                                        label={
                                            <Stack direction="row" alignItems="center" gap={1}>
                                                {choice === "head"
                                                    ? <StarIcon sx={{ fontSize: 16, color: PRIMARY }} />
                                                    : <StarOutlineIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                                                }
                                                <Box>
                                                    <Stack direction="row" alignItems="center" gap={0.8}>
                                                        <Typography fontSize="0.84rem" fontWeight={700}>Head of Department</Typography>
                                                        <Chip label="Elevated" size="small" sx={{
                                                            height: 16, fontSize: "0.58rem", fontWeight: 700,
                                                            bgcolor: `${PRIMARY}18`, color: PRIMARY, borderRadius: "5px",
                                                        }} />
                                                    </Stack>
                                                    <Typography fontSize="0.7rem" color="text.secondary">
                                                        Can manage slots, student requests & department overview
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        }
                                        sx={{ m: 0, width: "100%", alignItems: "flex-start" }}
                                    />
                                </Paper>
                            </RadioGroup>
                        </FormControl>
                    </Box>

                    {/* Warning: existing head will be replaced */}
                    {loadingHead && (
                        <Stack direction="row" alignItems="center" gap={1}>
                            <CircularProgress size={14} sx={{ color: PRIMARY }} />
                            <Typography fontSize="0.74rem" color="text.secondary">Checking department head…</Typography>
                        </Stack>
                    )}

                    {showHeadWarning && (
                        <Box sx={{
                            p: 1.5, borderRadius: "12px",
                            bgcolor: "rgba(211,47,47,0.07)",
                            border: "1px solid rgba(211,47,47,0.28)",
                        }}>
                            <Stack direction="row" alignItems="flex-start" gap={1}>
                                <WarningAmberOutlinedIcon sx={{ fontSize: 16, color: "#d32f2f", flexShrink: 0, mt: 0.1 }} />
                                <Typography fontSize="0.76rem" sx={{ color: "#d32f2f", lineHeight: 1.6 }}>
                                    <Box component="span" fontWeight={700}>{existingHead.name}</Box> is currently the Head of Department for{" "}
                                    <Box component="span" fontWeight={700}>{department}</Box>.<br />
                                    Proceeding will <Box component="span" fontWeight={700}>remove their Head of Department privileges</Box> and assign them as a regular supervisor.
                                </Typography>
                            </Stack>
                        </Box>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
                <Button
                    onClick={onCancel}
                    disabled={loading}
                    sx={{ borderRadius: "10px", textTransform: "none", color: "text.secondary", fontWeight: 500 }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    disabled={loading || loadingHead}
                    onClick={() => onConfirm(choice, existingHead)}
                    sx={{
                        bgcolor: choice === "head" && showHeadWarning ? "#d32f2f" : "#2e7d32",
                        "&:hover": {
                            bgcolor: choice === "head" && showHeadWarning ? "#b71c1c" : "#1b5e20",
                            boxShadow: "none",
                        },
                        borderRadius: "10px", textTransform: "none", fontWeight: 700,
                        boxShadow: "none", px: 3,
                        transition: "background 0.2s",
                    }}
                >
                    {loading
                        ? <CircularProgress size={16} sx={{ color: "#fff" }} />
                        : showHeadWarning
                            ? "Approve & Replace Head"
                            : choice === "head"
                                ? "Approve as Head of Dept."
                                : "Approve"
                    }
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
export default function PendingRequests() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Reject dialog
    const [rejectDialog, setRejectDialog] = useState({ open: false, requestId: null });

    // Supervisor approval dialog
    const [supDialog, setSupDialog] = useState({ open: false, request: null });

    const [actionLoading, setActionLoading] = useState(null);

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getPendingRequests();
            setRequests(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
        } catch (err) {
            setError("Failed to load requests. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    // ── Approve click — intercept supervisors ──────────────────────────────────
    const handleApproveClick = (req) => {
        if (isSupervisorRequest(req)) {
            setSupDialog({ open: true, request: req });
        } else {
            executeApprove(req.id ?? req.requestId);
        }
    };

    // ── Plain approve (student) ────────────────────────────────────────────────
    const executeApprove = async (requestId) => {
        setActionLoading(requestId);
        try {
            await reviewRequest(requestId, true);
            setRequests(prev => prev.filter(r => (r.id ?? r.requestId) !== requestId));
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || "Failed to approve request.");
        } finally {
            setActionLoading(null);
        }
    };

    // ── Supervisor approval with optional HOD assignment ──────────────────────
    const handleSupConfirm = async (choice, existingHead) => {
        const req = supDialog.request;
        const requestId = req.id ?? req.requestId;
        setActionLoading(requestId);
        setSupDialog({ open: false, request: null });

        try {
            // 1. Approve the registration
            await reviewRequest(requestId, true);

            // 2. If existing head in same dept → remove their HOD flag first
            if (choice === "head" && existingHead?.id) {
                await setHeadOfDepartment(existingHead.id, false);
            }

            // 3. If admin chose head → set HOD flag on the new supervisor
            //    We need the new user's ID — we'll refetch users after approval
            //    and find them by email (most reliable key we have)
            if (choice === "head") {
                const email = req.universityEmail ?? req.email ?? req.studentEmail;
                const usersRes = await getAllUsers();
                const users = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.data ?? [];
                const newSup = users.find(u =>
                    (u.universityEmail ?? u.email ?? "").toLowerCase() === email?.toLowerCase()
                );
                if (newSup) {
                    await setHeadOfDepartment(newSup.id ?? newSup.userId, true);
                }
            }

            setRequests(prev => prev.filter(r => (r.id ?? r.requestId) !== requestId));
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || "Failed to process request.");
        } finally {
            setActionLoading(null);
        }
    };

    // ── Reject ─────────────────────────────────────────────────────────────────
    const handleReject = async () => {
        const { requestId } = rejectDialog;
        setRejectDialog({ open: false, requestId: null });
        setActionLoading(requestId);
        try {
            await reviewRequest(requestId, false);
            setRequests(prev => prev.filter(r => (r.id ?? r.requestId) !== requestId));
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || "Failed to reject request.");
        } finally {
            setActionLoading(null);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <Box>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>Pending Requests</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Review and approve student &amp; supervisor access requests
                    </Typography>
                </Box>
                <Tooltip title="Refresh">
                    <IconButton onClick={fetchRequests} disabled={loading}
                        sx={{ border: `1px solid ${alpha(PRIMARY, 0.3)}`, borderRadius: 2 }}>
                        <RefreshIcon sx={{ color: PRIMARY }} />
                    </IconButton>
                </Tooltip>
            </Stack>

            {/* Error */}
            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Loading */}
            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress sx={{ color: PRIMARY }} />
                </Box>
            )}

            {/* Empty */}
            {!loading && requests.length === 0 && !error && (
                <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3, border: `1px solid ${alpha(PRIMARY, 0.15)}` }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 56, color: alpha(PRIMARY, 0.3), mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No pending requests</Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                        All requests have been reviewed
                    </Typography>
                </Paper>
            )}

            {/* Requests list */}
            <Stack spacing={2}>
                {requests.map((req) => {
                    const id = req.id ?? req.requestId;
                    const email = req.universityEmail ?? req.email ?? req.studentEmail;
                    const name = req.fullName ?? req.name ?? req.studentName ?? "—";
                    const date = req.requestDate ?? req.createdAt ?? req.submittedAt;
                    const dept = req.department ?? req.dept ?? null;
                    const isProcessing = actionLoading === id;
                    const isSup = isSupervisorRequest(req);

                    return (
                        <Paper
                            key={id}
                            sx={{
                                p: 3, borderRadius: 3,
                                border: `1px solid ${alpha(PRIMARY, isDark ? 0.2 : 0.12)}`,
                                transition: "all 0.2s ease",
                                "&:hover": {
                                    borderColor: alpha(PRIMARY, 0.4),
                                    boxShadow: `0 4px 20px ${alpha(PRIMARY, 0.1)}`,
                                },
                                opacity: isProcessing ? 0.6 : 1,
                            }}
                        >
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                justifyContent="space-between"
                                alignItems={{ xs: "flex-start", sm: "center" }}
                                spacing={2}
                            >
                                {/* Info */}
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{
                                        bgcolor: alpha(PRIMARY, 0.15),
                                        color: PRIMARY, width: 48, height: 48,
                                    }}>
                                        {isSup
                                            ? <SchoolOutlinedIcon />
                                            : <PersonOutlinedIcon />
                                        }
                                    </Avatar>
                                    <Box>
                                        <Stack direction="row" alignItems="center" gap={1}>
                                            <Typography variant="subtitle1" fontWeight={600}>{name}</Typography>
                                            {/* Role badge */}
                                            <Chip
                                                label={isSup ? "Supervisor" : "Student"}
                                                size="small"
                                                sx={{
                                                    height: 18, fontSize: "0.62rem", fontWeight: 700,
                                                    bgcolor: isSup ? `${PRIMARY}15` : "rgba(46,125,50,0.12)",
                                                    color: isSup ? PRIMARY : "#2e7d32",
                                                    borderRadius: "6px",
                                                }}
                                            />
                                        </Stack>

                                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.3 }}>
                                            <EmailOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                                            <Typography variant="body2" color="text.secondary"
                                                sx={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
                                                {email}
                                            </Typography>
                                        </Stack>

                                        {dept && (
                                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.3 }}>
                                                <SchoolOutlinedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                                                <Typography variant="caption" color="text.secondary">{dept}</Typography>
                                            </Stack>
                                        )}

                                        {date && (
                                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.3 }}>
                                                <AccessTimeIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                                                <Typography variant="caption" color="text.disabled">
                                                    {new Date(date).toLocaleDateString("en-GB")}
                                                </Typography>
                                            </Stack>
                                        )}
                                    </Box>
                                </Stack>

                                {/* Actions */}
                                <Stack direction="row" spacing={1.5}>
                                    {isProcessing ? (
                                        <CircularProgress size={28} sx={{ color: PRIMARY }} />
                                    ) : (
                                        <>
                                            <Button
                                                variant="contained"
                                                startIcon={<CheckCircleOutlineIcon />}
                                                onClick={() => handleApproveClick(req)}
                                                sx={{
                                                    bgcolor: "#2e7d32",
                                                    "&:hover": { bgcolor: "#1b5e20" },
                                                    borderRadius: 2, textTransform: "none",
                                                    fontWeight: 600, px: 2.5,
                                                }}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<CancelOutlinedIcon />}
                                                onClick={() => setRejectDialog({ open: true, requestId: id })}
                                                sx={{
                                                    borderColor: "#d32f2f", color: "#d32f2f",
                                                    "&:hover": { bgcolor: alpha("#d32f2f", 0.08), borderColor: "#b71c1c" },
                                                    borderRadius: 2, textTransform: "none",
                                                    fontWeight: 600, px: 2.5,
                                                }}
                                            >
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                </Stack>
                            </Stack>
                        </Paper>
                    );
                })}
            </Stack>

            {/* Supervisor approval dialog */}
            <SupervisorApprovalDialog
                open={supDialog.open}
                request={supDialog.request}
                onCancel={() => setSupDialog({ open: false, request: null })}
                onConfirm={handleSupConfirm}
                loading={!!actionLoading}
            />

            {/* Reject confirmation dialog */}
            <Dialog
                open={rejectDialog.open}
                onClose={() => setRejectDialog({ open: false, requestId: null })}
                PaperProps={{ sx: { borderRadius: 3, p: 1, minWidth: 360 } }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>Reject Request?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        This action will reject the access request. The user will not be able to log in.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button
                        onClick={() => setRejectDialog({ open: false, requestId: null })}
                        sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleReject}
                        sx={{
                            bgcolor: "#d32f2f",
                            "&:hover": { bgcolor: "#b71c1c" },
                            borderRadius: 2, textTransform: "none", fontWeight: 600,
                        }}
                    >
                        Yes, Reject
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}