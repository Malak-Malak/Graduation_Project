import { useState, useEffect, useMemo } from "react";
import {
    Box, Paper, Typography, Stack, Chip, IconButton, Tooltip,
    CircularProgress, Alert, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, InputAdornment, Pagination, alpha,
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Avatar,
    Divider, Switch,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";

import { getAllUsers, setHeadOfDepartment } from "../../../../api/handler/endpoints/adminApi";

const PRIMARY = "#d0895b";
const HOD_COLOR = "#6D8A7D";
const PER_PAGE = 10;

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmHodDialog({ open, supervisor, makingHod, existingHead, onCancel, onConfirm, loading }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const brd = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";

    const name = supervisor?.fullName ?? supervisor?.name ?? supervisor?.username ?? "—";
    const dept = supervisor?.department ?? supervisor?.dept ?? "—";
    const willReplace = makingHod && existingHead;

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
                    overflow: "hidden",
                }
            }}
        >
            {/* Accent bar */}
            <Box sx={{
                height: 4,
                background: willReplace
                    ? "linear-gradient(90deg, #d32f2f 0%, #e57373 100%)"
                    : makingHod
                        ? `linear-gradient(90deg, ${HOD_COLOR} 0%, #8fada6 100%)`
                        : `linear-gradient(90deg, ${PRIMARY} 0%, #e8a96e 100%)`,
            }} />

            <DialogTitle sx={{ px: 3, pt: 2.5, pb: 0 }}>
                <Stack direction="row" alignItems="center" gap={1.2}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: "10px",
                        bgcolor: alpha(willReplace ? "#d32f2f" : makingHod ? HOD_COLOR : PRIMARY, 0.12),
                        border: `1px solid ${alpha(willReplace ? "#d32f2f" : makingHod ? HOD_COLOR : PRIMARY, 0.25)}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        {makingHod
                            ? <StarIcon sx={{ fontSize: 18, color: willReplace ? "#d32f2f" : HOD_COLOR }} />
                            : <StarOutlineIcon sx={{ fontSize: 18, color: PRIMARY }} />
                        }
                    </Box>
                    <Box>
                        <Typography fontWeight={700} fontSize="0.95rem">
                            {makingHod ? "Set Head of Department" : "Remove Head of Department"}
                        </Typography>
                        <Typography fontSize="0.74rem" color="text.secondary">{name}</Typography>
                    </Box>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ px: 3, pt: 2, pb: 0 }}>
                <Stack spacing={2}>
                    {/* Dept info */}
                    <Stack direction="row" alignItems="center" gap={0.8}>
                        <BusinessOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                        <Typography fontSize="0.78rem" color="text.secondary">
                            Department:{" "}
                            <Box component="span" fontWeight={700} sx={{ color: "text.primary" }}>{dept}</Box>
                        </Typography>
                    </Stack>

                    <Divider sx={{ borderColor: brd }} />

                    {/* Message */}
                    {makingHod ? (
                        <Typography fontSize="0.82rem" color="text.secondary" lineHeight={1.7}>
                            {willReplace
                                ? <>
                                    <Box component="span" fontWeight={700} sx={{ color: "text.primary" }}>{name}</Box>
                                    {" "}will be assigned as Head of Department for{" "}
                                    <Box component="span" fontWeight={700} sx={{ color: "text.primary" }}>{dept}</Box>.
                                </>
                                : <>
                                    <Box component="span" fontWeight={700} sx={{ color: "text.primary" }}>{name}</Box>
                                    {" "}will be assigned as Head of Department for{" "}
                                    <Box component="span" fontWeight={700} sx={{ color: "text.primary" }}>{dept}</Box>.
                                </>
                            }
                        </Typography>
                    ) : (
                        <Typography fontSize="0.82rem" color="text.secondary" lineHeight={1.7}>
                            <Box component="span" fontWeight={700} sx={{ color: "text.primary" }}>{name}</Box>
                            {" "}will be demoted to a regular supervisor.
                            Their Head of Department privileges will be removed.
                        </Typography>
                    )}

                    {/* Warning: existing head */}
                    {willReplace && (
                        <Box sx={{
                            p: 1.5, borderRadius: "12px",
                            bgcolor: "rgba(211,47,47,0.07)",
                            border: "1px solid rgba(211,47,47,0.28)",
                        }}>
                            <Stack direction="row" alignItems="flex-start" gap={1}>
                                <WarningAmberOutlinedIcon sx={{ fontSize: 16, color: "#d32f2f", flexShrink: 0, mt: 0.1 }} />
                                <Typography fontSize="0.76rem" sx={{ color: "#d32f2f", lineHeight: 1.6 }}>
                                    <Box component="span" fontWeight={700}>{existingHead.fullName ?? existingHead.name ?? existingHead.username ?? "Current Head"}</Box>
                                    {" "}is currently the Head of Department for{" "}
                                    <Box component="span" fontWeight={700}>{dept}</Box>.<br />
                                    They will be reverted to a regular supervisor.
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
                    disabled={loading}
                    onClick={onConfirm}
                    sx={{
                        bgcolor: willReplace ? "#d32f2f" : makingHod ? HOD_COLOR : PRIMARY,
                        "&:hover": {
                            bgcolor: willReplace ? "#b71c1c" : makingHod ? "#557a72" : "#b8784e",
                            boxShadow: "none",
                        },
                        borderRadius: "10px", textTransform: "none",
                        fontWeight: 700, boxShadow: "none", px: 3,
                    }}
                >
                    {loading
                        ? <CircularProgress size={16} sx={{ color: "#fff" }} />
                        : willReplace
                            ? "Confirm & Replace"
                            : makingHod
                                ? "Set as Head"
                                : "Remove Role"
                    }
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ManageSupervisors() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const t = theme.palette.custom ?? {};
    const brd = t.borderLight ?? theme.palette.divider;
    const tPri = t.textPrimary ?? theme.palette.text.primary;
    const tSec = t.textSecondary ?? theme.palette.text.secondary;
    const tTer = t.textTertiary ?? theme.palette.text.disabled;

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [filterHod, setFilterHod] = useState("all"); // "all" | "hod" | "supervisor"
    const [page, setPage] = useState(1);
    const [actionLoading, setActionLoading] = useState(null);

    // Confirm dialog state
    const [dialog, setDialog] = useState({
        open: false,
        supervisor: null,
        makingHod: false,
        existingHead: null,
    });

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAllUsers();
            const all = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
            // Only supervisors (approved)
            const supervisors = all.filter(u => {
                const role = (u.role ?? u.userRole ?? "").toLowerCase();
                return role === "supervisor";
            });
            setUsers(supervisors);
        } catch {
            setError("Failed to load supervisors. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // ── Filtered + paginated ───────────────────────────────────────────────────
    const filtered = useMemo(() => {
        return users.filter(u => {
            const name = (u.fullName ?? u.name ?? u.username ?? "").toLowerCase();
            const email = (u.universityEmail ?? u.email ?? "").toLowerCase();
            const dept = (u.department ?? u.dept ?? "").toLowerCase();
            const q = search.toLowerCase();
            const isHod = u.isHeadOfDepartment === true;

            const matchesSearch = name.includes(q) || email.includes(q) || dept.includes(q);
            const matchesFilter =
                filterHod === "all" ||
                (filterHod === "hod" && isHod) ||
                (filterHod === "supervisor" && !isHod);

            return matchesSearch && matchesFilter;
        });
    }, [users, search, filterHod]);

    const pageCount = Math.ceil(filtered.length / PER_PAGE);
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const counts = {
        all: users.length,
        hod: users.filter(u => u.isHeadOfDepartment === true).length,
        supervisor: users.filter(u => !u.isHeadOfDepartment).length,
    };

    // ── Toggle HoD click ───────────────────────────────────────────────────────
    const handleToggleClick = (supervisor) => {
        const makingHod = !supervisor.isHeadOfDepartment;
        const dept = (supervisor.department ?? supervisor.dept ?? "").toLowerCase();

        // Check if another supervisor in same dept is already HoD
        const existingHead = makingHod
            ? users.find(u =>
                u.isHeadOfDepartment === true &&
                (u.department ?? u.dept ?? "").toLowerCase() === dept &&
                (u.id ?? u.userId) !== (supervisor.id ?? supervisor.userId)
            )
            : null;

        setDialog({ open: true, supervisor, makingHod, existingHead: existingHead ?? null });
    };

    // ── Confirm action ─────────────────────────────────────────────────────────
    const handleConfirm = async () => {
        const { supervisor, makingHod, existingHead } = dialog;
        const supId = supervisor.id ?? supervisor.userId;
        setDialog(d => ({ ...d, open: false }));
        setActionLoading(supId);

        try {
            // If replacing existing HoD, remove them first
            if (makingHod && existingHead) {
                const existId = existingHead.id ?? existingHead.userId;
                await setHeadOfDepartment(existId, false);
                setUsers(prev => prev.map(u =>
                    (u.id ?? u.userId) === existId
                        ? { ...u, isHeadOfDepartment: false }
                        : u
                ));
            }

            // Set / unset the selected supervisor
            await setHeadOfDepartment(supId, makingHod);
            setUsers(prev => prev.map(u =>
                (u.id ?? u.userId) === supId
                    ? { ...u, isHeadOfDepartment: makingHod }
                    : u
            ));
        } catch (err) {
            setError(err.response?.data?.message ?? err.response?.data ?? "Failed to update role.");
        } finally {
            setActionLoading(null);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <Box sx={{ maxWidth: 1100 }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} sx={{ color: tPri }}>
                        Manage Supervisors
                    </Typography>
                    <Typography variant="body2" sx={{ color: tSec, mt: 0.5 }}>
                        {counts.all} supervisors · {counts.hod} head{counts.hod !== 1 ? "s" : ""} of department
                    </Typography>
                </Box>
                <Tooltip title="Refresh">
                    <IconButton
                        onClick={fetchUsers}
                        disabled={loading}
                        sx={{ border: `1px solid ${alpha(PRIMARY, 0.3)}`, borderRadius: 2 }}
                    >
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

            {/* Filter chips */}
            <Stack direction="row" spacing={1} sx={{ mb: 2.5 }} flexWrap="wrap">
                {[
                    { key: "all", label: `All (${counts.all})` },
                    { key: "hod", label: `Head of Dept. (${counts.hod})` },
                    { key: "supervisor", label: `Supervisor (${counts.supervisor})` },
                ].map(({ key, label }) => (
                    <Chip
                        key={key}
                        label={label}
                        onClick={() => { setFilterHod(key); setPage(1); }}
                        variant={filterHod === key ? "filled" : "outlined"}
                        sx={{
                            fontWeight: 600, fontSize: "0.8rem", cursor: "pointer",
                            ...(filterHod === key
                                ? { bgcolor: PRIMARY, color: "#fff", borderColor: PRIMARY }
                                : { color: tSec, borderColor: brd }),
                        }}
                    />
                ))}
            </Stack>

            <Paper elevation={1} sx={{ borderRadius: 3, overflow: "hidden", bgcolor: theme.palette.background.paper }}>
                {/* Search bar */}
                <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${brd}` }}>
                    <TextField
                        placeholder="Search by name, email, or department…"
                        size="small"
                        sx={{ width: 320 }}
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 16, color: tTer }} />
                                </InputAdornment>
                            ),
                        }}
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
                                    {["#", "Supervisor", "Department", "Role", "Head of Dept."].map(h => (
                                        <TableCell key={h} sx={{
                                            fontWeight: 700, fontSize: "0.78rem",
                                            textTransform: "uppercase", letterSpacing: "0.05em",
                                            color: tTer,
                                        }}>
                                            {h}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {paginated.map((sup, idx) => {
                                    const id = sup.id ?? sup.userId;
                                    const name = sup.fullName ?? sup.name ?? sup.username ?? "—";
                                    const email = sup.universityEmail ?? sup.email ?? "—";
                                    const dept = sup.department ?? sup.dept ?? "—";
                                    const isHod = sup.isHeadOfDepartment === true;
                                    const isProcessing = actionLoading === id;
                                    const initial = name.charAt(0).toUpperCase();

                                    return (
                                        <TableRow
                                            key={id ?? idx}
                                            sx={{
                                                "&:hover": { bgcolor: alpha(PRIMARY, 0.03) },
                                                opacity: isProcessing ? 0.6 : 1,
                                                transition: "opacity 0.2s",
                                            }}
                                        >
                                            {/* # */}
                                            <TableCell sx={{ color: tTer, fontSize: "0.8rem", width: 50 }}>
                                                {(page - 1) * PER_PAGE + idx + 1}
                                            </TableCell>

                                            {/* Supervisor info */}
                                            <TableCell>
                                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                                    <Avatar sx={{
                                                        width: 36, height: 36,
                                                        bgcolor: alpha(isHod ? HOD_COLOR : PRIMARY, 0.15),
                                                        color: isHod ? HOD_COLOR : PRIMARY,
                                                        fontSize: "0.85rem", fontWeight: 700,
                                                        transition: "background-color 0.3s, color 0.3s",
                                                    }}>
                                                        {initial}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography fontSize="0.875rem" fontWeight={600} sx={{ color: tPri }}>
                                                            {name}
                                                        </Typography>
                                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                                            <EmailOutlinedIcon sx={{ fontSize: 13, color: tTer }} />
                                                            <Typography
                                                                fontSize="0.75rem"
                                                                sx={{ color: tSec, fontFamily: "monospace" }}
                                                            >
                                                                {email}
                                                            </Typography>
                                                        </Stack>
                                                    </Box>
                                                </Stack>
                                            </TableCell>

                                            {/* Department */}
                                            <TableCell>
                                                <Stack direction="row" alignItems="center" spacing={0.6}>
                                                    <BusinessOutlinedIcon sx={{ fontSize: 14, color: tTer }} />
                                                    <Typography fontSize="0.85rem" sx={{ color: tSec }}>
                                                        {dept}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>

                                            {/* Role badge */}
                                            <TableCell>
                                                <Chip
                                                    icon={isHod
                                                        ? <StarIcon sx={{ fontSize: "14px !important", color: `${HOD_COLOR} !important` }} />
                                                        : <PersonOutlinedIcon sx={{ fontSize: "14px !important" }} />
                                                    }
                                                    label={isHod ? "Head of Dept." : "Supervisor"}
                                                    size="small"
                                                    sx={{
                                                        height: 24,
                                                        fontSize: "0.72rem",
                                                        fontWeight: 600,
                                                        bgcolor: alpha(isHod ? HOD_COLOR : PRIMARY, 0.12),
                                                        color: isHod ? HOD_COLOR : PRIMARY,
                                                        borderRadius: "6px",
                                                        transition: "background-color 0.3s, color 0.3s",
                                                    }}
                                                />
                                            </TableCell>

                                            {/* Toggle */}
                                            <TableCell>
                                                {isProcessing ? (
                                                    <CircularProgress size={22} sx={{ color: PRIMARY }} />
                                                ) : (
                                                    <Tooltip title={isHod ? "Remove Head of Department role" : "Set as Head of Department"}>
                                                        <Switch
                                                            checked={isHod}
                                                            onChange={() => handleToggleClick(sup)}
                                                            size="small"
                                                            sx={{
                                                                "& .MuiSwitch-switchBase.Mui-checked": {
                                                                    color: HOD_COLOR,
                                                                    "&:hover": { bgcolor: alpha(HOD_COLOR, 0.08) },
                                                                },
                                                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                                                    bgcolor: HOD_COLOR,
                                                                },
                                                            }}
                                                        />
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}

                                {paginated.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: "center", py: 6, color: tTer }}>
                                            No supervisors found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>

                {pageCount > 1 && (
                    <Stack alignItems="center" sx={{ py: 2, borderTop: `1px solid ${brd}` }}>
                        <Pagination
                            count={pageCount}
                            page={page}
                            onChange={(_, v) => setPage(v)}
                            sx={{
                                "& .MuiPaginationItem-root.Mui-selected": {
                                    bgcolor: PRIMARY,
                                    color: "#fff",
                                },
                            }}
                        />
                    </Stack>
                )}
            </Paper>

            {/* Confirm Dialog */}
            <ConfirmHodDialog
                open={dialog.open}
                supervisor={dialog.supervisor}
                makingHod={dialog.makingHod}
                existingHead={dialog.existingHead}
                onCancel={() => setDialog(d => ({ ...d, open: false }))}
                onConfirm={handleConfirm}
                loading={!!actionLoading}
            />
        </Box>
    );
}