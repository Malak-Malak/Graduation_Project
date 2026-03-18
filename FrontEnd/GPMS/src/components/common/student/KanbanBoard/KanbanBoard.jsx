import { useState } from "react";
import {
    Box, Typography, Stack, Paper, Avatar, Button,
    IconButton, Tooltip, Dialog, DialogContent, DialogActions,
    TextField, AvatarGroup, LinearProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import RemoveIcon from "@mui/icons-material/Remove";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import {
    DndContext, pointerWithin, PointerSensor,
    useSensor, useSensors, DragOverlay, useDroppable,
} from "@dnd-kit/core";
import {
    SortableContext, verticalListSortingStrategy,
    useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ── data ─────────────────────────────────────────────────────── */
const COL_ORDER = ["todo", "inProgress", "done"];

const INIT_TASKS = {
    todo: [
        { id: "1", title: "UI Mockups", priority: "medium", due: "2d", assignees: ["M"], comments: 0, files: 1 },
        { id: "2", title: "API Integration", priority: "high", due: "5d", assignees: ["H", "A"], comments: 1, files: 0 },
        { id: "3", title: "Testing Setup", priority: "low", due: "1w", assignees: ["S"], comments: 0, files: 0 },
        { id: "4", title: "Documentation", priority: "medium", due: "1w", assignees: ["H"], comments: 2, files: 0 },
    ],
    inProgress: [
        { id: "5", title: "Database Design", priority: "high", due: "Tomorrow", assignees: ["A", "S"], comments: 3, files: 2 },
        { id: "6", title: "Backend Setup", priority: "medium", due: "3d", assignees: ["M"], comments: 1, files: 1 },
    ],
    done: [
        { id: "7", title: "Project Setup", priority: "low", due: null, assignees: ["A"], comments: 2, files: 1 },
        { id: "8", title: "Team Contract", priority: "low", due: null, assignees: ["A", "H", "M", "S"], comments: 0, files: 1 },
    ],
};

/* column config — خفيف وهادي زي الصورة */
const COL_META = {
    todo: { label: "To Do", color: "#4F8EF7", headerBg: "rgba(79,142,247,0.08)", dot: "#4F8EF7" },
    inProgress: { label: "In Progress", color: "#d0895b", headerBg: "rgba(208,137,91,0.08)", dot: "#d0895b" },
    done: { label: "Done", color: "#3DB97A", headerBg: "rgba(61,185,122,0.08)", dot: "#3DB97A" },
};

/* priority — accessible colors + shapes */
const PRIORITY = {
    high: { color: "#d0895b", bg: "rgba(208,137,91,0.10)", Icon: KeyboardArrowUpIcon, label: "High" },
    medium: { color: "#7E9FC4", bg: "rgba(126,159,196,0.10)", Icon: RemoveIcon, label: "Medium" },
    low: { color: "#888", bg: "rgba(140,140,140,0.08)", Icon: KeyboardArrowDownIcon, label: "Low" },
};

const MBR_CLR = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8"];
const EMPTY_TASK = { title: "", priority: "medium", due: "", assignees: ["A"] };
const isColId = (id) => COL_ORDER.includes(id);

/* ── task card content ───────────────────────────────────────── */
function CardContent({ task, colId, theme }) {
    const textPri = theme.palette.text.primary;
    const textSec = theme.palette.text.secondary;
    const isDark = theme.palette.mode === "dark";
    const p = PRIORITY[task.priority];
    const c = COL_META[colId];
    const PIcon = p.Icon;

    return (
        <>
            {/* thin left accent bar */}
            <Box sx={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: 3, bgcolor: c.color,
                borderRadius: "2px 0 0 2px",
            }} />

            {/* title + priority badge */}
            <Stack direction="row" justifyContent="space-between"
                alignItems="flex-start" mb={1} pl={0.5}>
                <Typography sx={{
                    fontSize: "0.86rem", fontWeight: 600,
                    color: textPri, lineHeight: 1.45, flex: 1, pr: 0.5,
                }}>
                    {task.title}
                </Typography>
                <Box sx={{
                    display: "flex", alignItems: "center", gap: 0.3,
                    px: 0.7, py: 0.2, borderRadius: 1,
                    bgcolor: p.bg, border: `1px solid ${p.color}25`,
                    flexShrink: 0,
                }}>
                    <PIcon sx={{ fontSize: 12, color: p.color }} />
                    <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: p.color }}>
                        {p.label}
                    </Typography>
                </Box>
            </Stack>

            {/* due date */}
            {task.due && (
                <Stack direction="row" alignItems="center" gap={0.5} mb={1} pl={0.5}>
                    <CalendarTodayOutlinedIcon sx={{
                        fontSize: 11,
                        color: task.due === "Tomorrow" ? "#d0895b" : textSec,
                    }} />
                    <Typography sx={{
                        fontSize: "0.72rem",
                        fontWeight: task.due === "Tomorrow" ? 600 : 400,
                        color: task.due === "Tomorrow" ? "#d0895b" : textSec,
                    }}>
                        {task.due}
                    </Typography>
                </Stack>
            )}

            {/* footer: avatars + meta */}
            <Stack direction="row" alignItems="center"
                justifyContent="space-between" pl={0.5}>
                <AvatarGroup max={3} sx={{
                    "& .MuiAvatar-root": {
                        width: 22, height: 22, fontSize: "0.58rem", fontWeight: 700,
                        border: `1.5px solid ${theme.palette.background.paper}`,
                    },
                }}>
                    {task.assignees.map((a, j) => (
                        <Avatar key={j} sx={{ bgcolor: MBR_CLR[j % MBR_CLR.length] }}>{a}</Avatar>
                    ))}
                </AvatarGroup>
                <Stack direction="row" gap={1.2}>
                    {task.files > 0 && (
                        <Stack direction="row" alignItems="center" gap={0.3}>
                            <AttachFileOutlinedIcon sx={{ fontSize: 11, color: textSec }} />
                            <Typography sx={{ fontSize: "0.68rem", color: textSec }}>{task.files}</Typography>
                        </Stack>
                    )}
                    {task.comments > 0 && (
                        <Stack direction="row" alignItems="center" gap={0.3}>
                            <CommentOutlinedIcon sx={{ fontSize: 11, color: textSec }} />
                            <Typography sx={{ fontSize: "0.68rem", color: textSec }}>{task.comments}</Typography>
                        </Stack>
                    )}
                </Stack>
            </Stack>
        </>
    );
}

