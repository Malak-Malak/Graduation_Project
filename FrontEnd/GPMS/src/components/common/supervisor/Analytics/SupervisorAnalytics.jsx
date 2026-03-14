import {
    Box, Paper, Typography, Stack, Button, Grid,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
    ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
    LineChart, Line, Legend,
} from "recharts";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";

const taskData = [
    { group: "EcoTrackers", done: 8, inProgress: 3, todo: 4 },
    { group: "CodeCraft", done: 4, inProgress: 2, todo: 7 },
    { group: "InnovateX", done: 14, inProgress: 1, todo: 2 },
    { group: "SmartCampus", done: 3, inProgress: 1, todo: 10 },
];

const radarData = [
    { metric: "Tasks", EcoTrackers: 78, CodeCraft: 35 },
    { metric: "Files", EcoTrackers: 88, CodeCraft: 42 },
    { metric: "Meetings", EcoTrackers: 100, CodeCraft: 60 },
    { metric: "Engagement", EcoTrackers: 90, CodeCraft: 40 },
    { metric: "Quality", EcoTrackers: 75, CodeCraft: 50 },
];

const progressOverTime = [
    { week: "W1", EcoTrackers: 30, CodeCraft: 20, InnovateX: 50, SmartCampus: 10 },
    { week: "W2", EcoTrackers: 40, CodeCraft: 28, InnovateX: 58, SmartCampus: 14 },
    { week: "W3", EcoTrackers: 50, CodeCraft: 33, InnovateX: 65, SmartCampus: 18 },
    { week: "W4", EcoTrackers: 58, CodeCraft: 38, InnovateX: 73, SmartCampus: 22 },
    { week: "W5", EcoTrackers: 65, CodeCraft: 42, InnovateX: 80, SmartCampus: 28 },
];

const GROUP_COLORS = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4"];

function ChartCard({ title, subtitle, children }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    return (
        <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
            <Typography variant="h4" sx={{ color: t.textPrimary, mb: 0.3 }}>{title}</Typography>
            {subtitle && <Typography sx={{ fontSize: "0.78rem", color: t.textTertiary, mb: 2 }}>{subtitle}</Typography>}
            {children}
        </Paper>
    );
}

export default function SupervisorAnalytics() {
    const theme = useTheme();
    const t = theme.palette.custom;

    const tooltipStyle = {
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${t.borderLight}`,
        borderRadius: 8, fontSize: 12, color: t.textPrimary,
    };

    return (
        <Box sx={{ maxWidth: 1100 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                    <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>Analytics</Typography>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>Group performance overview · Spring 2025</Typography>
                </Box>
                <Button variant="outlined" startIcon={<DownloadOutlinedIcon />}
                    sx={{ borderColor: t.borderLight, color: t.textSecondary, "&:hover": { borderColor: t.accentPrimary, color: t.accentPrimary } }}>
                    Export PDF
                </Button>
            </Stack>

            <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, lg: 7 }}>
                    <ChartCard title="Task Distribution" subtitle="By group and status">
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={taskData} barSize={14}>
                                <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight} vertical={false} />
                                <XAxis dataKey="group" tick={{ fontSize: 11, fill: t.textTertiary }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: t.textTertiary }} axisLine={false} tickLine={false} />
                                <RTooltip contentStyle={tooltipStyle} cursor={{ fill: `${t.accentPrimary}08` }} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: t.textSecondary }} />
                                <Bar dataKey="done" name="Done" fill={t.accentSecondary} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="inProgress" name="In Progress" fill={t.accentTertiary} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="todo" name="To Do" fill={t.borderLight} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, lg: 5 }}>
                    <ChartCard title="Group Comparison" subtitle="EcoTrackers vs CodeCraft">
                        <ResponsiveContainer width="100%" height={240}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke={t.borderLight} />
                                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: t.textTertiary }} />
                                <Radar name="EcoTrackers" dataKey="EcoTrackers" stroke={t.accentPrimary} fill={t.accentPrimary} fillOpacity={0.2} />
                                <Radar name="CodeCraft" dataKey="CodeCraft" stroke={t.accentSecondary} fill={t.accentSecondary} fillOpacity={0.2} />
                                <RTooltip contentStyle={tooltipStyle} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: t.textSecondary }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <ChartCard title="Progress Over Time" subtitle="Weekly completion rate by group">
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={progressOverTime}>
                                <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight} vertical={false} />
                                <XAxis dataKey="week" tick={{ fontSize: 12, fill: t.textTertiary }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: t.textTertiary }} axisLine={false} tickLine={false} unit="%" />
                                <RTooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: t.textSecondary }} />
                                {["EcoTrackers", "CodeCraft", "InnovateX", "SmartCampus"].map((name, i) => (
                                    <Line key={name} type="monotone" dataKey={name} stroke={GROUP_COLORS[i]} strokeWidth={2}
                                        dot={{ r: 3, fill: GROUP_COLORS[i] }} activeDot={{ r: 5 }} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Grid>
            </Grid>
        </Box>
    );
}