
import { useState, useEffect } from "react";
import {
    Box, Paper, Typography, Stack, Avatar, Chip, Button,
    TextField, InputAdornment, LinearProgress,
    Dialog, DialogContent,
    Grid, CircularProgress, Divider, IconButton, Tooltip, Fade,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import CloseIcon from "@mui/icons-material/Close";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import StarIcon from "@mui/icons-material/Star";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import studentApi from "../../../../api/handler/endpoints/studentApi";
import UserProfileApi from "../../../../api/handler/endpoints/UserProfileApi";

// ══════════════════════════════════════════════════════════════════════
// ثوابت
// ══════════════════════════════════════════════════════════════════════
const SKILL_COLORS = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8", "#C47E7E"];
const DEPT_CLR = { CS: "#B46F4C", CE: "#7E9FC4", EE: "#6D8A7D" };
const ACCENT = "#d0895b";
const A10_LIGHT = "rgba(208,137,91,0.07)";
const A10_DARK = "rgba(208,137,91,0.10)";
const A22 = "rgba(208,137,91,0.22)";

const getId = (s) => s?.id ?? s?.userId ?? s?._id ?? null;

// دالة لاستخراج المهارات من field أو skills
const getSkillsFromStudent = (student, profile) => {
    // الأولوية للبروفايل
    if (profile?.skills?.length) return profile.skills;
    if (profile?.field) {
        return profile.field.split(",").map(s => s.trim()).filter(Boolean);
    }
    // ثم من الطالب نفسه
    if (student?.skills?.length) return student.skills;
    if (student?.field) {
        return student.field.split(",").map(s => s.trim()).filter(Boolean);
    }
    return [];
};

// ══════════════════════════════════════════════════════════════════════
// StudentProfileModal — مودال البروفايل الكامل
// ══════════════════════════════════════════════════════════════════════
function StudentProfileModal({ open, onClose, student, onInvite, isInvited, isInviting }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const [fullProfile, setFullProfile] = useState(null);
    const [profLoading, setProfLoading] = useState(false);

    const a10 = isDark ? A10_DARK : A10_LIGHT;
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const cardBg = theme.palette.background.paper;
    const textPri = theme.palette.text.primary;
    const textSec = theme.palette.text.secondary;

    const sid = getId(student);
    const name = student?.fullName ?? student?.name ?? student?.username ?? "Student";
    const dept = student?.department ?? student?.dept ?? "";
    const match = student?.matchPercentage ?? student?.match ?? null;

    useEffect(() => {
        if (!open || !sid) return;
        setFullProfile(null);
        setProfLoading(true);
        UserProfileApi.getProfileById(sid)
            .then((d) => setFullProfile(normalizeProfile(d)))
            .catch(() => setFullProfile(null))
            .finally(() => setProfLoading(false));
    }, [open, sid]);

    const normalizeProfile = (raw) => {
        if (!raw) return null;
        return {
            fullName: raw.fullName ?? "",
            phoneNumber: raw.phoneNumber ?? "",
            department: raw.department ?? "",
            field: raw.field ?? "",
            github: raw.gitHubLink ?? raw.github ?? "",
            linkedin: raw.linkedinLink ?? raw.linkedin ?? "",
            email: raw.personalEmail ?? raw.email ?? "",
            bio: raw.bio ?? "",
        };
    };

    const skills = getSkillsFromStudent(student, fullProfile);
    const displayDept = fullProfile?.department || dept;
    const displayName = fullProfile?.fullName || name;
    const avatarLetters = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

    const coverGradient = isDark
        ? "linear-gradient(135deg, #2a1f18 0%, #1e1510 100%)"
        : "linear-gradient(135deg, #fdf0e8 0%, #f5e0cc 100%)";

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            TransitionComponent={Fade}
            transitionDuration={300}
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    overflow: "hidden",
                    border: `1px solid ${border}`,
                    bgcolor: cardBg,
                    boxShadow: isDark
                        ? "0 24px 64px rgba(0,0,0,0.6)"
                        : "0 24px 64px rgba(0,0,0,0.12)",
                },
            }}
        >
            <Box sx={{ position: "relative" }}>
                <Box sx={{
                    height: 110,
                    background: coverGradient,
                    position: "relative",
                    overflow: "hidden",
                }}>
                    <Box sx={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `radial-gradient(${ACCENT}30 1px, transparent 1px)`,
                        backgroundSize: "20px 20px",
                        opacity: isDark ? 0.4 : 0.5,
                    }} />
                </Box>

                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        position: "absolute",
                        top: 10,
                        right: 12,
                        bgcolor: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(8px)",
                        border: `1px solid ${border}`,
                        color: textSec,
                        "&:hover": { color: ACCENT },
                    }}
                >
                    <CloseIcon sx={{ fontSize: 15 }} />
                </IconButton>

                <Box sx={{ px: 3, pb: 0 }}>
                    <Stack direction="row" alignItems="flex-end" justifyContent="space-between"
                        sx={{ mt: "-32px", mb: 1.5 }}>
                        <Avatar sx={{
                            width: 70,
                            height: 70,
                            bgcolor: DEPT_CLR[dept] ?? ACCENT,
                            fontSize: "1.5rem",
                            fontWeight: 800,
                            border: `3px solid ${cardBg}`,
                            boxShadow: `0 4px 14px ${A22}`,
                        }}>
                            {avatarLetters}
                        </Avatar>

                        <Stack direction="row" gap={1} pb={0.5}>
                            {fullProfile?.linkedin && (
                                <Tooltip title="LinkedIn">
                                    <IconButton
                                        component="a"
                                        href={fullProfile.linkedin}
                                        target="_blank"
                                        sx={{
                                            bgcolor: isDark ? "rgba(0,119,181,0.15)" : "rgba(0,119,181,0.08)",
                                            border: `1px solid ${isDark ? "rgba(0,119,181,0.3)" : "rgba(0,119,181,0.2)"}`,
                                            "&:hover": {
                                                bgcolor: "#0077B5",
                                                color: "#fff",
                                                transform: "translateY(-2px)",
                                            },
                                            transition: "all 0.2s",
                                            width: 38,
                                            height: 38,
                                        }}
                                    >
                                        <LinkedInIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {fullProfile?.github && (
                                <Tooltip title="GitHub">
                                    <IconButton
                                        component="a"
                                        href={fullProfile.github}
                                        target="_blank"
                                        sx={{
                                            bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                                            border: `1px solid ${border}`,
                                            "&:hover": {
                                                bgcolor: isDark ? "#fff" : "#000",
                                                color: isDark ? "#000" : "#fff",
                                                transform: "translateY(-2px)",
                                            },
                                            transition: "all 0.2s",
                                            width: 38,
                                            height: 38,
                                        }}
                                    >
                                        <GitHubIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Stack>
                    </Stack>

                    <Typography fontWeight={800} fontSize="1.2rem" sx={{ color: textPri, lineHeight: 1.2 }}>
                        {displayName}
                    </Typography>

                    <Stack direction="row" flexWrap="wrap" gap={1.5} mt={0.7}>
                        {fullProfile?.email && (
                            <Stack direction="row" alignItems="center" gap={0.6}>
                                <EmailOutlinedIcon sx={{ fontSize: 13, color: textSec }} />
                                <Typography fontSize="0.75rem" sx={{ color: textSec }}>{fullProfile.email}</Typography>
                            </Stack>
                        )}
                        {fullProfile?.phoneNumber && (
                            <Stack direction="row" alignItems="center" gap={0.6}>
                                <PhoneOutlinedIcon sx={{ fontSize: 13, color: textSec }} />
                                <Typography fontSize="0.75rem" sx={{ color: textSec }}>{fullProfile.phoneNumber}</Typography>
                            </Stack>
                        )}
                    </Stack>

                    {displayDept && (
                        <Box sx={{ mt: 1, mb: 0.5 }}>
                            <Chip
                                icon={<SchoolOutlinedIcon sx={{ fontSize: "12px !important", color: `${ACCENT} !important` }} />}
                                label={displayDept}
                                size="small"
                                sx={{
                                    height: 26,
                                    borderRadius: 1.5,
                                    bgcolor: a10,
                                    color: ACCENT,
                                    fontWeight: 700,
                                    fontSize: "0.72rem",
                                    border: `1px solid ${A22}`,
                                }}
                            />
                        </Box>
                    )}
                </Box>

                <Divider sx={{ borderColor: border, mt: 1.5 }} />
            </Box>

            <DialogContent sx={{ px: 3, py: 2.5, overflowY: "auto" }}>
                {profLoading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress size={28} sx={{ color: ACCENT }} />
                    </Box>
                ) : (
                    <Stack spacing={2.5}>
                        {match !== null && (
                            <Box sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: a10,
                                border: `1px solid ${A22}`,
                                display: "flex",
                                alignItems: "center",
                                gap: 2.5,
                            }}>
                                <Box sx={{ flex: 1 }}>
                                    <Stack direction="row" justifyContent="space-between" mb={0.6}>
                                        <Typography fontSize="0.7rem" sx={{ color: textSec, fontWeight: 500 }}>
                                            Team Compatibility
                                        </Typography>
                                        <Typography fontSize="0.7rem" fontWeight={700} sx={{ color: ACCENT }}>
                                            {match}%
                                        </Typography>
                                    </Stack>
                                    <LinearProgress
                                        variant="determinate"
                                        value={match}
                                        sx={{
                                            height: 6,
                                            borderRadius: 3,
                                            bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                                            "& .MuiLinearProgress-bar": {
                                                bgcolor: match >= 80 ? "#5ba87d" : ACCENT,
                                                borderRadius: 3,
                                            },
                                        }}
                                    />
                                </Box>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    bgcolor: match >= 80 ? "rgba(91,168,125,0.15)" : `${ACCENT}15`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                    <Typography fontWeight={800} fontSize="1.3rem" sx={{ color: match >= 80 ? "#5ba87d" : ACCENT }}>
                                        {match}%
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {fullProfile?.bio && (
                            <Box>
                                <Typography sx={{
                                    fontSize: "0.7rem",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    color: textSec,
                                    mb: 1,
                                }}>
                                    About
                                </Typography>
                                <Typography fontSize="0.85rem" sx={{ color: textPri, lineHeight: 1.7, whiteSpace: "pre-line" }}>
                                    {fullProfile.bio}
                                </Typography>
                            </Box>
                        )}

                        {skills.length > 0 && (
                            <Box>
                                <Typography sx={{
                                    fontSize: "0.7rem",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    color: textSec,
                                    mb: 1.2,
                                }}>
                                    Skills & Expertise ({skills.length})
                                </Typography>
                                <Box sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                                    gap: 1,
                                }}>
                                    {skills.map((sk, j) => (
                                        <Box
                                            key={sk}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.8,
                                                px: 1.2,
                                                py: 0.6,
                                                borderRadius: 2,
                                                bgcolor: `${SKILL_COLORS[j % SKILL_COLORS.length]}0C`,
                                                border: `1px solid ${SKILL_COLORS[j % SKILL_COLORS.length]}25`,
                                            }}
                                        >
                                            <CodeOutlinedIcon sx={{ fontSize: 11, color: SKILL_COLORS[j % SKILL_COLORS.length] }} />
                                            <Typography fontSize="0.7rem" fontWeight={500} sx={{ color: SKILL_COLORS[j % SKILL_COLORS.length] }}>
                                                {sk}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {!profLoading && !fullProfile?.bio && skills.length === 0 && (
                            <Box sx={{
                                textAlign: "center",
                                py: 4,
                                border: `1px dashed ${A22}`,
                                borderRadius: 3,
                                bgcolor: a10,
                            }}>
                                <PersonOutlineIcon sx={{ fontSize: 32, color: ACCENT, opacity: 0.5, mb: 1 }} />
                                <Typography fontSize="0.85rem" sx={{ color: textSec }}>
                                    This student hasn't completed their profile yet.
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                )}
            </DialogContent>

            <Box sx={{
                px: 3,
                py: 2,
                borderTop: `1px solid ${border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 1.5,
            }}>
                <Button onClick={onClose} sx={{ color: textSec, textTransform: "none", fontWeight: 500 }}>
                    Close
                </Button>
                <Button
                    variant="contained"
                    disabled={isInvited || isInviting}
                    startIcon={isInviting ? null : (isInvited ? <CheckCircleOutlineIcon sx={{ fontSize: 16 }} /> : <PersonAddOutlinedIcon sx={{ fontSize: 16 }} />)}
                    onClick={() => { onInvite(sid); onClose(); }}
                    sx={{
                        bgcolor: isInvited ? "#5ba87d" : ACCENT,
                        "&:hover": { bgcolor: isInvited ? "#4e9470" : "#be7a4f" },
                        borderRadius: 2,
                        px: 3.5,
                        py: 0.9,
                        textTransform: "none",
                        fontWeight: 700,
                    }}
                >
                    {isInviting ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : (isInvited ? "Invited ✓" : "Send Invite")}
                </Button>
            </Box>
        </Dialog>
    );
}

// ══════════════════════════════════════════════════════════════════════
// TeamFinder — الصفحة الرئيسية (مع خلفية جذابة وسكيلز دائرية)
// ══════════════════════════════════════════════════════════════════════
export default function TeamFinder() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [invited, setInvited] = useState([]);
    const [inviting, setInviting] = useState(null);
    const [selected, setSelected] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [error, setError] = useState("");
    const [profilesCache, setProfilesCache] = useState({});

    const a10 = isDark ? A10_DARK : A10_LIGHT;
    const textPri = theme.palette.text.primary;
    const textSec = theme.palette.text.secondary;
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";

    useEffect(() => {
        setLoading(true);
        studentApi.getAvailableStudents()
            .then((data) => {
                setStudents(Array.isArray(data) ? data : []);
                // جلب البروفايلات للطلاب
                if (Array.isArray(data)) {
                    data.forEach(async (student) => {
                        const sid = getId(student);
                        if (sid && !profilesCache[sid]) {
                            try {
                                const profile = await UserProfileApi.getProfileById(sid);
                                if (profile) {
                                    setProfilesCache(prev => ({ ...prev, [sid]: profile }));
                                }
                            } catch (e) {
                                console.error("Failed to fetch profile", e);
                            }
                        }
                    });
                }
            })
            .catch(() => setError("Failed to load available students"))
            .finally(() => setLoading(false));
    }, []);

    // دالة لجلب مهارات الطالب
    const getStudentSkills = (student) => {
        const profile = profilesCache[getId(student)];
        if (profile?.field) {
            return profile.field.split(",").map(s => s.trim()).filter(Boolean);
        }
        if (profile?.skills?.length) return profile.skills;
        if (student?.field) {
            return student.field.split(",").map(s => s.trim()).filter(Boolean);
        }
        return student?.skills ?? [];
    };

    const filtered = students.filter((s) => {
        const q = search.toLowerCase();
        const name = (s.fullName ?? s.name ?? s.username ?? "").toLowerCase();
        const dept = (s.department ?? s.dept ?? "").toLowerCase();
        const skills = getStudentSkills(s).map((sk) => sk.toLowerCase());
        return name.includes(q) || dept.includes(q) || skills.some((sk) => sk.includes(q));
    });

    const handleInvite = async (studentId) => {
        if (!studentId || invited.includes(studentId)) return;
        setInviting(studentId);
        setError("");
        try {
            await studentApi.sendInvitation(studentId);
            setInvited((p) => [...p, studentId]);
        } catch (e) {
            setError(e?.response?.data?.message ?? "Failed to send invitation");
        } finally {
            setInviting(null);
        }
    };

    const openProfile = (s) => { setSelected(s); setProfileOpen(true); };

    return (
        <Box sx={{
            minHeight: "100vh",
            background: isDark
                ? "radial-gradient(ellipse at 20% 30%, #1a1a1a 0%, #0f0f0f 100%)"
                : "radial-gradient(ellipse at 20% 30%, #fefaf5 0%, #f5f0ea 100%)",
            py: 4,
        }}>
            <Box sx={{ maxWidth: 1300, mx: "auto", px: { xs: 2, sm: 3, md: 4 } }}>
                {/* Header */}
                <Box sx={{ mb: 4, textAlign: "center" }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 800,
                            background: `linear-gradient(135deg, ${ACCENT} 0%, #c9a57b 100%)`,
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            color: "transparent",
                            mb: 0.5,
                            letterSpacing: "-0.5px",
                        }}
                    >
                        Student Hub
                    </Typography>
                    <Typography sx={{ color: textSec, fontSize: "0.9rem" }}>
                        Connect with talented students ·{" "}
                        {loading ? "Loading…" : `${filtered.length} members available`}
                    </Typography>
                </Box>

                {error && (
                    <Typography fontSize="0.82rem" sx={{ color: "error.main", mb: 2, textAlign: "center" }}>
                        {error}
                    </Typography>
                )}

                {/* Pending Invites banner */}
                {invited.length > 0 && (
                    <Fade in>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 1.8,
                                borderRadius: 3,
                                background: `linear-gradient(135deg, ${ACCENT}08 0%, ${ACCENT}15 100%)`,
                                border: `1px solid ${ACCENT}30`,
                                mb: 3,
                            }}
                        >
                            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5}>
                                <Stack direction="row" alignItems="center" gap={1.5}>
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 2,
                                        bgcolor: `${ACCENT}20`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}>
                                        <GroupsOutlinedIcon sx={{ color: ACCENT, fontSize: 18 }} />
                                    </Box>
                                    <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: textPri }}>
                                        Pending Invitations ({invited.length})
                                    </Typography>
                                </Stack>
                                <Stack direction="row" gap={1} flexWrap="wrap">
                                    {invited.map((id) => {
                                        const s = students.find((st) => getId(st) === id);
                                        const name = s?.fullName ?? s?.name ?? s?.username ?? "Student";
                                        return (
                                            <Chip
                                                key={id}
                                                label={name.split(" ")[0]}
                                                size="small"
                                                sx={{
                                                    bgcolor: `${ACCENT}20`,
                                                    color: ACCENT,
                                                    fontWeight: 500,
                                                    fontSize: "0.7rem",
                                                    height: 28,
                                                    borderRadius: 2,
                                                }}
                                            />
                                        );
                                    })}
                                </Stack>
                            </Stack>
                        </Paper>
                    </Fade>
                )}

                {/* Search Bar */}
                <TextField
                    fullWidth
                    placeholder="Search by name, skill, or department..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    size="medium"
                    sx={{ mb: 3.5 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ fontSize: 20, color: textSec }} />
                            </InputAdornment>
                        ),
                        sx: {
                            borderRadius: 3,
                            bgcolor: theme.palette.background.paper,
                            "& fieldset": { borderColor: border },
                        },
                    }}
                />

                {loading ? (
                    <Box display="flex" justifyContent="center" py={10}>
                        <CircularProgress size={44} sx={{ color: ACCENT }} />
                    </Box>
                ) : filtered.length === 0 ? (
                    <Box textAlign="center" py={10}>
                        <Box sx={{
                            width: 70,
                            height: 70,
                            borderRadius: 4,
                            mx: "auto",
                            mb: 2,
                            bgcolor: a10,
                            border: `1px solid ${A22}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                            <PersonOffOutlinedIcon sx={{ fontSize: 32, color: ACCENT }} />
                        </Box>
                        <Typography fontWeight={700} fontSize="1.1rem" sx={{ color: textPri }}>
                            No students found
                        </Typography>
                        <Typography fontSize="0.85rem" sx={{ color: textSec, mt: 0.5 }}>
                            {search ? "Try a different search term" : "No available students at the moment"}
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {filtered.map((s) => {
                            const sid = getId(s);
                            const isInvited = invited.includes(sid);
                            const isLoading = inviting === sid;
                            const name = s.fullName ?? s.name ?? s.username ?? "Student";
                            const dept = s.department ?? s.dept ?? "";
                            const skills = getStudentSkills(s);
                            const match = s.matchPercentage ?? s.match ?? null;
                            const bio = s.bio ?? s.description ?? "";
                            const profile = profilesCache[sid];
                            const bioFromProfile = profile?.bio ?? "";
                            const displayBio = bioFromProfile || bio;
                            const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                            const deptColor = DEPT_CLR[dept] ?? ACCENT;

                            const bioPreview = displayBio && displayBio.length > 70 ? `${displayBio.substring(0, 70)}...` : displayBio;
                            const topSkills = skills.slice(0, 5);

                            return (
                                <Grid item xs={12} sm={6} md={4} key={sid}>
                                    <Fade in timeout={300}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                borderRadius: 4,
                                                background: isDark
                                                    ? `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(30,30,35,0.95) 100%)`
                                                    : `linear-gradient(145deg, ${theme.palette.background.paper} 0%, #fff 100%)`,
                                                border: isInvited
                                                    ? `2px solid ${ACCENT}`
                                                    : `1px solid ${border}`,
                                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                                overflow: "hidden",
                                                position: "relative",
                                                backdropFilter: "blur(2px)",
                                                "&:hover": {
                                                    transform: "translateY(-4px)",
                                                    boxShadow: theme.shadows[12],
                                                    borderColor: isInvited ? ACCENT : `${ACCENT}80`,
                                                },
                                            }}
                                        >
                                            {/* Decorative gradient background */}
                                            <Box sx={{
                                                position: "absolute",
                                                top: 0,
                                                right: 0,
                                                width: "40%",
                                                height: "40%",
                                                background: `radial-gradient(circle, ${deptColor}15 0%, transparent 70%)`,
                                                borderRadius: "0 0 0 100%",
                                                pointerEvents: "none",
                                            }} />

                                            {/* Cover Image Style */}
                                            <Box sx={{
                                                height: 85,
                                                background: `linear-gradient(135deg, ${deptColor}50 0%, ${deptColor}20 100%)`,
                                                position: "relative",
                                                overflow: "hidden",
                                            }}>
                                                <Box sx={{
                                                    position: "absolute",
                                                    inset: 0,
                                                    backgroundImage: `radial-gradient(circle at 20% 40%, ${deptColor}40 1px, transparent 1px)`,
                                                    backgroundSize: "20px 20px",
                                                }} />
                                                {isInvited && (
                                                    <Box sx={{
                                                        position: "absolute",
                                                        top: 12,
                                                        right: 12,
                                                        bgcolor: `${ACCENT}dd`,
                                                        borderRadius: 2,
                                                        px: 1,
                                                        py: 0.3,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 0.5,
                                                        zIndex: 2,
                                                    }}>
                                                        <CheckCircleOutlineIcon sx={{ fontSize: 12, color: "#fff" }} />
                                                        <Typography fontSize="0.65rem" fontWeight={600} sx={{ color: "#fff" }}>Invited</Typography>
                                                    </Box>
                                                )}
                                            </Box>

                                            {/* Avatar */}
                                            <Box sx={{ px: 2, mt: "-20px", position: "relative", zIndex: 2 }}>
                                                <Avatar sx={{
                                                    width: 56,
                                                    height: 56,
                                                    bgcolor: deptColor,
                                                    fontSize: "1.2rem",
                                                    fontWeight: 700,
                                                    borderRadius: "16px",
                                                    border: `3px solid ${theme.palette.background.paper}`,
                                                    boxShadow: `0 4px 12px ${deptColor}60`,
                                                }}>
                                                    {initials}
                                                </Avatar>
                                            </Box>

                                            {/* Content */}
                                            <Box sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column" }}>
                                                {/* Name & Match */}
                                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                                    <Typography sx={{
                                                        fontWeight: 700,
                                                        fontSize: "1rem",
                                                        color: textPri,
                                                    }}>
                                                        {name}
                                                    </Typography>
                                                    {match !== null && (
                                                        <Tooltip title="Match Score">
                                                            <Chip
                                                                icon={<WorkspacePremiumIcon sx={{ fontSize: 12 }} />}
                                                                label={`${match}%`}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: match >= 80 ? "#5ba87d12" : `${deptColor}12`,
                                                                    color: match >= 80 ? "#5ba87d" : deptColor,
                                                                    fontSize: "0.65rem",
                                                                    fontWeight: 700,
                                                                    height: 24,
                                                                    borderRadius: 1.5,
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    )}
                                                </Stack>

                                                {/* Department */}
                                                {dept && (
                                                    <Chip
                                                        icon={<SchoolOutlinedIcon sx={{ fontSize: 12 }} />}
                                                        label={dept}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: `${deptColor}10`,
                                                            color: deptColor,
                                                            fontSize: "0.65rem",
                                                            fontWeight: 500,
                                                            height: 24,
                                                            borderRadius: 1.5,
                                                            width: "fit-content",
                                                            mb: 1.5,
                                                        }}
                                                    />
                                                )}

                                                {/* Bio Preview */}
                                                {bioPreview && (
                                                    <Typography sx={{
                                                        fontSize: "0.75rem",
                                                        color: textSec,
                                                        lineHeight: 1.5,
                                                        mb: 1.5,
                                                        display: "-webkit-box",
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: "vertical",
                                                        overflow: "hidden",
                                                    }}>
                                                        {bioPreview}
                                                    </Typography>
                                                )}

                                                {/* Skills Section - دائرية أو مربعة مدورة مع خلفية */}
                                                {topSkills.length > 0 && (
                                                    <Box sx={{ mb: 1.5 }}>
                                                        <Typography sx={{
                                                            fontSize: "0.6rem",
                                                            fontWeight: 600,
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.5px",
                                                            color: textSec,
                                                            mb: 1,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 0.5,
                                                        }}>
                                                            <StarIcon sx={{ fontSize: 10, color: ACCENT }} />
                                                            Skills
                                                        </Typography>
                                                        <Stack direction="row" flexWrap="wrap" gap={1}>
                                                            {topSkills.map((sk, j) => {
                                                                const color = SKILL_COLORS[j % SKILL_COLORS.length];
                                                                return (
                                                                    <Box
                                                                        key={sk}
                                                                        sx={{
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            gap: 0.6,
                                                                            minWidth: 32,
                                                                            height: 32,
                                                                            px: 1.2,
                                                                            borderRadius: "30px",
                                                                            background: `linear-gradient(135deg, ${color}18 0%, ${color}0C 100%)`,
                                                                            border: `1px solid ${color}40`,
                                                                            transition: "all 0.2s",
                                                                            "&:hover": {
                                                                                transform: "scale(1.05)",
                                                                                background: `linear-gradient(135deg, ${color}28 0%, ${color}18 100%)`,
                                                                                borderColor: color,
                                                                            },
                                                                        }}
                                                                    >
                                                                        <CodeOutlinedIcon sx={{ fontSize: 12, color }} />
                                                                        <Typography sx={{
                                                                            fontSize: "0.7rem",
                                                                            fontWeight: 500,
                                                                            color: color,
                                                                            whiteSpace: "nowrap",
                                                                        }}>
                                                                            {sk.length > 12 ? sk.substring(0, 10) + ".." : sk}
                                                                        </Typography>
                                                                    </Box>
                                                                );
                                                            })}
                                                            {skills.length > 5 && (
                                                                <Box sx={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    width: 32,
                                                                    height: 32,
                                                                    borderRadius: "30px",
                                                                    bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                                                                }}>
                                                                    <Typography sx={{
                                                                        fontSize: "0.7rem",
                                                                        fontWeight: 600,
                                                                        color: textSec,
                                                                    }}>
                                                                        +{skills.length - 5}
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </Stack>
                                                    </Box>
                                                )}

                                                {/* Match Progress Bar */}
                                                {match !== null && (
                                                    <Box sx={{ mb: 1.5, mt: "auto" }}>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={match}
                                                            sx={{
                                                                height: 4,
                                                                borderRadius: 2,
                                                                bgcolor: border,
                                                                "& .MuiLinearProgress-bar": {
                                                                    bgcolor: match >= 80 ? "#5ba87d" : deptColor,
                                                                    borderRadius: 2,
                                                                },
                                                            }}
                                                        />
                                                    </Box>
                                                )}

                                                {/* Action Buttons */}
                                                <Stack direction="row" spacing={1.5}>
                                                    <Button
                                                        size="small"
                                                        variant="text"
                                                        onClick={() => openProfile(s)}
                                                        endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                                                        sx={{
                                                            fontSize: "0.7rem",
                                                            fontWeight: 600,
                                                            borderRadius: 2,
                                                            textTransform: "none",
                                                            color: ACCENT,
                                                            "&:hover": { bgcolor: `${ACCENT}08` },
                                                        }}
                                                    >
                                                        View Profile
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant={isInvited ? "contained" : "outlined"}
                                                        startIcon={
                                                            isLoading ? null :
                                                                isInvited
                                                                    ? <CheckCircleOutlineIcon sx={{ fontSize: 13 }} />
                                                                    : <PersonAddOutlinedIcon sx={{ fontSize: 13 }} />
                                                        }
                                                        disabled={isLoading || isInvited}
                                                        onClick={(e) => { e.stopPropagation(); handleInvite(sid); }}
                                                        sx={{
                                                            fontSize: "0.7rem",
                                                            fontWeight: 600,
                                                            borderRadius: 2,
                                                            textTransform: "none",
                                                            px: 1.5,
                                                            bgcolor: isInvited ? ACCENT : "transparent",
                                                            borderColor: isInvited ? ACCENT : border,
                                                            color: isInvited ? "#fff" : ACCENT,
                                                            "&:hover": {
                                                                bgcolor: isInvited ? "#be7a4f" : `${ACCENT}12`,
                                                                borderColor: ACCENT,
                                                            },
                                                        }}
                                                    >
                                                        {isLoading
                                                            ? <CircularProgress size={12} sx={{ color: ACCENT }} />
                                                            : isInvited ? "Invited" : "Invite"
                                                        }
                                                    </Button>
                                                </Stack>
                                            </Box>
                                        </Paper>
                                    </Fade>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}

                {/* Profile Modal */}
                {selected && (
                    <StudentProfileModal
                        open={profileOpen}
                        onClose={() => setProfileOpen(false)}
                        student={selected}
                        onInvite={handleInvite}
                        isInvited={invited.includes(getId(selected))}
                        isInviting={inviting === getId(selected)}
                    />
                )}
            </Box>
        </Box>
    );
}
// التصميم الكامل 
// import { useState, useEffect } from "react";
// import {
//     Box, Typography, Stack, Avatar, Button,
//     TextField, InputAdornment, CircularProgress, Grid,
// } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// import SearchIcon from "@mui/icons-material/Search";
// import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
// import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
// import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
// import LinkedInIcon from "@mui/icons-material/LinkedIn";
// import GitHubIcon from "@mui/icons-material/GitHub";
// import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
// import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
// import CodeIcon from "@mui/icons-material/Code";
// import StorageIcon from "@mui/icons-material/Storage";
// import BrushIcon from "@mui/icons-material/Brush";
// import MemoryIcon from "@mui/icons-material/Memory";
// import CloudIcon from "@mui/icons-material/Cloud";
// import SecurityIcon from "@mui/icons-material/Security";
// import AnalyticsIcon from "@mui/icons-material/Analytics";
// import SmartToyIcon from "@mui/icons-material/SmartToy";
// import DevicesIcon from "@mui/icons-material/Devices";
// import TerminalIcon from "@mui/icons-material/Terminal";
// import studentApi from "../../../../api/handler/endpoints/studentApi";
// import UserProfileApi from "../../../../api/handler/endpoints/UserProfileApi";

