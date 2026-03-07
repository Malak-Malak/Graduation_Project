import { useState, useEffect } from "react";
import {
    Box, Typography, Paper, Stack, Button, Chip, Avatar,
    CircularProgress, Alert, Divider, alpha, useTheme,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, IconButton, Tooltip,
} from "@mui/material";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { getPendingRequests, reviewRequest } from "../../../../api/handler/endpoints/adminApi";

const PRIMARY = "#d0895b";

export default function PendingRequests() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Reject dialog
    const [rejectDialog, setRejectDialog] = useState({ open: false, requestId: null });
    const [actionLoading, setActionLoading] = useState(null); // requestId اللي شغال عليه

    // ── Fetch pending requests ─────────────────────────────────────────────────
    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getPendingRequests();
            // الـ API بيرجع array — لو بيرجع شكل ثاني عدليه هون
            setRequests(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
        } catch (err) {
            console.log("Pending requests error:", err.response?.data);
            setError("Failed to load requests. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    // ── Approve ────────────────────────────────────────────────────────────────
    const handleApprove = async (requestId) => {
        setActionLoading(requestId);
        try {
            await reviewRequest(requestId, true);
            // أزيل الطلب من القائمة بعد القبول
            setRequests((prev) => prev.filter((r) => r.id !== requestId && r.requestId !== requestId));
        } catch (err) {
            console.log("Approve error:", err.response?.data);
            setError(err.response?.data?.message || err.response?.data || "Failed to approve request.");
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
            setRequests((prev) => prev.filter((r) => r.id !== requestId && r.requestId !== requestId));
        } catch (err) {
            console.log("Reject error:", err.response?.data);
            setError(err.response?.data?.message || err.response?.data || "Failed to reject request.");
        } finally {
            setActionLoading(null);
        }
    };

    // ── UI ─────────────────────────────────────────────────────────────────────
    return (
        <Box>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>Pending Requests</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Review and approve student access requests
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
                    // ✅ flexible — يتكيف مع أي شكل بيرجعه الـ backend
                    const id = req.id ?? req.requestId;
                    const email = req.universityEmail ?? req.email ?? req.studentEmail;
                    const name = req.fullName ?? req.name ?? req.studentName ?? "—";
                    const date = req.requestDate ?? req.createdAt ?? req.submittedAt;
                    const isProcessing = actionLoading === id;

                    return (
                        <Paper
                            key={id}
                            sx={{
                                p: 3, borderRadius: 3,
                                border: `1px solid ${alpha(PRIMARY, isDark ? 0.2 : 0.12)}`,
                                transition: "all 0.2s ease",
                                "&:hover": { borderColor: alpha(PRIMARY, 0.4), boxShadow: `0 4px 20px ${alpha(PRIMARY, 0.1)}` },
                                opacity: isProcessing ? 0.6 : 1,
                            }}
                        >
                            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2}>

                                {/* Info */}
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ bgcolor: alpha(PRIMARY, 0.15), color: PRIMARY, width: 48, height: 48 }}>
                                        <PersonOutlinedIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>{name}</Typography>
                                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.3 }}>
                                            <EmailOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
                                                {email}
                                            </Typography>
                                        </Stack>
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
                                            {/* ✅ Approve */}
                                            <Button
                                                variant="contained"
                                                startIcon={<CheckCircleOutlineIcon />}
                                                onClick={() => handleApprove(id)}
                                                sx={{
                                                    bgcolor: "#2e7d32", "&:hover": { bgcolor: "#1b5e20" },
                                                    borderRadius: 2, textTransform: "none", fontWeight: 600,
                                                    px: 2.5,
                                                }}
                                            >
                                                Approve
                                            </Button>

                                            {/* ❌ Reject */}
                                            <Button
                                                variant="outlined"
                                                startIcon={<CancelOutlinedIcon />}
                                                onClick={() => setRejectDialog({ open: true, requestId: id })}
                                                sx={{
                                                    borderColor: "#d32f2f", color: "#d32f2f",
                                                    "&:hover": { bgcolor: alpha("#d32f2f", 0.08), borderColor: "#b71c1c" },
                                                    borderRadius: 2, textTransform: "none", fontWeight: 600,
                                                    px: 2.5,
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

            {/* Reject confirmation dialog */}
            <Dialog
                open={rejectDialog.open}
                onClose={() => setRejectDialog({ open: false, requestId: null })}
                PaperProps={{ sx: { borderRadius: 3, p: 1, minWidth: 360 } }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>Reject Request?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        This action will reject the access request. The student will not be able to log in.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setRejectDialog({ open: false, requestId: null })}
                        sx={{ borderRadius: 2, textTransform: "none" }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleReject}
                        sx={{ bgcolor: "#d32f2f", "&:hover": { bgcolor: "#b71c1c" }, borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
                        Yes, Reject
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}