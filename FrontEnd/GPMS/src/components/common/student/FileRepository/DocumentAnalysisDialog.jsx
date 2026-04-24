// src/components/common/student/FileRepository/DocumentAnalysisDialog.jsx

import { useState, useRef, useCallback } from "react";
import {
    Dialog, Box, Typography, Stack, Paper, Button, IconButton,
    CircularProgress, Alert, Chip, Divider, LinearProgress,
    Tooltip, Collapse,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutline";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

// ── helpers ───────────────────────────────────────────────────────────────────

const STATUS_META = {
    present: { color: "#6D8A7D", label: "Present", Icon: CheckCircleOutlineOutlinedIcon },
    weak: { color: "#C49A6C", label: "Weak", Icon: WarningAmberOutlinedIcon },
    missing: { color: "#C47E7E", label: "Missing", Icon: ErrorOutlineOutlinedIcon },
    incomplete: { color: "#C49A6C", label: "Incomplete", Icon: WarningAmberOutlinedIcon },
};

const scoreToPercent = (score) => {
    if (score === "present") return 100;
    if (score === "weak") return 55;
    if (score === "incomplete") return 40;
    if (score === "missing") return 0;
    return 0;
};

const overallColor = (pct) => {
    if (pct >= 80) return "#6D8A7D";
    if (pct >= 50) return "#C49A6C";
    return "#C47E7E";
};

const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsDataURL(file);
    });

// ── Step Bar ──────────────────────────────────────────────────────────────────

function StepBar({ step, accentColor }) {
    const steps = [
        { num: 1, label: "Upload PDF" },
        { num: 2, label: "AI Analysis" },
        { num: 3, label: "Report" },
    ];

    return (
        <Stack direction="row" alignItems="center" sx={{ flex: 1, maxWidth: 400 }}>
            {steps.map((s, i) => {
                const done = step > s.num - 1;
                const active = step === s.num - 1;
                return (
                    <Stack key={s.num} direction="row" alignItems="center" sx={{ flex: i < steps.length - 1 ? 1 : "none" }}>
                        <Stack direction="row" alignItems="center" gap={0.8} sx={{ flexShrink: 0 }}>
                            <Box sx={{
                                width: 24, height: 24, borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                bgcolor: done ? accentColor : active ? `${accentColor}18` : "transparent",
                                border: `1.5px solid ${done || active ? accentColor : `${accentColor}25`}`,
                                transition: "all .25s",
                            }}>
                                {done
                                    ? <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 13, color: "#fff" }} />
                                    : <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, color: active ? accentColor : `${accentColor}35` }}>
                                        {s.num}
                                    </Typography>
                                }
                            </Box>
                            <Typography sx={{
                                fontSize: "0.7rem", fontWeight: active || done ? 700 : 400,
                                color: active || done ? accentColor : `${accentColor}40`,
                                whiteSpace: "nowrap", transition: "all .25s",
                            }}>
                                {s.label}
                            </Typography>
                        </Stack>
                        {i < steps.length - 1 && (
                            <Box sx={{
                                flex: 1, height: "1.5px", mx: 1,
                                bgcolor: step > s.num - 1 ? accentColor : `${accentColor}20`,
                                transition: "background .3s",
                            }} />
                        )}
                    </Stack>
                );
            })}
        </Stack>
    );
}

// ── How It Works Panel ────────────────────────────────────────────────────────

