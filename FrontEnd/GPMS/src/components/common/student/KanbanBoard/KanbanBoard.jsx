// C:\Users\Dell\Desktop\Graduation_Project\FrontEnd\GPMS\src\components\common\student\KanbanBoard\KanbanBoard.jsx

import { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Stack, Paper, Avatar, Button,
    IconButton, Tooltip, Dialog, DialogContent, DialogActions,
    TextField, AvatarGroup, LinearProgress, CircularProgress,
    Snackbar, Alert, MenuItem, Select, FormControl, InputLabel,
    Chip,
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
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import {
    DndContext, pointerWithin, PointerSensor,
    useSensor, useSensors, DragOverlay, useDroppable,
} from "@dnd-kit/core";
import {
    SortableContext, verticalListSortingStrategy,
    useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
    getKanbanBoard,
    getTeamMembers,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
} from "../../../../api/handler/endpoints/Kanbanapi";

/* ── constants ─────────────────────────────────────────────────── */
const COL_ORDER = ["todo", "inProgress", "done"];

// Map backend status strings → frontend column keys (adjust to match your backend)
const STATUS_TO_COL = {
    Todo: "todo",
    todo: "todo",
    "To Do": "todo",
    InProgress: "inProgress",
    inProgress: "inProgress",
    "In Progress": "inProgress",
    Done: "done",
    done: "done",
};

// Map frontend column key → backend status string
const COL_TO_STATUS = {
    todo: "Todo",
    inProgress: "InProgress",
    done: "Done",
};

const COL_META = {
    todo: { label: "To Do", color: "#4F8EF7", headerBg: "rgba(79,142,247,0.08)", dot: "#4F8EF7" },
    inProgress: { label: "In Progress", color: "#d0895b", headerBg: "rgba(208,137,91,0.08)", dot: "#d0895b" },
    done: { label: "Done", color: "#3DB97A", headerBg: "rgba(61,185,122,0.08)", dot: "#3DB97A" },
};

const PRIORITY = {
    high: { color: "#d0895b", bg: "rgba(208,137,91,0.10)", Icon: KeyboardArrowUpIcon, label: "High" },
    medium: { color: "#7E9FC4", bg: "rgba(126,159,196,0.10)", Icon: RemoveIcon, label: "Medium" },
    low: { color: "#888", bg: "rgba(140,140,140,0.08)", Icon: KeyboardArrowDownIcon, label: "Low" },
};

const MBR_CLR = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8"];

const EMPTY_FORM = {
    title: "",
    description: "",
    deadline: "",
    assignedUserIds: [],
};

const isColId = (id) => COL_ORDER.includes(id);

/* ── helpers ────────────────────────────────────────────────────── */

/**
 * Normalise a raw board response from the backend into:
 * { todo: Task[], inProgress: Task[], done: Task[] }
 *
 * Expected backend shape (adjust field names if your API differs):
 * {
 *   tasks: [
 *     {
 *       id: 1,
 *       title: "...",
 *       description: "...",
 *       status: "Todo" | "InProgress" | "Done",
 *       deadline: "2026-04-01T00:00:00Z" | null,
 *       assignedUsers: [{ id: 1, fullName: "Alice", ... }],
 *       comments: [...],
 *       files: [...],
 *       priority: "high" | "medium" | "low"   // optional
 *     }
 *   ]
 * }
 */
const normaliseBoardResponse = (data) => {
    const columns = { todo: [], inProgress: [], done: [] };

    // Support both { tasks: [] } and plain array responses
    const raw = Array.isArray(data) ? data : data?.tasks ?? data?.columns ?? [];

    raw.forEach((task) => {
        const colKey = STATUS_TO_COL[task.status] ?? "todo";
        columns[colKey].push({
            id: String(task.id),
            backendId: task.id,
            title: task.title ?? "Untitled",
            description: task.description ?? "",
            priority: task.priority ?? "medium",
            due: task.deadline ? formatDeadline(task.deadline) : null,
            deadline: task.deadline ?? null,
            assignees: (task.assignedUsers ?? []).map((u) =>
                (u.fullName ?? u.name ?? "?").charAt(0).toUpperCase()
            ),
            assignedUsers: task.assignedUsers ?? [],
            assignedUserIds: (task.assignedUsers ?? []).map((u) => u.id),
            comments: (task.comments ?? []).length,
            files: (task.files ?? []).length,
        });
    });

    return columns;
};

const formatDeadline = (isoString) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff < 0) return "Overdue";
    if (diff <= 6) return `${diff}d`;
    if (diff <= 13) return "1w";
    return date.toLocaleDateString();
};

