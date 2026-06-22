// src/components/supervisor/Reports/Reports.jsx

import { useState, useEffect, useRef } from "react";
import {
    Box, Paper, Typography, Stack, Button, LinearProgress,
    CircularProgress, Alert, Tooltip, IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import SummarizeOutlinedIcon      from "@mui/icons-material/SummarizeOutlined";
import DownloadOutlinedIcon       from "@mui/icons-material/DownloadOutlined";
import RefreshOutlinedIcon        from "@mui/icons-material/RefreshOutlined";
import PeopleOutlinedIcon         from "@mui/icons-material/PeopleOutlined";
import FolderOutlinedIcon         from "@mui/icons-material/FolderOutlined";
import AccessTimeOutlinedIcon     from "@mui/icons-material/AccessTimeOutlined";
import GroupsOutlinedIcon         from "@mui/icons-material/GroupsOutlined";
import ArticleOutlinedIcon        from "@mui/icons-material/ArticleOutlined";

import { getSupervisorTeams }  from "../../../../api/handler/endpoints/supervisorApi";
import fileSystemApi           from "../../../../api/handler/endpoints/fileSystemApi";

// ─── helpers ──────────────────────────────────────────────────────────────────

const ACCENT = "#6D8A7D";
const REQUEST_DELAY_MS = 4000; // gap between sequential Gemini calls to avoid free-tier rate limits
const MAX_RETRIES = 3;

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

// ─── PDF export ────────────────────────────────────────────────────────────────

function exportReportToPDF(report) {
    const insightCard = (insight) => `
        <div class="insight-card">
          <div class="insight-header">
            <span class="insight-label">${insight.label}</span>
          </div>
          <p class="insight-text">${insight.text}</p>
        </div>`;

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>Report — ${report.team}</title>
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:'Segoe UI',Arial,sans-serif; color:#1a1a1a; background:#fff; padding:40px; font-size:13px; }
h1 { font-size:22px; font-weight:800; margin-bottom:2px; }
h2 { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:#888; margin:22px 0 10px; }
.header { border-bottom:2px solid #eee; padding-bottom:14px; margin-bottom:20px; }
.chips { display:flex; gap:8px; margin-top:8px; flex-wrap:wrap; }
.chip { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; background:#f5f5f5; color:#666; border:1px solid #ddd; }
.summary-box { background:#f9f9f9; border-left:3px solid #6D8A7D; padding:14px 16px; border-radius:4px; line-height:1.8; font-size:13.5px; }
.insights-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px; }
.insight-card { padding:12px 14px; border-radius:6px; background:#f9f9f9; border-left:3px solid #6D8A7D; }
.insight-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
.insight-label { font-weight:700; font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:#555; }
.insight-text { font-size:12px; color:#444; line-height:1.65; }
.footer { margin-top:32px; padding-top:12px; border-top:1px solid #eee; color:#aaa; font-size:11px; text-align:center; }
@media print { body { padding:20px; } }
</style></head><body>
<div class="header">
  <h1>${report.team}</h1>
  <div style="color:#666;font-size:13px;margin-top:3px">${report.project}</div>
  <div class="chips">
    <span class="chip">Generated: ${report.generatedAt ?? "–"}</span>
  </div>
</div>
<h2>Summary</h2>
<div class="summary-box">${report.summary}</div>
<h2>Details</h2>
<div class="insights-grid">
  ${(report.insights ?? []).map(insightCard).join("")}
</div>
<div class="footer">Graduation Project Management System</div>
<script>window.onload=()=>window.print();<\/script>
</body></html>`;

    const win = window.open("", "_blank", "width=900,height=700");
    if (win) { win.document.write(html); win.document.close(); }
}

// ─── InsightCard — AI-written, purely descriptive (no verdicts) ─────────────
// Each card shows a label and a factual sentence about that dimension.
// There is intentionally no status/badge here — the supervisor forms their
// own judgment; the AI only describes what the data shows.

function InsightCard({ insight, t }) {
    const ICONS = {
        "Team":  GroupsOutlinedIcon,
        "Files": FolderOutlinedIcon,
    };
    const Icon = ICONS[insight.label] ?? ArticleOutlinedIcon;

    return (
        <Box sx={{
            p: 1.8,
            borderRadius: 2,
            bgcolor: `${ACCENT}07`,
            border: `1px solid ${ACCENT}20`,
            borderLeft: `3px solid ${ACCENT}`,
            transition: "all 0.2s",
            "&:hover": { bgcolor: `${ACCENT}12`, borderColor: `${ACCENT}35` },
        }}>
            <Stack direction="row" alignItems="center" gap={0.7} mb={0.8}>
                <Icon sx={{ fontSize: 13, color: ACCENT, opacity: 0.85 }} />
                <Typography sx={{
                    fontSize: "0.63rem", fontWeight: 800, color: ACCENT,
                    textTransform: "uppercase", letterSpacing: "0.07em",
                }}>
                    {insight.label}
                </Typography>
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

// ─── ReportCard ───────────────────────────────────────────────────────────────

function ReportCard({ report, theme, t, onRefresh }) {
    const r = report;

    return (
        <Paper elevation={0} sx={{
            borderRadius: 3, overflow: "hidden",
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${t.borderLight}`,
            transition: "box-shadow 0.3s, transform 0.2s",
            "&:hover": { boxShadow: `0 8px 32px ${ACCENT}15`, transform: "translateY(-1px)" },
        }}>
            {/* accent strip */}
            <Box sx={{ height: 2, background: `linear-gradient(90deg, ${ACCENT} 0%, ${ACCENT}40 60%, transparent 100%)` }} />

            {/* ── HEADER ── */}
            <Box sx={{ px: 2.5, pt: 2.5, pb: 2, borderBottom: `1px solid ${t.borderLight}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1.5}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: t.textPrimary, letterSpacing: "-0.02em", mb: 0.5 }}>
                            {r.team}
                        </Typography>

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
                            <StatPill icon={FolderOutlinedIcon} label={`${r._raw?.totalFiles ?? 0} files`} color={t.accentSecondary ?? "#C49A6C"} />
                            <StatPill icon={PeopleOutlinedIcon} label={`${r._raw?.members ?? 0} members`} color={t.accentTertiary  ?? "#7D8A6D"} />
                        </Stack>
                    </Box>

                    {/* actions */}
                    <Stack direction="row" gap={0.8} alignItems="center" flexShrink={0}>
                        <Tooltip title="Refresh with latest data">
                            <IconButton size="small" onClick={onRefresh} sx={{
                                color: t.textSecondary, border: `1px solid ${t.borderLight}`,
                                borderRadius: 1.5, width: 30, height: 30,
                                "&:hover": { borderColor: ACCENT, color: ACCENT, bgcolor: `${ACCENT}08` },
                                transition: "all 0.2s",
                            }}>
                                <RefreshOutlinedIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        </Tooltip>

                        <Button size="small" startIcon={<DownloadOutlinedIcon sx={{ fontSize: 12 }} />}
                            onClick={() => exportReportToPDF(r)}
                            sx={{
                                height: 30, px: 1.5, borderRadius: 1.5,
                                border: `1px solid ${t.borderLight}`,
                                color: t.textSecondary, fontSize: "0.72rem", fontWeight: 600, textTransform: "none",
                                "&:hover": { borderColor: ACCENT, color: ACCENT, bgcolor: `${ACCENT}08` },
                                transition: "all 0.2s",
                            }}>
                            Export PDF
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            {/* ── AI INSIGHTS GRID (descriptive only, no verdicts) ── */}
            {r.insights?.length > 0 && (
                <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${t.borderLight}` }}>
                    <Stack direction="row" alignItems="center" gap={0.7} mb={1.5}>
                        <SummarizeOutlinedIcon sx={{ fontSize: 12, color: ACCENT }} />
                        <Typography sx={{
                            fontSize: "0.63rem", fontWeight: 800, color: t.textTertiary,
                            textTransform: "uppercase", letterSpacing: "0.08em",
                        }}>
                            AI Overview
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

            {/* ── SUMMARY ── */}
            <Box sx={{ px: 2.5, py: 2 }}>
                <Box sx={{
                    p: 2, borderRadius: 2,
                    bgcolor: `${ACCENT}06`, border: `1px solid ${ACCENT}15`,
                    borderLeft: `3px solid ${ACCENT}`,
                }}>
                    <Typography sx={{ fontSize: "0.875rem", color: t.textSecondary, lineHeight: 1.8 }}>
                        {r.summary}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard({ t, theme, teamName, projectTitle, statusText }) {
    return (
        <Paper elevation={0} sx={{
            borderRadius: 3, overflow: "hidden",
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${t.borderLight}`,
        }}>
            <Box sx={{ height: 2, bgcolor: `${ACCENT}25` }} />
            <Box sx={{ px: 2.5, py: 2.5 }}>
                <Stack direction="row" alignItems="center" gap={1.5} mb={0.8}>
                    <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: t.textPrimary }}>{teamName}</Typography>
                    <CircularProgress size={13} sx={{ color: ACCENT }} />
                </Stack>
                <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, mb: 0.6 }}>{projectTitle}</Typography>
                <Typography sx={{ fontSize: "0.7rem", color: t.textTertiary, mb: 2 }}>
                    {statusText ?? "Fetching files → generating summary…"}
                </Typography>
                <LinearProgress sx={{
                    borderRadius: 2, height: 3,
                    bgcolor: `${ACCENT}12`,
                    "& .MuiLinearProgress-bar": { bgcolor: ACCENT, borderRadius: 2 },
                }} />
            </Box>
        </Paper>
    );
}

// ─── Prompt + Gemini ──────────────────────────────────────────────────────────
// The AI's only job here is to DESCRIBE the team's current situation in plain,
// neutral language across two dimensions: Team and Files. It does NOT grade,
// score, or label the team — no "good/warning/critical", no risk levels, no
// recommendations. Evaluating the team is the supervisor's call, not the AI's.

function buildPrompt(team, files) {
    const totalFiles = files.length;
    const memberCount = team.members?.length ?? 0;
    const memberList  = team.members?.map(m => m.fullName).join(", ") || "unknown";
    const recentFiles = files.slice(0, 5).map(f => `"${f.fileName}"`).join(", ") || "none";

    const prompt = `You are an assistant that writes short, neutral, descriptive status notes for an academic graduation project supervisor.

TEAM: ${team.projectTitle}
DESCRIPTION: ${team.projectDescription?.slice(0, 250) ?? "(none)"}
STATUS: ${team.status}
MEMBERS (${memberCount}): ${memberList}
FILES (${totalFiles}): ${recentFiles}

Respond ONLY with a valid JSON object, no markdown, no backticks:
{
  "summary": "3-4 sentence neutral, factual description of the team's overall current situation, touching on team and files",
  "insights": [
    { "label": "Team", "text": "1-2 factual sentences describing team composition and activity based on real data" },
    { "label": "Files", "text": "1-2 factual sentences describing what files exist and what they suggest about documentation activity" }
  ]
}

IMPORTANT RULES:
- Do NOT grade, score, rate, or evaluate the team in any way.
- Do NOT use words like "good", "bad", "critical", "at risk", "high risk", "needs attention", "excellent", "poor", "behind", "ahead", or any other judgment language.
- Do NOT recommend actions or flag "issues" — just describe what the data shows.
- If files = 0, say so factually (e.g. "no files have been uploaded yet") without calling it a problem.
- If members = 1, mention it factually without calling it a problem.
- The supervisor will form their own judgment; your job is only to describe the facts.
- return ONLY valid JSON`;

    return { prompt, _raw: { totalFiles, members: memberCount } };
}

// Calls Gemini with automatic retry on rate-limit (429) errors, backing off
// each time. Other errors (expired/invalid key, bad request, etc.) are not
// retried since waiting won't fix them.
async function callGemini(promptText, attempt = 1) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log("🔑 KEY IN USE:", apiKey?.slice(0, 10) + "..." + apiKey?.slice(-4));
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }),
        }
    );

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message = err?.error?.message ?? `Gemini error ${res.status}`;

        if (res.status === 429 && attempt < MAX_RETRIES) {
            const backoff = REQUEST_DELAY_MS * attempt; // grows with each retry
            await sleep(backoff);
            return callGemini(promptText, attempt + 1);
        }

        throw new Error(message);
    }

    const data  = await res.json();
    const raw   = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const clean = raw.replace(/```json|```/gi, "").trim();
    return JSON.parse(clean);
}

async function generateReportForTeam(team) {
    const filesRes = await Promise.allSettled([
        fileSystemApi.getStudentFiles(),
    ]);

    const files = filesRes[0].status === "fulfilled" ? (filesRes[0].value ?? []) : [];

    const { prompt, _raw } = buildPrompt(team, files);
    const ai = await callGemini(prompt);

    const now = new Date();
    const generatedAt = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        + " · " + now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    const report = {
        teamId:   team.id,
        team:     team.projectTitle,
        project:  team.members?.map(m => m.fullName).join(", ") || "No members",
        summary:  ai.summary   ?? "No summary generated.",
        insights: ai.insights  ?? [],
        _raw,
        generatedAt,
    };

    return report;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Reports() {
    const theme = useTheme();
    const t     = theme.palette.custom;

    const [teams,        setTeams]        = useState([]);
    const [reports,      setReports]      = useState({});
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [teamsError,   setTeamsError]   = useState(null);
    const [refreshAll,   setRefreshAll]   = useState(false);
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

    // Teams are generated sequentially with a delay between each call.
    // Each team id is claimed synchronously (inside the forEach, before any
    // await) so that a second effect run — e.g. React StrictMode's
    // mount → unmount → remount in dev — can't slip in and kick off a
    // duplicate request for the same team before the first run has had a
    // chance to mark it as taken.
    useEffect(() => {
        if (!teams.length) return;
        const pending = [];

        teams.forEach(tm => {
            if (generatedRef.current.has(tm.id)) return;
            generatedRef.current.add(tm.id);
            pending.push(tm);
        });

        if (!pending.length) return;

        (async () => {
            for (let i = 0; i < pending.length; i++) {
                const team = pending[i];
                setReports(prev => ({ ...prev, [team.id]: "loading" }));
                try {
                    const report = await generateReportForTeam(team);
                    setReports(prev => ({ ...prev, [team.id]: report }));
                } catch (e) {
                    setReports(prev => ({ ...prev, [team.id]: e }));
                }
                if (i < pending.length - 1) await sleep(REQUEST_DELAY_MS);
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

    const handleRefreshAll = async () => {
        setRefreshAll(true);
        for (let i = 0; i < teams.length; i++) {
            const team = teams[i];
            generatedRef.current.delete(team.id);
            setReports(prev => ({ ...prev, [team.id]: "loading" }));
            try {
                const report = await generateReportForTeam(team);
                setReports(prev => ({ ...prev, [team.id]: report }));
            } catch (e) {
                setReports(prev => ({ ...prev, [team.id]: e }));
            }
            if (i < teams.length - 1) await sleep(REQUEST_DELAY_MS);
        }
        setRefreshAll(false);
    };

    const allDone   = teams.length > 0 && teams.every(tm => reports[tm.id] && reports[tm.id] !== "loading");
    const doneCount = teams.filter(tm => reports[tm.id] && reports[tm.id] !== "loading" && !(reports[tm.id] instanceof Error)).length;

    if (teamsLoading) return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 6, justifyContent: "center" }}>
            <CircularProgress size={20} sx={{ color: ACCENT }} />
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
                            bgcolor: `${ACCENT}15`, border: `1px solid ${ACCENT}25`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <SummarizeOutlinedIcon sx={{ color: ACCENT, fontSize: 17 }} />
                        </Box>
                        <Typography variant="h2" sx={{ color: t.textPrimary, fontWeight: 800, letterSpacing: "-0.02em" }}>
                            Reports
                        </Typography>
                    </Stack>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.85rem", ml: 0.5 }}>
                        {allDone
                            ? `Ready · ${doneCount}/${teams.length} reports`
                            : `Generating… ${doneCount}/${teams.length} done`}
                    </Typography>
                </Box>

                <Stack direction="row" alignItems="center" gap={1}>
                    {!allDone && (
                        <Stack direction="row" alignItems="center" gap={0.8}
                            sx={{ px: 1.5, py: 0.7, borderRadius: 2, bgcolor: `${ACCENT}08`, border: `1px solid ${ACCENT}18` }}>
                            <CircularProgress size={13} sx={{ color: ACCENT }} />
                            <Typography sx={{ fontSize: "0.75rem", color: ACCENT, fontWeight: 600 }}>Generating…</Typography>
                        </Stack>
                    )}
                    {allDone && (
                        <Button size="small"
                            startIcon={refreshAll ? <CircularProgress size={12} color="inherit" /> : <RefreshOutlinedIcon sx={{ fontSize: 13 }} />}
                            onClick={handleRefreshAll} disabled={refreshAll}
                            sx={{
                                height: 32, px: 1.5, borderRadius: 1.5,
                                border: `1px solid ${t.borderLight}`,
                                color: t.textSecondary, fontSize: "0.75rem", fontWeight: 600, textTransform: "none",
                                "&:hover": { borderColor: ACCENT, color: ACCENT, bgcolor: `${ACCENT}06` },
                                transition: "all 0.2s",
                            }}>
                            {refreshAll ? "Refreshing…" : "Refresh All"}
                        </Button>
                    )}
                </Stack>
            </Stack>

            {/* CARDS */}
            <Stack spacing={2.5}>
                {teams.map((team) => {
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
                                        border: `1px solid ${ACCENT}40`,
                                        color: ACCENT, fontSize: "0.72rem", fontWeight: 600, textTransform: "none",
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
            </Stack>

            {allDone && doneCount > 0 && (
                <Typography sx={{
                    fontSize: "0.68rem", color: t.textTertiary,
                    textAlign: "center", mt: 4, fontStyle: "italic",
                }}>
                    AI-generated summaries · Graduation Project Management System
                </Typography>
            )}
        </Box>
    );
}