function HowItWorks({ t }) {
    const steps = [
        {
            Icon: CloudUploadOutlinedIcon,
            title: "Submit a link to your supervisor",
            desc: "Your Drive, OneDrive, or GitHub link is what your supervisor receives and reviews.",
            note: "The link is what your supervisor sees.",
        },
        {
            Icon: UploadFileOutlinedIcon,
            title: "Upload your PDF here for AI review",
            desc: "Export your document as PDF and drop it below. Used only for analysis — never stored.",
            note: "Private — never stored or shared.",
            noteAccent: true,
        },
        {
            Icon: AssessmentOutlinedIcon,
            title: "Get section-by-section feedback",
            desc: "The AI checks every section, rates completeness, and gives specific recommendations.",
            note: "Fix issues before your supervisor sees it.",
            noteGreen: true,
        },
    ];

    return (
        <Paper elevation={0} sx={{
            borderRadius: 3,
            border: `1px solid ${t.borderLight}`,
            overflow: "hidden",
        }}>
            <Box sx={{ px: 2.5, py: 1.4, borderBottom: `1px solid ${t.borderLight}`, bgcolor: `${t.accentPrimary}06` }}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <TipsAndUpdatesOutlinedIcon sx={{ fontSize: 14, color: t.accentPrimary }} />
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: t.accentPrimary, letterSpacing: "0.04em" }}>
                        How AI Document Analysis works
                    </Typography>
                </Stack>
            </Box>

            <Stack
                direction={{ xs: "column", sm: "row" }}
                divider={
                    <Box sx={{
                        width: { xs: "100%", sm: "1px" },
                        height: { xs: "1px", sm: "auto" },
                        bgcolor: t.borderLight,
                        flexShrink: 0,
                    }} />
                }
            >
                {steps.map((s, i) => (
                    <Box key={i} sx={{ flex: 1, px: 2.5, py: 2.2 }}>
                        {/* Step number + icon */}
                        <Stack direction="row" alignItems="center" gap={1.2} mb={1.2}>
                            <Box sx={{
                                width: 32, height: 32, borderRadius: 2,
                                bgcolor: `${t.accentPrimary}12`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                            }}>
                                <s.Icon sx={{ fontSize: 16, color: t.accentPrimary }} />
                            </Box>
                            <Box sx={{
                                width: 18, height: 18, borderRadius: "50%",
                                bgcolor: `${t.accentPrimary}18`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                            }}>
                                <Typography sx={{ fontSize: "0.58rem", fontWeight: 800, color: t.accentPrimary }}>
                                    {i + 1}
                                </Typography>
                            </Box>
                        </Stack>

                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: t.textPrimary, mb: 0.6, lineHeight: 1.4 }}>
                            {s.title}
                        </Typography>
                        <Typography sx={{ fontSize: "0.74rem", color: t.textSecondary, lineHeight: 1.65, mb: 1.2 }}>
                            {s.desc}
                        </Typography>
                        <Box sx={{
                            px: 1.2, py: 0.7, borderRadius: 1.5,
                            bgcolor: s.noteAccent ? `${t.accentPrimary}08` : s.noteGreen ? "#6D8A7D10" : `${t.textTertiary}08`,
                            border: `1px dashed ${s.noteAccent ? `${t.accentPrimary}25` : s.noteGreen ? "#6D8A7D30" : `${t.textTertiary}20`}`,
                        }}>
                            <Stack direction="row" alignItems="center" gap={0.8}>
                                <LockOutlinedIcon sx={{ fontSize: 11, color: s.noteAccent ? t.accentPrimary : s.noteGreen ? "#6D8A7D" : t.textTertiary, flexShrink: 0, display: s.noteAccent ? "block" : "none" }} />
                                <Typography sx={{ fontSize: "0.69rem", color: s.noteAccent ? t.accentPrimary : s.noteGreen ? "#6D8A7D" : t.textTertiary, fontStyle: "italic" }}>
                                    {s.note}
                                </Typography>
                            </Stack>
                        </Box>
                    </Box>
                ))}
            </Stack>
        </Paper>
    );
}

// ── Drop Zone ─────────────────────────────────────────────────────────────────

