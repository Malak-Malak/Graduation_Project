import { useState } from "react";
import {
    Box, Paper, Typography, Stack, Avatar, Chip, Button, AvatarGroup,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

const INIT = [
    {
        id: 1, team: "DataMinds", project: "ML-Based Course Recommender",
        leader: "Ahmad Khalil", members: ["A", "S", "R", "T"], dept: "CS", submitted: "2 hours ago",
        description: "We aim to build a machine learning system that recommends suitable courses to students based on their academic history and interests.",
    },
    {
        id: 2, team: "WebWizards", project: "University Events Platform",
        leader: "Rania Hamed", members: ["R", "D", "N"], dept: "IT", submitted: "Yesterday",
        description: "A web platform for managing and discovering university events with registration, reminders, and social features.",
    },
    {
        id: 3, team: "SecureNet", project: "Network Intrusion Detection",
        leader: "Sami Nasser", members: ["S", "K", "Y", "F"], dept: "CE", submitted: "3 days ago",
        description: "Using deep learning to detect and classify network intrusion attacks in real-time on university infrastructure.",
    },
];

const DEPT_CLR = { CS: "#B46F4C", IT: "#6D8A7D", CE: "#7E9FC4" };
const MBR_COLORS = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8"];

export default function PendingRequests() {
    const theme = useTheme();
    const t = theme.palette.custom;

    const [requests, setRequests] = useState(INIT);
    const [processed, setProcessed] = useState([]);
    const [selected, setSelected] = useState(null);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectNote, setRejectNote] = useState("");

    const handleApprove = (id) => {
        const req = requests.find((r) => r.id === id);
        setProcessed((p) => [...p, { ...req, status: "approved" }]);
        setRequests((p) => p.filter((r) => r.id !== id));
    };

    const openReject = (req) => { setSelected(req); setRejectNote(""); setRejectOpen(true); };

    const handleReject = () => {
        setProcessed((p) => [...p, { ...selected, status: "rejected", note: rejectNote }]);
        setRequests((p) => p.filter((r) => r.id !== selected.id));
        setRejectOpen(false);
    };

    return (
        <Box sx={{ maxWidth: 860 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>Pending Requests</Typography>
                <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                    {requests.length} awaiting review · {processed.length} processed
                </Typography>
            </Box>

            {/* Pending */}
            {requests.length > 0 ? (
                <Stack spacing={2} sx={{ mb: 4 }}>
                    {requests.map((r) => (
                        <Paper key={r.id} elevation={1} sx={{
                            p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper,
                            borderLeft: `4px solid ${t.accentTertiary}`
                        }}>
                            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "flex-start" }} gap={2}>
                                <Box sx={{ flex: 1 }}>
                                    <Stack direction="row" alignItems="center" gap={1.5} mb={0.5}>
                                        <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: `${t.accentPrimary}15` }}>
                                            <GroupsOutlinedIcon sx={{ fontSize: 18, color: t.accentPrimary }} />
                                        </Box>
                                        <Box>
                                            <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: t.textPrimary }}>{r.team}</Typography>
                                            <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary }}>{r.project}</Typography>
                                        </Box>
                                        <Chip label={r.dept} size="small"
                                            sx={{
                                                bgcolor: `${DEPT_CLR[r.dept] ?? t.accentPrimary}15`, color: DEPT_CLR[r.dept] ?? t.accentPrimary,
                                                fontWeight: 600, fontSize: "0.68rem", height: 22
                                            }} />
                                    </Stack>

                                    <Typography sx={{ fontSize: "0.82rem", color: t.textSecondary, mb: 1.5, lineHeight: 1.6 }}>
                                        {r.description}
                                    </Typography>

                                    <Stack direction="row" alignItems="center" gap={2}>
                                        <Stack direction="row" alignItems="center" gap={1}>
                                            <Typography sx={{ fontSize: "0.78rem", color: t.textTertiary }}>Leader:</Typography>
                                            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: t.textPrimary }}>{r.leader}</Typography>
                                        </Stack>
                                        <AvatarGroup max={5} sx={{ "& .MuiAvatar-root": { width: 24, height: 24, fontSize: "0.62rem", fontWeight: 700 } }}>
                                            {r.members.map((m, j) => <Avatar key={j} sx={{ bgcolor: MBR_COLORS[j % MBR_COLORS.length] }}>{m}</Avatar>)}
                                        </AvatarGroup>
                                        <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>{r.submitted}</Typography>
                                    </Stack>
                                </Box>

                                <Stack direction={{ xs: "row", sm: "column" }} gap={1} sx={{ flexShrink: 0 }}>
                                    <Button variant="contained" startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
                                        onClick={() => handleApprove(r.id)}
                                        sx={{ bgcolor: t.success, fontSize: "0.8rem", fontWeight: 600, "&:hover": { bgcolor: "#5a7a6b" }, whiteSpace: "nowrap" }}>
                                        Approve
                                    </Button>
                                    <Button variant="outlined" startIcon={<CancelOutlinedIcon sx={{ fontSize: 16 }} />}
                                        onClick={() => openReject(r)}
                                        sx={{
                                            borderColor: t.error, color: t.error, fontSize: "0.8rem", fontWeight: 600,
                                            "&:hover": { bgcolor: `${t.error}10`, borderColor: t.error }, whiteSpace: "nowrap"
                                        }}>
                                        Reject
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            ) : (
                <Paper elevation={1} sx={{ p: 4, borderRadius: 3, textAlign: "center", bgcolor: theme.palette.background.paper, mb: 4 }}>
                    <Typography sx={{ color: t.textTertiary }}>No pending requests.</Typography>
                </Paper>
            )}

            {/* Processed */}
            {processed.length > 0 && (
                <>
                    <Typography variant="h4" sx={{ color: t.textPrimary, mb: 2 }}>Processed</Typography>
                    <Stack spacing={1.5}>
                        {processed.map((r) => (
                            <Paper key={r.id} elevation={0} sx={{
                                p: 2, borderRadius: 3, bgcolor: theme.palette.background.paper,
                                border: `1px solid ${t.borderLight}`, opacity: 0.8
                            }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography sx={{ fontWeight: 600, color: t.textPrimary }}>{r.team}</Typography>
                                        <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary }}>{r.project}</Typography>
                                        {r.note && <Typography sx={{ fontSize: "0.75rem", color: t.textTertiary, mt: 0.3 }}>Note: {r.note}</Typography>}
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
                        Rejecting <strong style={{ color: t.textPrimary }}>{selected?.team}</strong>. Optionally add a reason:
                    </Typography>
                    <TextField label="Reason (optional)" multiline rows={3} fullWidth size="small"
                        value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setRejectOpen(false)} sx={{ color: t.textSecondary }}>Cancel</Button>
                    <Button variant="contained" onClick={handleReject} sx={{ bgcolor: t.error }}>Reject</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}