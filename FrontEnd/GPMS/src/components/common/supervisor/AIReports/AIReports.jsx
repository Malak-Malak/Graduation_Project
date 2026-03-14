import {
    Box, Paper, Typography, Stack, Chip, Button, Grid, LinearProgress, Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

const REPORTS = [
    {
        team: "EcoTrackers", project: "AI-Based Waste Management", progress: 65, risk: "low",
        summary: "Team is progressing well. Submission frequency is above average with 8 files this week. Meeting attendance 100%.",
        issues: [
            "Testing phase not started (Due in 5 days)",
            "Database design had multiple revisions — may need technical review",
        ],
        recommendations: [
            "Schedule technical review for database schema",
            "Encourage pair programming for testing module",
            "Group shows strong potential for academic publication",
        ],
        metrics: { taskRate: 78, submissionFreq: 90, meetingAttendance: 100, overallScore: 82 },
    },
    {
        team: "CodeCraft", project: "Smart Campus Navigation", progress: 42, risk: "medium",
        summary: "Team is behind schedule. Low task completion rate and no file submissions in the past 5 days.",
        issues: [
            "3 overdue tasks in Kanban",
            "No file submission in 5 days",
            "Meeting missed last week",
        ],
        recommendations: [
            "Schedule urgent intervention meeting",
            "Review and redistribute task workload",
            "Consider extending deadline for specific milestones",
        ],
        metrics: { taskRate: 35, submissionFreq: 40, meetingAttendance: 60, overallScore: 42 },
    },
    {
        team: "InnovateX", project: "Blockchain Voting System", progress: 80, risk: "low",
        summary: "Excellent progress. All tasks on schedule and file quality is high. Consistent engagement.",
        issues: [],
        recommendations: [
            "Begin preparing final presentation",
            "Consider adding additional testing coverage",
        ],
        metrics: { taskRate: 92, submissionFreq: 88, meetingAttendance: 100, overallScore: 91 },
    },
];

const RISK_CLR = { low: "#6D8A7D", medium: "#C49A6C", high: "#C47E7E" };
const SCORE_CLR = (s) => s >= 75 ? "#6D8A7D" : s >= 50 ? "#C49A6C" : "#C47E7E";

function MetricBar({ label, value }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" mb={0.4}>
                <Typography sx={{ fontSize: "0.72rem", color: t.textSecondary }}>{label}</Typography>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: SCORE_CLR(value) }}>{value}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={value}
                sx={{ bgcolor: t.borderLight, "& .MuiLinearProgress-bar": { bgcolor: SCORE_CLR(value) } }} />
        </Box>
    );
}