/* ── sortable card ───────────────────────────────────────────── */
function SortableCard({ task, colId, onClick }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const c = COL_META[colId];
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

    const { attributes, listeners, setNodeRef,
        transform, transition, isDragging } = useSortable({ id: task.id });

    return (
        <Paper
            ref={setNodeRef}
            elevation={0}
            onClick={onClick}
            sx={{
                p: 1.6,
                pl: 2,
                borderRadius: 2,
                position: "relative",
                overflow: "hidden",
                border: `1px solid ${isDragging ? c.color : border}`,
                cursor: "grab",
                opacity: isDragging ? 0.25 : 1,
                bgcolor: theme.palette.background.paper,
                transform: CSS.Transform.toString(transform),
                transition: transition ?? "all 0.15s ease",
                touchAction: "none",
                "&:hover": {
                    borderColor: c.color,
                    boxShadow: isDark
                        ? "0 4px 16px rgba(0,0,0,0.3)"
                        : "0 4px 16px rgba(0,0,0,0.07)",
                    transform: "translateY(-1px)",
                },
            }}
            {...attributes}
            {...listeners}
        >
            <CardContent task={task} colId={colId} theme={theme} />
        </Paper>
    );
}

/* ── drag overlay ────────────────────────────────────────────── */
function OverlayCard({ task, colId }) {
    const theme = useTheme();
    const c = COL_META[colId ?? "todo"];
    return (
        <Paper elevation={3} sx={{
            p: 1.6, pl: 2, borderRadius: 2,
            position: "relative", overflow: "hidden",
            border: `1.5px solid ${c.color}`,
            bgcolor: theme.palette.background.paper,
            cursor: "grabbing", width: 268,
            boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
            transform: "rotate(1deg)",
        }}>
            <CardContent task={task} colId={colId ?? "todo"} theme={theme} />
        </Paper>
    );
}

