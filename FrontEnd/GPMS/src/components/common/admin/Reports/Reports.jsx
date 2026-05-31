import { useEffect, useState } from "react";
import {
    Box, Paper, Typography, Stack, Button, CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
    ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { getAllUsers, getAllRequests } from "../../../../api/handler/endpoints/adminApi";

// ── ChartCard wrapper ─────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, loading }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    return (
        <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
            <Box mb={2.5}>
                <Typography variant="h4" sx={{ color: t.textPrimary }}>{title}</Typography>
                {subtitle && (
                    <Typography sx={{ fontSize: "0.78rem", color: t.textTertiary, mt: 0.3 }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                    <CircularProgress size={24} sx={{ color: t.accentPrimary }} />
                </Box>
            ) : children}
        </Paper>
    );
}

// ── helpers ───────────────────────────────────────────────────────────────────
const ROLE_COLORS = {
    Student:    "#B46F4C",
    Supervisor: "#6D8A7D",
    Admin:      "#C47E7E",
};

const DEPT_COLORS = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8", "#C47E7E"];

// group requests by month label e.g. "Apr 26"
function groupByMonth(requests) {
    const map = {};
    requests.forEach((r) => {
        const d = new Date(r.requestedAt);
        const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        map[key] = (map[key] ?? 0) + 1;
    });
    // sort chronologically
    return Object.entries(map)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => {
            const parse = (s) => new Date(`1 ${s}`);
            return parse(a.month) - parse(b.month);
        });
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Reports() {
    const theme = useTheme();
    const t = theme.palette.custom;

    const [users,        setUsers]        = useState([]);
    const [requests,     setRequests]     = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingReqs,  setLoadingReqs]  = useState(true);

    useEffect(() => {
        getAllUsers()
            .then((r) => setUsers(r.data ?? []))
            .catch(() => setUsers([]))
            .finally(() => setLoadingUsers(false));

        getAllRequests()
            .then((r) => setRequests(r.data ?? []))
            .catch(() => setRequests([]))
            .finally(() => setLoadingReqs(false));
    }, []);

    // ── derived data ──────────────────────────────────────────────────────────

    // 1. Users by role — pie
    const roleMap = {};
    users.forEach((u) => { roleMap[u.role] = (roleMap[u.role] ?? 0) + 1; });
    const roleData = Object.entries(roleMap).map(([name, value]) => ({
        name, value, color: ROLE_COLORS[name] ?? "#aaa",
    }));

    // 2. Students by department — bar
    const deptMap = {};
    users.filter((u) => u.role === "Student" && u.department).forEach((u) => {
        deptMap[u.department] = (deptMap[u.department] ?? 0) + 1;
    });
    const deptData = Object.entries(deptMap)
        .map(([dept, count], i) => ({ dept, count, color: DEPT_COLORS[i % DEPT_COLORS.length] }))
        .sort((a, b) => b.count - a.count);

    // 3. Requests over time — line
    const requestsOverTime = groupByMonth(requests);

    const tooltipStyle = {
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${t.borderLight}`,
        borderRadius: 8,
        fontSize: 12,
        color: t.textPrimary,
    };

    const totalUsers      = users.length;
    const totalStudents   = users.filter((u) => u.role === "Student").length;
    const totalSupervisors = users.filter((u) => u.role === "Supervisor").length;
    const totalRequests   = requests.length;
    const approvedCount   = requests.filter((r) => r.status === "Approved").length;

    return (
        <Box sx={{ maxWidth: 1100 }}>
            {/* Header */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                mb={3} gap={2}
            >
                <Box>
                    <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>
                        Reports & Analytics
                    </Typography>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                        {totalUsers} users · {totalRequests} total requests · {approvedCount} approved
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<DownloadOutlinedIcon />}
                    onClick={() => window.print()}
                    sx={{
                        borderColor: t.borderLight, color: t.textSecondary,
                        "&:hover": { borderColor: t.accentPrimary, color: t.accentPrimary },
                    }}
                >
                    Export PDF
                </Button>
            </Stack>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>

                {/* ── Chart 1: Users by Role (Pie) ── */}
                <ChartCard
                    title="Users by Role"
                    subtitle={`${totalUsers} registered users`}
                    loading={loadingUsers}
                >
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie
                                data={roleData}
                                cx="50%" cy="50%"
                                innerRadius={55} outerRadius={80}
                                paddingAngle={3} dataKey="value"
                            >
                                {roleData.map((entry) => (
                                    <Cell key={entry.name} fill={entry.color} />
                                ))}
                            </Pie>
                            <RTooltip contentStyle={tooltipStyle} />
                        </PieChart>
                    </ResponsiveContainer>
                    <Stack spacing={0.8} mt={1}>
                        {roleData.map((d) => (
                            <Stack key={d.name} direction="row" alignItems="center" justifyContent="space-between">
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: d.color }} />
                                    <Typography sx={{ fontSize: "0.8rem", color: t.textSecondary }}>{d.name}</Typography>
                                </Stack>
                                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: t.textPrimary }}>
                                    {d.value}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                </ChartCard>

                {/* ── Chart 2: Students by Department (Bar) ── */}
                <ChartCard
                    title="Students by Department"
                    subtitle={`${totalStudents} students across ${deptData.length} departments`}
                    loading={loadingUsers}
                >
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={deptData} barSize={18} layout="vertical" margin={{ left: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight} horizontal={false} />
                            <XAxis
                                type="number"
                                tick={{ fontSize: 11, fill: t.textTertiary }}
                                axisLine={false} tickLine={false}
                            />
                            <YAxis
                                type="category" dataKey="dept" width={140}
                                tick={{ fontSize: 11, fill: t.textTertiary }}
                                axisLine={false} tickLine={false}
                            />
                            <RTooltip
                                contentStyle={tooltipStyle}
                                cursor={{ fill: `${t.accentPrimary}08` }}
                            />
                            <Bar dataKey="count" name="Students" radius={[0, 4, 4, 0]}>
                                {deptData.map((entry, i) => (
                                    <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* ── Chart 3: Requests Over Time (Line) — full width ── */}
                <Box sx={{ gridColumn: { xs: "1", md: "1 / 3" } }}>
                    <ChartCard
                        title="Registration Requests Over Time"
                        subtitle={`${totalRequests} total · ${approvedCount} approved · ${totalRequests - approvedCount} other`}
                        loading={loadingReqs}
                    >
                        {requestsOverTime.length < 2 ? (
                            <Box display="flex" justifyContent="center" alignItems="center" height={180}>
                                <Typography fontSize="0.85rem" sx={{ color: t.textTertiary }}>
                                    Not enough data to plot a trend yet.
                                </Typography>
                            </Box>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={requestsOverTime}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight} vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 12, fill: t.textTertiary }}
                                        axisLine={false} tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12, fill: t.textTertiary }}
                                        axisLine={false} tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <RTooltip contentStyle={tooltipStyle} />
                                    <Legend
                                        iconType="circle" iconSize={8}
                                        wrapperStyle={{ fontSize: 12, color: t.textSecondary }}
                                    />
                                    <Line
                                        type="monotone" dataKey="count" name="Requests"
                                        stroke={t.accentPrimary} strokeWidth={2.5}
                                        dot={{ r: 4, fill: t.accentPrimary }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>
                </Box>

            </Box>
        </Box>
    );
}