// // ═══════════════════════════════════════════════════
// // Constants — original theme colours
// // ═══════════════════════════════════════════════════
// const SKILL_COLORS = ["#C97B4B", "#5B8FC4", "#9B7EC8", "#6D9E8A", "#C47E7E", "#B49340"];
// const DEPT_CLR = { CS: "#C97B4B", CE: "#5B8FC4", EE: "#6D9E8A" };
// const DEPT_BG = {
//     CS: "rgba(201,123,75,0.12)",
//     CE: "rgba(91,143,196,0.12)",
//     EE: "rgba(109,158,138,0.12)",
// };
// const ACCENT = "#C97B4B";
// const A10 = "rgba(201,123,75,0.10)";
// const A22 = "rgba(201,123,75,0.22)";

// const getId = (s) => s?.id ?? s?.userId ?? s?._id ?? null;

// // map skill keywords → icon component
// const SKILL_ICON_MAP = [
//     { keys: ["frontend", "react", "vue", "angular", "html", "css", "ui"], Icon: BrushIcon },
//     { keys: ["backend", "node", "django", "spring", "laravel", "express"], Icon: StorageIcon },
//     { keys: ["ai", "ml", "machine", "deep", "neural", "nlp", "data analysis"], Icon: SmartToyIcon },
//     { keys: ["database", "sql", "mongo", "postgres", "mysql", "redis"], Icon: StorageIcon },
//     { keys: ["cloud", "aws", "azure", "gcp", "docker", "kubernetes", "devops"], Icon: CloudIcon },
//     { keys: ["security", "cyber", "pentest", "network"], Icon: SecurityIcon },
//     { keys: ["analytics", "statistics", "tableau", "powerbi"], Icon: AnalyticsIcon },
//     { keys: ["embedded", "iot", "arduino", "raspberry", "hardware", "fpga"], Icon: MemoryIcon },
//     { keys: ["mobile", "android", "ios", "flutter", "react native"], Icon: DevicesIcon },
//     { keys: ["python", "java", "c++", "c#", "go", "rust", "swift", "kotlin"], Icon: TerminalIcon },
// ];

