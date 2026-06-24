// src/components/common/supervisor/Groups/SupervisorKanbanModal.jsx
// Read-only Kanban — mirrors student KanbanBoard.jsx
// Uses /api/Kanban/supervisor-board/{teamId}/phase1 or /phase2

import { useEffect, useState, useCallback, forwardRef } from "react";
import {
    Dialog, Box, Typography, Stack, Chip, Avatar, AvatarGroup,
    Tooltip, CircularProgress, Alert, IconButton, LinearProgress,
    Slide,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon                 from "@mui/icons-material/Close";
import DashboardOutlinedIcon     from "@mui/icons-material/DashboardOutlined";
import LockOutlinedIcon          from "@mui/icons-material/LockOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import KeyboardArrowUpIcon       from "@mui/icons-material/KeyboardArrowUp";
import RemoveIcon                from "@mui/icons-material/Remove";
import KeyboardArrowDownIcon     from "@mui/icons-material/KeyboardArrowDown";
import AttachFileOutlinedIcon    from "@mui/icons-material/AttachFileOutlined";
import CommentOutlinedIcon       from "@mui/icons-material/CommentOutlined";

import axiosInstance from "../../../../api/axiosInstance";

/* ── constants ── */
const COL_ORDER = ["todo", "inProgress", "done"];

const COL_META = {
    todo:       { label: "To Do",       color: "#5B8AF0" },
    inProgress: { label: "In Progress", color: "#E5973D" },
    done:       { label: "Done",        color: "#3DB97A" },
};

const PRIORITY = {
    high:   { color: "#E05C5C", bg: "rgba(224,92,92,0.12)",   Icon: KeyboardArrowUpIcon,   label: "High"   },
    medium: { color: "#E5973D", bg: "rgba(229,151,61,0.12)",  Icon: RemoveIcon,             label: "Medium" },
    low:    { color: "#8A8F9E", bg: "rgba(138,143,158,0.12)", Icon: KeyboardArrowDownIcon,  label: "Low"    },
};

const MBR_CLR = ["#5B8AF0", "#3DB97A", "#E5973D", "#9B6DE0", "#E05C5C", "#1ABCB0"];

const getMemberName = (u) => (u?.fullName ?? u?.name ?? u?.userName ?? "?").trim();
const getInitial    = (u) => getMemberName(u).charAt(0).toUpperCase();

const formatDeadline = (iso) => {
    if (!iso) return null;
    const d    = new Date(iso);
    const diff = Math.ceil((d - new Date()) / 86400000);
    if (diff === 0)  return "Today";
    if (diff === 1)  return "Tomorrow";
    if (diff < 0)    return "Overdue";
    if (diff <= 6)   return `${diff}d`;
    return d.toLocaleDateString();
};

/* ── fetch by phase ── */
const fetchPhaseBoard = (teamId, phase) =>
    axiosInstance.get(`/Kanban/supervisor-board/${teamId}/phase${phase}`);

/* ── normalise ── */
const S2C = {
    "To Do": "todo", "Todo": "todo", "todo": "todo",
    "In Progress": "inProgress", "InProgress": "inProgress", "inProgress": "inProgress",
    "Done": "done", "done": "done",
};

const mapTask = (task) => {
    const members = task.assignedMembers ?? task.assignedUsers ?? task.assignees ?? [];
    return {
        id:            String(task.id ?? task.taskId ?? Math.random()),
        title:         task.title ?? "Untitled",
        description:   task.description ?? "",
        due:           task.deadline ? formatDeadline(task.deadline) : null,
        assignedUsers: members,
        isAssigned:    members.length > 0,
        comments:      (task.comments ?? []).length,
        files:         (task.files    ?? []).length,
        priority:      task.priority  ?? "medium",
    };
};

const normaliseBoard = (data) => {
    const board = { todo: [], inProgress: [], done: [] };
    if (!data) return board;
    if (Array.isArray(data.columns)) {
        data.columns.forEach((col) => {
            const key = S2C[col.name] ?? S2C[col.name?.replace(/\s/g, "")];
            if (key) board[key] = (col.tasks ?? []).map(mapTask);
        });
        return board;
    }
    if (data.toDo !== undefined || data.inProgress !== undefined || data.done !== undefined) {
        board.todo       = (data.toDo       ?? []).map(mapTask);
        board.inProgress = (data.inProgress ?? []).map(mapTask);
        board.done       = (data.done       ?? []).map(mapTask);
        return board;
    }
    (Array.isArray(data) ? data : data?.tasks ?? []).forEach((t) => {
        const col = S2C[t.status] ?? "todo";
        board[col].push(mapTask(t));
    });
    return board;
};

const SlideUp = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

/* ── Task Card ── */
function TaskCard({ task, colId, isDark, surfaceCard, border, textPri, textSec, textMut }) {
    const c = COL_META[colId];
    const p = PRIORITY[task.priority] ?? PRIORITY.medium;
    const PIcon = p.Icon;

    return (
        <Box sx={{
            p: "10px 12px 10px 16px", borderRadius: "8px", position: "relative", overflow: "hidden",
            border: `1px solid ${border}`, bgcolor: surfaceCard,
            boxShadow: isDark ? "0 1px 3px rgba(0,0,0,0.25)" : "0 1px 3px rgba(0,0,0,0.06)",
            "&:hover": {
                boxShadow: isDark
                    ? `0 4px 14px rgba(0,0,0,0.4), 0 0 0 1px ${c.color}30`
                    : `0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px ${c.color}30`,
            },
        }}>
            <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, bgcolor: c.color, borderRadius: "3px 0 0 3px" }} />

            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.5} pl={0.5}>
                <Typography sx={{ fontSize: "0.83rem", fontWeight: 600, color: textPri, lineHeight: 1.4, flex: 1, pr: 0.5 }}>
                    {task.title}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, px: 0.6, py: 0.2, borderRadius: "4px", bgcolor: p.bg, flexShrink: 0 }}>
                    <PIcon sx={{ fontSize: 10, color: p.color }} />
                    <Typography sx={{ fontSize: "0.59rem", fontWeight: 700, color: p.color, lineHeight: 1 }}>{p.label}</Typography>
                </Box>
            </Stack>

            {task.description && (
                <Typography sx={{ fontSize: "0.72rem", color: textSec, pl: 0.5, mb: 0.7, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {task.description}
                </Typography>
            )}

            {task.due && (
                <Stack direction="row" alignItems="center" gap={0.4} mb={0.8} pl={0.5}>
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 10, color: task.due === "Overdue" ? "#E05C5C" : ["Today", "Tomorrow"].includes(task.due) ? "#E5973D" : textMut }} />
                    <Typography sx={{ fontSize: "0.67rem", fontWeight: 600, color: task.due === "Overdue" ? "#E05C5C" : ["Today", "Tomorrow"].includes(task.due) ? "#E5973D" : textSec }}>
                        {task.due}
                    </Typography>
                </Stack>
            )}

            <Stack direction="row" alignItems="center" justifyContent="space-between" pl={0.5}>
                <Stack direction="row" alignItems="center" gap={0.7}>
                    <Tooltip title={task.isAssigned ? `${task.assignedUsers.length} assignee(s)` : "Unassigned"}>
                        <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: task.isAssigned ? "#3DB97A" : "transparent", border: task.isAssigned ? "none" : `1.5px solid ${textMut}`, boxShadow: task.isAssigned ? "0 0 5px rgba(61,185,122,0.55)" : "none" }} />
                    </Tooltip>
                    {task.isAssigned ? (
                        <AvatarGroup max={3} sx={{ "& .MuiAvatar-root": { width: 20, height: 20, fontSize: "0.52rem", fontWeight: 800, border: `1.5px solid ${surfaceCard}` } }}>
                            {task.assignedUsers.map((u, j) => (
                                <Tooltip key={j} title={getMemberName(u)}>
                                    <Avatar sx={{ bgcolor: MBR_CLR[j % MBR_CLR.length] }}>{getInitial(u)}</Avatar>
                                </Tooltip>
                            ))}
                        </AvatarGroup>
                    ) : (
                        <Typography sx={{ fontSize: "0.61rem", color: textMut, fontStyle: "italic" }}>Unassigned</Typography>
                    )}
                </Stack>
                <Stack direction="row" gap={1}>
                    {task.files > 0 && (
                        <Stack direction="row" alignItems="center" gap={0.3}>
                            <AttachFileOutlinedIcon sx={{ fontSize: 10, color: textMut }} />
                            <Typography sx={{ fontSize: "0.62rem", color: textMut }}>{task.files}</Typography>
                        </Stack>
                    )}
                    {task.comments > 0 && (
                        <Stack direction="row" alignItems="center" gap={0.3}>
                            <CommentOutlinedIcon sx={{ fontSize: 10, color: textMut }} />
                            <Typography sx={{ fontSize: "0.62rem", color: textMut }}>{task.comments}</Typography>
                        </Stack>
                    )}
                </Stack>
            </Stack>
        </Box>
    );
}

