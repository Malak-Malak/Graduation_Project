// src/components/common/student/AIProjectSuggester/AIProjectSuggester.jsx
// يقترح مشاريع سابقة مشابهة وأفكار جديدة بناءً على عنوان المشروع ووصفه

import { useState } from "react";
import {
    Dialog, Box, Typography, Stack, Paper, Button, IconButton,
    CircularProgress, Alert, Chip, Divider, Tooltip, LinearProgress,
    Tab, Tabs,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import EmojiObjectsOutlinedIcon from "@mui/icons-material/EmojiObjectsOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

// ─── helpers ──────────────────────────────────────────────────────────────────

const RELEVANCE_COLOR = (r) =>
    r >= 85 ? "#5A8A72" : r >= 65 ? "#C49A6C" : "#B86B6B";

const DIFF_META = {
    easy: { label: "Easy", color: "#5A8A72" },
    medium: { label: "Medium", color: "#C49A6C" },
    hard: { label: "Hard", color: "#B86B6B" },
};

// ─── SimilarProjectCard ───────────────────────────────────────────────────────

function SimilarProjectCard({ project, t, theme }) {
    const relColor = RELEVANCE_COLOR(project.relevance ?? 80);
    const accent = t.accentPrimary;

    return (
        <Paper elevation={0} sx={{
            borderRadius: 3,
            border: `1px solid ${accent}20`,
            overflow: "hidden",
            bgcolor: theme.palette.background.paper,
            transition: "border-color .2s, box-shadow .2s, transform .15s",
            "&:hover": {
                borderColor: `${accent}45`,
                boxShadow: `0 4px 20px ${accent}12`,
                transform: "translateY(-1px)",
            },
        }}>
            {/* top accent bar */}
            <Box sx={{ height: 3, background: `linear-gradient(90deg, ${accent} 0%, ${accent}50 100%)` }} />

            <Box sx={{ px: 2.2, py: 1.8 }}>
                <Stack direction="row" alignItems="flex-start" gap={1.5}>
                    <Box sx={{
                        width: 40, height: 40, borderRadius: 2, flexShrink: 0,
                        bgcolor: `${accent}14`,
                        border: `1px solid ${accent}22`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <FolderSpecialOutlinedIcon sx={{ fontSize: 19, color: accent }} />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" gap={1} mb={0.5} flexWrap="wrap">
                            {project.university && (
                                <Chip
                                    icon={<SchoolOutlinedIcon sx={{ fontSize: "10px !important", color: `${accent} !important` }} />}
                                    label={project.university} size="small"
                                    sx={{
                                        height: 20, fontSize: "0.6rem", fontWeight: 700,
                                        bgcolor: `${accent}12`, color: accent,
                                        border: `1px solid ${accent}22`,
                                        "& .MuiChip-label": { px: 0.9 },
                                    }}
                                />
                            )}
                            {project.year && (
                                <Typography sx={{ fontSize: "0.65rem", color: t.textTertiary, fontWeight: 600 }}>
                                    {project.year}
                                </Typography>
                            )}
                        </Stack>

                        <Typography sx={{
                            fontSize: "0.88rem", fontWeight: 700, color: t.textPrimary,
                            lineHeight: 1.4, mb: 0.5,
                            overflow: "hidden", textOverflow: "ellipsis",
                            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                        }}>
                            {project.title}
                        </Typography>

                        {project.team && (
                            <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary, mb: 0.7 }}>
                                {project.team}
                            </Typography>
                        )}

                        <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, lineHeight: 1.7, mb: 1 }}>
                            {project.description}
                        </Typography>

                        {/* tech stack */}
                        {project.techStack?.length > 0 && (
                            <Stack direction="row" flexWrap="wrap" gap={0.6} mb={1.2}>
                                {project.techStack.map((tech, i) => (
                                    <Box key={i} sx={{
                                        px: 1, py: 0.25, borderRadius: 1.5,
                                        bgcolor: `${accent}0A`, border: `1px solid ${accent}18`,
                                    }}>
                                        <Typography sx={{ fontSize: "0.63rem", fontWeight: 600, color: accent }}>
                                            {tech}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        )}

                        {/* similarities */}
                        {project.similarities?.length > 0 && (
                            <Box sx={{ px: 1.4, py: 0.9, borderRadius: 2, mb: 1.2, bgcolor: `${accent}07`, border: `1px dashed ${accent}22` }}>
                                <Stack direction="row" alignItems="flex-start" gap={0.8}>
                                    <CompareArrowsOutlinedIcon sx={{ fontSize: 12, color: accent, mt: "3px", flexShrink: 0 }} />
                                    <Box>
                                        <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: accent, mb: 0.4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                            Similarities
                                        </Typography>
                                        {project.similarities.map((s, i) => (
                                            <Stack key={i} direction="row" alignItems="center" gap={0.6} mb={0.2}>
                                                <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: accent, flexShrink: 0 }} />
                                                <Typography sx={{ fontSize: "0.71rem", color: t.textSecondary, lineHeight: 1.5 }}>{s}</Typography>
                                            </Stack>
                                        ))}
                                    </Box>
                                </Stack>
                            </Box>
                        )}

                        {/* differences */}
                        {project.howYoursIsBetter && (
                            <Box sx={{ px: 1.4, py: 0.9, borderRadius: 2, mb: 1.2, bgcolor: "#5A8A7208", border: `1px dashed #5A8A7228` }}>
                                <Stack direction="row" alignItems="flex-start" gap={0.8}>
                                    <StarBorderOutlinedIcon sx={{ fontSize: 12, color: "#5A8A72", mt: "3px", flexShrink: 0 }} />
                                    <Box>
                                        <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#5A8A72", mb: 0.3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                            How yours can stand out
                                        </Typography>
                                        <Typography sx={{ fontSize: "0.71rem", color: t.textSecondary, lineHeight: 1.6 }}>
                                            {project.howYoursIsBetter}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        )}

                        {/* relevance + link */}
                        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap">
                            <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 140 }}>
                                <Typography sx={{ fontSize: "0.62rem", color: t.textTertiary, fontWeight: 600, whiteSpace: "nowrap" }}>
                                    Similarity
                                </Typography>
                                <Box sx={{ flex: 1, minWidth: 60 }}>
                                    <LinearProgress variant="determinate" value={project.relevance ?? 80} sx={{
                                        height: 4, borderRadius: 3,
                                        bgcolor: `${relColor}15`,
                                        "& .MuiLinearProgress-bar": {
                                            background: `linear-gradient(90deg, ${relColor} 0%, ${relColor}80 100%)`,
                                            borderRadius: 3,
                                        },
                                    }} />
                                </Box>
                                <Typography sx={{ fontSize: "0.62rem", color: relColor, fontWeight: 700 }}>
                                    {project.relevance ?? 80}%
                                </Typography>
                            </Stack>

                            {project.url && (
                                <Button size="small" endIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 12 }} />}
                                    onClick={() => window.open(project.url, "_blank")}
                                    sx={{
                                        fontSize: "0.7rem", fontWeight: 600,
                                        color: accent, bgcolor: `${accent}10`,
                                        border: `1px solid ${accent}25`,
                                        borderRadius: 2, px: 1.5, py: 0.4,
                                        "&:hover": { bgcolor: `${accent}20` }, minWidth: 0,
                                    }}>
                                    View Project
                                </Button>
                            )}
                        </Stack>
                    </Box>
                </Stack>
            </Box>
        </Paper>
    );
}