function DropZone({ file, analyzing, onFilePick, onDrop, onRemove, fileInputRef, t }) {
    const hasFile = Boolean(file);

    return (
        <Box
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => !hasFile && !analyzing && fileInputRef.current?.click()}
            sx={{
                border: `2px dashed ${analyzing ? t.accentPrimary : hasFile ? t.accentPrimary : `${t.textTertiary}30`}`,
                borderRadius: 3,
                p: { xs: 4, sm: 5 },
                textAlign: "center",
                cursor: hasFile || analyzing ? "default" : "pointer",
                bgcolor: analyzing ? `${t.accentPrimary}04` : hasFile ? `${t.accentPrimary}04` : "transparent",
                transition: "all .2s",
                "&:hover": !hasFile && !analyzing ? {
                    borderColor: t.accentPrimary,
                    bgcolor: `${t.accentPrimary}04`,
                } : {},
            }}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={onFilePick}
            />

            {analyzing ? (
                <Stack alignItems="center" gap={2}>
                    <CircularProgress size={34} sx={{ color: t.accentPrimary }} />
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", color: t.textPrimary, mb: 0.5 }}>
                            Analyzing your document
                        </Typography>
                        <Typography sx={{ fontSize: "0.76rem", color: t.textTertiary }}>
                            Identifying sections and generating recommendations — 15–30 seconds
                        </Typography>
                    </Box>
                    <Box sx={{ width: "100%", maxWidth: 280 }}>
                        <LinearProgress sx={{
                            borderRadius: 2, height: 3,
                            bgcolor: `${t.accentPrimary}15`,
                            "& .MuiLinearProgress-bar": { bgcolor: t.accentPrimary },
                        }} />
                    </Box>
                </Stack>
            ) : hasFile ? (
                <Stack alignItems="center" gap={1.5}>
                    <Box sx={{
                        width: 52, height: 52, borderRadius: 3,
                        bgcolor: `${t.accentPrimary}12`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <InsertDriveFileOutlinedIcon sx={{ fontSize: 26, color: t.accentPrimary }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: t.textPrimary }}>
                            {file.name}
                        </Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary, mt: 0.3 }}>
                            {(file.size / 1024 / 1024).toFixed(2)} MB — PDF ready for analysis
                        </Typography>
                    </Box>
                    <Button
                        size="small"
                        startIcon={<DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />}
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        sx={{ color: t.textTertiary, fontSize: "0.72rem", mt: 0.5 }}
                    >
                        Remove file
                    </Button>
                </Stack>
            ) : (
                <Stack alignItems="center" gap={1.5}>
                    <Box sx={{
                        width: 52, height: 52, borderRadius: 3,
                        bgcolor: `${t.textTertiary}0C`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <CloudUploadOutlinedIcon sx={{ fontSize: 26, color: t.textTertiary }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.92rem", color: t.textPrimary }}>
                            Drop your PDF here, or click to browse
                        </Typography>
                        <Typography sx={{ fontSize: "0.74rem", color: t.textTertiary, mt: 0.4 }}>
                            PDF only — max 20 MB — never stored
                        </Typography>
                    </Box>
                </Stack>
            )}
        </Box>
    );
}

// ── Section Card ──────────────────────────────────────────────────────────────

function SectionCard({ section, t }) {
    const [open, setOpen] = useState(section.status !== "present");
    const meta = STATUS_META[section.status] ?? STATUS_META.weak;
    const { Icon } = meta;

    return (
        <Paper elevation={0} sx={{
            borderRadius: 2.5,
            border: `1px solid ${meta.color}20`,
            overflow: "hidden",
            bgcolor: "transparent",
            transition: "border-color .2s, box-shadow .2s",
            "&:hover": { borderColor: `${meta.color}40`, boxShadow: `0 2px 12px ${meta.color}10` },
        }}>
            <Stack
                direction="row" alignItems="center" gap={1.5}
                onClick={() => setOpen((p) => !p)}
                sx={{
                    px: 2, py: 1.5, cursor: "pointer", userSelect: "none",
                    bgcolor: `${meta.color}05`,
                    "&:hover": { bgcolor: `${meta.color}09` },
                    transition: "background .15s",
                }}
            >
                <Box sx={{
                    width: 30, height: 30, borderRadius: 1.5,
                    bgcolor: `${meta.color}14`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                }}>
                    <Icon sx={{ fontSize: 15, color: meta.color }} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: t.textPrimary }}>
                        {section.name}
                    </Typography>
                </Box>

                <Chip
                    label={meta.label}
                    size="small"
                    sx={{
                        height: 20, fontSize: "0.62rem", fontWeight: 700,
                        bgcolor: `${meta.color}15`, color: meta.color,
                        border: `1px solid ${meta.color}25`,
                        "& .MuiChip-label": { px: 1 },
                    }}
                />

                <Box sx={{ width: 48, flexShrink: 0 }}>
                    <LinearProgress
                        variant="determinate"
                        value={scoreToPercent(section.status)}
                        sx={{
                            height: 4, borderRadius: 2,
                            bgcolor: `${meta.color}15`,
                            "& .MuiLinearProgress-bar": { bgcolor: meta.color, borderRadius: 2 },
                        }}
                    />
                </Box>

                <IconButton size="small" sx={{ color: t.textTertiary, p: 0.3, flexShrink: 0 }}>
                    {open
                        ? <ExpandLessOutlinedIcon sx={{ fontSize: 16 }} />
                        : <ExpandMoreOutlinedIcon sx={{ fontSize: 16 }} />}
                </IconButton>
            </Stack>

            <Collapse in={open}>
                <Box sx={{ px: 2.5, py: 2, borderTop: `1px solid ${meta.color}12` }}>
                    {section.feedback && (
                        <Typography sx={{
                            fontSize: "0.81rem", color: t.textSecondary,
                            lineHeight: 1.7, mb: section.recommendations?.length ? 1.5 : 0,
                        }}>
                            {section.feedback}
                        </Typography>
                    )}
                    {section.recommendations?.length > 0 && (
                        <Stack spacing={0.6}>
                            {section.recommendations.map((rec, i) => (
                                <Stack key={i} direction="row" gap={1.2} alignItems="flex-start">
                                    <ArrowForwardOutlinedIcon sx={{ fontSize: 13, color: meta.color, mt: "4px", flexShrink: 0 }} />
                                    <Typography sx={{ fontSize: "0.79rem", color: t.textSecondary, lineHeight: 1.65 }}>
                                        {rec}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    )}
                </Box>
            </Collapse>
        </Paper>
    );
}

// ── Score Circle ──────────────────────────────────────────────────────────────

function ScoreCircle({ score, color }) {
    const label = score >= 80 ? "Strong" : score >= 60 ? "Moderate" : score >= 40 ? "Needs Work" : "Critical";
    return (
        <Box sx={{
            width: 86, height: 86, flexShrink: 0, borderRadius: "50%",
            border: `3px solid ${color}`,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            bgcolor: `${color}0C`,
            position: "relative",
        }}>
            <Typography sx={{ fontWeight: 800, fontSize: "1.6rem", color, lineHeight: 1 }}>
                {score}
            </Typography>
            <Typography sx={{ fontSize: "0.56rem", color, fontWeight: 600, opacity: 0.7 }}>
                / 100
            </Typography>
        </Box>
    );
}

// ── Report View ───────────────────────────────────────────────────────────────

function ReportView({ report, t, theme, onReset }) {
    const scoreColor = overallColor(report.overallScore);
    const scoreLabel = report.overallScore >= 80 ? "Strong"
        : report.overallScore >= 60 ? "Moderate"
            : report.overallScore >= 40 ? "Needs Work"
                : "Critical";

    return (
        <Stack spacing={2.5}>

            {/* ── Overall Score ── */}
            <Paper elevation={0} sx={{
                borderRadius: 3,
                border: `1px solid ${scoreColor}22`,
                overflow: "hidden",
            }}>
                <Box sx={{ height: 3, background: `linear-gradient(90deg, ${scoreColor} 0%, ${scoreColor}44 100%)` }} />
                <Box sx={{ p: 3 }}>
                    <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={3}>
                        <ScoreCircle score={report.overallScore} color={scoreColor} />
                        <Box sx={{ flex: 1 }}>
                            <Stack direction="row" alignItems="center" gap={1} mb={0.8}>
                                <AssessmentOutlinedIcon sx={{ fontSize: 14, color: t.accentPrimary }} />
                                <Typography sx={{
                                    fontWeight: 700, fontSize: "0.68rem", color: t.accentPrimary,
                                    textTransform: "uppercase", letterSpacing: "0.09em",
                                }}>
                                    Overall Assessment
                                </Typography>
                                <Chip
                                    label={scoreLabel}
                                    size="small"
                                    sx={{
                                        height: 18, fontSize: "0.6rem", fontWeight: 700,
                                        bgcolor: `${scoreColor}15`, color: scoreColor,
                                        "& .MuiChip-label": { px: 0.9 },
                                    }}
                                />
                            </Stack>
                            <Typography sx={{ fontSize: "0.83rem", color: t.textSecondary, lineHeight: 1.75 }}>
                                {report.overallSummary}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Section coverage bar */}
                    <Box sx={{ mt: 3 }}>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                            <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: t.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                Section coverage
                            </Typography>
                            <Typography sx={{ fontSize: "0.68rem", color: t.textTertiary }}>
                                {report.sections.filter(s => s.status === "present").length} / {report.sections.length} complete
                            </Typography>
                        </Stack>
                        <Stack direction="row" gap={0.4} sx={{ height: 8, borderRadius: 2, overflow: "hidden" }}>
                            {report.sections.map((s, i) => {
                                const m = STATUS_META[s.status] ?? STATUS_META.weak;
                                return (
                                    <Tooltip key={i} title={`${s.name}: ${m.label}`}>
                                        <Box sx={{ flex: 1, bgcolor: m.color }} />
                                    </Tooltip>
                                );
                            })}
                        </Stack>
                        <Stack direction="row" gap={2} mt={1.2} flexWrap="wrap">
                            {Object.entries(STATUS_META).map(([key, m]) => {
                                const count = report.sections.filter(s => s.status === key).length;
                                if (!count) return null;
                                return (
                                    <Stack key={key} direction="row" alignItems="center" gap={0.6}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: m.color }} />
                                        <Typography sx={{ fontSize: "0.67rem", color: t.textTertiary }}>
                                            {m.label}: {count}
                                        </Typography>
                                    </Stack>
                                );
                            })}
                        </Stack>
                    </Box>
                </Box>
            </Paper>

            {/* ── Top Priorities ── */}
            {report.topPriorities?.length > 0 && (
                <Paper elevation={0} sx={{
                    borderRadius: 3,
                    border: `1px solid ${t.accentPrimary}22`,
                    overflow: "hidden",
                }}>
                    <Box sx={{ px: 2.5, py: 1.5, bgcolor: `${t.accentPrimary}08`, borderBottom: `1px solid ${t.accentPrimary}15` }}>
                        <Stack direction="row" alignItems="center" gap={1}>
                            <TipsAndUpdatesOutlinedIcon sx={{ fontSize: 15, color: t.accentPrimary }} />
                            <Typography sx={{
                                fontWeight: 700, fontSize: "0.72rem", color: t.accentPrimary,
                                textTransform: "uppercase", letterSpacing: "0.07em",
                            }}>
                                Fix these before submitting to your supervisor
                            </Typography>
                        </Stack>
                    </Box>
                    <Stack spacing={0} sx={{ p: 2 }}>
                        {report.topPriorities.map((p, i) => (
                            <Stack
                                key={i} direction="row" gap={1.5} alignItems="flex-start"
                                sx={{
                                    py: 1.2,
                                    borderBottom: i < report.topPriorities.length - 1
                                        ? `1px solid ${t.borderLight}`
                                        : "none",
                                }}
                            >
                                <Box sx={{
                                    minWidth: 22, height: 22, borderRadius: "50%",
                                    bgcolor: t.accentPrimary,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0, mt: "1px",
                                }}>
                                    <Typography sx={{ fontSize: "0.6rem", fontWeight: 800, color: "#fff" }}>
                                        {i + 1}
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: "0.81rem", color: t.textSecondary, lineHeight: 1.7 }}>
                                    {p}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Paper>
            )}

            {/* ── Sections ── */}
            <Box>
                <Typography sx={{
                    fontWeight: 700, fontSize: "0.68rem", color: t.textTertiary,
                    textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5,
                }}>
                    Section-by-section analysis
                </Typography>
                <Stack spacing={1}>
                    {report.sections.map((section, i) => (
                        <SectionCard key={i} section={section} t={t} />
                    ))}
                </Stack>
            </Box>

            {/* ── Re-analyze ── */}
            <Box sx={{ textAlign: "center", pb: 2 }}>
                <Button
                    size="small"
                    startIcon={<RefreshOutlinedIcon sx={{ fontSize: 14 }} />}
                    onClick={onReset}
                    sx={{ color: t.textTertiary, fontSize: "0.74rem" }}
                >
                    Analyze a different file
                </Button>
            </Box>
        </Stack>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function DocumentAnalysisDialog({ open, onClose, file }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    const fileInputRef = useRef(null);

    const [uploadedFile, setUploadedFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState("");
    const [report, setReport] = useState(null);

    const step = report ? 2 : analyzing ? 1 : 0;

    const handleClose = () => {
        if (analyzing) return;
        setUploadedFile(null);
        setError("");
        setReport(null);
        onClose();
    };

    const handleReset = () => {
        setReport(null);
        setUploadedFile(null);
        setError("");
    };

    const handleFilePick = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.type !== "application/pdf") { setError("Only PDF files are supported."); return; }
        if (f.size > 20 * 1024 * 1024) { setError("File is too large. Max 20 MB."); return; }
        setUploadedFile(f);
        setError("");
        setReport(null);
        e.target.value = "";
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (!f) return;
        if (f.type !== "application/pdf") { setError("Only PDF files are supported."); return; }
        if (f.size > 20 * 1024 * 1024) { setError("File is too large. Max 20 MB."); return; }
        setUploadedFile(f);
        setError("");
        setReport(null);
    }, []);

    const handleAnalyze = async () => {
        if (!uploadedFile) return;
        setAnalyzing(true);
        setError("");
        setReport(null);

        try {
            const base64 = await readFileAsBase64(uploadedFile);

            const prompt = `You are an expert academic document reviewer for graduation projects.

The student has uploaded a PDF document. The document is associated with:
- File Name: ${file?.fileName || "(not provided)"}
- Description: ${file?.description || "(not provided)"}
- Link type: ${file?.filePath?.includes("github") ? "GitHub Repository" : file?.filePath?.includes("drive.google") ? "Google Drive" : "External Link"}

Your task:
1. Identify the document type (Thesis, Proposal, Research Paper, Technical Report, etc.)
2. Based on the document type, identify ALL expected sections/chapters
3. Evaluate completeness and quality of each section
4. Provide specific, actionable recommendations

Respond ONLY with a valid JSON object (no markdown, no backticks) in this exact format:
{
  "documentType": "Thesis Proposal",
  "overallScore": 72,
  "overallSummary": "2-3 sentence overall assessment",
  "sections": [
    {
      "name": "Abstract",
      "status": "present",
      "feedback": "The abstract covers the main points well.",
      "recommendations": ["Add quantitative expected outcomes"]
    }
  ],
  "topPriorities": [
    "Add a complete literature review section"
  ]
}

Rules:
- status must be one of: "present", "weak", "incomplete", "missing"
- overallScore is 0-100
- Include ALL expected sections (typically 6-12)
- Return ONLY the JSON`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { inline_data: { mime_type: "application/pdf", data: base64 } },
                                { text: prompt },
                            ],
                        }],
                    }),
                }
            );

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData?.error?.message ?? `API Error ${response.status}`);
            }

            const data = await response.json();
            const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
            const cleaned = raw.replace(/```json|```/gi, "").trim();
            const parsed = JSON.parse(cleaned);

            if (!parsed.sections || !Array.isArray(parsed.sections))
                throw new Error("Unexpected response format from AI.");

            setReport(parsed);
        } catch (err) {
            console.error("Document analysis error:", err);
            setError(err?.message ?? "Analysis failed. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullScreen
            PaperProps={{
                sx: {
                    bgcolor: theme.palette.background.default,
                    backgroundImage: "none",
                    display: "flex",
                    flexDirection: "column",
                },
            }}
        >
            {/* ── Top Bar ── */}
            <Box sx={{
                px: { xs: 2, sm: 3 }, py: 1.8,
                borderBottom: `1px solid ${t.borderLight}`,
                bgcolor: theme.palette.background.paper,
                display: "flex", alignItems: "center", gap: 2,
                flexShrink: 0,
            }}>
                {/* Icon + title */}
                <Stack direction="row" alignItems="center" gap={1.2} sx={{ flexShrink: 0 }}>
                    <Box sx={{
                        width: 34, height: 34, borderRadius: 2,
                        bgcolor: `${t.accentPrimary}14`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <AutoAwesomeOutlinedIcon sx={{ fontSize: 18, color: t.accentPrimary }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", color: t.textPrimary, lineHeight: 1.2 }}>
                            AI Document Analysis
                        </Typography>
                        {file && (
                            <Typography sx={{
                                fontSize: "0.68rem", color: t.textTertiary,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                maxWidth: { xs: 140, sm: 300 },
                            }}>
                                {file.fileName || file.description || file.filePath}
                            </Typography>
                        )}
                    </Box>
                </Stack>

                {/* Step bar centered */}
                <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                    <StepBar step={step} accentColor={t.accentPrimary} />
                </Box>

                {/* Doc type chip + close */}
                <Stack direction="row" alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
                    {report && (
                        <Chip
                            label={report.documentType}
                            size="small"
                            sx={{
                                bgcolor: `${t.accentPrimary}14`, color: t.accentPrimary,
                                fontWeight: 700, fontSize: "0.68rem",
                                border: `1px solid ${t.accentPrimary}25`,
                                display: { xs: "none", sm: "flex" },
                            }}
                        />
                    )}
                    <Tooltip title="Close">
                        <span>
                            <IconButton onClick={handleClose} disabled={analyzing} sx={{ color: t.textTertiary }}>
                                <CloseOutlinedIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Stack>
            </Box>

            {/* ── Body ── */}
            <Box sx={{ flex: 1, overflow: "auto", p: { xs: 2, sm: 3 } }}>
                <Box sx={{ maxWidth: 820, mx: "auto", width: "100%" }}>

                    {/* ── Upload / Analyzing view ── */}
                    {!report && (
                        <Stack spacing={2.5}>
                            <HowItWorks t={t} />

                            <DropZone
                                file={uploadedFile}
                                analyzing={analyzing}
                                onFilePick={handleFilePick}
                                onDrop={handleDrop}
                                onRemove={() => { setUploadedFile(null); setError(""); }}
                                fileInputRef={fileInputRef}
                                t={t}
                            />

                            {error && (
                                <Alert severity="error" sx={{ borderRadius: 2, fontSize: "0.81rem" }}>
                                    {error}
                                </Alert>
                            )}
                        </Stack>
                    )}

                    {/* ── Report view ── */}
                    {report && (
                        <ReportView report={report} t={t} theme={theme} onReset={handleReset} />
                    )}
                </Box>
            </Box>

            {/* ── Bottom Action Bar (upload step only) ── */}
            {!report && (
                <Box sx={{
                    px: { xs: 2, sm: 3 }, py: 2,
                    borderTop: `1px solid ${t.borderLight}`,
                    bgcolor: theme.palette.background.paper,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    flexShrink: 0, gap: 2,
                }}>
                    <Stack direction="row" alignItems="center" gap={1}>
                        <LockOutlinedIcon sx={{ fontSize: 13, color: t.textTertiary }} />
                        <Typography sx={{ fontSize: "0.71rem", color: t.textTertiary }}>
                            {uploadedFile
                                ? `${uploadedFile.name} — ready to analyze`
                                : "Upload a PDF to get started"}
                        </Typography>
                    </Stack>

                    <Stack direction="row" gap={1.5}>
                        <Button
                            onClick={handleClose}
                            disabled={analyzing}
                            sx={{ color: t.textSecondary, fontSize: "0.82rem" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleAnalyze}
                            disabled={!uploadedFile || analyzing}
                            startIcon={
                                analyzing
                                    ? <CircularProgress size={14} color="inherit" />
                                    : <AutoAwesomeOutlinedIcon sx={{ fontSize: 16 }} />
                            }
                            sx={{
                                bgcolor: t.accentPrimary, borderRadius: 2,
                                fontWeight: 700, px: 3, fontSize: "0.82rem",
                                "&.Mui-disabled": { bgcolor: `${t.accentPrimary}30` },
                            }}
                        >
                            {analyzing ? "Analyzing…" : "Analyze Document"}
                        </Button>
                    </Stack>
                </Box>
            )}
        </Dialog>
    );
}