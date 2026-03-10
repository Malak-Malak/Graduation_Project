import {
    Box, Paper, Typography, Stack, Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
    ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";

const submissionsData = [
    { month: "Oct", files: 42, meetings: 18 },
    { month: "Nov", files: 65, meetings: 27 },
    { month: "Dec", files: 38, meetings: 15 },
    { month: "Jan", files: 72, meetings: 34 },
    { month: "Feb", files: 91, meetings: 41 },
    { month: "Mar", files: 58, meetings: 29 },
];

const completionData = [
    { name: "On Track", value: 28, color: "#6D8A7D" },
    { name: "At Risk", value: 12, color: "#C49A6C" },
    { name: "Behind", value: 8, color: "#C47E7E" },
];

const activityData = [
    { week: "W1", students: 180, supervisors: 42 },
    { week: "W2", students: 220, supervisors: 56 },
    { week: "W3", students: 195, supervisors: 48 },
    { week: "W4", students: 310, supervisors: 71 },
    { week: "W5", students: 275, supervisors: 63 },
    { week: "W6", students: 340, supervisors: 85 },
];

function ChartCard({ title, subtitle, children }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    return (
        <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
            <Box mb={2.5}>
                <Typography variant="h4" sx={{ color: t.textPrimary }}>{title}</Typography>
                {subtitle && <Typography sx={{ fontSize: "0.78rem", color: t.textTertiary, mt: 0.3 }}>{subtitle}</Typography>}
            </Box>
            {children}
        </Paper>
    );
}

export default function Reports() {
    const theme = useTheme();
    const t = theme.palette.custom;

    const tooltipStyle = {
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${t.borderLight}`,
        borderRadius: 8,
        fontSize: 12,
        color: t.textPrimary,
    };

    return (
        <Box sx={{ maxWidth: 1100 }}>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} mb={3} gap={2}>
                <Box>
                    <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>Reports & Analytics</Typography>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>Spring 2025 semester overview</Typography>
                </Box>
                <Button variant="outlined" startIcon={<DownloadOutlinedIcon />}
                    sx={{ borderColor: t.borderLight, color: t.textSecondary, "&:hover": { borderColor: t.accentPrimary, color: t.accentPrimary } }}>
                    Export PDF
                </Button>
            </Stack>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
                {/* Chart 1 — Submissions */}
                <ChartCard title="File Submissions & Meetings" subtitle="Monthly activity — Spring 2025">
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={submissionsData} barSize={14} barCategoryGap="30%">
                            <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight} vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: t.textTertiary }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: t.textTertiary }} axisLine={false} tickLine={false} />
                            <RTooltip contentStyle={tooltipStyle} cursor={{ fill: `${t.accentPrimary}08` }} />
                            <Bar dataKey="files" name="Files" fill={t.accentPrimary} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="meetings" name="Meetings" fill={t.accentSecondary} radius={[4, 4, 0, 0]} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: t.textSecondary }} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Chart 2 — Pie */}
                <ChartCard title="Project Status" subtitle="48 total projects">
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie data={completionData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                                {completionData.map((entry) => (
                                    <Cell key={entry.name} fill={entry.color} />
                                ))}
                            </Pie>
                            <RTooltip contentStyle={tooltipStyle} />
                        </PieChart>
                    </ResponsiveContainer>
                    <Stack spacing={0.8} mt={1}>
                        {completionData.map((d) => (
                            <Stack key={d.name} direction="row" alignItems="center" justifyContent="space-between">
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: d.color }} />
                                    <Typography sx={{ fontSize: "0.8rem", color: t.textSecondary }}>{d.name}</Typography>
                                </Stack>
                                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: t.textPrimary }}>{d.value}</Typography>
                            </Stack>
                        ))}
                    </Stack>
                </ChartCard>

                {/* Chart 3 — Line */}
                <Box sx={{ gridColumn: { xs: "1", md: "1 / 3" } }}>
                    <ChartCard title="User Activity" subtitle="Weekly logins and interactions">
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight} vertical={false} />
                                <XAxis dataKey="week" tick={{ fontSize: 12, fill: t.textTertiary }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: t.textTertiary }} axisLine={false} tickLine={false} />
                                <RTooltip contentStyle={tooltipStyle} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: t.textSecondary }} />
                                <Line type="monotone" dataKey="students" name="Students" stroke={t.accentPrimary} strokeWidth={2} dot={{ r: 4, fill: t.accentPrimary }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="supervisors" name="Supervisors" stroke={t.accentSecondary} strokeWidth={2} dot={{ r: 4, fill: t.accentSecondary }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Box>
            </Box>
        </Box>
    );
}