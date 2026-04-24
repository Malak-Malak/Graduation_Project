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
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";

// ── helpers ───────────────────────────────────────────────────────────────────

const STATUS_META = {
    present: { color: "#5A8A72", label: "Present", Icon: CheckCircleOutlineOutlinedIcon },
    weak: { color: "#C49A6C", label: "Weak", Icon: WarningAmberOutlinedIcon },
    missing: { color: "#B86B6B", label: "Missing", Icon: ErrorOutlineOutlinedIcon },
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
    if (pct >= 80) return "#5A8A72";
    if (pct >= 50) return "#C49A6C";
    return "#B86B6B";
};

const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsDataURL(file);
    });

// ── Decorative Academic Background ───────────────────────────────────────────

function AcademicBackground({ accentColor }) {
    return (
        <Box sx={{
            position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden",
        }}>
            {/* Soft gradient base */}
            <Box sx={{
                position: "absolute", inset: 0,
                background: `radial-gradient(ellipse 80% 60% at 20% 10%, ${accentColor}0A 0%, transparent 60%),
                             radial-gradient(ellipse 60% 50% at 80% 90%, ${accentColor}07 0%, transparent 55%)`,
            }} />

            {/* Large cap & diploma SVG — top left, very subtle */}
            <Box sx={{ position: "absolute", top: -60, left: -40, opacity: 0.045 }}>
                <svg width="420" height="420" viewBox="0 0 420 420" fill="none">
                    <circle cx="210" cy="210" r="200" stroke={accentColor} strokeWidth="1.5" />
                    <circle cx="210" cy="210" r="160" stroke={accentColor} strokeWidth="0.8" />
                    <circle cx="210" cy="210" r="120" stroke={accentColor} strokeWidth="0.5" />
                    {/* Mortarboard */}
                    <polygon points="210,80 320,140 210,170 100,140" fill={accentColor} />
                    <rect x="195" y="168" width="30" height="70" fill={accentColor} rx="4" />
                    <circle cx="210" cy="240" r="16" fill={accentColor} />
                    <line x1="290" y1="142" x2="290" y2="195" stroke={accentColor} strokeWidth="3" />
                    <circle cx="290" cy="200" r="8" fill={accentColor} />
                </svg>
            </Box>

            {/* Diploma scroll — bottom right */}
            <Box sx={{ position: "absolute", bottom: -80, right: -60, opacity: 0.04 }}>
                <svg width="380" height="380" viewBox="0 0 380 380" fill="none">
                    <rect x="40" y="60" width="300" height="220" rx="12" stroke={accentColor} strokeWidth="2" />
                    <rect x="20" y="60" width="20" height="220" rx="8" fill={accentColor} />
                    <rect x="340" y="60" width="20" height="220" rx="8" fill={accentColor} />
                    <line x1="80" y1="120" x2="300" y2="120" stroke={accentColor} strokeWidth="2" />
                    <line x1="80" y1="150" x2="300" y2="150" stroke={accentColor} strokeWidth="1.5" />
                    <line x1="80" y1="175" x2="260" y2="175" stroke={accentColor} strokeWidth="1.5" />
                    <line x1="80" y1="200" x2="280" y2="200" stroke={accentColor} strokeWidth="1.5" />
                    <line x1="80" y1="225" x2="240" y2="225" stroke={accentColor} strokeWidth="1.5" />
                    <circle cx="190" cy="290" r="28" stroke={accentColor} strokeWidth="2" />
                    <circle cx="190" cy="290" r="18" fill={`${accentColor}30`} />
                    <polygon points="190,275 197,288 212,288 200,297 204,312 190,303 176,312 180,297 168,288 183,288" fill={accentColor} opacity="0.6" />
                </svg>
            </Box>

            {/* Top right — open book */}
            <Box sx={{ position: "absolute", top: 20, right: -30, opacity: 0.038 }}>
                <svg width="280" height="200" viewBox="0 0 280 200" fill="none">
                    <path d="M140 30 C140 30 70 20 20 40 L20 170 C70 150 140 160 140 160 Z" stroke={accentColor} strokeWidth="2" fill={`${accentColor}20`} />
                    <path d="M140 30 C140 30 210 20 260 40 L260 170 C210 150 140 160 140 160 Z" stroke={accentColor} strokeWidth="2" fill={`${accentColor}20`} />
                    <line x1="140" y1="30" x2="140" y2="160" stroke={accentColor} strokeWidth="1.5" />
                    <line x1="50" y1="70" x2="120" y2="65" stroke={accentColor} strokeWidth="1" />
                    <line x1="50" y1="90" x2="120" y2="87" stroke={accentColor} strokeWidth="1" />
                    <line x1="50" y1="110" x2="110" y2="108" stroke={accentColor} strokeWidth="1" />
                    <line x1="160" y1="70" x2="230" y2="65" stroke={accentColor} strokeWidth="1" />
                    <line x1="160" y1="90" x2="230" y2="87" stroke={accentColor} strokeWidth="1" />
                    <line x1="160" y1="110" x2="220" y2="108" stroke={accentColor} strokeWidth="1" />
                </svg>
            </Box>

            {/* Scattered small stars / dots */}
            {[
                { x: "15%", y: "30%", size: 3 },
                { x: "85%", y: "20%", size: 2 },
                { x: "72%", y: "65%", size: 4 },
                { x: "8%", y: "70%", size: 2.5 },
                { x: "45%", y: "88%", size: 3 },
                { x: "92%", y: "50%", size: 2 },
                { x: "35%", y: "15%", size: 2 },
                { x: "60%", y: "40%", size: 2.5 },
            ].map((dot, i) => (
                <Box key={i} sx={{
                    position: "absolute",
                    left: dot.x, top: dot.y,
                    width: dot.size, height: dot.size,
                    borderRadius: "50%",
                    bgcolor: accentColor,
                    opacity: 0.12,
                }} />
            ))}

            {/* Thin horizontal rule lines — very subtle */}
            <Box sx={{
                position: "absolute", inset: 0,
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 79px, ${accentColor}06 80px)`,
            }} />
        </Box>
    );
}

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
                                width: 26, height: 26, borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                bgcolor: done ? accentColor : active ? `${accentColor}20` : "transparent",
                                border: `2px solid ${done || active ? accentColor : `${accentColor}25`}`,
                                transition: "all .3s",
                                boxShadow: done ? `0 0 10px ${accentColor}40` : "none",
                            }}>
                                {done
                                    ? <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 13, color: "#fff" }} />
                                    : <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, color: active ? accentColor : `${accentColor}40` }}>
                                        {s.num}
                                    </Typography>
                                }
                            </Box>
                            <Typography sx={{
                                fontSize: "0.72rem", fontWeight: active || done ? 700 : 400,
                                color: active || done ? accentColor : `${accentColor}40`,
                                whiteSpace: "nowrap", transition: "all .25s",
                            }}>
                                {s.label}
                            </Typography>
                        </Stack>
                        {i < steps.length - 1 && (
                            <Box sx={{
                                flex: 1, height: "2px", mx: 1,
                                background: step > s.num - 1
                                    ? `linear-gradient(90deg, ${accentColor}, ${accentColor}80)`
                                    : `${accentColor}18`,
                                borderRadius: 1,
                                transition: "background .4s",
                            }} />
                        )}
                    </Stack>
                );
            })}
        </Stack>
    );
}

// ── Stat Badge ────────────────────────────────────────────────────────────────

function StatBadge({ icon: Icon, label, value, accentColor }) {
    return (
        <Box sx={{
            px: 2, py: 1.4, borderRadius: 2.5,
            border: `1px solid ${accentColor}20`,
            bgcolor: `${accentColor}07`,
            backdropFilter: "blur(8px)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 0.4,
            minWidth: 90,
        }}>
            <Icon sx={{ fontSize: 18, color: accentColor, opacity: 0.8 }} />
            <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: accentColor, lineHeight: 1 }}>
                {value}
            </Typography>
            <Typography sx={{ fontSize: "0.63rem", color: accentColor, opacity: 0.65, fontWeight: 600, textAlign: "center" }}>
                {label}
            </Typography>
        </Box>
    );
}

// ── How It Works Panel ────────────────────────────────────────────────────────

function HowItWorks({ t, theme }) {
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
            borderRadius: 3.5,
            border: `1px solid ${t.accentPrimary}20`,
            overflow: "hidden",
            bgcolor: theme.palette.background.paper,
            backdropFilter: "blur(12px)",
        }}>
            <Box sx={{
                px: 2.5, py: 1.6,
                borderBottom: `1px solid ${t.accentPrimary}15`,
                background: `linear-gradient(135deg, ${t.accentPrimary}10 0%, ${t.accentPrimary}04 100%)`,
            }}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <Box sx={{
                        width: 28, height: 28, borderRadius: 2,
                        bgcolor: `${t.accentPrimary}18`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <TipsAndUpdatesOutlinedIcon sx={{ fontSize: 15, color: t.accentPrimary }} />
                    </Box>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: t.accentPrimary, letterSpacing: "0.04em" }}>
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
                        bgcolor: `${t.accentPrimary}12`,
                        flexShrink: 0,
                    }} />
                }
            >
                {steps.map((s, i) => (
                    <Box key={i} sx={{ flex: 1, px: 2.5, py: 2.4 }}>
                        <Stack direction="row" alignItems="center" gap={1.2} mb={1.4}>
                            <Box sx={{
                                width: 36, height: 36, borderRadius: 2.5,
                                background: `linear-gradient(135deg, ${t.accentPrimary}20 0%, ${t.accentPrimary}10 100%)`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                                border: `1px solid ${t.accentPrimary}15`,
                            }}>
                                <s.Icon sx={{ fontSize: 18, color: t.accentPrimary }} />
                            </Box>
                            <Box sx={{
                                width: 22, height: 22, borderRadius: "50%",
                                background: `linear-gradient(135deg, ${t.accentPrimary} 0%, ${t.accentPrimary}80 100%)`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                                boxShadow: `0 2px 8px ${t.accentPrimary}30`,
                            }}>
                                <Typography sx={{ fontSize: "0.6rem", fontWeight: 800, color: "#fff" }}>
                                    {i + 1}
                                </Typography>
                            </Box>
                        </Stack>

                        <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: t.textPrimary, mb: 0.7, lineHeight: 1.4 }}>
                            {s.title}
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: t.textSecondary, lineHeight: 1.7, mb: 1.3 }}>
                            {s.desc}
                        </Typography>
                        <Box sx={{
                            px: 1.4, py: 0.8, borderRadius: 2,
                            bgcolor: s.noteAccent ? `${t.accentPrimary}10` : s.noteGreen ? "#5A8A7212" : `${t.textTertiary}08`,
                            border: `1px dashed ${s.noteAccent ? `${t.accentPrimary}30` : s.noteGreen ? "#5A8A7235" : `${t.textTertiary}20`}`,
                        }}>
                            <Stack direction="row" alignItems="center" gap={0.8}>
                                {s.noteAccent && <LockOutlinedIcon sx={{ fontSize: 11, color: t.accentPrimary, flexShrink: 0 }} />}
                                <Typography sx={{
                                    fontSize: "0.69rem",
                                    color: s.noteAccent ? t.accentPrimary : s.noteGreen ? "#5A8A72" : t.textTertiary,
                                    fontStyle: "italic", fontWeight: 500,
                                }}>
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
                borderRadius: 3.5,
                p: { xs: 4, sm: 6 },
                textAlign: "center",
                cursor: hasFile || analyzing ? "default" : "pointer",
                bgcolor: analyzing ? `${t.accentPrimary}06` : hasFile ? `${t.accentPrimary}06` : `${t.textTertiary}04`,
                backdropFilter: "blur(10px)",
                transition: "all .25s",
                position: "relative",
                overflow: "hidden",
                "&:hover": !hasFile && !analyzing ? {
                    borderColor: t.accentPrimary,
                    bgcolor: `${t.accentPrimary}06`,
                    "& .upload-arrow": { transform: "translateY(-4px)" },
                } : {},
            }}
        >
            {/* subtle corner decorations */}
            {!hasFile && !analyzing && (
                <>
                    <Box sx={{ position: "absolute", top: 10, left: 10, width: 20, height: 20, borderTop: `2px solid ${t.accentPrimary}30`, borderLeft: `2px solid ${t.accentPrimary}30`, borderRadius: "2px 0 0 0" }} />
                    <Box sx={{ position: "absolute", top: 10, right: 10, width: 20, height: 20, borderTop: `2px solid ${t.accentPrimary}30`, borderRight: `2px solid ${t.accentPrimary}30`, borderRadius: "0 2px 0 0" }} />
                    <Box sx={{ position: "absolute", bottom: 10, left: 10, width: 20, height: 20, borderBottom: `2px solid ${t.accentPrimary}30`, borderLeft: `2px solid ${t.accentPrimary}30`, borderRadius: "0 0 0 2px" }} />
                    <Box sx={{ position: "absolute", bottom: 10, right: 10, width: 20, height: 20, borderBottom: `2px solid ${t.accentPrimary}30`, borderRight: `2px solid ${t.accentPrimary}30`, borderRadius: "0 0 2px 0" }} />
                </>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={onFilePick}
            />

            {analyzing ? (
                <Stack alignItems="center" gap={2.5}>
                    <Box sx={{ position: "relative" }}>
                        <CircularProgress size={52} sx={{ color: t.accentPrimary }} thickness={2.5} />
                        <Box sx={{
                            position: "absolute", inset: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <AutoAwesomeOutlinedIcon sx={{ fontSize: 20, color: t.accentPrimary }} />
                        </Box>
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: t.textPrimary, mb: 0.6 }}>
                            Analyzing your document…
                        </Typography>
                        <Typography sx={{ fontSize: "0.77rem", color: t.textTertiary }}>
                            Identifying sections and generating recommendations — 15–30 seconds
                        </Typography>
                    </Box>
                    <Box sx={{ width: "100%", maxWidth: 320 }}>
                        <LinearProgress sx={{
                            borderRadius: 3, height: 4,
                            bgcolor: `${t.accentPrimary}15`,
                            "& .MuiLinearProgress-bar": {
                                background: `linear-gradient(90deg, ${t.accentPrimary} 0%, ${t.accentPrimary}80 100%)`,
                            },
                        }} />
                    </Box>
                </Stack>
            ) : hasFile ? (
                <Stack alignItems="center" gap={2}>
                    <Box sx={{
                        width: 64, height: 64, borderRadius: 3,
                        background: `linear-gradient(135deg, ${t.accentPrimary}20 0%, ${t.accentPrimary}10 100%)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: `1px solid ${t.accentPrimary}25`,
                    }}>
                        <InsertDriveFileOutlinedIcon sx={{ fontSize: 30, color: t.accentPrimary }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: t.textPrimary }}>
                            {file.name}
                        </Typography>
                        <Typography sx={{ fontSize: "0.74rem", color: t.textTertiary, mt: 0.4 }}>
                            {(file.size / 1024 / 1024).toFixed(2)} MB — PDF ready for analysis
                        </Typography>
                    </Box>
                    <Button
                        size="small"
                        startIcon={<DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />}
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        sx={{ color: t.textTertiary, fontSize: "0.72rem", mt: 0.3 }}
                    >
                        Remove file
                    </Button>
                </Stack>
            ) : (
                <Stack alignItems="center" gap={2}>
                    <Box
                        className="upload-arrow"
                        sx={{
                            width: 68, height: 68, borderRadius: 3.5,
                            background: `linear-gradient(135deg, ${t.textTertiary}10 0%, ${t.textTertiary}06 100%)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: `1px solid ${t.textTertiary}18`,
                            transition: "transform .3s ease",
                        }}
                    >
                        <CloudUploadOutlinedIcon sx={{ fontSize: 32, color: t.textTertiary, opacity: 0.7 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.96rem", color: t.textPrimary, mb: 0.5 }}>
                            Drop your PDF here, or click to browse
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: t.textTertiary }}>
                            PDF only — max 20 MB — never stored
                        </Typography>
                    </Box>
                </Stack>
            )}
        </Box>
    );
}

// ── Section Card ──────────────────────────────────────────────────────────────

function SectionCard({ section, t, theme }) {
    const [open, setOpen] = useState(section.status !== "present");
    const meta = STATUS_META[section.status] ?? STATUS_META.weak;
    const { Icon } = meta;

    return (
        <Paper elevation={0} sx={{
            borderRadius: 3,
            border: `1px solid ${meta.color}22`,
            overflow: "hidden",
            bgcolor: theme.palette.background.paper,
            backdropFilter: "blur(10px)",
            transition: "border-color .2s, box-shadow .2s, transform .15s",
            "&:hover": {
                borderColor: `${meta.color}45`,
                boxShadow: `0 4px 20px ${meta.color}14`,
                transform: "translateY(-1px)",
            },
        }}>
            <Stack
                direction="row" alignItems="center" gap={1.5}
                onClick={() => setOpen((p) => !p)}
                sx={{
                    px: 2.2, py: 1.6, cursor: "pointer", userSelect: "none",
                    background: `linear-gradient(135deg, ${meta.color}07 0%, transparent 100%)`,
                    "&:hover": { bgcolor: `${meta.color}10` },
                    transition: "background .15s",
                }}
            >
                <Box sx={{
                    width: 34, height: 34, borderRadius: 2,
                    background: `linear-gradient(135deg, ${meta.color}20 0%, ${meta.color}10 100%)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    border: `1px solid ${meta.color}20`,
                }}>
                    <Icon sx={{ fontSize: 16, color: meta.color }} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.86rem", color: t.textPrimary }}>
                        {section.name}
                    </Typography>
                </Box>

                <Chip
                    label={meta.label}
                    size="small"
                    sx={{
                        height: 22, fontSize: "0.63rem", fontWeight: 700,
                        bgcolor: `${meta.color}18`, color: meta.color,
                        border: `1px solid ${meta.color}28`,
                        "& .MuiChip-label": { px: 1.1 },
                    }}
                />

                <Box sx={{ width: 56, flexShrink: 0 }}>
                    <LinearProgress
                        variant="determinate"
                        value={scoreToPercent(section.status)}
                        sx={{
                            height: 5, borderRadius: 3,
                            bgcolor: `${meta.color}15`,
                            "& .MuiLinearProgress-bar": {
                                background: `linear-gradient(90deg, ${meta.color} 0%, ${meta.color}80 100%)`,
                                borderRadius: 3,
                            },
                        }}
                    />
                </Box>

                <IconButton size="small" sx={{ color: t.textTertiary, p: 0.4, flexShrink: 0 }}>
                    {open
                        ? <ExpandLessOutlinedIcon sx={{ fontSize: 17 }} />
                        : <ExpandMoreOutlinedIcon sx={{ fontSize: 17 }} />}
                </IconButton>
            </Stack>

            <Collapse in={open}>
                <Box sx={{ px: 2.8, py: 2.2, borderTop: `1px solid ${meta.color}15` }}>
                    {section.feedback && (
                        <Typography sx={{
                            fontSize: "0.81rem", color: t.textSecondary,
                            lineHeight: 1.75, mb: section.recommendations?.length ? 1.6 : 0,
                        }}>
                            {section.feedback}
                        </Typography>
                    )}
                    {section.recommendations?.length > 0 && (
                        <Stack spacing={0.8}>
                            {section.recommendations.map((rec, i) => (
                                <Stack key={i} direction="row" gap={1.2} alignItems="flex-start">
                                    <Box sx={{
                                        width: 18, height: 18, borderRadius: 1,
                                        bgcolor: `${meta.color}15`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        flexShrink: 0, mt: "3px",
                                    }}>
                                        <ArrowForwardOutlinedIcon sx={{ fontSize: 11, color: meta.color }} />
                                    </Box>
                                    <Typography sx={{ fontSize: "0.79rem", color: t.textSecondary, lineHeight: 1.7 }}>
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
    return (
        <Box sx={{ position: "relative", flexShrink: 0 }}>
            {/* Outer glow ring */}
            <Box sx={{
                position: "absolute", inset: -4,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
            }} />
            <Box sx={{
                width: 96, height: 96, borderRadius: "50%",
                border: `3px solid ${color}`,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                background: `radial-gradient(circle at 40% 30%, ${color}15 0%, ${color}05 100%)`,
                boxShadow: `0 0 24px ${color}20`,
            }}>
                <Typography sx={{ fontWeight: 900, fontSize: "1.75rem", color, lineHeight: 1 }}>
                    {score}
                </Typography>
                <Typography sx={{ fontSize: "0.58rem", color, fontWeight: 600, opacity: 0.65 }}>
                    / 100
                </Typography>
            </Box>
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

    const presentCount = report.sections.filter(s => s.status === "present").length;
    const missingCount = report.sections.filter(s => s.status === "missing").length;
    const weakCount = report.sections.filter(s => s.status === "weak" || s.status === "incomplete").length;

    return (
        <Stack spacing={3}>

            {/* ── Overall Score Hero ── */}
            <Paper elevation={0} sx={{
                borderRadius: 4,
                border: `1px solid ${scoreColor}25`,
                overflow: "hidden",
                bgcolor: theme.palette.background.paper,
                backdropFilter: "blur(16px)",
            }}>
                {/* Top gradient bar */}
                <Box sx={{
                    height: 4,
                    background: `linear-gradient(90deg, ${scoreColor} 0%, ${scoreColor}60 60%, transparent 100%)`,
                }} />

                <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                    <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "flex-start" }} gap={3}>
                        <ScoreCircle score={report.overallScore} color={scoreColor} />

                        <Box sx={{ flex: 1 }}>
                            <Stack direction="row" alignItems="center" gap={1} mb={1}>
                                <AssessmentOutlinedIcon sx={{ fontSize: 14, color: t.accentPrimary }} />
                                <Typography sx={{
                                    fontWeight: 700, fontSize: "0.68rem", color: t.accentPrimary,
                                    textTransform: "uppercase", letterSpacing: "0.1em",
                                }}>
                                    Overall Assessment
                                </Typography>
                                <Chip
                                    label={scoreLabel}
                                    size="small"
                                    sx={{
                                        height: 20, fontSize: "0.6rem", fontWeight: 700,
                                        bgcolor: `${scoreColor}18`, color: scoreColor,
                                        border: `1px solid ${scoreColor}28`,
                                        "& .MuiChip-label": { px: 1 },
                                    }}
                                />
                            </Stack>
                            <Typography sx={{ fontSize: "0.85rem", color: t.textSecondary, lineHeight: 1.8, mb: 2.5 }}>
                                {report.overallSummary}
                            </Typography>

                            {/* Stat badges row */}
                            <Stack direction="row" gap={1.5} flexWrap="wrap">
                                <StatBadge icon={CheckCircleOutlineOutlinedIcon} label="Complete" value={presentCount} accentColor="#5A8A72" />
                                <StatBadge icon={WarningAmberOutlinedIcon} label="Needs Work" value={weakCount} accentColor="#C49A6C" />
                                <StatBadge icon={ErrorOutlineOutlinedIcon} label="Missing" value={missingCount} accentColor="#B86B6B" />
                                <StatBadge icon={ArticleOutlinedIcon} label="Total Sections" value={report.sections.length} accentColor={t.accentPrimary} />
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Section coverage bar */}
                    <Box sx={{ mt: 3.5, pt: 2.5, borderTop: `1px solid ${scoreColor}12` }}>
                        <Stack direction="row" justifyContent="space-between" mb={1.2}>
                            <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: t.textTertiary, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                                Section Coverage
                            </Typography>
                            <Typography sx={{ fontSize: "0.68rem", color: t.textTertiary, fontWeight: 600 }}>
                                {presentCount} / {report.sections.length} sections complete
                            </Typography>
                        </Stack>
                        <Stack direction="row" gap={0.5} sx={{ height: 10, borderRadius: 3, overflow: "hidden" }}>
                            {report.sections.map((s, i) => {
                                const m = STATUS_META[s.status] ?? STATUS_META.weak;
                                return (
                                    <Tooltip key={i} title={`${s.name}: ${m.label}`} arrow>
                                        <Box sx={{
                                            flex: 1,
                                            background: `linear-gradient(180deg, ${m.color} 0%, ${m.color}80 100%)`,
                                            transition: "opacity .2s",
                                            "&:hover": { opacity: 0.8 },
                                        }} />
                                    </Tooltip>
                                );
                            })}
                        </Stack>
                        <Stack direction="row" gap={2.5} mt={1.4} flexWrap="wrap">
                            {Object.entries(STATUS_META).map(([key, m]) => {
                                const count = report.sections.filter(s => s.status === key).length;
                                if (!count) return null;
                                return (
                                    <Stack key={key} direction="row" alignItems="center" gap={0.7}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: 1.5, bgcolor: m.color }} />
                                        <Typography sx={{ fontSize: "0.68rem", color: t.textTertiary }}>
                                            {m.label}: <strong>{count}</strong>
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
                    borderRadius: 3.5,
                    border: `1px solid ${t.accentPrimary}22`,
                    overflow: "hidden",
                    bgcolor: theme.palette.background.paper,
                    backdropFilter: "blur(12px)",
                }}>
                    <Box sx={{
                        px: 2.5, py: 1.6,
                        background: `linear-gradient(135deg, ${t.accentPrimary}12 0%, ${t.accentPrimary}05 100%)`,
                        borderBottom: `1px solid ${t.accentPrimary}15`,
                    }}>
                        <Stack direction="row" alignItems="center" gap={1.2}>
                            <Box sx={{
                                width: 28, height: 28, borderRadius: 2,
                                background: `linear-gradient(135deg, ${t.accentPrimary}25 0%, ${t.accentPrimary}12 100%)`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <TipsAndUpdatesOutlinedIcon sx={{ fontSize: 15, color: t.accentPrimary }} />
                            </Box>
                            <Typography sx={{
                                fontWeight: 700, fontSize: "0.74rem", color: t.accentPrimary,
                                textTransform: "uppercase", letterSpacing: "0.07em",
                            }}>
                                Fix these before submitting to your supervisor
                            </Typography>
                        </Stack>
                    </Box>
                    <Stack spacing={0} sx={{ p: 2.2 }}>
                        {report.topPriorities.map((p, i) => (
                            <Stack
                                key={i} direction="row" gap={1.8} alignItems="flex-start"
                                sx={{
                                    py: 1.4,
                                    borderBottom: i < report.topPriorities.length - 1
                                        ? `1px solid ${t.borderLight}`
                                        : "none",
                                }}
                            >
                                <Box sx={{
                                    minWidth: 26, height: 26, borderRadius: "50%",
                                    background: `linear-gradient(135deg, ${t.accentPrimary} 0%, ${t.accentPrimary}80 100%)`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0, mt: "1px",
                                    boxShadow: `0 2px 8px ${t.accentPrimary}30`,
                                }}>
                                    <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, color: "#fff" }}>
                                        {i + 1}
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: "0.83rem", color: t.textSecondary, lineHeight: 1.75 }}>
                                    {p}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Paper>
            )}

            {/* ── Sections ── */}
            <Box>
                <Stack direction="row" alignItems="center" gap={1.2} mb={1.8}>
                    <Box sx={{
                        width: 3, height: 18, borderRadius: 2,
                        background: `linear-gradient(180deg, ${t.accentPrimary} 0%, ${t.accentPrimary}50 100%)`,
                    }} />
                    <Typography sx={{
                        fontWeight: 700, fontSize: "0.72rem", color: t.textTertiary,
                        textTransform: "uppercase", letterSpacing: "0.1em",
                    }}>
                        Section-by-section analysis
                    </Typography>
                </Stack>
                <Stack spacing={1.2}>
                    {report.sections.map((section, i) => (
                        <SectionCard key={i} section={section} t={t} theme={theme} />
                    ))}
                </Stack>
            </Box>

            {/* ── Re-analyze ── */}
            <Box sx={{
                textAlign: "center", py: 2,
                borderTop: `1px solid ${t.borderLight}`,
            }}>
                <Button
                    size="small"
                    startIcon={<RefreshOutlinedIcon sx={{ fontSize: 15 }} />}
                    onClick={onReset}
                    sx={{
                        color: t.textTertiary, fontSize: "0.76rem",
                        "&:hover": { color: t.accentPrimary },
                        transition: "color .2s",
                    }}
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
                    position: "relative",
                },
            }}
        >
            {/* ── Academic Background ── */}
            <AcademicBackground accentColor={t.accentPrimary} />

            {/* ── Top Bar ── */}
            <Box sx={{
                px: { xs: 2, sm: 3 }, py: 1.8,
                borderBottom: `1px solid ${t.borderLight}`,
                bgcolor: `${theme.palette.background.paper}E8`,
                backdropFilter: "blur(16px)",
                display: "flex", alignItems: "center", gap: 2,
                flexShrink: 0,
                position: "relative", zIndex: 1,
            }}>
                {/* Icon + title */}
                <Stack direction="row" alignItems="center" gap={1.4} sx={{ flexShrink: 0 }}>
                    <Box sx={{
                        width: 38, height: 38, borderRadius: 2.5,
                        background: `linear-gradient(135deg, ${t.accentPrimary}25 0%, ${t.accentPrimary}12 100%)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: `1px solid ${t.accentPrimary}20`,
                    }}>
                        <AutoAwesomeOutlinedIcon sx={{ fontSize: 19, color: t.accentPrimary }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: "0.94rem", color: t.textPrimary, lineHeight: 1.2 }}>
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
                            icon={<SchoolOutlinedIcon sx={{ fontSize: 13, "&&": { color: t.accentPrimary } }} />}
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
            <Box sx={{ flex: 1, overflow: "auto", p: { xs: 2, sm: 3 }, position: "relative", zIndex: 1 }}>
                <Box sx={{ maxWidth: 860, mx: "auto", width: "100%" }}>

                    {/* ── Upload / Analyzing view ── */}
                    {!report && (
                        <Stack spacing={3}>
                            {/* Page header */}
                            <Box sx={{ textAlign: "center", py: 1 }}>
                                <Stack direction="row" alignItems="center" justifyContent="center" gap={1.2} mb={1}>
                                    <SchoolOutlinedIcon sx={{ fontSize: 22, color: t.accentPrimary, opacity: 0.7 }} />
                                    <Typography sx={{
                                        fontSize: "1.5rem", fontWeight: 800, color: t.textPrimary,
                                        letterSpacing: "-0.02em",
                                    }}>
                                        Check your document before submission
                                    </Typography>
                                </Stack>
                                <Typography sx={{ fontSize: "0.85rem", color: t.textSecondary, maxWidth: 540, mx: "auto" }}>
                                    Upload your PDF and get instant AI-powered feedback on every section — so you can fix issues before your supervisor sees it.
                                </Typography>
                            </Box>

                            <HowItWorks t={t} theme={theme} />

                            {/* Upload area with label */}
                            <Box>
                                <Stack direction="row" alignItems="center" gap={1} mb={1.2}>
                                    <Box sx={{ width: 3, height: 16, borderRadius: 2, bgcolor: t.accentPrimary }} />
                                    <Typography sx={{ fontSize: "0.77rem", fontWeight: 700, color: t.textPrimary, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        Upload Your Document
                                    </Typography>
                                </Stack>
                                <DropZone
                                    file={uploadedFile}
                                    analyzing={analyzing}
                                    onFilePick={handleFilePick}
                                    onDrop={handleDrop}
                                    onRemove={() => { setUploadedFile(null); setError(""); }}
                                    fileInputRef={fileInputRef}
                                    t={t}
                                />
                            </Box>

                            {error && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        borderRadius: 2.5, fontSize: "0.81rem",
                                        bgcolor: "#B86B6B12", border: "1px solid #B86B6B20",
                                        "& .MuiAlert-icon": { color: "#B86B6B" },
                                    }}
                                >
                                    {error}
                                </Alert>
                            )}

                            {/* Privacy note */}
                            <Paper elevation={0} sx={{
                                borderRadius: 2.5, p: 2,
                                bgcolor: `${t.accentPrimary}06`,
                                border: `1px dashed ${t.accentPrimary}20`,
                                backdropFilter: "blur(8px)",
                            }}>
                                <Stack direction="row" alignItems="center" gap={1.5}>
                                    <LockOutlinedIcon sx={{ fontSize: 16, color: t.accentPrimary, flexShrink: 0 }} />
                                    <Box>
                                        <Typography sx={{ fontSize: "0.77rem", fontWeight: 700, color: t.accentPrimary, mb: 0.2 }}>
                                            Your privacy is protected
                                        </Typography>
                                        <Typography sx={{ fontSize: "0.71rem", color: t.textTertiary, lineHeight: 1.6 }}>
                                            Uploaded PDFs are processed in real-time and never stored on our servers. Your document is analyzed securely and immediately discarded after the report is generated.
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>
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
                    bgcolor: `${theme.palette.background.paper}E8`,
                    backdropFilter: "blur(16px)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    flexShrink: 0, gap: 2, position: "relative", zIndex: 1,
                }}>
                    <Stack direction="row" alignItems="center" gap={1}>
                        {uploadedFile
                            ? <InsertDriveFileOutlinedIcon sx={{ fontSize: 15, color: t.accentPrimary }} />
                            : <LockOutlinedIcon sx={{ fontSize: 13, color: t.textTertiary }} />
                        }
                        <Typography sx={{ fontSize: "0.72rem", color: uploadedFile ? t.accentPrimary : t.textTertiary, fontWeight: uploadedFile ? 600 : 400 }}>
                            {uploadedFile
                                ? `${uploadedFile.name} — ready to analyze`
                                : "Upload a PDF to get started"}
                        </Typography>
                    </Stack>

                    <Stack direction="row" gap={1.5}>
                        <Button
                            onClick={handleClose}
                            disabled={analyzing}
                            sx={{ color: t.textSecondary, fontSize: "0.82rem", borderRadius: 2 }}
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
                                background: uploadedFile && !analyzing
                                    ? `linear-gradient(135deg, ${t.accentPrimary} 0%, ${t.accentPrimary}CC 100%)`
                                    : undefined,
                                bgcolor: !uploadedFile || analyzing ? `${t.accentPrimary}30` : undefined,
                                borderRadius: 2.5,
                                fontWeight: 700, px: 3.5, fontSize: "0.84rem",
                                boxShadow: uploadedFile && !analyzing ? `0 4px 16px ${t.accentPrimary}35` : "none",
                                "&:hover": { boxShadow: `0 6px 20px ${t.accentPrimary}45` },
                                "&.Mui-disabled": { bgcolor: `${t.accentPrimary}25`, color: `${t.accentPrimary}60` },
                                transition: "box-shadow .25s",
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