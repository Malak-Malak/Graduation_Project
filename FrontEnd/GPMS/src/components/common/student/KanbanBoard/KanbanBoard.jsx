import { useState } from "react";
import {
    Box, Typography, Stack, Paper, Chip, Avatar, Button, IconButton, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, AvatarGroup,
    LinearProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CloseIcon from "@mui/icons-material/Close";

import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay,
} from "@dnd-kit/core";
import {
    SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

const PRIORITY_CLR = { high: "#C47E7E", medium: "#C49A6C", low: "#6D8A7D" };
const COL_META = {
    todo: { label: "To Do", color: "#9AA9B9" },
    inProgress: { label: "In Progress", color: "#C49A6C" },
    done: { label: "Done", color: "#6D8A7D" },
};
const MBR_CLR = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4"];
const EMPTY_TASK = { title: "", priority: "medium", due: "", assignees: ["A"] };

function TaskCardContent({ task }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    return (
        <>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.8}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: t.textPrimary, lineHeight: 1.4, flex: 1 }}>
                    {task.title}
                </Typography>
                <Chip label={task.priority} size="small"
                    sx={{
                        bgcolor: `${PRIORITY_CLR[task.priority]}15`, color: PRIORITY_CLR[task.priority],
                        fontWeight: 600, fontSize: "0.62rem", height: 18, textTransform: "capitalize", ml: 0.5,
                    }} />
            </Stack>
            {task.due && (
                <Stack direction="row" alignItems="center" gap={0.5} mb={1}>
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 12, color: t.textTertiary }} />
                    <Typography sx={{ fontSize: "0.72rem", color: task.due === "Tomorrow" ? t.warning : t.textTertiary }}>
                        Due: {task.due}
                    </Typography>
                </Stack>
            )}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <AvatarGroup max={3} sx={{ "& .MuiAvatar-root": { width: 22, height: 22, fontSize: "0.58rem", fontWeight: 700 } }}>
                    {task.assignees.map((a, j) => <Avatar key={j} sx={{ bgcolor: MBR_CLR[j % MBR_CLR.length] }}>{a}</Avatar>)}
                </AvatarGroup>
                <Stack direction="row" gap={1}>
                    {task.files > 0 && (
                        <Stack direction="row" alignItems="center" gap={0.3}>
                            <AttachFileOutlinedIcon sx={{ fontSize: 12, color: t.textTertiary }} />
                            <Typography sx={{ fontSize: "0.68rem", color: t.textTertiary }}>{task.files}</Typography>
                        </Stack>
                    )}
                    {task.comments > 0 && (
                        <Stack direction="row" alignItems="center" gap={0.3}>
                            <CommentOutlinedIcon sx={{ fontSize: 12, color: t.textTertiary }} />
                            <Typography sx={{ fontSize: "0.68rem", color: t.textTertiary }}>{task.comments}</Typography>
                        </Stack>
                    )}
                </Stack>
            </Stack>
        </>
    );
}

function SortableTaskCard({ task, onClick }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

    return (
        <Paper
            ref={setNodeRef}
            elevation={isDragging ? 6 : 0}
            onClick={onClick}
            sx={{
                p: 1.8, borderRadius: 2.5, border: `1px solid ${isDragging ? t.accentPrimary : t.borderLight}`,
                cursor: "grab", opacity: isDragging ? 0.4 : 1,
                "&:hover": { borderColor: t.accentPrimary, boxShadow: t.shadowSm },
                transition: "all 0.15s", bgcolor: theme.palette.background.paper,
                transform: CSS.Transform.toString(transform),
                transitionProperty: transition,
                touchAction: "none",
            }}
            {...attributes}
            {...listeners}
        >
            <TaskCardContent task={task} />
        </Paper>
    );
}

function DragOverlayCard({ task }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    return (
        <Paper elevation={8} sx={{
            p: 1.8, borderRadius: 2.5, border: `2px solid ${t.accentPrimary}`,
            bgcolor: theme.palette.background.paper, cursor: "grabbing", width: 280,
        }}>
            <TaskCardContent task={task} />
        </Paper>
    );
}