export default function AIReports() {
    const theme = useTheme();
    const t = theme.palette.custom;

    return (
        <Box sx={{ maxWidth: 1000 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                    <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                        <AutoAwesomeOutlinedIcon sx={{ color: t.accentPrimary, fontSize: 22 }} />
                        <Typography variant="h2" sx={{ color: t.textPrimary }}>AI Reports</Typography>
                    </Stack>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                        AI-generated performance analysis · Updated just now
                    </Typography>
                </Box>
            </Stack>

            <Stack spacing={3}>
                {REPORTS.map((r) => (
                    <Paper key={r.team} elevation={1} sx={{ borderRadius: 3, overflow: "hidden", bgcolor: theme.palette.background.paper }}>
                        {/* Header */}
                        <Box sx={{
                            px: 2.5, py: 2, borderBottom: `1px solid ${t.borderLight}`,
                            background: `linear-gradient(135deg, ${t.bgPrimary} 0%, ${theme.palette.background.paper} 100%)`
                        }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Stack direction="row" alignItems="center" gap={1}>
                                        <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", color: t.textPrimary }}>{r.team}</Typography>
                                        <Chip label={r.risk + " risk"} size="small"
                                            sx={{ bgcolor: `${RISK_CLR[r.risk]}18`, color: RISK_CLR[r.risk], fontWeight: 600, fontSize: "0.65rem", height: 20, textTransform: "capitalize" }} />
                                        <Chip label={`Score: ${r.metrics.overallScore}`} size="small"
                                            sx={{ bgcolor: `${SCORE_CLR(r.metrics.overallScore)}18`, color: SCORE_CLR(r.metrics.overallScore), fontWeight: 700, fontSize: "0.68rem", height: 20 }} />
                                    </Stack>
                                    <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, mt: 0.2 }}>{r.project}</Typography>
                                </Box>
                                <Stack direction="row" gap={1}>
                                    <Button size="small" startIcon={<SendOutlinedIcon sx={{ fontSize: 14 }} />} variant="outlined"
                                        sx={{
                                            borderColor: t.borderLight, color: t.textSecondary, fontSize: "0.75rem",
                                            "&:hover": { borderColor: t.accentPrimary, color: t.accentPrimary }
                                        }}>
                                        Send to Group
                                    </Button>
                                    <Button size="small" startIcon={<DownloadOutlinedIcon sx={{ fontSize: 14 }} />} variant="outlined"
                                        sx={{
                                            borderColor: t.borderLight, color: t.textSecondary, fontSize: "0.75rem",
                                            "&:hover": { borderColor: t.accentPrimary, color: t.accentPrimary }
                                        }}>
                                        Export PDF
                                    </Button>
                                </Stack>
                            </Stack>
                        </Box>

                        {/* Body */}
                        <Grid container>
                            {/* Left */}
                            <Grid size={{ xs: 12, md: 7 }} sx={{ p: 2.5, borderRight: { md: `1px solid ${t.borderLight}` } }}>
                                <Box sx={{ mb: 2 }}>
                                    <Stack direction="row" alignItems="center" gap={0.8} mb={0.8}>
                                        <TrendingUpIcon sx={{ fontSize: 16, color: t.accentSecondary }} />
                                        <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: t.textTertiary, textTransform: "uppercase", letterSpacing: "0.07em" }}>Summary</Typography>
                                    </Stack>
                                    <Typography sx={{ fontSize: "0.875rem", color: t.textSecondary, lineHeight: 1.6 }}>{r.summary}</Typography>
                                </Box>

                                <Divider sx={{ mb: 2 }} />

                                {r.issues.length > 0 ? (
                                    <Box sx={{ mb: 2 }}>
                                        <Stack direction="row" alignItems="center" gap={0.8} mb={1}>
                                            <WarningAmberOutlinedIcon sx={{ fontSize: 16, color: t.warning }} />
                                            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: t.textTertiary, textTransform: "uppercase", letterSpacing: "0.07em" }}>Identified Issues</Typography>
                                        </Stack>
                                        <Stack spacing={0.8}>
                                            {r.issues.map((issue, i) => (
                                                <Stack key={i} direction="row" gap={1} alignItems="flex-start">
                                                    <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: t.warning, mt: 0.7, flexShrink: 0 }} />
                                                    <Typography sx={{ fontSize: "0.82rem", color: t.textPrimary }}>{issue}</Typography>
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </Box>
                                ) : (
                                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${t.success}10`, border: `1px solid ${t.success}30`, mb: 2 }}>
                                        <Typography sx={{ fontSize: "0.82rem", color: t.success, fontWeight: 500 }}>✓ No critical issues detected</Typography>
                                    </Box>
                                )}

                                <Box>
                                    <Stack direction="row" alignItems="center" gap={0.8} mb={1}>
                                        <LightbulbOutlinedIcon sx={{ fontSize: 16, color: t.accentTertiary }} />
                                        <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: t.textTertiary, textTransform: "uppercase", letterSpacing: "0.07em" }}>Recommendations</Typography>
                                    </Stack>
                                    <Stack spacing={0.8}>
                                        {r.recommendations.map((rec, i) => (
                                            <Stack key={i} direction="row" gap={1} alignItems="flex-start">
                                                <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: t.accentTertiary, mt: 0.7, flexShrink: 0 }} />
                                                <Typography sx={{ fontSize: "0.82rem", color: t.textPrimary }}>{rec}</Typography>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Box>
                            </Grid>

                            {/* Right */}
                            <Grid size={{ xs: 12, md: 5 }} sx={{ p: 2.5 }}>
                                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: t.textTertiary, textTransform: "uppercase", letterSpacing: "0.07em", mb: 2 }}>
                                    Performance Metrics
                                </Typography>
                                <Stack spacing={1.8}>
                                    <MetricBar label="Task Completion Rate" value={r.metrics.taskRate} />
                                    <MetricBar label="Submission Frequency" value={r.metrics.submissionFreq} />
                                    <MetricBar label="Meeting Attendance" value={r.metrics.meetingAttendance} />
                                    <Divider />
                                    <Box sx={{
                                        p: 1.5, borderRadius: 2, bgcolor: `${SCORE_CLR(r.metrics.overallScore)}10`,
                                        border: `1px solid ${SCORE_CLR(r.metrics.overallScore)}30`, textAlign: "center"
                                    }}>
                                        <Typography sx={{ fontSize: "2rem", fontWeight: 700, color: SCORE_CLR(r.metrics.overallScore), lineHeight: 1 }}>
                                            {r.metrics.overallScore}
                                        </Typography>
                                        <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary, mt: 0.3 }}>Overall Score</Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Paper>
                ))}
            </Stack>
        </Box>
    );
}