// src/components/supervisor/AIReports/AIReports.jsx

import { useState, useEffect, useRef } from "react";
import {
    Box, Paper, Typography, Stack, Chip, Button, LinearProgress,
    Divider, CircularProgress, Alert, Tooltip, IconButton,
    ToggleButtonGroup, ToggleButton, Tab, Tabs,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";

import { getSupervisorTeams } from "../../../../api/handler/endpoints/supervisorApi";
import { getKanbanBoard } from "../../../../api/handler/endpoints/kanbanApi";
import fileSystemApi from "../../../../api/handler/endpoints/fileSystemApi";
import requirementApi from "../../../../api/handler/endpoints/requirementApi";

// ─── colour helpers ────────────────────────────────────────────────────────────

const RISK_CLR = { low: "#6D8A7D", medium: "#C49A6C", high: "#C47E7E" };
const RISK_LABEL = { low: "Low Risk", medium: "Medium Risk", high: "High Risk" };
const RISK_BG = { low: "#6D8A7D", medium: "#C49A6C", high: "#C47E7E" };
const SCORE_CLR = (s) => s >= 75 ? "#6D8A7D" : s >= 50 ? "#C49A6C" : "#C47E7E";
const SCORE_LABEL = (s) => s >= 75 ? "Strong" : s >= 50 ? "Moderate" : s > 0 ? "Needs Work" : "No Data";

// ─── PDF export ────────────────────────────────────────────────────────────────

function exportReportToPDF(report) {
    const scoreClr = SCORE_CLR(report.metrics?.overallScore ?? 0);
    const riskClr = RISK_CLR[report.risk] ?? RISK_CLR.medium;
    const score = report.metrics?.overallScore ?? "–";

    const metricRow = (label, value) => `
        <div class="metric-row">
            <span class="metric-label">${label}</span>
            <span class="metric-value" style="color:${SCORE_CLR(value)}">${value}%</span>
        </div>
        <div class="bar-bg"><div class="bar-fill" style="width:${value}%;background:${SCORE_CLR(value)}"></div></div>`;

    const bulletList = (items, color) => items.length
        ? items.map(i => `<li>${i}</li>`).join("")
        : `<li style="color:${color};font-style:italic">None</li>`;

    const taskRows = report._raw?.taskBreakdown
        ? Object.entries(report._raw.taskBreakdown)
            .map(([s, c]) => `<td>${s}</td><td style="text-align:right;font-weight:700">${c}</td></tr>`)
            .join("")
        : "";

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>AI Report — ${report.team}</title>
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:'Segoe UI',Arial,sans-serif; color:#1a1a1a; background:#fff; padding:40px; font-size:13px; }
h1 { font-size:22px; font-weight:800; margin-bottom:2px; }
h2 { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:#666; margin:20px 0 8px; }
.header { border-bottom:2px solid #eee; padding-bottom:14px; margin-bottom:20px; }
.chips { display:flex; gap:8px; margin-top:8px; flex-wrap:wrap; }
.chip { padding:2px 10px; border-radius:20px; font-size:11px; font-weight:700; }
.score-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin:16px 0; }
.score-box { text-align:center; border-radius:10px; padding:16px 8px; border:1.5px solid; }
.score-num { font-size:28px; font-weight:900; line-height:1; }
.score-sub { font-size:10px; color:#888; margin-top:4px; }
.two-col { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
ul { padding-left:18px; line-height:2.1; color:#333; }
.summary-box { background:#f9f9f9; border-left:3px solid ${scoreClr}; padding:12px 16px; border-radius:4px; line-height:1.75; }
.metric-row { display:flex; justify-content:space-between; margin-bottom:3px; }
.metric-label { color:#555; }
.metric-value { font-weight:700; }
.bar-bg { height:6px; background:#eee; border-radius:3px; margin-bottom:10px; }
.bar-fill { height:6px; border-radius:3px; }
table { width:100%; border-collapse:collapse; font-size:12px; margin-top:8px; }
td,th { padding:5px 8px; border-bottom:1px solid #f0f0f0; }
th { text-align:left; color:#888; font-weight:600; text-transform:uppercase; font-size:10px; }
.footer { margin-top:32px; padding-top:12px; border-top:1px solid #eee; color:#aaa; font-size:11px; text-align:center; }
@media print { body { padding:20px; } }
</style></head><body>
<div class="header">
  <h1>${report.team}</h1>
  <div style="color:#666;font-size:13px;margin-top:3px">${report.project}</div>
  <div class="chips">
    <span class="chip" style="background:${riskClr}18;color:${riskClr};border:1px solid ${riskClr}40">${report.risk} risk</span>
    <span class="chip" style="background:${scoreClr}18;color:${scoreClr};border:1px solid ${scoreClr}40">Score: ${score} — ${SCORE_LABEL(report.metrics?.overallScore ?? 0)}</span>
    <span class="chip" style="background:#f5f5f5;color:#666;border:1px solid #ddd">Generated: ${report.generatedAt ?? "–"}</span>
  </div>
</div>
<div class="score-row">
  <div class="score-box" style="border-color:${scoreClr}40;background:${scoreClr}08">
    <div class="score-num" style="color:${scoreClr}">${score}</div>
    <div class="score-sub">Overall Score</div>
  </div>
  <div class="score-box" style="border-color:#6D8A7D40;background:#6D8A7D08">
    <div class="score-num" style="color:#6D8A7D">${report.metrics?.taskRate ?? 0}%</div>
    <div class="score-sub">Task Completion</div>
  </div>
  <div class="score-box" style="border-color:#C49A6C40;background:#C49A6C08">
    <div class="score-num" style="color:#C49A6C">${report.metrics?.onTimeDelivery ?? 0}%</div>
    <div class="score-sub">On-Time Delivery</div>
  </div>
  <div class="score-box" style="border-color:#7D8A6D40;background:#7D8A6D08">
    <div class="score-num" style="color:#7D8A6D">${report.metrics?.reqCoverage ?? 0}%</div>
    <div class="score-sub">Req. Coverage</div>
  </div>
</div>
<h2>Summary</h2>
<div class="summary-box">${report.summary}</div>
<div class="two-col" style="margin-top:16px">
  <div>
    <h2>⚠ Identified Issues</h2>
    <ul>${bulletList(report.issues ?? [], "#C47E7E")}</ul>
    <h2>💡 Recommendations</h2>
    <ul>${bulletList(report.recommendations ?? [], "#6D8A7D")}</ul>
  </div>
  <div>
    <h2>Performance Metrics</h2>
    ${metricRow("Task Completion Rate",  report.metrics?.taskRate        ?? 0)}
    ${metricRow("On-Time Delivery",      report.metrics?.onTimeDelivery  ?? 0)}
    ${metricRow("Requirements Coverage", report.metrics?.reqCoverage     ?? 0)}
    ${taskRows ? `<h2>Task Breakdown</h2>
    <table><thead><tr><th>Status</th><th style="text-align:right">Count</th></tr></thead>
    <tbody>${taskRows}</tbody></table>` : ""}
  </div>
</div>
<div class="footer">AI-generated report · Powered by Gemini AI · Graduation Project Management System</div>
<script>window.onload=()=>window.print();<\/script>
</body></html>`;

    const win = window.open("", "_blank", "width=900,height=700");
    if (win) { win.document.write(html); win.document.close(); }
}

// ─── ArcGauge — replaces ScoreCircle ──────────────────────────────────────────

function ArcGauge({ value, label, size = "lg" }) {
    const color = SCORE_CLR(value);
    const isLg = size === "lg";
    const dim = isLg ? 100 : 78;
    const stroke = isLg ? 7 : 5.5;
    const r = dim / 2 - stroke / 2 - 2;
    const circ = 2 * Math.PI * r;
    const dash = circ * (value / 100);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.6 }}>
            <Box sx={{ position: "relative", width: dim, height: dim }}>
                <svg width={dim} height={dim} style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
                    <circle cx={dim/2} cy={dim/2} r={r} fill="none" stroke={`${color}15`} strokeWidth={stroke} />
                    <circle cx={dim/2} cy={dim/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                        style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }} />
                </svg>
                {/* glow dot at the end */}
                <Box sx={{
                    position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Typography sx={{
                        fontSize: isLg ? "1.55rem" : "1.1rem",
                        fontWeight: 800, color,
                        lineHeight: 1,
                        letterSpacing: "-0.03em",
                    }}>
                        {value > 0 ? (label === "Overall" ? value : `${value}%`) : "–"}
                    </Typography>
                </Box>
            </Box>
            <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color, opacity: 0.75, textAlign: "center", maxWidth: 70, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {label}
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
                bgcolor: `${color}0D`,
                border: `1px solid ${color}20`,
                transition: "all 0.2s",
                "&:hover": { bgcolor: `${color}18`, borderColor: `${color}35` },
            }}>
            <Icon sx={{ fontSize: 11, color, opacity: 0.9 }} />
            <Typography sx={{ fontSize: "0.65rem", color, fontWeight: 700, letterSpacing: "0.02em" }}>{label}</Typography>
        </Stack>
    );
}

// ─── MetricBar ────────────────────────────────────────────────────────────────

function MetricBar({ label, value }) {
    const color = SCORE_CLR(value);
    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.6}>
                <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontWeight: 500 }}>{label}</Typography>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color }}>{value}%</Typography>
            </Stack>
            <Box sx={{ height: 4, bgcolor: `${color}15`, borderRadius: 2, overflow: "hidden" }}>
                <Box sx={{
                    height: "100%", width: `${value}%`, bgcolor: color,
                    borderRadius: 2,
                    transition: "width 0.9s cubic-bezier(.4,0,.2,1)",
                    boxShadow: `0 0 6px ${color}60`,
                }} />
            </Box>
        </Box>
    );
}

// ─── BulletList ────────────────────────────────────────────────────────────────

function BulletList({ items, color, emptyText }) {
    const t = useTheme().palette.custom;
    if (!items?.length) return (
        <Box sx={{
            p: 2, borderRadius: 2,
            bgcolor: `${color}08`,
            border: `1px solid ${color}18`,
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
                        bgcolor: `${color}06`,
                        border: `1px solid ${color}12`,
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
    const dots = risk === "high" ? 3 : risk === "medium" ? 2 : 1;
    return (
        <Stack direction="row" alignItems="center" gap={0.5}
            sx={{
                px: 1.2, py: 0.4, borderRadius: 1.5,
                bgcolor: `${color}12`,
                border: `1px solid ${color}30`,
            }}>
            <Stack direction="row" gap={0.3}>
                {[...Array(3)].map((_, i) => (
                    <Box key={i} sx={{
                        width: 5, height: 5, borderRadius: "50%",
                        bgcolor: i < dots ? color : `${color}25`,
                        transition: "all 0.3s",
                    }} />
                ))}
            </Stack>
            <Typography sx={{ fontSize: "0.63rem", color, fontWeight: 700, textTransform: "capitalize", letterSpacing: "0.04em" }}>
                {RISK_LABEL[risk]}
            </Typography>
        </Stack>
    );
}

// ─── ReportCard ────────────────────────────────────────────────────────────────

function ReportCard({ report, theme, t, onRefresh }) {
    const [tab, setTab] = useState(0);
    const r = report;
    const scoreClr = SCORE_CLR(r.metrics?.overallScore ?? 0);

    return (
        <Paper elevation={0} sx={{
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${t.borderLight}`,
            transition: "box-shadow 0.3s, transform 0.2s",
            "&:hover": {
                boxShadow: `0 8px 32px ${scoreClr}18`,
                transform: "translateY(-1px)",
            },
        }}>

            {/* ── accent strip ── */}
            <Box sx={{
                height: 2,
                background: `linear-gradient(90deg, ${scoreClr} 0%, ${scoreClr}40 60%, transparent 100%)`,
            }} />

            {/* ── HEADER ── */}
            <Box sx={{ px: 2.5, pt: 2.5, pb: 2, borderBottom: `1px solid ${t.borderLight}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1.5}>

                    {/* left: title + meta */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" mb={0.4}>
                            <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: t.textPrimary, letterSpacing: "-0.02em" }}>
                                {r.team}
                            </Typography>
                            <RiskBadge risk={r.risk} />
                            <Chip
                                label={SCORE_LABEL(r.metrics?.overallScore ?? 0)}
                                size="small"
                                sx={{
                                    bgcolor: `${scoreClr}12`, color: scoreClr,
                                    fontWeight: 700, fontSize: "0.6rem", height: 19,
                                    border: `1px solid ${scoreClr}25`,
                                    letterSpacing: "0.03em",
                                }}
                            />
                        </Stack>

                        <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, mb: 1 }}>
                            {r.project}
                        </Typography>

                        {r.generatedAt && (
                            <Stack direction="row" alignItems="center" gap={0.5} mb={1.2}>
                                <AccessTimeOutlinedIcon sx={{ fontSize: 10, color: t.textTertiary }} />
                                <Typography sx={{ fontSize: "0.62rem", color: t.textTertiary, letterSpacing: "0.01em" }}>
                                    {r.generatedAt}
                                </Typography>
                            </Stack>
                        )}

                        <Stack direction="row" gap={0.7} flexWrap="wrap">
                            <StatPill icon={AssignmentOutlinedIcon} label={`${r._raw?.totalTasks ?? 0} tasks`}   color={t.accentPrimary ?? "#6D8A7D"} />
                            <StatPill icon={FolderOutlinedIcon}     label={`${r._raw?.totalFiles ?? 0} files`}   color={t.accentSecondary ?? "#C49A6C"} />
                            <StatPill icon={PeopleOutlinedIcon}     label={`${r._raw?.members ?? 0} members`}    color={t.accentTertiary ?? "#7D8A6D"} />
                            <StatPill icon={AssignmentOutlinedIcon} label={`${r._raw?.requirements ?? 0} reqs`}  color={scoreClr} />
                        </Stack>
                    </Box>

                    {/* right: actions */}
                    <Stack direction="row" gap={0.8} alignItems="center" flexShrink={0}>
                        <Tooltip title="Regenerate with latest data">
                            <IconButton size="small" onClick={onRefresh} sx={{
                                color: t.textSecondary,
                                border: `1px solid ${t.borderLight}`,
                                borderRadius: 1.5,
                                width: 30, height: 30,
                                "&:hover": { borderColor: scoreClr, color: scoreClr, bgcolor: `${scoreClr}08` },
                                transition: "all 0.2s",
                            }}>
                                <RefreshOutlinedIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Send to Group — coming soon">
                            <span>
                                <Button size="small" disabled
                                    startIcon={<SendOutlinedIcon sx={{ fontSize: 12 }} />}
                                    sx={{
                                        height: 30, px: 1.5,
                                        borderRadius: 1.5,
                                        border: `1px solid ${t.borderLight}`,
                                        color: t.textTertiary,
                                        fontSize: "0.72rem", fontWeight: 600,
                                        textTransform: "none",
                                    }}>
                                    Send
                                </Button>
                            </span>
                        </Tooltip>

                        <Button size="small"
                            startIcon={<DownloadOutlinedIcon sx={{ fontSize: 12 }} />}
                            onClick={() => exportReportToPDF(r)}
                            sx={{
                                height: 30, px: 1.5,
                                borderRadius: 1.5,
                                border: `1px solid ${t.borderLight}`,
                                color: t.textSecondary,
                                fontSize: "0.72rem", fontWeight: 600,
                                textTransform: "none",
                                "&:hover": { borderColor: scoreClr, color: scoreClr, bgcolor: `${scoreClr}08` },
                                transition: "all 0.2s",
                            }}>
                            Export PDF
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            {/* ── METRICS STRIP ── */}
            <Box sx={{ px: 2.5, py: 2.5, borderBottom: `1px solid ${t.borderLight}` }}>
                <Stack direction="row" alignItems="center" gap={3} flexWrap="wrap">

                    {/* large overall gauge */}
                    <ArcGauge value={r.metrics?.overallScore ?? 0} label="Overall" size="lg" />

                    <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" }, opacity: 0.4 }} />

                    {/* metric bars stacked */}
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Stack spacing={1.6}>
                            <MetricBar label="Task Completion"      value={r.metrics?.taskRate       ?? 0} />
                            <MetricBar label="On-Time Delivery"     value={r.metrics?.onTimeDelivery ?? 0} />
                            <MetricBar label="Requirements Coverage" value={r.metrics?.reqCoverage    ?? 0} />
                        </Stack>
                    </Box>

                    {/* task breakdown chips */}
                    {r._raw?.taskBreakdown && Object.keys(r._raw.taskBreakdown).length > 0 && (
                        <>
                            <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" }, opacity: 0.4 }} />
                            <Stack spacing={0.7} sx={{ display: { xs: "none", md: "flex" } }}>
                                <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: t.textTertiary, textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.3 }}>
                                    Breakdown
                                </Typography>
                                {Object.entries(r._raw.taskBreakdown).map(([status, count]) => {
                                    const c = SCORE_CLR(status === "Done" ? 80 : status === "In Progress" ? 55 : 30);
                                    return (
                                        <Stack key={status} direction="row" alignItems="center" gap={1} justifyContent="space-between">
                                            <Typography sx={{ fontSize: "0.68rem", color: t.textSecondary }}>{status}</Typography>
                                            <Box sx={{
                                                minWidth: 22, height: 18, borderRadius: 1,
                                                bgcolor: `${c}15`, border: `1px solid ${c}25`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}>
                                                <Typography sx={{ fontSize: "0.63rem", fontWeight: 800, color: c }}>{count}</Typography>
                                            </Box>
                                        </Stack>
                                    );
                                })}
                            </Stack>
                        </>
                    )}
                </Stack>
            </Box>

            {/* ── TABS ── */}
            <Box sx={{ borderBottom: `1px solid ${t.borderLight}`, px: 0.5 }}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{
                        minHeight: 40,
                        "& .MuiTab-root": {
                            minHeight: 40, fontSize: "0.72rem", fontWeight: 700,
                            textTransform: "none", color: t.textTertiary, py: 0,
                            letterSpacing: "0.01em",
                        },
                        "& .Mui-selected": { color: `${t.accentPrimary} !important` },
                        "& .MuiTabs-indicator": { bgcolor: t.accentPrimary, height: 2, borderRadius: 1 },
                    }}
                >
                    <Tab icon={<SummarizeOutlinedIcon sx={{ fontSize: 13 }} />} iconPosition="start" label="Summary" />
                    <Tab
                        icon={<WarningAmberOutlinedIcon sx={{ fontSize: 13 }} />} iconPosition="start"
                        label={`Issues${r.issues?.length ? ` (${r.issues.length})` : ""}`}
                    />
                    <Tab icon={<LightbulbOutlinedIcon sx={{ fontSize: 13 }} />} iconPosition="start" label="Recommendations" />
                </Tabs>
            </Box>

            {/* ── TAB CONTENT ── */}
            <Box sx={{ px: 2.5, py: 2 }}>
                {tab === 0 && (
                    <Box sx={{
                        p: 2, borderRadius: 2,
                        bgcolor: `${scoreClr}06`,
                        border: `1px solid ${scoreClr}15`,
                        borderLeft: `3px solid ${scoreClr}`,
                    }}>
                        <Stack direction="row" alignItems="flex-start" gap={1}>
                            <TrendingUpIcon sx={{ fontSize: 15, color: scoreClr, mt: 0.2, flexShrink: 0 }} />
                            <Typography sx={{ fontSize: "0.875rem", color: t.textSecondary, lineHeight: 1.75 }}>
                                {r.summary}
                            </Typography>
                        </Stack>
                    </Box>
                )}
                {tab === 1 && (
                    <BulletList
                        items={r.issues}
                        color={t.warning ?? "#C49A6C"}
                        emptyText="No critical issues detected"
                    />
                )}
                {tab === 2 && (
                    <BulletList
                        items={r.recommendations}
                        color={t.accentTertiary ?? "#6D8A7D"}
                        emptyText="No recommendations at this time"
                    />
                )}
            </Box>
        </Paper>
    );
}

// ─── Skeleton loader ───────────────────────────────────────────────────────────

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
                    Fetching Kanban, files & requirements → generating AI report…
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

// ─── data helpers ──────────────────────────────────────────────────────────────

function buildPrompt(team, tasks, files, requirements) {
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => /done|complete/i.test(t.status)).length;
    const inProgress = tasks.filter(t => /progress|doing/i.test(t.status)).length;
    const todoTasks = tasks.filter(t => /todo|to.do|backlog/i.test(t.status)).length;
    const overdueTasks = tasks.filter(t =>
        t.deadline && new Date(t.deadline) < new Date() && !/done|complete/i.test(t.status)
    ).length;
    const taskBreakdown = tasks.reduce((acc, t) => {
        const s = t.status ?? "Unknown"; acc[s] = (acc[s] ?? 0) + 1; return acc;
    }, {});

    const tasksWithDeadline = tasks.filter(t => t.deadline);
    const onTimeTasks = tasksWithDeadline.filter(t =>
        /done|complete/i.test(t.status) && new Date(t.deadline) >= new Date(t.updatedAt ?? t.deadline)
    ).length;
    const onTimeDelivery = tasksWithDeadline.length > 0
        ? Math.round((onTimeTasks / tasksWithDeadline.length) * 100)
        : doneTasks > 0 ? 70 : 0;

    const taskCompRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    const reqCoverage = requirements.length > 0
        ? Math.min(100, Math.round(
            (requirements.filter(r => r.status === "Done" || r.status === "Completed").length / requirements.length) * 100
          ))
        : 0;

    const recentFiles = files.slice(0, 5).map(f => `"${f.fileName}" (${f.description ?? "no description"})`).join(", ") || "none";
    const reqSummary = requirements.map(r => `[${r.priority ?? "?"}] ${r.title}`).join("; ") || "none";

    return {
        prompt: `You are an expert academic graduation project supervisor assistant.
Analyze this team's project data and produce a performance report.

TEAM PROJECT: ${team.projectTitle}
DESCRIPTION: ${team.projectDescription?.slice(0, 300) ?? "(none)"}
STATUS: ${team.status}
MEMBERS (${team.members?.length ?? 0}): ${team.members?.map(m => m.fullName).join(", ") || "unknown"}

KANBAN TASKS (total: ${totalTasks}):
- Done: ${doneTasks} | In Progress: ${inProgress} | To Do: ${todoTasks} | Overdue: ${overdueTasks}
- Tasks with deadline: ${tasksWithDeadline.length} | On-time completed: ${onTimeTasks}
- Breakdown: ${JSON.stringify(taskBreakdown)}

FILES (total: ${files.length}): ${recentFiles}

REQUIREMENTS (total: ${requirements.length}): ${reqSummary}

Respond ONLY with a valid JSON object, no markdown, no backticks:
{
  "summary": "2-3 sentence assessment based on the real data above",
  "risk": "low|medium|high",
  "issues": ["specific issue based on real data"],
  "recommendations": ["actionable recommendation"],
  "metrics": {
    "taskRate": <integer 0-100>,
    "onTimeDelivery": <integer 0-100>,
    "reqCoverage": <integer 0-100>,
    "overallScore": <integer 0-100>
  }
}
Rules: base everything on real data · flag overdue tasks · flag empty requirements · return ONLY the JSON`,
        _computed: { taskBreakdown, taskCompRate, onTimeDelivery, reqCoverage, totalTasks, totalFiles: files.length, members: team.members?.length ?? 0, requirements: requirements.length },
    };
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
    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const clean = raw.replace(/```json|```/gi, "").trim();
    return JSON.parse(clean);
}

async function generateReportForTeam(team) {
    const [boardRes, filesRes, reqsRes] = await Promise.allSettled([
        getKanbanBoard(),
        fileSystemApi.getStudentFiles(),
        requirementApi.getAll(),
    ]);

    const boardData = boardRes.status === "fulfilled" ? (boardRes.value?.data ?? {}) : {};
    const tasks = [
        ...(boardData.toDo ?? []),
        ...(boardData.inProgress ?? []),
        ...(boardData.done ?? []),
    ];
    const files = filesRes.status === "fulfilled" ? (filesRes.value ?? []) : [];
    const reqs = reqsRes.status === "fulfilled" ? (reqsRes.value ?? []) : [];

    const { prompt, _computed } = buildPrompt(team, tasks, files, reqs);
    const ai = await callGemini(prompt);

    const now = new Date();
    const generatedAt = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        + " · " + now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    return {
        teamId: team.id,
        team: team.projectTitle,
        project: `${team.members?.map(m => m.fullName).join(", ") || "No members"}`,
        summary: ai.summary ?? "No summary generated.",
        risk: ai.risk ?? "medium",
        issues: ai.issues ?? [],
        recommendations: ai.recommendations ?? [],
        metrics: {
            taskRate: ai.metrics?.taskRate ?? _computed.taskCompRate,
            onTimeDelivery: ai.metrics?.onTimeDelivery ?? _computed.onTimeDelivery,
            reqCoverage: ai.metrics?.reqCoverage ?? _computed.reqCoverage,
            overallScore: ai.metrics?.overallScore ?? 50,
        },
        _raw: {
            taskBreakdown: _computed.taskBreakdown,
            totalTasks: _computed.totalTasks,
            totalFiles: _computed.totalFiles,
            members: _computed.members,
            requirements: _computed.requirements,
        },
        generatedAt,
    };
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AIReports() {
    const theme = useTheme();
    const t = theme.palette.custom;

    const [teams, setTeams] = useState([]);
    const [reports, setReports] = useState({});
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [teamsError, setTeamsError] = useState(null);
    const [riskFilter, setRiskFilter] = useState("all");
    const [regenAll, setRegenAll] = useState(false);
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
            .then(r => setReports(prev => ({ ...prev, [team.id]: r })))
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

    const allDone = teams.length > 0 && teams.every(tm => reports[tm.id] && reports[tm.id] !== "loading");
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

            {/* ── PAGE HEADER ── */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={1.5}>
                <Box>
                    <Stack direction="row" alignItems="center" gap={1} mb={0.4}>
                        <Box sx={{
                            width: 32, height: 32, borderRadius: 2,
                            bgcolor: `${t.accentPrimary}15`,
                            border: `1px solid ${t.accentPrimary}25`,
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
                            ? `Performance analysis ready · ${doneCount}/${teams.length} reports`
                            : `Generating reports… ${doneCount}/${teams.length} done`}
                    </Typography>
                </Box>

                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
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
                                color: t.textSecondary, fontSize: "0.75rem", fontWeight: 600,
                                textTransform: "none",
                                "&:hover": { borderColor: t.accentPrimary, color: t.accentPrimary, bgcolor: `${t.accentPrimary}06` },
                                transition: "all 0.2s",
                            }}>
                            {regenAll ? "Regenerating…" : "Regenerate All"}
                        </Button>
                    )}
                </Stack>
            </Stack>

            {/* ── RISK FILTER BAR ── */}
            {allDone && (
                <Stack direction="row" alignItems="center" gap={1.5} mb={3} flexWrap="wrap">
                    <Stack direction="row" alignItems="center" gap={0.5}>
                        <FilterListOutlinedIcon sx={{ fontSize: 13, color: t.textTertiary }} />
                        <Typography sx={{ fontSize: "0.68rem", color: t.textTertiary, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                            Filter
                        </Typography>
                    </Stack>
                    <ToggleButtonGroup
                        value={riskFilter} exclusive
                        onChange={(_, v) => v && setRiskFilter(v)}
                        size="small"
                        sx={{
                            gap: 0.5,
                            "& .MuiToggleButtonGroup-grouped": { borderRadius: "8px !important", border: `1px solid ${t.borderLight} !important` },
                            "& .MuiToggleButton-root": {
                                color: t.textSecondary, fontSize: "0.7rem", fontWeight: 700,
                                px: 1.3, py: 0.4, textTransform: "none", lineHeight: 1.6,
                                "&.Mui-selected": { bgcolor: `${t.accentPrimary}10`, borderColor: `${t.accentPrimary}40 !important`, color: t.accentPrimary },
                            },
                        }}
                    >
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

            {/* ── REPORT CARDS ── */}
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
                                    <Typography sx={{ fontWeight: 700, color: t.textPrimary, mb: 0.8 }}>
                                        {team.projectTitle}
                                    </Typography>
                                    <Alert severity="error" sx={{ borderRadius: 1.5, fontSize: "0.8rem" }}>{entry.message}</Alert>
                                </Box>
                                <Button size="small"
                                    startIcon={<RefreshOutlinedIcon sx={{ fontSize: 13 }} />}
                                    onClick={() => handleRefresh(team)}
                                    sx={{
                                        ml: 2, height: 30, px: 1.5, borderRadius: 1.5,
                                        border: `1px solid ${t.accentPrimary}40`,
                                        color: t.accentPrimary, fontSize: "0.72rem", fontWeight: 600,
                                        textTransform: "none",
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

            {/* ── FOOTER NOTE ── */}
            {allDone && doneCount > 0 && (
                <Typography sx={{
                    fontSize: "0.68rem", color: t.textTertiary,
                    textAlign: "center", mt: 4,
                    fontStyle: "italic", letterSpacing: "0.01em",
                }}>
                    Reports generated from live Kanban, file, and requirements data · Powered by Gemini AI
                </Typography>
            )}
        </Box>
    );
}