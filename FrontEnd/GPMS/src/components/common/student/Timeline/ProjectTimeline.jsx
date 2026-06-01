import { useState, useRef, useEffect, useCallback } from "react";
import {
    Box, Typography, Stack, Paper, Tooltip,
    IconButton, Chip, Drawer, TextField, Button,
    Divider, Collapse, List, ListItem,
    Avatar, AvatarGroup, CircularProgress, Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import TodayIcon from "@mui/icons-material/Today";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import FlagCircleIcon from "@mui/icons-material/FlagCircle";
import studentApi from "../../../../api/handler/endpoints/studentApi";

/* ── helpers ─────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 8);
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

const PALETTE = [
    "#6366f1", "#10b981", "#f59e0b", "#ef4444",
    "#8b5cf6", "#B46F4C", "#f97316", "#ec4899",
];

const DEFAULT_PROJECT = {
    name: "My Project",
    team: "",
    supervisorName: "",
    members: [],
    start: "2025-01-01",
    end: "2025-09-30",
    today: new Date().toISOString().slice(0, 10),
    status: "",
};

const DEFAULT_ROWS = [
    {
        id: "r1", label: "Planning", color: "#6366f1",
        bars: [
            { id: "b1", label: "Requirements gathering", start: "2025-01-05", end: "2025-01-25", color: "#6366f1" },
            { id: "b2", label: "Supervisor approval", start: "2025-01-28", end: "2025-02-10", color: "#818cf8" },
            { id: "b3", label: "Project proposal", start: "2025-02-12", end: "2025-02-28", color: "#6366f1" },
        ],
        milestones: [{ id: "ms1", label: "Kickoff", date: "2025-02-01" }],
    },
    {
        id: "r2", label: "Design", color: "#f59e0b",
        bars: [
            { id: "b4", label: "System architecture", start: "2025-03-01", end: "2025-03-20", color: "#f59e0b" },
            { id: "b5", label: "Database schema", start: "2025-03-15", end: "2025-04-05", color: "#fbbf24" },
            { id: "b6", label: "UI mockups", start: "2025-03-25", end: "2025-04-20", color: "#f59e0b" },
        ],
        milestones: [{ id: "ms2", label: "Design review", date: "2025-04-20" }],
    },
    {
        id: "r3", label: "Backend", color: "#10b981",
        bars: [
            { id: "b7", label: "Auth & user module", start: "2025-05-01", end: "2025-05-25", color: "#10b981" },
            { id: "b8", label: "API development", start: "2025-05-20", end: "2025-06-30", color: "#34d399" },
            { id: "b9", label: "Database integration", start: "2025-06-15", end: "2025-07-15", color: "#10b981" },
        ],
        milestones: [{ id: "ms3", label: "API complete", date: "2025-06-30" }],
    },
    {
        id: "r4", label: "Frontend", color: "#06b6d4",
        bars: [
            { id: "b10", label: "Student dashboard", start: "2025-05-10", end: "2025-06-10", color: "#06b6d4" },
            { id: "b11", label: "Kanban & Timeline", start: "2025-06-05", end: "2025-07-05", color: "#22d3ee" },
            { id: "b12", label: "Supervisor portal", start: "2025-07-01", end: "2025-07-31", color: "#06b6d4" },
        ],
        milestones: [{ id: "ms4", label: "UI complete", date: "2025-07-31" }],
    },
    {
        id: "r5", label: "Testing", color: "#8b5cf6",
        bars: [
            { id: "b13", label: "Unit testing", start: "2025-08-01", end: "2025-08-20", color: "#8b5cf6" },
            { id: "b14", label: "Integration testing", start: "2025-08-15", end: "2025-09-05", color: "#a78bfa" },
            { id: "b15", label: "Bug fixes & polish", start: "2025-09-01", end: "2025-09-20", color: "#8b5cf6" },
        ],
        milestones: [{ id: "ms5", label: "Final delivery", date: "2025-09-25" }],
    },
];

/* ── ColorDot ─── */
function ColorDot({ color, onChange, size = 14 }) {
    const ref = useRef();
    return (
        <Box onClick={() => ref.current?.click()} sx={{
            width: size, height: size, borderRadius: "3px",
            bgcolor: color, cursor: "pointer", flexShrink: 0,
            border: "2px solid rgba(255,255,255,0.2)",
            "&:hover": { filter: "brightness(1.2)" }, transition: "filter .15s",
        }}>
            <input ref={ref} type="color" value={color}
                onChange={e => onChange(e.target.value)}
                style={{ opacity: 0, width: 0, height: 0, position: "absolute" }} />
        </Box>
    );
}

/* ── InlineEdit ─── */
function InlineEdit({ value, onChange, sx = {} }) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(value);
    useEffect(() => setVal(value), [value]);
    if (editing) return (
        <TextField autoFocus size="small" value={val}
            onChange={e => setVal(e.target.value)}
            onBlur={() => { onChange(val); setEditing(false); }}
            onKeyDown={e => { if (e.key === "Enter") { onChange(val); setEditing(false); } }}
            variant="standard"
            sx={{ ...sx, "& input": { fontSize: "inherit", fontWeight: "inherit", p: 0 } }} />
    );
    return (
        <Typography onClick={() => setEditing(true)} sx={{
            cursor: "text", ...sx,
            "&:hover": { textDecoration: "underline dotted", textUnderlineOffset: "3px" },
        }}>{value}</Typography>
    );
}

