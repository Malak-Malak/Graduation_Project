import { useState } from "react";
import {
    Box, Paper, Typography, Stack, Avatar, Chip, Button, LinearProgress,
    AvatarGroup, Grid, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Tabs, Tab, Divider, IconButton, Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";

const GROUPS = [
    {
        id: 1, name: "EcoTrackers", project: "AI-Based Waste Management",
        members: [
            { name: "Aya Abu Ghozeh", role: "Lead", initials: "A" },
            { name: "Hanan Awad", role: "Research", initials: "H" },
            { name: "Malak Malak", role: "Backend", initials: "M" },
            { name: "Sara Ahmad", role: "Frontend", initials: "S" },
        ],
        tasks: { todo: 4, inProgress: 3, done: 8 },
        files: { pending: 3, approved: 16, total: 19 },
        progress: 65, risk: "low", lastActive: "Today", maxMembers: 5,
    },
    {
        id: 2, name: "CodeCraft", project: "Smart Campus Navigation",
        members: [
            { name: "Omar Jawad", role: "Lead", initials: "O" },
            { name: "Lina Said", role: "Design", initials: "L" },
            { name: "Noor Khalid", role: "Backend", initials: "N" },
        ],
        tasks: { todo: 7, inProgress: 2, done: 4 },
        files: { pending: 5, approved: 8, total: 13 },
        progress: 42, risk: "medium", lastActive: "2 days ago", maxMembers: 4,
    },
    {
        id: 3, name: "InnovateX", project: "Blockchain Voting System",
        members: [
            { name: "Yara Hassan", role: "Lead", initials: "Y" },
            { name: "Khalid Nour", role: "Backend", initials: "K" },
            { name: "Rima Saleh", role: "Frontend", initials: "R" },
        ],
        tasks: { todo: 2, inProgress: 1, done: 14 },
        files: { pending: 1, approved: 20, total: 21 },
        progress: 80, risk: "low", lastActive: "Today", maxMembers: 5,
    },
    {
        id: 4, name: "SmartCampus", project: "IoT Energy Monitor",
        members: [
            { name: "Daoud Issa", role: "Lead", initials: "D" },
            { name: "Farah Nimer", role: "Backend", initials: "F" },
        ],
        tasks: { todo: 10, inProgress: 1, done: 3 },
        files: { pending: 6, approved: 4, total: 10 },
        progress: 28, risk: "high", lastActive: "4 days ago", maxMembers: 4,
    },
];

const RISK_CLR = { low: "#6D8A7D", medium: "#C49A6C", high: "#C47E7E" };
const MBR_COLORS = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8"];
const PRIMARY = "#d0895b";

export default function GroupsList() {
    const theme = useTheme();
    const t = theme.palette.custom;

    const [groups, setGroups] = useState(GROUPS);
    const [selected, setSelected] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [sizeOpen, setSizeOpen] = useState(false);
    const [limitOpen, setLimitOpen] = useState(false);   // ✅ جديد — max groups
    const [maxVal, setMaxVal] = useState(5);
    const [maxGroups, setMaxGroups] = useState(6);       // ✅ عدد الفرق الكلي المسموح
    const [maxGroupsInput, setMaxGroupsInput] = useState(6);
    const [tab, setTab] = useState(0);

    const openDetail = (g) => { setSelected(g); setTab(0); setDetailOpen(true); };
    const openSize = (g, e) => { e.stopPropagation(); setSelected(g); setMaxVal(g.maxMembers); setSizeOpen(true); };

    const saveSize = () => {
        setGroups((p) => p.map((g) => g.id === selected.id ? { ...g, maxMembers: maxVal } : g));
        setSizeOpen(false);
    };

    const saveGroupLimit = () => {
        setMaxGroups(maxGroupsInput);
        setLimitOpen(false);
    };

    return (
        <Box sx={{ maxWidth: 1100 }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>My Groups</Typography>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                        {groups.length} / {maxGroups} supervised teams · Spring 2025
                    </Typography>
                </Box>
                {/* ✅ زر تحديد الحد الأقصى للفرق */}
                <Tooltip title="Set max groups you can supervise">
                    <Button variant="outlined" startIcon={<TuneOutlinedIcon />}
                        onClick={() => { setMaxGroupsInput(maxGroups); setLimitOpen(true); }}
                        sx={{
                            borderColor: t.borderLight, color: t.textSecondary, fontSize: "0.8rem", borderRadius: 2, textTransform: "none",
                            "&:hover": { borderColor: PRIMARY, color: PRIMARY }
                        }}>
                        Supervising Limit: {maxGroups}
                    </Button>
                </Tooltip>
            </Stack>

            {/* Capacity bar */}
            <Box sx={{ mb: 3, p: 2, borderRadius: 2, border: `1px solid ${t.borderLight}`, bgcolor: theme.palette.background.paper }}>
                <Stack direction="row" justifyContent="space-between" mb={0.6}>
                    <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, fontWeight: 600 }}>Supervision Capacity</Typography>
                    <Typography sx={{ fontSize: "0.78rem", color: groups.length >= maxGroups ? "#C47E7E" : t.accentSecondary, fontWeight: 700 }}>
                        {groups.length} / {maxGroups} groups
                    </Typography>
                </Stack>
                <LinearProgress variant="determinate" value={(groups.length / maxGroups) * 100}
                    sx={{
                        height: 6, borderRadius: 3, bgcolor: t.borderLight,
                        "& .MuiLinearProgress-bar": { bgcolor: groups.length >= maxGroups ? "#C47E7E" : t.accentSecondary, borderRadius: 3 }
                    }} />
                {groups.length >= maxGroups && (
                    <Typography sx={{ fontSize: "0.72rem", color: "#C47E7E", mt: 0.5 }}>
                        ⚠ You have reached your maximum supervision limit.
                    </Typography>
                )}
            </Box>

            <Grid container spacing={2}>
                {groups.map((g) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={g.id}>
                        <Paper elevation={1} onClick={() => openDetail(g)}
                            sx={{
                                p: 2.5, borderRadius: 3, cursor: "pointer", bgcolor: theme.palette.background.paper,
                                "&:hover": { transform: "translateY(-2px)", boxShadow: t.shadowMd }, transition: "all 0.2s"
                            }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                                <Box>
                                    <Stack direction="row" alignItems="center" gap={1} mb={0.3}>
                                        <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: t.textPrimary }}>{g.name}</Typography>
                                        <Chip label={g.risk} size="small"
                                            sx={{ bgcolor: `${RISK_CLR[g.risk]}18`, color: RISK_CLR[g.risk], fontWeight: 600, fontSize: "0.65rem", height: 20, textTransform: "capitalize" }} />
                                    </Stack>
                                    <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary }}>{g.project}</Typography>
                                </Box>
                                <Button size="small" startIcon={<SettingsOutlinedIcon sx={{ fontSize: 14 }} />}
                                    onClick={(e) => openSize(g, e)}
                                    sx={{ fontSize: "0.72rem", color: t.textTertiary, "&:hover": { color: t.accentPrimary }, textTransform: "none", minWidth: "auto", p: "4px 8px" }}>
                                    {g.members.length}/{g.maxMembers}
                                </Button>
                            </Stack>

                            <Box sx={{ mb: 1.5 }}>
                                <Stack direction="row" justifyContent="space-between" mb={0.4}>
                                    <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>Progress</Typography>
                                    <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: t.textPrimary }}>{g.progress}%</Typography>
                                </Stack>
                                <LinearProgress variant="determinate" value={g.progress}
                                    sx={{ bgcolor: t.borderLight, "& .MuiLinearProgress-bar": { bgcolor: RISK_CLR[g.risk] } }} />
                            </Box>

                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <AvatarGroup max={4} sx={{ "& .MuiAvatar-root": { width: 28, height: 28, fontSize: "0.7rem", fontWeight: 700 } }}>
                                    {g.members.map((m, j) => <Avatar key={j} sx={{ bgcolor: MBR_COLORS[j % MBR_COLORS.length] }}>{m.initials}</Avatar>)}
                                </AvatarGroup>
                                <Stack direction="row" gap={1}>
                                    <Chip label={`${g.tasks.inProgress} active`} size="small"
                                        sx={{ bgcolor: `${t.accentPrimary}12`, color: t.accentPrimary, fontSize: "0.68rem", fontWeight: 600, height: 22 }} />
                                    <Chip label={`${g.files.pending} files`} size="small"
                                        sx={{ bgcolor: `${t.accentSecondary}12`, color: t.accentSecondary, fontSize: "0.68rem", fontWeight: 600, height: 22 }} />
                                </Stack>
                            </Stack>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* ── Group detail dialog ── */}
            {selected && (
                <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: t.textPrimary }}>{selected.name}</Typography>
                                <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary }}>{selected.project}</Typography>
                            </Box>
                            <Chip label={selected.risk} size="small"
                                sx={{ bgcolor: `${RISK_CLR[selected.risk]}18`, color: RISK_CLR[selected.risk], fontWeight: 600, textTransform: "capitalize" }} />
                        </Stack>
                    </DialogTitle>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3, borderBottom: `1px solid ${t.borderLight}` }}>
                        <Tab label="Overview" />
                        <Tab label="Members" />
                        <Tab label="Tasks" />
                    </Tabs>
                    <DialogContent>
                        {tab === 0 && (
                            <Stack spacing={2}>
                                <Box>
                                    <Typography sx={{ fontSize: "0.75rem", color: t.textTertiary, mb: 0.5 }}>PROGRESS</Typography>
                                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                                        <Typography sx={{ fontSize: "0.875rem", color: t.textSecondary }}>Completion</Typography>
                                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: t.textPrimary }}>{selected.progress}%</Typography>
                                    </Stack>
                                    <LinearProgress variant="determinate" value={selected.progress}
                                        sx={{ bgcolor: t.borderLight, "& .MuiLinearProgress-bar": { bgcolor: RISK_CLR[selected.risk] } }} />
                                </Box>
                                <Grid container spacing={1.5}>
                                    {[
                                        { label: "To Do", val: selected.tasks.todo, color: t.textTertiary },
                                        { label: "In Progress", val: selected.tasks.inProgress, color: t.accentTertiary },
                                        { label: "Done", val: selected.tasks.done, color: t.success },
                                        { label: "Files", val: selected.files.total, color: t.accentSecondary },
                                    ].map((item) => (
                                        <Grid size={{ xs: 6 }} key={item.label}>
                                            <Box sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${t.borderLight}`, textAlign: "center" }}>
                                                <Typography sx={{ fontSize: "1.4rem", fontWeight: 700, color: item.color }}>{item.val}</Typography>
                                                <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>{item.label}</Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Stack>
                        )}
                        {tab === 1 && (
                            <Stack spacing={1} sx={{ mt: 1 }}>
                                {selected.members.map((m, i) => (
                                    <Stack key={i} direction="row" alignItems="center" gap={1.5}
                                        sx={{ p: 1.2, borderRadius: 2, border: `1px solid ${t.borderLight}` }}>
                                        <Avatar sx={{ width: 34, height: 34, bgcolor: MBR_COLORS[i % MBR_COLORS.length], fontSize: "0.85rem", fontWeight: 700 }}>{m.initials}</Avatar>
                                        <Box>
                                            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: t.textPrimary }}>{m.name}</Typography>
                                            <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>{m.role}</Typography>
                                        </Box>
                                    </Stack>
                                ))}
                                <Typography sx={{ fontSize: "0.78rem", color: t.textTertiary, textAlign: "center", mt: 1 }}>
                                    {selected.members.length} / {selected.maxMembers} members
                                </Typography>
                            </Stack>
                        )}
                        {tab === 2 && (
                            <Stack spacing={1} sx={{ mt: 1 }}>
                                {[
                                    { label: "To Do", val: selected.tasks.todo, color: t.textTertiary },
                                    { label: "In Progress", val: selected.tasks.inProgress, color: t.accentTertiary },
                                    { label: "Done", val: selected.tasks.done, color: t.success },
                                ].map((item) => (
                                    <Stack key={item.label} direction="row" justifyContent="space-between" alignItems="center"
                                        sx={{ p: 1.2, borderRadius: 2, border: `1px solid ${t.borderLight}` }}>
                                        <Typography sx={{ fontSize: "0.875rem", color: t.textSecondary }}>{item.label}</Typography>
                                        <Chip label={item.val} size="small" sx={{ bgcolor: `${item.color}18`, color: item.color, fontWeight: 700, height: 22 }} />
                                    </Stack>
                                ))}
                            </Stack>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2.5 }}>
                        <Button onClick={() => setDetailOpen(false)} sx={{ color: t.textSecondary }}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* ── Team size dialog ── */}
            {selected && (
                <Dialog open={sizeOpen} onClose={() => setSizeOpen(false)} maxWidth="xs" fullWidth>
                    <DialogTitle sx={{ fontWeight: 700, color: t.textPrimary }}>Team Size — {selected?.name}</DialogTitle>
                    <DialogContent>
                        <Typography sx={{ fontSize: "0.875rem", color: t.textSecondary, mb: 2 }}>
                            Set the maximum number of members allowed in this team.
                        </Typography>
                        <TextField label="Max Members" type="number" size="small" fullWidth
                            value={maxVal} onChange={(e) => setMaxVal(Number(e.target.value))}
                            inputProps={{ min: selected?.members?.length ?? 1, max: 10 }} />
                        <Typography sx={{ fontSize: "0.75rem", color: t.textTertiary, mt: 1 }}>
                            Current: {selected?.members?.length} member(s). Min cannot be below current count.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2.5 }}>
                        <Button onClick={() => setSizeOpen(false)} sx={{ color: t.textSecondary }}>Cancel</Button>
                        <Button variant="contained" onClick={saveSize} sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#b06f47" }, borderRadius: 2, textTransform: "none" }}>Save</Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* ✅ Max groups limit dialog */}
            <Dialog open={limitOpen} onClose={() => setLimitOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, color: t.textPrimary }}>Supervision Limit</DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: "0.875rem", color: t.textSecondary, mb: 2 }}>
                        Set the maximum number of groups you are willing to supervise this semester.
                    </Typography>
                    <TextField label="Max Groups" type="number" size="small" fullWidth
                        value={maxGroupsInput} onChange={(e) => setMaxGroupsInput(Number(e.target.value))}
                        inputProps={{ min: groups.length, max: 20 }} />
                    <Typography sx={{ fontSize: "0.75rem", color: t.textTertiary, mt: 1 }}>
                        You currently supervise {groups.length} group(s). Min cannot be below current count.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setLimitOpen(false)} sx={{ color: t.textSecondary }}>Cancel</Button>
                    <Button variant="contained" onClick={saveGroupLimit}
                        sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#b06f47" }, borderRadius: 2, textTransform: "none" }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}