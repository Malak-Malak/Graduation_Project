import { useState } from "react";
import {
    Box, Paper, Typography, Stack, Avatar, Chip, Button, TextField, InputAdornment,
    LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions, Grid,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

const STUDENTS = [
    { id: 1, name: "Jordan Smith", dept: "CS", year: "4th", skills: ["Research", "Analysis", "ML"], match: 94, status: "available" },
    { id: 2, name: "Alex Rivera", dept: "CS", year: "4th", skills: ["UI/UX", "Frontend", "Figma"], match: 91, status: "available" },
    { id: 3, name: "Lina Khalil", dept: "CS", year: "4th", skills: ["Backend", "Node.js", "SQL"], match: 88, status: "available" },
    { id: 4, name: "Noor Ahmad", dept: "CE", year: "4th", skills: ["IoT", "Embedded", "C++"], match: 76, status: "available" },
    { id: 5, name: "Tariq Hassan", dept: "CS", year: "4th", skills: ["Security", "Networks", "Python"], match: 85, status: "available" },
    { id: 6, name: "Rima Saleh", dept: "CS", year: "4th", skills: ["Testing", "QA", "Automation"], match: 79, status: "in-team" },
    { id: 7, name: "Khalid Nour", dept: "EE", year: "3rd", skills: ["Signals", "MATLAB", "Hardware"], match: 65, status: "available" },
    { id: 8, name: "Farah Nimer", dept: "CS", year: "4th", skills: ["DevOps", "Docker", "CI/CD"], match: 83, status: "available" },
];

const SKILL_COLORS = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8", "#C47E7E"];
const DEPT_CLR = { CS: "#B46F4C", CE: "#7E9FC4", EE: "#6D8A7D" };

export default function TeamFinder() {
    const theme = useTheme();
    const t = theme.palette.custom;

    const [search, setSearch] = useState("");
    const [invited, setInvited] = useState([]);
    const [selected, setSelected] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);

    const filtered = STUDENTS.filter((s) => {
        const q = search.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.skills.some((sk) => sk.toLowerCase().includes(q)) || s.dept.toLowerCase().includes(q);
    });

    const handleInvite = (id) => setInvited((p) => p.includes(id) ? p : [...p, id]);
    const openProfile = (s) => { setSelected(s); setProfileOpen(true); };

    return (
        <Box sx={{ maxWidth: 1000 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>Team Finder</Typography>
                <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                    Find teammates by skill · {STUDENTS.filter((s) => s.status === "available").length} students available
                </Typography>
            </Box>

            {/* Current team box */}
            {invited.length > 0 && (
                <Paper elevation={1} sx={{ p: 2, borderRadius: 3, bgcolor: `${t.accentPrimary}08`, border: `1px solid ${t.accentPrimary}30`, mb: 2.5 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" gap={1.5}>
                            <GroupsOutlinedIcon sx={{ color: t.accentPrimary, fontSize: 20 }} />
                            <Typography sx={{ fontWeight: 600, color: t.textPrimary }}>
                                Pending Invites ({invited.length})
                            </Typography>
                        </Stack>
                        <Stack direction="row" gap={0.8}>
                            {invited.map((id) => {
                                const s = STUDENTS.find((st) => st.id === id);
                                return s ? (
                                    <Chip key={id} label={s.name.split(" ")[0]} size="small"
                                        sx={{ bgcolor: `${t.accentPrimary}18`, color: t.accentPrimary, fontWeight: 600, fontSize: "0.72rem" }} />
                                ) : null;
                            })}
                        </Stack>
                    </Stack>
                </Paper>
            )}

            {/* Search */}
            <TextField fullWidth placeholder="Search by name, skill, or department…" value={search}
                onChange={(e) => setSearch(e.target.value)} size="small" sx={{ mb: 2.5 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: t.textTertiary }} /></InputAdornment> }} />

            {/* Cards */}
            <Grid container spacing={2}>
                {filtered.map((s) => {
                    const isInvited = invited.includes(s.id);
                    const isInTeam = s.status === "in-team";
                    return (
                        <Grid item xs={12} sm={6} md={4} key={s.id}>
                            <Paper elevation={1}
                                sx={{
                                    p: 2, borderRadius: 3, bgcolor: theme.palette.background.paper,
                                    opacity: isInTeam ? 0.6 : 1,
                                    border: isInvited ? `2px solid ${t.accentPrimary}` : `1px solid ${t.borderLight}`,
                                    transition: "all 0.2s",
                                    "&:hover": !isInTeam ? { transform: "translateY(-2px)", boxShadow: t.shadowMd } : {},
                                    cursor: isInTeam ? "default" : "pointer",
                                }}
                                onClick={() => !isInTeam && openProfile(s)}
                            >
                                <Stack alignItems="center" spacing={1.5}>
                                    <Box sx={{ position: "relative" }}>
                                        <Avatar sx={{ width: 52, height: 52, bgcolor: DEPT_CLR[s.dept] ?? t.accentPrimary, fontSize: "1.1rem", fontWeight: 700 }}>
                                            {s.name.split(" ").map((n) => n[0]).join("")}
                                        </Avatar>
                                        {isInvited && (
                                            <CheckCircleOutlineIcon sx={{ position: "absolute", bottom: -4, right: -4, fontSize: 18, color: t.accentPrimary, bgcolor: theme.palette.background.paper, borderRadius: "50%" }} />
                                        )}
                                    </Box>
                                    <Box sx={{ textAlign: "center" }}>
                                        <Typography sx={{ fontWeight: 700, color: t.textPrimary }}>{s.name}</Typography>
                                        <Stack direction="row" justifyContent="center" gap={0.8} mt={0.3}>
                                            <Chip label={s.dept} size="small"
                                                sx={{ bgcolor: `${DEPT_CLR[s.dept] ?? t.accentPrimary}15`, color: DEPT_CLR[s.dept] ?? t.accentPrimary, fontSize: "0.68rem", height: 20 }} />
                                            <Chip label={s.year} size="small"
                                                sx={{ bgcolor: t.surfaceHover, color: t.textTertiary, fontSize: "0.68rem", height: 20 }} />
                                        </Stack>
                                    </Box>

                                    {/* Match */}
                                    <Box sx={{ width: "100%" }}>
                                        <Stack direction="row" justifyContent="space-between" mb={0.4}>
                                            <Typography sx={{ fontSize: "0.7rem", color: t.textTertiary }}>Match</Typography>
                                            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: s.match >= 85 ? t.success : t.accentTertiary }}>{s.match}%</Typography>
                                        </Stack>
                                        <LinearProgress variant="determinate" value={s.match}
                                            sx={{ bgcolor: t.borderLight, "& .MuiLinearProgress-bar": { bgcolor: s.match >= 85 ? t.success : t.accentTertiary } }} />
                                    </Box>

                                    {/* Skills */}
                                    <Stack direction="row" flexWrap="wrap" gap={0.5} justifyContent="center">
                                        {s.skills.slice(0, 3).map((sk, j) => (
                                            <Chip key={sk} label={sk} size="small"
                                                sx={{ bgcolor: `${SKILL_COLORS[j]}15`, color: SKILL_COLORS[j], fontSize: "0.65rem", fontWeight: 500, height: 20 }} />
                                        ))}
                                    </Stack>

                                    {isInTeam ? (
                                        <Chip label="Already in a team" size="small" sx={{ bgcolor: t.surfaceHover, color: t.textTertiary, fontSize: "0.72rem" }} />
                                    ) : (
                                        <Button fullWidth size="small" variant={isInvited ? "contained" : "outlined"}
                                            startIcon={isInvited ? <CheckCircleOutlineIcon sx={{ fontSize: 15 }} /> : <PersonAddOutlinedIcon sx={{ fontSize: 15 }} />}
                                            onClick={(e) => { e.stopPropagation(); handleInvite(s.id); }}
                                            sx={{
                                                fontSize: "0.78rem", fontWeight: 600,
                                                bgcolor: isInvited ? t.accentPrimary : "transparent",
                                                borderColor: isInvited ? t.accentPrimary : t.borderLight,
                                                color: isInvited ? "#fff" : t.accentPrimary,
                                                "&:hover": { bgcolor: isInvited ? theme.palette.primary.dark : `${t.accentPrimary}10`, borderColor: t.accentPrimary },
                                            }}
                                        >
                                            {isInvited ? "Invited" : "Invite"}
                                        </Button>
                                    )}
                                </Stack>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Profile dialog */}
            {selected && (
                <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth="xs" fullWidth>
                    <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
                        <Avatar sx={{ width: 60, height: 60, bgcolor: DEPT_CLR[selected.dept], fontSize: "1.2rem", fontWeight: 700, mx: "auto", mb: 1 }}>
                            {selected.name.split(" ").map((n) => n[0]).join("")}
                        </Avatar>
                        <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", color: t.textPrimary }}>{selected.name}</Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: t.textSecondary }}>{selected.dept} · {selected.year} Year</Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${t.success}10`, border: `1px solid ${t.success}30`, textAlign: "center", mb: 2 }}>
                            <Typography sx={{ fontSize: "1.4rem", fontWeight: 700, color: t.success }}>{selected.match}%</Typography>
                            <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>Team Match</Typography>
                        </Box>
                        <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: t.textTertiary, textTransform: "uppercase", letterSpacing: "0.07em", mb: 1 }}>Skills</Typography>
                        <Stack direction="row" flexWrap="wrap" gap={0.8}>
                            {selected.skills.map((sk, j) => (
                                <Chip key={sk} label={sk} size="small"
                                    sx={{ bgcolor: `${SKILL_COLORS[j % SKILL_COLORS.length]}15`, color: SKILL_COLORS[j % SKILL_COLORS.length], fontWeight: 500 }} />
                            ))}
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2.5 }}>
                        <Button onClick={() => setProfileOpen(false)} sx={{ color: t.textSecondary }}>Close</Button>
                        <Button variant="contained" onClick={() => { handleInvite(selected.id); setProfileOpen(false); }}
                            disabled={invited.includes(selected.id)}
                            sx={{ bgcolor: t.accentPrimary }}>
                            {invited.includes(selected.id) ? "Invited ✓" : "Send Invite"}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
}