// function getSkillIcon(skill) {
//     const lower = skill.toLowerCase();
//     for (const { keys, Icon } of SKILL_ICON_MAP) {
//         if (keys.some(k => lower.includes(k))) return Icon;
//     }
//     return CodeIcon;
// }

// // ═══════════════════════════════════════════════════
// // SidebarFilter
// // ═══════════════════════════════════════════════════
// function SidebarFilter({ deptFilter, setDeptFilter, matchFilter, setMatchFilter, skillFilter, setSkillFilter, allSkills }) {
//     const theme = useTheme();
//     const isDark = theme.palette.mode === "dark";
//     const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
//     const textSec = theme.palette.text.secondary;
//     const textTert = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";

//     const labelSx = {
//         fontSize: "0.62rem", fontWeight: 700,
//         letterSpacing: "0.10em", textTransform: "uppercase",
//         color: textTert, mb: 0.8,
//     };

//     const FilterChip = ({ active, onClick, dotColor, children }) => (
//         <Box onClick={onClick} sx={{
//             display: "flex", alignItems: "center", gap: 1,
//             px: 1.2, py: 0.75, borderRadius: 1.5, cursor: "pointer",
//             fontSize: "0.78rem", fontWeight: 500,
//             border: `0.5px solid ${active ? A22 : "transparent"}`,
//             bgcolor: active ? A10 : "transparent",
//             color: active ? ACCENT : textSec,
//             transition: "all 0.15s",
//             "&:hover": { bgcolor: A10, color: ACCENT },
//         }}>
//             {dotColor && <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: dotColor, flexShrink: 0 }} />}
//             {children}
//         </Box>
//     );

