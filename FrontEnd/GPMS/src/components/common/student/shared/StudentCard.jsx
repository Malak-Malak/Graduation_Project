// src/components/common/student/shared/StudentCard.jsx
//
// مكونات مشتركة بين MyTeamPage (Tab: Invite Students) و DiscoveryHub
//
// Props الجديدة:
//   showInvite={true}   → MyTeam Tab 2: يظهر زر Invite + View Profile
//   showInvite={false}  → Discovery Hub: يظهر View Profile فقط، بدون invite

import { useState, useEffect } from "react";
import {
    Box, Paper, Typography, Stack, Avatar, Chip, Button,
    TextField, InputAdornment, LinearProgress,
    Dialog, DialogContent,
    Grid, CircularProgress, Divider, IconButton, Tooltip, Fade,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
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
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import UserProfileApi from "../../../../api/handler/endpoints/UserProfileApi";

// ══════════════════════════════════════════════════════════════════════
// ثوابت مشتركة
// ══════════════════════════════════════════════════════════════════════
export const SKILL_COLORS = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8", "#C47E7E"];
export const DEPT_CLR = { CS: "#B46F4C", CE: "#7E9FC4", EE: "#6D8A7D" };
export const ACCENT = "#d0895b";
export const A10_LIGHT = "rgba(208,137,91,0.07)";
export const A10_DARK = "rgba(208,137,91,0.10)";
export const A22 = "rgba(208,137,91,0.22)";

// استخراج ID الطالب من أي shape يرجعه الباكند
export const getId = (s) => s?.id ?? s?.userId ?? s?._id ?? null;

// استخراج المهارات — الأولوية للبروفايل
export const getSkillsFromStudent = (student, profile) => {
    if (profile?.skills?.length) return profile.skills;
    if (profile?.field) return profile.field.split(",").map(s => s.trim()).filter(Boolean);
    if (student?.skills?.length) return student.skills;
    if (student?.field) return student.field.split(",").map(s => s.trim()).filter(Boolean);
    return [];
};

// ══════════════════════════════════════════════════════════════════════
// StudentProfileModal — مودال البروفايل الكامل
// ══════════════════════════════════════════════════════════════════════
export function StudentProfileModal({
    open,
    onClose,
    student,
    onInvite,
    isInvited,
    isInviting,
    showInvite = true,   // ← false في Discovery Hub
}) {
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
            {/* ── Cover ── */}
            <Box sx={{ position: "relative" }}>
                <Box sx={{
                    height: 110,
                    background: coverGradient,
                    position: "relative",
                    overflow: "hidden",
                }}>
                    <Box sx={{
                        position: "absolute", inset: 0,
                        backgroundImage: `radial-gradient(${ACCENT}30 1px, transparent 1px)`,
                        backgroundSize: "20px 20px",
                        opacity: isDark ? 0.4 : 0.5,
                    }} />
                </Box>

                {/* Close button */}
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        position: "absolute", top: 10, right: 12,
                        bgcolor: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(8px)",
                        border: `1px solid ${border}`,
                        color: textSec,
                        "&:hover": { color: ACCENT },
                    }}
                >
                    <CloseIcon sx={{ fontSize: 15 }} />
                </IconButton>

                {/* Avatar + Social links */}
                <Box sx={{ px: 3, pb: 0 }}>
                    <Stack direction="row" alignItems="flex-end" justifyContent="space-between"
                        sx={{ mt: "-32px", mb: 1.5 }}>
                        <Avatar sx={{
                            width: 70, height: 70,
                            bgcolor: DEPT_CLR[dept] ?? ACCENT,
                            fontSize: "1.5rem", fontWeight: 800,
                            border: `3px solid ${cardBg}`,
                            boxShadow: `0 4px 14px ${A22}`,
                        }}>
                            {avatarLetters}
                        </Avatar>

                        <Stack direction="row" gap={1} pb={0.5}>
                            {fullProfile?.linkedin && (
                                <Tooltip title="LinkedIn">
                                    <IconButton component="a" href={fullProfile.linkedin} target="_blank"
                                        sx={{
                                            bgcolor: isDark ? "rgba(0,119,181,0.15)" : "rgba(0,119,181,0.08)",
                                            border: `1px solid ${isDark ? "rgba(0,119,181,0.3)" : "rgba(0,119,181,0.2)"}`,
                                            "&:hover": { bgcolor: "#0077B5", color: "#fff", transform: "translateY(-2px)" },
                                            transition: "all 0.2s", width: 38, height: 38,
                                        }}>
                                        <LinkedInIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {fullProfile?.github && (
                                <Tooltip title="GitHub">
                                    <IconButton component="a" href={fullProfile.github} target="_blank"
                                        sx={{
                                            bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                                            border: `1px solid ${border}`,
                                            "&:hover": { bgcolor: isDark ? "#fff" : "#000", color: isDark ? "#000" : "#fff", transform: "translateY(-2px)" },
                                            transition: "all 0.2s", width: 38, height: 38,
                                        }}>
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
                                    height: 26, borderRadius: 1.5,
                                    bgcolor: a10, color: ACCENT,
                                    fontWeight: 700, fontSize: "0.72rem",
                                    border: `1px solid ${A22}`,
                                }}
                            />
                        </Box>
                    )}
                </Box>

                <Divider sx={{ borderColor: border, mt: 1.5 }} />
            </Box>

            {/* ── Body ── */}
            <DialogContent sx={{ px: 3, py: 2.5, overflowY: "auto" }}>
                {profLoading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress size={28} sx={{ color: ACCENT }} />
                    </Box>
                ) : (
                    <Stack spacing={2.5}>
                        {/* Match bar */}
                        {match !== null && (
                            <Box sx={{
                                p: 2, borderRadius: 3,
                                bgcolor: a10, border: `1px solid ${A22}`,
                                display: "flex", alignItems: "center", gap: 2.5,
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
                                        variant="determinate" value={match}
                                        sx={{
                                            height: 6, borderRadius: 3,
                                            bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                                            "& .MuiLinearProgress-bar": {
                                                bgcolor: match >= 80 ? "#5ba87d" : ACCENT,
                                                borderRadius: 3,
                                            },
                                        }}
                                    />
                                </Box>
                                <Box sx={{
                                    width: 48, height: 48, borderRadius: 2,
                                    bgcolor: match >= 80 ? "rgba(91,168,125,0.15)" : `${ACCENT}15`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <Typography fontWeight={800} fontSize="1.3rem"
                                        sx={{ color: match >= 80 ? "#5ba87d" : ACCENT }}>
                                        {match}%
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {/* Bio */}
                        {fullProfile?.bio && (
                            <Box>
                                <Typography sx={{
                                    fontSize: "0.7rem", fontWeight: 600,
                                    textTransform: "uppercase", letterSpacing: "0.5px",
                                    color: textSec, mb: 1,
                                }}>
                                    About
                                </Typography>
                                <Typography fontSize="0.85rem" sx={{ color: textPri, lineHeight: 1.7, whiteSpace: "pre-line" }}>
                                    {fullProfile.bio}
                                </Typography>
                            </Box>
                        )}

                        {/* Skills */}
                        {skills.length > 0 && (
                            <Box>
                                <Typography sx={{
                                    fontSize: "0.7rem", fontWeight: 600,
                                    textTransform: "uppercase", letterSpacing: "0.5px",
                                    color: textSec, mb: 1.2,
                                }}>
                                    Skills & Expertise ({skills.length})
                                </Typography>
                                <Box sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                                    gap: 1,
                                }}>
                                    {skills.map((sk, j) => (
                                        <Box key={sk} sx={{
                                            display: "flex", alignItems: "center", gap: 0.8,
                                            px: 1.2, py: 0.6, borderRadius: 2,
                                            bgcolor: `${SKILL_COLORS[j % SKILL_COLORS.length]}0C`,
                                            border: `1px solid ${SKILL_COLORS[j % SKILL_COLORS.length]}25`,
                                        }}>
                                            <CodeOutlinedIcon sx={{ fontSize: 11, color: SKILL_COLORS[j % SKILL_COLORS.length] }} />
                                            <Typography fontSize="0.7rem" fontWeight={500}
                                                sx={{ color: SKILL_COLORS[j % SKILL_COLORS.length] }}>
                                                {sk}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Empty state */}
                        {!profLoading && !fullProfile?.bio && skills.length === 0 && (
                            <Box sx={{
                                textAlign: "center", py: 4,
                                border: `1px dashed ${A22}`,
                                borderRadius: 3, bgcolor: a10,
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

            {/* ── Footer ── */}
            <Box sx={{
                px: 3, py: 2,
                borderTop: `1px solid ${border}`,
                display: "flex", alignItems: "center",
                justifyContent: "flex-end", gap: 1.5,
            }}>
                <Button onClick={onClose}
                    sx={{ color: textSec, textTransform: "none", fontWeight: 500 }}>
                    Close
                </Button>

                {/* زر Invite يظهر فقط لما showInvite={true} */}
                {showInvite && (
                    <Button
                        variant="contained"
                        disabled={isInvited || isInviting}
                        startIcon={
                            isInviting ? null :
                                isInvited
                                    ? <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
                                    : <PersonAddOutlinedIcon sx={{ fontSize: 16 }} />
                        }
                        onClick={() => { onInvite(sid); onClose(); }}
                        sx={{
                            bgcolor: isInvited ? "#5ba87d" : ACCENT,
                            "&:hover": { bgcolor: isInvited ? "#4e9470" : "#be7a4f" },
                            borderRadius: 2, px: 3.5, py: 0.9,
                            textTransform: "none", fontWeight: 700,
                        }}
                    >
                        {isInviting
                            ? <CircularProgress size={14} sx={{ color: "#fff" }} />
                            : isInvited ? "Invited ✓" : "Send Invite"
                        }
                    </Button>
                )}
            </Box>
        </Dialog>
    );
}

// ══════════════════════════════════════════════════════════════════════
// StudentCard — الكارد الكامل
// ══════════════════════════════════════════════════════════════════════
export function StudentCard({
    student,
    isInvited = false,
    isInviting = false,
    onInvite = () => { },
    onViewProfile,          // callback اختياري — لو مش موجود بيفتح مودال داخلي
    showInvite = true,    // false في Discovery Hub
    profilesCache = {},     // cache خارجي اختياري (من الصفحة الأب)
}) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    // مودال داخلي — يُستخدم لما مفيش onViewProfile خارجي
    const [internalProfileOpen, setInternalProfileOpen] = useState(false);

    const a10 = isDark ? A10_DARK : A10_LIGHT;
    const textPri = theme.palette.text.primary;
    const textSec = theme.palette.text.secondary;
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";

    const sid = getId(student);
    const name = student?.fullName ?? student?.name ?? student?.username ?? "Student";
    const dept = student?.department ?? student?.dept ?? "";
    const match = student?.matchPercentage ?? student?.match ?? null;
    const deptColor = DEPT_CLR[dept] ?? ACCENT;

    // مهارات — من الكاش الخارجي أو من الطالب مباشرة
    const cachedProfile = profilesCache[sid] ?? null;
    const skills = getSkillsFromStudent(student, cachedProfile);

    // Bio من الكاش أو من الطالب
    const bio = cachedProfile?.bio ?? student?.bio ?? student?.description ?? "";
    const bioPreview = bio && bio.length > 70 ? `${bio.substring(0, 70)}...` : bio;
    const topSkills = skills.slice(0, 5);

    const avatarLetters = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

    const handleViewProfile = () => {
        if (onViewProfile) {
            onViewProfile(student);
        } else {
            setInternalProfileOpen(true);
        }
    };

    return (
        <>
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
                    display: "flex", flexDirection: "column",
                    overflow: "hidden", position: "relative",
                    backdropFilter: "blur(2px)",
                    "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: theme.shadows[12],
                        borderColor: isInvited ? ACCENT : `${ACCENT}80`,
                    },
                }}
            >
                {/* Decorative gradient */}
                <Box sx={{
                    position: "absolute", top: 0, right: 0,
                    width: "40%", height: "40%",
                    background: `radial-gradient(circle, ${deptColor}15 0%, transparent 70%)`,
                    borderRadius: "0 0 0 100%",
                    pointerEvents: "none",
                }} />

                {/* Cover */}
                <Box sx={{
                    height: 85,
                    background: `linear-gradient(135deg, ${deptColor}50 0%, ${deptColor}20 100%)`,
                    position: "relative", overflow: "hidden",
                }}>
                    <Box sx={{
                        position: "absolute", inset: 0,
                        backgroundImage: `radial-gradient(circle at 20% 40%, ${deptColor}40 1px, transparent 1px)`,
                        backgroundSize: "20px 20px",
                    }} />
                    {isInvited && (
                        <Box sx={{
                            position: "absolute", top: 12, right: 12,
                            bgcolor: `${ACCENT}dd`, borderRadius: 2,
                            px: 1, py: 0.3,
                            display: "flex", alignItems: "center", gap: 0.5, zIndex: 2,
                        }}>
                            <CheckCircleOutlineIcon sx={{ fontSize: 12, color: "#fff" }} />
                            <Typography fontSize="0.65rem" fontWeight={600} sx={{ color: "#fff" }}>Invited</Typography>
                        </Box>
                    )}
                </Box>

                {/* Avatar */}
                <Box sx={{ px: 2, mt: "-20px", position: "relative", zIndex: 2 }}>
                    <Avatar sx={{
                        width: 56, height: 56,
                        bgcolor: deptColor,
                        fontSize: "1.2rem", fontWeight: 700,
                        borderRadius: "16px",
                        border: `3px solid ${theme.palette.background.paper}`,
                        boxShadow: `0 4px 12px ${deptColor}60`,
                    }}>
                        {avatarLetters}
                    </Avatar>
                </Box>

                {/* Content */}
                <Box sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column" }}>
                    {/* Name + Match */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: textPri }}>
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
                                        fontSize: "0.65rem", fontWeight: 700,
                                        height: 24, borderRadius: 1.5,
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
                                bgcolor: `${deptColor}10`, color: deptColor,
                                fontSize: "0.65rem", fontWeight: 500,
                                height: 24, borderRadius: 1.5,
                                width: "fit-content", mb: 1.5,
                            }}
                        />
                    )}

                    {/* Bio Preview */}
                    {bioPreview && (
                        <Typography sx={{
                            fontSize: "0.75rem", color: textSec,
                            lineHeight: 1.5, mb: 1.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}>
                            {bioPreview}
                        </Typography>
                    )}

                    {/* Skills */}
                    {topSkills.length > 0 && (
                        <Box sx={{ mb: 1.5 }}>
                            <Typography sx={{
                                fontSize: "0.6rem", fontWeight: 600,
                                textTransform: "uppercase", letterSpacing: "0.5px",
                                color: textSec, mb: 1,
                                display: "flex", alignItems: "center", gap: 0.5,
                            }}>
                                <StarIcon sx={{ fontSize: 10, color: ACCENT }} />
                                Skills
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                                {topSkills.map((sk, j) => {
                                    const color = SKILL_COLORS[j % SKILL_COLORS.length];
                                    return (
                                        <Box key={sk} sx={{
                                            display: "flex", alignItems: "center",
                                            justifyContent: "center", gap: 0.6,
                                            minWidth: 32, height: 32, px: 1.2,
                                            borderRadius: "30px",
                                            background: `linear-gradient(135deg, ${color}18 0%, ${color}0C 100%)`,
                                            border: `1px solid ${color}40`,
                                            transition: "all 0.2s",
                                            "&:hover": {
                                                transform: "scale(1.05)",
                                                background: `linear-gradient(135deg, ${color}28 0%, ${color}18 100%)`,
                                                borderColor: color,
                                            },
                                        }}>
                                            <CodeOutlinedIcon sx={{ fontSize: 12, color }} />
                                            <Typography sx={{
                                                fontSize: "0.7rem", fontWeight: 500,
                                                color, whiteSpace: "nowrap",
                                            }}>
                                                {sk.length > 12 ? sk.substring(0, 10) + ".." : sk}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                                {skills.length > 5 && (
                                    <Box sx={{
                                        display: "flex", alignItems: "center",
                                        justifyContent: "center",
                                        width: 32, height: 32, borderRadius: "30px",
                                        bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                                    }}>
                                        <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: textSec }}>
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
                                variant="determinate" value={match}
                                sx={{
                                    height: 4, borderRadius: 2,
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
                    <Stack direction="row" spacing={1.5} sx={{ mt: match === null ? "auto" : 0 }}>
                        {/* View Profile — دايماً موجود */}
                        <Button
                            size="small"
                            variant="text"
                            onClick={handleViewProfile}
                            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                            sx={{
                                fontSize: "0.7rem", fontWeight: 600,
                                borderRadius: 2, textTransform: "none",
                                color: ACCENT,
                                "&:hover": { bgcolor: `${ACCENT}08` },
                            }}
                        >
                            View Profile
                        </Button>

                        {/* Invite — يظهر فقط لما showInvite={true} */}
                        {showInvite && (
                            <Button
                                size="small"
                                variant={isInvited ? "contained" : "outlined"}
                                startIcon={
                                    isInviting ? null :
                                        isInvited
                                            ? <CheckCircleOutlineIcon sx={{ fontSize: 13 }} />
                                            : <PersonAddOutlinedIcon sx={{ fontSize: 13 }} />
                                }
                                disabled={isInviting || isInvited}
                                onClick={(e) => { e.stopPropagation(); onInvite(sid); }}
                                sx={{
                                    fontSize: "0.7rem", fontWeight: 600,
                                    borderRadius: 2, textTransform: "none", px: 1.5,
                                    bgcolor: isInvited ? ACCENT : "transparent",
                                    borderColor: isInvited ? ACCENT : border,
                                    color: isInvited ? "#fff" : ACCENT,
                                    "&:hover": {
                                        bgcolor: isInvited ? "#be7a4f" : `${ACCENT}12`,
                                        borderColor: ACCENT,
                                    },
                                }}
                            >
                                {isInviting
                                    ? <CircularProgress size={12} sx={{ color: ACCENT }} />
                                    : isInvited ? "Invited" : "Invite"
                                }
                            </Button>
                        )}
                    </Stack>
                </Box>
            </Paper>

            {/* مودال داخلي — يُستخدم فقط لما مفيش onViewProfile خارجي */}
            {!onViewProfile && (
                <StudentProfileModal
                    open={internalProfileOpen}
                    onClose={() => setInternalProfileOpen(false)}
                    student={student}
                    showInvite={showInvite}
                    onInvite={onInvite}
                    isInvited={isInvited}
                    isInviting={isInviting}
                />
            )}
        </>
    );
}