import { useState, useEffect } from "react";
import {
    Box, Typography, Stack, Paper, Avatar, Chip, Button,
    IconButton, Tooltip, CircularProgress, Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import EditProfileModal from "./EditProfileModal";
import ProfileSetupModal from "./ProfileSetupModal";
import { useAuth } from "../../../../contexts/AuthContext";
import studentApi from "../../../../api/handler/endpoints/studentApi";

const SKILL_COLORS = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8", "#C47E7E"];

// ══════════════════════════════════════════════════════════════════════
// ✅ FIX #1: SectionCard خارج ProfilePage — لحل مشكلة الـ TextFields
//    (هنا مش بتسبب مشكلة textfield مباشرة لكن best practice)
// ══════════════════════════════════════════════════════════════════════

// normalizeProfile: backend response → UI shape
const normalizeProfile = (raw) => {
    if (!raw) return null;
    const skillsFromField = raw.field
        ? raw.field.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    return {
        fullName: raw.fullName ?? "",
        phoneNumber: raw.phoneNumber ?? "",
        department: raw.department ?? "",
        skills: skillsFromField,
        github: raw.gitHubLink ?? raw.github ?? "",
        linkedin: raw.linkedinLink ?? raw.linkedin ?? "",
        email: raw.personalEmail ?? raw.email ?? "",
        bio: raw.bio ?? "",
    };
};

// ✅ isProfileEmpty: يظهر Setup Modal بس لو ما في بروفايل خالص (null)
// لو البروفايل موجود حتى لو فاضي — ما نفتح Setup مرة ثانية
const isProfileEmpty = (p) => p === null;

export default function ProfilePage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const { user } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [setupOpen, setSetupOpen] = useState(false);

    // ✅ FIX #5: my-team state
    const [myTeam, setMyTeam] = useState(null);
    const [teamLoading, setTeamLoading] = useState(true);

    // ── جلب البروفايل ──────────────────────────────────────────────
    useEffect(() => {
        studentApi.getProfile()
            .then((d) => {
                const normalized = normalizeProfile(d);
                setProfile(normalized);
                // ✅ normalized === null يعني الـ response فاضي تماماً
                if (isProfileEmpty(normalized)) {
                    setSetupOpen(true);
                }
                // لو normalized موجود (حتى لو فاضي الحقول) → ما نفتح Setup
            })
            .catch((err) => {
                const status = err?.response?.status;
                if (status === 404) {
                    // ✅ ما في بروفايل أصلاً → افتح Setup
                    setSetupOpen(true);
                }
                // أي خطأ ثاني (401، 500...) → ما نفتح Setup
                setProfile(null);
            })
            .finally(() => setLoading(false));
    }, []);

    // ✅ FIX #5: جلب my-team
    useEffect(() => {
        studentApi.getMyTeam()
            .then((d) => setMyTeam(d))
            .catch(() => setMyTeam(null))
            .finally(() => setTeamLoading(false));
    }, []);

    // ── حفظ التعديلات ─────────────────────────────────────────────
    const handleSave = async (updated) => {
        try {
            await studentApi.updateProfile(updated);
            setProfile(normalizeProfile({
                fullName: updated.fullName,
                phoneNumber: updated.phoneNumber,
                department: updated.department,
                field: (updated.skills ?? []).join(","),
                gitHubLink: updated.github,
                linkedinLink: updated.linkedin,
                personalEmail: updated.email,
                bio: updated.bio,
            }));
        } catch { /* keep UI as is */ }
        setEditOpen(false);
    };

    // ✅ FIX #2: بعد إنهاء Setup Modal، خزّن البروفايل وأغلق المودال
    const handleSetupDone = (data) => {
        setProfile(normalizeProfile({
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            department: data.department,
            field: (data.skills ?? []).join(","),
            gitHubLink: data.github,
            linkedinLink: data.linkedin,
            personalEmail: data.email,
            bio: data.bio,
        }));
        setSetupOpen(false);
    };

    const displayName = profile?.fullName || user?.name || user?.username || "Student";
    const avatarLetter = displayName.charAt(0).toUpperCase();

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress size={26} sx={{ color: "#d0895b" }} />
        </Box>
    );

    /* ── Design tokens ── */
    const accent = "#d0895b";
    const a10 = isDark ? "rgba(208,137,91,0.10)" : "rgba(208,137,91,0.07)";
    const a22 = "rgba(208,137,91,0.22)";
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const cardBg = theme.palette.background.paper;
    const textPri = theme.palette.text.primary;
    const textSec = theme.palette.text.secondary;

    const sectionLabelSx = {
        fontSize: "0.68rem", fontWeight: 700,
        letterSpacing: "0.08em", textTransform: "uppercase", color: textSec,
    };

    // ✅ SectionCard كـ دالة render عادية (مش component معرّف داخل component)
    // بنستخدمها بـ JSX مباشرة — مش بتسبب مشكلة لأنها مش component منفصل
    const renderSectionCard = ({ icon: Icon, title, count, onEdit, children }) => (
        <Paper elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${border}`, bgcolor: cardBg, overflow: "hidden" }}>
            <Box sx={{
                px: 2.5, py: 1.6, borderBottom: `1px solid ${border}`,
                bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                display: "flex", alignItems: "center", gap: 1.2,
            }}>
                <Icon sx={{ fontSize: 14, color: accent }} />
                <Typography sx={sectionLabelSx}>{title}</Typography>
                {count !== undefined && (
                    <Box sx={{ px: 1, py: 0.1, borderRadius: 10, bgcolor: a10, border: `1px solid ${a22}` }}>
                        <Typography fontSize="0.64rem" fontWeight={700} sx={{ color: accent }}>{count}</Typography>
                    </Box>
                )}
                {onEdit && (
                    <Tooltip title={`Edit ${title}`}>
                        <IconButton size="small" onClick={onEdit} sx={{
                            ml: "auto", color: textSec, borderRadius: 1.5,
                            "&:hover": { color: accent, bgcolor: a10 },
                        }}>
                            <EditOutlinedIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
            <Box sx={{ px: 2.5, py: 2 }}>{children}</Box>
        </Paper>
    );

    return (
        <Box sx={{ maxWidth: 740, mx: "auto", pb: 4 }}>

            {/* ══ PROFILE HERO CARD ══════════════════════════════════════════ */}
            <Paper elevation={0} sx={{
                borderRadius: 3, border: `1px solid ${border}`,
                bgcolor: cardBg, overflow: "hidden", mb: 2,
            }}>
                {/* Cover */}
                <Box sx={{
                    height: 120, position: "relative",
                    background: isDark
                        ? `linear-gradient(135deg, #2a1f18 0%, #1e1510 100%)`
                        : `linear-gradient(135deg, #fdf0e8 0%, #f5e0cc 100%)`,
                    overflow: "hidden",
                }}>
                    {[
                        { size: 180, top: -60, right: -40, opacity: isDark ? 0.12 : 0.18 },
                        { size: 100, top: 20, right: 120, opacity: isDark ? 0.07 : 0.12 },
                        { size: 60, top: -10, left: 80, opacity: isDark ? 0.06 : 0.10 },
                    ].map((c, i) => (
                        <Box key={i} sx={{
                            position: "absolute",
                            width: c.size, height: c.size, borderRadius: "50%",
                            border: `2px solid ${accent}`,
                            top: c.top, right: c.right, left: c.left, opacity: c.opacity,
                        }} />
                    ))}
                    <Box sx={{
                        position: "absolute", inset: 0,
                        backgroundImage: `radial-gradient(${accent}30 1px, transparent 1px)`,
                        backgroundSize: "20px 20px",
                        opacity: isDark ? 0.4 : 0.5,
                    }} />
                    <Tooltip title="Edit Profile">
                        <IconButton onClick={() => setEditOpen(true)} size="small" sx={{
                            position: "absolute", top: 12, right: 14,
                            bgcolor: isDark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.7)",
                            backdropFilter: "blur(6px)",
                            border: `1px solid ${border}`, color: textSec,
                            "&:hover": { color: accent, bgcolor: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)" },
                        }}>
                            <EditOutlinedIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Avatar + social */}
                <Box sx={{ px: 3, pb: 2.5 }}>
                    <Stack direction="row" alignItems="flex-end" justifyContent="space-between"
                        sx={{ mt: "-36px", mb: 2 }}>
                        <Avatar sx={{
                            width: 72, height: 72, bgcolor: accent,
                            fontSize: "1.65rem", fontWeight: 800,
                            border: `3px solid ${cardBg}`,
                            boxShadow: `0 4px 16px ${a22}`, flexShrink: 0,
                        }}>
                            {avatarLetter}
                        </Avatar>
                        <Stack direction="row" gap={1} pb={0.5}>
                            {profile?.linkedin && (
                                <Button size="small" startIcon={<LinkedInIcon sx={{ fontSize: "14px !important" }} />}
                                    href={profile.linkedin} target="_blank" sx={{
                                        color: "#0077B5",
                                        bgcolor: isDark ? "rgba(0,119,181,0.10)" : "rgba(0,119,181,0.07)",
                                        border: "1px solid rgba(0,119,181,0.18)",
                                        borderRadius: 1.5, fontSize: "0.75rem",
                                        textTransform: "none", fontWeight: 600, px: 1.6,
                                        "&:hover": { bgcolor: "rgba(0,119,181,0.15)" },
                                    }}>LinkedIn</Button>
                            )}
                            {profile?.github && (
                                <Button size="small" startIcon={<GitHubIcon sx={{ fontSize: "14px !important" }} />}
                                    href={profile.github} target="_blank" sx={{
                                        color: textPri,
                                        bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                                        border: `1px solid ${border}`,
                                        borderRadius: 1.5, fontSize: "0.75rem",
                                        textTransform: "none", fontWeight: 600, px: 1.6,
                                        "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.07)" },
                                    }}>GitHub</Button>
                            )}
                        </Stack>
                    </Stack>

                    <Typography fontWeight={800} fontSize="1.15rem" sx={{ color: textPri, lineHeight: 1.2 }}>
                        {displayName}
                    </Typography>

                    <Stack direction="row" flexWrap="wrap" gap={2} mt={1}>
                        {(profile?.email || user?.email) && (
                            <Stack direction="row" alignItems="center" gap={0.7}>
                                <EmailOutlinedIcon sx={{ fontSize: 13, color: textSec }} />
                                <Typography fontSize="0.78rem" sx={{ color: textSec }}>
                                    {profile?.email || user?.email}
                                </Typography>
                            </Stack>
                        )}
                        {profile?.phoneNumber && (
                            <Stack direction="row" alignItems="center" gap={0.7}>
                                <PhoneOutlinedIcon sx={{ fontSize: 13, color: textSec }} />
                                <Typography fontSize="0.78rem" sx={{ color: textSec }}>
                                    {profile.phoneNumber}
                                </Typography>
                            </Stack>
                        )}
                    </Stack>

                    {profile?.department && (
                        <Box sx={{ mt: 1.5 }}>
                            <Chip
                                icon={<SchoolOutlinedIcon sx={{ fontSize: "13px !important", color: `${accent} !important` }} />}
                                label={profile.department} size="small"
                                sx={{
                                    height: 26, borderRadius: 1.5,
                                    bgcolor: a10, color: accent,
                                    fontWeight: 700, fontSize: "0.74rem",
                                    border: `1px solid ${a22}`,
                                }}
                            />
                        </Box>
                    )}
                </Box>
            </Paper>

            {/* ══ MY TEAM (FIX #5) ══════════════════════════════════════════ */}
            <Box mb={2}>
                {renderSectionCard({
                    icon: GroupsOutlinedIcon,
                    title: "My Team",
                    children: teamLoading ? (
                        <Box display="flex" justifyContent="center" py={1}>
                            <CircularProgress size={18} sx={{ color: accent }} />
                        </Box>
                    ) : myTeam ? (
                        <Stack spacing={1.5}>
                            {/* Team header */}
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: textPri }}>
                                        {myTeam.projectTitle || myTeam.teamName || "My Team"}
                                    </Typography>
                                    {myTeam.supervisorName && (
                                        <Typography fontSize="0.75rem" sx={{ color: textSec, mt: 0.2 }}>
                                            Supervisor: {myTeam.supervisorName}
                                        </Typography>
                                    )}
                                </Box>
                                {myTeam.status && (
                                    <Chip
                                        label={myTeam.status}
                                        size="small"
                                        sx={{
                                            height: 22, borderRadius: 1, fontSize: "0.68rem", fontWeight: 700,
                                            bgcolor: myTeam.status === "Active" ? "rgba(76,175,80,0.10)" : a10,
                                            color: myTeam.status === "Active" ? "#4caf50" : accent,
                                            border: `1px solid ${myTeam.status === "Active" ? "rgba(76,175,80,0.25)" : a22}`,
                                        }}
                                    />
                                )}
                            </Stack>

                            {/* Team members */}
                            {myTeam.members?.length > 0 && (
                                <>
                                    <Divider sx={{ borderColor: border }} />
                                    <Stack spacing={0.8}>
                                        <Typography sx={{ ...sectionLabelSx, fontSize: "0.62rem" }}>
                                            Members ({myTeam.members.length})
                                        </Typography>
                                        {myTeam.members.map((member, i) => (
                                            <Stack key={i} direction="row" alignItems="center" gap={1.2}>
                                                <Avatar sx={{
                                                    width: 28, height: 28, bgcolor: accent,
                                                    fontSize: "0.72rem", fontWeight: 700,
                                                }}>
                                                    {(member.fullName || member.name || "?").charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography fontSize="0.8rem" fontWeight={600} sx={{ color: textPri }} noWrap>
                                                        {member.fullName || member.name || member.username}
                                                    </Typography>
                                                    {member.email && (
                                                        <Typography fontSize="0.7rem" sx={{ color: textSec }} noWrap>
                                                            {member.email}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                {member.isLeader && (
                                                    <Chip label="Leader" size="small" sx={{
                                                        height: 18, fontSize: "0.6rem", fontWeight: 700,
                                                        bgcolor: a10, color: accent, border: `1px solid ${a22}`,
                                                    }} />
                                                )}
                                            </Stack>
                                        ))}
                                    </Stack>
                                </>
                            )}
                        </Stack>
                    ) : (
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" gap={1}>
                                <PersonSearchOutlinedIcon sx={{ fontSize: 16, color: textSec }} />
                                <Typography fontSize="0.83rem" sx={{ color: textSec }}>
                                    You're not in a team yet.
                                </Typography>
                            </Stack>
                        </Stack>
                    ),
                })}
            </Box>

            {/* ══ ABOUT ══════════════════════════════════════════════════════ */}
            {profile?.bio && (
                <Box mb={2}>
                    {renderSectionCard({
                        icon: PersonOutlineIcon,
                        title: "About",
                        children: (
                            <Typography sx={{ fontSize: "0.875rem", color: textSec, lineHeight: 1.85, whiteSpace: "pre-line" }}>
                                {profile.bio}
                            </Typography>
                        ),
                    })}
                </Box>
            )}

            {/* ══ SKILLS ═════════════════════════════════════════════════════ */}
            <Box mb={2}>
                {renderSectionCard({
                    icon: CodeOutlinedIcon,
                    title: "Skills",
                    count: profile?.skills?.length > 0 ? profile.skills.length : undefined,
                    onEdit: () => setEditOpen(true),
                    children: profile?.skills?.length > 0 ? (
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {profile.skills.map((skill, i) => (
                                <Chip key={skill} label={skill} sx={{
                                    height: 27, borderRadius: 1.5,
                                    fontSize: "0.75rem", fontWeight: 600,
                                    bgcolor: `${SKILL_COLORS[i % SKILL_COLORS.length]}14`,
                                    color: SKILL_COLORS[i % SKILL_COLORS.length],
                                    border: `1px solid ${SKILL_COLORS[i % SKILL_COLORS.length]}2e`,
                                }} />
                            ))}
                        </Stack>
                    ) : (
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography fontSize="0.83rem" sx={{ color: textSec }}>No skills added yet.</Typography>
                            <Button size="small" onClick={() => setEditOpen(true)} sx={{
                                color: accent, bgcolor: a10, border: `1px solid ${a22}`,
                                borderRadius: 1.5, fontSize: "0.76rem",
                                textTransform: "none", fontWeight: 600, px: 1.8,
                                "&:hover": { bgcolor: a22 },
                            }}>+ Add Skills</Button>
                        </Stack>
                    ),
                })}
            </Box>

            {/* ══ EMPTY STATE ════════════════════════════════════════════════ */}
            {!profile?.bio && !profile?.linkedin && !profile?.github && !profile?.skills?.length && (
                <Paper elevation={0} sx={{
                    borderRadius: 3, border: `1px dashed ${a22}`,
                    bgcolor: a10, p: 4, textAlign: "center",
                }}>
                    <Box sx={{
                        width: 40, height: 40, borderRadius: 2, bgcolor: a22,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        mx: "auto", mb: 1.8,
                    }}>
                        <PersonOutlineIcon sx={{ fontSize: 20, color: accent }} />
                    </Box>
                    <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: textPri, mb: 0.6 }}>
                        Your profile is empty
                    </Typography>
                    <Typography fontSize="0.82rem" sx={{ color: textSec, mb: 2.5 }}>
                        Complete your profile so teammates can discover you.
                    </Typography>
                    <Button variant="contained" size="small" onClick={() => setEditOpen(true)} sx={{
                        bgcolor: accent, "&:hover": { bgcolor: "#be7a4f", boxShadow: "none" },
                        borderRadius: 2, px: 3, textTransform: "none",
                        fontWeight: 700, fontSize: "0.85rem", boxShadow: "none",
                    }}>
                        Complete Profile
                    </Button>
                </Paper>
            )}

            {/* ✅ FIX #2: Setup Modal — بس يظهر لما البروفايل فاضي */}
            <ProfileSetupModal
                open={setupOpen}
                onDone={handleSetupDone}
            />

            {/* Edit Modal */}
            <EditProfileModal
                open={editOpen}
                profile={profile}
                onSave={handleSave}
                onClose={() => setEditOpen(false)}
            />
        </Box>
    );
}