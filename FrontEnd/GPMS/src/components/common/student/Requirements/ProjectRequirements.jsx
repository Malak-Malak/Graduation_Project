// src/components/common/student/Requirements/ProjectRequirements.jsx

import { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Stack, Paper, Button, IconButton, Tooltip,
    CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, Select, InputLabel,
    FormControl, FormHelperText, InputAdornment,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import FunctionsOutlinedIcon from "@mui/icons-material/FunctionsOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import requirementApi from "../../../../api/handler/endpoints/requirementApi";

// ── Constants ─────────────────────────────────────────────────────────────────
const ACCENT = "#6D8A7D";

const PRIORITY_OPTIONS = ["Low", "Medium", "High"];
const TYPE_OPTIONS = ["Functional", "Non-Functional"];
const FILTER_OPTIONS = ["All", "Functional", "Non-Functional", "High"];

const EMPTY_FORM = { title: "", description: "", priority: "", type: "" };

const PRIORITY_META = {
    Low: { bg: "rgba(99,153,34,0.10)", border: "rgba(99,153,34,0.25)", color: "#3B6D11", dot: "#639922" },
    Medium: { bg: "rgba(186,117,23,0.10)", border: "rgba(186,117,23,0.25)", color: "#854F0B", dot: "#BA7517" },
    High: { bg: "rgba(226,75,74,0.10)", border: "rgba(226,75,74,0.25)", color: "#A32D2D", dot: "#E24B4A" },
};

const TYPE_META = {
    "Functional": { bg: "rgba(55,138,221,0.08)", border: "rgba(55,138,221,0.22)", color: "#185FA5" },
    "Non-Functional": { bg: "rgba(127,119,221,0.08)", border: "rgba(127,119,221,0.22)", color: "#534AB7" },
};

const PRIORITY_BARS = { Low: 33, Medium: 66, High: 100 };
const PRIORITY_BAR_COLORS = { Low: "#639922", Medium: "#BA7517", High: "#E24B4A" };

// ── GitHub URL validator ──────────────────────────────────────────────────────
const isValidGithubUrl = (url) =>
    /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(\/.*)?$/.test(url.trim());

// ── Sub-components ────────────────────────────────────────────────────────────
function PriorityBar({ priority, accentColor }) {
    const pct = PRIORITY_BARS[priority] ?? 0;
    const color = PRIORITY_BAR_COLORS[priority] ?? accentColor;
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <Box sx={{ flex: 1, height: 3, borderRadius: 99, bgcolor: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: color, borderRadius: 99, transition: "width 0.4s ease" }} />
            </Box>
            <Typography sx={{ fontSize: "0.65rem", color, fontWeight: 700, minWidth: 28 }}>
                {priority}
            </Typography>
        </Box>
    );
}

// ── GitHub Repo Banner ────────────────────────────────────────────────────────
function GithubRepoBanner({ githubRepo, accentColor, isDark, onEdit }) {
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const cardBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.018)";

    return (
        <Box sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 1.5, px: 2, py: 1.2, mb: 2.5, borderRadius: 2,
            bgcolor: cardBg, border: `1px solid ${border}`,
        }}>
            <Stack direction="row" alignItems="center" gap={1}>
                <Box sx={{
                    width: 28, height: 28, borderRadius: 1.5, flexShrink: 0,
                    bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <GitHubIcon sx={{ fontSize: 15, color: isDark ? "#ccc" : "#333" }} />
                </Box>
                <Box>
                    <Typography sx={{ fontSize: "0.67rem", color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", letterSpacing: "0.04em", mb: 0.1 }}>
                        GITHUB REPOSITORY
                    </Typography>
                    <Typography
                        component="a"
                        href={githubRepo}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            fontSize: "0.8rem", fontWeight: 600,
                            color: accentColor, textDecoration: "none",
                            "&:hover": { textDecoration: "underline" },
                        }}
                    >
                        {githubRepo.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
                    </Typography>
                </Box>
            </Stack>
            <Stack direction="row" alignItems="center" gap={1}>
                <Stack direction="row" alignItems="center" gap={0.4}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 13, color: "#3DB97A" }} />
                    <Typography sx={{ fontSize: "0.7rem", color: "#3DB97A", fontWeight: 600 }}>Linked</Typography>
                </Stack>
                <Tooltip title="Edit repository">
                    <IconButton size="small" onClick={onEdit} sx={{
                        color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
                        "&:hover": { color: accentColor, bgcolor: `${accentColor}10` },
                    }}>
                        <EditOutlinedIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                </Tooltip>
            </Stack>
        </Box>
    );
}