/* ── CardContent ────────────────────────────────────────────────── */
function CardContent({ task, colId, theme }) {
    const textPri = theme.palette.text.primary;
    const textSec = theme.palette.text.secondary;
    const p = PRIORITY[task.priority] ?? PRIORITY.medium;
    const c = COL_META[colId];
    const PIcon = p.Icon;

    return (
        <>
            <Box sx={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: 3, bgcolor: c.color, borderRadius: "2px 0 0 2px",
            }} />

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
                    bgcolor: p.bg, border: `1px solid ${p.color}25`, flexShrink: 0,
                }}>
                    <PIcon sx={{ fontSize: 12, color: p.color }} />
                    <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: p.color }}>
                        {p.label}
                    </Typography>
                </Box>
            </Stack>

            {task.due && (
                <Stack direction="row" alignItems="center" gap={0.5} mb={1} pl={0.5}>
                    <CalendarTodayOutlinedIcon sx={{
                        fontSize: 11,
                        color: task.due === "Tomorrow" || task.due === "Today" ? "#d0895b" : textSec,
                    }} />
                    <Typography sx={{
                        fontSize: "0.72rem",
                        fontWeight: ["Tomorrow", "Today", "Overdue"].includes(task.due) ? 600 : 400,
                        color: task.due === "Overdue" ? "#e57373"
                            : ["Tomorrow", "Today"].includes(task.due) ? "#d0895b" : textSec,
                    }}>
                        {task.due}
                    </Typography>
                </Stack>
            )}

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

/* ── SortableCard ───────────────────────────────────────────────── */
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
                p: 1.6, pl: 2, borderRadius: 2,
                position: "relative", overflow: "hidden",
                border: `1px solid ${isDragging ? c.color : border}`,
                cursor: "grab", opacity: isDragging ? 0.25 : 1,
                bgcolor: theme.palette.background.paper,
                transform: CSS.Transform.toString(transform),
                transition: transition ?? "all 0.15s ease",
                touchAction: "none",
                "&:hover": {
                    borderColor: c.color,
                    boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.07)",
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

/* ── OverlayCard ────────────────────────────────────────────────── */
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

