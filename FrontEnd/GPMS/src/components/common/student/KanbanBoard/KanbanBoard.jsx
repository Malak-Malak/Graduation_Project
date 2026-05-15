// src/components/common/student/KanbanBoard/KanbanBoard.jsx

import { useState, useEffect, useCallback, useRef } from "react";
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
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import requirementApi from "../../../../api/handler/endpoints/requirementApi";
import axiosInstance from "../../../../api/axiosInstance";
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

/* =================================================================
   CONSTANTS
================================================================= */
const COL_ORDER = ["todo", "inProgress", "done"];

const COL_META = {
    todo: { label: "To Do", color: "#5B8AF0" },
    inProgress: { label: "In Progress", color: "#E5973D" },
    done: { label: "Done", color: "#3DB97A" },
};

const COL_TO_STATUS = {
    todo: "To Do",
    inProgress: "In Progress",
    done: "Done",
};

const PRIORITY = {
    high: { color: "#E05C5C", bg: "rgba(224,92,92,0.12)", Icon: KeyboardArrowUpIcon, label: "High" },
    medium: { color: "#E5973D", bg: "rgba(229,151,61,0.12)", Icon: RemoveIcon, label: "Medium" },
    low: { color: "#8A8F9E", bg: "rgba(138,143,158,0.12)", Icon: KeyboardArrowDownIcon, label: "Low" },
};

const MBR_CLR = ["#5B8AF0", "#3DB97A", "#E5973D", "#9B6DE0", "#E05C5C", "#1ABCB0"];
const EMPTY_FORM = { title: "", description: "", deadline: "", assignedUserIds: [], priority: "medium" };
const isColId = (id) => COL_ORDER.includes(id);

/* =================================================================
   PRIORITY localStorage
================================================================= */
const PSTORE = "kanban_priorities_v1";
const pLoad = () => { try { return JSON.parse(localStorage.getItem(PSTORE) ?? "{}"); } catch { return {}; } };
const pSave = (taskId, val) => { const s = pLoad(); s[String(taskId)] = val; localStorage.setItem(PSTORE, JSON.stringify(s)); };
const pGet = (taskId) => pLoad()[String(taskId)] ?? "medium";
const pDel = (taskId) => { const s = pLoad(); delete s[String(taskId)]; localStorage.setItem(PSTORE, JSON.stringify(s)); };

/* =================================================================
   MEMBER HELPERS
================================================================= */
const getMemberId = (u) => u.userId ?? u.id;
const getMemberName = (u) => (u.fullName ?? u.name ?? "?").trim();
const getInitial = (u) => getMemberName(u).charAt(0).toUpperCase();

/* =================================================================
   DATE
================================================================= */
const formatDeadline = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    const diff = Math.ceil((d - new Date()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff < 0) return "Overdue";
    if (diff <= 6) return `${diff}d`;
    if (diff <= 13) return "1w";
    return d.toLocaleDateString();
};

/* =================================================================
   DATA MAPPER
================================================================= */
const mapTask = (task) => {
    const members = task.assignedMembers ?? task.assignedUsers ?? [];
    return {
        id: String(task.id),
        backendId: task.id,
        title: task.title ?? "Untitled",
        description: task.description ?? "",
        priority: pGet(task.id),
        due: task.deadline ? formatDeadline(task.deadline) : null,
        deadline: task.deadline ?? null,
        assignees: members.map(getInitial),
        assignedUsers: members,
        assignedUserIds: members.map(getMemberId),
        isAssigned: members.length > 0,
        comments: (task.comments ?? []).length,
        files: (task.files ?? []).length,
    };
};

const normaliseBoardResponse = (data) => {
    if (data && (Array.isArray(data.toDo) || Array.isArray(data.inProgress) || Array.isArray(data.done))) {
        return {
            todo: (data.toDo ?? []).map(mapTask),
            inProgress: (data.inProgress ?? []).map(mapTask),
            done: (data.done ?? []).map(mapTask),
        };
    }
    const S2C = {
        "To Do": "todo", "Todo": "todo", "todo": "todo",
        "In Progress": "inProgress", "InProgress": "inProgress", "inProgress": "inProgress",
        "Done": "done", "done": "done",
    };
    const cols = { todo: [], inProgress: [], done: [] };
    (Array.isArray(data) ? data : data?.tasks ?? []).forEach(t => {
        cols[S2C[t.status] ?? "todo"].push(mapTask(t));
    });
    return cols;
};