// ── No Repo Banner (locked state) ─────────────────────────────────────────────
function NoRepoBanner({ accentColor, isDark, onAddRepo }) {
    return (
        <Box sx={{
            textAlign: "center", py: 7,
            border: `1.5px dashed ${accentColor}30`,
            borderRadius: 3,
            bgcolor: `${accentColor}04`,
        }}>
            <Box sx={{
                width: 52, height: 52, borderRadius: 3,
                bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                mx: "auto", mb: 2,
            }}>
                <LockOutlinedIcon sx={{ fontSize: 24, color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)" }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", mb: 0.5, color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.65)" }}>
                GitHub Repository Required
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)", mb: 3, maxWidth: 340, mx: "auto", lineHeight: 1.6 }}>
                You must link your project's GitHub repository before you can add or manage requirements.
            </Typography>
            <Button
                variant="contained"
                size="small"
                startIcon={<GitHubIcon />}
                onClick={onAddRepo}
                sx={{
                    bgcolor: accentColor, borderRadius: 2, boxShadow: "none",
                    fontWeight: 600, fontSize: "0.82rem",
                    "&:hover": { bgcolor: accentColor, filter: "brightness(0.92)", boxShadow: "none" },
                }}
            >
                Link GitHub Repository
            </Button>
        </Box>
    );
}

// ── Requirement Card ──────────────────────────────────────────────────────────
function RequirementCard({ req, index, accentColor, isDark, onEdit, onDelete, isDeleting, onCancelDelete, t }) {
    const tm = TYPE_META[req.type] ?? {};
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
    const cardBg = isDark ? "rgba(255,255,255,0.025)" : "#fff";
    const accentLine = isDark ? `${accentColor}55` : `${accentColor}33`;

    return (
        <Paper elevation={0} sx={{
            borderRadius: 2.5, bgcolor: cardBg,
            border: `1px solid ${border}`, borderLeft: `3px solid ${accentColor}`,
            overflow: "hidden", transition: "box-shadow 0.15s, border-color 0.15s",
            "&:hover": {
                boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.25)" : "0 4px 16px rgba(0,0,0,0.07)",
                borderLeftColor: accentColor,
            },
        }}>
            {/* Top strip */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{
                px: 2, py: 1,
                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
                bgcolor: isDark ? "rgba(255,255,255,0.02)" : `${accentColor}06`,
            }}>
                <Stack direction="row" alignItems="center" gap={1.2}>
                    {/* Index circle */}
                    <Box sx={{
                        width: 22, height: 22, borderRadius: "50%",
                        bgcolor: `${accentColor}18`, color: accentColor,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.65rem", fontWeight: 700, flexShrink: 0,
                        border: `1px solid ${accentLine}`,
                    }}>
                        {index + 1}
                    </Box>
                    {/* Type badge */}
                    {req.type && (
                        <Box sx={{
                            px: 1, py: 0.2, borderRadius: 1,
                            bgcolor: tm.bg, border: `1px solid ${tm.border}`,
                            display: "flex", alignItems: "center", gap: 0.5,
                        }}>
                            {req.type === "Functional"
                                ? <FunctionsOutlinedIcon sx={{ fontSize: 11, color: tm.color }} />
                                : <LayersOutlinedIcon sx={{ fontSize: 11, color: tm.color }} />
                            }
                            <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: tm.color, letterSpacing: "0.03em" }}>
                                {req.type}
                            </Typography>
                        </Box>
                    )}
                </Stack>

                {/* Actions */}
                {isDeleting ? (
                    <Stack direction="row" alignItems="center" gap={0.5}>
                        <Typography sx={{ fontSize: "0.72rem", color: "#A32D2D", mr: 0.3 }}>Delete?</Typography>
                        <Tooltip title="Confirm">
                            <IconButton size="small" onClick={() => onDelete(req.id)} sx={{ color: "#A32D2D", "&:hover": { bgcolor: "rgba(226,75,74,0.1)" } }}>
                                <CheckOutlinedIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                            <IconButton size="small" onClick={onCancelDelete} sx={{ color: t.textTertiary }}>
                                <CloseOutlinedIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                ) : (
                    <Stack direction="row" gap={0.3}>
                        <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => onEdit(req)} sx={{ color: t.textTertiary, "&:hover": { color: accentColor, bgcolor: `${accentColor}10` } }}>
                                <EditOutlinedIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => onDelete(req.id, true)} sx={{ color: t.textTertiary, "&:hover": { color: "#A32D2D", bgcolor: "rgba(226,75,74,0.08)" } }}>
                                <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                )}
            </Stack>

            {/* Body */}
            <Box sx={{ px: 2.5, pt: 1.5, pb: 2 }}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: t.textPrimary, mb: 0.5, lineHeight: 1.4 }}>
                    {req.title}
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", color: t.textSecondary, lineHeight: 1.7, mb: 1.2 }}>
                    {req.description}
                </Typography>
                {req.priority && <PriorityBar priority={req.priority} accentColor={accentColor} />}
            </Box>
        </Paper>
    );
}

