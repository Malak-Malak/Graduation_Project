import { useState, useEffect } from "react";
import {
    Box, Paper, Typography, Stack, Chip, IconButton, Tooltip,
    CircularProgress, Alert, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, InputAdornment, Pagination, alpha,
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Avatar,
    Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { getAllRequests, getUniversityRecordByEmail } from "../../../../api/handler/endpoints/adminApi";

const PRIMARY = "#d0895b";
const PER_PAGE = 10;

const ROLE_CLR = { student: "#B46F4C", supervisor: "#6D8A7D", admin: "#7E9FC4" };

const STATUS_CONFIG = {
    pending: { label: "Pending", color: "#C49A6C", icon: <HourglassEmptyOutlinedIcon sx={{ fontSize: 14 }} /> },
    approved: { label: "Approved", color: "#6D8A7D", icon: <CheckCircleOutlineIcon sx={{ fontSize: 14 }} /> },
    rejected: { label: "Rejected", color: "#C47E7E", icon: <CancelOutlinedIcon sx={{ fontSize: 14 }} /> },
};

const getStatus = (req) => {
    const s = (req.status ?? req.requestStatus ?? "pending").toLowerCase();
    if (s.includes("approv")) return "approved";
    if (s.includes("reject")) return "rejected";
    return "pending";
};

// ── Profile Dialog ────────────────────────────────────────────────────────────
function ProfileDialog({ open, email, onClose }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!open || !email) return;
        setData(null);
        setError(null);
        setLoading(true);

        getUniversityRecordByEmail(email)
            .then((res) => setData(res.data))
            .catch((err) => {
                console.log("Profile error:", err.response?.data);
                setError("Could not load profile information.");
            })
            .finally(() => setLoading(false));
    }, [open, email]);

    const role = (data?.role ?? "").toLowerCase();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(PRIMARY, 0.12) }}>
                        <PersonOutlinedIcon sx={{ color: PRIMARY, fontSize: 22, display: "block" }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>University Record</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                            {email}
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>
            <Divider />

            <DialogContent>
                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress sx={{ color: PRIMARY }} />
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
                )}

                {data && !loading && (
                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        {/* Avatar + Name */}
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ width: 56, height: 56, bgcolor: ROLE_CLR[role] ?? PRIMARY, fontSize: "1.3rem", fontWeight: 700 }}>
                                {(data.fullName ?? data.name ?? "?").charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight={700}>
                                    {data.fullName ?? data.name ?? "—"}
                                </Typography>
                                <Chip
                                    label={data.role ?? "—"}
                                    size="small"
                                    sx={{ bgcolor: alpha(ROLE_CLR[role] ?? PRIMARY, 0.15), color: ROLE_CLR[role] ?? PRIMARY, fontWeight: 600, fontSize: "0.7rem", textTransform: "capitalize", mt: 0.5 }}
                                />
                            </Box>
                        </Stack>

                        <Divider />

                        {/* Info rows */}
                        {[
                            { icon: <EmailOutlinedIcon />, label: "Email", value: data.universityEmail ?? data.email },
                            { icon: <BadgeOutlinedIcon />, label: "Username", value: data.username },
                            { icon: <BusinessOutlinedIcon />, label: "Department", value: data.department ?? data.dept },
                            { icon: <SchoolOutlinedIcon />, label: "Graduate", value: data.isGraduate ? "Yes" : "No" },
                        ].map(({ icon, label, value }) => value ? (
                            <Stack key={label} direction="row" alignItems="center" spacing={1.5}>
                                <Box sx={{ color: PRIMARY, "& svg": { fontSize: 18 } }}>{icon}</Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontSize: "0.68rem", letterSpacing: "0.05em" }}>
                                        {label}
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {value}
                                    </Typography>
                                </Box>
                            </Stack>
                        ) : null)}
                    </Stack>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} sx={{ borderRadius: 2, textTransform: "none" }}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AllRequests() {
    const theme = useTheme();
    const t = theme.palette.custom;

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);

    // Profile dialog
    const [profileOpen, setProfileOpen] = useState(false);
    const [profileEmail, setProfileEmail] = useState(null);

    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAllRequests();
            setRequests(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
        } catch (err) {
            console.log("All requests error:", err.response?.data);
            setError("Failed to load requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const filtered = requests.filter((r) => {
        const email = (r.universityEmail ?? r.email ?? "").toLowerCase();
        const name = (r.fullName ?? r.name ?? "").toLowerCase();
        const q = search.toLowerCase();
        const s = getStatus(r);
        return (
            (email.includes(q) || name.includes(q)) &&
            (statusFilter === "all" || s === statusFilter)
        );
    });

    const pageCount = Math.ceil(filtered.length / PER_PAGE);
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const counts = { all: requests.length, pending: 0, approved: 0, rejected: 0 };
    requests.forEach((r) => { counts[getStatus(r)]++; });

    const openProfile = (email) => {
        setProfileEmail(email);
        setProfileOpen(true);
    };

    return (
        <Box sx={{ maxWidth: 1100 }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>All Requests</Typography>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                        {counts.all} total · {counts.pending} pending · {counts.approved} approved · {counts.rejected} rejected
                    </Typography>
                </Box>
                <Tooltip title="Refresh">
                    <IconButton onClick={fetchRequests} disabled={loading}
                        sx={{ border: `1px solid ${alpha(PRIMARY, 0.3)}`, borderRadius: 2 }}>
                        <RefreshIcon sx={{ color: PRIMARY }} />
                    </IconButton>
                </Tooltip>
            </Stack>

            {/* Status chips */}
            <Stack direction="row" spacing={1} sx={{ mb: 2.5 }} flexWrap="wrap">
                {Object.entries({ all: "All", pending: "Pending", approved: "Approved", rejected: "Rejected" }).map(([key, label]) => (
                    <Chip key={key} label={`${label} (${counts[key]})`}
                        onClick={() => { setStatusFilter(key); setPage(1); }}
                        variant={statusFilter === key ? "filled" : "outlined"}
                        sx={{
                            fontWeight: 600, fontSize: "0.8rem", cursor: "pointer",
                            ...(statusFilter === key
                                ? { bgcolor: PRIMARY, color: "#fff", borderColor: PRIMARY }
                                : { color: t.textSecondary, borderColor: t.borderLight }),
                        }}
                    />
                ))}
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}

            <Paper elevation={1} sx={{ borderRadius: 3, overflow: "hidden", bgcolor: theme.palette.background.paper }}>
                <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${t.borderLight}` }}>
                    <TextField placeholder="Search by email or name…" size="small" sx={{ width: 280 }}
                        value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: t.textTertiary }} /></InputAdornment> }}
                    />
                </Box>

                <TableContainer>
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                            <CircularProgress sx={{ color: PRIMARY }} />
                        </Box>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {["#", "Email", "Name", "Date", "Status", "Profile"].map((h) => (
                                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: t.textTertiary }}>
                                            {h}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginated.map((req, idx) => {
                                    const id = req.id ?? req.requestId;
                                    const email = req.universityEmail ?? req.email ?? "—";
                                    const name = req.fullName ?? req.name ?? "—";
                                    const date = req.requestDate ?? req.createdAt ?? req.submittedAt;
                                    const status = getStatus(req);
                                    const cfg = STATUS_CONFIG[status];

                                    return (
                                        <TableRow key={id ?? idx} sx={{ "&:hover": { bgcolor: alpha(PRIMARY, 0.03) } }}>
                                            <TableCell sx={{ color: t.textTertiary, fontSize: "0.8rem", width: 50 }}>
                                                {(page - 1) * PER_PAGE + idx + 1}
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <EmailOutlinedIcon sx={{ fontSize: 15, color: t.textTertiary }} />
                                                    <Typography sx={{ fontSize: "0.85rem", fontFamily: "monospace", color: t.textPrimary }}>
                                                        {email}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{ fontSize: "0.875rem", color: t.textSecondary }}>{name}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                {date ? (
                                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                                        <AccessTimeIcon sx={{ fontSize: 13, color: t.textTertiary }} />
                                                        <Typography sx={{ fontSize: "0.8rem", color: t.textTertiary }}>
                                                            {new Date(date).toLocaleDateString("en-GB")}
                                                        </Typography>
                                                    </Stack>
                                                ) : "—"}
                                            </TableCell>
                                            <TableCell>
                                                <Chip icon={cfg.icon} label={cfg.label} size="small"
                                                    sx={{ bgcolor: alpha(cfg.color, 0.12), color: cfg.color, fontWeight: 600, fontSize: "0.72rem", height: 24, "& .MuiChip-icon": { color: cfg.color } }}
                                                />
                                            </TableCell>
                                            {/* ✅ Profile button */}
                                            <TableCell>
                                                <Tooltip title="View university record">
                                                    <IconButton size="small" onClick={() => openProfile(email)}
                                                        sx={{
                                                            color: PRIMARY, border: `1px solid ${alpha(PRIMARY, 0.3)}`, borderRadius: 1.5,
                                                            "&:hover": { bgcolor: alpha(PRIMARY, 0.08) }
                                                        }}>
                                                        <OpenInNewIcon sx={{ fontSize: 15 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {paginated.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} sx={{ textAlign: "center", py: 6, color: t.textTertiary }}>
                                            No requests found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>

                {pageCount > 1 && (
                    <Stack alignItems="center" sx={{ py: 2, borderTop: `1px solid ${t.borderLight}` }}>
                        <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)}
                            sx={{ "& .MuiPaginationItem-root.Mui-selected": { bgcolor: PRIMARY, color: "#fff" } }} />
                    </Stack>
                )}
            </Paper>

            {/* Profile Dialog */}
            <ProfileDialog
                open={profileOpen}
                email={profileEmail}
                onClose={() => setProfileOpen(false)}
            />
        </Box>
    );
}