/* =================================================================
   THEME TOKENS
================================================================= */
function useTokens() {
    const theme = useTheme();
    const dark = theme.palette.mode === "dark";
    return {
        theme, dark,
        surfaceCard: dark ? "#22262b" : "#ffffff",
        surfaceCol: dark ? "#1e2226" : "#f0f1f4",
        surfaceInput: dark ? "#2a2f36" : "#ffffff",
        surfaceHover: dark ? "#2a2f36" : "#f7f8fa",
        border: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)",
        textPri: dark ? "#e2e5eb" : "#172b4d",
        textSec: dark ? "#8d9199" : "#5e6c84",
        textMut: dark ? "#555b67" : "#aab0be",
        dialogBg: dark ? "#252930" : "#ffffff",
    };
}

/* =================================================================
   CARD CONTENT
================================================================= */
function CardContent({ task, colId }) {
    const { textPri, textSec, textMut, surfaceCard } = useTokens();
    const p = PRIORITY[task.priority] ?? PRIORITY.medium;
    const c = COL_META[colId];
    const PIcon = p.Icon;
    return (
        <>
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
                    <Tooltip title={task.isAssigned ? `${task.assignees.length} assignee(s)` : "Unassigned"}>
                        <Box sx={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, bgcolor: task.isAssigned ? "#3DB97A" : "transparent", border: task.isAssigned ? "none" : `1.5px solid ${textMut}`, boxShadow: task.isAssigned ? "0 0 5px rgba(61,185,122,0.55)" : "none" }} />
                    </Tooltip>
                    {task.isAssigned ? (
                        <AvatarGroup max={3} sx={{ "& .MuiAvatar-root": { width: 20, height: 20, fontSize: "0.52rem", fontWeight: 800, border: `1.5px solid ${surfaceCard}` } }}>
                            {task.assignees.map((initial, j) => (
                                <Tooltip key={j} title={getMemberName(task.assignedUsers[j])}>
                                    <Avatar sx={{ bgcolor: MBR_CLR[j % MBR_CLR.length] }}>{initial}</Avatar>
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
        </>
    );
}

/* =================================================================
   SORTABLE CARD
================================================================= */
function SortableCard({ task, colId, onClick }) {
    const { surfaceCard, surfaceHover, border, dark } = useTokens();
    const c = COL_META[colId];
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
    return (
        <Paper ref={setNodeRef} elevation={0} onClick={onClick} sx={{
            p: "10px 12px 10px 16px", borderRadius: "8px", position: "relative", overflow: "hidden",
            border: `1px solid ${isDragging ? c.color + "80" : border}`,
            cursor: "grab", opacity: isDragging ? 0.15 : 1, bgcolor: surfaceCard,
            boxShadow: dark ? "0 1px 3px rgba(0,0,0,0.25)" : "0 1px 3px rgba(0,0,0,0.06)",
            transform: CSS.Transform.toString(transform),
            transition: transition ?? "border-color 0.15s, box-shadow 0.15s, transform 0.15s",
            touchAction: "none",
            "&:hover": { borderColor: c.color + "60", bgcolor: surfaceHover, boxShadow: dark ? `0 4px 14px rgba(0,0,0,0.4), 0 0 0 1px ${c.color}30` : `0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px ${c.color}30`, transform: "translateY(-1px)" },
        }} {...attributes} {...listeners}>
            <CardContent task={task} colId={colId} />
        </Paper>
    );
}

function OverlayCard({ task, colId }) {
    const { surfaceCard, dark } = useTokens();
    const c = COL_META[colId ?? "todo"];
    return (
        <Paper elevation={0} sx={{ p: "10px 12px 10px 16px", borderRadius: "8px", position: "relative", overflow: "hidden", border: `2px solid ${c.color}`, bgcolor: surfaceCard, cursor: "grabbing", width: 268, boxShadow: dark ? "0 12px 36px rgba(0,0,0,0.6)" : "0 12px 32px rgba(0,0,0,0.18)", transform: "rotate(1.2deg) scale(1.02)" }}>
            <CardContent task={task} colId={colId ?? "todo"} />
        </Paper>
    );
}

/* =================================================================
   COLUMN
   currentVersion: null = loading, 0 = free, 1+ = need repo
================================================================= */
function Column({ colId, tasks, onAdd, onCardClick, currentVersion, githubRepo }) {
    const { surfaceCol, border, textPri, textSec, textMut, dark } = useTokens();
    const c = COL_META[colId];
    const { setNodeRef, isOver } = useDroppable({ id: colId });

    // null = still loading → disable to avoid premature clicks
    const canAdd = currentVersion !== null && (currentVersion === 0 || Boolean(githubRepo));

    const getTooltipTitle = () => {
        if (currentVersion === null) return "Loading...";
        if (currentVersion === 0) return "Add task";
        if (!githubRepo) return "Link a GitHub repository first to add tasks";
        return "Add task";
    };

    return (
        <Box sx={{ flex: 1, minWidth: 262, maxWidth: 330, display: "flex", flexDirection: "column", borderRadius: "10px", border: `1px solid ${isOver ? c.color + "60" : border}`, bgcolor: isOver ? c.color + "08" : surfaceCol, transition: "border-color 0.14s, background-color 0.14s", overflow: "hidden" }}>
            <Box sx={{ px: 1.5, py: 1.2, bgcolor: dark ? c.color + "10" : c.color + "0d", borderBottom: `1px solid ${border}` }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" gap={0.9}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: c.color, boxShadow: `0 0 7px ${c.color}99` }} />
                        <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", color: textPri, textTransform: "uppercase", letterSpacing: "0.07em" }}>{c.label}</Typography>
                        <Box sx={{ px: 0.65, py: 0.1, borderRadius: "4px", bgcolor: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }}>
                            <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: textSec }}>{tasks.length}</Typography>
                        </Box>
                    </Stack>
                    <Tooltip title={getTooltipTitle()}>
                        <span>
                            <IconButton
                                size="small"
                                onClick={onAdd}
                                disabled={!canAdd}
                                sx={{
                                    width: 22, height: 22,
                                    color: canAdd ? textMut : (dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"),
                                    "&:hover": canAdd ? { color: c.color, bgcolor: c.color + "18" } : {},
                                    "&.Mui-disabled": { opacity: 0.4 },
                                }}
                            >
                                <AddIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Stack>
            </Box>
            <Box ref={setNodeRef} sx={{ px: 1, py: 1, flex: 1, overflowY: "auto", minHeight: 120, "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { bgcolor: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)", borderRadius: 2 } }}>
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <Stack spacing={0.75}>
                        {tasks.map(task => (
                            <SortableCard key={task.id} task={task} colId={colId} onClick={() => onCardClick(task, colId)} />
                        ))}
                    </Stack>
                </SortableContext>
                {tasks.length === 0 && (
                    <Box sx={{ height: 72, borderRadius: "7px", mt: 0.5, border: `1.5px dashed ${isOver ? c.color : dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.14s" }}>
                        <Typography sx={{ fontSize: "0.7rem", color: isOver ? c.color : textMut }}>{isOver ? "Drop here" : "No tasks"}</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

/* =================================================================
   TASK FORM FIELDS
================================================================= */
function TaskFormFields({ form, setForm, members, inputSx, accent }) {
    const { dark } = useTokens();
    const dateSx = { ...inputSx, "& input[type='date']": { colorScheme: dark ? "dark" : "light" }, "& input[type='date']::-webkit-calendar-picker-indicator": { opacity: 0.5, cursor: "pointer", filter: dark ? "invert(1)" : "none" } };
    return (
        <Stack spacing={2}>
            <TextField label="Title *" size="small" fullWidth autoFocus value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} sx={inputSx} />
            <TextField label="Description" size="small" fullWidth multiline rows={2} placeholder="What needs to be done?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} sx={inputSx} />
            <Stack direction="row" gap={1.5}>
                <TextField label="Deadline" size="small" type="date" InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split("T")[0] }} value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} sx={{ ...dateSx, flex: 1 }} />
                <FormControl size="small" sx={{ ...inputSx, minWidth: 110 }}>
                    <InputLabel>Priority</InputLabel>
                    <Select label="Priority" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                        {Object.entries(PRIORITY).map(([key, meta]) => (
                            <MenuItem key={key} value={key}>
                                <Stack direction="row" alignItems="center" gap={0.8}>
                                    <meta.Icon sx={{ fontSize: 13, color: meta.color }} />
                                    <Typography fontSize="0.82rem">{meta.label}</Typography>
                                </Stack>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>
            {members.length > 0 && (
                <FormControl size="small" fullWidth sx={inputSx}>
                    <InputLabel>Assignees</InputLabel>
                    <Select multiple label="Assignees" value={form.assignedUserIds}
                        onChange={e => setForm(p => ({ ...p, assignedUserIds: e.target.value }))}
                        renderValue={sel => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {sel.map((id, idx) => {
                                    const m = members.find(mb => getMemberId(mb) === id);
                                    return <Chip key={id} avatar={<Avatar sx={{ bgcolor: MBR_CLR[idx % MBR_CLR.length], fontSize: "0.5rem !important" }}>{m ? getInitial(m) : "?"}</Avatar>} label={m ? getMemberName(m) : id} size="small" sx={{ fontSize: "0.68rem", height: 22 }} />;
                                })}
                            </Box>
                        )}>
                        {members.map((m, i) => (
                            <MenuItem key={getMemberId(m)} value={getMemberId(m)}>
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <Avatar sx={{ width: 24, height: 24, fontSize: "0.62rem", fontWeight: 700, bgcolor: MBR_CLR[i % MBR_CLR.length] }}>{getInitial(m)}</Avatar>
                                    <Typography fontSize="0.82rem">{getMemberName(m)}</Typography>
                                </Stack>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}
        </Stack>
    );
}

/* =================================================================
   MAIN COMPONENT
================================================================= */
export default function KanbanBoard() {
    const { dark, border, textPri, textSec, textMut, dialogBg, surfaceInput } = useTokens();

    const [githubRepo, setGithubRepo] = useState(null);
    const [repoChecked, setRepoChecked] = useState(false);
    const [currentVersion, setCurrentVersion] = useState(null); // null=loading, 0=free, 1+=need repo

    const [columns, setColumns] = useState({ todo: [], inProgress: [], done: [] });
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const originColRef = useRef(null);
    const colsSnapshotRef = useRef(null);
    const apiCalledRef = useRef(false);

    const [activeTask, setActiveTask] = useState(null);
    const [activeCol, setActiveCol] = useState(null);

    const [selected, setSelected] = useState(null);
    const [selectedCol, setSelectedCol] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState(EMPTY_FORM);

    const [addOpen, setAddOpen] = useState(false);
    const [addCol, setAddCol] = useState("todo");
    const [addForm, setAddForm] = useState(EMPTY_FORM);

    const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
    const accent = "#5B8AF0";

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: "7px", fontSize: "0.875rem", bgcolor: surfaceInput,
            "& fieldset": { borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)" },
            "&:hover fieldset": { borderColor: dark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.25)" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: accent },
        },
        "& .MuiInputLabel-root.Mui-focused": { color: accent },
        "& .MuiInputLabel-root": { fontSize: "0.875rem" },
    };

    const total = Object.values(columns).flat().length;
    const doneN = columns.done.length;
    const pct = total > 0 ? Math.round((doneN / total) * 100) : 0;
    const allTasks = Object.values(columns).flat();

    const showSnack = (msg, severity = "success") => setSnack({ open: true, msg, severity });

    const findColOf = (taskId, cols) => COL_ORDER.find(c => cols[c].some(t => t.id === taskId));
    const findTaskIn = (taskId, cols) => Object.values(cols).flat().find(t => t.id === taskId);

    /* ── FETCH REPO + VERSION ── */
    useEffect(() => {
        requirementApi.getGithubRepo()
            .then((data) => {
                const repo = typeof data === "string" ? data : (data?.githubRepo ?? null);
                setGithubRepo(repo || null);
            })
            .catch(() => setGithubRepo(null))
            .finally(() => setRepoChecked(true));

        axiosInstance.get("/Student/current-version")
            .then((r) => setCurrentVersion(r.data?.currentVersion ?? null))
            .catch(() => setCurrentVersion(null));
    }, []);

    /* ── FETCH BOARD ── */
    const fetchBoard = useCallback(async () => {
        try {
            setLoading(true);
            const [boardRes, membersRes] = await Promise.all([getKanbanBoard(), getTeamMembers()]);
            setColumns(normaliseBoardResponse(boardRes.data));
            setMembers(membersRes.data ?? []);
        } catch (err) {
            console.error("Board load failed:", err);
            showSnack("Failed to load board.", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchBoard(); }, [fetchBoard]);

    /* ── DRAG START ── */
    const handleDragStart = ({ active }) => {
        setColumns(prev => {
            originColRef.current = findColOf(active.id, prev);
            colsSnapshotRef.current = prev;
            apiCalledRef.current = false;
            setActiveCol(originColRef.current);
            setActiveTask(findTaskIn(active.id, prev));
            return prev;
        });
    };

    /* ── DRAG OVER — visual only, NO API ── */
    const handleDragOver = ({ active, over }) => {
        if (!over) return;
        setColumns(prev => {
            const fromCol = findColOf(active.id, prev);
            if (!fromCol) return prev;
            const toCol = isColId(over.id) ? over.id : findColOf(over.id, prev);
            if (!toCol || fromCol === toCol) return prev;
            const task = prev[fromCol].find(t => t.id === active.id);
            if (!task) return prev;
            return {
                ...prev,
                [fromCol]: prev[fromCol].filter(t => t.id !== active.id),
                [toCol]: [...prev[toCol], task],
            };
        });
    };

    /* ── DRAG END — ONE API call max ── */
    const handleDragEnd = async ({ active, over }) => {
        const originCol = originColRef.current;
        const snapshot = colsSnapshotRef.current;
        originColRef.current = null;
        colsSnapshotRef.current = null;
        setActiveTask(null);
        setActiveCol(null);

        if (!over || !originCol || !snapshot) {
            if (snapshot) setColumns(snapshot);
            return;
        }

        setColumns(prev => {
            const finalCol = findColOf(active.id, prev);

            if (finalCol === originCol) {
                if (!isColId(over.id)) {
                    const oi = prev[originCol].findIndex(t => t.id === active.id);
                    const ni = prev[originCol].findIndex(t => t.id === over.id);
                    if (oi !== -1 && ni !== -1 && oi !== ni)
                        return { ...prev, [originCol]: arrayMove(prev[originCol], oi, ni) };
                }
                return prev;
            }

            if (!apiCalledRef.current) {
                apiCalledRef.current = true;
                const task = findTaskIn(active.id, prev);
                if (task) {
                    const status = COL_TO_STATUS[finalCol];
                    updateTaskStatus({ taskId: task.backendId, status })
                        .then(() => {
                            showSnack(`Moved to ${COL_META[finalCol].label}`);
                            fetchBoard();
                        })
                        .catch(err => {
                            console.error("update-status error:", err?.response?.data ?? err);
                            showSnack("Failed to move task.", "error");
                            setColumns(snapshot);
                        });
                }
            }
            return prev;
        });
    };

    /* ── ADD TASK ── */
    const openAdd = (col) => {
        // Guard: double-check before opening dialog
        const canAdd = currentVersion !== null && (currentVersion === 0 || Boolean(githubRepo));
        if (!canAdd) return;
        setAddCol(col);
        setAddForm(EMPTY_FORM);
        setAddOpen(true);
    };

    const handleAdd = async () => {
        if (!addForm.title.trim()) return;
        try {
            setSaving(true);
            const payload = {
                title: addForm.title.trim(),
                description: addForm.description.trim(),
                status: COL_TO_STATUS[addCol],
                assignedUserIds: (addForm.assignedUserIds ?? []).map(Number).filter(n => n > 0),
            };
            if (addForm.deadline) payload.deadline = new Date(addForm.deadline).toISOString();

            const res = await createTask(payload);

            const newId = res?.data?.id ?? res?.data?.taskId ?? res?.data;
            if (newId) pSave(newId, addForm.priority);

            setAddOpen(false);
            showSnack("Task created!");
            fetchBoard();
        } catch (err) {
            console.error("Create task error:", err?.response?.data ?? err);
            showSnack("Failed to create task.", "error");
        } finally { setSaving(false); }
    };

    /* ── OPEN DETAIL ── */
    const openDetail = (task, colId) => {
        setSelected(task);
        setSelectedCol(colId);
        setEditForm({
            title: task.title,
            description: task.description,
            deadline: task.deadline ? task.deadline.substring(0, 10) : "",
            assignedUserIds: task.assignedUserIds ?? [],
            priority: task.priority ?? "medium",
        });
        setEditMode(false);
        setDetailOpen(true);
    };

    /* ── EDIT TASK ── */
    const handleEdit = async () => {
        if (!editForm.title.trim()) return;
        try {
            setSaving(true);
            const payload = {
                title: editForm.title.trim(),
                description: editForm.description.trim(),
                assignedUserIds: (editForm.assignedUserIds ?? []).map(Number).filter(n => n > 0),
            };
            if (editForm.deadline) payload.deadline = new Date(editForm.deadline).toISOString();

            await updateTask(selected.backendId, payload);
            pSave(selected.backendId, editForm.priority);

            setDetailOpen(false);
            showSnack("Task updated!");
            fetchBoard();
        } catch (err) {
            console.error("Update task error:", err?.response?.data ?? err);
            showSnack("Failed to update task.", "error");
        } finally { setSaving(false); }
    };

    /* ── MOVE FROM DIALOG ── */
    const handleMoveTask = async (toCol) => {
        if (!selectedCol || selectedCol === toCol) return;
        setColumns(prev => ({
            ...prev,
            [selectedCol]: prev[selectedCol].filter(tk => tk.id !== selected.id),
            [toCol]: [...prev[toCol], { ...selected }],
        }));
        setDetailOpen(false);
        try {
            const status = COL_TO_STATUS[toCol];
            await updateTaskStatus({ taskId: selected.backendId, status });
            showSnack(`Moved to ${COL_META[toCol].label}`);
            fetchBoard();
        } catch (err) {
            console.error("Move task error:", err?.response?.data ?? err);
            showSnack("Failed to move task.", "error");
            fetchBoard();
        }
    };

    /* ── DELETE ── */
    const handleDelete = async () => {
        if (!selected) return;
        try {
            setSaving(true);
            await deleteTask(selected.backendId);
            pDel(selected.backendId);
            setDetailOpen(false);
            showSnack("Task deleted.");
            fetchBoard();
        } catch (err) {
            console.error("Delete task error:", err?.response?.data ?? err);
            showSnack("Failed to delete task.", "error");
        } finally { setSaving(false); }
    };

    if (loading) return (
        <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Stack alignItems="center" gap={2}>
                <CircularProgress size={26} sx={{ color: accent }} />
                <Typography sx={{ color: "#8d9199", fontSize: "0.8rem" }}>Loading board...</Typography>
            </Stack>
        </Box>
    );

    const dlgPaper = { sx: { borderRadius: "12px", border: `1px solid ${border}`, bgcolor: dialogBg, backgroundImage: "none" } };
    const BtnPrimary = { bgcolor: accent, borderRadius: "7px", px: 3, textTransform: "none", fontWeight: 700, boxShadow: "none", "&:hover": { bgcolor: "#4878e8", boxShadow: "none" }, "&.Mui-disabled": { opacity: 0.4 } };
    const BtnCancel = { color: textSec, textTransform: "none", fontWeight: 500, borderRadius: "7px", px: 2 };

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>

            {/* HEADER */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                <Box>
                    <Typography sx={{ color: textPri, mb: 0.3, fontSize: "1.2rem", fontWeight: 700 }}>Kanban Board</Typography>
                    <Stack direction="row" alignItems="center" gap={1}>
                        <Typography sx={{ color: textSec, fontSize: "0.74rem" }}>{doneN} of {total} completed</Typography>
                        <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: textMut }} />
                        <Stack direction="row" alignItems="center" gap={0.4}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#3DB97A", boxShadow: "0 0 5px rgba(61,185,122,0.55)" }} />
                            <Typography sx={{ fontSize: "0.7rem", color: textSec }}>{allTasks.filter(t => t.isAssigned).length} assigned</Typography>
                        </Stack>
                        <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: textMut }} />
                        <Stack direction="row" alignItems="center" gap={0.4}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", border: `1.5px solid ${textMut}` }} />
                            <Typography sx={{ fontSize: "0.7rem", color: textSec }}>{allTasks.filter(t => !t.isAssigned).length} unassigned</Typography>
                        </Stack>
                    </Stack>
                </Box>
                <Box sx={{ px: 2, py: 1.2, borderRadius: "10px", border: `1px solid ${border}`, bgcolor: dark ? "rgba(255,255,255,0.03)" : "#ffffff", minWidth: 155, boxShadow: dark ? "none" : "0 1px 4px rgba(0,0,0,0.06)" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.7}>
                        <Typography sx={{ fontSize: "0.63rem", color: textSec, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Progress</Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: "#3DB97A", fontWeight: 800 }}>{pct}%</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={pct} sx={{ height: 5, borderRadius: 3, bgcolor: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)", "& .MuiLinearProgress-bar": { bgcolor: "#3DB97A", borderRadius: 3 } }} />
                </Box>
            </Stack>

            {/* BOARD */}
            <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                <Box sx={{ display: "flex", gap: 1.5, flex: 1, overflowX: "auto", overflowY: "hidden", pb: 1 }}>
                    {COL_ORDER.map(colId => (
                        <Column
                            key={colId}
                            colId={colId}
                            tasks={columns[colId]}
                            onAdd={() => openAdd(colId)}
                            onCardClick={openDetail}
                            currentVersion={currentVersion}
                            githubRepo={githubRepo}
                        />
                    ))}
                </Box>
                <DragOverlay dropAnimation={{ duration: 130, easing: "ease" }}>
                    {activeTask ? <OverlayCard task={activeTask} colId={activeCol} /> : null}
                </DragOverlay>
            </DndContext>

            {/* DETAIL DIALOG */}
            {selected && (
                <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth PaperProps={dlgPaper}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2, borderBottom: `1px solid ${border}` }}>
                        <Stack direction="row" alignItems="center" gap={1.2}>
                            {(() => {
                                const p = PRIORITY[selected.priority] ?? PRIORITY.medium;
                                const PIcon = p.Icon;
                                return (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, px: 0.7, py: 0.25, borderRadius: "4px", bgcolor: p.bg }}>
                                        <PIcon sx={{ fontSize: 11, color: p.color }} />
                                        <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: p.color }}>{p.label}</Typography>
                                    </Box>
                                );
                            })()}
                            <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: textPri }}>{selected.title}</Typography>
                            <Tooltip title={selected.isAssigned ? "Assigned" : "Unassigned"}>
                                <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: selected.isAssigned ? "#3DB97A" : "transparent", border: selected.isAssigned ? "none" : `1.5px solid ${textMut}`, boxShadow: selected.isAssigned ? "0 0 5px rgba(61,185,122,0.5)" : "none" }} />
                            </Tooltip>
                        </Stack>
                        <Stack direction="row" gap={0.5}>
                            <Tooltip title={editMode ? "Cancel edit" : "Edit"}>
                                <IconButton size="small" onClick={() => setEditMode(m => !m)} sx={{ color: textSec, "&:hover": { color: accent } }}>
                                    <EditOutlinedIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete task">
                                <IconButton size="small" onClick={handleDelete} disabled={saving} sx={{ color: textSec, "&:hover": { color: "#E05C5C" } }}>
                                    <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                            </Tooltip>
                            <IconButton size="small" onClick={() => setDetailOpen(false)} sx={{ color: textSec }}>
                                <CloseIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Stack>
                    </Box>
                    <DialogContent sx={{ px: 3, py: 2.5 }}>
                        {editMode ? (
                            <TaskFormFields form={editForm} setForm={setEditForm} members={members} inputSx={inputSx} accent={accent} />
                        ) : (
                            <Stack spacing={2.5}>
                                {selected.description && (
                                    <Typography sx={{ fontSize: "0.84rem", color: textSec, lineHeight: 1.65 }}>{selected.description}</Typography>
                                )}
                                {selected.due && (
                                    <Stack direction="row" alignItems="center" gap={1}>
                                        <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: accent }} />
                                        <Typography fontSize="0.82rem" sx={{ color: textSec }}>
                                            Due: <Box component="span" sx={{ fontWeight: 700, color: textPri }}>{selected.due}</Box>
                                        </Typography>
                                    </Stack>
                                )}
                                <Box>
                                    <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: textSec, mb: 1 }}>Assignees</Typography>
                                    {selected.isAssigned ? (
                                        <AvatarGroup max={5} sx={{ justifyContent: "flex-start", "& .MuiAvatar-root": { width: 30, height: 30, fontSize: "0.72rem", fontWeight: 700 } }}>
                                            {selected.assignees.map((initial, j) => (
                                                <Tooltip key={j} title={getMemberName(selected.assignedUsers[j])}>
                                                    <Avatar sx={{ bgcolor: MBR_CLR[j % MBR_CLR.length] }}>{initial}</Avatar>
                                                </Tooltip>
                                            ))}
                                        </AvatarGroup>
                                    ) : (
                                        <Stack direction="row" alignItems="center" gap={0.8}>
                                            <PersonOffOutlinedIcon sx={{ fontSize: 16, color: textMut }} />
                                            <Typography sx={{ fontSize: "0.8rem", color: textMut, fontStyle: "italic" }}>No one assigned yet</Typography>
                                        </Stack>
                                    )}
                                </Box>
                                <Box>
                                    <Stack direction="row" alignItems="center" gap={0.7} mb={1}>
                                        <SwapHorizIcon sx={{ fontSize: 14, color: textSec }} />
                                        <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: textSec }}>Move Task</Typography>
                                    </Stack>
                                    <Stack direction="row" gap={1} flexWrap="wrap">
                                        {COL_ORDER.filter(colId => colId !== selectedCol).map(colId => {
                                            const m = COL_META[colId];
                                            return (
                                                <Button key={colId} size="small" variant="outlined" onClick={() => handleMoveTask(colId)}
                                                    sx={{ borderColor: m.color + "60", color: m.color, borderRadius: "7px", fontSize: "0.75rem", textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: m.color + "12", borderColor: m.color } }}>
                                                    to {m.label}
                                                </Button>
                                            );
                                        })}
                                    </Stack>
                                </Box>
                            </Stack>
                        )}
                    </DialogContent>
                    {editMode && (
                        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                            <Button onClick={() => setEditMode(false)} sx={BtnCancel}>Cancel</Button>
                            <Button variant="contained" onClick={handleEdit} disabled={saving || !editForm.title.trim()} sx={BtnPrimary}>
                                {saving ? <CircularProgress size={15} sx={{ color: "#fff" }} /> : "Save Changes"}
                            </Button>
                        </DialogActions>
                    )}
                </Dialog>
            )}

            {/* ADD DIALOG */}
            <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth onKeyDown={e => e.stopPropagation()} PaperProps={dlgPaper}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2, borderBottom: `1px solid ${border}` }}>
                    <Box>
                        <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: textPri }}>New Task</Typography>
                        <Typography fontSize="0.7rem" sx={{ color: textSec, mt: 0.2 }}>
                            Adding to <Box component="span" sx={{ color: COL_META[addCol].color, fontWeight: 700 }}>{COL_META[addCol]?.label}</Box>
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setAddOpen(false)} sx={{ color: textSec }}>
                        <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Box>
                <DialogContent sx={{ px: 3, py: 2.5 }}>
                    <TaskFormFields form={addForm} setForm={setAddForm} members={members} inputSx={inputSx} accent={accent} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button onClick={() => setAddOpen(false)} sx={BtnCancel}>Cancel</Button>
                    <Button variant="contained" onClick={handleAdd} disabled={saving || !addForm.title.trim()} sx={BtnPrimary}>
                        {saving ? <CircularProgress size={15} sx={{ color: "#fff" }} /> : "Create Task"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* SNACKBAR */}
            <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: "7px", fontSize: "0.8rem" }}>{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}