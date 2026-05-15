import { useState, useRef, useEffect, useCallback } from "react";
import {
    Box, Typography, Stack, Paper, Tooltip,
    IconButton, Chip, Drawer, TextField, Button,
    Divider, Collapse, List, ListItem, IconButton as MuiIconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import TodayIcon from "@mui/icons-material/Today";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import FlagIcon from "@mui/icons-material/Flag";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SettingsIcon from "@mui/icons-material/Settings";

/* ── helpers ─────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 8);
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

const PALETTE = [
    "#4F8EF7", "#3DB97A", "#d0895b", "#9B7EC8",
    "#E05C82", "#2BC4C4", "#F7A234", "#5C7AEA",
];

const DEFAULT_PROJECT = {
    name: "EcoTrackers",
    team: "Group 3",
    start: "2025-01-01",
    end: "2025-09-30",
    today: "2025-04-28",
};

const DEFAULT_ROWS = [
    {
        id: "r1", label: "Planning", color: "#4F8EF7",
        bars: [
            { id: "b1", label: "Requirements gathering", start: "2025-01-05", end: "2025-01-25", color: "#4F8EF7" },
            { id: "b2", label: "Supervisor approval", start: "2025-01-28", end: "2025-02-10", color: "#7EB2F7" },
            { id: "b3", label: "Project proposal", start: "2025-02-12", end: "2025-02-28", color: "#4F8EF7" },
        ],
        milestones: [{ id: "ms1", label: "Kickoff", date: "2025-02-01" }],
    },
    {
        id: "r2", label: "Design", color: "#d0895b",
        bars: [
            { id: "b4", label: "System architecture", start: "2025-03-01", end: "2025-03-20", color: "#d0895b" },
            { id: "b5", label: "Database schema", start: "2025-03-15", end: "2025-04-05", color: "#e0a87a" },
            { id: "b6", label: "UI mockups", start: "2025-03-25", end: "2025-04-20", color: "#d0895b" },
        ],
        milestones: [{ id: "ms2", label: "Design review", date: "2025-04-20" }],
    },
    {
        id: "r3", label: "Backend", color: "#3DB97A",
        bars: [
            { id: "b7", label: "Auth & user module", start: "2025-05-01", end: "2025-05-25", color: "#3DB97A" },
            { id: "b8", label: "API development", start: "2025-05-20", end: "2025-06-30", color: "#5DC98A" },
            { id: "b9", label: "Database integration", start: "2025-06-15", end: "2025-07-15", color: "#3DB97A" },
        ],
        milestones: [{ id: "ms3", label: "API complete", date: "2025-06-30" }],
    },
    {
        id: "r4", label: "Frontend", color: "#C49A6C",
        bars: [
            { id: "b10", label: "Student dashboard", start: "2025-05-10", end: "2025-06-10", color: "#C49A6C" },
            { id: "b11", label: "Kanban & Timeline", start: "2025-06-05", end: "2025-07-05", color: "#d4aa80" },
            { id: "b12", label: "Supervisor portal", start: "2025-07-01", end: "2025-07-31", color: "#C49A6C" },
        ],
        milestones: [{ id: "ms4", label: "UI complete", date: "2025-07-31" }],
    },
    {
        id: "r5", label: "Testing", color: "#9B7EC8",
        bars: [
            { id: "b13", label: "Unit testing", start: "2025-08-01", end: "2025-08-20", color: "#9B7EC8" },
            { id: "b14", label: "Integration testing", start: "2025-08-15", end: "2025-09-05", color: "#b49ad8" },
            { id: "b15", label: "Bug fixes & polish", start: "2025-09-01", end: "2025-09-20", color: "#9B7EC8" },
        ],
        milestones: [{ id: "ms5", label: "Final delivery", date: "2025-09-25" }],
    },
];

/* ── sub-components ──────────────────────────────────────────── */

/** Small color-dot picker using a hidden <input type=color> */
function ColorDot({ color, onChange, size = 14 }) {
    const ref = useRef();
    return (
        <Box
            onClick={() => ref.current?.click()}
            sx={{
                width: size, height: size, borderRadius: "3px",
                bgcolor: color, cursor: "pointer", flexShrink: 0,
                border: "2px solid rgba(255,255,255,0.25)",
                "&:hover": { filter: "brightness(1.15)" },
                transition: "filter .15s",
            }}
        >
            <input
                ref={ref}
                type="color"
                value={color}
                onChange={e => onChange(e.target.value)}
                style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
            />
        </Box>
    );
}

/** Editable inline text */
function InlineEdit({ value, onChange, sx = {} }) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(value);
    useEffect(() => setVal(value), [value]);
    if (editing) {
        return (
            <TextField
                autoFocus
                size="small"
                value={val}
                onChange={e => setVal(e.target.value)}
                onBlur={() => { onChange(val); setEditing(false); }}
                onKeyDown={e => { if (e.key === "Enter") { onChange(val); setEditing(false); } }}
                variant="standard"
                sx={{ ...sx, "& input": { fontSize: "inherit", fontWeight: "inherit", p: 0 } }}
            />
        );
    }
    return (
        <Typography
            onClick={() => setEditing(true)}
            sx={{
                cursor: "text", ...sx,
                "&:hover": { textDecoration: "underline dotted", textUnderlineOffset: "3px" },
            }}
        >
            {value}
        </Typography>
    );
}

