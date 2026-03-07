import { useState, useEffect } from "react";
import {
    Box, Paper, Typography, Stack, Chip, Avatar, IconButton, Tooltip,
    CircularProgress, Alert, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, InputAdornment, FormControl,
    InputLabel, Select, MenuItem, Pagination, alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";

import { getAllRequests } from "../../../../api/handler/endpoints/adminApi";

const PRIMARY = "#d0895b";
const PER_PAGE = 10;

const STATUS_CONFIG = {
    pending: { label: "Pending", color: "#C49A6C", icon: <HourglassEmptyOutlinedIcon sx={{ fontSize: 14 }} /> },
    approved: { label: "Approved", color: "#6D8A7D", icon: <CheckCircleOutlineIcon sx={{ fontSize: 14 }} /> },
    rejected: { label: "Rejected", color: "#C47E7E", icon: <CancelOutlinedIcon sx={{ fontSize: 14 }} /> },
};

const getStatus = (req) => {
    // flexible — يتكيف مع أي شكل بيرجعه الـ backend
    const s = (req.status ?? req.requestStatus ?? "pending").toLowerCase();
    if (s.includes("approv")) return "approved";
    if (s.includes("reject")) return "rejected";
    return "pending";
};

export default function AllRequests() {
    const theme = useTheme();
    const t = theme.palette.custom;

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);

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

    // ── Filter ───────────────────────────────────────────────────────────────
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

    // ── counts ───────────────────────────────────────────────────────────────
    const counts = { all: requests.length, pending: 0, approved: 0, rejected: 0 };
    requests.forEach((r) => { counts[getStatus(r)]++; });

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

            {/* Quick filter chips */}
            <Stack direction="row" spacing={1} sx={{ mb: 2.5 }} flexWrap="wrap">
                {Object.entries({ all: "All", pending: "Pending", approved: "Approved", rejected: "Rejected" }).map(([key, label]) => (
                    <Chip
                        key={key}
                        label={`${label} (${counts[key]})`}
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
                {/* Search */}
                <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${t.borderLight}` }}>
                    <TextField
                        placeholder="Search by email or name…" size="small" sx={{ width: 280 }}
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
                                    {["#", "Email", "Name", "Date", "Status"].map((h) => (
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
                                                <Typography sx={{ fontSize: "0.875rem", color: t.textSecondary }}>
                                                    {name}
                                                </Typography>
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
                                                <Chip
                                                    icon={cfg.icon}
                                                    label={cfg.label}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: alpha(cfg.color, 0.12),
                                                        color: cfg.color,
                                                        fontWeight: 600,
                                                        fontSize: "0.72rem",
                                                        height: 24,
                                                        "& .MuiChip-icon": { color: cfg.color },
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {paginated.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: "center", py: 6, color: t.textTertiary }}>
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
        </Box>
    );
}