export default function KanbanBoard() {
    const theme = useTheme();
    const t = theme.palette.custom;

    const [columns, setColumns] = useState(INIT_TASKS);
    const [activeTask, setActiveTask] = useState(null);
    const [selected, setSelected] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [addCol, setAddCol] = useState("todo");
    const [newTask, setNewTask] = useState(EMPTY_TASK);
    const [comment, setComment] = useState("");

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const total = Object.values(columns).flat().length;
    const done = columns.done.length;

    const findColumn = (id) => Object.keys(columns).find((col) => columns[col].some((t) => t.id === id));
    const findTask = (id) => Object.values(columns).flat().find((t) => t.id === id);

    const handleDragStart = ({ active }) => setActiveTask(findTask(active.id));

    const handleDragOver = ({ active, over }) => {
        if (!over) return;
        const fromCol = findColumn(active.id);
        const toCol = Object.keys(columns).includes(over.id) ? over.id : findColumn(over.id);
        if (!fromCol || !toCol || fromCol === toCol) return;

        setColumns((prev) => {
            const task = prev[fromCol].find((t) => t.id === active.id);
            return {
                ...prev,
                [fromCol]: prev[fromCol].filter((t) => t.id !== active.id),
                [toCol]: [...prev[toCol], task],
            };
        });
    };

    const handleDragEnd = ({ active, over }) => {
        setActiveTask(null);
        if (!over) return;
        const fromCol = findColumn(active.id);
        const toCol = findColumn(over.id);
        if (!fromCol || !toCol || fromCol !== toCol) return;

        const oldIndex = columns[fromCol].findIndex((t) => t.id === active.id);
        const newIndex = columns[toCol].findIndex((t) => t.id === over.id);
        if (oldIndex !== newIndex) {
            setColumns((prev) => ({
                ...prev,
                [fromCol]: arrayMove(prev[fromCol], oldIndex, newIndex),
            }));
        }
    };

    const openAdd = (col) => { setAddCol(col); setNewTask(EMPTY_TASK); setAddOpen(true); };

    const handleAdd = () => {
        if (!newTask.title.trim()) return;
        const task = { ...newTask, id: String(Date.now()), comments: 0, files: 0 };
        setColumns((p) => ({ ...p, [addCol]: [...p[addCol], task] }));
        setAddOpen(false);
    };

    const moveTask = (task, from, to) => {
        setColumns((p) => ({
            ...p,
            [from]: p[from].filter((tk) => tk.id !== task.id),
            [to]: [...p[to], task],
        }));
        setDetailOpen(false);
    };

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>

            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
                <Box>
                    <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>Kanban Board</Typography>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                        EcoTrackers · {done}/{total} tasks done
                    </Typography>
                </Box>
                <Box sx={{ width: 160 }}>
                    <LinearProgress variant="determinate" value={(done / total) * 100}
                        sx={{ bgcolor: t.borderLight, "& .MuiLinearProgress-bar": { bgcolor: t.accentPrimary } }} />
                    <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary, mt: 0.4, textAlign: "right" }}>
                        {Math.round((done / total) * 100)}% complete
                    </Typography>
                </Box>
            </Stack>

            {/* Board */}
            <DndContext sensors={sensors} collisionDetection={closestCenter}
                onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>

                <Box sx={{ display: "flex", gap: 2, flex: 1, overflowX: "auto", overflowY: "hidden", pb: 1 }}>
                    {Object.entries(columns).map(([colId, tasks]) => {
                        const meta = COL_META[colId];
                        return (
                            <Box key={colId} id={colId} sx={{
                                flex: 1, minWidth: 260, display: "flex", flexDirection: "column",
                                bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                                borderRadius: 3, p: 1.5,
                            }}>
                                {/* Column header */}
                                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                                    <Stack direction="row" alignItems="center" gap={1}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: meta.color }} />
                                        <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: t.textPrimary }}>{meta.label}</Typography>
                                        <Chip label={tasks.length} size="small"
                                            sx={{ bgcolor: `${meta.color}15`, color: meta.color, fontWeight: 700, fontSize: "0.7rem", height: 20, minWidth: 24 }} />
                                    </Stack>
                                    <Tooltip title="Add Task">
                                        <IconButton size="small" onClick={() => openAdd(colId)}
                                            sx={{ width: 24, height: 24, color: t.textTertiary, "&:hover": { color: t.accentPrimary } }}>
                                            <AddIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>

                                {/* Tasks */}
                                <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                                    <Stack spacing={1} sx={{ flex: 1, overflowY: "auto" }}>
                                        {tasks.map((task) => (
                                            <SortableTaskCard key={task.id} task={task}
                                                onClick={() => { setSelected(task); setDetailOpen(true); }} />
                                        ))}
                                    </Stack>
                                </SortableContext>
                            </Box>
                        );
                    })}
                </Box>

                <DragOverlay>
                    {activeTask ? <DragOverlayCard task={activeTask} /> : null}
                </DragOverlay>
            </DndContext>

            {/* Task detail dialog */}
            {selected && (
                <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: t.textPrimary }}>{selected.title}</Typography>
                            <IconButton size="small" onClick={() => setDetailOpen(false)}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
                        </Stack>
                    </DialogTitle>
                    <DialogContent>
                        <Stack spacing={2}>
                            <Stack direction="row" gap={1} flexWrap="wrap">
                                <Chip label={selected.priority} size="small"
                                    sx={{ bgcolor: `${PRIORITY_CLR[selected.priority]}15`, color: PRIORITY_CLR[selected.priority], fontWeight: 600, textTransform: "capitalize" }} />
                                {selected.due && (
                                    <Chip icon={<CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />}
                                        label={`Due: ${selected.due}`} size="small"
                                        sx={{ bgcolor: t.surfaceHover, color: t.textSecondary, fontSize: "0.78rem" }} />
                                )}
                            </Stack>
                            <Box>
                                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: t.textTertiary, textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.8 }}>
                                    Assignees
                                </Typography>
                                <AvatarGroup max={5} sx={{ justifyContent: "flex-start", "& .MuiAvatar-root": { width: 30, height: 30, fontSize: "0.75rem", fontWeight: 700 } }}>
                                    {selected.assignees.map((a, j) => <Avatar key={j} sx={{ bgcolor: MBR_CLR[j % MBR_CLR.length] }}>{a}</Avatar>)}
                                </AvatarGroup>
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: t.textTertiary, textTransform: "uppercase", letterSpacing: "0.07em", mb: 1 }}>
                                    Move To
                                </Typography>
                                <Stack direction="row" gap={1}>
                                    {Object.entries(COL_META).map(([colId, meta]) => {
                                        const currentCol = Object.entries(columns).find(([, tasks]) => tasks.some((tk) => tk.id === selected.id))?.[0];
                                        if (colId === currentCol) return null;
                                        return (
                                            <Button key={colId} size="small" variant="outlined"
                                                onClick={() => moveTask(selected, currentCol, colId)}
                                                sx={{ borderColor: meta.color, color: meta.color, fontSize: "0.78rem", "&:hover": { bgcolor: `${meta.color}10`, borderColor: meta.color } }}>
                                                {meta.label}
                                            </Button>
                                        );
                                    })}
                                </Stack>
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: t.textTertiary, textTransform: "uppercase", letterSpacing: "0.07em", mb: 1 }}>
                                    Comment
                                </Typography>
                                <Stack direction="row" gap={1}>
                                    <TextField size="small" fullWidth placeholder="Write a comment…"
                                        value={comment} onChange={(e) => setComment(e.target.value)} />
                                    <Button variant="contained" size="small" onClick={() => setComment("")}
                                        sx={{ bgcolor: t.accentPrimary, px: 2, whiteSpace: "nowrap" }}>Send</Button>
                                </Stack>
                            </Box>
                        </Stack>
                    </DialogContent>
                </Dialog>
            )}

            {/* Add task dialog */}
            <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Add Task to {COL_META[addCol]?.label}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="Task Title" size="small" fullWidth value={newTask.title}
                            onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))} />
                        <TextField label="Due Date" size="small" fullWidth placeholder="e.g. 3d, Tomorrow"
                            value={newTask.due} onChange={(e) => setNewTask((p) => ({ ...p, due: e.target.value }))} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setAddOpen(false)} sx={{ color: t.textSecondary }}>Cancel</Button>
                    <Button variant="contained" onClick={handleAdd} sx={{ bgcolor: t.accentPrimary }}>Add</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}