//     return (
//         <Box sx={{
//             width: 210, flexShrink: 0,
//             borderRight: `0.5px solid ${border}`,
//             p: "24px 14px",
//             display: "flex", flexDirection: "column", gap: 2.5,
//         }}>
//             <Typography sx={{
//                 fontFamily: "'Space Mono',monospace",
//                 fontSize: "0.70rem", fontWeight: 700,
//                 letterSpacing: "0.10em", textTransform: "uppercase",
//                 color: textTert, pb: 1.5, borderBottom: `0.5px solid ${border}`,
//             }}>
//                 Team Finder
//             </Typography>

//             <Box>
//                 <Typography sx={labelSx}>Department</Typography>
//                 <Stack spacing={0.3}>
//                     <FilterChip active={deptFilter === "all"} onClick={() => setDeptFilter("all")} dotColor="#888">All departments</FilterChip>
//                     <FilterChip active={deptFilter === "CS"} onClick={() => setDeptFilter("CS")} dotColor={DEPT_CLR.CS}>Computer Science</FilterChip>
//                     <FilterChip active={deptFilter === "CE"} onClick={() => setDeptFilter("CE")} dotColor={DEPT_CLR.CE}>Comp. Engineering</FilterChip>
//                     <FilterChip active={deptFilter === "EE"} onClick={() => setDeptFilter("EE")} dotColor={DEPT_CLR.EE}>Elec. Engineering</FilterChip>
//                 </Stack>
//             </Box>

//             <Box>
//                 <Typography sx={labelSx}>Match</Typography>
//                 <Stack spacing={0.3}>
//                     <FilterChip active={matchFilter === "all"} onClick={() => setMatchFilter("all")}>Any match</FilterChip>
//                     <FilterChip active={matchFilter === "high"} onClick={() => setMatchFilter("high")}>High ≥ 80%</FilterChip>
//                     <FilterChip active={matchFilter === "med"} onClick={() => setMatchFilter("med")}>Medium 50–79%</FilterChip>
//                 </Stack>
//             </Box>

//             {allSkills.length > 0 && (
//                 <Box>
//                     <Typography sx={labelSx}>Skills</Typography>
//                     <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
//                         {allSkills.map((sk) => (
//                             <Box key={sk} onClick={() => setSkillFilter(skillFilter === sk ? null : sk)} sx={{
//                                 fontSize: "0.68rem", fontWeight: 600,
//                                 px: 1, py: "3px", borderRadius: 20, cursor: "pointer",
//                                 border: `0.5px solid ${skillFilter === sk ? A22 : border}`,
//                                 bgcolor: skillFilter === sk ? A10 : "transparent",
//                                 color: skillFilter === sk ? ACCENT : textSec,
//                                 transition: "all 0.15s",
//                                 "&:hover": { borderColor: A22, color: ACCENT },
//                             }}>
//                                 {sk}
//                             </Box>
//                         ))}
//                     </Box>
//                 </Box>
//             )}
//         </Box>
//     );
// }

// // ═══════════════════════════════════════════════════
// // StudentCard — rich, full-width card
// // ═══════════════════════════════════════════════════
// function StudentCard({ student, isInvited, isInviting, onInvite }) {
//     const theme = useTheme();
//     const isDark = theme.palette.mode === "dark";
//     const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
//     const textPri = theme.palette.text.primary;
//     const textSec = theme.palette.text.secondary;
//     const cardBg = theme.palette.background.paper;
//     const subBg = isDark ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.025)";

//     const [profile, setProfile] = useState(null);
//     useEffect(() => {
//         const sid = getId(student);
//         if (!sid) return;
//         UserProfileApi.getProfileById(sid)
//             .then((raw) => {
//                 if (!raw) return;
//                 const skills = raw.field
//                     ? raw.field.split(",").map(s => s.trim()).filter(Boolean)
//                     : (raw.skills ?? []);
//                 setProfile({
//                     fullName: raw.fullName ?? "",
//                     email: raw.personalEmail ?? raw.email ?? "",
//                     phone: raw.phoneNumber ?? "",
//                     department: raw.department ?? "",
//                     github: raw.gitHubLink ?? raw.github ?? "",
//                     linkedin: raw.linkedinLink ?? raw.linkedin ?? "",
//                     bio: raw.bio ?? "",
//                     skills,
//                 });
//             })
//             .catch(() => { });
//     }, [student]);

//     const sid = getId(student);
//     const name = profile?.fullName || student?.fullName || student?.name || student?.username || "Student";
//     const dept = profile?.department || student?.department || student?.dept || "";
//     const skills = profile?.skills?.length ? profile.skills : (student?.skills ?? []);
//     const bio = profile?.bio || student?.bio || student?.description || "";
//     const email = profile?.email || student?.email || student?.personalEmail || "";
//     const phone = profile?.phone || student?.phoneNumber || "";
//     const github = profile?.github || student?.github || student?.gitHubLink || "";
//     const linkedin = profile?.linkedin || student?.linkedin || student?.linkedinLink || "";
//     const match = student?.matchPercentage ?? student?.match ?? null;
//     const year = student?.year ?? student?.academicYear ?? null;

//     const deptColor = DEPT_CLR[dept] ?? ACCENT;
//     const deptBg = DEPT_BG[dept] ?? A10;
//     const matchColor = (match ?? 0) >= 80 ? "#5ba87d" : deptColor;
//     const letters = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

//     return (
//         <Box sx={{
//             borderRadius: "16px",
//             bgcolor: cardBg,
//             border: isInvited ? `1.5px solid ${deptColor}55` : `0.5px solid ${border}`,
//             overflow: "hidden",
//             display: "flex", flexDirection: "column",
//             transition: "border-color 0.18s, box-shadow 0.18s, transform 0.18s",
//             "&:hover": {
//                 borderColor: `${deptColor}77`,
//                 transform: "translateY(-2px)",
//                 boxShadow: isDark ? "0 12px 36px rgba(0,0,0,0.40)" : "0 12px 36px rgba(0,0,0,0.09)",
//             },
//         }}>

//             {/* ── top colour strip ── */}
//             <Box sx={{
//                 height: 3, width: "100%",
//                 background: `linear-gradient(90deg, ${deptColor}cc 0%, ${deptColor}33 100%)`,
//             }} />

//             {/* ── header: avatar + name + meta ── */}
//             <Box sx={{ p: "18px 20px 14px", display: "flex", gap: 2, alignItems: "flex-start" }}>

//                 {/* avatar */}
//                 <Box sx={{ position: "relative", flexShrink: 0 }}>
//                     <Avatar sx={{
//                         width: 54, height: 54, bgcolor: deptColor,
//                         borderRadius: "14px",
//                         fontSize: "1.05rem", fontWeight: 800,
//                         fontFamily: "'Space Mono',monospace",
//                     }}>
//                         {letters}
//                     </Avatar>
//                     {/* online dot */}
//                     <Box sx={{
//                         position: "absolute", bottom: 2, right: 2,
//                         width: 9, height: 9, borderRadius: "50%",
//                         bgcolor: "#4caf82",
//                         border: `2px solid ${cardBg}`,
//                     }} />
//                     {/* match badge */}
//                     {match !== null && (
//                         <Box sx={{
//                             position: "absolute", top: -8, right: -10,
//                             bgcolor: matchColor, color: "#fff",
//                             fontSize: "0.58rem", fontWeight: 700,
//                             px: 0.7, py: "1px", borderRadius: 20,
//                             fontFamily: "'Space Mono',monospace",
//                             border: `2px solid ${cardBg}`,
//                             lineHeight: 1.6,
//                         }}>
//                             {match}%
//                         </Box>
//                     )}
//                 </Box>

//                 {/* name + dept + year */}
//                 <Box sx={{ flex: 1, minWidth: 0 }}>
//                     <Stack direction="row" alignItems="center" flexWrap="wrap" gap={0.8} mb={0.5}>
//                         <Typography fontWeight={700} fontSize="1rem" sx={{ color: textPri, lineHeight: 1.2 }}>
//                             {name}
//                         </Typography>
//                         {dept && (
//                             <Box sx={{
//                                 fontSize: "0.67rem", fontWeight: 700,
//                                 px: 1.1, py: "2px", borderRadius: 20,
//                                 bgcolor: deptBg, color: deptColor,
//                                 border: `0.5px solid ${deptColor}33`,
//                             }}>
//                                 {dept}
//                             </Box>
//                         )}
//                         {year && (
//                             <Box sx={{
//                                 fontSize: "0.67rem", fontWeight: 500,
//                                 px: 1, py: "2px", borderRadius: 20,
//                                 bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
//                                 color: textSec,
//                             }}>
//                                 {year}
//                             </Box>
//                         )}
//                     </Stack>