/* ── Column ─────────────────────────────────────────────────────── */
function Column({ colId, tasks, onAdd, onCardClick }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const c = COL_META[colId];
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;

    const { setNodeRef, isOver } = useDroppable({ id: colId });

    const colBg = isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.015)";
    const borderCol = isDark
        ? `rgba(255,255,255,${isOver ? 0.12 : 0.06})`
        : `rgba(0,0,0,${isOver ? 0.12 : 0.06})`;

    return (
        <Box sx={{
            flex: 1, minWidth: 268, maxWidth: 340,
            display: "flex", flexDirection: "column",
            borderRadius: 2.5,
            border: `1.5px solid ${isOver ? c.color : borderCol}`,
            bgcolor: isOver ? (isDark ? `${c.color}10` : `${c.color}06`) : colBg,
            transition: "border-color 0.15s ease, background-color 0.15s ease",
        }}>
            {/* header */}
            <Box sx={{
                px: 2, py: 1.6,
                bgcolor: isDark ? `${c.color}12` : c.headerBg,
                borderRadius: "10px 10px 0 0",
                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
            }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" gap={1}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: c.dot }} />
                        <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: tPri }}>
                            {c.label}
                        </Typography>
                        <Box sx={{
                            px: 0.9, py: 0.1, borderRadius: 1,
                            bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                        }}>
                            <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: tSec }}>
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

            {/* tasks area */}
            <Box ref={setNodeRef} sx={{ px: 1.5, py: 1.5, flex: 1, overflowY: "auto", minHeight: 140 }}>
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <Stack spacing={1}>
                        {tasks.map(task => (
                            <SortableCard
                                key={task.id}
                                task={task}
                                colId={colId}
                                onClick={() => onCardClick(task, colId)}
                            />
                        ))}
                    </Stack>
                </SortableContext>

                {tasks.length === 0 && (
                    <Box sx={{
                        height: 90, borderRadius: 2, mt: 0.5,
                        border: `1.5px dashed ${isOver ? c.color : isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        bgcolor: isOver ? `${c.color}06` : "transparent",
                        transition: "all 0.15s ease",
                    }}>
                        <Typography sx={{
                            fontSize: "0.72rem",
                            color: isOver ? c.color : isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.22)",
                        }}>
                            {isOver ? "Release to drop" : "No tasks yet"}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

/* ── KanbanBoard (main) ─────────────────────────────────────────── */
export default function KanbanBoard() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    /* ── state ── */
    const [columns, setColumns] = useState({ todo: [], inProgress: [], done: [] });
    const [members, setMembers] = useState([]);   // [{ id, fullName, ... }]
    const [loading, setLoading] = useState(true);
    const [activeTask, setActiveTask] = useState(null);
    const [activeCol, setActiveCol] = useState(null);

    // detail dialog
    const [selected, setSelected] = useState(null);
    const [selectedCol, setSelectedCol] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState(EMPTY_FORM);

    // add dialog
    const [addOpen, setAddOpen] = useState(false);
    const [addCol, setAddCol] = useState("todo");
    const [addForm, setAddForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    // snackbar
    const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const accent = "#d0895b";
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const paperBg = theme.palette.background.paper;

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: 2, fontSize: "0.875rem",
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: accent },
        },
        "& .MuiInputLabel-root.Mui-focused": { color: accent },
        "& .MuiInputLabel-root": { fontSize: "0.875rem" },
    };

    /* ── derived ── */
    const total = Object.values(columns).flat().length;
    const done = columns.done.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    /* ── helpers ── */
    const showSnack = (msg, severity = "success") =>
        setSnack({ open: true, msg, severity });

    const findColOf = (taskId) =>
        COL_ORDER.find(c => columns[c].some(t => t.id === taskId));

    const findTask = (id) =>
        Object.values(columns).flat().find(t => t.id === id);

    /* ── fetch board ── */
    const fetchBoard = useCallback(async () => {
        try {
            setLoading(true);
            const [boardRes, membersRes] = await Promise.all([
                getKanbanBoard(),
                getTeamMembers(),
            ]);
            setColumns(normaliseBoardResponse(boardRes.data));
            setMembers(membersRes.data ?? []);
        } catch (err) {
            console.error("Failed to load Kanban board:", err);
            showSnack("Failed to load board. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchBoard(); }, [fetchBoard]);

    /* ── drag ── */
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

    const handleDragEnd = async ({ active, over }) => {
        const fromCol = findColOf(active.id) ?? activeCol;
        setActiveTask(null);
        setActiveCol(null);
        if (!over || !fromCol) return;

        const toCol = isColId(over.id) ? over.id : findColOf(over.id) ?? fromCol;

        // reorder within same column
        if (fromCol === toCol && !isColId(over.id)) {
            const oldIdx = columns[fromCol].findIndex(t => t.id === active.id);
            const newIdx = columns[toCol].findIndex(t => t.id === over.id);
            if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
                setColumns(prev => ({
                    ...prev,
                    [fromCol]: arrayMove(prev[fromCol], oldIdx, newIdx),
                }));
            }
            return;
        }

        // cross-column drop → persist status change
        if (fromCol !== toCol) {
            const task = findTask(active.id);
            if (!task) return;
            try {
                await updateTaskStatus({
                    taskId: task.backendId,
                    status: COL_TO_STATUS[toCol],
                });
                showSnack(`Task moved to ${COL_META[toCol].label}`);
            } catch (err) {
                console.error("Failed to update status:", err);
                showSnack("Failed to move task. Reverting…", "error");
                fetchBoard(); // revert optimistic update
            }
        }
    };

    /* ── add task ── */
    const openAdd = (col) => {
        setAddCol(col);
        setAddForm(EMPTY_FORM);
        setAddOpen(true);
    };

    const handleAdd = async () => {
        if (!addForm.title.trim()) return;
        try {
            setSaving(true);
            await createTask({
                title: addForm.title,
                description: addForm.description,
                status: COL_TO_STATUS[addCol],
                deadline: addForm.deadline ? new Date(addForm.deadline).toISOString() : null,
                assignedUserIds: addForm.assignedUserIds,
            });
            setAddOpen(false);
            showSnack("Task created successfully!");
            fetchBoard();
        } catch (err) {
            console.error("Failed to create task:", err);
            showSnack("Failed to create task.", "error");
        } finally {
            setSaving(false);
        }
    };

    /* ── detail / edit ── */
    const openDetail = (task, colId) => {
        setSelected(task);
        setSelectedCol(colId);
        setEditForm({
            title: task.title,
            description: task.description,
            deadline: task.deadline ? task.deadline.substring(0, 10) : "",
            assignedUserIds: task.assignedUserIds ?? [],
        });
        setEditMode(false);
        setDetailOpen(true);
    };

    const handleEdit = async () => {
        if (!editForm.title.trim()) return;
        try {
            setSaving(true);
            await updateTask(selected.backendId, {
                title: editForm.title,
                description: editForm.description,
                deadline: editForm.deadline ? new Date(editForm.deadline).toISOString() : null,
                assignedUserIds: editForm.assignedUserIds,
            });
            setDetailOpen(false);
            showSnack("Task updated successfully!");
            fetchBoard();
        } catch (err) {
            console.error("Failed to update task:", err);
            showSnack("Failed to update task.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleMoveTask = async (toCol) => {
        const fromCol = selectedCol;
        if (!fromCol || fromCol === toCol) return;
        // optimistic
        setColumns(prev => ({
            ...prev,
            [fromCol]: prev[fromCol].filter(tk => tk.id !== selected.id),
            [toCol]: [...prev[toCol], selected],
        }));
        setDetailOpen(false);
        try {
            await updateTaskStatus({
                taskId: selected.backendId,
                status: COL_TO_STATUS[toCol],
            });
            showSnack(`Task moved to ${COL_META[toCol].label}`);
        } catch (err) {
            console.error("Failed to move task:", err);
            showSnack("Failed to move task.", "error");
            fetchBoard();
        }
    };

    const handleDelete = async () => {
        try {
            setSaving(true);
            await deleteTask(selected.backendId);
            setDetailOpen(false);
            showSnack("Task deleted.");
            fetchBoard();
        } catch (err) {
            console.error("Failed to delete task:", err);
            showSnack("Failed to delete task.", "error");
        } finally {
            setSaving(false);
        }
    };

    /* ── loading state ── */
    if (loading) {
        return (
            <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Stack alignItems="center" gap={2}>
                    <CircularProgress sx={{ color: accent }} />
                    <Typography sx={{ color: tSec, fontSize: "0.85rem" }}>Loading board…</Typography>
                </Stack>
            </Box>
        );
    }

    /* ── render ── */
    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>

            {/* header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                    <Typography variant="h2" sx={{ color: tPri, mb: 0.4 }}>Kanban Board</Typography>
                    <Typography sx={{ color: tSec, fontSize: "0.85rem" }}>
                        {done} of {total} tasks completed
                    </Typography>
                </Box>
                <Box sx={{
                    px: 2, py: 1.2, borderRadius: 2.5, border: `1px solid ${border}`,
                    bgcolor: isDark ? "rgba(255,255,255,0.03)" : paperBg, minWidth: 160,
                }}>
                    <Stack direction="row" justifyContent="space-between" mb={0.8}>
                        <Typography sx={{ fontSize: "0.7rem", color: tSec, fontWeight: 600 }}>Progress</Typography>
                        <Typography sx={{ fontSize: "0.7rem", color: accent, fontWeight: 700 }}>{pct}%</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={pct} sx={{
                        height: 5, borderRadius: 3,
                        bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
                        "& .MuiLinearProgress-bar": { bgcolor: accent, borderRadius: 3 },
                    }} />
                </Box>
            </Stack>

            {/* board */}
            <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <Box sx={{ display: "flex", gap: 2, flex: 1, overflowX: "auto", overflowY: "hidden", pb: 1 }}>
                    {COL_ORDER.map(colId => (
                        <Column
                            key={colId}
                            colId={colId}
                            tasks={columns[colId]}
                            onAdd={() => openAdd(colId)}
                            onCardClick={openDetail}
                        />
                    ))}
                </Box>
                <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
                    {activeTask ? <OverlayCard task={activeTask} colId={activeCol} /> : null}
                </DragOverlay>
            </DndContext>

            {/* ── detail dialog ── */}
            {selected && (
                <Dialog
                    open={detailOpen}
                    onClose={() => setDetailOpen(false)}
                    maxWidth="sm" fullWidth
                    PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg } }}
                >
                    {/* dialog header */}
                    <Box sx={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        px: 3, py: 2.5, borderBottom: `1px solid ${border}`,
                    }}>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                            {(() => {
                                const p = PRIORITY[selected.priority] ?? PRIORITY.medium;
                                const PIcon = p.Icon;
                                return (
                                    <Box sx={{
                                        display: "flex", alignItems: "center", gap: 0.3,
                                        px: 0.8, py: 0.3, borderRadius: 1,
                                        bgcolor: p.bg, border: `1px solid ${p.color}25`,
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
                        <Stack direction="row" gap={0.5}>
                            <Tooltip title={editMode ? "Cancel edit" : "Edit task"}>
                                <IconButton size="small" onClick={() => setEditMode(m => !m)} sx={{ color: tSec }}>
                                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete task">
                                <IconButton size="small" onClick={handleDelete} disabled={saving} sx={{ color: "#e57373" }}>
                                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                            <IconButton size="small" onClick={() => setDetailOpen(false)} sx={{ color: tSec }}>
                                <CloseIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                        </Stack>
                    </Box>

                    <DialogContent sx={{ px: 3, py: 3 }}>
                        {editMode ? (
                            /* ── edit form ── */
                            <Stack spacing={2}>
                                <TextField label="Title *" size="small" fullWidth
                                    value={editForm.title}
                                    onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                                    sx={inputSx} />
                                <TextField label="Description" size="small" fullWidth multiline rows={2}
                                    value={editForm.description}
                                    onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                                    sx={inputSx} />
                                <TextField label="Deadline" size="small" fullWidth type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={editForm.deadline}
                                    onChange={e => setEditForm(p => ({ ...p, deadline: e.target.value }))}
                                    sx={inputSx} />
                                {members.length > 0 && (
                                    <FormControl size="small" fullWidth sx={inputSx}>
                                        <InputLabel>Assignees</InputLabel>
                                        <Select
                                            multiple label="Assignees"
                                            value={editForm.assignedUserIds}
                                            onChange={e => setEditForm(p => ({ ...p, assignedUserIds: e.target.value }))}
                                            renderValue={(selected) => (
                                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                                    {selected.map(id => {
                                                        const m = members.find(mb => mb.id === id);
                                                        return <Chip key={id} label={m?.fullName ?? id} size="small" />;
                                                    })}
                                                </Box>
                                            )}
                                        >
                                            {members.map(m => (
                                                <MenuItem key={m.id} value={m.id}>{m.fullName ?? m.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            </Stack>
                        ) : (
                            /* ── read view ── */
                            <Stack spacing={2.5}>
                                {selected.description && (
                                    <Typography sx={{ fontSize: "0.84rem", color: tSec, lineHeight: 1.6 }}>
                                        {selected.description}
                                    </Typography>
                                )}
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
                                        color: tSec, mb: 1,
                                    }}>Assignees</Typography>
                                    <AvatarGroup max={5} sx={{
                                        justifyContent: "flex-start",
                                        "& .MuiAvatar-root": { width: 28, height: 28, fontSize: "0.72rem", fontWeight: 700 },
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
                                        color: tSec, mb: 1,
                                    }}>Move To</Typography>
                                    <Stack direction="row" gap={1}>
                                        {COL_ORDER.filter(c => c !== selectedCol).map(colId => {
                                            const m = COL_META[colId];
                                            return (
                                                <Button key={colId} size="small" variant="outlined"
                                                    onClick={() => handleMoveTask(colId)}
                                                    sx={{
                                                        borderColor: m.color, color: m.color,
                                                        borderRadius: 1.5, fontSize: "0.78rem",
                                                        textTransform: "none", fontWeight: 600,
                                                        "&:hover": { bgcolor: `${m.color}10`, borderColor: m.color },
                                                    }}>
                                                    {m.label}
                                                </Button>
                                            );
                                        })}
                                    </Stack>
                                </Box>
                            </Stack>
                        )}
                    </DialogContent>

                    {editMode && (
                        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                            <Button onClick={() => setEditMode(false)}
                                sx={{ color: tSec, textTransform: "none", fontWeight: 500, borderRadius: 2, px: 2.5 }}>
                                Cancel
                            </Button>
                            <Button variant="contained" onClick={handleEdit}
                                disabled={saving || !editForm.title.trim()}
                                sx={{
                                    bgcolor: accent,
                                    "&:hover": { bgcolor: "#be7a4f", boxShadow: "none" },
                                    borderRadius: 2, px: 3, textTransform: "none",
                                    fontWeight: 700, boxShadow: "none",
                                }}>
                                {saving ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Save Changes"}
                            </Button>
                        </DialogActions>
                    )}
                </Dialog>
            )}

            {/* ── add task dialog ── */}
            <Dialog
                open={addOpen}
                onClose={() => setAddOpen(false)}
                maxWidth="xs" fullWidth
                onKeyDown={e => e.stopPropagation()}
                PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg } }}
            >
                <Box sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    px: 3, py: 2.5, borderBottom: `1px solid ${border}`,
                }}>
                    <Box>
                        <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: tPri }}>Add Task</Typography>
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
                            value={addForm.title}
                            onChange={e => setAddForm(p => ({ ...p, title: e.target.value }))}
                            sx={inputSx} />
                        <TextField label="Description" size="small" fullWidth multiline rows={2}
                            value={addForm.description}
                            onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))}
                            sx={inputSx} />
                        <TextField label="Deadline" size="small" fullWidth type="date"
                            InputLabelProps={{ shrink: true }}
                            value={addForm.deadline}
                            onChange={e => setAddForm(p => ({ ...p, deadline: e.target.value }))}
                            sx={inputSx} />
                        {members.length > 0 && (
                            <FormControl size="small" fullWidth sx={inputSx}>
                                <InputLabel>Assignees</InputLabel>
                                <Select
                                    multiple label="Assignees"
                                    value={addForm.assignedUserIds}
                                    onChange={e => setAddForm(p => ({ ...p, assignedUserIds: e.target.value }))}
                                    renderValue={(sel) => (
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                            {sel.map(id => {
                                                const m = members.find(mb => mb.id === id);
                                                return <Chip key={id} label={m?.fullName ?? id} size="small" />;
                                            })}
                                        </Box>
                                    )}
                                >
                                    {members.map(m => (
                                        <MenuItem key={m.id} value={m.id}>{m.fullName ?? m.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button onClick={() => setAddOpen(false)}
                        sx={{ color: tSec, textTransform: "none", fontWeight: 500, borderRadius: 2, px: 2.5 }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleAdd}
                        disabled={saving || !addForm.title.trim()}
                        sx={{
                            bgcolor: accent,
                            "&:hover": { bgcolor: "#be7a4f", boxShadow: "none" },
                            borderRadius: 2, px: 3, textTransform: "none",
                            fontWeight: 700, boxShadow: "none",
                            "&.Mui-disabled": { opacity: 0.45 },
                        }}>
                        {saving ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Add Task"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* snackbar */}
            <Snackbar
                open={snack.open}
                autoHideDuration={3500}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: 2 }}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}