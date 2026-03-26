// ─────────────────────────────────────────────────────────────────────────────
// TeamFinder.jsx
// يعرض الطلاب المتاحين من GET /api/Student/available-students
// ويتيح للطالب إرسال دعوة عبر POST /api/Student/send-invitation
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
    Box, Paper, Typography, Stack, Avatar, Chip, Button,
    TextField, InputAdornment, LinearProgress,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Grid, CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import studentApi from "../../../../api/handler/endpoints/studentApi";

// ── ألوان مهارات ──────────────────────────────────────────────────────────
const SKILL_COLORS = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8", "#C47E7E"];
const DEPT_CLR = { CS: "#B46F4C", CE: "#7E9FC4", EE: "#6D8A7D" };

// ── مساعد: بيجيب الـ id من الطالب بغض النظر عن اسم الحقل ─────────────────
const getId = (s) => s?.id ?? s?.userId ?? s?._id ?? null;

export default function TeamFinder() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const t = theme.palette.custom;

    // ── State ─────────────────────────────────────────────────────────────────
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [invited, setInvited] = useState([]);   // IDs اللي اتبعتلهم دعوة
    const [inviting, setInviting] = useState(null); // ID اللي جاري إرسال دعوة له
    const [selected, setSelected] = useState(null); // للـ profile dialog
    const [profileOpen, setProfileOpen] = useState(false);
    const [error, setError] = useState("");

    // ── جلب الطلاب المتاحين من الـ backend ────────────────────────────────────
    useEffect(() => {
        setLoading(true);
        studentApi.getAvailableStudents()
            .then((data) => setStudents(Array.isArray(data) ? data : []))
            .catch(() => setError("Failed to load available students"))
            .finally(() => setLoading(false));
    }, []);

    // ── فلترة الطلاب حسب البحث ───────────────────────────────────────────────
    const filtered = students.filter((s) => {
        const q = search.toLowerCase();
        const name = (s.fullName ?? s.name ?? s.username ?? "").toLowerCase();
        const dept = (s.department ?? s.dept ?? "").toLowerCase();
        const skls = (s.skills ?? []).map((sk) => sk.toLowerCase());
        return name.includes(q) || dept.includes(q) || skls.some((sk) => sk.includes(q));
    });

    // ── إرسال دعوة ────────────────────────────────────────────────────────────
    const handleInvite = async (studentId) => {
        if (invited.includes(studentId)) return;   // مدعو مسبقاً
        setInviting(studentId);
        setError("");
        try {
            await studentApi.sendInvitation(studentId);
            setInvited((p) => [...p, studentId]);  // أضفه لقائمة المدعوين
        } catch (e) {
            setError(e?.response?.data?.message ?? "Failed to send invitation");
        } finally {
            setInviting(null);
        }
    };

    const openProfile = (s) => { setSelected(s); setProfileOpen(true); };

    /* ── Design tokens ────────────────────────────────────────────────── */
    const accent = "#d0895b";
    const a10 = isDark ? "rgba(208,137,91,0.10)" : "rgba(208,137,91,0.07)";
    const a22 = "rgba(208,137,91,0.22)";

    return (
        <Box sx={{ maxWidth: 1000 }}>

            {/* ── Header ───────────────────────────────────────────────────── */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>Team Finder</Typography>
                <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                    Find teammates by skill ·{" "}
                    {loading ? "Loading…" : `${filtered.length} students available`}
                </Typography>
            </Box>

            {/* ── خطأ ──────────────────────────────────────────────────────── */}
            {error && (
                <Typography fontSize="0.82rem" sx={{ color: "error.main", mb: 2 }}>{error}</Typography>
            )}

            {/* ── Pending Invites banner ───────────────────────────────────── */}
            {invited.length > 0 && (
                <Paper elevation={1} sx={{
                    p: 2, borderRadius: 3,
                    bgcolor: `${t.accentPrimary}08`,
                    border: `1px solid ${t.accentPrimary}30`, mb: 2.5,
                }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" gap={1.5}>
                            <GroupsOutlinedIcon sx={{ color: t.accentPrimary, fontSize: 20 }} />
                            <Typography sx={{ fontWeight: 600, color: t.textPrimary }}>
                                Pending Invites ({invited.length})
                            </Typography>
                        </Stack>
                        <Stack direction="row" gap={0.8}>
                            {invited.map((id) => {
                                const s = students.find((st) => getId(st) === id);
                                const name = s?.fullName ?? s?.name ?? s?.username ?? "Student";
                                return (
                                    <Chip key={id} label={name.split(" ")[0]} size="small" sx={{
                                        bgcolor: `${t.accentPrimary}18`,
                                        color: t.accentPrimary,
                                        fontWeight: 600, fontSize: "0.72rem",
                                    }} />
                                );
                            })}
                        </Stack>
                    </Stack>
                </Paper>
            )}

            {/* ── Search ───────────────────────────────────────────────────── */}
            <TextField
                fullWidth
                placeholder="Search by name, skill, or department…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                sx={{ mb: 2.5 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ fontSize: 17, color: t.textTertiary }} />
                        </InputAdornment>
                    ),
                }}
            />

            {/* ── Loading ───────────────────────────────────────────────────── */}
            {loading ? (
                <Box display="flex" justifyContent="center" py={6}>
                    <CircularProgress size={32} sx={{ color: accent }} />
                </Box>

                /* ── Empty state ─────────────────────────────────────────────── */
            ) : filtered.length === 0 ? (
                <Box textAlign="center" py={6}>
                    <Box sx={{
                        width: 52, height: 52, borderRadius: 3, mx: "auto", mb: 1.5,
                        bgcolor: a10, border: `1px solid ${a22}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <PersonOffOutlinedIcon sx={{ fontSize: 24, color: accent }} />
                    </Box>
                    <Typography fontWeight={600} sx={{ color: t.textPrimary }}>No students found</Typography>
                    <Typography fontSize="0.82rem" sx={{ color: t.textSecondary, mt: 0.5 }}>
                        {search ? "Try a different search term" : "No available students at the moment"}
                    </Typography>
                </Box>

                /* ── Student cards ───────────────────────────────────────────── */
            ) : (
                <Grid container spacing={2}>
                    {filtered.map((s) => {
                        const sid = getId(s);
                        const isInvited = invited.includes(sid);
                        const isLoading = inviting === sid;
                        const name = s.fullName ?? s.name ?? s.username ?? "Student";
                        const dept = s.department ?? s.dept ?? "";
                        const skills = s.skills ?? [];
                        // match% — الـ backend ممكن يبعته أو نحسبه locally
                        const match = s.matchPercentage ?? s.match ?? null;

                        return (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={sid}>
                                <Paper
                                    elevation={1}
                                    onClick={() => openProfile(s)}
                                    sx={{
                                        p: 2, borderRadius: 3,
                                        bgcolor: theme.palette.background.paper,
                                        border: isInvited
                                            ? `2px solid ${t.accentPrimary}`
                                            : `1px solid ${t.borderLight}`,
                                        transition: "all 0.2s", cursor: "pointer",
                                        "&:hover": { transform: "translateY(-2px)", boxShadow: t.shadowMd },
                                    }}
                                >
                                    <Stack alignItems="center" spacing={1.5}>

                                        {/* الأفاتار */}
                                        <Box sx={{ position: "relative" }}>
                                            <Avatar sx={{
                                                width: 52, height: 52,
                                                bgcolor: DEPT_CLR[dept] ?? t.accentPrimary,
                                                fontSize: "1.1rem", fontWeight: 700,
                                            }}>
                                                {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                            </Avatar>
                                            {isInvited && (
                                                <CheckCircleOutlineIcon sx={{
                                                    position: "absolute", bottom: -4, right: -4,
                                                    fontSize: 18, color: t.accentPrimary,
                                                    bgcolor: theme.palette.background.paper,
                                                    borderRadius: "50%",
                                                }} />
                                            )}
                                        </Box>

                                        {/* الاسم والقسم */}
                                        <Box sx={{ textAlign: "center" }}>
                                            <Typography sx={{ fontWeight: 700, color: t.textPrimary }}>{name}</Typography>
                                            <Stack direction="row" justifyContent="center" gap={0.8} mt={0.3}>
                                                {dept && (
                                                    <Chip label={dept} size="small" sx={{
                                                        bgcolor: `${DEPT_CLR[dept] ?? t.accentPrimary}15`,
                                                        color: DEPT_CLR[dept] ?? t.accentPrimary,
                                                        fontSize: "0.68rem", height: 20,
                                                    }} />
                                                )}
                                                {s.year && (
                                                    <Chip label={s.year} size="small" sx={{
                                                        bgcolor: t.surfaceHover, color: t.textTertiary,
                                                        fontSize: "0.68rem", height: 20,
                                                    }} />
                                                )}
                                            </Stack>
                                        </Box>

                                        {/* Match % — يظهر فقط لو الـ backend بعته */}
                                        {match !== null && (
                                            <Box sx={{ width: "100%" }}>
                                                <Stack direction="row" justifyContent="space-between" mb={0.4}>
                                                    <Typography sx={{ fontSize: "0.7rem", color: t.textTertiary }}>Match</Typography>
                                                    <Typography sx={{
                                                        fontSize: "0.7rem", fontWeight: 700,
                                                        color: match >= 85 ? t.success : t.accentTertiary,
                                                    }}>{match}%</Typography>
                                                </Stack>
                                                <LinearProgress variant="determinate" value={match} sx={{
                                                    bgcolor: t.borderLight,
                                                    "& .MuiLinearProgress-bar": {
                                                        bgcolor: match >= 85 ? t.success : t.accentTertiary,
                                                    },
                                                }} />
                                            </Box>
                                        )}

                                        {/* Skills */}
                                        {skills.length > 0 && (
                                            <Stack direction="row" flexWrap="wrap" gap={0.5} justifyContent="center">
                                                {skills.slice(0, 3).map((sk, j) => (
                                                    <Chip key={sk} label={sk} size="small" sx={{
                                                        bgcolor: `${SKILL_COLORS[j % SKILL_COLORS.length]}15`,
                                                        color: SKILL_COLORS[j % SKILL_COLORS.length],
                                                        fontSize: "0.65rem", fontWeight: 500, height: 20,
                                                    }} />
                                                ))}
                                                {skills.length > 3 && (
                                                    <Chip label={`+${skills.length - 3}`} size="small" sx={{
                                                        bgcolor: t.surfaceHover, color: t.textTertiary,
                                                        fontSize: "0.65rem", height: 20,
                                                    }} />
                                                )}
                                            </Stack>
                                        )}

                                        {/* زر الدعوة */}
                                        <Button
                                            fullWidth size="small"
                                            variant={isInvited ? "contained" : "outlined"}
                                            startIcon={
                                                isLoading ? null :
                                                    isInvited
                                                        ? <CheckCircleOutlineIcon sx={{ fontSize: 15 }} />
                                                        : <PersonAddOutlinedIcon sx={{ fontSize: 15 }} />
                                            }
                                            disabled={isLoading || isInvited}
                                            onClick={(e) => { e.stopPropagation(); handleInvite(sid); }}
                                            sx={{
                                                fontSize: "0.78rem", fontWeight: 600,
                                                bgcolor: isInvited ? t.accentPrimary : "transparent",
                                                borderColor: isInvited ? t.accentPrimary : t.borderLight,
                                                color: isInvited ? "#fff" : t.accentPrimary,
                                                "&:hover": {
                                                    bgcolor: isInvited ? "#be7a4f" : `${t.accentPrimary}10`,
                                                    borderColor: t.accentPrimary,
                                                },
                                                "&.Mui-disabled": { opacity: 0.6 },
                                            }}
                                        >
                                            {isLoading
                                                ? <CircularProgress size={14} sx={{ color: accent }} />
                                                : isInvited ? "Invited ✓" : "Invite"
                                            }
                                        </Button>
                                    </Stack>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* ── Profile Dialog ────────────────────────────────────────────── */}
            {selected && (
                <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth="xs" fullWidth>
                    <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
                        <Avatar sx={{
                            width: 60, height: 60,
                            bgcolor: DEPT_CLR[selected.department ?? selected.dept] ?? t.accentPrimary,
                            fontSize: "1.2rem", fontWeight: 700, mx: "auto", mb: 1,
                        }}>
                            {(selected.fullName ?? selected.name ?? "S").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </Avatar>
                        <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", color: t.textPrimary }}>
                            {selected.fullName ?? selected.name ?? selected.username}
                        </Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: t.textSecondary }}>
                            {selected.department ?? selected.dept}{selected.year ? ` · ${selected.year}` : ""}
                        </Typography>
                    </DialogTitle>

                    <DialogContent>
                        {/* Match % */}
                        {(selected.matchPercentage ?? selected.match) && (
                            <Box sx={{
                                p: 1.5, borderRadius: 2,
                                bgcolor: `${t.success}10`, border: `1px solid ${t.success}30`,
                                textAlign: "center", mb: 2,
                            }}>
                                <Typography sx={{ fontSize: "1.4rem", fontWeight: 700, color: t.success }}>
                                    {selected.matchPercentage ?? selected.match}%
                                </Typography>
                                <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>Team Match</Typography>
                            </Box>
                        )}

                        {/* Bio */}
                        {selected.bio && (
                            <Typography fontSize="0.83rem" sx={{ color: t.textSecondary, mb: 2, lineHeight: 1.7 }}>
                                {selected.bio}
                            </Typography>
                        )}

                        {/* Skills */}
                        {(selected.skills ?? []).length > 0 && (
                            <>
                                <Typography sx={{
                                    fontSize: "0.72rem", fontWeight: 700, color: t.textTertiary,
                                    textTransform: "uppercase", letterSpacing: "0.07em", mb: 1,
                                }}>Skills</Typography>
                                <Stack direction="row" flexWrap="wrap" gap={0.8}>
                                    {selected.skills.map((sk, j) => (
                                        <Chip key={sk} label={sk} size="small" sx={{
                                            bgcolor: `${SKILL_COLORS[j % SKILL_COLORS.length]}15`,
                                            color: SKILL_COLORS[j % SKILL_COLORS.length],
                                            fontWeight: 500,
                                        }} />
                                    ))}
                                </Stack>
                            </>
                        )}
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 2.5 }}>
                        <Button onClick={() => setProfileOpen(false)} sx={{ color: t.textSecondary }}>Close</Button>
                        <Button
                            variant="contained"
                            disabled={invited.includes(getId(selected)) || inviting === getId(selected)}
                            onClick={() => { handleInvite(getId(selected)); setProfileOpen(false); }}
                            sx={{ bgcolor: t.accentPrimary, "&:hover": { bgcolor: "#be7a4f" } }}
                        >
                            {invited.includes(getId(selected)) ? "Invited ✓" : "Send Invite"}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
}