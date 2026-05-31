// src/components/supervisor/AIReports/AIReports.jsx

import { useState, useEffect, useRef } from "react";
import {
    Box, Paper, Typography, Stack, Chip, Button, LinearProgress,
    CircularProgress, Alert, Tooltip, IconButton,
    ToggleButtonGroup, ToggleButton, Tab, Tabs,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import AutoAwesomeOutlinedIcon    from "@mui/icons-material/AutoAwesomeOutlined";
import WarningAmberOutlinedIcon   from "@mui/icons-material/WarningAmberOutlined";
import LightbulbOutlinedIcon      from "@mui/icons-material/LightbulbOutlined";
import DownloadOutlinedIcon       from "@mui/icons-material/DownloadOutlined";
import SendOutlinedIcon           from "@mui/icons-material/SendOutlined";
import RefreshOutlinedIcon        from "@mui/icons-material/RefreshOutlined";
import PeopleOutlinedIcon         from "@mui/icons-material/PeopleOutlined";
import FolderOutlinedIcon         from "@mui/icons-material/FolderOutlined";
import AccessTimeOutlinedIcon     from "@mui/icons-material/AccessTimeOutlined";
import FilterListOutlinedIcon     from "@mui/icons-material/FilterListOutlined";
import SummarizeOutlinedIcon      from "@mui/icons-material/SummarizeOutlined";
import GroupsOutlinedIcon         from "@mui/icons-material/GroupsOutlined";
import ArticleOutlinedIcon        from "@mui/icons-material/ArticleOutlined";
import AssignmentOutlinedIcon     from "@mui/icons-material/AssignmentOutlined";
import SpeedOutlinedIcon          from "@mui/icons-material/SpeedOutlined";

import { getSupervisorTeams }  from "../../../../api/handler/endpoints/supervisorApi";
import fileSystemApi           from "../../../../api/handler/endpoints/fileSystemApi";
import requirementApi          from "../../../../api/handler/endpoints/requirementApi";

// ─── helpers ──────────────────────────────────────────────────────────────────

const RISK_CLR   = { low: "#6D8A7D", medium: "#C49A6C", high: "#C47E7E" };
const RISK_LABEL = { low: "Low Risk", medium: "Medium Risk", high: "High Risk" };
// status → color + label used for AI insight badges
const STATUS_CLR   = { good: "#6D8A7D", warning: "#C49A6C", critical: "#C47E7E", na: "#8A8A8A" };
const STATUS_LABEL = { good: "Good", warning: "Needs Attention", critical: "Critical", na: "No Data" };

// ─── PDF export ────────────────────────────────────────────────────────────────

function exportReportToPDF(report) {
    const riskClr  = RISK_CLR[report.risk] ?? RISK_CLR.medium;
    const bulletList = (items, color) => items.length
        ? items.map(i => `<li>${i}</li>`).join("")
        : `<li style="color:${color};font-style:italic">None identified</li>`;

    const insightCard = (insight) => {
        const c = STATUS_CLR[insight.status] ?? STATUS_CLR.na;
        return `
        <div class="insight-card" style="border-left:3px solid ${c};background:${c}08">
          <div class="insight-header">
            <span class="insight-label">${insight.label}</span>
            <span class="insight-badge" style="color:${c};border-color:${c}40;background:${c}12">${STATUS_LABEL[insight.status] ?? "–"}</span>
          </div>
          <p class="insight-text">${insight.text}</p>
        </div>`;
    };

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>AI Report — ${report.team}</title>
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:'Segoe UI',Arial,sans-serif; color:#1a1a1a; background:#fff; padding:40px; font-size:13px; }
h1 { font-size:22px; font-weight:800; margin-bottom:2px; }
h2 { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:#888; margin:22px 0 10px; }
.header { border-bottom:2px solid #eee; padding-bottom:14px; margin-bottom:20px; }
.chips { display:flex; gap:8px; margin-top:8px; flex-wrap:wrap; }
.chip { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
.summary-box { background:#f9f9f9; border-left:3px solid #6D8A7D; padding:14px 16px; border-radius:4px; line-height:1.8; font-size:13.5px; }
.insights-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px; }
.insight-card { padding:12px 14px; border-radius:6px; }
.insight-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
.insight-label { font-weight:700; font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:#555; }
.insight-badge { font-size:10px; font-weight:700; padding:2px 8px; border-radius:10px; border:1px solid; }
.insight-text { font-size:12px; color:#444; line-height:1.65; }
.two-col { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
ul { padding-left:18px; line-height:2.2; color:#333; font-size:12.5px; }
.footer { margin-top:32px; padding-top:12px; border-top:1px solid #eee; color:#aaa; font-size:11px; text-align:center; }
@media print { body { padding:20px; } }
</style></head><body>
<div class="header">
  <h1>${report.team}</h1>
  <div style="color:#666;font-size:13px;margin-top:3px">${report.project}</div>
  <div class="chips">
    <span class="chip" style="background:${riskClr}18;color:${riskClr};border:1px solid ${riskClr}40">${report.risk} risk</span>
    <span class="chip" style="background:#f5f5f5;color:#666;border:1px solid #ddd">Generated: ${report.generatedAt ?? "–"}</span>
  </div>
</div>
<h2>AI Summary</h2>
<div class="summary-box">${report.summary}</div>
<h2>AI Insights</h2>
<div class="insights-grid">
  ${(report.insights ?? []).map(insightCard).join("")}
</div>
<div class="two-col">
  <div>
    <h2>⚠ Identified Issues</h2>
    <ul>${bulletList(report.issues ?? [], "#C47E7E")}</ul>
  </div>
  <div>
    <h2>💡 Recommendations</h2>
    <ul>${bulletList(report.recommendations ?? [], "#6D8A7D")}</ul>
  </div>
</div>
<div class="footer">AI-generated report · Powered by Gemini AI · Graduation Project Management System</div>
<script>window.onload=()=>window.print();<\/script>
</body></html>`;

    const win = window.open("", "_blank", "width=900,height=700");
    if (win) { win.document.write(html); win.document.close(); }
}

// ─── InsightCard — AI-written verdict per dimension ──────────────────────────
// Each card shows a label, a status badge (good/warning/critical/na), and
// a short AI-generated sentence about that specific dimension.

function InsightCard({ insight, t }) {
    const color = STATUS_CLR[insight.status] ?? STATUS_CLR.na;
    const label = STATUS_LABEL[insight.status] ?? "–";

    const ICONS = {
        "Team":         GroupsOutlinedIcon,
        "Files":        FolderOutlinedIcon,
        "Requirements": AssignmentOutlinedIcon,
        "Progress":     SpeedOutlinedIcon,
    };
    const Icon = ICONS[insight.label] ?? ArticleOutlinedIcon;

    return (
        <Box sx={{
            p: 1.8,
            borderRadius: 2,
            bgcolor: `${color}07`,
            border: `1px solid ${color}20`,
            borderLeft: `3px solid ${color}`,
            transition: "all 0.2s",
            "&:hover": { bgcolor: `${color}12`, borderColor: `${color}35` },
        }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
                <Stack direction="row" alignItems="center" gap={0.7}>
                    <Icon sx={{ fontSize: 13, color, opacity: 0.85 }} />
                    <Typography sx={{
                        fontSize: "0.63rem", fontWeight: 800, color,
                        textTransform: "uppercase", letterSpacing: "0.07em",
                    }}>
                        {insight.label}
                    </Typography>
                </Stack>
                <Box sx={{
                    px: 1, py: 0.2, borderRadius: 1,
                    bgcolor: `${color}15`, border: `1px solid ${color}30`,
                }}>
                    <Typography sx={{ fontSize: "0.58rem", fontWeight: 800, color, letterSpacing: "0.04em" }}>
                        {label}
                    </Typography>
                </Box>
            </Stack>
            <Typography sx={{ fontSize: "0.8rem", color: t.textSecondary, lineHeight: 1.65 }}>
                {insight.text}
            </Typography>
        </Box>
    );
}

// ─── StatPill ─────────────────────────────────────────────────────────────────

function StatPill({ icon: Icon, label, color }) {
    return (
        <Stack direction="row" alignItems="center" gap={0.6}
            sx={{
                px: 1.2, py: 0.5, borderRadius: 2,
                bgcolor: `${color}0D`, border: `1px solid ${color}20`,
                transition: "all 0.2s",
                "&:hover": { bgcolor: `${color}18`, borderColor: `${color}35` },
            }}>
            <Icon sx={{ fontSize: 11, color, opacity: 0.9 }} />
            <Typography sx={{ fontSize: "0.65rem", color, fontWeight: 700, letterSpacing: "0.02em" }}>{label}</Typography>
        </Stack>
    );
}

// ─── BulletList ───────────────────────────────────────────────────────────────

function BulletList({ items, color, emptyText }) {
    const t = useTheme().palette.custom;
    if (!items?.length) return (
        <Box sx={{
            p: 2, borderRadius: 2, bgcolor: `${color}08`, border: `1px solid ${color}18`,
            display: "flex", alignItems: "center", gap: 1,
        }}>
            <Box sx={{ width: 20, height: 20, borderRadius: "50%", bgcolor: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography sx={{ fontSize: "0.65rem", color }}>✓</Typography>
            </Box>
            <Typography sx={{ fontSize: "0.82rem", color, fontWeight: 600 }}>{emptyText}</Typography>
        </Box>
    );
    return (
        <Stack spacing={1}>
            {items.map((item, i) => (
                <Stack key={i} direction="row" gap={1.2} alignItems="flex-start"
                    sx={{
                        p: 1.2, borderRadius: 1.5,
                        bgcolor: `${color}06`, border: `1px solid ${color}12`,
                        transition: "all 0.2s",
                        "&:hover": { bgcolor: `${color}10`, borderColor: `${color}25` },
                    }}>
                    <Box sx={{
                        minWidth: 18, height: 18, borderRadius: "50%",
                        bgcolor: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", mt: 0.1,
                    }}>
                        <Typography sx={{ fontSize: "0.55rem", fontWeight: 800, color }}>{i + 1}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: "0.82rem", color: t.textPrimary, lineHeight: 1.65 }}>{item}</Typography>
                </Stack>
            ))}
        </Stack>
    );
}

// ─── RiskBadge ────────────────────────────────────────────────────────────────

function RiskBadge({ risk }) {
    const color = RISK_CLR[risk] ?? RISK_CLR.medium;
    const dots  = risk === "high" ? 3 : risk === "medium" ? 2 : 1;
    return (
        <Stack direction="row" alignItems="center" gap={0.5}
            sx={{ px: 1.2, py: 0.4, borderRadius: 1.5, bgcolor: `${color}12`, border: `1px solid ${color}30` }}>
            <Stack direction="row" gap={0.3}>
                {[...Array(3)].map((_, i) => (
                    <Box key={i} sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: i < dots ? color : `${color}25` }} />
                ))}
            </Stack>
            <Typography sx={{ fontSize: "0.63rem", color, fontWeight: 700, textTransform: "capitalize", letterSpacing: "0.04em" }}>
                {RISK_LABEL[risk]}
            </Typography>
        </Stack>
    );
}

// ─── ReportCard ───────────────────────────────────────────────────────────────

function ReportCard({ report, theme, t, onRefresh }) {
    const [tab, setTab] = useState(0);
    const r        = report;
    const riskClr  = RISK_CLR[r.risk] ?? RISK_CLR.medium;

    return (
        <Paper elevation={0} sx={{
            borderRadius: 3, overflow: "hidden",
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${t.borderLight}`,
            transition: "box-shadow 0.3s, transform 0.2s",
            "&:hover": { boxShadow: `0 8px 32px ${riskClr}15`, transform: "translateY(-1px)" },
        }}>
            {/* accent strip */}
            <Box sx={{ height: 2, background: `linear-gradient(90deg, ${riskClr} 0%, ${riskClr}40 60%, transparent 100%)` }} />

            {/* ── HEADER ── */}
            <Box sx={{ px: 2.5, pt: 2.5, pb: 2, borderBottom: `1px solid ${t.borderLight}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1.5}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" mb={0.5}>
                            <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: t.textPrimary, letterSpacing: "-0.02em" }}>
                                {r.team}
                            </Typography>
                            <RiskBadge risk={r.risk} />
                        </Stack>

                        <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, mb: 1 }}>{r.project}</Typography>

                        {r.generatedAt && (
                            <Stack direction="row" alignItems="center" gap={0.5} mb={1.2}>
                                <AccessTimeOutlinedIcon sx={{ fontSize: 10, color: t.textTertiary }} />
                                <Typography sx={{ fontSize: "0.62rem", color: t.textTertiary }}>
                                    {r.generatedAt}
                                </Typography>
                            </Stack>
                        )}

                        <Stack direction="row" gap={0.7} flexWrap="wrap">
                            <StatPill icon={FolderOutlinedIcon}     label={`${r._raw?.totalFiles ?? 0} files`}    color={t.accentSecondary ?? "#C49A6C"} />
                            <StatPill icon={PeopleOutlinedIcon}     label={`${r._raw?.members ?? 0} members`}     color={t.accentTertiary  ?? "#7D8A6D"} />
                            <StatPill icon={AssignmentOutlinedIcon} label={`${r._raw?.requirements ?? 0} reqs`}   color={riskClr} />
                        </Stack>
                    </Box>

                    {/* actions */}
                    <Stack direction="row" gap={0.8} alignItems="center" flexShrink={0}>
                        <Tooltip title="Regenerate with latest data">
                            <IconButton size="small" onClick={onRefresh} sx={{
                                color: t.textSecondary, border: `1px solid ${t.borderLight}`,
                                borderRadius: 1.5, width: 30, height: 30,
                                "&:hover": { borderColor: riskClr, color: riskClr, bgcolor: `${riskClr}08` },
                                transition: "all 0.2s",
                            }}>
                                <RefreshOutlinedIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Send to Group — coming soon">
                            <span>
                                <Button size="small" disabled startIcon={<SendOutlinedIcon sx={{ fontSize: 12 }} />}
                                    sx={{
                                        height: 30, px: 1.5, borderRadius: 1.5,
                                        border: `1px solid ${t.borderLight}`,
                                        color: t.textTertiary, fontSize: "0.72rem", fontWeight: 600, textTransform: "none",
                                    }}>
                                    Send
                                </Button>
                            </span>
                        </Tooltip>

                        <Button size="small" startIcon={<DownloadOutlinedIcon sx={{ fontSize: 12 }} />}
                            onClick={() => exportReportToPDF(r)}
                            sx={{
                                height: 30, px: 1.5, borderRadius: 1.5,
                                border: `1px solid ${t.borderLight}`,
                                color: t.textSecondary, fontSize: "0.72rem", fontWeight: 600, textTransform: "none",
                                "&:hover": { borderColor: riskClr, color: riskClr, bgcolor: `${riskClr}08` },
                                transition: "all 0.2s",
                            }}>
                            Export PDF
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            {/* ── AI INSIGHTS GRID ── */}
            {r.insights?.length > 0 && (
                <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${t.borderLight}` }}>
                    <Stack direction="row" alignItems="center" gap={0.7} mb={1.5}>
                        <AutoAwesomeOutlinedIcon sx={{ fontSize: 12, color: t.accentPrimary ?? "#6D8A7D" }} />
                        <Typography sx={{
                            fontSize: "0.63rem", fontWeight: 800, color: t.textTertiary,
                            textTransform: "uppercase", letterSpacing: "0.08em",
                        }}>
                            AI Analysis
                        </Typography>
                    </Stack>
                    <Box sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 1.2,
                    }}>
                        {r.insights.map((ins, i) => (
                            <InsightCard key={i} insight={ins} t={t} />
                        ))}
                    </Box>
                </Box>
            )}

            {/* ── TABS ── */}
            <Box sx={{ borderBottom: `1px solid ${t.borderLight}`, px: 0.5 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
                    minHeight: 40,
                    "& .MuiTab-root": { minHeight: 40, fontSize: "0.72rem", fontWeight: 700, textTransform: "none", color: t.textTertiary, py: 0, letterSpacing: "0.01em" },
                    "& .Mui-selected": { color: `${t.accentPrimary} !important` },
                    "& .MuiTabs-indicator": { bgcolor: t.accentPrimary, height: 2, borderRadius: 1 },
                }}>
                    <Tab icon={<SummarizeOutlinedIcon sx={{ fontSize: 13 }} />} iconPosition="start" label="Summary" />
                    <Tab icon={<WarningAmberOutlinedIcon sx={{ fontSize: 13 }} />} iconPosition="start"
                        label={`Issues${r.issues?.length ? ` (${r.issues.length})` : ""}`} />
                    <Tab icon={<LightbulbOutlinedIcon sx={{ fontSize: 13 }} />} iconPosition="start" label="Recommendations" />
                </Tabs>
            </Box>

            {/* ── TAB CONTENT ── */}
            <Box sx={{ px: 2.5, py: 2 }}>
                {tab === 0 && (
                    <Box sx={{
                        p: 2, borderRadius: 2,
                        bgcolor: `${riskClr}06`, border: `1px solid ${riskClr}15`,
                        borderLeft: `3px solid ${riskClr}`,
                    }}>
                        <Typography sx={{ fontSize: "0.875rem", color: t.textSecondary, lineHeight: 1.8 }}>
                            {r.summary}
                        </Typography>
                    </Box>
                )}
                {tab === 1 && (
                    <BulletList items={r.issues} color="#C47E7E" emptyText="No critical issues detected" />
                )}
                {tab === 2 && (
                    <BulletList items={r.recommendations} color={t.accentTertiary ?? "#6D8A7D"} emptyText="No recommendations at this time" />
                )}
            </Box>
        </Paper>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard({ t, theme, teamName, projectTitle }) {
    return (
        <Paper elevation={0} sx={{
            borderRadius: 3, overflow: "hidden",
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${t.borderLight}`,
        }}>
            <Box sx={{ height: 2, bgcolor: `${t.accentPrimary}25` }} />
            <Box sx={{ px: 2.5, py: 2.5 }}>
                <Stack direction="row" alignItems="center" gap={1.5} mb={0.8}>
                    <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: t.textPrimary }}>{teamName}</Typography>
                    <CircularProgress size={13} sx={{ color: t.accentPrimary }} />
                </Stack>
                <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, mb: 0.6 }}>{projectTitle}</Typography>
                <Typography sx={{ fontSize: "0.7rem", color: t.textTertiary, mb: 2 }}>
                    Fetching files & requirements → generating AI analysis…
                </Typography>
                <LinearProgress sx={{
                    borderRadius: 2, height: 3,
                    bgcolor: `${t.accentPrimary}12`,
                    "& .MuiLinearProgress-bar": { bgcolor: t.accentPrimary, borderRadius: 2 },
                }} />
            </Box>
        </Paper>
    );
}

// ─── Prompt + Gemini ──────────────────────────────────────────────────────────

function buildPrompt(team, files, requirements) {
    const totalFiles = files.length;
    const totalReqs  = requirements.length;
    const doneReqs   = requirements.filter(r => r.status === "Done" || r.status === "Completed").length;
    const pendingHighPrio = requirements.filter(
        r => (r.priority === "High" || r.priority === "Critical")
          && r.status !== "Done" && r.status !== "Completed"
    ).length;

    const memberCount = team.members?.length ?? 0;
    const memberList  = team.members?.map(m => m.fullName).join(", ") || "unknown";
    const recentFiles = files.slice(0, 5).map(f => `"${f.fileName}"`).join(", ") || "none";
    const reqSummary  = requirements.map(r => `[${r.priority ?? "?"}] ${r.title} — ${r.status ?? "pending"}`).join("; ") || "none";

    const prompt = `You are an expert academic graduation project supervisor assistant.
Analyze this team's data and produce a structured report.

TEAM: ${team.projectTitle}
DESCRIPTION: ${team.projectDescription?.slice(0, 250) ?? "(none)"}
STATUS: ${team.status}
MEMBERS (${memberCount}): ${memberList}
FILES (${totalFiles}): ${recentFiles}
REQUIREMENTS (total:${totalReqs}, done:${doneReqs}, high-priority pending:${pendingHighPrio}): ${reqSummary}

Respond ONLY with a valid JSON object, no markdown, no backticks:
{
  "summary": "3-4 sentence overall assessment of the team based on actual data",
  "risk": "low|medium|high",
  "insights": [
    {
      "label": "Team",
      "status": "good|warning|critical|na",
      "text": "1-2 sentences about team composition and activity based on real data"
    },
    {
      "label": "Files",
      "status": "good|warning|critical|na",
      "text": "1-2 sentences about file uploads and documentation based on real data"
    },
    {
      "label": "Requirements",
      "status": "good|warning|critical|na",
      "text": "1-2 sentences about requirements definition and completion — if none exist, say so explicitly"
    },
    {
      "label": "Progress",
      "status": "good|warning|critical|na",
      "text": "1-2 sentences about overall project progress and trajectory"
    }
  ],
  "issues": ["specific issue based on real data", "another issue"],
  "recommendations": ["actionable recommendation for supervisor", "another recommendation", "third recommendation"]
}
Rules:
- base EVERYTHING on the real data provided
- if requirements = 0, insights[2].status must be "critical" and say requirements are missing
- if files = 0, insights[1].status must be "critical"
- if members = 1, flag it in insights[0]
- return ONLY valid JSON`;

    return { prompt, _raw: { totalFiles, members: memberCount, requirements: totalReqs } };
}

async function callGemini(promptText) {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }),
        }
    );
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? `Gemini error ${res.status}`);
    }
    const data  = await res.json();
    const raw   = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const clean = raw.replace(/```json|```/gi, "").trim();
    return JSON.parse(clean);
}

async function generateReportForTeam(team) {
    const [filesRes, reqsRes] = await Promise.allSettled([
        fileSystemApi.getStudentFiles(),
        requirementApi.getAll(),
    ]);

    const files = filesRes.status === "fulfilled" ? (filesRes.value ?? []) : [];
    const reqs  = reqsRes.status  === "fulfilled" ? (reqsRes.value  ?? []) : [];

    const { prompt, _raw } = buildPrompt(team, files, reqs);
    const ai = await callGemini(prompt);

    const now = new Date();
    const generatedAt = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        + " · " + now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    return {
        teamId:          team.id,
        team:            team.projectTitle,
        project:         team.members?.map(m => m.fullName).join(", ") || "No members",
        summary:         ai.summary          ?? "No summary generated.",
        risk:            ai.risk             ?? "medium",
        insights:        ai.insights         ?? [],
        issues:          ai.issues           ?? [],
        recommendations: ai.recommendations  ?? [],
        _raw,
        generatedAt,
    };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AIReports() {
    const theme = useTheme();
    const t     = theme.palette.custom;

    const [teams,        setTeams]        = useState([]);
    const [reports,      setReports]      = useState({});
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [teamsError,   setTeamsError]   = useState(null);
    const [riskFilter,   setRiskFilter]   = useState("all");
    const [regenAll,     setRegenAll]     = useState(false);
    const generatedRef = useRef(new Set());

    useEffect(() => {
        (async () => {
            try {
                const data = await getSupervisorTeams();
                setTeams(Array.isArray(data) ? data : []);
            } catch (e) {
                setTeamsError(e?.message ?? "Failed to load teams.");
            } finally {
                setTeamsLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!teams.length) return;
        const pending = teams.filter(tm => !generatedRef.current.has(tm.id));
        if (!pending.length) return;
        (async () => {
            for (const team of pending) {
                generatedRef.current.add(team.id);
                setReports(prev => ({ ...prev, [team.id]: "loading" }));
                try {
                    const report = await generateReportForTeam(team);
                    setReports(prev => ({ ...prev, [team.id]: report }));
                } catch (e) {
                    setReports(prev => ({ ...prev, [team.id]: e }));
                }
            }
        })();
    }, [teams]);

    const handleRefresh = (team) => {
        generatedRef.current.delete(team.id);
        setReports(prev => ({ ...prev, [team.id]: "loading" }));
        generateReportForTeam(team)
            .then(r  => setReports(prev => ({ ...prev, [team.id]: r })))
            .catch(e => setReports(prev => ({ ...prev, [team.id]: e })));
    };

    const handleRegenAll = async () => {
        setRegenAll(true);
        for (const team of teams) {
            generatedRef.current.delete(team.id);
            setReports(prev => ({ ...prev, [team.id]: "loading" }));
            try {
                const report = await generateReportForTeam(team);
                setReports(prev => ({ ...prev, [team.id]: report }));
            } catch (e) {
                setReports(prev => ({ ...prev, [team.id]: e }));
            }
        }
        setRegenAll(false);
    };

    const allDone   = teams.length > 0 && teams.every(tm => reports[tm.id] && reports[tm.id] !== "loading");
    const doneCount = teams.filter(tm => reports[tm.id] && reports[tm.id] !== "loading" && !(reports[tm.id] instanceof Error)).length;

    const riskCounts = ["low", "medium", "high"].reduce((acc, r) => {
        acc[r] = teams.filter(tm => {
            const rep = reports[tm.id];
            return rep && rep !== "loading" && !(rep instanceof Error) && rep.risk === r;
        }).length;
        return acc;
    }, {});

    const visibleTeams = riskFilter === "all"
        ? teams
        : teams.filter(tm => {
            const r = reports[tm.id];
            return r && r !== "loading" && !(r instanceof Error) && r.risk === riskFilter;
          });

    if (teamsLoading) return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 6, justifyContent: "center" }}>
            <CircularProgress size={20} sx={{ color: t.accentPrimary }} />
            <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>Loading your teams…</Typography>
        </Box>
    );

    if (teamsError) return (
        <Alert severity="error" sx={{ maxWidth: 600, mt: 3, borderRadius: 2 }}>{teamsError}</Alert>
    );

    if (!teams.length) return (
        <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography sx={{ color: t.textSecondary }}>No teams found.</Typography>
        </Box>
    );

    return (
        <Box sx={{ maxWidth: 1000 }}>

            {/* PAGE HEADER */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={1.5}>
                <Box>
                    <Stack direction="row" alignItems="center" gap={1} mb={0.4}>
                        <Box sx={{
                            width: 32, height: 32, borderRadius: 2,
                            bgcolor: `${t.accentPrimary}15`, border: `1px solid ${t.accentPrimary}25`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <AutoAwesomeOutlinedIcon sx={{ color: t.accentPrimary, fontSize: 17 }} />
                        </Box>
                        <Typography variant="h2" sx={{ color: t.textPrimary, fontWeight: 800, letterSpacing: "-0.02em" }}>
                            AI Reports
                        </Typography>
                    </Stack>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.85rem", ml: 0.5 }}>
                        {allDone
                            ? `Analysis ready · ${doneCount}/${teams.length} reports`
                            : `Generating… ${doneCount}/${teams.length} done`}
                    </Typography>
                </Box>

                <Stack direction="row" alignItems="center" gap={1}>
                    {!allDone && (
                        <Stack direction="row" alignItems="center" gap={0.8}
                            sx={{ px: 1.5, py: 0.7, borderRadius: 2, bgcolor: `${t.accentPrimary}08`, border: `1px solid ${t.accentPrimary}18` }}>
                            <CircularProgress size={13} sx={{ color: t.accentPrimary }} />
                            <Typography sx={{ fontSize: "0.75rem", color: t.accentPrimary, fontWeight: 600 }}>Analyzing…</Typography>
                        </Stack>
                    )}
                    {allDone && (
                        <Button size="small"
                            startIcon={regenAll ? <CircularProgress size={12} color="inherit" /> : <RefreshOutlinedIcon sx={{ fontSize: 13 }} />}
                            onClick={handleRegenAll} disabled={regenAll}
                            sx={{
                                height: 32, px: 1.5, borderRadius: 1.5,
                                border: `1px solid ${t.borderLight}`,
                                color: t.textSecondary, fontSize: "0.75rem", fontWeight: 600, textTransform: "none",
                                "&:hover": { borderColor: t.accentPrimary, color: t.accentPrimary, bgcolor: `${t.accentPrimary}06` },
                                transition: "all 0.2s",
                            }}>
                            {regenAll ? "Regenerating…" : "Regenerate All"}
                        </Button>
                    )}
                </Stack>
            </Stack>

            {/* RISK FILTER */}
            {allDone && (
                <Stack direction="row" alignItems="center" gap={1.5} mb={3} flexWrap="wrap">
                    <Stack direction="row" alignItems="center" gap={0.5}>
                        <FilterListOutlinedIcon sx={{ fontSize: 13, color: t.textTertiary }} />
                        <Typography sx={{ fontSize: "0.68rem", color: t.textTertiary, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                            Filter
                        </Typography>
                    </Stack>
                    <ToggleButtonGroup value={riskFilter} exclusive onChange={(_, v) => v && setRiskFilter(v)} size="small"
                        sx={{
                            gap: 0.5,
                            "& .MuiToggleButtonGroup-grouped": { borderRadius: "8px !important", border: `1px solid ${t.borderLight} !important` },
                            "& .MuiToggleButton-root": {
                                color: t.textSecondary, fontSize: "0.7rem", fontWeight: 700,
                                px: 1.3, py: 0.4, textTransform: "none", lineHeight: 1.6,
                                "&.Mui-selected": { bgcolor: `${t.accentPrimary}10`, borderColor: `${t.accentPrimary}40 !important`, color: t.accentPrimary },
                            },
                        }}>
                        <ToggleButton value="all">All ({teams.length})</ToggleButton>
                        {["low", "medium", "high"].map(r => (
                            <ToggleButton key={r} value={r} disabled={riskCounts[r] === 0}
                                sx={{
                                    color: `${RISK_CLR[r]} !important`,
                                    "&.Mui-selected": {
                                        color: `${RISK_CLR[r]} !important`,
                                        borderColor: `${RISK_CLR[r]}50 !important`,
                                        bgcolor: `${RISK_CLR[r]}10 !important`,
                                    },
                                }}>
                                {r.charAt(0).toUpperCase() + r.slice(1)} ({riskCounts[r]})
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Stack>
            )}

            {/* CARDS */}
            <Stack spacing={2.5}>
                {visibleTeams.map((team) => {
                    const entry = reports[team.id];

                    if (!entry || entry === "loading") return (
                        <SkeletonCard key={team.id} t={t} theme={theme}
                            teamName={team.projectTitle}
                            projectTitle={team.members?.map(m => m.fullName).join(", ") ?? ""} />
                    );

                    if (entry instanceof Error) return (
                        <Paper key={team.id} elevation={0} sx={{
                            borderRadius: 3, p: 3,
                            bgcolor: theme.palette.background.paper,
                            border: `1px solid ${t.borderLight}`,
                        }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography sx={{ fontWeight: 700, color: t.textPrimary, mb: 0.8 }}>{team.projectTitle}</Typography>
                                    <Alert severity="error" sx={{ borderRadius: 1.5, fontSize: "0.8rem" }}>{entry.message}</Alert>
                                </Box>
                                <Button size="small" startIcon={<RefreshOutlinedIcon sx={{ fontSize: 13 }} />}
                                    onClick={() => handleRefresh(team)}
                                    sx={{
                                        ml: 2, height: 30, px: 1.5, borderRadius: 1.5,
                                        border: `1px solid ${t.accentPrimary}40`,
                                        color: t.accentPrimary, fontSize: "0.72rem", fontWeight: 600, textTransform: "none",
                                    }}>
                                    Retry
                                </Button>
                            </Stack>
                        </Paper>
                    );

                    return (
                        <ReportCard key={team.id} report={entry} theme={theme} t={t}
                            onRefresh={() => handleRefresh(team)} />
                    );
                })}

                {allDone && riskFilter !== "all" && visibleTeams.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 6 }}>
                        <Typography sx={{ color: t.textSecondary, fontSize: "0.88rem" }}>
                            No {riskFilter}-risk teams found.
                        </Typography>
                    </Box>
                )}
            </Stack>

            {allDone && doneCount > 0 && (
                <Typography sx={{
                    fontSize: "0.68rem", color: t.textTertiary,
                    textAlign: "center", mt: 4, fontStyle: "italic",
                }}>
                    AI-powered analysis · Powered by Gemini · Graduation Project Management System
                </Typography>
            )}
        </Box>
    );
}