/* ── Column ── */
function KanbanColumn({ colId, tasks, isDark, surfaceCol, surfaceCard, border, textPri, textSec, textMut }) {
    const c = COL_META[colId];
    return (
        <Box sx={{ flex: 1, minWidth: 240, display: "flex", flexDirection: "column", borderRadius: "10px", border: `1px solid ${border}`, bgcolor: surfaceCol, overflow: "hidden" }}>
            <Box sx={{ px: 1.5, py: 1.2, bgcolor: isDark ? `${c.color}10` : `${c.color}0d`, borderBottom: `1px solid ${border}` }}>
                <Stack direction="row" alignItems="center" gap={0.9}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: c.color, boxShadow: `0 0 7px ${c.color}99` }} />
                    <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", color: textPri, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                        {c.label}
                    </Typography>
                    <Box sx={{ px: 0.65, py: 0.1, borderRadius: "4px", bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }}>
                        <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: textSec }}>{tasks.length}</Typography>
                    </Box>
                </Stack>
            </Box>
            <Box sx={{ px: 1, py: 1, flex: 1, overflowY: "auto", minHeight: 100, "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)", borderRadius: 2 } }}>
                <Stack spacing={0.75}>
                    {tasks.length === 0 ? (
                        <Box sx={{ height: 64, borderRadius: "7px", mt: 0.5, border: `1.5px dashed ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography sx={{ fontSize: "0.7rem", color: textMut }}>No tasks</Typography>
                        </Box>
                    ) : (
                        tasks.map((task) => (
                            <TaskCard key={task.id} task={task} colId={colId} isDark={isDark} surfaceCard={surfaceCard} border={border} textPri={textPri} textSec={textSec} textMut={textMut} />
                        ))
                    )}
                </Stack>
            </Box>
        </Box>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════ */
export default function SupervisorKanbanModal({ open, team, phase, onClose }) {
    const theme  = useTheme();
    const isDark = theme.palette.mode === "dark";

    const surfaceCard = isDark ? "#22262b" : "#ffffff";
    const surfaceCol  = isDark ? "#1e2226" : "#f0f1f4";
    const border      = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)";
    const textPri     = isDark ? "#e2e5eb" : "#172b4d";
    const textSec     = isDark ? "#8d9199" : "#5e6c84";
    const textMut     = isDark ? "#555b67" : "#aab0be";
    const dialogBg    = isDark ? "#252930" : "#ffffff";

    const [board,   setBoard]   = useState({ todo: [], inProgress: [], done: [] });
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);

    const fetchBoard = useCallback(async (teamId, ph) => {
        if (!teamId || !ph) return;
        setLoading(true); setError(null);
        try {
            const res  = await fetchPhaseBoard(teamId, ph);
            const data = res?.data ?? res;
            setBoard(normaliseBoard(data));
        } catch (err) {
            setError(err?.response?.data?.message ?? err?.message ?? "Failed to load board.");
        } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        if (open && team?.id && phase) {
            fetchBoard(team.id, phase);
        } else if (!open) {
            setBoard({ todo: [], inProgress: [], done: [] });
            setError(null);
        }
    }, [open, team?.id, phase, fetchBoard]);

    const total  = Object.values(board).flat().length;
    const doneN  = board.done.length;
    const pct    = total > 0 ? Math.round((doneN / total) * 100) : 0;
    const allTasks = Object.values(board).flat();

    const phaseColor = phase === 1 ? "#5B8AF0" : "#A85B6D";
    const phaseLabel = phase === 1 ? "Phase 1" : "Phase 2";

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            TransitionComponent={SlideUp}
            PaperProps={{
                sx: {
                    borderRadius: "12px",
                    border: `1px solid ${border}`,
                    bgcolor: dialogBg,
                    backgroundImage: "none",
                    maxHeight: "85vh",
                    display: "flex",
                    flexDirection: "column",
                },
            }}
        >
            {/* Phase color bar */}
            <Box sx={{ height: 3, bgcolor: phaseColor }} />

            {/* Header */}
            <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" gap={1.5}>
                        <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: `${phaseColor}15`, border: `1px solid ${phaseColor}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <DashboardOutlinedIcon sx={{ fontSize: 19, color: phaseColor }} />
                        </Box>
                        <Box>
                            <Stack direction="row" alignItems="center" gap={1}>
                                <Typography fontWeight={700} fontSize="1rem" sx={{ color: textPri }}>
                                    {team?.projectTitle ?? team?.name ?? "Team Board"}
                                </Typography>
                                <Chip label={phaseLabel} size="small" sx={{ height: 18, fontSize: "0.6rem", fontWeight: 700, bgcolor: `${phaseColor}15`, color: phaseColor, "& .MuiChip-label": { px: 0.7 } }} />
                                <Chip icon={<LockOutlinedIcon sx={{ fontSize: "11px !important" }} />} label="Read-only" size="small" sx={{ height: 18, fontSize: "0.6rem", fontWeight: 600, bgcolor: "rgba(148,163,184,0.12)", color: textSec, "& .MuiChip-label": { px: 0.7 } }} />
                            </Stack>
                            <Typography fontSize="0.73rem" sx={{ color: textSec, mt: 0.15 }}>
                                {total} task{total !== 1 ? "s" : ""}
                                {" · "}
                                {COL_ORDER.map((c) => `${COL_META[c].label}: ${board[c]?.length ?? 0}`).join("  ·  ")}
                            </Typography>
                        </Box>
                    </Stack>
                    <IconButton size="small" onClick={onClose} sx={{ color: textSec }}>
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Stack>
            </Box>

            {/* Progress */}
            <Box sx={{ px: 3, py: 1.5, borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
                    <Stack direction="row" alignItems="center" gap={2}>
                        <Typography sx={{ color: textSec, fontSize: "0.74rem" }}>{doneN} of {total} completed</Typography>
                        <Stack direction="row" alignItems="center" gap={0.4}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#3DB97A", boxShadow: "0 0 5px rgba(61,185,122,0.55)" }} />
                            <Typography sx={{ fontSize: "0.7rem", color: textSec }}>{allTasks.filter(t => t.isAssigned).length} assigned</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" gap={0.4}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", border: `1.5px solid ${textMut}` }} />
                            <Typography sx={{ fontSize: "0.7rem", color: textSec }}>{allTasks.filter(t => !t.isAssigned).length} unassigned</Typography>
                        </Stack>
                    </Stack>
                    <Typography sx={{ fontSize: "0.72rem", color: "#3DB97A", fontWeight: 800 }}>{pct}%</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={pct} sx={{ height: 5, borderRadius: 3, bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)", "& .MuiLinearProgress-bar": { bgcolor: "#3DB97A", borderRadius: 3 } }} />
            </Box>

            {/* Board */}
            <Box sx={{ flex: 1, overflow: "auto", p: 2.5 }}>
                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
                        <CircularProgress sx={{ color: phaseColor }} />
                    </Box>
                )}
                {!loading && error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
                {!loading && !error && (
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "flex-start", minHeight: 280 }}>
                        {COL_ORDER.map((colId) => (
                            <KanbanColumn
                                key={colId}
                                colId={colId}
                                tasks={board[colId] ?? []}
                                isDark={isDark}
                                surfaceCol={surfaceCol}
                                surfaceCard={surfaceCard}
                                border={border}
                                textPri={textPri}
                                textSec={textSec}
                                textMut={textMut}
                            />
                        ))}
                    </Stack>
                )}
            </Box>

            {/* Footer */}
            <Box sx={{ px: 3, py: 1.5, borderTop: `1px solid ${border}`, flexShrink: 0 }}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <LockOutlinedIcon sx={{ fontSize: 13, color: textSec, opacity: 0.5 }} />
                    <Typography fontSize="0.71rem" sx={{ color: textSec, opacity: 0.6 }}>
                        Read-only view — only team members can manage tasks.
                    </Typography>
                </Stack>
            </Box>
        </Dialog>
    );
}