import { useState, useRef, useEffect } from "react";
import {
    Box, Typography, Stack, Paper, Tooltip,
    IconButton, Button, Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import TodayIcon from "@mui/icons-material/Today";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import FlagIcon from "@mui/icons-material/Flag";

/* ── project data ────────────────────────────────────────────── */
const PROJECT_START = new Date("2025-01-01");
const PROJECT_END = new Date("2025-09-30");
const TODAY = new Date("2025-04-28");

const PHASES = [
    { id: "p1", label: "Phase 1 — Kickoff & Planning", start: "2025-01-01", end: "2025-02-28", color: "#4F8EF7" },
    { id: "p2", label: "Phase 2 — Design & Architecture", start: "2025-03-01", end: "2025-04-30", color: "#d0895b" },
    { id: "p3", label: "Phase 3 — Development", start: "2025-05-01", end: "2025-07-31", color: "#3DB97A" },
    { id: "p4", label: "Phase 4 — Testing & Delivery", start: "2025-08-01", end: "2025-09-30", color: "#9B7EC8" },
];

const ROWS = [
    {
        id: "r1", label: "Planning", color: "#4F8EF7",
        bars: [
            { id: "b1", label: "Requirements gathering", start: "2025-01-05", end: "2025-01-25", color: "#4F8EF7" },
            { id: "b2", label: "Supervisor approval", start: "2025-01-28", end: "2025-02-10", color: "#7EB2F7" },
            { id: "b3", label: "Project proposal", start: "2025-02-12", end: "2025-02-28", color: "#4F8EF7" },
        ],
        milestones: [
            { id: "ms1", label: "Kickoff", date: "2025-02-01", color: "#4F8EF7" },
        ],
    },
    {
        id: "r2", label: "Design", color: "#d0895b",
        bars: [
            { id: "b4", label: "System architecture", start: "2025-03-01", end: "2025-03-20", color: "#d0895b" },
            { id: "b5", label: "Database schema", start: "2025-03-15", end: "2025-04-05", color: "#e0a87a" },
            { id: "b6", label: "UI mockups", start: "2025-03-25", end: "2025-04-20", color: "#d0895b" },
        ],
        milestones: [
            { id: "ms2", label: "Design review", date: "2025-04-20", color: "#d0895b" },
        ],
    },
    {
        id: "r3", label: "Backend", color: "#3DB97A",
        bars: [
            { id: "b7", label: "Auth & user module", start: "2025-05-01", end: "2025-05-25", color: "#3DB97A" },
            { id: "b8", label: "API development", start: "2025-05-20", end: "2025-06-30", color: "#5DC98A" },
            { id: "b9", label: "Database integration", start: "2025-06-15", end: "2025-07-15", color: "#3DB97A" },
        ],
        milestones: [
            { id: "ms3", label: "API complete", date: "2025-06-30", color: "#3DB97A" },
        ],
    },
    {
        id: "r4", label: "Frontend", color: "#C49A6C",
        bars: [
            { id: "b10", label: "Student dashboard", start: "2025-05-10", end: "2025-06-10", color: "#C49A6C" },
            { id: "b11", label: "Kanban & Timeline", start: "2025-06-05", end: "2025-07-05", color: "#d4aa80" },
            { id: "b12", label: "Supervisor portal", start: "2025-07-01", end: "2025-07-31", color: "#C49A6C" },
        ],
        milestones: [
            { id: "ms4", label: "UI complete", date: "2025-07-31", color: "#C49A6C" },
        ],
    },
    {
        id: "r5", label: "Testing", color: "#9B7EC8",
        bars: [
            { id: "b13", label: "Unit testing", start: "2025-08-01", end: "2025-08-20", color: "#9B7EC8" },
            { id: "b14", label: "Integration testing", start: "2025-08-15", end: "2025-09-05", color: "#b49ad8" },
            { id: "b15", label: "Bug fixes & polish", start: "2025-09-01", end: "2025-09-20", color: "#9B7EC8" },
        ],
        milestones: [
            { id: "ms5", label: "Final delivery", date: "2025-09-25", color: "#EF4444" },
        ],
    },
];

/* ── helpers ─────────────────────────────────────────────────── */
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
const totalDays = daysBetween(PROJECT_START, PROJECT_END);

const toPercent = (date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return Math.max(0, Math.min(100, (daysBetween(PROJECT_START, d) / totalDays) * 100));
};

const widthPercent = (start, end) => {
    const s = Math.max(0, toPercent(start));
    const e = Math.min(100, toPercent(end));
    return Math.max(0.5, e - s);
};

/* generate month/quarter header */
const getMonths = () => {
    const months = [];
    const d = new Date(PROJECT_START);
    while (d <= PROJECT_END) {
        months.push({
            label: d.toLocaleDateString("en-US", { month: "short" }),
            year: d.getFullYear(),
            pct: toPercent(new Date(d)),
        });
        d.setMonth(d.getMonth() + 1);
    }
    return months;
};

const getQuarters = () => {
    const quarters = [];
    const d = new Date(PROJECT_START);
    while (d <= PROJECT_END) {
        const q = Math.ceil((d.getMonth() + 1) / 3);
        const label = `Q${q} ${d.getFullYear()}`;
        const pct = toPercent(new Date(d));
        if (!quarters.length || quarters[quarters.length - 1].label !== label) {
            quarters.push({ label, pct });
        }
        d.setMonth(d.getMonth() + 1);
    }
    return quarters;
};

const MONTHS = getMonths();
const QUARTERS = getQuarters();
const TODAY_PCT = toPercent(TODAY);

/* ── main ────────────────────────────────────────────────────── */
export default function ProjectTimeline() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const [hoveredBar, setHoveredBar] = useState(null);
    const [zoom, setZoom] = useState(1);       // 1 = normal, 1.5 = zoomed in
    const scrollRef = useRef(null);

    const accent = "#d0895b";
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const gridCol = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const paperBg = theme.palette.background.paper;
    const cardAlt = isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.015)";

    const ROW_H = 52;
    const LABEL_W = 130;
    const chartW = `${100 * zoom}%`;

    /* scroll to today on mount */
    useEffect(() => {
        if (scrollRef.current) {
            const pct = TODAY_PCT / 100;
            scrollRef.current.scrollLeft =
                (scrollRef.current.scrollWidth * pct) - (scrollRef.current.clientWidth / 2);
        }
    }, []);

    return (
        <Box sx={{ maxWidth: "100%", pb: 4 }}>

            {/* ── header ── */}
            <Stack direction="row" justifyContent="space-between"
                alignItems="flex-start" mb={3}>
                <Box>
                    <Typography variant="h2" sx={{ color: tPri, mb: 0.4 }}>Timeline</Typography>
                    <Typography sx={{ color: tSec, fontSize: "0.85rem" }}>
                        EcoTrackers · Jan 2025 — Sep 2025
                    </Typography>
                </Box>

                <Stack direction="row" gap={1} alignItems="center">
                    {/* today chip */}
                    <Chip
                        icon={<TodayIcon sx={{ fontSize: "14px !important", color: `${accent} !important` }} />}
                        label={TODAY.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        size="small"
                        sx={{
                            bgcolor: isDark ? "rgba(208,137,91,0.12)" : "rgba(208,137,91,0.08)",
                            color: accent, fontWeight: 700, fontSize: "0.75rem",
                            border: `1px solid rgba(208,137,91,0.25)`,
                        }}
                    />
                    {/* zoom */}
                    <Stack direction="row" sx={{
                        border: `1px solid ${border}`, borderRadius: 1.5, overflow: "hidden",
                    }}>
                        <IconButton size="small" onClick={() => setZoom(z => Math.max(1, z - 0.25))}
                            sx={{ borderRadius: 0, color: tSec, "&:hover": { color: accent } }}>
                            <ZoomOutIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                        <Box sx={{ width: 1, bgcolor: border }} />
                        <IconButton size="small" onClick={() => setZoom(z => Math.min(3, z + 0.25))}
                            sx={{ borderRadius: 0, color: tSec, "&:hover": { color: accent } }}>
                            <ZoomInIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                    </Stack>
                </Stack>
            </Stack>

            {/* ── phases bar ── */}
            <Paper elevation={0} sx={{
                mb: 1.5, borderRadius: 2, border: `1px solid ${border}`,
                bgcolor: cardAlt, overflow: "hidden",
            }}>
                <Box sx={{ display: "flex", overflow: "hidden" }}>
                    {/* label spacer */}
                    <Box sx={{
                        width: LABEL_W, flexShrink: 0,
                        borderRight: `1px solid ${border}`,
                        px: 1.5, py: 1, display: "flex", alignItems: "center"
                    }}>
                        <Typography sx={{
                            fontSize: "0.68rem", fontWeight: 700,
                            letterSpacing: "0.07em", textTransform: "uppercase", color: tSec
                        }}>
                            Phases
                        </Typography>
                    </Box>
                    {/* phases chart */}
                    <Box ref={scrollRef} sx={{
                        flex: 1, overflowX: "auto",
                        "&::-webkit-scrollbar": { height: 4 },
                        "&::-webkit-scrollbar-thumb": { bgcolor: border, borderRadius: 2 },
                    }}>
                        <Box sx={{ width: chartW, position: "relative", height: 36, minWidth: 600 }}>
                            {PHASES.map(ph => (
                                <Tooltip key={ph.id} title={ph.label} placement="top">
                                    <Box sx={{
                                        position: "absolute",
                                        left: `${toPercent(ph.start)}%`,
                                        width: `${widthPercent(ph.start, ph.end)}%`,
                                        top: 4, height: 28,
                                        bgcolor: ph.color,
                                        borderRadius: 1.5,
                                        display: "flex", alignItems: "center",
                                        px: 1.2, overflow: "hidden",
                                        cursor: "default",
                                        opacity: 0.9,
                                        "&:hover": { opacity: 1 },
                                    }}>
                                        <Typography sx={{
                                            fontSize: "0.65rem", fontWeight: 700,
                                            color: "#fff", whiteSpace: "nowrap",
                                            overflow: "hidden", textOverflow: "ellipsis",
                                        }}>
                                            {ph.label}
                                        </Typography>
                                    </Box>
                                </Tooltip>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Paper>

            {/* ── main gantt ── */}
            <Paper elevation={0} sx={{
                borderRadius: 2.5, border: `1px solid ${border}`,
                bgcolor: paperBg, overflow: "hidden",
            }}>
                {/* ── header: quarters + months ── */}
                <Box sx={{ display: "flex", borderBottom: `1px solid ${border}` }}>
                    <Box sx={{
                        width: LABEL_W, flexShrink: 0,
                        borderRight: `1px solid ${border}`, bgcolor: cardAlt
                    }} />
                    <Box sx={{ flex: 1, overflowX: "hidden" }}>
                        <Box sx={{ width: chartW, minWidth: 600 }}>
                            {/* quarters row */}
                            <Box sx={{
                                position: "relative", height: 28, bgcolor: cardAlt,
                                borderBottom: `1px solid ${border}`
                            }}>
                                {QUARTERS.map((q, i) => (
                                    <Box key={i} sx={{
                                        position: "absolute", left: `${q.pct}%`,
                                        height: "100%", display: "flex", alignItems: "center",
                                        pl: 1,
                                    }}>
                                        <Typography sx={{
                                            fontSize: "0.7rem", fontWeight: 700,
                                            color: tPri, whiteSpace: "nowrap"
                                        }}>
                                            {q.label}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                            {/* months row */}
                            <Box sx={{ position: "relative", height: 24, bgcolor: paperBg }}>
                                {MONTHS.map((m, i) => (
                                    <Box key={i} sx={{
                                        position: "absolute", left: `${m.pct}%`,
                                        height: "100%", display: "flex", alignItems: "center",
                                        pl: 0.8,
                                    }}>
                                        <Typography sx={{
                                            fontSize: "0.65rem",
                                            color: tSec, whiteSpace: "nowrap"
                                        }}>
                                            {m.label}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* ── rows ── */}
                <Box sx={{ display: "flex" }}>
                    {/* row labels */}
                    <Box sx={{
                        width: LABEL_W, flexShrink: 0,
                        borderRight: `1px solid ${border}`
                    }}>
                        {ROWS.map((row, i) => (
                            <Box key={row.id} sx={{
                                height: ROW_H,
                                borderBottom: i < ROWS.length - 1 ? `1px solid ${border}` : "none",
                                display: "flex", alignItems: "center",
                                px: 1.5, gap: 1,
                            }}>
                                <Box sx={{
                                    width: 8, height: 8, borderRadius: 1,
                                    bgcolor: row.color, flexShrink: 0,
                                }} />
                                <Typography sx={{
                                    fontSize: "0.78rem", fontWeight: 600,
                                    color: tPri,
                                }}>
                                    {row.label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* chart area */}
                    <Box sx={{
                        flex: 1, overflowX: "auto",
                        "&::-webkit-scrollbar": { height: 4 },
                        "&::-webkit-scrollbar-thumb": { bgcolor: border, borderRadius: 2 },
                    }}>
                        <Box sx={{ width: chartW, minWidth: 600, position: "relative" }}>

                            {/* vertical grid lines (months) */}
                            {MONTHS.map((m, i) => (
                                <Box key={i} sx={{
                                    position: "absolute",
                                    left: `${m.pct}%`, top: 0, bottom: 0,
                                    width: 1, bgcolor: gridCol,
                                    pointerEvents: "none",
                                }} />
                            ))}

                            {/* TODAY line */}
                            <Box sx={{
                                position: "absolute",
                                left: `${TODAY_PCT}%`, top: 0, bottom: 0,
                                width: 2, bgcolor: accent, zIndex: 10,
                                pointerEvents: "none",
                            }}>
                                {/* today label */}
                                <Box sx={{
                                    position: "absolute", top: -20, left: "50%",
                                    transform: "translateX(-50%)",
                                    bgcolor: accent, borderRadius: 1,
                                    px: 0.8, py: 0.2, whiteSpace: "nowrap",
                                }}>
                                    <Typography sx={{
                                        fontSize: "0.6rem",
                                        fontWeight: 700, color: "#fff"
                                    }}>
                                        Today
                                    </Typography>
                                </Box>
                                {/* diamond */}
                                <Box sx={{
                                    position: "absolute", top: 0,
                                    left: "50%", transform: "translateX(-50%) rotate(45deg)",
                                    width: 8, height: 8, bgcolor: accent,
                                }} />
                            </Box>

                            {/* rows */}
                            {ROWS.map((row, i) => (
                                <Box key={row.id} sx={{
                                    height: ROW_H, position: "relative",
                                    borderBottom: i < ROWS.length - 1 ? `1px solid ${border}` : "none",
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
                                                        <Typography fontSize="0.78rem" fontWeight={700}>
                                                            {bar.label}
                                                        </Typography>
                                                        <Typography fontSize="0.72rem">
                                                            {new Date(bar.start).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                            {" → "}
                                                            {new Date(bar.end).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
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
                                                        boxShadow: isHovered
                                                            ? `0 2px 8px ${bar.color}60`
                                                            : "none",
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
                                                    <Typography fontSize="0.78rem" fontWeight={700}>
                                                        🏁 {ms.label}
                                                    </Typography>
                                                    <Typography fontSize="0.72rem">
                                                        {new Date(ms.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                                    </Typography>
                                                </Box>
                                            }
                                            placement="top"
                                        >
                                            <Box sx={{
                                                position: "absolute",
                                                left: `${toPercent(ms.date)}%`,
                                                transform: "translateX(-50%)",
                                                display: "flex", flexDirection: "column",
                                                alignItems: "center", zIndex: 6,
                                                cursor: "pointer",
                                            }}>
                                                {/* diamond shape */}
                                                <Box sx={{
                                                    width: 14, height: 14,
                                                    bgcolor: ms.color,
                                                    transform: "rotate(45deg)",
                                                    borderRadius: "2px",
                                                    border: `2px solid ${paperBg}`,
                                                    boxShadow: `0 0 0 1.5px ${ms.color}`,
                                                }} />
                                                <Typography sx={{
                                                    fontSize: "0.6rem", fontWeight: 700,
                                                    color: ms.color, mt: 0.5,
                                                    whiteSpace: "nowrap",
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
                {ROWS.map(row => (
                    <Stack key={row.id} direction="row" alignItems="center" gap={0.8}>
                        <Box sx={{
                            width: 24, height: 8, borderRadius: "2px 6px 6px 2px",
                            bgcolor: row.color
                        }} />
                        <Typography sx={{ fontSize: "0.74rem", color: tSec }}>{row.label}</Typography>
                    </Stack>
                ))}
                <Stack direction="row" alignItems="center" gap={0.8}>
                    <Box sx={{
                        width: 10, height: 10, bgcolor: accent,
                        transform: "rotate(45deg)", borderRadius: "1px"
                    }} />
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