/* ── droppable column ────────────────────────────────────────── */
function Column({ colId, tasks, onAdd, onCardClick }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const c = COL_META[colId];
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;

    const { setNodeRef, isOver } = useDroppable({ id: colId });

    const colBg = isDark
        ? "rgba(255,255,255,0.025)"
        : "rgba(0,0,0,0.015)";

    const borderCol = isDark
        ? `rgba(255,255,255,${isOver ? 0.12 : 0.06})`
        : `rgba(0,0,0,${isOver ? 0.12 : 0.06})`;

    return (
        <Box sx={{
            flex: 1, minWidth: 268, maxWidth: 340,
            display: "flex", flexDirection: "column",
            borderRadius: 2.5,
            border: `1.5px solid ${isOver ? c.color : borderCol}`,
            bgcolor: isOver
                ? (isDark ? `${c.color}10` : `${c.color}06`)
                : colBg,
            transition: "border-color 0.15s ease, background-color 0.15s ease",
        }}>

            {/* column header — خفيف زي الصورة */}
            <Box sx={{
                px: 2, py: 1.6,
                bgcolor: isDark
                    ? `${c.color}12`
                    : c.headerBg,
                borderRadius: "10px 10px 0 0",
                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
            }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" gap={1}>
                        {/* colored dot */}
                        <Box sx={{
                            width: 8, height: 8, borderRadius: "50%",
                            bgcolor: c.dot,
                        }} />
                        <Typography sx={{
                            fontWeight: 700, fontSize: "0.88rem", color: tPri,
                        }}>
                            {c.label}
                        </Typography>
                        {/* count badge */}
                        <Box sx={{
                            px: 0.9, py: 0.1, borderRadius: 1,
                            bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                        }}>
                            <Typography sx={{
                                fontSize: "0.68rem", fontWeight: 700, color: tSec,
                            }}>
                                {tasks.length}
                            </Typography>
                        </Box>
                    </Stack>
                    <Tooltip title="Add Task">
                        <IconButton size="small" onClick={onAdd} sx={{
                            width: 24, height: 24, color: tSec,
                            "&:hover": { color: c.color, bgcolor: `${c.color}14` },
                        }}>
                            <AddIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>

            {/* tasks area — ref هون منفصل عن SortableContext */}
            <Box ref={setNodeRef} sx={{
                px: 1.5, py: 1.5, flex: 1, overflowY: "auto",
                minHeight: 140,
            }}>
                <SortableContext
                    items={tasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <Stack spacing={1}>
                        {tasks.map(task => (
                            <SortableCard
                                key={task.id}
                                task={task}
                                colId={colId}
                                onClick={() => onCardClick(task)}
                            />
                        ))}
                    </Stack>
                </SortableContext>

                {/* empty placeholder — خارج SortableContext */}
                {tasks.length === 0 && (
                    <Box sx={{
                        height: 90, borderRadius: 2, mt: 0.5,
                        border: `1.5px dashed ${isOver
                            ? c.color
                            : isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        bgcolor: isOver ? `${c.color}06` : "transparent",
                        transition: "all 0.15s ease",
                    }}>
                        <Typography sx={{
                            fontSize: "0.72rem",
                            color: isOver ? c.color
                                : isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.22)",
                        }}>
                            {isOver ? "Release to drop" : "No tasks yet"}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

/* ── main ────────────────────────────────────────────────────── */
export default function KanbanBoard() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const [columns, setColumns] = useState(INIT_TASKS);
    const [activeTask, setActiveTask] = useState(null);
    const [activeCol, setActiveCol] = useState(null);
    const [selected, setSelected] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [addCol, setAddCol] = useState("todo");
    const [newTask, setNewTask] = useState(EMPTY_TASK);
    const [comment, setComment] = useState("");

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const total = Object.values(columns).flat().length;
    const done = columns.done.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    const accent = "#d0895b";
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const paperBg = theme.palette.background.paper;

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: 2, fontSize: "0.875rem",
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: accent }
        },
        "& .MuiInputLabel-root.Mui-focused": { color: accent },
        "& .MuiInputLabel-root": { fontSize: "0.875rem" },
    };

    const findColOf = (taskId) => COL_ORDER.find(c => columns[c].some(t => t.id === taskId));
    const findTask = (id) => Object.values(columns).flat().find(t => t.id === id);

    const handleDragStart = ({ active }) => {
        setActiveTask(findTask(active.id));
        setActiveCol(findColOf(active.id) ?? null);
    };

    const handleDragOver = ({ active, over }) => {
        if (!over) return;
        const fromCol = findColOf(active.id);
        if (!fromCol) return;
        const toCol = isColId(over.id) ? over.id : findColOf(over.id);
        if (!toCol || fromCol === toCol) return;
        setColumns(prev => {
            const task = prev[fromCol].find(t => t.id === active.id);
            if (!task) return prev;
            return {
                ...prev,
                [fromCol]: prev[fromCol].filter(t => t.id !== active.id),
                [toCol]: [...prev[toCol], task],
            };
        });
    };

    const handleDragEnd = ({ active, over }) => {
        setActiveTask(null);
        setActiveCol(null);
        if (!over) return;
        const fromCol = findColOf(active.id);
        if (!fromCol) return;
        if (isColId(over.id)) return;
        const toCol = findColOf(over.id);
        if (!toCol || fromCol !== toCol) return;
        const oldIdx = columns[fromCol].findIndex(t => t.id === active.id);
        const newIdx = columns[toCol].findIndex(t => t.id === over.id);
        if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
            setColumns(prev => ({
                ...prev,
                [fromCol]: arrayMove(prev[fromCol], oldIdx, newIdx),
            }));
        }
    };

    const openAdd = (col) => { setAddCol(col); setNewTask(EMPTY_TASK); setAddOpen(true); };
    const handleAdd = () => {
        if (!newTask.title.trim()) return;
        const t = { ...newTask, id: String(Date.now()), comments: 0, files: 0 };
        setColumns(p => ({ ...p, [addCol]: [...p[addCol], t] }));
        setAddOpen(false);
    };
    const moveTask = (task, from, to) => {
        setColumns(p => ({
            ...p,
            [from]: p[from].filter(tk => tk.id !== task.id),
            [to]: [...p[to], task],
        }));
        setDetailOpen(false);
    };

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>

            {/* ── header ── */}
            <Stack direction="row" justifyContent="space-between"
                alignItems="flex-start" mb={3}>
                <Box>
                    <Typography variant="h2" sx={{ color: tPri, mb: 0.4 }}>
                        Kanban Board
                    </Typography>
                    <Typography sx={{ color: tSec, fontSize: "0.85rem" }}>
                        EcoTrackers · {done} of {total} tasks completed
                    </Typography>
                </Box>

                {/* progress */}
                <Box sx={{
                    px: 2, py: 1.2, borderRadius: 2.5,
                    border: `1px solid ${border}`,
                    bgcolor: isDark ? "rgba(255,255,255,0.03)" : paperBg,
                    minWidth: 160,
                }}>
                    <Stack direction="row" justifyContent="space-between" mb={0.8}>
                        <Typography sx={{ fontSize: "0.7rem", color: tSec, fontWeight: 600 }}>
                            Progress
                        </Typography>
                        <Typography sx={{ fontSize: "0.7rem", color: accent, fontWeight: 700 }}>
                            {pct}%
                        </Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={pct} sx={{
                        height: 5, borderRadius: 3,
                        bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
                        "& .MuiLinearProgress-bar": { bgcolor: accent, borderRadius: 3 },
                    }} />
                </Box>
            </Stack>

            {/* ── board ── */}
            <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <Box sx={{
                    display: "flex", gap: 2, flex: 1,
                    overflowX: "auto", overflowY: "hidden", pb: 1,
                }}>
                    {COL_ORDER.map(colId => (
                        <Column
                            key={colId}
                            colId={colId}
                            tasks={columns[colId]}
                            onAdd={() => openAdd(colId)}
                            onCardClick={task => { setSelected(task); setDetailOpen(true); }}
                        />
                    ))}
                </Box>

                <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
                    {activeTask ? <OverlayCard task={activeTask} colId={activeCol} /> : null}
                </DragOverlay>
            </DndContext>

            {/* ── detail dialog ── */}
            {selected && (
                <Dialog open={detailOpen} onClose={() => setDetailOpen(false)}
                    maxWidth="sm" fullWidth
                    PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg } }}>

                    <Box sx={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        px: 3, py: 2.5, borderBottom: `1px solid ${border}`
                    }}>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                            {(() => {
                                const p = PRIORITY[selected.priority];
                                const PIcon = p.Icon;
                                return (
                                    <Box sx={{
                                        display: "flex", alignItems: "center", gap: 0.3,
                                        px: 0.8, py: 0.3, borderRadius: 1,
                                        bgcolor: p.bg, border: `1px solid ${p.color}25`
                                    }}>
                                        <PIcon sx={{ fontSize: 13, color: p.color }} />
                                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: p.color }}>
                                            {p.label}
                                        </Typography>
                                    </Box>
                                );
                            })()}
                            <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: tPri }}>
                                {selected.title}
                            </Typography>
                        </Stack>
                        <IconButton size="small" onClick={() => setDetailOpen(false)} sx={{ color: tSec }}>
                            <CloseIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                    </Box>

                    <DialogContent sx={{ px: 3, py: 3 }}>
                        <Stack spacing={2.5}>
                            {selected.due && (
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <CalendarTodayOutlinedIcon sx={{ fontSize: 15, color: accent }} />
                                    <Typography fontSize="0.82rem" sx={{ color: tSec }}>
                                        Due:{" "}
                                        <Box component="span" sx={{ fontWeight: 600, color: tPri }}>
                                            {selected.due}
                                        </Box>
                                    </Typography>
                                </Stack>
                            )}
                            <Box>
                                <Typography sx={{
                                    fontSize: "0.68rem", fontWeight: 700,
                                    letterSpacing: "0.08em", textTransform: "uppercase",
                                    color: tSec, mb: 1
                                }}>Assignees</Typography>
                                <AvatarGroup max={5} sx={{
                                    justifyContent: "flex-start",
                                    "& .MuiAvatar-root": {
                                        width: 28, height: 28,
                                        fontSize: "0.72rem", fontWeight: 700
                                    }
                                }}>
                                    {selected.assignees.map((a, j) => (
                                        <Avatar key={j} sx={{ bgcolor: MBR_CLR[j % MBR_CLR.length] }}>{a}</Avatar>
                                    ))}
                                </AvatarGroup>
                            </Box>
                            <Box>
                                <Typography sx={{
                                    fontSize: "0.68rem", fontWeight: 700,
                                    letterSpacing: "0.08em", textTransform: "uppercase",
                                    color: tSec, mb: 1
                                }}>Move To</Typography>
                                <Stack direction="row" gap={1}>
                                    {COL_ORDER.map(colId => {
                                        const cur = COL_ORDER.find(c =>
                                            columns[c].some(tk => tk.id === selected.id));
                                        if (colId === cur) return null;
                                        const m = COL_META[colId];
                                        return (
                                            <Button key={colId} size="small" variant="outlined"
                                                onClick={() => moveTask(selected, cur, colId)}
                                                sx={{
                                                    borderColor: m.color, color: m.color,
                                                    borderRadius: 1.5, fontSize: "0.78rem",
                                                    textTransform: "none", fontWeight: 600,
                                                    "&:hover": {
                                                        bgcolor: `${m.color}10`,
                                                        borderColor: m.color
                                                    }
                                                }}>
                                                {m.label}
                                            </Button>
                                        );
                                    })}
                                </Stack>
                            </Box>
                            <Box>
                                <Typography sx={{
                                    fontSize: "0.68rem", fontWeight: 700,
                                    letterSpacing: "0.08em", textTransform: "uppercase",
                                    color: tSec, mb: 1
                                }}>Comment</Typography>
                                <Stack direction="row" gap={1}>
                                    <TextField size="small" fullWidth
                                        placeholder="Write a comment…"
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        sx={inputSx} />
                                    <Button variant="contained" size="small"
                                        onClick={() => setComment("")}
                                        sx={{
                                            bgcolor: accent,
                                            "&:hover": { bgcolor: "#be7a4f", boxShadow: "none" },
                                            borderRadius: 2, px: 2.5, textTransform: "none",
                                            fontWeight: 700, boxShadow: "none",
                                            whiteSpace: "nowrap"
                                        }}>
                                        Send
                                    </Button>
                                </Stack>
                            </Box>
                        </Stack>
                    </DialogContent>
                </Dialog>
            )}

            {/* ── add task dialog ── */}
            <Dialog open={addOpen} onClose={() => setAddOpen(false)}
                maxWidth="xs" fullWidth
                onKeyDown={e => e.stopPropagation()}
                PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg } }}>

                <Box sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    px: 3, py: 2.5, borderBottom: `1px solid ${border}`
                }}>
                    <Box>
                        <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: tPri }}>
                            Add Task
                        </Typography>
                        <Typography fontSize="0.74rem" sx={{ color: tSec, mt: 0.2 }}>
                            Adding to{" "}
                            <Box component="span" sx={{ color: COL_META[addCol].color, fontWeight: 600 }}>
                                {COL_META[addCol]?.label}
                            </Box>
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setAddOpen(false)} sx={{ color: tSec }}>
                        <CloseIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                </Box>

                <DialogContent sx={{ px: 3, py: 3 }}>
                    <Stack spacing={2}>
                        <TextField label="Task Title *" size="small" fullWidth
                            value={newTask.title}
                            onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                            sx={inputSx} />
                        <TextField label="Due Date" size="small" fullWidth
                            placeholder="e.g. 3d, Tomorrow, 1w"
                            value={newTask.due}
                            onChange={e => setNewTask(p => ({ ...p, due: e.target.value }))}
                            sx={inputSx} />
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button onClick={() => setAddOpen(false)}
                        sx={{
                            color: tSec, textTransform: "none",
                            fontWeight: 500, borderRadius: 2, px: 2.5
                        }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleAdd}
                        disabled={!newTask.title.trim()}
                        sx={{
                            bgcolor: accent,
                            "&:hover": { bgcolor: "#be7a4f", boxShadow: "none" },
                            borderRadius: 2, px: 3, textTransform: "none",
                            fontWeight: 700, boxShadow: "none",
                            "&.Mui-disabled": { opacity: 0.45 }
                        }}>
                        Add Task
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}