/* ── STATUS BADGE ─── */
function StatusBadge({ status }) {
    const map = {
        Active: { bg: "rgba(16,185,129,0.12)", color: "#10b981", dot: "#10b981", label: "Active" },
        Pending: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", dot: "#f59e0b", label: "Pending" },
        Completed: { bg: "rgba(99,102,241,0.12)", color: "#6366f1", dot: "#6366f1", label: "Completed" },
    };
    const s = map[status] ?? map["Active"];
    return (
        <Box sx={{
            display: "inline-flex", alignItems: "center", gap: 0.6,
            px: 1.2, py: 0.3, borderRadius: "20px",
            bgcolor: s.bg, border: `1px solid ${s.color}30`,
        }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: s.dot,
                boxShadow: `0 0 6px ${s.dot}`, animation: "pulse 2s infinite",
                "@keyframes pulse": {
                    "0%,100%": { opacity: 1 },
                    "50%": { opacity: 0.5 },
                }
            }} />
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: s.color, letterSpacing: ".04em" }}>
                {s.label}
            </Typography>
        </Box>
    );
}

/* ══════════════════════════════════════════════════════════════ */
export default function ProjectTimeline() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const [project, setProject] = useState(DEFAULT_PROJECT);
    const [rows, setRows] = useState(DEFAULT_ROWS);
    const [zoom, setZoom] = useState(1);
    const [hoveredBar, setHoveredBar] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(null);

    const scrollRef = useRef(null);

    /* ── Fetch team data from API ── */
    useEffect(() => {
        studentApi.getMyTeam()
            .then(data => {
                setProject(prev => ({
                    ...prev,
                    name: data.projectTitle || prev.name,
                    team: data.members?.map(m => m.fullName).join(", ") || prev.team,
                    supervisorName: data.supervisorName || "",
                    members: data.members || [],
                    status: data.status || "",
                }));
            })
            .catch(err => {
                console.error("Failed to fetch team data:", err);
                setApiError("Could not load project info — showing defaults.");
            })
            .finally(() => setLoading(false));
    }, []);

    /* ── derived ── */
    const projStart = project.start;
    const projEnd = project.end;
    const totalDays = daysBetween(projStart, projEnd);

    const toPercent = useCallback((date) => {
        if (totalDays <= 0) return 0;
        return Math.max(0, Math.min(100, daysBetween(projStart, date) / totalDays * 100));
    }, [projStart, totalDays]);

    const widthPercent = useCallback((start, end) => {
        const s = Math.max(0, toPercent(start));
        const e = Math.min(100, toPercent(end));
        return Math.max(0.5, e - s);
    }, [toPercent]);

    const getMonths = useCallback(() => {
        const months = [];
        const d = new Date(projStart + "T00:00:00");
        const end = new Date(projEnd + "T00:00:00");
        while (d <= end) {
            months.push({
                label: d.toLocaleDateString("en-US", { month: "short" }),
                year: d.getFullYear(),
                pct: toPercent(d.toISOString().slice(0, 10)),
                monthNum: d.getMonth(),
            });
            d.setMonth(d.getMonth() + 1);
        }
        return months;
    }, [projStart, projEnd, toPercent]);

    const getQuarters = useCallback(() => {
        const qs = [];
        const d = new Date(projStart + "T00:00:00");
        const end = new Date(projEnd + "T00:00:00");
        while (d <= end) {
            const label = `Q${Math.ceil((d.getMonth() + 1) / 3)} ${d.getFullYear()}`;
            const pct = toPercent(d.toISOString().slice(0, 10));
            if (!qs.length || qs[qs.length - 1].label !== label) qs.push({ label, pct });
            d.setMonth(d.getMonth() + 1);
        }
        return qs;
    }, [projStart, projEnd, toPercent]);

    const months = getMonths();
    const quarters = getQuarters();
    const todayPct = toPercent(project.today);

    useEffect(() => {
        if (scrollRef.current) {
            const pct = todayPct / 100;
            scrollRef.current.scrollLeft =
                scrollRef.current.scrollWidth * pct - scrollRef.current.clientWidth / 2;
        }
    }, [loading]);

    /* ── theme tokens ── */
    const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)";
    const gridCol = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const paperBg = theme.palette.background.paper;
    const cardAlt = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
    const todayColor = "#6366f1";
    const milestoneColor = "#f59e0b";

    const ROW_H = 64;
    const LABEL_W = 160;
    const chartW = `${100 * zoom}%`;

    const fmtDate = d => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const fmtDateLong = d => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    /* ── mutations ── */
    const addRow = () => setRows(prev => [...prev, {
        id: uid(), label: `Phase ${prev.length + 1}`,
        color: PALETTE[prev.length % PALETTE.length], bars: [], milestones: [],
    }]);
    const updateRow = (id, patch) => setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
    const deleteRow = (id) => setRows(prev => prev.filter(r => r.id !== id));

    const addBar = (rowId) => {
        const row = rows.find(r => r.id === rowId);
        if (!row) return;
        setRows(prev => prev.map(r => r.id === rowId ? {
            ...r, bars: [...r.bars, { id: uid(), label: "New task", start: project.start, end: project.end, color: row.color }],
        } : r));
    };
    const updateBar = (rowId, barId, patch) =>
        setRows(prev => prev.map(r => r.id === rowId ? { ...r, bars: r.bars.map(b => b.id === barId ? { ...b, ...patch } : b) } : r));
    const deleteBar = (rowId, barId) =>
        setRows(prev => prev.map(r => r.id === rowId ? { ...r, bars: r.bars.filter(b => b.id !== barId) } : r));

    const addMilestone = (rowId) =>
        setRows(prev => prev.map(r => r.id === rowId ? {
            ...r, milestones: [...r.milestones, { id: uid(), label: "Milestone", date: project.start }],
        } : r));
    const updateMilestone = (rowId, msId, patch) =>
        setRows(prev => prev.map(r => r.id === rowId ? { ...r, milestones: r.milestones.map(m => m.id === msId ? { ...m, ...patch } : m) } : r));
    const deleteMilestone = (rowId, msId) =>
        setRows(prev => prev.map(r => r.id === rowId ? { ...r, milestones: r.milestones.filter(m => m.id !== msId) } : r));

    const toggleExpand = (id) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));

    /* ══ EDITOR DRAWER ══ */
    const EditorDrawer = (
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
            PaperProps={{ sx: { width: 360, bgcolor: paperBg, borderLeft: `1px solid ${border}` } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between"
                sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${border}` }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: tPri }}>Edit Timeline</Typography>
                <IconButton size="small" onClick={() => setDrawerOpen(false)} sx={{ color: tSec }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Stack>
            <Box sx={{ overflowY: "auto", flex: 1, pb: 4 }}>
                {/* Project info */}
                <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
                    <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: tSec, letterSpacing: ".07em", textTransform: "uppercase", mb: 1.5 }}>
                        Project Info
                    </Typography>
                    <Stack gap={1.5}>
                        <TextField label="Project name" size="small" fullWidth value={project.name}
                            onChange={e => setProject(p => ({ ...p, name: e.target.value }))} />
                        <Stack direction="row" gap={1}>
                            <TextField label="Start" type="date" size="small" fullWidth value={project.start}
                                onChange={e => setProject(p => ({ ...p, start: e.target.value }))}
                                InputLabelProps={{ shrink: true }} />
                            <TextField label="End" type="date" size="small" fullWidth value={project.end}
                                onChange={e => setProject(p => ({ ...p, end: e.target.value }))}
                                InputLabelProps={{ shrink: true }} />
                        </Stack>
                        <TextField label="Today marker" type="date" size="small" fullWidth value={project.today}
                            onChange={e => setProject(p => ({ ...p, today: e.target.value }))}
                            InputLabelProps={{ shrink: true }} />
                    </Stack>
                </Box>
                <Divider sx={{ borderColor: border, my: 1 }} />
                {/* Rows */}
                <Box sx={{ px: 2.5, pt: 1 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: tSec, letterSpacing: ".07em", textTransform: "uppercase" }}>
                            Phases & Tasks
                        </Typography>
                        <Button size="small" startIcon={<AddIcon />} onClick={addRow}
                            sx={{ fontSize: "0.72rem", color: "#6366f1", p: "2px 8px", minWidth: 0 }}>
                            Add phase
                        </Button>
                    </Stack>
                    {rows.map(row => (
                        <Paper key={row.id} elevation={0} sx={{ mb: 1.5, border: `1px solid ${border}`, borderRadius: 2, overflow: "hidden" }}>
                            <Stack direction="row" alignItems="center" gap={1} sx={{ px: 1.5, py: 1.2, bgcolor: cardAlt }}>
                                <ColorDot color={row.color} onChange={c => updateRow(row.id, { color: c })} />
                                <InlineEdit value={row.label} onChange={v => updateRow(row.id, { label: v })}
                                    sx={{ flex: 1, fontSize: "0.82rem", fontWeight: 600, color: tPri }} />
                                <IconButton size="small" onClick={() => toggleExpand(row.id)} sx={{ color: tSec, p: 0.4 }}>
                                    {expandedRows[row.id] ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                                </IconButton>
                                <IconButton size="small" onClick={() => deleteRow(row.id)}
                                    sx={{ color: tSec, p: 0.4, "&:hover": { color: "#ef4444" } }}>
                                    <DeleteIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                            </Stack>
                            <Collapse in={!!expandedRows[row.id]}>
                                <Box sx={{ px: 1.5, pb: 1.5, pt: 1 }}>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.75}>
                                        <Typography sx={{ fontSize: "0.65rem", color: tSec, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>
                                            Tasks
                                        </Typography>
                                        <Button size="small" onClick={() => addBar(row.id)}
                                            sx={{ fontSize: "0.66rem", p: "1px 6px", minWidth: 0, color: row.color }}>
                                            + Add
                                        </Button>
                                    </Stack>
                                    {row.bars.map(bar => (
                                        <Box key={bar.id} sx={{ mb: 1, p: 1, bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderRadius: 1.5, border: `1px solid ${border}` }}>
                                            <Stack direction="row" alignItems="center" gap={0.75} mb={0.75}>
                                                <ColorDot size={10} color={bar.color} onChange={c => updateBar(row.id, bar.id, { color: c })} />
                                                <InlineEdit value={bar.label} onChange={v => updateBar(row.id, bar.id, { label: v })}
                                                    sx={{ flex: 1, fontSize: "0.76rem", color: tPri }} />
                                                <IconButton size="small" onClick={() => deleteBar(row.id, bar.id)}
                                                    sx={{ color: tSec, p: 0.3, "&:hover": { color: "#ef4444" } }}>
                                                    <DeleteIcon sx={{ fontSize: 13 }} />
                                                </IconButton>
                                            </Stack>
                                            <Stack direction="row" gap={0.75}>
                                                <TextField label="Start" type="date" size="small" value={bar.start}
                                                    onChange={e => updateBar(row.id, bar.id, { start: e.target.value })}
                                                    InputLabelProps={{ shrink: true }}
                                                    inputProps={{ style: { fontSize: "0.7rem", padding: "3px 6px" } }}
                                                    sx={{ flex: 1 }} />
                                                <TextField label="End" type="date" size="small" value={bar.end}
                                                    onChange={e => updateBar(row.id, bar.id, { end: e.target.value })}
                                                    InputLabelProps={{ shrink: true }}
                                                    inputProps={{ style: { fontSize: "0.7rem", padding: "3px 6px" } }}
                                                    sx={{ flex: 1 }} />
                                            </Stack>
                                        </Box>
                                    ))}
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" mt={1.5} mb={0.75}>
                                        <Typography sx={{ fontSize: "0.65rem", color: tSec, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>
                                            Milestones
                                        </Typography>
                                        <Button size="small" onClick={() => addMilestone(row.id)}
                                            sx={{ fontSize: "0.66rem", p: "1px 6px", minWidth: 0, color: milestoneColor }}>
                                            + Add
                                        </Button>
                                    </Stack>
                                    {row.milestones.map(ms => (
                                        <Stack key={ms.id} direction="row" alignItems="center" gap={0.75} mb={0.75}
                                            sx={{ p: 0.75, borderRadius: 1.5, bgcolor: isDark ? "rgba(245,158,11,0.07)" : "rgba(245,158,11,0.05)", border: `1px solid rgba(245,158,11,0.2)` }}>
                                            <Box sx={{ width: 8, height: 8, bgcolor: milestoneColor, transform: "rotate(45deg)", borderRadius: "1px", flexShrink: 0 }} />
                                            <InlineEdit value={ms.label} onChange={v => updateMilestone(row.id, ms.id, { label: v })}
                                                sx={{ flex: 1, fontSize: "0.74rem", color: tPri }} />
                                            <TextField type="date" size="small" value={ms.date}
                                                onChange={e => updateMilestone(row.id, ms.id, { date: e.target.value })}
                                                InputLabelProps={{ shrink: true }}
                                                inputProps={{ style: { fontSize: "0.7rem", padding: "3px 6px" } }}
                                                sx={{ width: 130 }} />
                                            <IconButton size="small" onClick={() => deleteMilestone(row.id, ms.id)}
                                                sx={{ color: tSec, p: 0.3, "&:hover": { color: "#ef4444" } }}>
                                                <DeleteIcon sx={{ fontSize: 13 }} />
                                            </IconButton>
                                        </Stack>
                                    ))}
                                </Box>
                            </Collapse>
                        </Paper>
                    ))}
                </Box>
            </Box>
        </Drawer>
    );

    /* ══ RENDER ══ */
    if (loading) return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
            <CircularProgress size={32} />
        </Box>
    );

    return (
        <Box sx={{ pb: 4 }}>
            {EditorDrawer}

            {apiError && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>{apiError}</Alert>
            )}

            {/* ══ HEADER CARD ══ */}
            <Paper elevation={0} sx={{
                mb: 3, p: 2.5,
                borderRadius: 3,
                border: `1px solid ${border}`,
                background: isDark
                    ? "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(16,185,129,0.04) 100%)"
                    : "linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(16,185,129,0.03) 100%)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                    content: '""',
                    position: "absolute", top: 0, left: 0, right: 0,
                    height: "3px",
                    background: "linear-gradient(90deg, #6366f1, #10b981, #f59e0b)",
                    borderRadius: "3px 3px 0 0",
                },
            }}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={2}>
                    {/* Left: project info */}
                    <Box>
                        <Stack direction="row" alignItems="center" gap={1.5} mb={0.5}>
                            <InlineEdit value={project.name}
                                onChange={v => setProject(p => ({ ...p, name: v }))}
                                sx={{ fontSize: "1.6rem", fontWeight: 800, color: tPri, letterSpacing: "-.02em" }} />
                            {project.status && <StatusBadge status={project.status} />}
                        </Stack>
                        <Stack direction="row" gap={2.5} flexWrap="wrap">
                            {project.supervisorName && (
                                <Stack direction="row" alignItems="center" gap={0.6}>
                                    <PersonIcon sx={{ fontSize: 14, color: tSec }} />
                                    <Typography sx={{ color: tSec, fontSize: "0.82rem" }}>
                                        {project.supervisorName}
                                    </Typography>
                                </Stack>
                            )}
                            <Stack direction="row" alignItems="center" gap={0.6}>
                                <TodayIcon sx={{ fontSize: 14, color: tSec }} />
                                <Typography sx={{ color: tSec, fontSize: "0.82rem" }}>
                                    {fmtDate(project.start)} — {fmtDate(project.end)}
                                </Typography>
                            </Stack>
                            {project.members?.length > 0 && (
                                <Stack direction="row" alignItems="center" gap={0.6}>
                                    <GroupsIcon sx={{ fontSize: 14, color: tSec }} />
                                    <Typography sx={{ color: tSec, fontSize: "0.82rem" }}>
                                        {project.members.length} members
                                    </Typography>
                                </Stack>
                            )}
                        </Stack>
                    </Box>

                    {/* Right: members + controls */}
                    <Stack direction="row" alignItems="center" gap={1.5}>
                        {project.members?.length > 0 && (
                            <AvatarGroup max={5} sx={{
                                "& .MuiAvatar-root": {
                                    width: 30, height: 30, fontSize: "0.72rem",
                                    border: `2px solid ${paperBg}`,
                                    bgcolor: "#B46F4C",
                                },
                            }}>
                                {project.members.map(m => (
                                    <Tooltip key={m.userId} title={m.fullName} placement="top">
                                        <Avatar sx={{ bgcolor: PALETTE[m.userId % PALETTE.length] }}>
                                            {m.fullName?.charAt(0)?.toUpperCase()}
                                        </Avatar>
                                    </Tooltip>
                                ))}
                            </AvatarGroup>
                        )}

                        <Chip label={fmtDateLong(project.today)} size="small"
                            icon={<TodayIcon sx={{ fontSize: "13px !important", color: `${todayColor} !important` }} />}
                            sx={{
                                bgcolor: isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.08)",
                                color: todayColor, fontWeight: 700, fontSize: "0.72rem",
                                border: `1px solid rgba(99,102,241,0.25)`,
                            }} />

                        <Chip label="Edit" size="small" onClick={() => setDrawerOpen(true)}
                            icon={<EditIcon sx={{ fontSize: "13px !important" }} />}
                            sx={{
                                cursor: "pointer", fontWeight: 600, fontSize: "0.72rem",
                                bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                                color: tPri, border: `1px solid ${border}`,
                                "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.09)" },
                            }} />

                        {/* Zoom controls */}
                        <Stack direction="row" sx={{ border: `1px solid ${border}`, borderRadius: 2, overflow: "hidden" }}>
                            <IconButton size="small" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                                sx={{ borderRadius: 0, color: tSec, px: 1, "&:hover": { color: todayColor } }}>
                                <ZoomOutIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                            <Box sx={{ display: "flex", alignItems: "center", px: 1, borderLeft: `1px solid ${border}`, borderRight: `1px solid ${border}` }}>
                                <Typography sx={{ fontSize: "0.7rem", color: tSec, minWidth: 34, textAlign: "center" }}>
                                    {Math.round(zoom * 100)}%
                                </Typography>
                            </Box>
                            <IconButton size="small" onClick={() => setZoom(z => Math.min(5, z + 0.25))}
                                sx={{ borderRadius: 0, color: tSec, px: 1, "&:hover": { color: todayColor } }}>
                                <ZoomInIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Stack>
                    </Stack>
                </Stack>
            </Paper>

            {/* ══ GANTT CHART ══ */}
            <Paper elevation={0} sx={{
                borderRadius: 3, border: `1px solid ${border}`,
                bgcolor: paperBg, overflow: "hidden",
            }}>
                {/* ── TIME HEADER ── */}
                <Box sx={{ display: "flex", borderBottom: `1px solid ${border}` }}>
                    {/* Corner label */}
                    <Box sx={{
                        width: LABEL_W, flexShrink: 0,
                        borderRight: `1px solid ${border}`,
                        bgcolor: cardAlt,
                        display: "flex", alignItems: "flex-end",
                        px: 2, pb: 1,
                    }}>
                        <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: tSec, letterSpacing: ".08em", textTransform: "uppercase" }}>
                            Phase
                        </Typography>
                    </Box>
                    <Box sx={{ flex: 1, overflowX: "hidden" }}>
                        <Box sx={{ width: chartW, minWidth: 700 }}>
                            {/* Quarters row */}
                            <Box sx={{ position: "relative", height: 32, bgcolor: cardAlt, borderBottom: `1px solid ${border}` }}>
                                {quarters.map((q, i) => (
                                    <Box key={i} sx={{
                                        position: "absolute", left: `${q.pct}%`,
                                        height: "100%", display: "flex", alignItems: "center",
                                        pl: 1.5, borderLeft: `1px solid ${border}`,
                                    }}>
                                        <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: tPri, whiteSpace: "nowrap", letterSpacing: ".02em" }}>
                                            {q.label}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                            {/* Months row */}
                            <Box sx={{ position: "relative", height: 28, bgcolor: paperBg }}>
                                {months.map((m, i) => (
                                    <Box key={i} sx={{
                                        position: "absolute", left: `${m.pct}%`,
                                        height: "100%", display: "flex", alignItems: "center",
                                        pl: 1, borderLeft: `1px solid ${gridCol}`,
                                    }}>
                                        <Typography sx={{ fontSize: "0.68rem", color: tSec, whiteSpace: "nowrap", fontWeight: 500 }}>
                                            {m.label}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* ── BODY ── */}
                <Box sx={{ display: "flex" }}>
                    {/* Row labels */}
                    <Box sx={{ width: LABEL_W, flexShrink: 0, borderRight: `1px solid ${border}` }}>
                        {rows.map((row, i) => (
                            <Box key={row.id} sx={{
                                height: ROW_H,
                                borderBottom: i < rows.length - 1 ? `1px solid ${border}` : "none",
                                display: "flex", alignItems: "center",
                                px: 2, gap: 1.2,
                            }}>
                                <Box sx={{
                                    width: 4, height: 32, borderRadius: "2px",
                                    bgcolor: row.color, flexShrink: 0,
                                    boxShadow: `0 0 8px ${row.color}60`,
                                }} />
                                <Box>
                                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: tPri, lineHeight: 1.2 }}>
                                        {row.label}
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.67rem", color: tSec, mt: 0.2 }}>
                                        {row.bars.length} task{row.bars.length !== 1 ? "s" : ""}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>

                    {/* Scrollable chart */}
                    <Box ref={scrollRef} sx={{
                        flex: 1, overflowX: "auto",
                        "&::-webkit-scrollbar": { height: 5 },
                        "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
                        "&::-webkit-scrollbar-thumb": { bgcolor: border, borderRadius: 3 },
                    }}>
                        <Box sx={{ width: chartW, minWidth: 700, position: "relative" }}>

                            {/* Grid lines */}
                            {months.map((m, i) => (
                                <Box key={i} sx={{
                                    position: "absolute", left: `${m.pct}%`,
                                    top: 0, bottom: 0, width: 1,
                                    bgcolor: m.monthNum === 0 ? border : gridCol,
                                    pointerEvents: "none",
                                }} />
                            ))}

                            {/* Today line */}
                            <Box sx={{
                                position: "absolute",
                                left: `${todayPct}%`, top: 0, bottom: 0,
                                width: "2px",
                                background: `linear-gradient(180deg, ${todayColor}, ${todayColor}80)`,
                                zIndex: 10, pointerEvents: "none",
                            }}>
                                <Box sx={{
                                    position: "absolute", top: 4, left: "50%",
                                    transform: "translateX(-50%)",
                                    bgcolor: todayColor, borderRadius: "10px",
                                    px: 1, py: 0.3, whiteSpace: "nowrap",
                                    boxShadow: `0 2px 8px ${todayColor}60`,
                                }}>
                                    <Typography sx={{ fontSize: "0.6rem", fontWeight: 800, color: "#fff", letterSpacing: ".04em" }}>
                                        TODAY
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Rows */}
                            {rows.map((row, i) => (
                                <Box key={row.id} sx={{
                                    height: ROW_H, position: "relative",
                                    borderBottom: i < rows.length - 1 ? `1px solid ${border}` : "none",
                                    display: "flex", alignItems: "center",
                                    transition: "background .15s",
                                    "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.012)" },
                                }}>
                                    {/* Bars */}
                                    {row.bars.map(bar => {
                                        const isHov = hoveredBar === bar.id;
                                        const durDays = daysBetween(bar.start, bar.end);
                                        return (
                                            <Tooltip key={bar.id} placement="top" arrow
                                                title={
                                                    <Box sx={{ p: 0.5 }}>
                                                        <Typography fontSize="0.8rem" fontWeight={700} mb={0.3}>{bar.label}</Typography>
                                                        <Typography fontSize="0.72rem" color="inherit" sx={{ opacity: 0.85 }}>
                                                            {fmtDate(bar.start)} → {fmtDate(bar.end)}
                                                        </Typography>
                                                        <Typography fontSize="0.7rem" color="inherit" sx={{ opacity: 0.7, mt: 0.3 }}>
                                                            {durDays} day{durDays !== 1 ? "s" : ""}
                                                        </Typography>
                                                    </Box>
                                                }>
                                                <Box
                                                    onMouseEnter={() => setHoveredBar(bar.id)}
                                                    onMouseLeave={() => setHoveredBar(null)}
                                                    sx={{
                                                        position: "absolute",
                                                        left: `${toPercent(bar.start)}%`,
                                                        width: `${widthPercent(bar.start, bar.end)}%`,
                                                        height: 32,
                                                        borderRadius: "6px",
                                                        background: isHov
                                                            ? `linear-gradient(90deg, ${bar.color}, ${bar.color}cc)`
                                                            : `linear-gradient(90deg, ${bar.color}dd, ${bar.color}aa)`,
                                                        display: "flex", alignItems: "center",
                                                        px: 1.2, overflow: "hidden",
                                                        cursor: "pointer",
                                                        transform: isHov ? "scaleY(1.1) translateY(-1px)" : "scaleY(1)",
                                                        transition: "all 0.18s cubic-bezier(.34,1.56,.64,1)",
                                                        boxShadow: isHov
                                                            ? `0 4px 16px ${bar.color}50, 0 0 0 1px ${bar.color}60`
                                                            : `0 2px 6px ${bar.color}30`,
                                                        zIndex: isHov ? 5 : 1,
                                                        "&::after": {
                                                            content: '""',
                                                            position: "absolute", top: 0, left: 0, right: 0,
                                                            height: "40%",
                                                            background: "rgba(255,255,255,0.12)",
                                                            borderRadius: "6px 6px 0 0",
                                                        },
                                                    }}>
                                                    <Typography sx={{
                                                        fontSize: "0.68rem", fontWeight: 700,
                                                        color: "#fff", whiteSpace: "nowrap",
                                                        overflow: "hidden", textOverflow: "ellipsis",
                                                        letterSpacing: ".01em", zIndex: 1,
                                                        textShadow: "0 1px 3px rgba(0,0,0,0.25)",
                                                    }}>
                                                        {bar.label}
                                                    </Typography>
                                                </Box>
                                            </Tooltip>
                                        );
                                    })}

                                    {/* Milestones */}
                                    {row.milestones.map(ms => (
                                        <Tooltip key={ms.id} placement="top" arrow
                                            title={
                                                <Box sx={{ p: 0.5 }}>
                                                    <Typography fontSize="0.8rem" fontWeight={700}>🏁 {ms.label}</Typography>
                                                    <Typography fontSize="0.72rem" sx={{ opacity: 0.85 }}>{fmtDateLong(ms.date)}</Typography>
                                                </Box>
                                            }>
                                            <Box sx={{
                                                position: "absolute",
                                                left: `${toPercent(ms.date)}%`,
                                                transform: "translateX(-50%)",
                                                display: "flex", flexDirection: "column",
                                                alignItems: "center", zIndex: 6, cursor: "pointer",
                                                "&:hover .ms-diamond": {
                                                    transform: "rotate(45deg) scale(1.25)",
                                                    boxShadow: `0 0 12px ${milestoneColor}80`,
                                                },
                                            }}>
                                                <Box className="ms-diamond" sx={{
                                                    width: 14, height: 14,
                                                    bgcolor: milestoneColor,
                                                    transform: "rotate(45deg)",
                                                    borderRadius: "2px",
                                                    border: `2.5px solid ${paperBg}`,
                                                    boxShadow: `0 0 0 1.5px ${milestoneColor}, 0 2px 8px ${milestoneColor}50`,
                                                    transition: "all .18s ease",
                                                }} />
                                                <Typography sx={{
                                                    fontSize: "0.6rem", fontWeight: 800,
                                                    color: milestoneColor, mt: 0.6,
                                                    whiteSpace: "nowrap",
                                                    textShadow: isDark
                                                        ? "0 0 10px rgba(0,0,0,0.9)"
                                                        : "0 0 6px rgba(255,255,255,0.95)",
                                                    letterSpacing: ".03em",
                                                }}>
                                                    {ms.label}
                                                </Typography>
                                            </Box>
                                        </Tooltip>
                                    ))}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Paper>

            {/* ══ LEGEND ══ */}
            <Stack direction="row" flexWrap="wrap" gap={2} mt={2} px={0.5}>
                {rows.map(row => (
                    <Stack key={row.id} direction="row" alignItems="center" gap={0.8}>
                        <Box sx={{
                            width: 28, height: 10, borderRadius: "3px",
                            background: `linear-gradient(90deg, ${row.color}dd, ${row.color}88)`,
                            boxShadow: `0 2px 6px ${row.color}30`,
                        }} />
                        <Typography sx={{ fontSize: "0.75rem", color: tSec, fontWeight: 500 }}>{row.label}</Typography>
                    </Stack>
                ))}
                <Stack direction="row" alignItems="center" gap={0.8}>
                    <Box sx={{ width: 10, height: 10, bgcolor: milestoneColor, transform: "rotate(45deg)", borderRadius: "1px", boxShadow: `0 0 6px ${milestoneColor}60` }} />
                    <Typography sx={{ fontSize: "0.75rem", color: tSec, fontWeight: 500 }}>Milestone</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap={0.8}>
                    <Box sx={{ width: 2, height: 16, bgcolor: todayColor, borderRadius: "1px", boxShadow: `0 0 6px ${todayColor}60` }} />
                    <Typography sx={{ fontSize: "0.75rem", color: tSec, fontWeight: 500 }}>Today</Typography>
                </Stack>
            </Stack>
        </Box>
    );
}