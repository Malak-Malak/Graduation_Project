import { useState } from "react";
import {
    Box, Paper, Typography, Stack, TextField, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Button, MenuItem, Select, FormControl, InputLabel, Pagination,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";

const LOGS = [
    { id: 1, timestamp: "2025-03-17 10:30 AM", user: "Aya Abu Ghozeh", role: "student", action: "File Upload", detail: "proposal_v3.pdf" },
    { id: 2, timestamp: "2025-03-17 09:15 AM", user: "Dr. Thaer Sammar", role: "supervisor", action: "Comment Added", detail: "On ERD diagram" },
    { id: 3, timestamp: "2025-03-17 08:50 AM", user: "Admin", role: "admin", action: "User Created", detail: "New student: Sara" },
    { id: 4, timestamp: "2025-03-16 04:20 PM", user: "Malak Malak", role: "student", action: "Task Updated", detail: "DB Design → Done" },
    { id: 5, timestamp: "2025-03-16 03:10 PM", user: "System", role: "system", action: "AI Report Generated", detail: "EcoTrackers group" },
    { id: 6, timestamp: "2025-03-16 11:30 AM", user: "Aya Abu Ghozeh", role: "student", action: "Team Invite Sent", detail: "To Jordan Smith" },
    { id: 7, timestamp: "2025-03-16 10:00 AM", user: "Dr. Layla Hassan", role: "supervisor", action: "Meeting Confirmed", detail: "With CodeCraft" },
    { id: 8, timestamp: "2025-03-15 02:45 PM", user: "Hanan Awad", role: "student", action: "File Upload", detail: "midterm_ppt.pptx" },
    { id: 9, timestamp: "2025-03-15 11:00 AM", user: "Admin", role: "admin", action: "Settings Changed", detail: "Team size: max 5" },
    { id: 10, timestamp: "2025-03-15 09:30 AM", user: "Omar Jawad", role: "student", action: "Login", detail: "—" },
];

const ACTION_CLR = {
    "File Upload": "#B46F4C",
    "Comment Added": "#6D8A7D",
    "User Created": "#7E9FC4",
    "Task Updated": "#C49A6C",
    "AI Report Generated": "#9B7EC8",
    "Team Invite Sent": "#B46F4C",
    "Meeting Confirmed": "#6D8A7D",
    "Settings Changed": "#C47E7E",
    "Login": "#9AA9B9",
};

const ROLE_CLR = { student: "#B46F4C", supervisor: "#6D8A7D", admin: "#7E9FC4", system: "#9B7EC8" };
const PER_PAGE = 7;

export default function ActivityLogs() {
    const theme = useTheme();
    const t = theme.palette.custom;

    const [search, setSearch] = useState("");
    const [roleF, setRoleF] = useState("all");
    const [page, setPage] = useState(1);

    const filtered = LOGS.filter((l) => {
        const q = search.toLowerCase();
        return (
            (l.user.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.detail.toLowerCase().includes(q)) &&
            (roleF === "all" || l.role === roleF)
        );
    });
    const pageCount = Math.ceil(filtered.length / PER_PAGE);
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <Box sx={{ maxWidth: 1100 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                    <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>Activity Logs</Typography>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>{LOGS.length} events recorded</Typography>
                </Box>
                <Button variant="outlined" startIcon={<DownloadOutlinedIcon />}
                    sx={{ borderColor: t.borderLight, color: t.textSecondary, "&:hover": { borderColor: t.accentPrimary, color: t.accentPrimary } }}>
                    Export CSV
                </Button>
            </Stack>

            <Paper elevation={1} sx={{ borderRadius: 3, overflow: "hidden", bgcolor: theme.palette.background.paper }}>
                <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${t.borderLight}` }}>
                    <TextField placeholder="Search logs…" size="small" sx={{ width: 220 }} value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: t.textTertiary }} /></InputAdornment> }} />
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Role</InputLabel>
                        <Select label="Role" value={roleF} onChange={(e) => { setRoleF(e.target.value); setPage(1); }}>
                            <MenuItem value="all">All Roles</MenuItem>
                            <MenuItem value="student">Student</MenuItem>
                            <MenuItem value="supervisor">Supervisor</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="system">System</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>{["Timestamp", "User", "Role", "Action", "Details"].map((h) => <TableCell key={h}>{h}</TableCell>)}</TableRow>
                        </TableHead>
                        <TableBody>
                            {paginated.map((l) => (
                                <TableRow key={l.id}>
                                    <TableCell><Typography sx={{ fontSize: "0.8rem", color: t.textTertiary, whiteSpace: "nowrap" }}>{l.timestamp}</Typography></TableCell>
                                    <TableCell><Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: t.textPrimary }}>{l.user}</Typography></TableCell>
                                    <TableCell>
                                        <Chip label={l.role} size="small" sx={{ bgcolor: `${ROLE_CLR[l.role]}15`, color: ROLE_CLR[l.role], fontWeight: 600, fontSize: "0.7rem", textTransform: "capitalize", height: 22 }} />
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={l.action} size="small"
                                            sx={{ bgcolor: `${ACTION_CLR[l.action] ?? "#9AA9B9"}15`, color: ACTION_CLR[l.action] ?? "#9AA9B9", fontWeight: 600, fontSize: "0.7rem", height: 22 }} />
                                    </TableCell>
                                    <TableCell><Typography sx={{ fontSize: "0.82rem", color: t.textSecondary }}>{l.detail}</Typography></TableCell>
                                </TableRow>
                            ))}
                            {paginated.length === 0 && (
                                <TableRow><TableCell colSpan={5} sx={{ textAlign: "center", py: 5, color: t.textTertiary }}>No logs found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {pageCount > 1 && (
                    <Stack alignItems="center" sx={{ py: 2, borderTop: `1px solid ${t.borderLight}` }}>
                        <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)}
                            sx={{ "& .MuiPaginationItem-root.Mui-selected": { bgcolor: t.accentPrimary, color: "#fff" } }} />
                    </Stack>
                )}
            </Paper>
        </Box>
    );
}