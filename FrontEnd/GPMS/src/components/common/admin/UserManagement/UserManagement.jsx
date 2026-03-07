import { useState, useEffect } from "react";
import {
    Box, Paper, Typography, Stack, Button, TextField, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Avatar, Chip, IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
    DialogActions, MenuItem, Select, FormControl, InputLabel, Pagination,
    CircularProgress, Alert, Switch, FormControlLabel, Divider, alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";

import { getAllUsers, addUniversityRecord } from "../../../../api/handler/endpoints/adminApi";

const PRIMARY = "#d0895b";
const ROLE_CLR = { student: "#B46F4C", supervisor: "#6D8A7D", admin: "#7E9FC4" };
const STATUS_CLR = { active: "#6D8A7D", pending: "#C49A6C", inactive: "#9AA9B9" };
const STATUS_LBL = { active: "Active", pending: "Pending", inactive: "Inactive" };
const PER_PAGE = 8;

const EMPTY_FORM = {
    fullName: "",
    universityEmail: "",
    username: "",
    password: "",
    role: "student",
    department: "",
    isGraduate: true,
};

// ── Add User Form ─────────────────────────────────────────────────────────────
function AddUserForm({ form, setForm, error }) {
    const theme = useTheme();
    const t = theme.palette.custom;

    const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: 2 } };

    return (
        <Box sx={{ mt: 1 }}>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            <Stack spacing={2.5}>
                {/* Full Name */}
                <TextField
                    label="Full Name" size="small" fullWidth sx={fieldSx}
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                    InputProps={{ startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon sx={{ fontSize: 18, color: t.textTertiary }} /></InputAdornment> }}
                />

                {/* University Email */}
                <TextField
                    label="University Email" size="small" fullWidth sx={fieldSx}
                    placeholder="e.g. h.n.awad@students.ptuk.edu.ps"
                    value={form.universityEmail}
                    onChange={(e) => setForm((p) => ({ ...p, universityEmail: e.target.value }))}
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ fontSize: 18, color: t.textTertiary }} /></InputAdornment> }}
                />

                {/* Username + Password */}
                <Stack direction="row" spacing={2}>
                    <TextField
                        label="Username" size="small" fullWidth sx={fieldSx}
                        placeholder="e.g. h.n.awad"
                        value={form.username}
                        onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                        InputProps={{ startAdornment: <InputAdornment position="start"><PersonAddOutlinedIcon sx={{ fontSize: 18, color: t.textTertiary }} /></InputAdornment> }}
                    />
                    <TextField
                        label="Password" size="small" fullWidth sx={fieldSx} type="password"
                        value={form.password}
                        onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                        InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ fontSize: 18, color: t.textTertiary }} /></InputAdornment> }}
                    />
                </Stack>

                {/* Role + Department */}
                <Stack direction="row" spacing={2}>
                    <FormControl size="small" fullWidth sx={fieldSx}>
                        <InputLabel>Role</InputLabel>
                        <Select label="Role" value={form.role}
                            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
                            <MenuItem value="student">Student</MenuItem>
                            <MenuItem value="supervisor">Supervisor</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Department" size="small" fullWidth sx={fieldSx}
                        placeholder="e.g. CS"
                        value={form.department}
                        onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                        InputProps={{ startAdornment: <InputAdornment position="start"><BusinessOutlinedIcon sx={{ fontSize: 18, color: t.textTertiary }} /></InputAdornment> }}
                    />
                </Stack>

                {/* Is Graduate */}
                <Box sx={{ px: 1.5, py: 1.2, borderRadius: 2, border: `1px solid ${alpha(PRIMARY, 0.2)}`, bgcolor: alpha(PRIMARY, 0.04) }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={form.isGraduate}
                                onChange={(e) => setForm((p) => ({ ...p, isGraduate: e.target.checked }))}
                                sx={{
                                    "& .MuiSwitch-switchBase.Mui-checked": { color: PRIMARY },
                                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: PRIMARY }
                                }}
                            />
                        }
                        label={
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <SchoolOutlinedIcon sx={{ fontSize: 18, color: form.isGraduate ? PRIMARY : "text.disabled" }} />
                                <Typography variant="body2" sx={{ color: form.isGraduate ? PRIMARY : "text.secondary", fontWeight: form.isGraduate ? 600 : 400 }}>
                                    Graduate Student
                                </Typography>
                            </Stack>
                        }
                    />
                </Box>
            </Stack>
        </Box>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function UserManagement() {
    const theme = useTheme();
    const t = theme.palette.custom;

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [page, setPage] = useState(1);

    const [addOpen, setAddOpen] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);

    const [delOpen, setDelOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    // ── Fetch users ──────────────────────────────────────────────────────────
    const fetchUsers = async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const res = await getAllUsers();
            // flexible — يتكيف مع أي شكل
            setUsers(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
        } catch (err) {
            console.log("Users error:", err.response?.data);
            setFetchError("Failed to load users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // ── Filter + paginate ────────────────────────────────────────────────────
    const filtered = users.filter((u) => {
        const name = u.fullName ?? u.name ?? "";
        const email = u.universityEmail ?? u.email ?? "";
        const role = (u.role ?? "").toLowerCase();
        const q = search.toLowerCase();
        return (
            (name.toLowerCase().includes(q) || email.toLowerCase().includes(q)) &&
            (roleFilter === "all" || role === roleFilter)
        );
    });
    const pageCount = Math.ceil(filtered.length / PER_PAGE);
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    // ── Add user ─────────────────────────────────────────────────────────────
    const handleAdd = async () => {
        if (!form.fullName || !form.universityEmail || !form.username || !form.password) {
            setAddError("Please fill in all required fields.");
            return;
        }
        setAddLoading(true);
        setAddError(null);
        try {
            await addUniversityRecord(form);
            setAddOpen(false);
            setForm(EMPTY_FORM);
            fetchUsers(); // تحديث القائمة
        } catch (err) {
            console.log("Add user error:", err.response?.data);
            const msg = err.response?.data?.message ?? err.response?.data;
            setAddError(typeof msg === "string" ? msg : "Failed to add user. Please try again.");
        } finally {
            setAddLoading(false);
        }
    };

    // ── Helpers ──────────────────────────────────────────────────────────────
    const getName = (u) => u.fullName ?? u.name ?? "—";
    const getEmail = (u) => u.universityEmail ?? u.email ?? "—";
    const getRole = (u) => (u.role ?? "").toLowerCase();
    const getDept = (u) => u.department ?? u.dept ?? "—";
    const getStatus = (u) => (u.status ?? "active").toLowerCase();
    const getId = (u) => u.id ?? u.userId;

    return (
        <Box sx={{ maxWidth: 1100 }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>User Management</Typography>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                        {users.length} users registered
                    </Typography>
                </Box>
                <Tooltip title="Refresh">
                    <IconButton onClick={fetchUsers} disabled={loading}
                        sx={{ border: `1px solid ${alpha(PRIMARY, 0.3)}`, borderRadius: 2 }}>
                        <RefreshIcon sx={{ color: PRIMARY }} />
                    </IconButton>
                </Tooltip>
            </Stack>

            {fetchError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{fetchError}</Alert>}

            <Paper elevation={1} sx={{ borderRadius: 3, overflow: "hidden", bgcolor: theme.palette.background.paper }}>
                {/* Toolbar */}
                <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} alignItems={{ sm: "center" }}
                    justifyContent="space-between" sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${t.borderLight}` }}>
                    <Stack direction="row" gap={1.5} flexWrap="wrap">
                        <TextField placeholder="Search…" size="small" sx={{ width: 200 }} value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: t.textTertiary }} /></InputAdornment> }} />
                        <FormControl size="small" sx={{ minWidth: 130 }}>
                            <InputLabel>Role</InputLabel>
                            <Select label="Role" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
                                <MenuItem value="all">All Roles</MenuItem>
                                <MenuItem value="student">Students</MenuItem>
                                <MenuItem value="supervisor">Supervisors</MenuItem>
                                <MenuItem value="admin">Admins</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm(EMPTY_FORM); setAddError(null); setAddOpen(true); }}
                        sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#b06f47" }, borderRadius: 2, textTransform: "none", fontWeight: 600, whiteSpace: "nowrap" }}>
                        Add User
                    </Button>
                </Stack>

                {/* Table */}
                <TableContainer>
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                            <CircularProgress sx={{ color: PRIMARY }} />
                        </Box>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {["User", "Role", "Department", "Status", "Actions"].map((h) => (
                                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: t.textTertiary }}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginated.map((u) => {
                                    const role = getRole(u);
                                    const status = getStatus(u);
                                    return (
                                        <TableRow key={getId(u)} sx={{ "&:hover": { bgcolor: alpha(PRIMARY, 0.03) } }}>
                                            <TableCell>
                                                <Stack direction="row" alignItems="center" gap={1.5}>
                                                    <Avatar sx={{ width: 34, height: 34, bgcolor: ROLE_CLR[role] ?? "#9AA9B9", fontSize: "0.8rem", fontWeight: 600 }}>
                                                        {getName(u).charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: t.textPrimary }}>{getName(u)}</Typography>
                                                        <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>{getEmail(u)}</Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={role} size="small" sx={{ bgcolor: `${ROLE_CLR[role] ?? "#9AA9B9"}15`, color: ROLE_CLR[role] ?? "#9AA9B9", fontWeight: 600, fontSize: "0.7rem", textTransform: "capitalize", height: 22 }} />
                                            </TableCell>
                                            <TableCell><Typography sx={{ fontSize: "0.875rem", color: t.textSecondary }}>{getDept(u)}</Typography></TableCell>
                                            <TableCell>
                                                <Chip label={STATUS_LBL[status] ?? status} size="small"
                                                    sx={{ bgcolor: `${STATUS_CLR[status] ?? "#9AA9B9"}18`, color: STATUS_CLR[status] ?? "#9AA9B9", fontWeight: 600, fontSize: "0.7rem", height: 22 }} />
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="Delete">
                                                    <IconButton size="small" onClick={() => { setSelected(u); setDelOpen(true); }}
                                                        sx={{ color: t.textSecondary, "&:hover": { color: t.error } }}>
                                                        <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {paginated.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: "center", py: 6, color: t.textTertiary }}>
                                            No users found.
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

            {/* ── Add User Dialog ── */}
            <Dialog open={addOpen} onClose={() => !addLoading && setAddOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
                <DialogTitle>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(PRIMARY, 0.12) }}>
                            <PersonAddOutlinedIcon sx={{ color: PRIMARY, fontSize: 22, display: "block" }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={700}>Add New User</Typography>
                            <Typography variant="caption" color="text.secondary">Fill in the user's university details</Typography>
                        </Box>
                    </Stack>
                </DialogTitle>
                <Divider />
                <DialogContent>
                    <AddUserForm form={form} setForm={setForm} error={addError} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button onClick={() => setAddOpen(false)} disabled={addLoading}
                        sx={{ borderRadius: 2, textTransform: "none", color: "text.secondary" }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleAdd} disabled={addLoading}
                        startIcon={addLoading ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                        sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#b06f47" }, borderRadius: 2, textTransform: "none", fontWeight: 600, px: 3 }}>
                        {addLoading ? "Adding..." : "Add User"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Delete Confirm Dialog ── */}
            <Dialog open={delOpen} onClose={() => setDelOpen(false)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Remove User?</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: t.textSecondary }}>
                        Are you sure you want to remove <strong style={{ color: t.textPrimary }}>{getName(selected ?? {})}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button onClick={() => setDelOpen(false)} sx={{ borderRadius: 2, textTransform: "none" }}>Cancel</Button>
                    <Button variant="contained" onClick={() => setDelOpen(false)}
                        sx={{ bgcolor: "#d32f2f", "&:hover": { bgcolor: "#b71c1c" }, borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}