//                     {/* contact row */}
//                     <Stack direction="row" flexWrap="wrap" gap={1.4} alignItems="center">
//                         {email && (
//                             <Stack direction="row" alignItems="center" gap={0.5}>
//                                 <EmailOutlinedIcon sx={{ fontSize: 12, color: textSec }} />
//                                 <Typography fontSize="0.72rem" sx={{ color: textSec }}>{email}</Typography>
//                             </Stack>
//                         )}
//                         {phone && (
//                             <Stack direction="row" alignItems="center" gap={0.5}>
//                                 <PhoneOutlinedIcon sx={{ fontSize: 12, color: textSec }} />
//                                 <Typography fontSize="0.72rem" sx={{ color: textSec }}>{phone}</Typography>
//                             </Stack>
//                         )}
//                         {github && (
//                             <Box component="a" href={github} target="_blank"
//                                 sx={{
//                                     display: "flex", alignItems: "center", gap: 0.5, textDecoration: "none",
//                                     "&:hover .lbl": { color: textPri }
//                                 }}>
//                                 <GitHubIcon sx={{ fontSize: 13, color: textSec }} />
//                                 <Typography className="lbl" fontSize="0.72rem"
//                                     sx={{ color: textSec, transition: "color 0.14s" }}>GitHub</Typography>
//                             </Box>
//                         )}
//                         {linkedin && (
//                             <Box component="a" href={linkedin} target="_blank"
//                                 sx={{
//                                     display: "flex", alignItems: "center", gap: 0.5, textDecoration: "none",
//                                     "&:hover .lbl": { color: "#0A66C2" }
//                                 }}>
//                                 <LinkedInIcon sx={{ fontSize: 13, color: "#0A66C2", opacity: 0.75 }} />
//                                 <Typography className="lbl" fontSize="0.72rem"
//                                     sx={{ color: textSec, transition: "color 0.14s" }}>LinkedIn</Typography>
//                             </Box>
//                         )}
//                     </Stack>
//                 </Box>
//             </Box>

//             {/* ── bio ── */}
//             {bio && (
//                 <Box sx={{ px: "20px", pb: "12px" }}>
//                     <Typography fontSize="0.78rem" sx={{
//                         color: textSec, lineHeight: 1.7,
//                         display: "-webkit-box",
//                         WebkitLineClamp: 2,
//                         WebkitBoxOrient: "vertical",
//                         overflow: "hidden",
//                     }}>
//                         {bio}
//                     </Typography>
//                 </Box>
//             )}

//             {/* ── skills with icons ── */}
//             {skills.length > 0 && (
//                 <Box sx={{
//                     mx: "14px", mb: "14px",
//                     p: "12px 14px",
//                     borderRadius: "12px",
//                     bgcolor: subBg,
//                     border: `0.5px solid ${border}`,
//                 }}>
//                     <Stack direction="row" flexWrap="wrap" gap={0.8}>
//                         {skills.slice(0, 7).map((sk, j) => {
//                             const SkIcon = getSkillIcon(sk);
//                             const color = SKILL_COLORS[j % SKILL_COLORS.length];
//                             return (
//                                 <Box key={sk} sx={{
//                                     display: "flex", alignItems: "center", gap: 0.6,
//                                     fontSize: "0.71rem", fontWeight: 600,
//                                     px: 1.1, py: "4px", borderRadius: "8px",
//                                     border: `0.5px solid ${color}44`,
//                                     color, bgcolor: `${color}0E`,
//                                     transition: "all 0.14s",
//                                     "&:hover": { bgcolor: `${color}22`, borderColor: `${color}88` },
//                                 }}>
//                                     <SkIcon sx={{ fontSize: 12, color, flexShrink: 0 }} />
//                                     {sk}
//                                 </Box>
//                             );
//                         })}
//                         {skills.length > 7 && (
//                             <Box sx={{
//                                 display: "flex", alignItems: "center",
//                                 fontSize: "0.71rem", fontWeight: 600,
//                                 px: 1.1, py: "4px", borderRadius: "8px",
//                                 bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
//                                 color: textSec,
//                             }}>
//                                 +{skills.length - 7}
//                             </Box>
//                         )}
//                     </Stack>
//                 </Box>
//             )}

//             {/* ── footer: match bar + invite ── */}
//             <Box sx={{
//                 px: "14px", pb: "14px",
//                 display: "flex", alignItems: "center", gap: 1.5,
//                 mt: skills.length === 0 && !bio ? 0 : "auto",
//             }}>
//                 {match !== null ? (
//                     <Box sx={{ flex: 1 }}>
//                         <Stack direction="row" justifyContent="space-between" mb={0.5}>
//                             <Typography fontSize="0.65rem" sx={{ color: textSec }}>Team compatibility</Typography>
//                             <Typography fontSize="0.65rem" fontWeight={700} sx={{ color: matchColor }}>{match}%</Typography>
//                         </Stack>
//                         <Box sx={{
//                             height: 3, borderRadius: 2,
//                             bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
//                             overflow: "hidden",
//                         }}>
//                             <Box sx={{
//                                 width: `${match}%`, height: "100%",
//                                 bgcolor: matchColor, borderRadius: 2,
//                                 transition: "width 0.6s ease",
//                             }} />
//                         </Box>
//                     </Box>
//                 ) : <Box sx={{ flex: 1 }} />}

//                 <Button
//                     size="small"
//                     variant="contained"
//                     disabled={isInvited || isInviting}
//                     startIcon={isInviting ? null : isInvited
//                         ? <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
//                         : <PersonAddOutlinedIcon sx={{ fontSize: 14 }} />
//                     }
//                     onClick={(e) => { e.stopPropagation(); onInvite(sid); }}
//                     sx={{
//                         flexShrink: 0,
//                         fontSize: "0.76rem", fontWeight: 700,
//                         borderRadius: "10px", textTransform: "none",
//                         py: 0.9, px: 2.2, whiteSpace: "nowrap",
//                         bgcolor: isInvited ? "#5ba87d" : ACCENT,
//                         color: "#fff", boxShadow: "none",
//                         "&:hover": { bgcolor: isInvited ? "#4e9470" : "#be7a4f", boxShadow: "none" },
//                         "&.Mui-disabled": { opacity: 0.6, color: "#fff !important" },
//                     }}
//                 >
//                     {isInviting
//                         ? <CircularProgress size={13} sx={{ color: "#fff" }} />
//                         : isInvited ? "Invited ✓" : "Invite"
//                     }
//                 </Button>
//             </Box>
//         </Box>
//     );
// }

// // ═══════════════════════════════════════════════════
// // TeamFinder — main page
// // ═══════════════════════════════════════════════════
// export default function TeamFinder() {
//     const theme = useTheme();
//     const isDark = theme.palette.mode === "dark";
//     const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
//     const textSec = theme.palette.text.secondary;
//     const textTert = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";

//     const [students, setStudents] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [search, setSearch] = useState("");
//     const [invited, setInvited] = useState([]);
//     const [inviting, setInviting] = useState(null);
//     const [error, setError] = useState("");
//     const [deptFilter, setDeptFilter] = useState("all");
//     const [matchFilter, setMatchFilter] = useState("all");
//     const [skillFilter, setSkillFilter] = useState(null);

//     useEffect(() => {
//         setLoading(true);
//         studentApi.getAvailableStudents()
//             .then((data) => setStudents(Array.isArray(data) ? data : []))
//             .catch(() => setError("Failed to load available students"))
//             .finally(() => setLoading(false));
//     }, []);

//     const allSkills = [...new Set(students.flatMap(s => s.skills ?? []))].slice(0, 16);

//     const filtered = students.filter(s => {
//         const q = search.toLowerCase();
//         const name = (s.fullName ?? s.name ?? s.username ?? "").toLowerCase();
//         const dept = (s.department ?? s.dept ?? "").toLowerCase();
//         const skls = (s.skills ?? []).map(sk => sk.toLowerCase());

//         if (deptFilter !== "all" && (s.department ?? s.dept) !== deptFilter) return false;
//         const m = s.matchPercentage ?? s.match ?? 0;
//         if (matchFilter === "high" && m < 80) return false;
//         if (matchFilter === "med" && (m < 50 || m >= 80)) return false;
//         if (skillFilter && !(s.skills ?? []).includes(skillFilter)) return false;
//         if (q && !name.includes(q) && !dept.includes(q) && !skls.some(sk => sk.includes(q))) return false;
//         return true;
//     });

//     const handleInvite = async (studentId) => {
//         if (!studentId || invited.includes(studentId)) return;
//         setInviting(studentId);
//         setError("");
//         try {
//             await studentApi.sendInvitation(studentId);
//             setInvited(p => [...p, studentId]);
//         } catch (e) {
//             setError(e?.response?.data?.message ?? "Failed to send invitation");
//         } finally {
//             setInviting(null);
//         }
//     };

//     return (
//         <Box sx={{ display: "flex", height: "100%", minHeight: 600 }}>

//             <SidebarFilter
//                 deptFilter={deptFilter} setDeptFilter={setDeptFilter}
//                 matchFilter={matchFilter} setMatchFilter={setMatchFilter}
//                 skillFilter={skillFilter} setSkillFilter={setSkillFilter}
//                 allSkills={allSkills}
//             />

//             <Box sx={{ flex: 1, p: "24px", overflowY: "auto" }}>

//                 {/* topbar */}
//                 <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5}>
//                     <Box>
//                         <Typography sx={{
//                             fontFamily: "'Space Mono',monospace",
//                             fontSize: "1.1rem", fontWeight: 700,
//                             color: theme.palette.text.primary,
//                             letterSpacing: "-0.02em",
//                         }}>
//                             Discovery Hub
//                         </Typography>
//                         <Typography fontSize="0.78rem" sx={{ color: textTert, mt: 0.2 }}>
//                             {loading ? "Loading…" : `${filtered.length} students available`}
//                         </Typography>
//                     </Box>
//                     <TextField
//                         placeholder="Name, skill, dept…"
//                         value={search}
//                         onChange={e => setSearch(e.target.value)}
//                         size="small"
//                         sx={{ width: 220 }}
//                         InputProps={{
//                             startAdornment: (
//                                 <InputAdornment position="start">
//                                     <SearchIcon sx={{ fontSize: 15, color: textTert }} />
//                                 </InputAdornment>
//                             ),
//                             sx: { fontSize: "0.8rem", borderRadius: 2 },
//                         }}
//                     />
//                 </Stack>

//                 {error && (
//                     <Typography fontSize="0.8rem" sx={{ color: "error.main", mb: 1.5 }}>{error}</Typography>
//                 )}

