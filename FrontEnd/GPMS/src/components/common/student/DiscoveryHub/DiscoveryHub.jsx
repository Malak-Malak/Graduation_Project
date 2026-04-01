import { useState, useEffect, useCallback, useRef } from "react";
import {
    Box, Typography, Stack, Tab, Tabs, TextField,
    InputAdornment, CircularProgress, Paper,
    Chip, Dialog, DialogContent,
    IconButton, Tooltip, Button, Divider,
    Snackbar, Alert, Pagination,
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

/* ─── Tokens ─────────────────────────────────────────────────── */
const ACCENT = "#C97B4B";
const PALETTE = ["#C97B4B", "#5B8FA8", "#6D8A7D", "#9B7EC8", "#A85B6D", "#7A9E5B"];
const SK_CLR = [
    { bg: "#C97B4B1A", bd: "#C97B4B40", tx: "#C97B4B" },
    { bg: "#5B8FA81A", bd: "#5B8FA840", tx: "#5B8FA8" },
    { bg: "#6D8A7D1A", bd: "#6D8A7D40", tx: "#6D8A7D" },
    { bg: "#9B7EC81A", bd: "#9B7EC840", tx: "#9B7EC8" },
    { bg: "#A85B6D1A", bd: "#A85B6D40", tx: "#A85B6D" },
    { bg: "#7A9E5B1A", bd: "#7A9E5B40", tx: "#7A9E5B" },
];

const CARDS_PER_PAGE = 9;
const CARD_H = 220;

const getId = s => s?.userId ?? s?.id ?? s?._id ?? null;
const ini = (n = "") => (n ?? "").split(" ").map(w => w[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";
const palette = i => PALETTE[i % PALETTE.length];
const skClr = i => SK_CLR[i % SK_CLR.length];

const normProfile = raw => {
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

/* ═══════════════════════════════════════════════════════════════
   STUDENT PROFILE DIALOG
═══════════════════════════════════════════════════════════════ */
function StudentProfileDialog({ open, onClose, student }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const brd = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)";

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);

    const sid = getId(student);
    const name = student?.fullName ?? student?.name ?? "Student";
    const dept = student?.department ?? "";

    useEffect(() => {
        if (!open || !sid) return;
        setProfile(null); setLoading(true);
        UserProfileApi.getProfileById(sid)
            .then(d => setProfile(normProfile(d)))
            .catch(() => setProfile(null))
            .finally(() => setLoading(false));
    }, [open, sid]);

    const skills = profile?.skills ?? (student?.field ? student.field.split(",").map(s => s.trim()).filter(Boolean) : []);
    const displayName = profile?.fullName || name;
    const displayDept = profile?.department || dept;
    const colorIdx = Math.abs((sid ?? 0) + name.charCodeAt(0)) % PALETTE.length;
    const aClr = palette(colorIdx);

    if (!student) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "20px", overflow: "hidden",
                    border: `1px solid ${brd}`,
                    bgcolor: isDark ? "#1E2025" : "#fff",
                    boxShadow: isDark
                        ? "0 40px 100px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.04)"
                        : "0 40px 100px rgba(0,0,0,.15)",
                }
            }}>
            <Box sx={{
                height: 108, position: "relative", overflow: "hidden",
                background: isDark
                    ? `linear-gradient(135deg,${aClr}30 0%,${aClr}10 100%)`
                    : `linear-gradient(135deg,${aClr}18 0%,${aClr}08 100%)`,
            }}>
                <Box sx={{
                    position: "absolute", inset: 0,
                    backgroundImage: `radial-gradient(${aClr}30 1.5px,transparent 1.5px)`,
                    backgroundSize: "24px 24px",
                }} />
                <Box sx={{
                    position: "absolute", bottom: -20, right: -20,
                    width: 120, height: 120, borderRadius: "50%",
                    background: `radial-gradient(circle,${aClr}25 0%,transparent 70%)`,
                }} />
                <IconButton size="small" onClick={onClose} sx={{
                    position: "absolute", top: 12, right: 12,
                    bgcolor: isDark ? "rgba(0,0,0,.5)" : "rgba(255,255,255,.9)",
                    backdropFilter: "blur(8px)", border: `1px solid ${brd}`,
                    color: tSec, width: 28, height: 28,
                    "&:hover": { color: aClr }, transition: "all .18s", zIndex: 2,
                }}>
                    <CloseIcon sx={{ fontSize: 13 }} />
                </IconButton>
            </Box>

            <Box sx={{ px: 3, mt: "-34px", mb: 0, position: "relative", zIndex: 1 }}>
                <Box sx={{
                    width: 68, height: 68, borderRadius: "18px",
                    background: `linear-gradient(145deg,${aClr},${aClr}bb)`,
                    border: `3px solid ${isDark ? "#1E2025" : "#fff"}`,
                    boxShadow: `0 8px 24px ${aClr}50`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.45rem", fontWeight: 800, color: "#fff", letterSpacing: "-1px",
                }}>
                    {ini(displayName)}
                </Box>
            </Box>

            <Box sx={{ px: 3, pt: 1.5, pb: 1.5 }}>
                <Typography fontWeight={800} fontSize="1.2rem" sx={{ color: tPri, lineHeight: 1.25, mb: .5 }}>
                    {displayName}
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1.5} mb={1}>
                    {(profile?.email || student?.email) && (
                        <Stack direction="row" alignItems="center" gap={.5}>
                            <EmailOutlinedIcon sx={{ fontSize: 12, color: tSec }} />
                            <Typography fontSize=".73rem" sx={{ color: tSec }}>{profile?.email || student?.email}</Typography>
                        </Stack>
                    )}
                    {profile?.phoneNumber && (
                        <Stack direction="row" alignItems="center" gap={.5}>
                            <PhoneOutlinedIcon sx={{ fontSize: 12, color: tSec }} />
                            <Typography fontSize=".73rem" sx={{ color: tSec }}>{profile.phoneNumber}</Typography>
                        </Stack>
                    )}
                </Stack>
                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                    {displayDept && (
                        <Chip
                            icon={<SchoolOutlinedIcon sx={{ fontSize: "11px !important", color: `${aClr} !important` }} />}
                            label={displayDept} size="small"
                            sx={{
                                height: 26, borderRadius: "9px", bgcolor: `${aClr}14`, color: aClr,
                                fontWeight: 700, fontSize: ".71rem", border: `1px solid ${aClr}2E`,
                            }} />
                    )}
                    {profile?.linkedin && (
                        <Tooltip title="LinkedIn">
                            <IconButton component="a" href={profile.linkedin} target="_blank" size="small"
                                sx={{
                                    width: 28, height: 28, borderRadius: "8px",
                                    bgcolor: isDark ? "rgba(0,119,181,.15)" : "rgba(0,119,181,.08)",
                                    border: "1px solid rgba(0,119,181,.25)",
                                    "&:hover": { bgcolor: "#0077B5", color: "#fff" }, transition: "all .18s",
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
                                    bgcolor: isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.05)",
                                    border: `1px solid ${brd}`,
                                    "&:hover": { bgcolor: isDark ? "#fff" : "#000", color: isDark ? "#000" : "#fff" }, transition: "all .18s",
                                }}>
                                <GitHubIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            </Box>

            <Divider sx={{ borderColor: brd }} />

            <DialogContent sx={{ px: 3, py: 2.5, overflowY: "auto", maxHeight: 320 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" py={5} gap={1.5} flexDirection="column">
                        <CircularProgress size={22} sx={{ color: aClr }} />
                        <Typography fontSize=".76rem" sx={{ color: tSec }}>Loading profile…</Typography>
                    </Box>
                ) : (
                    <Stack spacing={2.5}>
                        {profile?.bio && (
                            <Box>
                                <Stack direction="row" alignItems="center" gap={.6} mb={1}>
                                    <BadgeOutlinedIcon sx={{ fontSize: 13, color: aClr }} />
                                    <Typography sx={{ fontSize: ".66rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".8px", color: tSec }}>About</Typography>
                                </Stack>
                                <Typography fontSize=".83rem" sx={{ color: tPri, lineHeight: 1.7, whiteSpace: "pre-line" }}>{profile.bio}</Typography>
                            </Box>
                        )}
                        {skills.length > 0 && (
                            <Box>
                                <Stack direction="row" alignItems="center" gap={.6} mb={1}>
                                    <CodeOutlinedIcon sx={{ fontSize: 13, color: aClr }} />
                                    <Typography sx={{ fontSize: ".66rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".8px", color: tSec }}>
                                        Skills & Expertise ({skills.length})
                                    </Typography>
                                </Stack>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: .8 }}>
                                    {skills.map((sk, j) => {
                                        const sc = skClr(j);
                                        return (
                                            <Box key={sk} sx={{
                                                px: 1.3, py: .5, borderRadius: "20px",
                                                bgcolor: sc.bg, border: `1px solid ${sc.bd}`,
                                                display: "flex", alignItems: "center", gap: .5,
                                            }}>
                                                <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: sc.tx, flexShrink: 0 }} />
                                                <Typography fontSize=".7rem" fontWeight={600} sx={{ color: sc.tx }}>{sk}</Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                        )}
                        {!loading && !profile?.bio && skills.length === 0 && (
                            <Box sx={{
                                textAlign: "center", py: 5,
                                border: `1px dashed ${ACCENT}35`, borderRadius: "14px", bgcolor: `${ACCENT}06`,
                            }}>
                                <PersonOutlineIcon sx={{ fontSize: 30, color: ACCENT, opacity: .4, mb: 1 }} />
                                <Typography fontSize=".82rem" sx={{ color: tSec }}>Profile not completed yet</Typography>
                            </Box>
                        )}
                    </Stack>
                )}
            </DialogContent>

            <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${brd}`, display: "flex", justifyContent: "flex-end" }}>
                <Button onClick={onClose} sx={{
                    color: tSec, textTransform: "none", fontWeight: 600,
                    borderRadius: "10px", px: 2.5, fontSize: ".8rem",
                    "&:hover": { bgcolor: isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)" },
                }}>Close</Button>
            </Box>
        </Dialog>
    );
}

/* ═══════════════════════════════════════════════════════════════
   TEAM DETAIL DIALOG
═══════════════════════════════════════════════════════════════ */
function TeamDetailDialog({ open, onClose, team }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const brd = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)";

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
                    border: `1px solid ${brd}`,
                    bgcolor: isDark ? "#1E2025" : "#fff",
                    boxShadow: isDark ? "0 40px 100px rgba(0,0,0,.7)" : "0 40px 100px rgba(0,0,0,.15)",
                }
            }}>
            <Box sx={{
                height: 100, position: "relative", overflow: "hidden",
                background: isDark
                    ? `linear-gradient(135deg,${ACCENT}28 0%,${ACCENT}0A 100%)`
                    : `linear-gradient(135deg,${ACCENT}14 0%,${ACCENT}05 100%)`,
            }}>
                <Box sx={{
                    position: "absolute", inset: 0,
                    backgroundImage: `radial-gradient(${ACCENT}25 1.5px,transparent 1.5px)`,
                    backgroundSize: "22px 22px",
                }} />
                <IconButton size="small" onClick={onClose} sx={{
                    position: "absolute", top: 12, right: 12,
                    bgcolor: isDark ? "rgba(0,0,0,.5)" : "rgba(255,255,255,.9)",
                    border: `1px solid ${brd}`, color: tSec, width: 28, height: 28,
                    "&:hover": { color: ACCENT }, transition: "all .18s", zIndex: 2,
                }}>
                    <CloseIcon sx={{ fontSize: 13 }} />
                </IconButton>
            </Box>

            <Box sx={{ px: 3, mt: "-28px", mb: 0, position: "relative", zIndex: 1 }}>
                <Box sx={{
                    width: 56, height: 56, borderRadius: "16px",
                    background: `linear-gradient(145deg,${ACCENT},${ACCENT}bb)`,
                    border: `3px solid ${isDark ? "#1E2025" : "#fff"}`,
                    boxShadow: `0 6px 20px ${ACCENT}45`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.2rem", fontWeight: 800, color: "#fff", letterSpacing: "-.5px",
                }}>
                    {ini(project)}
                </Box>
            </Box>

            <Box sx={{ px: 3, pt: 1.5, pb: 1 }}>
                <Typography fontWeight={800} fontSize="1.1rem" sx={{ color: tPri, mb: .8 }}>{project}</Typography>
                <Stack direction="row" gap={.7} flexWrap="wrap">
                    {supervisor && (
                        <Chip icon={<SchoolOutlinedIcon sx={{ fontSize: "11px !important", color: `${tSec} !important` }} />}
                            label={supervisor} size="small"
                            sx={{
                                height: 24, borderRadius: "8px",
                                bgcolor: isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.06)",
                                color: tSec, fontSize: ".69rem", fontWeight: 600,
                            }} />
                    )}
                    <Chip icon={<PeopleOutlineIcon sx={{ fontSize: "11px !important", color: `${ACCENT} !important` }} />}
                        label={`${membersCount} / ${maxMembers} members`} size="small"
                        sx={{
                            height: 24, borderRadius: "8px", bgcolor: `${ACCENT}14`, color: ACCENT,
                            fontSize: ".69rem", fontWeight: 700, border: `1px solid ${ACCENT}2E`,
                        }} />
                    {remaining > 0 && (
                        <Chip label={`${remaining} slot${remaining !== 1 ? "s" : ""} open`} size="small"
                            sx={{
                                height: 24, borderRadius: "8px",
                                bgcolor: "rgba(61,185,122,.1)", color: "#3DB97A",
                                fontSize: ".69rem", fontWeight: 700, border: "1px solid rgba(61,185,122,.25)",
                            }} />
                    )}
                </Stack>
            </Box>

            <Divider sx={{ borderColor: brd, mt: 1.5 }} />

            <DialogContent sx={{ px: 3, py: 2.5 }}>
                <Stack spacing={2.5}>
                    {desc && (
                        <Box>
                            <Typography sx={{
                                fontSize: ".66rem", fontWeight: 700, textTransform: "uppercase",
                                letterSpacing: ".8px", color: tSec, mb: .8,
                            }}>Project Description</Typography>
                            <Typography fontSize=".83rem" sx={{ color: tPri, lineHeight: 1.7 }}>{desc}</Typography>
                        </Box>
                    )}
                    <Box>
                        <Typography sx={{
                            fontSize: ".66rem", fontWeight: 700, textTransform: "uppercase",
                            letterSpacing: ".8px", color: tSec, mb: 1,
                        }}>
                            Members ({memberNames.length}{maxMembers > 0 ? ` / ${maxMembers}` : ""})
                        </Typography>
                        {memberNames.length === 0
                            ? <Typography fontSize=".82rem" sx={{ color: tSec }}>No members yet</Typography>
                            : <Stack gap={.7}>
                                {memberNames.map((mName, i) => (
                                    <Stack key={i} direction="row" alignItems="center" gap={1.2}
                                        sx={{
                                            p: "10px 14px", borderRadius: "12px",
                                            border: `1px solid ${isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"}`,
                                            bgcolor: isDark ? "rgba(255,255,255,.025)" : "rgba(0,0,0,.018)",
                                        }}>
                                        <Box sx={{
                                            width: 32, height: 32, borderRadius: "10px",
                                            bgcolor: palette(i), display: "flex", alignItems: "center",
                                            justifyContent: "center", fontSize: ".72rem", fontWeight: 700, color: "#fff",
                                        }}>
                                            {ini(mName)}
                                        </Box>
                                        <Typography fontWeight={600} fontSize=".83rem" sx={{ color: tPri }}>{mName}</Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        }
                    </Box>
                </Stack>
            </DialogContent>

            <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${brd}`, display: "flex", justifyContent: "flex-end" }}>
                <Button onClick={onClose} sx={{
                    color: tSec, textTransform: "none", fontWeight: 600,
                    borderRadius: "10px", px: 2.5, fontSize: ".8rem",
                    "&:hover": { bgcolor: isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)" },
                }}>Close</Button>
            </Box>
        </Dialog>
    );
}

/* ═══════════════════════════════════════════════════════════════
   STUDENT CARD
═══════════════════════════════════════════════════════════════ */
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
    const aClr = palette(colorIdx);

    return (
        <Paper elevation={0} sx={{
            borderRadius: "16px",
            border: `1px solid ${isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)"}`,
            bgcolor: isDark ? "#1A1D22" : "#fff",
            overflow: "hidden",
            width: "100%",
            height: CARD_H,
            display: "flex", flexDirection: "column",
            transition: "box-shadow .22s ease,transform .22s ease,border-color .22s ease",
            "&:hover": {
                transform: "translateY(-3px)", borderColor: `${aClr}55`,
                boxShadow: isDark
                    ? `0 16px 40px rgba(0,0,0,.5),0 0 0 1px ${aClr}20`
                    : `0 16px 40px rgba(0,0,0,.1),0 0 0 1px ${aClr}18`,
            },
        }}>
            <Box sx={{ height: 3, flexShrink: 0, background: `linear-gradient(90deg,${aClr} 0%,${aClr}55 100%)` }} />

            <Box sx={{ p: "14px 16px", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <Stack direction="row" alignItems="center" gap={1.5} mb={1.2} sx={{ flexShrink: 0 }}>
                    <Box sx={{
                        width: 44, height: 44, borderRadius: "13px", flexShrink: 0,
                        background: isDark ? `linear-gradient(145deg,${aClr}25,${aClr}10)` : `linear-gradient(145deg,${aClr}20,${aClr}08)`,
                        border: `1.5px solid ${aClr}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: ".95rem", fontWeight: 800, color: aClr, letterSpacing: "-.5px",
                    }}>
                        {ini(name)}
                    </Box>
                    <Box minWidth={0} flex={1} overflow="hidden">
                        <Typography fontWeight={700} fontSize=".9rem" noWrap sx={{ color: tPri, lineHeight: 1.3 }}>{name}</Typography>
                        {dept
                            ? <Typography fontSize=".68rem" noWrap sx={{ color: aClr, fontWeight: 600, mt: .2 }}>{dept}</Typography>
                            : email ? <Typography fontSize=".68rem" noWrap sx={{ color: tSec, mt: .2 }}>{email}</Typography>
                                : null}
                    </Box>
                </Stack>

                <Box sx={{ height: 66, overflow: "hidden", flexShrink: 0 }}>
                    {topSkills.length > 0 ? (
                        <>
                            <Typography sx={{ fontSize: ".6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".7px", color: tSec, mb: .6 }}>Skills</Typography>
                            <Stack direction="row" flexWrap="wrap" gap={.6}>
                                {topSkills.map((sk, j) => {
                                    const sc = skClr(j);
                                    return (
                                        <Box key={sk} sx={{ px: 1, py: "2px", borderRadius: "6px", bgcolor: sc.bg, border: `1px solid ${sc.bd}` }}>
                                            <Typography fontSize=".63rem" fontWeight={600} sx={{ color: sc.tx }}>
                                                {sk.length > 14 ? sk.slice(0, 12) + "…" : sk}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                                {rawSkills.length > 3 && (
                                    <Box sx={{
                                        px: 1, py: "2px", borderRadius: "6px",
                                        bgcolor: isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)",
                                        border: `1px solid ${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.08)"}`,
                                    }}>
                                        <Typography fontSize=".63rem" fontWeight={600} sx={{ color: tSec }}>+{rawSkills.length - 3}</Typography>
                                    </Box>
                                )}
                            </Stack>
                        </>
                    ) : (
                        <Typography fontSize=".72rem" sx={{ color: tSec, fontStyle: "italic", mt: .5 }}>No skills listed</Typography>
                    )}
                </Box>

                <Box sx={{ flex: 1 }} />

                <Button variant="outlined" fullWidth size="small"
                    startIcon={<InfoOutlinedIcon sx={{ fontSize: 13 }} />}
                    onClick={() => onViewProfile(student)}
                    sx={{
                        flexShrink: 0, borderRadius: "10px", textTransform: "none",
                        fontSize: ".72rem", fontWeight: 600, py: .75,
                        borderColor: isDark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.12)", color: tSec,
                        "&:hover": { borderColor: aClr, color: aClr, bgcolor: `${aClr}0A` }, transition: "all .18s",
                    }}>
                    View Profile
                </Button>
            </Box>
        </Paper>
    );
}

