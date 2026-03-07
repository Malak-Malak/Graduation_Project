import { useState } from "react";
import {
    Box, Paper, Typography, Stack, Chip, Button, Switch, Grid, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

const AVAILABILITY = [
    { day: "Monday", slots: ["9:00-10:00", "10:00-11:00", "2:00-3:00"] },
    { day: "Tuesday", slots: [] },
    { day: "Wednesday", slots: ["9:00-10:00", "1:00-2:00"] },
    { day: "Thursday", slots: ["11:00-12:00"] },
    { day: "Sunday", slots: ["10:00-11:00", "2:00-3:00"] },
];

const REQUESTS = [
    { id: 1, student: "Aya Abu Ghozeh", team: "EcoTrackers", topic: "Database Design Review", slot: "Monday, 10:00-11:00", status: "pending" },
    { id: 2, student: "Omar Jawad", team: "CodeCraft", topic: "Progress Update", slot: "Wednesday, 9:00-10:00", status: "pending" },
    { id: 3, student: "Yara Hassan", team: "InnovateX", topic: "Final Review Meeting", slot: "Thursday, 11:00-12:00", status: "confirmed" },
    { id: 4, student: "Daoud Issa", team: "SmartCampus", topic: "Proposal Discussion", slot: "Sunday, 2:00-3:00", status: "confirmed" },
];

const STATUS_CLR = { pending: "#C49A6C", confirmed: "#6D8A7D", cancelled: "#C47E7E" };

export default function SupervisorMeetings() {
    const theme = useTheme();
    const t = theme.palette.custom;

    const [requests, setRequests] = useState(REQUESTS);
    const [availability, setAvail] = useState(
        AVAILABILITY.reduce((acc, d) => ({ ...acc, [d.day]: true }), {})
    );

    const handle = (id, status) =>
        setRequests((p) => p.map((r) => r.id === id ? { ...r, status } : r));

    const pending = requests.filter((r) => r.status === "pending");
    const confirmed = requests.filter((r) => r.status === "confirmed");

    return (
        <Box sx={{ maxWidth: 960 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>Meetings</Typography>
                <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                    {pending.length} pending · {confirmed.length} confirmed this week
                </Typography>
            </Box>

            <Grid container spacing={2}>
                {/* Requests */}
                <Grid item xs={12} lg={7}>
                    <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper, mb: 2 }}>
                        <Typography variant="h4" sx={{ color: t.textPrimary, mb: 2 }}>Meeting Requests</Typography>
                        <Stack spacing={1.5}>
                            {pending.map((r) => (
                                <Box key={r.id} sx={{
                                    p: 1.8, borderRadius: 2.5, border: `1px solid ${t.borderLight}`,
                                    borderLeft: `3px solid ${t.accentTertiary}`
                                }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Box>
                                            <Typography sx={{ fontWeight: 600, color: t.textPrimary }}>{r.topic}</Typography>
                                            <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, mt: 0.2 }}>
                                                {r.student} · {r.team}
                                            </Typography>
                                            <Stack direction="row" alignItems="center" gap={0.8} mt={0.8}>
                                                <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: t.textTertiary }} />
                                                <Typography sx={{ fontSize: "0.78rem", color: t.textTertiary }}>{r.slot}</Typography>
                                            </Stack>
                                        </Box>
                                        <Stack direction="row" gap={0.8}>
                                            <Button size="small" variant="contained" onClick={() => handle(r.id, "confirmed")}
                                                startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 14 }} />}
                                                sx={{ bgcolor: t.success, fontSize: "0.75rem", py: 0.5, px: 1.2 }}>
                                                Confirm
                                            </Button>
                                            <Button size="small" variant="outlined" onClick={() => handle(r.id, "cancelled")}
                                                sx={{ borderColor: t.error, color: t.error, fontSize: "0.75rem", py: 0.5, px: 1.2 }}>
                                                Decline
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Box>
                            ))}
                            {pending.length === 0 && (
                                <Typography sx={{ textAlign: "center", color: t.textTertiary, py: 2 }}>No pending requests.</Typography>
                            )}
                        </Stack>
                    </Paper>

                    {/* Confirmed */}
                    <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                        <Typography variant="h4" sx={{ color: t.textPrimary, mb: 2 }}>Confirmed Meetings</Typography>
                        <Stack spacing={1}>
                            {confirmed.map((r) => (
                                <Stack key={r.id} direction="row" alignItems="center" justifyContent="space-between"
                                    sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${t.borderLight}` }}>
                                    <Box>
                                        <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: t.textPrimary }}>{r.topic}</Typography>
                                        <Typography sx={{ fontSize: "0.72rem", color: t.textSecondary }}>{r.student} · {r.slot}</Typography>
                                    </Box>
                                    <Chip label="Confirmed" size="small" sx={{ bgcolor: `${t.success}18`, color: t.success, fontWeight: 600, fontSize: "0.7rem", height: 22 }} />
                                </Stack>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>

                {/* Availability */}
                <Grid item xs={12} lg={5}>
                    <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                        <Typography variant="h4" sx={{ color: t.textPrimary, mb: 0.5 }}>My Availability</Typography>
                        <Typography sx={{ fontSize: "0.78rem", color: t.textTertiary, mb: 2 }}>
                            Toggle days to show/hide from students
                        </Typography>
                        <Stack spacing={1.5}>
                            {AVAILABILITY.map((d) => (
                                <Box key={d.day}>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.8}>
                                        <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: t.textPrimary }}>{d.day}</Typography>
                                        <Switch size="small" checked={availability[d.day] ?? false}
                                            onChange={(e) => setAvail((p) => ({ ...p, [d.day]: e.target.checked }))} />
                                    </Stack>
                                    {availability[d.day] && d.slots.length > 0 && (
                                        <Stack direction="row" gap={0.8} flexWrap="wrap">
                                            {d.slots.map((s) => (
                                                <Chip key={s} label={s} size="small"
                                                    sx={{ bgcolor: `${t.accentSecondary}15`, color: t.accentSecondary, fontSize: "0.72rem", fontWeight: 500, height: 22 }} />
                                            ))}
                                        </Stack>
                                    )}
                                    {availability[d.day] && d.slots.length === 0 && (
                                        <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>No slots added</Typography>
                                    )}
                                    {!availability[d.day] && (
                                        <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary, fontStyle: "italic" }}>Hidden from students</Typography>
                                    )}
                                    <Divider sx={{ mt: 1.5 }} />
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}