//                 {/* pending banner */}
//                 {invited.length > 0 && (
//                     <Box sx={{
//                         display: "flex", alignItems: "center", gap: 1.5,
//                         p: "10px 14px", mb: 2,
//                         bgcolor: A10, border: `0.5px solid ${A22}`, borderRadius: 2,
//                     }}>
//                         <GroupsOutlinedIcon sx={{ fontSize: 16, color: ACCENT }} />
//                         <Typography fontSize="0.72rem" fontWeight={700} sx={{
//                             color: ACCENT, fontFamily: "'Space Mono',monospace", letterSpacing: "0.06em",
//                         }}>
//                             Pending ·
//                         </Typography>
//                         <Stack direction="row" gap={0.6} flexWrap="wrap">
//                             {invited.map(id => {
//                                 const s = students.find(st => getId(st) === id);
//                                 const n = s?.fullName ?? s?.name ?? s?.username ?? "Student";
//                                 return (
//                                     <Box key={id} sx={{
//                                         fontSize: "0.68rem", fontWeight: 600,
//                                         px: 1, py: "2px", borderRadius: 20,
//                                         bgcolor: "rgba(201,123,75,0.18)", color: ACCENT,
//                                     }}>
//                                         {n.split(" ")[0]}
//                                     </Box>
//                                 );
//                             })}
//                         </Stack>
//                     </Box>
//                 )}

//                 {/* grid */}
//                 {loading ? (
//                     <Box display="flex" justifyContent="center" py={8}>
//                         <CircularProgress size={28} sx={{ color: ACCENT }} />
//                     </Box>
//                 ) : filtered.length === 0 ? (
//                     <Box textAlign="center" py={8}>
//                         <PersonOffOutlinedIcon sx={{ fontSize: 32, color: ACCENT, opacity: 0.4, mb: 1 }} />
//                         <Typography fontWeight={600} fontSize="0.9rem" sx={{ color: theme.palette.text.primary }}>
//                             No students found
//                         </Typography>
//                         <Typography fontSize="0.78rem" sx={{ color: textSec, mt: 0.5 }}>
//                             {search ? "Try a different search term" : "Adjust your filters"}
//                         </Typography>
//                     </Box>
//                 ) : (
//                     <Grid container spacing={2}>
//                         {filtered.map(s => {
//                             const sid = getId(s);
//                             return (
//                                 <Grid item xs={12} md={6} lg={4} key={sid}>
//                                     <StudentCard
//                                         student={s}
//                                         isInvited={invited.includes(sid)}
//                                         isInviting={inviting === sid}
//                                         onInvite={handleInvite}
//                                     />
//                                 </Grid>
//                             );
//                         })}
//                     </Grid>
//                 )}
//             </Box>
//         </Box>
//     );
// }

// import { useState, useEffect } from "react";
// import {
//     Box, Typography, Stack, Avatar, Button,
//     TextField, InputAdornment, CircularProgress,
//     Grid, Chip, Pagination,
// } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// import SearchIcon from "@mui/icons-material/Search";
// import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
// import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
// import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
// import LinkedInIcon from "@mui/icons-material/LinkedIn";
// import GitHubIcon from "@mui/icons-material/GitHub";
// import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
// import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
// import CodeIcon from "@mui/icons-material/Code";
// import StorageIcon from "@mui/icons-material/Storage";
// import BrushIcon from "@mui/icons-material/Brush";
// import MemoryIcon from "@mui/icons-material/Memory";
// import CloudIcon from "@mui/icons-material/Cloud";
// import SecurityIcon from "@mui/icons-material/Security";
// import AnalyticsIcon from "@mui/icons-material/Analytics";
// import SmartToyIcon from "@mui/icons-material/SmartToy";
// import DevicesIcon from "@mui/icons-material/Devices";
// import TerminalIcon from "@mui/icons-material/Terminal";
// import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
// import studentApi from "../../../../api/handler/endpoints/studentApi";
// import UserProfileApi from "../../../../api/handler/endpoints/UserProfileApi";

// // ─── Theme ────────────────────────────────────────────────────────────
// const ACCENT = "#C97B4B";
// const A08 = "rgba(201,123,75,0.08)";
// const A16 = "rgba(201,123,75,0.16)";
// const A30 = "rgba(201,123,75,0.30)";
// const GREEN = "#4caf82";

// const DEPT_CLR = { CS: "#C97B4B", CE: "#5B8FC4", EE: "#6D9E8A" };
// const DEPT_BG = {
//     CS: "rgba(201,123,75,0.10)",
//     CE: "rgba(91,143,196,0.10)",
//     EE: "rgba(109,158,138,0.10)",
// };

// // skill colors — muted, professional
// const SK_CLR = ["#C97B4B", "#5B8FC4", "#9B7EC8", "#6D9E8A", "#C47E7E", "#B49340", "#5B9EC4", "#9E7B9B"];

// const SKILL_MAP = [
//     { keys: ["frontend", "react", "vue", "angular", "html", "css", "ui", "ux"], Icon: BrushIcon },
//     { keys: ["backend", "node", "django", "spring", "laravel", "express", "api"], Icon: StorageIcon },
//     { keys: ["ai", "ml", "machine", "deep", "neural", "nlp", "data"], Icon: SmartToyIcon },
//     { keys: ["database", "sql", "mongo", "postgres", "mysql", "redis", "db"], Icon: StorageIcon },
//     { keys: ["cloud", "aws", "azure", "gcp", "docker", "kubernetes", "devops"], Icon: CloudIcon },
//     { keys: ["security", "cyber", "pentest", "network"], Icon: SecurityIcon },
//     { keys: ["analytics", "statistics", "tableau", "powerbi", "bi"], Icon: AnalyticsIcon },
//     { keys: ["embedded", "iot", "arduino", "raspberry", "hardware", "fpga"], Icon: MemoryIcon },
//     { keys: ["mobile", "android", "ios", "flutter", "react native"], Icon: DevicesIcon },
//     { keys: ["python", "java", "c++", "c#", "go", "rust", "swift", "kotlin"], Icon: TerminalIcon },
// ];
// const getSkillIcon = (sk) => {
//     const l = sk.toLowerCase();
//     for (const { keys, Icon } of SKILL_MAP) if (keys.some(k => l.includes(k))) return Icon;
//     return CodeIcon;
// };

// const getId = (s) => s?.id ?? s?.userId ?? s?._id ?? null;

// // ─── CARD DIMENSIONS — shared constants so every card is identical ────
// const CARD_H = 380;   // total card height px
// const AVATAR_SIZE = 52;
// const HEADER_H = 88;    // avatar row
// const META_H = 36;    // email / phone row
// const BIO_H = 62;    // bio clamped to 3 lines
// const SKILLS_H = 72;    // skills chips area
// const FOOTER_H = 80;    // match bar + button

// // ─── SidebarFilter ────────────────────────────────────────────────────
// function SidebarFilter({ deptFilter, setDeptFilter, matchFilter, setMatchFilter, skillFilter, setSkillFilter, allSkills }) {
//     const theme = useTheme();
//     const isDark = theme.palette.mode === "dark";
//     const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
//     const textSec = theme.palette.text.secondary;
//     const textTert = isDark ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.32)";

//     const labelSx = { fontSize: "0.60rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: textTert, mb: 0.8 };

//     const Item = ({ active, onClick, dot, children }) => (
//         <Box onClick={onClick} sx={{
//             display: "flex", alignItems: "center", gap: 1.2,
//             px: 1.4, py: 0.8, borderRadius: "10px", cursor: "pointer",
//             fontSize: "0.80rem", fontWeight: active ? 600 : 400,
//             bgcolor: active ? A08 : "transparent",
//             color: active ? ACCENT : textSec,
//             border: `0.5px solid ${active ? A30 : "transparent"}`,
//             transition: "all 0.14s",
//             "&:hover": { bgcolor: A08, color: ACCENT },
//         }}>
//             {dot && <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: dot, flexShrink: 0 }} />}
//             {children}
//         </Box>
//     );

//     return (
//         <Box sx={{
//             width: 215, flexShrink: 0,
//             borderRight: `0.5px solid ${border}`,
//             p: "26px 14px",
//             display: "flex", flexDirection: "column", gap: 2.8,
//         }}>
//             <Typography sx={{
//                 fontFamily: "'Space Mono',monospace",
//                 fontSize: "0.68rem", fontWeight: 700,
//                 letterSpacing: "0.10em", textTransform: "uppercase",
//                 color: textTert, pb: 1.6, borderBottom: `0.5px solid ${border}`,
//             }}>
//                 Team Finder
//             </Typography>

//             <Box>
//                 <Typography sx={labelSx}>Department</Typography>
//                 <Stack spacing={0.3}>
//                     <Item active={deptFilter === "all"} onClick={() => setDeptFilter("all")} dot="#999">All departments</Item>
//                     <Item active={deptFilter === "CS"} onClick={() => setDeptFilter("CS")} dot={DEPT_CLR.CS}>Computer Science</Item>
//                     <Item active={deptFilter === "CE"} onClick={() => setDeptFilter("CE")} dot={DEPT_CLR.CE}>Comp. Engineering</Item>
//                     <Item active={deptFilter === "EE"} onClick={() => setDeptFilter("EE")} dot={DEPT_CLR.EE}>Elec. Engineering</Item>
//                 </Stack>
//             </Box>

//             <Box>
//                 <Typography sx={labelSx}>Match</Typography>
//                 <Stack spacing={0.3}>
//                     <Item active={matchFilter === "all"} onClick={() => setMatchFilter("all")}>Any match</Item>
//                     <Item active={matchFilter === "high"} onClick={() => setMatchFilter("high")}>High ≥ 80%</Item>
//                     <Item active={matchFilter === "med"} onClick={() => setMatchFilter("med")}>Medium 50–79%</Item>
//                 </Stack>
//             </Box>

//             {allSkills.length > 0 && (
//                 <Box>
//                     <Typography sx={labelSx}>Skills</Typography>
//                     <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
//                         {allSkills.map(sk => (
//                             <Box key={sk} onClick={() => setSkillFilter(skillFilter === sk ? null : sk)} sx={{
//                                 fontSize: "0.68rem", fontWeight: 600,
//                                 px: 1, py: "3px", borderRadius: 20, cursor: "pointer",
//                                 border: `0.5px solid ${skillFilter === sk ? A30 : border}`,
//                                 bgcolor: skillFilter === sk ? A08 : "transparent",
//                                 color: skillFilter === sk ? ACCENT : textSec,
//                                 transition: "all 0.14s",
//                                 "&:hover": { borderColor: A30, color: ACCENT },
//                             }}>
//                                 {sk}
//                             </Box>
//                         ))}
//                     </Box>
//                 </Box>
//             )}
//         </Box>
//     );
// }

