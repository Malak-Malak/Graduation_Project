// src/components/supervisor/Reports/Reports.jsx

import { useState, useEffect, useRef } from "react";
import {
    Box, Paper, Typography, Stack, Button, LinearProgress,
    CircularProgress, Alert, Tooltip, IconButton, Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import SummarizeOutlinedIcon  from "@mui/icons-material/SummarizeOutlined";
import DownloadOutlinedIcon   from "@mui/icons-material/DownloadOutlined";
import RefreshOutlinedIcon    from "@mui/icons-material/RefreshOutlined";
import PeopleOutlinedIcon     from "@mui/icons-material/PeopleOutlined";
import FolderOutlinedIcon     from "@mui/icons-material/FolderOutlined";
import GroupsOutlinedIcon     from "@mui/icons-material/GroupsOutlined";
import ArticleOutlinedIcon    from "@mui/icons-material/ArticleOutlined";
import TaskAltOutlinedIcon    from "@mui/icons-material/TaskAltOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon     from "@mui/icons-material/HourglassEmpty";
import PendingOutlinedIcon    from "@mui/icons-material/PendingOutlined";

import { getTeamsOverview } from "../../../../api/handler/endpoints/supervisorApi";

// ─── constants ────────────────────────────────────────────────────────────────

const ACCENT = "#6D8A7D";
const REQUEST_DELAY_MS = 4000;
const MAX_RETRIES = 3;

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

// ─── PDF export ───────────────────────────────────────────────────────────────

function exportReportToPDF(report) {
    const insightCard = (ins) => `
        <div class="insight-card">
          <div class="insight-label">${ins.label}</div>
          <p class="insight-text">${ins.text}</p>
        </div>`;

    const taskRow = (t) => `
        <tr>
          <td>${t.title ?? "—"}</td>
          <td><span class="badge badge-${(t.status ?? "").toLowerCase().replace(/\s+/g, "-")}">${t.status ?? "—"}</span></td>
          <td>${t.assignedTo ?? "—"}</td>
        </tr>`;

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
.insight-label { font-weight:700; font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:#555; margin-bottom:6px; }
.insight-text { font-size:12px; color:#444; line-height:1.65; }
table { width:100%; border-collapse:collapse; font-size:12px; }
th { text-align:left; padding:7px 10px; font-size:10px; text-transform:uppercase; letter-spacing:.06em; color:#888; border-bottom:2px solid #eee; }
td { padding:7px 10px; border-bottom:1px solid #f0f0f0; }
.badge { padding:2px 8px; border-radius:20px; font-size:10px; font-weight:700; }
.badge-completed,.badge-done { background:#e8f5e9; color:#2e7d32; }
.badge-in-progress { background:#fff8e1; color:#f57f17; }
.badge-pending,.badge-to-do { background:#fce4ec; color:#c62828; }
.footer { margin-top:32px; padding-top:12px; border-top:1px solid #eee; color:#aaa; font-size:11px; text-align:center; }
</style></head><body>
<div class="header">
  <h1>${report.team}</h1>
  <div style="color:#666;font-size:13px;margin-top:3px">${report.project}</div>
  <div class="chips">
    <span class="chip">Generated: ${report.generatedAt ?? "–"}</span>
    <span class="chip">${report._raw?.totalFiles ?? 0} files</span>
    <span class="chip">${report._raw?.totalTasks ?? 0} tasks</span>
    <span class="chip">${report._raw?.completedTasks ?? 0} completed</span>
    <span class="chip">${report._raw?.members ?? 0} members</span>
  </div>
</div>
<h2>AI Summary</h2>
<div class="summary-box">${report.summary}</div>
<h2>AI Insights</h2>
<div class="insights-grid">${(report.insights ?? []).map(insightCard).join("")}</div>
${report._raw?.tasks?.length > 0 ? `
<h2>Tasks</h2>
<table><thead><tr><th>Title</th><th>Status</th><th>Assigned To</th></tr></thead>
<tbody>${report._raw.tasks.map(taskRow).join("")}</tbody></table>` : ""}
<div class="footer">Graduation Project Management System</div>
<script>window.onload=()=>window.print();<\/script>
</body></html>`;

    const win = window.open("", "_blank", "width=900,height=700");
    if (win) { win.document.write(html); win.document.close(); }
}

// ─── normalise teams-overview response ────────────────────────────────────────
//
// The merged response from getTeamsOverview() now contains:
//   - tasksPhase1 / tasksPhase2  (from /teams-overview)
//   - supervisorFiles / studentFiles (from /teams-overview)
//   - members / projectTitle / projectDescription (from /my-teams, injected by the API helper)
//
// We flatten everything here so the rest of the component works with a single,
// consistent TeamData object.

function normaliseTeamOverview(raw) {
    const teamId   = raw.teamId ?? raw.id ?? null;
    const teamName = raw.projectTitle ?? raw.teamName ?? raw.name ?? "—";
    const status   = raw.status ?? raw.teamStatus ?? "Active";

    // ── Members ──────────────────────────────────────────────────────────────
    // Injected from /my-teams by getTeamsOverview
    const members = raw.members ?? raw.teamMembers ?? [];
    const memberNames = members.map(m =>
        m.fullName ?? m.name ?? m.studentName ?? m.username ?? "Unknown"
    );

    // ── Tasks ─────────────────────────────────────────────────────────────────
    // /teams-overview returns tasksPhase1 + tasksPhase2 as separate arrays.
    // Fall back to a flat tasks array in case the backend shape changes.
    const phase1    = Array.isArray(raw.tasksPhase1) ? raw.tasksPhase1 : [];
    const phase2    = Array.isArray(raw.tasksPhase2) ? raw.tasksPhase2 : [];
    const flatTasks = Array.isArray(raw.tasks)       ? raw.tasks       :
                      Array.isArray(raw.taskList)    ? raw.taskList    : [];
    const allTasks  = [...phase1, ...phase2, ...flatTasks];

    // ── Files ─────────────────────────────────────────────────────────────────
    // /teams-overview returns supervisorFiles + studentFiles separately.
    const supervisorFiles = Array.isArray(raw.supervisorFiles) ? raw.supervisorFiles : [];
    const studentFiles    = Array.isArray(raw.studentFiles)    ? raw.studentFiles    : [];
    const flatFiles       = Array.isArray(raw.files)           ? raw.files           :
                            Array.isArray(raw.uploadedFiles)   ? raw.uploadedFiles   :
                            Array.isArray(raw.documents)       ? raw.documents       : [];
    const allFiles = [...supervisorFiles, ...studentFiles, ...flatFiles];

    // ── Task counters ─────────────────────────────────────────────────────────
    const totalTasks = allTasks.length;

    const completedTasks = allTasks.filter(t => {
        const s = (t.status ?? t.taskStatus ?? "").toLowerCase();
        return s === "completed" || s === "done" || s === "finished";
    }).length;

    const inProgressTasks = allTasks.filter(t => {
        const s = (t.status ?? t.taskStatus ?? "").toLowerCase();
        return s === "in progress" || s === "inprogress" || s === "in-progress" || s === "active";
    }).length;

    const pendingTasks = totalTasks - completedTasks - inProgressTasks;

    // ── Normalised files ──────────────────────────────────────────────────────
    const normalisedFiles = allFiles.map(f => ({
        fileName:   f.fileName ?? f.name ?? f.title ?? f.filePath?.split("/").pop() ?? "file",
        fileType:   f.fileType ?? f.type ?? null,
        uploadedAt: f.uploadedAt ?? f.createdAt ?? null,
        uploadedBy: f.uploadedByName ?? f.uploadedBy ?? f.studentName ?? null,
    }));

    // ── Normalised tasks ──────────────────────────────────────────────────────
    // assignedMembers is an array on each task in the /teams-overview shape.
    const normalisedTasks = allTasks.map(t => ({
        title:      t.title      ?? t.taskTitle ?? t.name ?? "Task",
        status:     t.status     ?? t.taskStatus ?? "Pending",
        assignedTo: Array.isArray(t.assignedMembers) && t.assignedMembers.length > 0
            ? t.assignedMembers.map(m => m.fullName ?? m.username ?? "Unknown").join(", ")
            : (t.assignedTo ?? t.studentName ?? t.memberName ?? "—"),
        dueDate:    t.deadline   ?? t.dueDate ?? null,
    }));

    return {
        teamId,
        teamName,
        status,
        memberNames,
        projectDescription: raw.projectDescription ?? "",
        totalFiles:         allFiles.length,
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        files:  normalisedFiles,
        tasks:  normalisedTasks,
    };
}

// ─── AI prompt ────────────────────────────────────────────────────────────────

function buildPrompt(teamData) {
    const {
        teamName, status, memberNames, projectDescription,
        totalFiles, totalTasks, completedTasks, inProgressTasks, pendingTasks,
        files, tasks,
    } = teamData;

    const memberList     = memberNames.join(", ")                                  || "unknown";
    const fileList       = files.slice(0, 6).map(f => `"${f.fileName}"`).join(", ") || "none";
    const taskSample     = tasks.slice(0, 8).map(t => `"${t.title}" [${t.status}]`).join(", ") || "none";
    const completionPct  = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const descSnippet    = projectDescription
        ? `PROJECT DESCRIPTION: ${projectDescription.slice(0, 300)}\n`
        : "";

    return `You are an academic supervisor assistant evaluating a graduation project team.

TEAM: ${teamName}
STATUS: ${status}
MEMBERS (${memberNames.length}): ${memberList}
${descSnippet}
FILES: ${totalFiles} total
Recent files: ${fileList}

TASKS: ${totalTasks} total — ${completedTasks} completed (${completionPct}%), ${inProgressTasks} in-progress, ${pendingTasks} pending
Sample tasks: ${taskSample}

Respond ONLY with valid JSON, no markdown, no backticks:
{
  "summary": "3–4 sentences describing the team's overall progress based on tasks and files data. Mention completion rate, activity level, and documentation status factually.",
  "insights": [
    { "label": "Team",  "text": "1–2 sentences about the team composition and member count." },
    { "label": "Tasks", "text": "1–2 sentences about task progress: how many done, in-progress, pending, and what this shows about their pace." },
    { "label": "Files", "text": "1–2 sentences about uploaded files and what they indicate about documentation activity." },
    { "label": "Overall", "text": "1–2 sentences giving a factual overall assessment of how on-track this team appears based on the data." }
  ]
}

RULES:
- Be factual and specific. Use the actual numbers provided.
- You MAY use professional judgment words (e.g. "the team appears to be on track", "progress is slow", "documentation is sparse") based on data.
- Do NOT invent data. If files = 0, say so. If tasks = 0, say so.
- Return ONLY valid JSON.`;
}

// ─── Gemini call with retry ───────────────────────────────────────────────────

async function callGemini(promptText, attempt = 1) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
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
            await sleep(REQUEST_DELAY_MS * attempt);
            return callGemini(promptText, attempt + 1);
        }
        throw new Error(message);
    }

    const data  = await res.json();
    const raw   = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const clean = raw.replace(/```json|```/gi, "").trim();
    return JSON.parse(clean);
}

// ─── Generate report for one team ────────────────────────────────────────────

async function generateReport(teamData) {
    const prompt = buildPrompt(teamData);
    const ai     = await callGemini(prompt);

    const now         = new Date();
    const generatedAt = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        + " · " + now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    return {
        teamId:   teamData.teamId,
        team:     teamData.teamName,
        project:  teamData.memberNames.join(", ") || "No members",
        summary:  ai.summary  ?? "No summary generated.",
        insights: ai.insights ?? [],
        _raw: {
            totalFiles:      teamData.totalFiles,
            totalTasks:      teamData.totalTasks,
            completedTasks:  teamData.completedTasks,
            inProgressTasks: teamData.inProgressTasks,
            pendingTasks:    teamData.pendingTasks,
            members:         teamData.memberNames.length,
            tasks:           teamData.tasks,
        },
        generatedAt,
    };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TaskProgressBar({ completed, inProgress, pending, total, accent }) {
    if (total === 0) return null;
    const pctDone   = (completed  / total) * 100;
    const pctActive = (inProgress / total) * 100;

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography sx={{ fontSize: "0.62rem", color: accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Task Progress
                </Typography>
                <Typography sx={{ fontSize: "0.62rem", color: accent, fontWeight: 700 }}>
                    {Math.round(pctDone)}%
                </Typography>
            </Stack>
            <Box sx={{ display: "flex", height: 5, borderRadius: 3, overflow: "hidden", bgcolor: `${accent}12` }}>
                <Box sx={{ width: `${pctDone}%`,   bgcolor: "#3a9e6f", transition: "width 0.6s ease" }} />
                <Box sx={{ width: `${pctActive}%`, bgcolor: "#c87941", transition: "width 0.6s ease" }} />
            </Box>
            <Stack direction="row" gap={1.5} mt={0.8} flexWrap="wrap">
                <Stack direction="row" alignItems="center" gap={0.4}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 11, color: "#3a9e6f" }} />
                    <Typography sx={{ fontSize: "0.62rem", color: "#3a9e6f", fontWeight: 600 }}>{completed} done</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap={0.4}>
                    <HourglassEmptyIcon sx={{ fontSize: 11, color: "#c87941" }} />
                    <Typography sx={{ fontSize: "0.62rem", color: "#c87941", fontWeight: 600 }}>{inProgress} in progress</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap={0.4}>
                    <PendingOutlinedIcon sx={{ fontSize: 11, color: "#888" }} />
                    <Typography sx={{ fontSize: "0.62rem", color: "#888", fontWeight: 600 }}>{pending} pending</Typography>
                </Stack>
            </Stack>
        </Box>
    );
}

function InsightCard({ insight, t }) {
    const ICONS = {
        "Team":    GroupsOutlinedIcon,
        "Files":   FolderOutlinedIcon,
        "Tasks":   TaskAltOutlinedIcon,
        "Overall": AssignmentOutlinedIcon,
    };
    const Icon = ICONS[insight.label] ?? ArticleOutlinedIcon;

    return (
        <Box sx={{
            p: 1.8, borderRadius: 2,
            bgcolor: `${ACCENT}07`, border: `1px solid ${ACCENT}20`,
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

function StatPill({ icon: Icon, label, color }) {
    return (
        <Stack direction="row" alignItems="center" gap={0.6} sx={{
            px: 1.2, py: 0.5, borderRadius: 2,
            bgcolor: `${color}0D`, border: `1px solid ${color}20`,
        }}>
            <Icon sx={{ fontSize: 11, color, opacity: 0.9 }} />
            <Typography sx={{ fontSize: "0.65rem", color, fontWeight: 700 }}>{label}</Typography>
        </Stack>
    );
}

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
            <Box sx={{ height: 2, background: `linear-gradient(90deg, ${ACCENT} 0%, ${ACCENT}40 60%, transparent 100%)` }} />

            {/* header */}
            <Box sx={{ px: 2.5, pt: 2.5, pb: 2, borderBottom: `1px solid ${t.borderLight}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1.5}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: t.textPrimary, letterSpacing: "-0.02em", mb: 0.3 }}>
                            {r.team}
                        </Typography>
                        <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, mb: 1.2 }}>
                            {r.project}
                        </Typography>

                        {/* stat pills */}
                        <Stack direction="row" gap={0.7} flexWrap="wrap" mb={1.5}>
                            <StatPill icon={FolderOutlinedIcon}     label={`${r._raw?.totalFiles ?? 0} files`}         color="#C49A6C" />
                            <StatPill icon={PeopleOutlinedIcon}     label={`${r._raw?.members ?? 0} members`}          color="#7D8A6D" />
                            <StatPill icon={TaskAltOutlinedIcon}    label={`${r._raw?.totalTasks ?? 0} tasks`}         color={ACCENT}  />
                            <StatPill icon={CheckCircleOutlineIcon} label={`${r._raw?.completedTasks ?? 0} completed`} color="#3a9e6f" />
                        </Stack>

                        {/* task progress bar */}
                        <TaskProgressBar
                            completed={r._raw?.completedTasks   ?? 0}
                            inProgress={r._raw?.inProgressTasks ?? 0}
                            pending={r._raw?.pendingTasks        ?? 0}
                            total={r._raw?.totalTasks            ?? 0}
                            accent={ACCENT}
                        />
                    </Box>

                    {/* actions */}
                    <Stack direction="row" gap={0.8} alignItems="flex-start" flexShrink={0}>
                        <Tooltip title="Refresh with latest data">
                            <IconButton size="small" onClick={onRefresh} sx={{
                                color: t.textSecondary, border: `1px solid ${t.borderLight}`,
                                borderRadius: 1.5, width: 30, height: 30,
                                "&:hover": { borderColor: ACCENT, color: ACCENT, bgcolor: `${ACCENT}08` },
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
                            }}>
                            Export PDF
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            {/* AI insights grid */}
            {r.insights?.length > 0 && (
                <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${t.borderLight}` }}>
                    <Stack direction="row" alignItems="center" gap={0.7} mb={1.5}>
                        <SummarizeOutlinedIcon sx={{ fontSize: 12, color: ACCENT }} />
                        <Typography sx={{
                            fontSize: "0.63rem", fontWeight: 800, color: t.textTertiary,
                            textTransform: "uppercase", letterSpacing: "0.08em",
                        }}>
                            AI Assessment
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

            {/* summary */}
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

function SkeletonCard({ t, theme, teamName, projectTitle }) {
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
                    Fetching tasks & files → generating assessment…
                </Typography>
                <LinearProgress sx={{
                    borderRadius: 2, height: 3, bgcolor: `${ACCENT}12`,
                    "& .MuiLinearProgress-bar": { bgcolor: ACCENT, borderRadius: 2 },
                }} />
            </Box>
        </Paper>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Reports() {
    const theme = useTheme();
    const t     = theme.palette.custom;

    const [teamsData,    setTeamsData]    = useState([]);
    const [reports,      setReports]      = useState({});
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [teamsError,   setTeamsError]   = useState(null);
    const [refreshAll,   setRefreshAll]   = useState(false);
    const generatedRef = useRef(new Set());

    // Fetch teams overview (merged tasks + files + members)
    useEffect(() => {
        (async () => {
            try {
                const data = await getTeamsOverview();
                const arr  = Array.isArray(data) ? data : [];
                setTeamsData(arr.map(normaliseTeamOverview));
            } catch (e) {
                setTeamsError(e?.message ?? "Failed to load teams overview.");
            } finally {
                setTeamsLoading(false);
            }
        })();
    }, []);

    // Generate AI reports sequentially to avoid rate-limiting
    useEffect(() => {
        if (!teamsData.length) return;
        const pending = [];

        teamsData.forEach(td => {
            const key = td.teamId ?? td.teamName;
            if (generatedRef.current.has(key)) return;
            generatedRef.current.add(key);
            pending.push(td);
        });

        if (!pending.length) return;

        (async () => {
            for (let i = 0; i < pending.length; i++) {
                const td  = pending[i];
                const key = td.teamId ?? td.teamName;
                setReports(prev => ({ ...prev, [key]: "loading" }));
                try {
                    const report = await generateReport(td);
                    setReports(prev => ({ ...prev, [key]: report }));
                } catch (e) {
                    setReports(prev => ({ ...prev, [key]: e }));
                }
                if (i < pending.length - 1) await sleep(REQUEST_DELAY_MS);
            }
        })();
    }, [teamsData]);

    const getKey = (td) => td.teamId ?? td.teamName;

    const handleRefresh = (td) => {
        const key = getKey(td);
        generatedRef.current.delete(key);
        setReports(prev => ({ ...prev, [key]: "loading" }));
        generateReport(td)
            .then(r  => setReports(prev => ({ ...prev, [key]: r })))
            .catch(e => setReports(prev => ({ ...prev, [key]: e })));
    };

    const handleRefreshAll = async () => {
        setRefreshAll(true);
        try {
            const data  = await getTeamsOverview();
            const arr   = Array.isArray(data) ? data : [];
            const fresh = arr.map(normaliseTeamOverview);
            setTeamsData(fresh);

            for (let i = 0; i < fresh.length; i++) {
                const td  = fresh[i];
                const key = getKey(td);
                generatedRef.current.delete(key);
                setReports(prev => ({ ...prev, [key]: "loading" }));
                try {
                    const report = await generateReport(td);
                    setReports(prev => ({ ...prev, [key]: report }));
                } catch (e) {
                    setReports(prev => ({ ...prev, [key]: e }));
                }
                if (i < fresh.length - 1) await sleep(REQUEST_DELAY_MS);
            }
        } catch (e) {
            setTeamsError(e?.message ?? "Failed to refresh.");
        }
        setRefreshAll(false);
    };

    const allDone = teamsData.length > 0 && teamsData.every(td => {
        const k = getKey(td);
        return reports[k] && reports[k] !== "loading";
    });
    const doneCount = teamsData.filter(td => {
        const k = getKey(td);
        return reports[k] && reports[k] !== "loading" && !(reports[k] instanceof Error);
    }).length;

    if (teamsLoading) return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 6, justifyContent: "center" }}>
            <CircularProgress size={20} sx={{ color: ACCENT }} />
            <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>Loading teams overview…</Typography>
        </Box>
    );

    if (teamsError) return (
        <Alert severity="error" sx={{ maxWidth: 600, mt: 3, borderRadius: 2 }}>{teamsError}</Alert>
    );

    if (!teamsData.length) return (
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
                            ? `Ready · ${doneCount}/${teamsData.length} reports`
                            : `Generating… ${doneCount}/${teamsData.length} done`}
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
                            startIcon={refreshAll
                                ? <CircularProgress size={12} color="inherit" />
                                : <RefreshOutlinedIcon sx={{ fontSize: 13 }} />}
                            onClick={handleRefreshAll} disabled={refreshAll}
                            sx={{
                                height: 32, px: 1.5, borderRadius: 1.5,
                                border: `1px solid ${t.borderLight}`,
                                color: t.textSecondary, fontSize: "0.75rem", fontWeight: 600, textTransform: "none",
                                "&:hover": { borderColor: ACCENT, color: ACCENT, bgcolor: `${ACCENT}06` },
                            }}>
                            {refreshAll ? "Refreshing…" : "Refresh All"}
                        </Button>
                    )}
                </Stack>
            </Stack>

            {/* CARDS */}
            <Stack spacing={2.5}>
                {teamsData.map((td) => {
                    const key   = getKey(td);
                    const entry = reports[key];

                    if (!entry || entry === "loading") return (
                        <SkeletonCard key={key} t={t} theme={theme}
                            teamName={td.teamName}
                            projectTitle={td.memberNames.join(", ") || ""} />
                    );

                    if (entry instanceof Error) return (
                        <Paper key={key} elevation={0} sx={{
                            borderRadius: 3, p: 3,
                            bgcolor: theme.palette.background.paper,
                            border: `1px solid ${t.borderLight}`,
                        }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography sx={{ fontWeight: 700, color: t.textPrimary, mb: 0.8 }}>{td.teamName}</Typography>
                                    <Alert severity="error" sx={{ borderRadius: 1.5, fontSize: "0.8rem" }}>{entry.message}</Alert>
                                </Box>
                                <Button size="small" startIcon={<RefreshOutlinedIcon sx={{ fontSize: 13 }} />}
                                    onClick={() => handleRefresh(td)}
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
                        <ReportCard key={key} report={entry} theme={theme} t={t}
                            onRefresh={() => handleRefresh(td)} />
                    );
                })}
            </Stack>

            {allDone && doneCount > 0 && (
                <Typography sx={{
                    fontSize: "0.68rem", color: t.textTertiary,
                    textAlign: "center", mt: 4, fontStyle: "italic",
                }}>
                    AI-generated assessments based on real tasks & files · Graduation Project Management System
                </Typography>
            )}
        </Box>
    );
}