/* ── main component ──────────────────────────────────────────── */
export default function ProjectTimeline() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    /* state */
    const [project, setProject] = useState(DEFAULT_PROJECT);
    const [rows, setRows] = useState(DEFAULT_ROWS);
    const [zoom, setZoom] = useState(1);
    const [hoveredBar, setHoveredBar] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});

    const scrollRef = useRef(null);

    /* derived */
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
                pct: toPercent(d.toISOString().slice(0, 10)),
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

    /* scroll to today on mount */
    useEffect(() => {
        if (scrollRef.current) {
            const pct = todayPct / 100;
            scrollRef.current.scrollLeft =
                scrollRef.current.scrollWidth * pct - scrollRef.current.clientWidth / 2;
        }
    }, []);

    /* theme tokens */
    const accent = "#d0895b";
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const gridCol = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const paperBg = theme.palette.background.paper;
    const cardAlt = isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.015)";

    const ROW_H = 52;
    const LABEL_W = 140;
    const chartW = `${100 * zoom}%`;

    const fmtDate = (d) =>
        new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const fmtDateLong = (d) =>
        new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    /* row mutations */
    const addRow = () => {
        const idx = rows.length;
        setRows(prev => [...prev, {
            id: uid(), label: `Row ${idx + 1}`,
            color: PALETTE[idx % PALETTE.length],
            bars: [], milestones: [],
        }]);
    };
    const updateRow = (id, patch) =>
        setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
    const deleteRow = (id) =>
        setRows(prev => prev.filter(r => r.id !== id));

    /* bar mutations */
    const addBar = (rowId) => {
        const row = rows.find(r => r.id === rowId);
        if (!row) return;
        setRows(prev => prev.map(r => r.id === rowId ? {
            ...r,
            bars: [...r.bars, {
                id: uid(), label: "New task",
                start: project.start, end: project.end,
                color: row.color,
            }],
        } : r));
    };
    const updateBar = (rowId, barId, patch) =>
        setRows(prev => prev.map(r => r.id === rowId ? {
            ...r,
            bars: r.bars.map(b => b.id === barId ? { ...b, ...patch } : b),
        } : r));
    const deleteBar = (rowId, barId) =>
        setRows(prev => prev.map(r => r.id === rowId ? {
            ...r, bars: r.bars.filter(b => b.id !== barId),
        } : r));

    /* milestone mutations */
    const addMilestone = (rowId) =>
        setRows(prev => prev.map(r => r.id === rowId ? {
            ...r,
            milestones: [...r.milestones, { id: uid(), label: "Milestone", date: project.start }],
        } : r));
    const updateMilestone = (rowId, msId, patch) =>
        setRows(prev => prev.map(r => r.id === rowId ? {
            ...r,
            milestones: r.milestones.map(m => m.id === msId ? { ...m, ...patch } : m),
        } : r));
    const deleteMilestone = (rowId, msId) =>
        setRows(prev => prev.map(r => r.id === rowId ? {
            ...r, milestones: r.milestones.filter(m => m.id !== msId),
        } : r));

    const toggleExpand = (id) =>
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));

    /* ── Drawer (editor panel) ── */
    const EditorDrawer = (
        <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            PaperProps={{
                sx: {
                    width: 340,
                    bgcolor: paperBg,
                    borderLeft: `1px solid ${border}`,
                    p: 0,
                },
            }}
        >
            {/* Drawer header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between"
                sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${border}` }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: tPri }}>
                    Edit Timeline
                </Typography>
                <IconButton size="small" onClick={() => setDrawerOpen(false)} sx={{ color: tSec }}>
                    <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </Stack>

            <Box sx={{ overflowY: "auto", flex: 1, pb: 4 }}>

                {/* Project info */}
                <Box sx={{ px: 2.5, pt: 2, pb: 1.5 }}>
                    <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: tSec, letterSpacing: ".06em", textTransform: "uppercase", mb: 1.5 }}>
                        Project Info
                    </Typography>
                    <Stack gap={1.5}>
                        <TextField label="Project name" size="small" fullWidth value={project.name}
                            onChange={e => setProject(p => ({ ...p, name: e.target.value }))} />
                        <TextField label="Team / Group" size="small" fullWidth value={project.team}
                            onChange={e => setProject(p => ({ ...p, team: e.target.value }))} />
                        <Stack direction="row" gap={1}>
                            <TextField label="Start" type="date" size="small" fullWidth
                                value={project.start}
                                onChange={e => setProject(p => ({ ...p, start: e.target.value }))}
                                InputLabelProps={{ shrink: true }} />
                            <TextField label="End" type="date" size="small" fullWidth
                                value={project.end}
                                onChange={e => setProject(p => ({ ...p, end: e.target.value }))}
                                InputLabelProps={{ shrink: true }} />
                        </Stack>
                        <TextField label="Today marker" type="date" size="small" fullWidth
                            value={project.today}
                            onChange={e => setProject(p => ({ ...p, today: e.target.value }))}
                            InputLabelProps={{ shrink: true }} />
                    </Stack>
                </Box>

                <Divider sx={{ borderColor: border, my: 1 }} />

                {/* Rows */}
                <Box sx={{ px: 2.5, pt: 1 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: tSec, letterSpacing: ".06em", textTransform: "uppercase" }}>
                            Rows & Tasks
                        </Typography>
                        <Button size="small" startIcon={<AddIcon />} onClick={addRow}
                            sx={{ fontSize: "0.72rem", color: accent, p: "2px 8px", minWidth: 0 }}>
                            Add row
                        </Button>
                    </Stack>

                    {rows.map((row, ri) => (
                        <Paper key={row.id} elevation={0} sx={{
                            mb: 1, border: `1px solid ${border}`,
                            borderRadius: 1.5, overflow: "hidden",
                        }}>
                            {/* Row header */}
                            <Stack direction="row" alignItems="center" gap={1}
                                sx={{ px: 1.5, py: 1, bgcolor: cardAlt }}>
                                <ColorDot color={row.color}
                                    onChange={c => updateRow(row.id, { color: c })} />
                                <InlineEdit value={row.label}
                                    onChange={v => updateRow(row.id, { label: v })}
                                    sx={{ flex: 1, fontSize: "0.8rem", fontWeight: 600, color: tPri }} />
                                <IconButton size="small" onClick={() => toggleExpand(row.id)}
                                    sx={{ color: tSec, p: 0.4 }}>
                                    {expandedRows[row.id]
                                        ? <ExpandLessIcon sx={{ fontSize: 16 }} />
                                        : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                                </IconButton>
                                <IconButton size="small" onClick={() => deleteRow(row.id)}
                                    sx={{ color: tSec, p: 0.4, "&:hover": { color: "#ef4444" } }}>
                                    <DeleteIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                            </Stack>

                            {/* Tasks & milestones */}
                            <Collapse in={!!expandedRows[row.id]}>
                                <Box sx={{ px: 1.5, pb: 1.5, pt: 1 }}>

                                    {/* Tasks */}
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.75}>
                                        <Typography sx={{ fontSize: "0.66rem", color: tSec, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>
                                            Tasks
                                        </Typography>
                                        <Button size="small" onClick={() => addBar(row.id)}
                                            sx={{ fontSize: "0.66rem", p: "1px 6px", minWidth: 0, color: row.color }}>
                                            + Add
                                        </Button>
                                    </Stack>

                                    {row.bars.map(bar => (
                                        <Box key={bar.id} sx={{
                                            mb: 0.75, p: 1,
                                            bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                                            borderRadius: 1, border: `1px solid ${border}`,
                                        }}>
                                            <Stack direction="row" alignItems="center" gap={0.75} mb={0.75}>
                                                <ColorDot size={10} color={bar.color}
                                                    onChange={c => updateBar(row.id, bar.id, { color: c })} />
                                                <InlineEdit value={bar.label}
                                                    onChange={v => updateBar(row.id, bar.id, { label: v })}
                                                    sx={{ flex: 1, fontSize: "0.75rem", color: tPri }} />
                                                <IconButton size="small" onClick={() => deleteBar(row.id, bar.id)}
                                                    sx={{ color: tSec, p: 0.3, "&:hover": { color: "#ef4444" } }}>
                                                    <DeleteIcon sx={{ fontSize: 13 }} />
                                                </IconButton>
                                            </Stack>
                                            <Stack direction="row" gap={0.75}>
                                                <TextField label="Start" type="date" size="small"
                                                    value={bar.start}
                                                    onChange={e => updateBar(row.id, bar.id, { start: e.target.value })}
                                                    InputLabelProps={{ shrink: true }}
                                                    inputProps={{ style: { fontSize: "0.7rem", padding: "3px 6px" } }}
                                                    sx={{ flex: 1 }} />
                                                <TextField label="End" type="date" size="small"
                                                    value={bar.end}
                                                    onChange={e => updateBar(row.id, bar.id, { end: e.target.value })}
                                                    InputLabelProps={{ shrink: true }}
                                                    inputProps={{ style: { fontSize: "0.7rem", padding: "3px 6px" } }}
                                                    sx={{ flex: 1 }} />
                                            </Stack>
                                        </Box>
                                    ))}

                                    {/* Milestones */}
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" mt={1} mb={0.75}>
                                        <Typography sx={{ fontSize: "0.66rem", color: tSec, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>
                                            Milestones
                                        </Typography>
                                        <Button size="small" onClick={() => addMilestone(row.id)}
                                            sx={{ fontSize: "0.66rem", p: "1px 6px", minWidth: 0, color: "#f59e0b" }}>
                                            + Add
                                        </Button>
                                    </Stack>

                                    {row.milestones.map(ms => (
                                        <Stack key={ms.id} direction="row" alignItems="center" gap={0.75} mb={0.75}
                                            sx={{
                                                p: 0.75, borderRadius: 1,
                                                bgcolor: isDark ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.06)",
                                                border: `1px solid rgba(245,158,11,0.2)`,
                                            }}>
                                            <Box sx={{
                                                width: 8, height: 8, bgcolor: "#f59e0b",
                                                transform: "rotate(45deg)", borderRadius: "1px", flexShrink: 0,
                                            }} />
                                            <InlineEdit value={ms.label}
                                                onChange={v => updateMilestone(row.id, ms.id, { label: v })}
                                                sx={{ flex: 1, fontSize: "0.74rem", color: tPri }} />
                                            <TextField type="date" size="small"
                                                value={ms.date}
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

    /* ── render ── */
    return (
        <Box sx={{ maxWidth: "100%", pb: 4 }}>

            {EditorDrawer}

            {/* ── header ── */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                    <InlineEdit
                        value={project.name}
                        onChange={v => setProject(p => ({ ...p, name: v }))}
                        sx={{ fontSize: "1.5rem", fontWeight: 700, color: tPri, mb: 0.4, display: "block" }}
                    />
                    <Typography sx={{ color: tSec, fontSize: "0.85rem" }}>
                        {project.team} · {fmtDate(project.start)} — {fmtDate(project.end)}
                    </Typography>
                </Box>

                <Stack direction="row" gap={1} alignItems="center">
                    {/* today chip */}
                    <Chip
                        icon={<TodayIcon sx={{ fontSize: "14px !important", color: `${accent} !important` }} />}
                        label={fmtDateLong(project.today)}
                        size="small"
                        sx={{
                            bgcolor: isDark ? "rgba(208,137,91,0.12)" : "rgba(208,137,91,0.08)",
                            color: accent, fontWeight: 700, fontSize: "0.75rem",
                            border: `1px solid rgba(208,137,91,0.25)`,
                        }}
                    />

                    {/* edit button */}
                    <Chip
                        icon={<EditIcon sx={{ fontSize: "13px !important" }} />}
                        label="Edit"
                        size="small"
                        onClick={() => setDrawerOpen(true)}
                        sx={{
                            cursor: "pointer", fontWeight: 600, fontSize: "0.75rem",
                            bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                            color: tPri, border: `1px solid ${border}`,
                            "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.09)" },
                        }}
                    />

                    {/* zoom */}
                    <Stack direction="row" sx={{ border: `1px solid ${border}`, borderRadius: 1.5, overflow: "hidden" }}>
                        <IconButton size="small" onClick={() => setZoom(z => Math.max(0.75, z - 0.25))}
                            sx={{ borderRadius: 0, color: tSec, "&:hover": { color: accent } }}>
                            <ZoomOutIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                        <Box sx={{ width: 1, bgcolor: border }} />
                        <Box sx={{ display: "flex", alignItems: "center", px: 1 }}>
                            <Typography sx={{ fontSize: "0.7rem", color: tSec, minWidth: 34, textAlign: "center" }}>
                                {Math.round(zoom * 100)}%
                            </Typography>
                        </Box>
                        <Box sx={{ width: 1, bgcolor: border }} />
                        <IconButton size="small" onClick={() => setZoom(z => Math.min(4, z + 0.25))}
                            sx={{ borderRadius: 0, color: tSec, "&:hover": { color: accent } }}>
                            <ZoomInIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                    </Stack>
                </Stack>
            </Stack>

            {/* ── main gantt ── */}
            <Paper elevation={0} sx={{
                borderRadius: 2.5, border: `1px solid ${border}`,
                bgcolor: paperBg, overflow: "hidden",
            }}>
                {/* ── time header ── */}
                <Box sx={{ display: "flex", borderBottom: `1px solid ${border}` }}>
                    <Box sx={{ width: LABEL_W, flexShrink: 0, borderRight: `1px solid ${border}`, bgcolor: cardAlt }} />
                    <Box sx={{ flex: 1, overflowX: "hidden" }}>
                        <Box sx={{ width: chartW, minWidth: 600 }}>
                            {/* quarters */}
                            <Box sx={{ position: "relative", height: 28, bgcolor: cardAlt, borderBottom: `1px solid ${border}` }}>
                                {quarters.map((q, i) => (
                                    <Box key={i} sx={{
                                        position: "absolute", left: `${q.pct}%`,
                                        height: "100%", display: "flex", alignItems: "center", pl: 1,
                                    }}>
                                        <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: tPri, whiteSpace: "nowrap" }}>
                                            {q.label}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                            {/* months */}
                            <Box sx={{ position: "relative", height: 24, bgcolor: paperBg }}>
                                {months.map((m, i) => (
                                    <Box key={i} sx={{
                                        position: "absolute", left: `${m.pct}%`,
                                        height: "100%", display: "flex", alignItems: "center", pl: 0.8,
                                    }}>
                                        <Typography sx={{ fontSize: "0.65rem", color: tSec, whiteSpace: "nowrap" }}>
                                            {m.label}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* ── body ── */}
                <Box sx={{ display: "flex" }}>
                    {/* row labels */}
                    <Box sx={{ width: LABEL_W, flexShrink: 0, borderRight: `1px solid ${border}` }}>
                        {rows.map((row, i) => (
                            <Box key={row.id} sx={{
                                height: ROW_H,
                                borderBottom: i < rows.length - 1 ? `1px solid ${border}` : "none",
                                display: "flex", alignItems: "center", px: 1.5, gap: 1,
                            }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: row.color, flexShrink: 0 }} />
                                <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: tPri }}>
                                    {row.label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* chart scroll area */}
                    <Box ref={scrollRef} sx={{
                        flex: 1, overflowX: "auto",
                        "&::-webkit-scrollbar": { height: 4 },
                        "&::-webkit-scrollbar-thumb": { bgcolor: border, borderRadius: 2 },
                    }}>
                        <Box sx={{ width: chartW, minWidth: 600, position: "relative" }}>

                            {/* grid lines */}
                            {months.map((m, i) => (
                                <Box key={i} sx={{
                                    position: "absolute",
                                    left: `${m.pct}%`, top: 0, bottom: 0,
                                    width: 1, bgcolor: gridCol, pointerEvents: "none",
                                }} />
                            ))}

                            {/* today line */}
                            <Box sx={{
                                position: "absolute",
                                left: `${todayPct}%`, top: 0, bottom: 0,
                                width: 2, bgcolor: accent, zIndex: 10, pointerEvents: "none",
                            }}>
                                <Box sx={{
                                    position: "absolute", top: -20, left: "50%",
                                    transform: "translateX(-50%)",
                                    bgcolor: accent, borderRadius: 1,
                                    px: 0.8, py: 0.2, whiteSpace: "nowrap",
                                }}>
                                    <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#fff" }}>
                                        Today
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    position: "absolute", top: 0,
                                    left: "50%", transform: "translateX(-50%) rotate(45deg)",
                                    width: 8, height: 8, bgcolor: accent,
                                }} />
                            </Box>

                            {/* rows */}
                            {rows.map((row, i) => (
                                <Box key={row.id} sx={{
                                    height: ROW_H, position: "relative",
                                    borderBottom: i < rows.length - 1 ? `1px solid ${border}` : "none",
                                    display: "flex", alignItems: "center",
                                    "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.01)" },
                                }}>
                                    {/* bars */}
                                    {row.bars.map(bar => {
                                        const isHovered = hoveredBar === bar.id;
                                        return (
                                            <Tooltip key={bar.id}
                                                title={
                                                    <Box>
                                                        <Typography fontSize="0.78rem" fontWeight={700}>{bar.label}</Typography>
                                                        <Typography fontSize="0.72rem">
                                                            {fmtDate(bar.start)} → {fmtDate(bar.end)}
                                                        </Typography>
                                                    </Box>
                                                }
                                                placement="top"
                                            >
                                                <Box
                                                    onMouseEnter={() => setHoveredBar(bar.id)}
                                                    onMouseLeave={() => setHoveredBar(null)}
                                                    sx={{
                                                        position: "absolute",
                                                        left: `${toPercent(bar.start)}%`,
                                                        width: `${widthPercent(bar.start, bar.end)}%`,
                                                        height: 26,
                                                        bgcolor: bar.color,
                                                        borderRadius: "4px 12px 12px 4px",
                                                        display: "flex", alignItems: "center",
                                                        px: 1, overflow: "hidden",
                                                        cursor: "pointer",
                                                        opacity: isHovered ? 1 : 0.85,
                                                        transform: isHovered ? "scaleY(1.08)" : "scaleY(1)",
                                                        transition: "all 0.15s ease",
                                                        boxShadow: isHovered ? `0 2px 8px ${bar.color}60` : "none",
                                                        zIndex: isHovered ? 5 : 1,
                                                    }}
                                                >
                                                    <Typography sx={{
                                                        fontSize: "0.65rem", fontWeight: 600,
                                                        color: "#fff", whiteSpace: "nowrap",
                                                        overflow: "hidden", textOverflow: "ellipsis",
                                                    }}>
                                                        {bar.label}
                                                    </Typography>
                                                </Box>
                                            </Tooltip>
                                        );
                                    })}

                                    {/* milestones */}
                                    {row.milestones.map(ms => (
                                        <Tooltip key={ms.id}
                                            title={
                                                <Box>
                                                    <Typography fontSize="0.78rem" fontWeight={700}>🏁 {ms.label}</Typography>
                                                    <Typography fontSize="0.72rem">{fmtDateLong(ms.date)}</Typography>
                                                </Box>
                                            }
                                            placement="top"
                                        >
                                            <Box sx={{
                                                position: "absolute",
                                                left: `${toPercent(ms.date)}%`,
                                                transform: "translateX(-50%)",
                                                display: "flex", flexDirection: "column",
                                                alignItems: "center", zIndex: 6, cursor: "pointer",
                                            }}>
                                                <Box sx={{
                                                    width: 14, height: 14,
                                                    bgcolor: ms.color ?? row.color,
                                                    transform: "rotate(45deg)",
                                                    borderRadius: "2px",
                                                    border: `2px solid ${paperBg}`,
                                                    boxShadow: `0 0 0 1.5px ${ms.color ?? row.color}`,
                                                }} />
                                                <Typography sx={{
                                                    fontSize: "0.6rem", fontWeight: 700,
                                                    color: ms.color ?? row.color,
                                                    mt: 0.5, whiteSpace: "nowrap",
                                                    textShadow: isDark
                                                        ? "0 0 8px rgba(0,0,0,0.8)"
                                                        : "0 0 4px rgba(255,255,255,0.9)",
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

            {/* ── legend ── */}
            <Stack direction="row" flexWrap="wrap" gap={1.5} mt={2}>
                {rows.map(row => (
                    <Stack key={row.id} direction="row" alignItems="center" gap={0.8}>
                        <Box sx={{ width: 24, height: 8, borderRadius: "2px 6px 6px 2px", bgcolor: row.color }} />
                        <Typography sx={{ fontSize: "0.74rem", color: tSec }}>{row.label}</Typography>
                    </Stack>
                ))}
                <Stack direction="row" alignItems="center" gap={0.8}>
                    <Box sx={{ width: 10, height: 10, bgcolor: accent, transform: "rotate(45deg)", borderRadius: "1px" }} />
                    <Typography sx={{ fontSize: "0.74rem", color: tSec }}>Milestone</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap={0.8}>
                    <Box sx={{ width: 2, height: 14, bgcolor: accent }} />
                    <Typography sx={{ fontSize: "0.74rem", color: tSec }}>Today</Typography>
                </Stack>
            </Stack>
        </Box>
    );
}