// ─── NewIdeaCard ──────────────────────────────────────────────────────────────

function NewIdeaCard({ idea, index, t, theme }) {
    const accent = t.accentPrimary;
    const diff = DIFF_META[(idea.difficulty ?? "medium").toLowerCase()] ?? DIFF_META.medium;

    const IDEA_COLORS = [
        "#9B72C4", "#5A8A72", "#C49A6C", "#6B8AC4", "#B86B6B", "#7A9E5B",
    ];
    const color = IDEA_COLORS[index % IDEA_COLORS.length];

    return (
        <Paper elevation={0} sx={{
            borderRadius: 3,
            border: `1px solid ${color}22`,
            overflow: "hidden",
            bgcolor: theme.palette.background.paper,
            transition: "border-color .2s, box-shadow .2s, transform .15s",
            "&:hover": {
                borderColor: `${color}48`,
                boxShadow: `0 4px 20px ${color}12`,
                transform: "translateY(-1px)",
            },
        }}>
            <Box sx={{ height: 3, background: `linear-gradient(90deg, ${color} 0%, ${color}50 100%)` }} />
            <Box sx={{ px: 2.2, py: 1.8 }}>
                <Stack direction="row" alignItems="flex-start" gap={1.5}>
                    <Box sx={{
                        width: 40, height: 40, borderRadius: 2, flexShrink: 0,
                        bgcolor: `${color}14`, border: `1px solid ${color}22`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.9rem", fontWeight: 800, color,
                    }}>
                        {index + 1}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" gap={0.8} mb={0.5} flexWrap="wrap">
                            <Chip label={diff.label} size="small" sx={{
                                height: 18, fontSize: "0.6rem", fontWeight: 700,
                                bgcolor: `${diff.color}15`, color: diff.color,
                                border: `1px solid ${diff.color}25`,
                                "& .MuiChip-label": { px: 0.9 },
                            }} />
                            {idea.category && (
                                <Chip label={idea.category} size="small" sx={{
                                    height: 18, fontSize: "0.6rem", fontWeight: 700,
                                    bgcolor: `${color}12`, color,
                                    border: `1px solid ${color}22`,
                                    "& .MuiChip-label": { px: 0.9 },
                                }} />
                            )}
                        </Stack>

                        <Typography sx={{
                            fontSize: "0.9rem", fontWeight: 700, color: t.textPrimary,
                            lineHeight: 1.35, mb: 0.6,
                        }}>
                            {idea.title}
                        </Typography>

                        <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, lineHeight: 1.7, mb: 1.1 }}>
                            {idea.description}
                        </Typography>

                        {/* key features */}
                        {idea.keyFeatures?.length > 0 && (
                            <Box sx={{ mb: 1.2 }}>
                                <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: t.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.7 }}>
                                    Key features
                                </Typography>
                                <Stack gap={0.5}>
                                    {idea.keyFeatures.map((f, i) => (
                                        <Stack key={i} direction="row" alignItems="flex-start" gap={0.8}>
                                            <CheckCircleOutlinedIcon sx={{ fontSize: 12, color, mt: "3px", flexShrink: 0 }} />
                                            <Typography sx={{ fontSize: "0.74rem", color: t.textSecondary, lineHeight: 1.55 }}>{f}</Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Box>
                        )}

                        {/* suggested tech */}
                        {idea.suggestedTech?.length > 0 && (
                            <Stack direction="row" flexWrap="wrap" gap={0.6} mb={1.2}>
                                <BuildOutlinedIcon sx={{ fontSize: 12, color: t.textTertiary, mt: "3px" }} />
                                {idea.suggestedTech.map((tech, i) => (
                                    <Box key={i} sx={{
                                        px: 1, py: 0.25, borderRadius: 1.5,
                                        bgcolor: `${color}0A`, border: `1px solid ${color}18`,
                                    }}>
                                        <Typography sx={{ fontSize: "0.63rem", fontWeight: 600, color }}>
                                            {tech}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        )}

                        {/* innovation angle */}
                        {idea.innovationAngle && (
                            <Box sx={{ px: 1.4, py: 0.9, borderRadius: 2, bgcolor: `${color}07`, border: `1px dashed ${color}22` }}>
                                <Stack direction="row" alignItems="flex-start" gap={0.8}>
                                    <EmojiObjectsOutlinedIcon sx={{ fontSize: 12, color, mt: "3px", flexShrink: 0 }} />
                                    <Typography sx={{ fontSize: "0.72rem", color, fontStyle: "italic", lineHeight: 1.6 }}>
                                        {idea.innovationAngle}
                                    </Typography>
                                </Stack>
                            </Box>
                        )}
                    </Box>
                </Stack>
            </Box>
        </Paper>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * AIProjectSuggester
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - project: { title, description, field, department, teamMembers[] }
 */
export default function AIProjectSuggester({ open, onClose, project }) {
    const theme = useTheme();
    const t = theme.palette.custom;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    const handleClose = () => { if (loading) return; onClose(); };
    const handleReset = () => { setResult(null); setError(""); setActiveTab(0); };

    const handleFetch = async () => {
        setLoading(true);
        setError("");
        setResult(null);
        setActiveTab(0);

        const projectContext = [
            project?.title && `Project Title: ${project.title}`,
            project?.field && `Field / Skills: ${project.field}`,
            project?.department && `Department: ${project.department}`,
            project?.description && `Description: ${project.description}`,
            project?.teamMembers?.length && `Team size: ${project.teamMembers.length} members`,
        ].filter(Boolean).join("\n");

        const prompt = `You are an AI assistant helping graduation project students at a university.

Based on this graduation project:
${projectContext}

Return ONLY a valid JSON object (no markdown, no backticks, no extra text) in this exact structure:

{
  "summary": "2-sentence overview of what was found",
  "tags": ["tag1", "tag2", "tag3"],
  "similarProjects": [
    {
      "title": "Project title",
      "university": "University or source name",
      "year": "2022",
      "team": "Team name or authors if known",
      "description": "What this project did, 2-3 sentences",
      "techStack": ["React", "Node.js", "MongoDB"],
      "similarities": ["Uses similar ML pipeline", "Same problem domain"],
      "howYoursIsBetter": "One sentence on how the student's project can differentiate or improve on this",
      "relevance": 88,
      "url": "https://github.com/... or https://... (real URL if exists, otherwise omit)"
    }
  ],
  "newIdeas": [
    {
      "title": "Idea title — specific and catchy",
      "category": "AI / Web / Mobile / IoT / etc.",
      "difficulty": "Easy | Medium | Hard",
      "description": "Clear explanation of what to build and why it matters, 2-3 sentences",
      "keyFeatures": ["Feature 1", "Feature 2", "Feature 3"],
      "suggestedTech": ["Python", "FastAPI", "React"],
      "innovationAngle": "What makes this idea fresh or valuable compared to existing solutions"
    }
  ],
  "improvements": [
    {
      "area": "Area to improve (e.g., Performance, UX, Security)",
      "suggestion": "Concrete suggestion",
      "impact": "High | Medium | Low"
    }
  ]
}

Rules:
- Return ONLY valid JSON, nothing else
- similarProjects: 3-4 real or realistic capstone/graduation projects similar to the given one. Use real GitHub or university project URLs where possible.
- newIdeas: 4-5 creative new project ideas that extend or relate to the given project's domain
- improvements: 3-4 concrete suggestions to improve/extend the current project
- Be highly specific to the field — no generic placeholder content
- relevance in similarProjects: 0-100`;

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.75, maxOutputTokens: 4096 },
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
            const jsonStart = cleaned.indexOf("{");
            const jsonEnd = cleaned.lastIndexOf("}");
            if (jsonStart === -1 || jsonEnd === -1)
                throw new Error("Unexpected response from AI. Please try again.");

            const parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));
            if (!parsed.similarProjects && !parsed.newIdeas)
                throw new Error("Unexpected response format from AI.");

            setResult(parsed);
        } catch (err) {
            console.error("AIProjectSuggester error:", err);
            setError(err?.message ?? "Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const hasProjectInfo = project?.title || project?.description;
    const accent = t.accentPrimary;

    const tabCounts = result ? [
        result.similarProjects?.length ?? 0,
        result.newIdeas?.length ?? 0,
        result.improvements?.length ?? 0,
    ] : [0, 0, 0];

    return (
        <Dialog open={open} onClose={handleClose} fullScreen
            PaperProps={{
                sx: {
                    bgcolor: theme.palette.background.default,
                    backgroundImage: "none",
                    display: "flex", flexDirection: "column",
                },
            }}
        >
            {/* ── Top Bar ── */}
            <Box sx={{
                px: { xs: 2, sm: 3 }, py: 1.8,
                borderBottom: `1px solid ${t.borderLight}`,
                bgcolor: `${theme.palette.background.paper}E8`,
                backdropFilter: "blur(16px)",
                display: "flex", alignItems: "center", gap: 2,
                flexShrink: 0,
            }}>
                <Stack direction="row" alignItems="center" gap={1.4} sx={{ flex: 1 }}>
                    <Box sx={{
                        width: 38, height: 38, borderRadius: 2.5,
                        bgcolor: `${accent}20`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: `1px solid ${accent}22`,
                    }}>
                        <LightbulbOutlinedIcon sx={{ fontSize: 19, color: accent }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: "0.94rem", color: t.textPrimary, lineHeight: 1.2 }}>
                            AI Project Suggester
                        </Typography>
                        <Typography sx={{ fontSize: "0.68rem", color: t.textTertiary }}>
                            Similar projects, new ideas & improvement tips — tailored to your project
                        </Typography>
                    </Box>
                </Stack>

                {result && (
                    <Chip
                        label={`${(result.similarProjects?.length ?? 0) + (result.newIdeas?.length ?? 0)} suggestions`}
                        size="small"
                        sx={{
                            bgcolor: `${accent}15`, color: accent,
                            fontWeight: 700, fontSize: "0.68rem",
                            border: `1px solid ${accent}25`,
                            display: { xs: "none", sm: "flex" },
                        }}
                    />
                )}

                <Tooltip title="Close">
                    <span>
                        <IconButton onClick={handleClose} disabled={loading} sx={{ color: t.textTertiary }}>
                            <CloseOutlinedIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>

            {/* ── Body ── */}
            <Box sx={{ flex: 1, overflow: "auto", p: { xs: 2, sm: 3 } }}>
                <Box sx={{ maxWidth: 860, mx: "auto", width: "100%" }}>

                    {/* ── Idle ── */}
                    {!result && !loading && (
                        <Stack spacing={3}>
                            <Box sx={{ textAlign: "center", py: 2 }}>
                                <Box sx={{
                                    width: 64, height: 64, borderRadius: 4, mx: "auto", mb: 2,
                                    bgcolor: `${accent}18`, border: `1px solid ${accent}22`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <AutoAwesomeOutlinedIcon sx={{ fontSize: 28, color: accent }} />
                                </Box>
                                <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: t.textPrimary, mb: 1 }}>
                                    Discover similar projects & fresh ideas
                                </Typography>
                                <Typography sx={{ fontSize: "0.85rem", color: t.textSecondary, maxWidth: 520, mx: "auto" }}>
                                    Based on your project title and description, AI will find similar graduation projects done before, suggest new creative ideas in your domain, and offer improvement tips.
                                </Typography>
                            </Box>

                            {/* project info banner */}
                            <Paper elevation={0} sx={{
                                borderRadius: 3, border: `1px solid ${accent}20`,
                                bgcolor: `${accent}06`, px: 2.5, py: 1.8,
                            }}>
                                <Stack direction="row" alignItems="center" gap={1} mb={1}>
                                    <FolderOutlinedIcon sx={{ fontSize: 14, color: accent }} />
                                    <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                                        Analyzing your project
                                    </Typography>
                                </Stack>
                                <Stack direction="row" gap={3} flexWrap="wrap">
                                    {project?.title && (
                                        <Box>
                                            <Typography sx={{ fontSize: "0.63rem", color: accent, opacity: 0.7, fontWeight: 600, mb: 0.2 }}>TITLE</Typography>
                                            <Typography sx={{ fontSize: "0.84rem", fontWeight: 700, color: t.textPrimary }}>{project.title}</Typography>
                                        </Box>
                                    )}
                                    {project?.field && (
                                        <Box>
                                            <Typography sx={{ fontSize: "0.63rem", color: accent, opacity: 0.7, fontWeight: 600, mb: 0.2 }}>FIELD</Typography>
                                            <Typography sx={{ fontSize: "0.84rem", fontWeight: 700, color: t.textPrimary }}>{project.field}</Typography>
                                        </Box>
                                    )}
                                    {project?.department && (
                                        <Box>
                                            <Typography sx={{ fontSize: "0.63rem", color: accent, opacity: 0.7, fontWeight: 600, mb: 0.2 }}>DEPARTMENT</Typography>
                                            <Typography sx={{ fontSize: "0.84rem", fontWeight: 700, color: t.textPrimary }}>{project.department}</Typography>
                                        </Box>
                                    )}
                                </Stack>
                                {project?.description && (
                                    <Box mt={1.2} sx={{ pt: 1.2, borderTop: `1px solid ${accent}15` }}>
                                        <Typography sx={{ fontSize: "0.63rem", color: accent, opacity: 0.7, fontWeight: 600, mb: 0.3 }}>DESCRIPTION</Typography>
                                        <Typography sx={{
                                            fontSize: "0.78rem", color: t.textSecondary, lineHeight: 1.65,
                                            display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                                        }}>
                                            {project.description}
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>

                            {/* what you get */}
                            <Paper elevation={0} sx={{
                                borderRadius: 3.5, border: `1px solid ${accent}18`,
                                bgcolor: theme.palette.background.paper, overflow: "hidden",
                            }}>
                                <Box sx={{ px: 2.5, py: 1.6, borderBottom: `1px solid ${accent}12`, bgcolor: `${accent}06` }}>
                                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: accent }}>
                                        What you'll get
                                    </Typography>
                                </Box>
                                <Stack direction={{ xs: "column", sm: "row" }}
                                    divider={<Divider orientation="vertical" flexItem sx={{ borderColor: `${accent}10` }} />}>
                                    {[
                                        { Icon: FolderSpecialOutlinedIcon, label: "Similar Projects", desc: "Past graduation projects like yours" },
                                        { Icon: EmojiObjectsOutlinedIcon, label: "New Ideas", desc: "Creative extensions & fresh concepts" },
                                        { Icon: StarBorderOutlinedIcon, label: "Improvements", desc: "Tips to level up your current project" },
                                    ].map((item, i) => (
                                        <Stack key={i} direction="row" alignItems="center" gap={1.2} sx={{ flex: 1, px: 2, py: 1.6 }}>
                                            <item.Icon sx={{ fontSize: 18, color: accent, opacity: 0.7, flexShrink: 0 }} />
                                            <Box>
                                                <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: t.textPrimary }}>
                                                    {item.label}
                                                </Typography>
                                                <Typography sx={{ fontSize: "0.68rem", color: t.textTertiary }}>
                                                    {item.desc}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Paper>

                            {error && (
                                <Alert severity="error" sx={{ borderRadius: 2.5, fontSize: "0.81rem" }}>
                                    {error}
                                </Alert>
                            )}
                        </Stack>
                    )}

                    {/* ── Loading ── */}
                    {loading && (
                        <Stack alignItems="center" justifyContent="center" spacing={3} sx={{ py: 10 }}>
                            <Box sx={{ position: "relative" }}>
                                <CircularProgress size={56} sx={{ color: accent }} thickness={2} />
                                <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <LightbulbOutlinedIcon sx={{ fontSize: 22, color: accent }} />
                                </Box>
                            </Box>
                            <Box sx={{ textAlign: "center" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: t.textPrimary, mb: 0.6 }}>
                                    Analyzing your project…
                                </Typography>
                                <Typography sx={{ fontSize: "0.78rem", color: t.textTertiary }}>
                                    Finding similar projects and generating ideas based on your field
                                </Typography>
                            </Box>
                            <Box sx={{ width: "100%", maxWidth: 300 }}>
                                <LinearProgress sx={{
                                    borderRadius: 3, height: 4,
                                    bgcolor: `${accent}15`,
                                    "& .MuiLinearProgress-bar": {
                                        background: `linear-gradient(90deg, ${accent} 0%, ${accent}80 100%)`,
                                    },
                                }} />
                            </Box>
                        </Stack>
                    )}

                    {/* ── Results ── */}
                    {result && !loading && (
                        <Stack spacing={3}>
                            {/* summary banner */}
                            <Paper elevation={0} sx={{
                                borderRadius: 3, px: 2.5, py: 2,
                                border: `1px solid ${accent}20`, bgcolor: `${accent}06`,
                            }}>
                                <Stack direction="row" alignItems="flex-start" gap={1.5}>
                                    <TipsAndUpdatesOutlinedIcon sx={{ fontSize: 18, color: accent, flexShrink: 0, mt: "2px" }} />
                                    <Box sx={{ flex: 1 }}>
                                        {result.tags?.length > 0 && (
                                            <Stack direction="row" gap={0.8} flexWrap="wrap" mb={1}>
                                                {result.tags.map((tag, i) => (
                                                    <Chip key={i} label={tag} size="small" sx={{
                                                        height: 20, fontSize: "0.63rem", fontWeight: 600,
                                                        bgcolor: `${accent}15`, color: accent,
                                                        border: `1px solid ${accent}20`,
                                                        "& .MuiChip-label": { px: 1 },
                                                    }} />
                                                ))}
                                            </Stack>
                                        )}
                                        {result.summary && (
                                            <Typography sx={{ fontSize: "0.8rem", color: t.textSecondary, lineHeight: 1.7 }}>
                                                {result.summary}
                                            </Typography>
                                        )}
                                    </Box>
                                </Stack>
                            </Paper>

                            {/* tabs */}
                            <Paper elevation={0} sx={{
                                borderRadius: 3, border: `1px solid ${t.borderLight}`,
                                bgcolor: theme.palette.background.paper, overflow: "hidden",
                            }}>
                                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{
                                    px: 1.5, minHeight: 46,
                                    borderBottom: `1px solid ${t.borderLight}`,
                                    "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.8rem", minHeight: 46, color: t.textTertiary },
                                    "& .Mui-selected": { color: accent },
                                    "& .MuiTabs-indicator": { bgcolor: accent, height: 2.5, borderRadius: "2px" },
                                }}>
                                    <Tab label={
                                        <Stack direction="row" alignItems="center" gap={0.7}>
                                            <FolderSpecialOutlinedIcon sx={{ fontSize: 15 }} />
                                            <span>Similar Projects</span>
                                            {tabCounts[0] > 0 && (
                                                <Chip label={tabCounts[0]} size="small" sx={{ height: 16, fontSize: "0.6rem", fontWeight: 700, bgcolor: `${accent}18`, color: accent, borderRadius: "5px" }} />
                                            )}
                                        </Stack>
                                    } />
                                    <Tab label={
                                        <Stack direction="row" alignItems="center" gap={0.7}>
                                            <EmojiObjectsOutlinedIcon sx={{ fontSize: 15 }} />
                                            <span>New Ideas</span>
                                            {tabCounts[1] > 0 && (
                                                <Chip label={tabCounts[1]} size="small" sx={{ height: 16, fontSize: "0.6rem", fontWeight: 700, bgcolor: `${accent}18`, color: accent, borderRadius: "5px" }} />
                                            )}
                                        </Stack>
                                    } />
                                    <Tab label={
                                        <Stack direction="row" alignItems="center" gap={0.7}>
                                            <StarBorderOutlinedIcon sx={{ fontSize: 15 }} />
                                            <span>Improvements</span>
                                            {tabCounts[2] > 0 && (
                                                <Chip label={tabCounts[2]} size="small" sx={{ height: 16, fontSize: "0.6rem", fontWeight: 700, bgcolor: `${accent}18`, color: accent, borderRadius: "5px" }} />
                                            )}
                                        </Stack>
                                    } />
                                </Tabs>

                                <Box sx={{ p: 2.5 }}>
                                    {/* Tab 0 — Similar Projects */}
                                    {activeTab === 0 && (
                                        result.similarProjects?.length > 0 ? (
                                            <Stack spacing={1.5}>
                                                {result.similarProjects.map((proj, i) => (
                                                    <SimilarProjectCard key={i} project={proj} t={t} theme={theme} />
                                                ))}
                                            </Stack>
                                        ) : (
                                            <Typography sx={{ color: t.textTertiary, fontSize: "0.82rem", textAlign: "center", py: 4 }}>
                                                No similar projects found for this field.
                                            </Typography>
                                        )
                                    )}

                                    {/* Tab 1 — New Ideas */}
                                    {activeTab === 1 && (
                                        result.newIdeas?.length > 0 ? (
                                            <Stack spacing={1.5}>
                                                {result.newIdeas.map((idea, i) => (
                                                    <NewIdeaCard key={i} idea={idea} index={i} t={t} theme={theme} />
                                                ))}
                                            </Stack>
                                        ) : (
                                            <Typography sx={{ color: t.textTertiary, fontSize: "0.82rem", textAlign: "center", py: 4 }}>
                                                No ideas generated yet.
                                            </Typography>
                                        )
                                    )}

                                    {/* Tab 2 — Improvements */}
                                    {activeTab === 2 && (
                                        result.improvements?.length > 0 ? (
                                            <Stack spacing={1.2}>
                                                {result.improvements.map((imp, i) => {
                                                    const impColor = imp.impact === "High" ? "#B86B6B" : imp.impact === "Medium" ? "#C49A6C" : "#5A8A72";
                                                    return (
                                                        <Stack key={i} direction="row" alignItems="flex-start" gap={1.5}
                                                            sx={{
                                                                p: 1.8, borderRadius: 3,
                                                                border: `1px solid ${impColor}20`,
                                                                bgcolor: `${impColor}06`,
                                                            }}>
                                                            <Box sx={{
                                                                width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                                                                bgcolor: `${impColor}15`, border: `1px solid ${impColor}22`,
                                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                            }}>
                                                                <ArrowForwardOutlinedIcon sx={{ fontSize: 16, color: impColor }} />
                                                            </Box>
                                                            <Box flex={1}>
                                                                <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                                                                    <Typography sx={{ fontSize: "0.84rem", fontWeight: 700, color: t.textPrimary }}>
                                                                        {imp.area}
                                                                    </Typography>
                                                                    <Chip label={`${imp.impact} Impact`} size="small" sx={{
                                                                        height: 18, fontSize: "0.6rem", fontWeight: 700,
                                                                        bgcolor: `${impColor}14`, color: impColor,
                                                                        border: `1px solid ${impColor}25`,
                                                                        "& .MuiChip-label": { px: 0.9 },
                                                                    }} />
                                                                </Stack>
                                                                <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, lineHeight: 1.7 }}>
                                                                    {imp.suggestion}
                                                                </Typography>
                                                            </Box>
                                                        </Stack>
                                                    );
                                                })}
                                            </Stack>
                                        ) : (
                                            <Typography sx={{ color: t.textTertiary, fontSize: "0.82rem", textAlign: "center", py: 4 }}>
                                                No improvement suggestions available.
                                            </Typography>
                                        )
                                    )}
                                </Box>
                            </Paper>

                            <Box sx={{ textAlign: "center", py: 2, borderTop: `1px solid ${t.borderLight}` }}>
                                <Button size="small" startIcon={<RefreshOutlinedIcon sx={{ fontSize: 15 }} />}
                                    onClick={handleReset}
                                    sx={{ color: t.textTertiary, fontSize: "0.76rem", "&:hover": { color: accent } }}>
                                    Generate again
                                </Button>
                            </Box>
                        </Stack>
                    )}
                </Box>
            </Box>

            {/* ── Bottom Bar (idle only) ── */}
            {!result && (
                <Box sx={{
                    px: { xs: 2, sm: 3 }, py: 2,
                    borderTop: `1px solid ${t.borderLight}`,
                    bgcolor: `${theme.palette.background.paper}E8`,
                    backdropFilter: "blur(16px)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    flexShrink: 0, gap: 2,
                }}>
                    <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>
                        Powered by Gemini AI · results may vary
                    </Typography>
                    <Stack direction="row" gap={1.5}>
                        <Button onClick={handleClose} disabled={loading}
                            sx={{ color: t.textSecondary, fontSize: "0.82rem", borderRadius: 2 }}>
                            Cancel
                        </Button>
                        <Button variant="contained" onClick={handleFetch}
                            disabled={loading || !hasProjectInfo}
                            startIcon={loading
                                ? <CircularProgress size={14} color="inherit" />
                                : <AutoAwesomeOutlinedIcon sx={{ fontSize: 16 }} />
                            }
                            sx={{
                                bgcolor: accent,
                                borderRadius: 2.5, fontWeight: 700, px: 3.5, fontSize: "0.84rem",
                                boxShadow: `0 4px 16px ${accent}35`,
                                "&:hover": { boxShadow: `0 6px 20px ${accent}45` },
                                "&.Mui-disabled": { bgcolor: `${accent}25`, color: `${accent}60` },
                            }}>
                            {loading ? "Analyzing…" : "Analyze & Suggest"}
                        </Button>
                    </Stack>
                </Box>
            )}
        </Dialog>
    );
}