// // ─── StudentCard ──────────────────────────────────────────────────────
// // Fixed CARD_H so every card is exactly the same height.
// // Sections have fixed heights; content is clamped / hidden to fit.
// function StudentCard({ student, isInvited, isInviting, onInvite }) {
//     const theme = useTheme();
//     const isDark = theme.palette.mode === "dark";
//     const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
//     const textPri = theme.palette.text.primary;
//     const textSec = theme.palette.text.secondary;
//     const cardBg = theme.palette.background.paper;
//     const divider = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

//     const [profile, setProfile] = useState(null);
//     const [profErr, setProfErr] = useState(false);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const sid = getId(student);
//         if (!sid) { setLoading(false); return; }
//         setLoading(true); setProfErr(false);
//         UserProfileApi.getProfileById(sid)
//             .then(raw => {
//                 if (!raw) { setProfErr(true); return; }
//                 const skills = raw.field
//                     ? raw.field.split(",").map(s => s.trim()).filter(Boolean)
//                     : (raw.skills ?? []);
//                 setProfile({
//                     fullName: raw.fullName ?? "",
//                     email: raw.personalEmail ?? raw.email ?? "",
//                     phone: raw.phoneNumber ?? "",
//                     department: raw.department ?? "",
//                     github: raw.gitHubLink ?? raw.github ?? "",
//                     linkedin: raw.linkedinLink ?? raw.linkedin ?? "",
//                     bio: raw.bio ?? "",
//                     skills,
//                 });
//             })
//             .catch(() => setProfErr(true))
//             .finally(() => setLoading(false));
//     }, [student]);

//     const sid = getId(student);
//     const name = profile?.fullName || student?.fullName || student?.name || student?.username || "Student";
//     const dept = profile?.department || student?.department || student?.dept || "";
//     const skills = profile?.skills?.length ? profile.skills : (student?.skills ?? []);
//     const bio = profile?.bio || student?.bio || student?.description || "";
//     const email = profile?.email || student?.email || student?.personalEmail || "";
//     const phone = profile?.phone || student?.phoneNumber || "";
//     const github = profile?.github || student?.github || student?.gitHubLink || "";
//     const linkedin = profile?.linkedin || student?.linkedin || student?.linkedinLink || "";
//     const match = student?.matchPercentage ?? student?.match ?? null;
//     const year = student?.year ?? student?.academicYear ?? null;

//     const deptColor = DEPT_CLR[dept] ?? ACCENT;
//     const deptBg = DEPT_BG[dept] ?? A08;
//     const matchColor = (match ?? 0) >= 80 ? GREEN : deptColor;
//     const letters = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
//     const hasProfile = profile !== null && !profErr;

//     return (
//         <Box sx={{
//             width: "100%",
//             height: CARD_H,          // ← FIXED HEIGHT
//             borderRadius: "16px",
//             bgcolor: cardBg,
//             border: isInvited ? `1.5px solid ${deptColor}55` : `0.5px solid ${border}`,
//             overflow: "hidden",
//             display: "flex", flexDirection: "column",
//             position: "relative",
//             transition: "transform 0.18s, box-shadow 0.18s, border-color 0.18s",
//             "&:hover": {
//                 transform: "translateY(-3px)",
//                 borderColor: `${deptColor}88`,
//                 boxShadow: isDark
//                     ? `0 16px 40px rgba(0,0,0,0.40), 0 0 0 0.5px ${deptColor}22`
//                     : `0 16px 40px rgba(0,0,0,0.09), 0 0 0 0.5px ${deptColor}22`,
//             },
//         }}>

//             {/* ── TOP COLOUR LINE ─── */}
//             <Box sx={{ height: 3, flexShrink: 0, bgcolor: deptColor, opacity: 0.70 }} />

//             {/* ── HEADER  (AVATAR_SIZE + padding → HEADER_H) ─── */}
//             <Box sx={{ height: HEADER_H, flexShrink: 0, px: 2.2, pt: 2, pb: 0, display: "flex", gap: 1.8, alignItems: "flex-start" }}>
//                 {/* avatar */}
//                 <Box sx={{ position: "relative", flexShrink: 0 }}>
//                     <Avatar sx={{
//                         width: AVATAR_SIZE, height: AVATAR_SIZE,
//                         bgcolor: deptColor, borderRadius: "13px",
//                         fontSize: "1.0rem", fontWeight: 800,
//                         fontFamily: "'Space Mono',monospace",
//                         letterSpacing: "-0.02em",
//                     }}>
//                         {letters}
//                     </Avatar>
//                     {/* online dot */}
//                     <Box sx={{
//                         position: "absolute", bottom: 1, right: 1,
//                         width: 9, height: 9, borderRadius: "50%",
//                         bgcolor: GREEN, border: `2px solid ${cardBg}`,
//                     }} />
//                     {/* match badge */}
//                     {match !== null && (
//                         <Box sx={{
//                             position: "absolute", top: -7, right: -14,
//                             bgcolor: matchColor, color: "#fff",
//                             fontSize: "0.58rem", fontWeight: 700,
//                             px: 0.7, py: "1px", borderRadius: 20,
//                             fontFamily: "'Space Mono',monospace",
//                             border: `2px solid ${cardBg}`, lineHeight: 1.6,
//                         }}>
//                             {match}%
//                         </Box>
//                     )}
//                 </Box>

//                 {/* name + dept + year */}
//                 <Box sx={{ flex: 1, minWidth: 0, pt: 0.3 }}>
//                     <Typography fontWeight={700} fontSize="0.97rem" noWrap sx={{ color: textPri, lineHeight: 1.25, mb: 0.5 }}>
//                         {name}
//                     </Typography>
//                     <Stack direction="row" gap={0.7} flexWrap="nowrap" alignItems="center" sx={{ overflow: "hidden" }}>
//                         {dept && (
//                             <Box sx={{
//                                 fontSize: "0.66rem", fontWeight: 700,
//                                 px: 1, py: "2px", borderRadius: 20, flexShrink: 0,
//                                 bgcolor: deptBg, color: deptColor,
//                             }}>
//                                 {dept}
//                             </Box>
//                         )}
//                         {year && (
//                             <Box sx={{
//                                 fontSize: "0.66rem", fontWeight: 500,
//                                 px: 1, py: "2px", borderRadius: 20, flexShrink: 0,
//                                 bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
//                                 color: textSec,
//                             }}>
//                                 {year}
//                             </Box>
//                         )}
//                     </Stack>
//                 </Box>
//             </Box>

//             {/* ── META ROW (email + phone + github + linkedin) — META_H ─── */}
//             <Box sx={{ height: META_H, flexShrink: 0, px: 2.2, display: "flex", alignItems: "center" }}>
//                 {hasProfile ? (
//                     <Stack direction="row" gap={1.6} alignItems="center" sx={{ overflow: "hidden", flexWrap: "nowrap" }}>
//                         {email && (
//                             <Stack direction="row" alignItems="center" gap={0.5} sx={{ minWidth: 0 }}>
//                                 <EmailOutlinedIcon sx={{ fontSize: 11, color: textSec, flexShrink: 0 }} />
//                                 <Typography fontSize="0.70rem" noWrap sx={{ color: textSec }}>{email}</Typography>
//                             </Stack>
//                         )}
//                         {phone && (
//                             <Stack direction="row" alignItems="center" gap={0.5} sx={{ flexShrink: 0 }}>
//                                 <PhoneOutlinedIcon sx={{ fontSize: 11, color: textSec }} />
//                                 <Typography fontSize="0.70rem" sx={{ color: textSec }}>{phone}</Typography>
//                             </Stack>
//                         )}
//                         {github && (
//                             <Box component="a" href={github} target="_blank"
//                                 sx={{ display: "flex", alignItems: "center", gap: 0.4, textDecoration: "none", flexShrink: 0 }}>
//                                 <GitHubIcon sx={{ fontSize: 12, color: textSec }} />
//                                 <Typography fontSize="0.70rem" sx={{ color: textSec }}>GitHub</Typography>
//                             </Box>
//                         )}
//                         {linkedin && (
//                             <Box component="a" href={linkedin} target="_blank"
//                                 sx={{ display: "flex", alignItems: "center", gap: 0.4, textDecoration: "none", flexShrink: 0 }}>
//                                 <LinkedInIcon sx={{ fontSize: 12, color: "#0A66C2", opacity: 0.8 }} />
//                                 <Typography fontSize="0.70rem" sx={{ color: "#0A66C2", opacity: 0.8 }}>LinkedIn</Typography>
//                             </Box>
//                         )}
//                     </Stack>
//                 ) : loading ? (
//                     <CircularProgress size={14} sx={{ color: ACCENT, opacity: 0.5 }} />
//                 ) : null}
//             </Box>

//             <Box sx={{ height: "0.5px", bgcolor: divider, mx: 2.2, flexShrink: 0 }} />

//             {/* ── BIO — BIO_H fixed, clamped to 3 lines ─── */}
//             <Box sx={{ height: BIO_H, flexShrink: 0, px: 2.2, py: 1.2, display: "flex", alignItems: "flex-start" }}>
//                 {hasProfile && bio ? (
//                     <Typography fontSize="0.76rem" sx={{
//                         color: textSec, lineHeight: 1.65,
//                         display: "-webkit-box",
//                         WebkitLineClamp: 3,
//                         WebkitBoxOrient: "vertical",
//                         overflow: "hidden",
//                     }}>
//                         {bio}
//                     </Typography>
//                 ) : profErr ? (
//                     <Stack direction="row" alignItems="center" gap={1}>
//                         <WarningAmberOutlinedIcon sx={{ fontSize: 14, color: ACCENT, opacity: 0.5 }} />
//                         <Typography fontSize="0.72rem" sx={{ color: textSec, opacity: 0.6 }}>
//                             Profile not completed yet
//                         </Typography>
//                     </Stack>
//                 ) : !loading && hasProfile && !bio ? (
//                     <Typography fontSize="0.72rem" sx={{ color: textSec, opacity: 0.45, fontStyle: "italic" }}>
//                         No bio provided
//                     </Typography>
//                 ) : null}
//             </Box>

//             <Box sx={{ height: "0.5px", bgcolor: divider, mx: 2.2, flexShrink: 0 }} />

//             {/* ── SKILLS — SKILLS_H fixed ─── */}
//             <Box sx={{ height: SKILLS_H, flexShrink: 0, px: 2.2, py: 1.2 }}>
//                 {hasProfile && skills.length > 0 ? (
//                     <Stack direction="row" flexWrap="wrap" gap={0.65} sx={{ overflow: "hidden", maxHeight: SKILLS_H - 20 }}>
//                         {skills.slice(0, 7).map((sk, j) => {
//                             const SkIcon = getSkillIcon(sk);
//                             const c = SK_CLR[j % SK_CLR.length];
//                             return (
//                                 <Box key={sk} sx={{
//                                     display: "inline-flex", alignItems: "center", gap: 0.5,
//                                     fontSize: "0.68rem", fontWeight: 600,
//                                     px: 0.9, py: "3px", borderRadius: "7px",
//                                     border: `0.5px solid ${c}44`,
//                                     color: c, bgcolor: `${c}0D`,
//                                 }}>
//                                     <SkIcon sx={{ fontSize: 10, color: c }} />
//                                     {sk}
//                                 </Box>
//                             );
//                         })}
//                         {skills.length > 7 && (
//                             <Box sx={{
//                                 display: "inline-flex", alignItems: "center",
//                                 fontSize: "0.68rem", fontWeight: 600,
//                                 px: 0.9, py: "3px", borderRadius: "7px",
//                                 bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
//                                 color: textSec,
//                             }}>
//                                 +{skills.length - 7}
//                             </Box>
//                         )}
//                     </Stack>
//                 ) : (
//                     <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
//                         <Typography fontSize="0.70rem" sx={{ color: textSec, opacity: 0.35 }}>—</Typography>
//                     </Box>
//                 )}
//             </Box>