// ── Stats Row ─────────────────────────────────────────────────────────────────
function StatsRow({ requirements, accentColor, isDark }) {
    const total = requirements.length;
    const functional = requirements.filter((r) => r.type === "Functional").length;
    const nonFunctional = requirements.filter((r) => r.type === "Non-Functional").length;
    const highPriority = requirements.filter((r) => r.priority === "High").length;

    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
    const cardBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.018)";

    const stats = [
        { label: "Total", value: total, color: accentColor },
        { label: "Functional", value: functional, color: "#185FA5" },
        { label: "Non-Functional", value: nonFunctional, color: "#534AB7" },
        { label: "High Priority", value: highPriority, color: "#A32D2D" },
    ];

    return (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1.5, mb: 3 }}>
            {stats.map(({ label, value, color }) => (
                <Box key={label} sx={{ px: 1.5, py: 1.2, borderRadius: 2, bgcolor: cardBg, border: `1px solid ${border}`, textAlign: "center" }}>
                    <Typography sx={{ fontSize: "1.35rem", fontWeight: 700, color, lineHeight: 1.1 }}>{value}</Typography>
                    <Typography sx={{ fontSize: "0.67rem", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", mt: 0.3, letterSpacing: "0.03em" }}>
                        {label}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProjectRequirements() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const t = theme.palette.custom ?? {};
    const accentColor = t.accentPrimary ?? ACCENT;

    // ── State ─────────────────────────────────────────────────────────────────
    const [requirements, setRequirements] = useState([]);
    const [githubRepo, setGithubRepo] = useState(null);   // null = not loaded yet
    const [repoLoading, setRepoLoading] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Repo dialog
    const [repoDialogOpen, setRepoDialogOpen] = useState(false);
    const [repoInput, setRepoInput] = useState("");
    const [repoError, setRepoError] = useState("");
    const [repoSaving, setRepoSaving] = useState(false);

    // Requirement dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [filter, setFilter] = useState("All");

    // ── Fetch GitHub Repo ─────────────────────────────────────────────────────
    const fetchGithubRepo = useCallback(async () => {
        setRepoLoading(true);
        try {
            const data = await requirementApi.getGithubRepo();
            // Backend may return { githubRepo: "..." } or just a string
            const repo = typeof data === "string" ? data : (data?.githubRepo ?? null);
            setGithubRepo(repo || null);
        } catch {
            setGithubRepo(null);
        } finally {
            setRepoLoading(false);
        }
    }, []);

    // ── Fetch Requirements ────────────────────────────────────────────────────
    const fetchRequirements = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await requirementApi.getAll();
            setRequirements(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.response?.data?.message ?? err?.message ?? "Failed to load requirements.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGithubRepo();
        fetchRequirements();
    }, [fetchGithubRepo, fetchRequirements]);

    // ── Repo Dialog ───────────────────────────────────────────────────────────
    const openRepoDialog = () => {
        setRepoInput(githubRepo ?? "");
        setRepoError("");
        setRepoDialogOpen(true);
    };

    const handleSaveRepo = async () => {
        const url = repoInput.trim();
        if (!url) { setRepoError("GitHub repository URL is required."); return; }
        if (!isValidGithubUrl(url)) { setRepoError("Please enter a valid GitHub repository URL (e.g. https://github.com/user/repo)."); return; }

        setRepoSaving(true);
        setRepoError("");
        try {
            await requirementApi.setGithubRepo(url);
            setGithubRepo(url);
            setRepoDialogOpen(false);
        } catch (err) {
            setRepoError(err?.response?.data?.message ?? "Failed to save repository. Please try again.");
        } finally {
            setRepoSaving(false);
        }
    };

    // ── Requirement Dialog ────────────────────────────────────────────────────
    const openAdd = () => {
        setEditTarget(null);
        setForm(EMPTY_FORM);
        setFormErrors({});
        setDialogOpen(true);
    };

    const openEdit = (req) => {
        setEditTarget(req);
        setForm({
            title: req.title ?? "",
            description: req.description ?? "",
            priority: req.priority ?? "",
            type: req.type ?? "",
        });
        setFormErrors({});
        setDialogOpen(true);
    };

    const closeDialog = () => { if (!saving) setDialogOpen(false); };

    const validate = () => {
        const errs = {};
        if (!form.title.trim()) errs.title = "Title is required.";
        if (!form.description.trim()) errs.description = "Description is required.";
        if (!form.priority) errs.priority = "Priority is required.";
        if (!form.type) errs.type = "Type is required.";
        return errs;
    };

    const handleSave = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setFormErrors(errs); return; }

        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            priority: form.priority,
            type: form.type,
        };

        setSaving(true);
        setFormErrors({});
        try {
            if (editTarget) {
                await requirementApi.update(editTarget.id, payload);
            } else {
                await requirementApi.add(payload);
            }
            await fetchRequirements();
            setDialogOpen(false);
        } catch (err) {
            setFormErrors({ api: err?.response?.data?.message ?? "Something went wrong. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDeleteAction = async (id, isConfirm = false) => {
        if (isConfirm) { setDeletingId(id); return; }
        setRequirements((prev) => prev.filter((r) => r.id !== id));
        setDeletingId(null);
        try {
            await requirementApi.remove(id);
        } catch {
            await fetchRequirements();
        }
    };

    // ── Design tokens ─────────────────────────────────────────────────────────
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const paperBg = theme.palette.background.paper;

    const fieldSx = {
        mt: 1.5,
        "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: accentColor },
        },
        "& .MuiInputLabel-root.Mui-focused": { color: accentColor },
    };

    const filtered = requirements.filter((r) => {
        if (filter === "All") return true;
        if (filter === "High") return r.priority === "High";
        return r.type === filter;
    });

    const hasRepo = Boolean(githubRepo);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <Box sx={{ width: "100%", mx: "auto" }}>

            {/* ══ HEADER ══════════════════════════════════════════════════════ */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                    <Stack direction="row" alignItems="center" gap={1.2} mb={0.5}>
                        <Box sx={{
                            width: 32, height: 32, borderRadius: 1.5,
                            bgcolor: `${accentColor}15`, border: `1px solid ${accentColor}30`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <AssignmentOutlinedIcon sx={{ fontSize: 17, color: accentColor }} />
                        </Box>
                        <Typography variant="h2" sx={{ color: t.textPrimary, fontWeight: 700 }}>
                            Project Requirements
                        </Typography>
                    </Stack>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.83rem", pl: "44px" }}>
                        Define and manage functional and non-functional requirements
                    </Typography>
                </Box>

                {/* Add button — disabled if no repo */}
                <Tooltip title={!hasRepo ? "Link a GitHub repository first to add requirements" : ""}>
                    <span>
                        <Button
                            variant="contained"
                            startIcon={<AddOutlinedIcon />}
                            onClick={openAdd}
                            disabled={!hasRepo}
                            sx={{
                                bgcolor: accentColor, borderRadius: 2, flexShrink: 0,
                                fontWeight: 600, fontSize: "0.85rem", boxShadow: "none",
                                "&:hover": { bgcolor: accentColor, filter: "brightness(0.92)", boxShadow: "none" },
                                "&.Mui-disabled": { opacity: 0.45 },
                            }}
                        >
                            Add
                        </Button>
                    </span>
                </Tooltip>
            </Stack>

            {/* ══ LOADING (initial) ════════════════════════════════════════════ */}
            {(repoLoading || loading) && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress sx={{ color: accentColor }} size={28} />
                </Box>
            )}

            {/* ══ CONTENT (after loading) ══════════════════════════════════════ */}
            {!repoLoading && !loading && (
                <>
                    {/* GitHub repo banner — always visible once loaded */}
                    {hasRepo ? (
                        <GithubRepoBanner
                            githubRepo={githubRepo}
                            accentColor={accentColor}
                            isDark={isDark}
                            onEdit={openRepoDialog}
                        />
                    ) : null}

                    {/* Error */}
                    {error && (
                        <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>{error}</Alert>
                    )}

                    {/* No repo → locked state */}
                    {!hasRepo && (
                        <NoRepoBanner
                            accentColor={accentColor}
                            isDark={isDark}
                            onAddRepo={openRepoDialog}
                        />
                    )}

                    {/* Has repo → show requirements */}
                    {hasRepo && (
                        <>
                            {/* Stats */}
                            {requirements.length > 0 && (
                                <StatsRow requirements={requirements} accentColor={accentColor} isDark={isDark} />
                            )}

                            {/* Filter tabs */}
                            {requirements.length > 0 && (
                                <Stack direction="row" gap={0.8} mb={2.5} flexWrap="wrap">
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mr: 0.5 }}>
                                        <TuneOutlinedIcon sx={{ fontSize: 14, color: t.textSecondary ?? "text.secondary" }} />
                                        <Typography sx={{ fontSize: "0.72rem", color: t.textSecondary ?? "text.secondary" }}>Filter:</Typography>
                                    </Box>
                                    {FILTER_OPTIONS.map((f) => {
                                        const active = filter === f;
                                        return (
                                            <Box key={f} onClick={() => setFilter(f)} sx={{
                                                px: 1.5, py: 0.4, borderRadius: 99, cursor: "pointer",
                                                fontSize: "0.75rem", fontWeight: active ? 700 : 400,
                                                bgcolor: active ? accentColor : "transparent",
                                                color: active ? "#fff" : (t.textSecondary ?? "text.secondary"),
                                                border: `1px solid ${active ? accentColor : border}`,
                                                transition: "all 0.15s ease",
                                                "&:hover": { bgcolor: active ? accentColor : `${accentColor}12`, borderColor: accentColor },
                                            }}>
                                                {f}
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            )}

                            {/* Empty state (has repo but no requirements yet) */}
                            {requirements.length === 0 && (
                                <Box sx={{
                                    textAlign: "center", py: 8,
                                    border: `1.5px dashed ${accentColor}30`,
                                    borderRadius: 3, bgcolor: `${accentColor}04`,
                                }}>
                                    <Box sx={{
                                        width: 52, height: 52, borderRadius: 3,
                                        bgcolor: `${accentColor}12`, border: `1px solid ${accentColor}25`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        mx: "auto", mb: 2,
                                    }}>
                                        <AssignmentOutlinedIcon sx={{ fontSize: 26, color: accentColor }} />
                                    </Box>
                                    <Typography sx={{ color: t.textPrimary ?? "text.primary", fontWeight: 600, fontSize: "0.9rem", mb: 0.5 }}>
                                        No requirements yet
                                    </Typography>
                                    <Typography sx={{ color: t.textSecondary ?? "text.secondary", fontSize: "0.8rem", mb: 2.5 }}>
                                        Click Add to define your first project requirement
                                    </Typography>
                                    <Button
                                        variant="contained" size="small"
                                        startIcon={<AddOutlinedIcon />}
                                        onClick={openAdd}
                                        sx={{
                                            bgcolor: accentColor, borderRadius: 2, boxShadow: "none",
                                            fontWeight: 600, fontSize: "0.82rem",
                                            "&:hover": { bgcolor: accentColor, filter: "brightness(0.92)", boxShadow: "none" },
                                        }}
                                    >
                                        Add Requirement
                                    </Button>
                                </Box>
                            )}

                            {/* Requirements list */}
                            {filtered.length > 0 && (
                                <Stack spacing={1.5}>
                                    {filtered.map((req, index) => (
                                        <RequirementCard
                                            key={req.id}
                                            req={req}
                                            index={index}
                                            accentColor={accentColor}
                                            isDark={isDark}
                                            t={t}
                                            isDeleting={deletingId === req.id}
                                            onEdit={openEdit}
                                            onDelete={handleDeleteAction}
                                            onCancelDelete={() => setDeletingId(null)}
                                        />
                                    ))}
                                </Stack>
                            )}

                            {/* Filtered empty */}
                            {requirements.length > 0 && filtered.length === 0 && (
                                <Box sx={{ textAlign: "center", py: 5 }}>
                                    <Typography sx={{ color: t.textSecondary ?? "text.secondary", fontSize: "0.85rem" }}>
                                        No requirements match this filter.
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}
                </>
            )}

            {/* ══ GITHUB REPO DIALOG ══════════════════════════════════════════ */}
            <Dialog
                open={repoDialogOpen}
                onClose={() => { if (!repoSaving) setRepoDialogOpen(false); }}
                maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg, boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.5)" : "0 20px 40px rgba(0,0,0,0.10)" } }}
            >
                <Box sx={{ height: 3, bgcolor: accentColor }} />
                <DialogTitle sx={{ color: t.textPrimary ?? "text.primary", fontWeight: 700, pb: 0.5, fontSize: "1rem" }}>
                    <Stack direction="row" alignItems="center" gap={1.2}>
                        <Box sx={{
                            width: 28, height: 28, borderRadius: 1.5,
                            bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <GitHubIcon sx={{ fontSize: 15, color: isDark ? "#ccc" : "#333" }} />
                        </Box>
                        {githubRepo ? "Edit GitHub Repository" : "Link GitHub Repository"}
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Typography sx={{ fontSize: "0.8rem", color: t.textSecondary ?? "text.secondary", mb: 1.5, lineHeight: 1.6 }}>
                        Enter your project's GitHub repository URL. This is required before adding requirements or tasks on the Kanban board.
                    </Typography>
                    <TextField
                        fullWidth
                        label="GitHub Repository URL *"
                        placeholder="https://github.com/username/repository"
                        value={repoInput}
                        onChange={(e) => { setRepoInput(e.target.value); setRepoError(""); }}
                        error={Boolean(repoError)}
                        helperText={repoError}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSaveRepo(); }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LinkOutlinedIcon sx={{ fontSize: 16, color: t.textSecondary ?? "text.secondary" }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={fieldSx}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button
                        onClick={() => setRepoDialogOpen(false)}
                        disabled={repoSaving}
                        sx={{ color: t.textSecondary ?? "text.secondary", textTransform: "none", borderRadius: 2 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveRepo}
                        disabled={repoSaving}
                        startIcon={repoSaving
                            ? <CircularProgress size={13} color="inherit" />
                            : <CheckOutlinedIcon />
                        }
                        sx={{
                            bgcolor: accentColor, borderRadius: 2, boxShadow: "none",
                            textTransform: "none", fontWeight: 600,
                            "&:hover": { bgcolor: accentColor, filter: "brightness(0.92)", boxShadow: "none" },
                        }}
                    >
                        {repoSaving ? "Saving…" : "Save Repository"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ══ REQUIREMENT DIALOG ══════════════════════════════════════════ */}
            <Dialog
                open={dialogOpen}
                onClose={closeDialog}
                maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg, boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.5)" : "0 20px 40px rgba(0,0,0,0.10)" } }}
            >
                <Box sx={{ height: 3, bgcolor: accentColor }} />
                <DialogTitle sx={{ color: t.textPrimary ?? "text.primary", fontWeight: 700, pb: 0.5, fontSize: "1rem" }}>
                    <Stack direction="row" alignItems="center" gap={1.2}>
                        <Box sx={{
                            width: 28, height: 28, borderRadius: 1.5,
                            bgcolor: `${accentColor}15`, border: `1px solid ${accentColor}30`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            {editTarget
                                ? <EditOutlinedIcon sx={{ fontSize: 15, color: accentColor }} />
                                : <AddOutlinedIcon sx={{ fontSize: 15, color: accentColor }} />
                            }
                        </Box>
                        {editTarget ? "Edit Requirement" : "Add Requirement"}
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    {/* Title */}
                    <TextField
                        fullWidth label="Title *"
                        placeholder="e.g. User Authentication"
                        value={form.title}
                        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                        error={Boolean(formErrors.title)}
                        helperText={formErrors.title}
                        sx={fieldSx}
                    />
                    {/* Description */}
                    <TextField
                        fullWidth label="Description *"
                        placeholder="e.g. The system shall allow users to login using email and password"
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        multiline minRows={3} maxRows={8}
                        error={Boolean(formErrors.description)}
                        helperText={formErrors.description}
                        sx={fieldSx}
                        onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleSave(); }}
                    />
                    {/* Priority + Type */}
                    <Stack direction="row" gap={2} sx={{ mt: 1.5 }}>
                        <FormControl fullWidth error={Boolean(formErrors.priority)}>
                            <InputLabel>Priority *</InputLabel>
                            <Select
                                value={form.priority} label="Priority *"
                                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                                sx={{ borderRadius: 2 }}
                            >
                                {PRIORITY_OPTIONS.map((o) => (
                                    <MenuItem key={o} value={o}>
                                        <Stack direction="row" alignItems="center" gap={1}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: PRIORITY_BAR_COLORS[o] ?? "#999" }} />
                                            <Typography fontSize="0.875rem">{o}</Typography>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </Select>
                            {formErrors.priority && <FormHelperText>{formErrors.priority}</FormHelperText>}
                        </FormControl>

                        <FormControl fullWidth error={Boolean(formErrors.type)}>
                            <InputLabel>Type *</InputLabel>
                            <Select
                                value={form.type} label="Type *"
                                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                                sx={{ borderRadius: 2 }}
                            >
                                {TYPE_OPTIONS.map((o) => (
                                    <MenuItem key={o} value={o}>
                                        <Stack direction="row" alignItems="center" gap={1}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: TYPE_META[o]?.color ?? "#999" }} />
                                            <Typography fontSize="0.875rem">{o}</Typography>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </Select>
                            {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
                        </FormControl>
                    </Stack>

                    {/* Priority preview bar */}
                    {form.priority && (
                        <Box sx={{ mt: 1.5, px: 0.5 }}>
                            <PriorityBar priority={form.priority} accentColor={accentColor} />
                        </Box>
                    )}

                    {/* API error */}
                    {formErrors.api && (
                        <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2, fontSize: "0.8rem" }}>
                            {formErrors.api}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button
                        onClick={closeDialog} disabled={saving}
                        sx={{ color: t.textSecondary ?? "text.secondary", textTransform: "none", borderRadius: 2 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained" onClick={handleSave} disabled={saving}
                        startIcon={saving
                            ? <CircularProgress size={13} color="inherit" />
                            : editTarget ? <CheckOutlinedIcon /> : <AddOutlinedIcon />
                        }
                        sx={{
                            bgcolor: accentColor, borderRadius: 2, boxShadow: "none",
                            textTransform: "none", fontWeight: 600,
                            "&:hover": { bgcolor: accentColor, filter: "brightness(0.92)", boxShadow: "none" },
                        }}
                    >
                        {saving ? "Saving…" : editTarget ? "Save Changes" : "Add"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}