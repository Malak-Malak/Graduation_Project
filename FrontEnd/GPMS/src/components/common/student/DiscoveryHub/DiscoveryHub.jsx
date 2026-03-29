import { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Stack, Tab, Tabs, TextField,
    InputAdornment, CircularProgress, Grid, Paper,
    Avatar, Chip, Dialog, DialogContent,
    IconButton, Tooltip, Button, Divider,
    Snackbar, Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import SearchIcon from "@mui/icons-material/Search";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import CloseIcon from "@mui/icons-material/Close";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";

import studentApi from "../../../../api/handler/endpoints/studentApi";
import UserProfileApi from "../../../../api/handler/endpoints/UserProfileApi";

/* ─── Design Tokens ────────────────────────────────────────────── */
const ACCENT = "#C97B4B";
const ACCENT_2 = "#5B8FA8";
const ACCENT_3 = "#6D8A7D";
const ACCENT_4 = "#9B7EC8";
const ACCENT_5 = "#A85B6D";
const ACCENT_6 = "#7A9E5B";

const PALETTE = [ACCENT, ACCENT_2, ACCENT_3, ACCENT_4, ACCENT_5, ACCENT_6];
const SKILL_COLORS = [
    { bg: "#C97B4B1A", border: "#C97B4B40", text: "#C97B4B" },
    { bg: "#5B8FA81A", border: "#5B8FA840", text: "#5B8FA8" },
    { bg: "#6D8A7D1A", border: "#6D8A7D40", text: "#6D8A7D" },
    { bg: "#9B7EC81A", border: "#9B7EC840", text: "#9B7EC8" },
    { bg: "#A85B6D1A", border: "#A85B6D40", text: "#A85B6D" },
    { bg: "#7A9E5B1A", border: "#7A9E5B40", text: "#7A9E5B" },
];

const getId = (s) => s?.userId ?? s?.id ?? s?._id ?? null;
const ini = (name = "") =>
    (name ?? "?").split(" ").map(w => w[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";
const clr = (i) => PALETTE[i % PALETTE.length];
const sClr = (i) => SKILL_COLORS[i % SKILL_COLORS.length];

const normalizeProfile = (raw) => {
    if (!raw) return null;
    return {
        fullName: raw.fullName ?? "",
        phoneNumber: raw.phoneNumber ?? "",
        department: raw.department ?? "",
        github: raw.gitHubLink ?? raw.github ?? "",
        linkedin: raw.linkedinLink ?? raw.linkedin ?? "",
        email: raw.personalEmail ?? raw.email ?? "",
        bio: raw.bio ?? "",
        skills: raw.field
            ? raw.field.split(",").map(s => s.trim()).filter(Boolean)
            : raw.skills ?? [],
    };
};

/* ════════════════════════════════════════════════════════════════
   STUDENT PROFILE DIALOG
════════════════════════════════════════════════════════════════ */
function StudentProfileDialog({ open, onClose, student }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const border = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)";
    const paperBg = theme.palette.background.paper;

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);

    const sid = getId(student);
    const name = student?.fullName ?? student?.name ?? "Student";
    const dept = student?.department ?? "";

    useEffect(() => {
        if (!open || !sid) return;
        setProfile(null);
        setLoading(true);
        UserProfileApi.getProfileById(sid)
            .then(d => setProfile(normalizeProfile(d)))
            .catch(() => setProfile(null))
            .finally(() => setLoading(false));
    }, [open, sid]);

    const skills = profile?.skills ?? (student?.field ? student.field.split(",").map(s => s.trim()).filter(Boolean) : []);
    const displayName = profile?.fullName || name;
    const displayDept = profile?.department || dept;
    const colorIdx = Math.abs((sid ?? 0) + name.charCodeAt(0)) % PALETTE.length;
    const avatarColor = clr(colorIdx);

    if (!student) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "20px",
                    overflow: "hidden",
                    border: `1px solid ${border}`,
                    bgcolor: isDark ? "#1E2025" : "#FFFFFF",
                    boxShadow: isDark
                        ? "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)"
                        : "0 40px 100px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)",
                }
            }}>

            {/* Banner */}
            <Box sx={{
                height: 108,
                position: "relative",
                background: isDark
                    ? `linear-gradient(135deg, ${avatarColor}30 0%, ${avatarColor}10 100%)`
                    : `linear-gradient(135deg, ${avatarColor}18 0%, ${avatarColor}08 100%)`,
                overflow: "hidden",
            }}>
                {/* dot pattern */}
                <Box sx={{
                    position: "absolute", inset: 0,
                    backgroundImage: `radial-gradient(${avatarColor}30 1.5px, transparent 1.5px)`,
                    backgroundSize: "24px 24px",
                }} />
                {/* diagonal stripe */}
                <Box sx={{
                    position: "absolute", bottom: -20, right: -20,
                    width: 120, height: 120,
                    background: `radial-gradient(circle, ${avatarColor}25 0%, transparent 70%)`,
                    borderRadius: "50%",
                }} />
                <IconButton size="small" onClick={onClose} sx={{
                    position: "absolute", top: 12, right: 12,
                    bgcolor: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(8px)",
                    border: `1px solid ${border}`,
                    color: tSec,
                    width: 28, height: 28,
                    "&:hover": { color: avatarColor },
                    transition: "all 0.18s",
                    zIndex: 2,
                }}>
                    <CloseIcon sx={{ fontSize: 13 }} />
                </IconButton>
            </Box>

            {/* Avatar overlapping banner */}
            <Box sx={{ px: 3, mt: "-34px", mb: 0, position: "relative", zIndex: 1 }}>
                <Box sx={{
                    width: 68, height: 68,
                    borderRadius: "18px",
                    background: `linear-gradient(145deg, ${avatarColor}, ${avatarColor}bb)`,
                    border: `3px solid ${isDark ? "#1E2025" : "#FFFFFF"}`,
                    boxShadow: `0 8px 24px ${avatarColor}50`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.45rem", fontWeight: 800, color: "#fff",
                    letterSpacing: "-1px",
                }}>
                    {ini(displayName)}
                </Box>
            </Box>

            {/* Identity */}
            <Box sx={{ px: 3, pt: 1.5, pb: 1.5 }}>
                <Typography fontWeight={800} fontSize="1.2rem" sx={{ color: tPri, lineHeight: 1.25, mb: 0.5 }}>
                    {displayName}
                </Typography>

                <Stack direction="row" flexWrap="wrap" gap={1.5} mb={1}>
                    {(profile?.email || student?.email) && (
                        <Stack direction="row" alignItems="center" gap={0.5}>
                            <EmailOutlinedIcon sx={{ fontSize: 12, color: tSec }} />
                            <Typography fontSize="0.73rem" sx={{ color: tSec }}>
                                {profile?.email || student?.email}
                            </Typography>
                        </Stack>
                    )}
                    {profile?.phoneNumber && (
                        <Stack direction="row" alignItems="center" gap={0.5}>
                            <PhoneOutlinedIcon sx={{ fontSize: 12, color: tSec }} />
                            <Typography fontSize="0.73rem" sx={{ color: tSec }}>{profile.phoneNumber}</Typography>
                        </Stack>
                    )}
                </Stack>

                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                    {displayDept && (
                        <Chip
                            icon={<SchoolOutlinedIcon sx={{ fontSize: "11px !important", color: `${avatarColor} !important` }} />}
                            label={displayDept}
                            size="small"
                            sx={{
                                height: 26, borderRadius: "9px",
                                bgcolor: `${avatarColor}14`,
                                color: avatarColor,
                                fontWeight: 700, fontSize: "0.71rem",
                                border: `1px solid ${avatarColor}2E`,
                            }}
                        />
                    )}
                    {profile?.linkedin && (
                        <Tooltip title="LinkedIn">
                            <IconButton component="a" href={profile.linkedin} target="_blank" size="small"
                                sx={{
                                    width: 28, height: 28, borderRadius: "8px",
                                    bgcolor: isDark ? "rgba(0,119,181,0.15)" : "rgba(0,119,181,0.08)",
                                    border: "1px solid rgba(0,119,181,0.25)",
                                    "&:hover": { bgcolor: "#0077B5", color: "#fff" },
                                    transition: "all 0.18s",
                                }}>
                                <LinkedInIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {profile?.github && (
                        <Tooltip title="GitHub">
                            <IconButton component="a" href={profile.github} target="_blank" size="small"
                                sx={{
                                    width: 28, height: 28, borderRadius: "8px",
                                    bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
                                    border: `1px solid ${border}`,
                                    "&:hover": { bgcolor: isDark ? "#fff" : "#000", color: isDark ? "#000" : "#fff" },
                                    transition: "all 0.18s",
                                }}>
                                <GitHubIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            </Box>

            <Divider sx={{ borderColor: border }} />

            <DialogContent sx={{ px: 3, py: 2.5, overflowY: "auto", maxHeight: 320 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" py={5} gap={1.5} flexDirection="column">
                        <CircularProgress size={22} sx={{ color: avatarColor }} />
                        <Typography fontSize="0.76rem" sx={{ color: tSec }}>Loading profile…</Typography>
                    </Box>
                ) : (
                    <Stack spacing={2.5}>
                        {profile?.bio && (
                            <Box>
                                <Stack direction="row" alignItems="center" gap={0.6} mb={1}>
                                    <BadgeOutlinedIcon sx={{ fontSize: 13, color: avatarColor }} />
                                    <Typography sx={{ fontSize: "0.66rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: tSec }}>
                                        About
                                    </Typography>
                                </Stack>
                                <Typography fontSize="0.83rem" sx={{ color: tPri, lineHeight: 1.7, whiteSpace: "pre-line" }}>
                                    {profile.bio}
                                </Typography>
                            </Box>
                        )}

                        {skills.length > 0 && (
                            <Box>
                                <Stack direction="row" alignItems="center" gap={0.6} mb={1}>
                                    <CodeOutlinedIcon sx={{ fontSize: 13, color: avatarColor }} />
                                    <Typography sx={{ fontSize: "0.66rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: tSec }}>
                                        Skills & Expertise ({skills.length})
                                    </Typography>
                                </Stack>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                                    {skills.map((sk, j) => {
                                        const sc = sClr(j);
                                        return (
                                            <Box key={sk} sx={{
                                                px: 1.3, py: 0.5,
                                                borderRadius: "20px",
                                                bgcolor: sc.bg,
                                                border: `1px solid ${sc.border}`,
                                                display: "flex", alignItems: "center", gap: 0.5,
                                            }}>
                                                <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: sc.text, flexShrink: 0 }} />
                                                <Typography fontSize="0.7rem" fontWeight={600} sx={{ color: sc.text }}>
                                                    {sk}
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                        )}

                        {!loading && !profile?.bio && skills.length === 0 && (
                            <Box sx={{
                                textAlign: "center", py: 5,
                                border: `1px dashed ${ACCENT}35`,
                                borderRadius: "14px",
                                bgcolor: `${ACCENT}06`,
                            }}>
                                <PersonOutlineIcon sx={{ fontSize: 30, color: ACCENT, opacity: 0.4, mb: 1 }} />
                                <Typography fontSize="0.82rem" sx={{ color: tSec }}>
                                    Profile not completed yet
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                )}
            </DialogContent>

            <Box sx={{
                px: 3, py: 2,
                borderTop: `1px solid ${border}`,
                display: "flex", justifyContent: "flex-end",
            }}>
                <Button onClick={onClose} sx={{
                    color: tSec, textTransform: "none", fontWeight: 600,
                    borderRadius: "10px", px: 2.5, fontSize: "0.8rem",
                    "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" },
                }}>
                    Close
                </Button>
            </Box>
        </Dialog>
    );
}

/* ════════════════════════════════════════════════════════════════
   STUDENT CARD — Fixed height, clean layout, strong visual hierarchy
════════════════════════════════════════════════════════════════ */
function StudentCard({ student, onViewProfile }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;

    const sid = getId(student);
    const name = student?.fullName ?? student?.name ?? "Student";
    const email = student?.email ?? student?.personalEmail ?? "";
    const dept = student?.department ?? "";
    const rawSkills = student?.field
        ? student.field.split(",").map(s => s.trim()).filter(Boolean)
        : student?.skills ?? [];
    const topSkills = rawSkills.slice(0, 3);

    const colorIdx = Math.abs((sid ?? 0) + name.charCodeAt(0)) % PALETTE.length;
    const avatarColor = clr(colorIdx);

    return (
        <Paper elevation={0} sx={{
            borderRadius: "16px",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
            bgcolor: isDark ? "#1A1D22" : "#FFFFFF",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            minHeight: 220,
            transition: "box-shadow 0.22s ease, transform 0.22s ease, border-color 0.22s ease",
            "&:hover": {
                transform: "translateY(-3px)",
                borderColor: `${avatarColor}55`,
                boxShadow: isDark
                    ? `0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px ${avatarColor}20`
                    : `0 16px 40px rgba(0,0,0,0.1), 0 0 0 1px ${avatarColor}18`,
            },
        }}>
            {/* Left color accent bar */}
            <Box sx={{
                height: 3,
                background: `linear-gradient(90deg, ${avatarColor} 0%, ${avatarColor}55 100%)`,
                flexShrink: 0,
            }} />

            <Box sx={{ p: "18px 20px 16px", flex: 1, display: "flex", flexDirection: "column" }}>

                {/* Header */}
                <Stack direction="row" alignItems="center" gap={1.5} mb={1.5}>
                    <Box sx={{
                        width: 46, height: 46,
                        borderRadius: "14px",
                        background: isDark
                            ? `linear-gradient(145deg, ${avatarColor}25, ${avatarColor}10)`
                            : `linear-gradient(145deg, ${avatarColor}20, ${avatarColor}08)`,
                        border: `1.5px solid ${avatarColor}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1rem", fontWeight: 800,
                        color: avatarColor, flexShrink: 0,
                        letterSpacing: "-0.5px",
                    }}>
                        {ini(name)}
                    </Box>

                    <Box minWidth={0} flex={1}>
                        <Typography fontWeight={700} fontSize="0.92rem" noWrap sx={{ color: tPri, lineHeight: 1.3 }}>
                            {name}
                        </Typography>
                        {dept ? (
                            <Typography fontSize="0.69rem" noWrap sx={{ color: avatarColor, fontWeight: 600, mt: 0.2 }}>
                                {dept}
                            </Typography>
                        ) : email ? (
                            <Typography fontSize="0.69rem" noWrap sx={{ color: tSec, mt: 0.2 }}>
                                {email}
                            </Typography>
                        ) : null}
                    </Box>
                </Stack>

                {/* Skills */}
                {topSkills.length > 0 ? (
                    // <Box mb={0} sx={{ height: 60 }}>
                    //     <Typography sx={{
                    //         fontSize: "0.62rem", fontWeight: 700,
                    //         textTransform: "uppercase", letterSpacing: "0.7px",
                    //         color: tSec, mb: 0.9,
                    //     }}>
                    //         Skills
                    //     </Typography>
                    //     <Stack direction="row" flexWrap="wrap" gap={0.6}>
                    //         {topSkills.map((sk, j) => {
                    //             const sc = sClr(j);
                    //             return (
                    //                 <Box key={sk} sx={{
                    //                     px: 1.1, py: "3px",
                    //                     borderRadius: "7px",
                    //                     bgcolor: sc.bg,
                    //                     border: `1px solid ${sc.border}`,
                    //                 }}>
                    //                     <Typography fontSize="0.65rem" fontWeight={600} sx={{ color: sc.text }}>
                    //                         {sk.length > 14 ? sk.slice(0, 12) + "…" : sk}
                    //                     </Typography>
                    //                 </Box>
                    //             );
                    //         })}
                    //         {rawSkills.length > 3 && (
                    //             <Box sx={{
                    //                 px: 1.1, py: "3px",
                    //                 borderRadius: "7px",
                    //                 bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                    //                 border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
                    //             }}>
                    //                 <Typography fontSize="0.65rem" fontWeight={600} sx={{ color: tSec }}>
                    //                     +{rawSkills.length - 3}
                    //                 </Typography>
                    //             </Box>
                    //         )}
                    //     </Stack>
                    // </Box>
                    <Box sx={{ height: 60 }}>
                        {topSkills.length > 0 ? (
                            <>
                                <Typography sx={{
                                    fontSize: "0.62rem",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.7px",
                                    color: tSec,
                                    mb: 0.9,
                                }}>
                                    Skills
                                </Typography>

                                <Stack direction="row" flexWrap="wrap" gap={0.6}>
                                    {topSkills.map((sk, j) => {
                                        const sc = sClr(j);
                                        return (
                                            <Box key={sk} sx={{
                                                px: 1.1,
                                                py: "3px",
                                                borderRadius: "7px",
                                                bgcolor: sc.bg,
                                                border: `1px solid ${sc.border}`,
                                            }}>
                                                <Typography fontSize="0.65rem" fontWeight={600} sx={{ color: sc.text }}>
                                                    {sk.length > 14 ? sk.slice(0, 12) + "…" : sk}
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            </>
                        ) : (
                            <Typography
                                fontSize="0.73rem"
                                sx={{ color: tSec, fontStyle: "italic", mt: 1 }}
                            >
                                No skills listed
                            </Typography>
                        )}
                    </Box>
                ) : (
                    <Typography fontSize="0.73rem" sx={{ color: tSec, fontStyle: "italic" }}>
                        No skills listed
                    </Typography>
                )}

                <Box flex={1} />

                {/* View Profile button */}
                <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    startIcon={<InfoOutlinedIcon sx={{ fontSize: 13 }} />}
                    onClick={() => onViewProfile(student)}
                    sx={{
                        mt: "auto",
                        borderRadius: "10px",
                        textTransform: "none",
                        fontSize: "0.73rem",
                        fontWeight: 600,
                        py: 0.85,
                        borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
                        color: tSec,
                        "&:hover": {
                            borderColor: avatarColor,
                            color: avatarColor,
                            bgcolor: `${avatarColor}0A`,
                        },
                        transition: "all 0.18s",
                    }}
                >
                    View Profile
                </Button>
            </Box>
        </Paper>
    );
}

/* ════════════════════════════════════════════════════════════════
   TEAM DETAIL DIALOG
════════════════════════════════════════════════════════════════ */
function TeamDetailDialog({ open, onClose, team }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const border = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)";

    if (!team) return null;

    const project = team.projectTitle ?? team.project ?? "—";
    const desc = team.projectDescription ?? team.description ?? null;
    const supervisor = team.supervisorName ?? team.supervisor?.fullName ?? null;
    const membersCount = team.membersCount ?? 0;
    const remaining = team.remainingSlots ?? 0;
    const maxMembers = membersCount + remaining;
    const memberNames = team.memberNames ?? [];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "20px", overflow: "hidden",
                    border: `1px solid ${border}`,
                    bgcolor: isDark ? "#1E2025" : "#FFFFFF",
                    boxShadow: isDark
                        ? "0 40px 100px rgba(0,0,0,0.7)"
                        : "0 40px 100px rgba(0,0,0,0.15)",
                }
            }}>

            {/* Banner */}
            <Box sx={{
                height: 100,
                background: isDark
                    ? `linear-gradient(135deg, ${ACCENT}28 0%, ${ACCENT}0A 100%)`
                    : `linear-gradient(135deg, ${ACCENT}14 0%, ${ACCENT}05 100%)`,
                position: "relative", overflow: "hidden",
            }}>
                <Box sx={{
                    position: "absolute", inset: 0,
                    backgroundImage: `radial-gradient(${ACCENT}25 1.5px, transparent 1.5px)`,
                    backgroundSize: "22px 22px",
                }} />
                <IconButton size="small" onClick={onClose} sx={{
                    position: "absolute", top: 12, right: 12,
                    bgcolor: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)",
                    border: `1px solid ${border}`, color: tSec,
                    width: 28, height: 28,
                    "&:hover": { color: ACCENT },
                    transition: "all 0.18s",
                    zIndex: 2,
                }}>
                    <CloseIcon sx={{ fontSize: 13 }} />
                </IconButton>
            </Box>

            <Box sx={{ px: 3, mt: "-28px", mb: 0, position: "relative", zIndex: 1 }}>
                <Box sx={{
                    width: 56, height: 56,
                    borderRadius: "16px",
                    background: `linear-gradient(145deg, ${ACCENT}, ${ACCENT}bb)`,
                    border: `3px solid ${isDark ? "#1E2025" : "#FFFFFF"}`,
                    boxShadow: `0 6px 20px ${ACCENT}45`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.2rem", fontWeight: 800, color: "#fff",
                    letterSpacing: "-0.5px",
                }}>
                    {ini(project)}
                </Box>
            </Box>

            <Box sx={{ px: 3, pt: 1.5, pb: 1 }}>
                <Typography fontWeight={800} fontSize="1.1rem" sx={{ color: tPri, mb: 0.8 }}>
                    {project}
                </Typography>
                <Stack direction="row" gap={0.7} flexWrap="wrap">
                    {supervisor && (
                        <Chip
                            icon={<SchoolOutlinedIcon sx={{ fontSize: "11px !important", color: `${tSec} !important` }} />}
                            label={supervisor} size="small"
                            sx={{
                                height: 24, borderRadius: "8px",
                                bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
                                color: tSec, fontSize: "0.69rem", fontWeight: 600,
                            }}
                        />
                    )}
                    <Chip
                        icon={<PeopleOutlineIcon sx={{ fontSize: "11px !important", color: `${ACCENT} !important` }} />}
                        label={`${membersCount} / ${maxMembers} members`}
                        size="small"
                        sx={{
                            height: 24, borderRadius: "8px",
                            bgcolor: `${ACCENT}14`, color: ACCENT,
                            fontSize: "0.69rem", fontWeight: 700,
                            border: `1px solid ${ACCENT}2E`,
                        }}
                    />
                    {remaining > 0 && (
                        <Chip
                            label={`${remaining} slot${remaining !== 1 ? "s" : ""} open`}
                            size="small"
                            sx={{
                                height: 24, borderRadius: "8px",
                                bgcolor: "rgba(61,185,122,0.1)",
                                color: "#3DB97A",
                                fontSize: "0.69rem", fontWeight: 700,
                                border: "1px solid rgba(61,185,122,0.25)",
                            }}
                        />
                    )}
                </Stack>
            </Box>

            <Divider sx={{ borderColor: border, mx: 0, mt: 1.5 }} />

            <DialogContent sx={{ px: 3, py: 2.5 }}>
                <Stack spacing={2.5}>
                    {desc && (
                        <Box>
                            <Typography sx={{ fontSize: "0.66rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: tSec, mb: 0.8 }}>
                                Project Description
                            </Typography>
                            <Typography fontSize="0.83rem" sx={{ color: tPri, lineHeight: 1.7 }}>{desc}</Typography>
                        </Box>
                    )}

                    <Box>
                        <Typography sx={{ fontSize: "0.66rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: tSec, mb: 1 }}>
                            Members ({memberNames.length}{maxMembers > 0 ? ` / ${maxMembers}` : ""})
                        </Typography>

                        {memberNames.length === 0 ? (
                            <Typography fontSize="0.82rem" sx={{ color: tSec }}>No members yet</Typography>
                        ) : (
                            <Stack gap={0.7}>
                                {memberNames.map((mName, i) => (
                                    <Stack key={i} direction="row" alignItems="center" gap={1.2}
                                        sx={{
                                            p: "10px 14px", borderRadius: "12px",
                                            border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
                                            bgcolor: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.018)",
                                        }}>
                                        <Box sx={{
                                            width: 32, height: 32, borderRadius: "10px",
                                            bgcolor: clr(i),
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "0.72rem", fontWeight: 700, color: "#fff",
                                        }}>
                                            {ini(mName)}
                                        </Box>
                                        <Typography fontWeight={600} fontSize="0.83rem" sx={{ color: tPri }}>
                                            {mName}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        )}
                    </Box>
                </Stack>
            </DialogContent>

            <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${border}`, display: "flex", justifyContent: "flex-end" }}>
                <Button onClick={onClose} sx={{
                    color: tSec, textTransform: "none", fontWeight: 600,
                    borderRadius: "10px", px: 2.5, fontSize: "0.8rem",
                    "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" },
                }}>
                    Close
                </Button>
            </Box>
        </Dialog>
    );
}

/* ════════════════════════════════════════════════════════════════
   TEAM CARD — Matches student card design language
════════════════════════════════════════════════════════════════ */
function TeamCard({ team, onView }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;

    const project = team.projectTitle ?? team.project ?? "—";
    const desc = team.projectDescription ?? team.description ?? null;
    const supervisor = team.supervisorName ?? team.supervisor?.fullName ?? null;
    const memberNames = team.memberNames ?? [];
    const membersCount = team.membersCount ?? memberNames.length ?? 0;
    const remaining = team.remainingSlots ?? 0;
    const maxMembers = membersCount + remaining;

    // derive a stable color per team from its title
    const teamColorIdx = Math.abs((team.id ?? 0) + project.charCodeAt(0)) % PALETTE.length;
    const teamColor = clr(teamColorIdx);

    return (
        <Paper elevation={0} sx={{
            borderRadius: "16px",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
            bgcolor: isDark ? "#1A1D22" : "#FFFFFF",
            overflow: "hidden",
            width: "100%",
            // minHeight: 220,
            height: "220px",
            display: "flex",
            flexDirection: "column",
            transition: "box-shadow 0.22s ease, transform 0.22s ease, border-color 0.22s ease",
            "&:hover": {
                transform: "translateY(-3px)",
                borderColor: `${teamColor}55`,
                boxShadow: isDark
                    ? `0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px ${teamColor}20`
                    : `0 16px 40px rgba(0,0,0,0.1), 0 0 0 1px ${teamColor}18`,
            },
        }}>
            <Box sx={{
                height: 3, flexShrink: 0,
                background: `linear-gradient(90deg, ${teamColor} 0%, ${teamColor}55 100%)`,
            }} />

            <Box sx={{ p: "18px 20px 16px", flex: 1, display: "flex", flexDirection: "column" }}>

                {/* Header */}
                <Stack direction="row" alignItems="center" gap={1.5} mb={1.2}>
                    <Box sx={{
                        width: 46, height: 46,
                        borderRadius: "14px",
                        background: isDark
                            ? `linear-gradient(145deg, ${teamColor}25, ${teamColor}10)`
                            : `linear-gradient(145deg, ${teamColor}20, ${teamColor}08)`,
                        border: `1.5px solid ${teamColor}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1rem", fontWeight: 800,
                        color: teamColor, flexShrink: 0,
                    }}>
                        {ini(project)}
                    </Box>
                    <Box minWidth={0} flex={1}>
                        <Typography fontWeight={700} fontSize="0.92rem" noWrap sx={{ color: tPri, lineHeight: 1.3 }}>
                            {project}
                        </Typography>
                        {supervisor && (
                            <Typography fontSize="0.69rem" noWrap sx={{ color: teamColor, fontWeight: 600, mt: 0.2 }}>
                                {supervisor}
                            </Typography>
                        )}
                    </Box>
                </Stack>

                {/* Description */}
                {desc && (
                    <Typography fontSize="0.73rem" sx={{
                        color: tSec, lineHeight: 1.55, mb: 0.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}>
                        {desc}
                    </Typography>
                )}

                {/* Member avatars + chips */}
                {memberNames.length > 0 && (
                    <Stack direction="row" alignItems="center" gap={0.8} flexWrap="wrap" mt={0.5}>
                        <Stack direction="row" alignItems="center">
                            {memberNames.slice(0, 4).map((mn, i) => (
                                <Tooltip key={i} title={mn}>
                                    <Box sx={{
                                        width: 26, height: 26,
                                        borderRadius: "8px",
                                        bgcolor: clr(i),
                                        border: `2px solid ${isDark ? "#1A1D22" : "#FFFFFF"}`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "0.58rem", fontWeight: 700, color: "#fff",
                                        ml: i === 0 ? 0 : "-6px",
                                        zIndex: 4 - i,
                                        position: "relative",
                                    }}>
                                        {ini(mn)}
                                    </Box>
                                </Tooltip>
                            ))}
                            {memberNames.length > 4 && (
                                <Box sx={{
                                    width: 26, height: 26, borderRadius: "8px",
                                    bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)",
                                    border: `2px solid ${isDark ? "#1A1D22" : "#FFFFFF"}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "0.58rem", fontWeight: 700, color: tSec,
                                    ml: "-6px", position: "relative",
                                }}>
                                    +{memberNames.length - 4}
                                </Box>
                            )}
                        </Stack>
                        <Chip
                            label={`${membersCount}/${maxMembers}`}
                            size="small"
                            sx={{
                                height: 20, borderRadius: "6px",
                                bgcolor: `${teamColor}12`, color: teamColor,
                                fontSize: "0.63rem", fontWeight: 700,
                                border: `1px solid ${teamColor}25`,
                            }}
                        />
                        {remaining > 0 && (
                            <Chip
                                label={`${remaining} open`}
                                size="small"
                                sx={{
                                    height: 20, borderRadius: "6px",
                                    bgcolor: "rgba(61,185,122,0.1)",
                                    color: "#3DB97A",
                                    fontSize: "0.63rem", fontWeight: 700,
                                    border: "1px solid rgba(61,185,122,0.22)",
                                }}
                            />
                        )}
                    </Stack>
                )}

                <Box flex={1} />

                <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    startIcon={<InfoOutlinedIcon sx={{ fontSize: 13 }} />}
                    onClick={() => onView(team)}
                    sx={{
                        mt: "auto",
                        borderRadius: "10px",
                        textTransform: "none",
                        fontSize: "0.73rem",
                        fontWeight: 600,
                        py: 0.85,
                        borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
                        color: tSec,
                        "&:hover": {
                            borderColor: teamColor,
                            color: teamColor,
                            bgcolor: `${teamColor}0A`,
                        },
                        transition: "all 0.18s",
                    }}
                >
                    View Details
                </Button>
            </Box>
        </Paper>
    );
}

/* ════════════════════════════════════════════════════════════════
   DISCOVERY HUB — MAIN
════════════════════════════════════════════════════════════════ */
export default function DiscoveryHub() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;

    const cardBg = isDark ? "#1A1D22" : "#FFFFFF";
    const pageBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
    const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

    const [tab, setTab] = useState(0);

    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [searchStudents, setSearchStudents] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);

    const [teams, setTeams] = useState([]);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const [searchTeams, setSearchTeams] = useState("");
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [teamOpen, setTeamOpen] = useState(false);

    const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
    const snap = (msg, sev = "success") => setSnack({ open: true, msg, sev });

    const fetchStudents = useCallback(async () => {
        if (students.length > 0) return;
        setLoadingStudents(true);
        try {
            const data = await studentApi.getAllStudents();
            setStudents(Array.isArray(data) ? data : []);
        } catch { snap("Failed to load students", "error"); }
        finally { setLoadingStudents(false); }
    }, [students.length]);

    const fetchTeams = useCallback(async () => {
        if (teams.length > 0) return;
        setLoadingTeams(true);
        try {
            const data = await studentApi.getAvailableTeams();
            setTeams(Array.isArray(data) ? data : []);
        } catch { snap("Failed to load teams", "error"); }
        finally { setLoadingTeams(false); }
    }, [teams.length]);

    useEffect(() => {
        if (tab === 0) fetchStudents();
        if (tab === 1) fetchTeams();
    }, [tab, fetchStudents, fetchTeams]);

    const filteredStudents = students.filter(s => {
        if (!searchStudents) return true;
        const q = searchStudents.toLowerCase();
        return (
            (s.fullName ?? s.name ?? "").toLowerCase().includes(q) ||
            (s.department ?? "").toLowerCase().includes(q) ||
            (s.field ?? "").toLowerCase().includes(q)
        );
    });

    const filteredTeams = teams.filter(t => {
        if (!searchTeams) return true;
        const q = searchTeams.toLowerCase();
        return (
            (t.projectTitle ?? "").toLowerCase().includes(q) ||
            (t.projectDescription ?? "").toLowerCase().includes(q) ||
            (t.supervisorName ?? "").toLowerCase().includes(q)
        );
    });

    /* ─── Shared search field sx ───────────────────────── */
    const searchSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            fontSize: "0.875rem",
            bgcolor: cardBg,
            "& fieldset": {
                borderColor: border,
            },
            "&:hover fieldset": {
                borderColor: `${ACCENT}55`,
            },
            "&.Mui-focused fieldset": {
                borderColor: ACCENT,
                borderWidth: "1.5px",
            },
        },
        "& .MuiOutlinedInput-input": {
            py: "10px",
        },
    };

    /* ─── Empty state ─────────────────────────────────── */
    const EmptyState = ({ msg, sub }) => (
        <Box textAlign="center" py={9}>
            <Box sx={{
                width: 60, height: 60, borderRadius: "18px", mx: "auto", mb: 2,
                bgcolor: `${ACCENT}0F`, border: `1px solid ${ACCENT}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <PersonOutlineIcon sx={{ fontSize: 28, color: ACCENT }} />
            </Box>
            <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: tPri }}>{msg}</Typography>
            <Typography fontSize="0.82rem" sx={{ color: tSec, mt: 0.5 }}>{sub}</Typography>
        </Box>
    );

    return (
        <Box sx={{ minHeight: "100%", py: 3.5, bgcolor: "transparent" }}>
            <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3 } }}>

                {/* Page header */}
                <Box sx={{ mb: 4, textAlign: "center" }}>
                    <Typography variant="h4" sx={{
                        fontWeight: 800,
                        color: tPri,
                        mb: 0.5,
                        letterSpacing: "-0.5px",
                    }}>
                        Discovery Hub
                    </Typography>
                    <Typography sx={{ color: tSec, fontSize: "0.88rem" }}>
                        Explore students and teams in your program
                    </Typography>
                </Box>

                {/* Tab bar */}
                <Box sx={{
                    mb: 3,
                    bgcolor: cardBg,
                    borderRadius: "14px",
                    border: `1px solid ${border}`,
                    overflow: "hidden",
                }}>
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        sx={{
                            px: 1,
                            minHeight: 50,
                            "& .MuiTab-root": {
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: "0.84rem",
                                minHeight: 50,
                                color: tSec,
                                transition: "color 0.18s",
                                borderRadius: "10px",
                                mx: 0.3,
                            },
                            "& .Mui-selected": { color: ACCENT },
                            "& .MuiTabs-indicator": {
                                bgcolor: ACCENT,
                                height: 2.5,
                                borderRadius: "2px",
                            },
                        }}>
                        <Tab label={
                            <Stack direction="row" alignItems="center" gap={0.9}>
                                <PeopleOutlineIcon sx={{ fontSize: 17 }} />
                                <span>Available Students</span>
                                {students.length > 0 && (
                                    <Chip
                                        label={filteredStudents.length}
                                        size="small"
                                        sx={{
                                            height: 19, minWidth: 24,
                                            bgcolor: `${ACCENT}18`,
                                            color: ACCENT,
                                            fontWeight: 700, fontSize: "0.68rem",
                                            border: `1px solid ${ACCENT}25`,
                                            borderRadius: "6px",
                                        }}
                                    />
                                )}
                            </Stack>
                        } />
                        <Tab label={
                            <Stack direction="row" alignItems="center" gap={0.9}>
                                <GroupsOutlinedIcon sx={{ fontSize: 17 }} />
                                <span>Teams</span>
                                {teams.length > 0 && (
                                    <Chip
                                        label={filteredTeams.length}
                                        size="small"
                                        sx={{
                                            height: 19, minWidth: 24,
                                            bgcolor: `${ACCENT}18`,
                                            color: ACCENT,
                                            fontWeight: 700, fontSize: "0.68rem",
                                            border: `1px solid ${ACCENT}25`,
                                            borderRadius: "6px",
                                        }}
                                    />
                                )}
                            </Stack>
                        } />
                    </Tabs>
                </Box>

                {/* ══ STUDENTS TAB ══ */}
                {tab === 0 && (
                    <Box>
                        <TextField
                            fullWidth size="small"
                            placeholder="Search by name, department or skill…"
                            value={searchStudents}
                            onChange={e => setSearchStudents(e.target.value)}
                            sx={{ mb: 3, ...searchSx }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 17, color: tSec }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {loadingStudents ? (
                            <Box display="flex" justifyContent="center" py={10}>
                                <CircularProgress size={36} sx={{ color: ACCENT }} />
                            </Box>
                        ) : filteredStudents.length === 0 ? (
                            <EmptyState
                                msg="No students found"
                                sub={searchStudents ? "Try a different search term" : "No available students right now"}
                            />
                        ) : (
                            <Grid container spacing={2.5} alignItems="stretch">
                                {filteredStudents.map((s) => {
                                    const sid = getId(s);
                                    return (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={sid ?? s.fullName ?? s.name}
                                            sx={{ display: "flex" }}>
                                            <StudentCard
                                                student={s}
                                                onViewProfile={st => { setSelectedStudent(st); setProfileOpen(true); }}
                                            />
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        )}
                    </Box>
                )}

                {/* ══ TEAMS TAB ══ */}
                {tab === 1 && (
                    <Box>
                        <TextField
                            fullWidth size="small"
                            placeholder="Search by project or supervisor…"
                            value={searchTeams}
                            onChange={e => setSearchTeams(e.target.value)}
                            sx={{ mb: 3, ...searchSx }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 17, color: tSec }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {loadingTeams ? (
                            <Box display="flex" justifyContent="center" py={10}>
                                <CircularProgress size={36} sx={{ color: ACCENT }} />
                            </Box>
                        ) : filteredTeams.length === 0 ? (
                            <EmptyState
                                msg="No teams found"
                                sub={searchTeams ? "Try a different search term" : "No teams available right now"}
                            />
                        ) : (
                            <Grid container spacing={2.5} alignItems="stretch">
                                {filteredTeams.map((team, i) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={team.id ?? team.teamId ?? i}
                                        sx={{ display: "flex" }}>
                                        <TeamCard
                                            team={team}
                                            onView={t => { setSelectedTeam(t); setTeamOpen(true); }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                )}
            </Box>

            {/* Dialogs */}
            <StudentProfileDialog
                open={profileOpen}
                onClose={() => { setProfileOpen(false); setSelectedStudent(null); }}
                student={selectedStudent}
            />
            <TeamDetailDialog
                open={teamOpen}
                onClose={() => { setTeamOpen(false); setSelectedTeam(null); }}
                team={selectedTeam}
            />

            <Snackbar
                open={snack.open}
                autoHideDuration={3500}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity={snack.sev} variant="filled" sx={{ borderRadius: "12px" }}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}