//             {/* ── FOOTER — FOOTER_H fixed ─── */}
//             <Box sx={{
//                 height: FOOTER_H, flexShrink: 0,
//                 px: 2.2, pt: 1.2, pb: 1.8,
//                 borderTop: `0.5px solid ${divider}`,
//                 display: "flex", flexDirection: "column", justifyContent: "space-between",
//                 mt: "auto",
//             }}>
//                 {/* match bar */}
//                 {match !== null ? (
//                     <Box sx={{ mb: 0.8 }}>
//                         <Stack direction="row" justifyContent="space-between" mb={0.5}>
//                             <Typography fontSize="0.62rem" sx={{ color: textSec, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
//                                 Team compatibility
//                             </Typography>
//                             <Typography fontSize="0.62rem" fontWeight={700} sx={{ color: matchColor }}>
//                                 {match}%
//                             </Typography>
//                         </Stack>
//                         <Box sx={{ height: 3, borderRadius: 2, bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}>
//                             <Box sx={{ width: `${match}%`, height: "100%", bgcolor: matchColor, borderRadius: 2, transition: "width 0.6s ease" }} />
//                         </Box>
//                     </Box>
//                 ) : <Box sx={{ flex: 1 }} />}

//                 {/* invite button */}
//                 <Button
//                     fullWidth
//                     size="small"
//                     variant="contained"
//                     disabled={isInvited || isInviting}
//                     startIcon={isInviting ? null : isInvited
//                         ? <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
//                         : <PersonAddOutlinedIcon sx={{ fontSize: 14 }} />
//                     }
//                     onClick={e => { e.stopPropagation(); onInvite(sid); }}
//                     sx={{
//                         fontSize: "0.76rem", fontWeight: 700,
//                         borderRadius: "10px", textTransform: "none",
//                         py: 0.85,
//                         bgcolor: isInvited ? GREEN : ACCENT,
//                         color: "#fff", boxShadow: "none",
//                         "&:hover": { bgcolor: isInvited ? "#3d9e6f" : "#be7a4f", boxShadow: "none" },
//                         "&.Mui-disabled": { opacity: 0.60, color: "#fff !important" },
//                     }}
//                 >
//                     {isInviting
//                         ? <CircularProgress size={13} sx={{ color: "#fff" }} />
//                         : isInvited ? "Invited ✓" : "Invite"
//                     }
//                 </Button>
//             </Box>
//         </Box>
//     );
// }

// // ─── TeamFinder ───────────────────────────────────────────────────────
// export default function TeamFinder() {
//     const theme = useTheme();
//     const isDark = theme.palette.mode === "dark";
//     const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
//     const textSec = theme.palette.text.secondary;
//     const textTert = isDark ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.32)";

//     const [students, setStudents] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [search, setSearch] = useState("");
//     const [invited, setInvited] = useState([]);
//     const [inviting, setInviting] = useState(null);
//     const [error, setError] = useState("");
//     const [deptFilter, setDeptFilter] = useState("all");
//     const [matchFilter, setMatchFilter] = useState("all");
//     const [skillFilter, setSkillFilter] = useState(null);
//     const [page, setPage] = useState(1);
//     const PER_PAGE = 9;

//     useEffect(() => {
//         setLoading(true);
//         studentApi.getAvailableStudents()
//             .then(data => setStudents(Array.isArray(data) ? data : []))
//             .catch(() => setError("Failed to load available students"))
//             .finally(() => setLoading(false));
//     }, []);

//     const allSkills = [...new Set(students.flatMap(s => s.skills ?? []))].slice(0, 18);

//     const filtered = students.filter(s => {
//         const q = search.toLowerCase();
//         const name = (s.fullName ?? s.name ?? s.username ?? "").toLowerCase();
//         const dept = (s.department ?? s.dept ?? "").toLowerCase();
//         const skls = (s.skills ?? []).map(sk => sk.toLowerCase());
//         if (deptFilter !== "all" && (s.department ?? s.dept) !== deptFilter) return false;
//         const m = s.matchPercentage ?? s.match ?? 0;
//         if (matchFilter === "high" && m < 80) return false;
//         if (matchFilter === "med" && (m < 50 || m >= 80)) return false;
//         if (skillFilter && !(s.skills ?? []).includes(skillFilter)) return false;
//         if (q && !name.includes(q) && !dept.includes(q) && !skls.some(sk => sk.includes(q))) return false;
//         return true;
//     });

//     const totalPages = Math.ceil(filtered.length / PER_PAGE);
//     const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

//     useEffect(() => { setPage(1); }, [search, deptFilter, matchFilter, skillFilter]);

//     const handleInvite = async (sid) => {
//         if (!sid || invited.includes(sid)) return;
//         setInviting(sid); setError("");
//         try {
//             await studentApi.sendInvitation(sid);
//             setInvited(p => [...p, sid]);
//         } catch (e) {
//             setError(e?.response?.data?.message ?? "Failed to send invitation");
//         } finally { setInviting(null); }
//     };

//     return (
//         <Box sx={{ display: "flex", height: "100%", minHeight: 600 }}>

//             <SidebarFilter
//                 deptFilter={deptFilter} setDeptFilter={setDeptFilter}
//                 matchFilter={matchFilter} setMatchFilter={setMatchFilter}
//                 skillFilter={skillFilter} setSkillFilter={setSkillFilter}
//                 allSkills={allSkills}
//             />

//             <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: "26px 24px", overflowY: "auto" }}>

//                 {/* topbar */}
//                 <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
//                     <Box>
//                         <Typography sx={{
//                             fontFamily: "'Space Mono',monospace",
//                             fontSize: "1.15rem", fontWeight: 700,
//                             color: theme.palette.text.primary,
//                             letterSpacing: "-0.02em",
//                         }}>
//                             Discovery Hub
//                         </Typography>
//                         <Typography fontSize="0.76rem" sx={{ color: textTert, mt: 0.2 }}>
//                             {loading ? "Loading…" : `${filtered.length} students available`}
//                         </Typography>
//                     </Box>
//                     <TextField
//                         placeholder="Name, skill, dept…"
//                         value={search}
//                         onChange={e => setSearch(e.target.value)}
//                         size="small"
//                         sx={{ width: 230 }}
//                         InputProps={{
//                             startAdornment: (
//                                 <InputAdornment position="start">
//                                     <SearchIcon sx={{ fontSize: 15, color: textTert }} />
//                                 </InputAdornment>
//                             ),
//                             sx: { fontSize: "0.80rem", borderRadius: "10px" },
//                         }}
//                     />
//                 </Stack>

//                 {error && (
//                     <Typography fontSize="0.78rem" sx={{ color: "error.main", mb: 1.5 }}>{error}</Typography>
//                 )}

//                 {/* pending banner */}
//                 {invited.length > 0 && (
//                     <Box sx={{
//                         display: "flex", alignItems: "center", gap: 1.5,
//                         p: "9px 14px", mb: 2.5,
//                         bgcolor: A08, border: `0.5px solid ${A30}`, borderRadius: "12px",
//                     }}>
//                         <GroupsOutlinedIcon sx={{ fontSize: 15, color: ACCENT }} />
//                         <Typography fontSize="0.70rem" fontWeight={700} sx={{
//                             color: ACCENT, fontFamily: "'Space Mono',monospace", letterSpacing: "0.06em",
//                         }}>
//                             Pending ·
//                         </Typography>
//                         <Stack direction="row" gap={0.6} flexWrap="wrap">
//                             {invited.map(id => {
//                                 const s = students.find(st => getId(st) === id);
//                                 const n = s?.fullName ?? s?.name ?? s?.username ?? "Student";
//                                 return (
//                                     <Box key={id} sx={{
//                                         fontSize: "0.67rem", fontWeight: 600,
//                                         px: 1, py: "2px", borderRadius: 20,
//                                         bgcolor: A16, color: ACCENT,
//                                     }}>
//                                         {n.split(" ")[0]}
//                                     </Box>
//                                 );
//                             })}
//                         </Stack>
//                     </Box>
//                 )}

//                 {/* grid */}
//                 {loading ? (
//                     <Box display="flex" justifyContent="center" py={10}>
//                         <CircularProgress size={28} sx={{ color: ACCENT }} />
//                     </Box>
//                 ) : filtered.length === 0 ? (
//                     <Box textAlign="center" py={10}>
//                         <PersonOffOutlinedIcon sx={{ fontSize: 32, color: ACCENT, opacity: 0.35, mb: 1 }} />
//                         <Typography fontWeight={600} fontSize="0.9rem" sx={{ color: theme.palette.text.primary }}>
//                             No students found
//                         </Typography>
//                         <Typography fontSize="0.78rem" sx={{ color: textSec, mt: 0.5 }}>
//                             {search ? "Try a different search term" : "Adjust your filters"}
//                         </Typography>
//                     </Box>
//                 ) : (
//                     <>
//                         <Grid container spacing={2} sx={{ flex: 1 }}>
//                             {paginated.map(s => {
//                                 const sid = getId(s);
//                                 return (
//                                     <Grid item xs={12} md={6} lg={4} key={sid}>
//                                         <StudentCard
//                                             student={s}
//                                             isInvited={invited.includes(sid)}
//                                             isInviting={inviting === sid}
//                                             onInvite={handleInvite}
//                                         />
//                                     </Grid>
//                                 );
//                             })}
//                         </Grid>

//                         {totalPages > 1 && (
//                             <Box sx={{ display: "flex", justifyContent: "center", pt: 3, mt: 2, borderTop: `0.5px solid ${border}` }}>
//                                 <Pagination
//                                     count={totalPages} page={page}
//                                     onChange={(_, v) => { setPage(v); window.scrollTo({ top: 0, behavior: "smooth" }); }}
//                                     size="small"
//                                     sx={{
//                                         "& .MuiPaginationItem-root": {
//                                             borderRadius: "8px", fontSize: "0.78rem",
//                                             "&.Mui-selected": { bgcolor: `${ACCENT} !important`, color: "#fff" },
//                                         },
//                                     }}
//                                 />
//                             </Box>
//                         )}
//                     </>
//                 )}
//             </Box>
//         </Box>
//     );
// }