/* ═══════════════════════════════════════════════════════════════
   TEAM CARD
═══════════════════════════════════════════════════════════════ */
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
    const colorIdx = Math.abs((team.id ?? 0) + project.charCodeAt(0)) % PALETTE.length;
    const tClr = palette(colorIdx);

    return (
        <Paper elevation={0} sx={{
            borderRadius: "16px",
            border: `1px solid ${isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)"}`,
            bgcolor: isDark ? "#1A1D22" : "#fff",
            overflow: "hidden",
            width: "100%",
            height: CARD_H,
            display: "flex", flexDirection: "column",
            transition: "box-shadow .22s ease,transform .22s ease,border-color .22s ease",
            "&:hover": {
                transform: "translateY(-3px)", borderColor: `${tClr}55`,
                boxShadow: isDark
                    ? `0 16px 40px rgba(0,0,0,.5),0 0 0 1px ${tClr}20`
                    : `0 16px 40px rgba(0,0,0,.1),0 0 0 1px ${tClr}18`,
            },
        }}>
            <Box sx={{ height: 3, flexShrink: 0, background: `linear-gradient(90deg,${tClr} 0%,${tClr}55 100%)` }} />

            <Box sx={{ p: "14px 16px", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <Stack direction="row" alignItems="center" gap={1.5} mb={1.2} sx={{ flexShrink: 0 }}>
                    <Box sx={{
                        width: 44, height: 44, borderRadius: "13px", flexShrink: 0,
                        background: isDark ? `linear-gradient(145deg,${tClr}25,${tClr}10)` : `linear-gradient(145deg,${tClr}20,${tClr}08)`,
                        border: `1.5px solid ${tClr}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: ".95rem", fontWeight: 800, color: tClr,
                    }}>
                        {ini(project)}
                    </Box>
                    <Box minWidth={0} flex={1} overflow="hidden">
                        <Typography fontWeight={700} fontSize=".9rem" noWrap sx={{ color: tPri, lineHeight: 1.3 }}>{project}</Typography>
                        {supervisor && (
                            <Typography fontSize=".68rem" noWrap sx={{ color: tClr, fontWeight: 600, mt: .2 }}>{supervisor}</Typography>
                        )}
                    </Box>
                </Stack>

                <Box sx={{ height: 38, overflow: "hidden", flexShrink: 0, mb: .5 }}>
                    {desc
                        ? <Typography fontSize=".72rem" sx={{ color: tSec, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{desc}</Typography>
                        : <Typography fontSize=".72rem" sx={{ color: tSec, fontStyle: "italic" }}>No description</Typography>
                    }
                </Box>

                <Box sx={{ height: 28, overflow: "hidden", flexShrink: 0 }}>
                    {memberNames.length > 0 && (
                        <Stack direction="row" alignItems="center" gap={.8}>
                            <Stack direction="row" alignItems="center">
                                {memberNames.slice(0, 4).map((mn, i) => (
                                    <Tooltip key={i} title={mn}>
                                        <Box sx={{
                                            width: 24, height: 24, borderRadius: "7px", bgcolor: palette(i),
                                            border: `2px solid ${isDark ? "#1A1D22" : "#fff"}`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: ".55rem", fontWeight: 700, color: "#fff",
                                            ml: i === 0 ? 0 : "-5px", zIndex: 4 - i, position: "relative",
                                        }}>{ini(mn)}</Box>
                                    </Tooltip>
                                ))}
                                {memberNames.length > 4 && (
                                    <Box sx={{
                                        width: 24, height: 24, borderRadius: "7px",
                                        bgcolor: isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.07)",
                                        border: `2px solid ${isDark ? "#1A1D22" : "#fff"}`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: ".55rem", fontWeight: 700, color: tSec,
                                        ml: "-5px", position: "relative",
                                    }}>+{memberNames.length - 4}</Box>
                                )}
                            </Stack>
                            <Chip label={`${membersCount}/${maxMembers}`} size="small"
                                sx={{ height: 18, borderRadius: "5px", bgcolor: `${tClr}12`, color: tClr, fontSize: ".6rem", fontWeight: 700, border: `1px solid ${tClr}25` }} />
                            {remaining > 0 && (
                                <Chip label={`${remaining} open`} size="small"
                                    sx={{ height: 18, borderRadius: "5px", bgcolor: "rgba(61,185,122,.1)", color: "#3DB97A", fontSize: ".6rem", fontWeight: 700, border: "1px solid rgba(61,185,122,.22)" }} />
                            )}
                        </Stack>
                    )}
                </Box>

                <Box sx={{ flex: 1 }} />

                <Button variant="outlined" fullWidth size="small"
                    startIcon={<InfoOutlinedIcon sx={{ fontSize: 13 }} />}
                    onClick={() => onView(team)}
                    sx={{
                        flexShrink: 0, borderRadius: "10px", textTransform: "none",
                        fontSize: ".72rem", fontWeight: 600, py: .75,
                        borderColor: isDark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.12)", color: tSec,
                        "&:hover": { borderColor: tClr, color: tClr, bgcolor: `${tClr}0A` }, transition: "all .18s",
                    }}>
                    View Details
                </Button>
            </Box>
        </Paper>
    );
}

/* ═══════════════════════════════════════════════════════════════
   DISCOVERY HUB — MAIN
═══════════════════════════════════════════════════════════════ */
export default function DiscoveryHub() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const cardBg = isDark ? "#1A1D22" : "#fff";
    const brd = isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)";

    const [tab, setTab] = useState(0);

    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [searchStudents, setSearchStudents] = useState("");
    const [studentPage, setStudentPage] = useState(1);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);

    const [teams, setTeams] = useState([]);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const [searchTeams, setSearchTeams] = useState("");
    const [teamPage, setTeamPage] = useState(1);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [teamOpen, setTeamOpen] = useState(false);

    const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
    const snap = (msg, sev = "success") => setSnack({ open: true, msg, sev });

    /* ── Swipe / Drag refs ── */
    const touchStartX = useRef(null);
    const isDragging = useRef(false);

    const handlePointerDown = (e) => {
        // تجاهل الضغط على الـ input أو الـ buttons
        if (e.target.closest("input, button, a, [role='button']")) return;
        touchStartX.current = e.touches?.[0]?.clientX ?? e.clientX;
        isDragging.current = false;
    };

    const handlePointerMove = (e) => {
        if (touchStartX.current === null) return;
        const currentX = e.touches?.[0]?.clientX ?? e.clientX;
        if (Math.abs(currentX - touchStartX.current) > 10) {
            isDragging.current = true;
        }
    };

    const handlePointerUp = (e) => {
        if (touchStartX.current === null || !isDragging.current) {
            touchStartX.current = null;
            isDragging.current = false;
            return;
        }
        const endX = e.changedTouches?.[0]?.clientX ?? e.clientX;
        const diff = touchStartX.current - endX;

        if (Math.abs(diff) > 50) {
            if (diff > 0 && tab === 0) setTab(1);   // سحب يسار → Teams
            if (diff < 0 && tab === 1) setTab(0);   // سحب يمين → Students
        }
        touchStartX.current = null;
        isDragging.current = false;
    };

    const fetchStudents = useCallback(async () => {
        if (students.length > 0) return;
        setLoadingStudents(true);
        try { const d = await studentApi.getAllStudents(); setStudents(Array.isArray(d) ? d : []); }
        catch { snap("Failed to load students", "error"); }
        finally { setLoadingStudents(false); }
    }, [students.length]);

    const fetchTeams = useCallback(async () => {
        if (teams.length > 0) return;
        setLoadingTeams(true);
        try { const d = await studentApi.getAvailableTeams(); setTeams(Array.isArray(d) ? d : []); }
        catch { snap("Failed to load teams", "error"); }
        finally { setLoadingTeams(false); }
    }, [teams.length]);

    useEffect(() => {
        if (tab === 0) fetchStudents();
        if (tab === 1) fetchTeams();
    }, [tab, fetchStudents, fetchTeams]);

    useEffect(() => { setStudentPage(1); }, [searchStudents]);
    useEffect(() => { setTeamPage(1); }, [searchTeams]);
    useEffect(() => { setStudentPage(1); setTeamPage(1); }, [tab]);

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

    const totalStudentPages = Math.ceil(filteredStudents.length / CARDS_PER_PAGE);
    const pagedStudents = filteredStudents.slice((studentPage - 1) * CARDS_PER_PAGE, studentPage * CARDS_PER_PAGE);
    const totalTeamPages = Math.ceil(filteredTeams.length / CARDS_PER_PAGE);
    const pagedTeams = filteredTeams.slice((teamPage - 1) * CARDS_PER_PAGE, teamPage * CARDS_PER_PAGE);

    const gridCols = { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" };

    const searchSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: "12px", fontSize: ".875rem", bgcolor: cardBg,
            "& fieldset": { borderColor: brd },
            "&:hover fieldset": { borderColor: `${ACCENT}55` },
            "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: "1.5px" },
        },
        "& .MuiOutlinedInput-input": { py: "10px" },
    };

    const paginationSx = {
        "& .MuiPaginationItem-root": { borderRadius: "8px", fontWeight: 600, fontSize: ".78rem", color: tSec },
        "& .Mui-selected": { bgcolor: `${ACCENT} !important`, color: "#fff !important" },
        "& .MuiPaginationItem-root:hover:not(.Mui-selected)": { bgcolor: `${ACCENT}12`, color: ACCENT },
    };

    const EmptyState = ({ msg, sub }) => (
        <Box textAlign="center" py={9}>
            <Box sx={{
                width: 60, height: 60, borderRadius: "18px", mx: "auto", mb: 2,
                bgcolor: `${ACCENT}0F`, border: `1px solid ${ACCENT}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <PersonOutlineIcon sx={{ fontSize: 28, color: ACCENT }} />
            </Box>
            <Typography fontWeight={700} fontSize=".95rem" sx={{ color: tPri }}>{msg}</Typography>
            <Typography fontSize=".82rem" sx={{ color: tSec, mt: .5 }}>{sub}</Typography>
        </Box>
    );

    return (
        <Box
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            sx={{ minHeight: "100%", py: 3.5, bgcolor: "transparent", userSelect: "none" }}
        >
            <Box sx={{ maxWidth: 1050, mx: "auto", px: { xs: 2, sm: 3 } }}>

                <Box sx={{ mb: 4, textAlign: "center" }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: tPri, mb: .5, letterSpacing: "-.5px" }}>
                        Discovery Hub
                    </Typography>
                    <Typography sx={{ color: tSec, fontSize: ".88rem" }}>
                        Explore students and teams in your program
                    </Typography>
                </Box>

                {/* Tabs */}
                <Box sx={{ mb: 3, bgcolor: cardBg, borderRadius: "14px", border: `1px solid ${brd}`, overflow: "hidden" }}>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
                        px: 1, minHeight: 50,
                        "& .MuiTab-root": {
                            textTransform: "none", fontWeight: 600, fontSize: ".84rem",
                            minHeight: 50, color: tSec, transition: "color .18s", borderRadius: "10px", mx: .3,
                        },
                        "& .Mui-selected": { color: ACCENT },
                        "& .MuiTabs-indicator": { bgcolor: ACCENT, height: 2.5, borderRadius: "2px" },
                    }}>
                        <Tab label={
                            <Stack direction="row" alignItems="center" gap={.9}>
                                <PeopleOutlineIcon sx={{ fontSize: 17 }} />
                                <span>Available Students</span>
                                {students.length > 0 && (
                                    <Chip label={filteredStudents.length} size="small"
                                        sx={{ height: 19, minWidth: 24, bgcolor: `${ACCENT}18`, color: ACCENT, fontWeight: 700, fontSize: ".68rem", border: `1px solid ${ACCENT}25`, borderRadius: "6px" }} />
                                )}
                            </Stack>
                        } />
                        <Tab label={
                            <Stack direction="row" alignItems="center" gap={.9}>
                                <GroupsOutlinedIcon sx={{ fontSize: 17 }} />
                                <span>Teams</span>
                                {teams.length > 0 && (
                                    <Chip label={filteredTeams.length} size="small"
                                        sx={{ height: 19, minWidth: 24, bgcolor: `${ACCENT}18`, color: ACCENT, fontWeight: 700, fontSize: ".68rem", border: `1px solid ${ACCENT}25`, borderRadius: "6px" }} />
                                )}
                            </Stack>
                        } />
                    </Tabs>
                </Box>

                {/* ══ STUDENTS TAB ══ */}
                {tab === 0 && (
                    <Box>
                        <TextField fullWidth size="small"
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
                            }} />

                        {loadingStudents ? (
                            <Box display="flex" justifyContent="center" py={10}>
                                <CircularProgress size={36} sx={{ color: ACCENT }} />
                            </Box>
                        ) : filteredStudents.length === 0 ? (
                            <EmptyState msg="No students found" sub={searchStudents ? "Try a different search term" : "No available students right now"} />
                        ) : (
                            <>
                                <Box sx={{ display: "grid", gridTemplateColumns: gridCols, gap: "20px", mb: 3 }}>
                                    {pagedStudents.map((s) => (
                                        <StudentCard
                                            key={getId(s) ?? s.fullName ?? s.name}
                                            student={s}
                                            onViewProfile={st => { setSelectedStudent(st); setProfileOpen(true); }}
                                        />
                                    ))}
                                </Box>
                                {totalStudentPages > 1 && (
                                    <Stack alignItems="center" gap={.8} sx={{ pt: 2.5, borderTop: `1px solid ${brd}` }}>
                                        <Pagination
                                            count={totalStudentPages} page={studentPage}
                                            onChange={(_, v) => { setStudentPage(v); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                            size="small" sx={paginationSx}
                                        />
                                        <Typography fontSize=".71rem" sx={{ color: tSec }}>
                                            Showing {(studentPage - 1) * CARDS_PER_PAGE + 1}–{Math.min(studentPage * CARDS_PER_PAGE, filteredStudents.length)} of {filteredStudents.length} students
                                        </Typography>
                                    </Stack>
                                )}
                            </>
                        )}
                    </Box>
                )}

                {/* ══ TEAMS TAB ══ */}
                {tab === 1 && (
                    <Box>
                        <TextField fullWidth size="small"
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
                            }} />

                        {loadingTeams ? (
                            <Box display="flex" justifyContent="center" py={10}>
                                <CircularProgress size={36} sx={{ color: ACCENT }} />
                            </Box>
                        ) : filteredTeams.length === 0 ? (
                            <EmptyState msg="No teams found" sub={searchTeams ? "Try a different search term" : "No teams available right now"} />
                        ) : (
                            <>
                                <Box sx={{ display: "grid", gridTemplateColumns: gridCols, gap: "20px", mb: 3 }}>
                                    {pagedTeams.map((team, i) => (
                                        <TeamCard
                                            key={team.id ?? team.teamId ?? i}
                                            team={team}
                                            onView={t => { setSelectedTeam(t); setTeamOpen(true); }}
                                        />
                                    ))}
                                </Box>
                                {totalTeamPages > 1 && (
                                    <Stack alignItems="center" gap={.8} sx={{ pt: 2.5, borderTop: `1px solid ${brd}` }}>
                                        <Pagination
                                            count={totalTeamPages} page={teamPage}
                                            onChange={(_, v) => { setTeamPage(v); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                            size="small" sx={paginationSx}
                                        />
                                        <Typography fontSize=".71rem" sx={{ color: tSec }}>
                                            Showing {(teamPage - 1) * CARDS_PER_PAGE + 1}–{Math.min(teamPage * CARDS_PER_PAGE, filteredTeams.length)} of {filteredTeams.length} teams
                                        </Typography>
                                    </Stack>
                                )}
                            </>
                        )}
                    </Box>
                )}
            </Box>

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

            <Snackbar open={snack.open} autoHideDuration={3500}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity={snack.sev} variant="filled" sx={{ borderRadius: "12px" }}>{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}