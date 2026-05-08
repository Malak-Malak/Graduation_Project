import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@mui/material/styles";
import {
    Box, Typography, Stack, Paper, Avatar,
    Button, Chip, Tab, Tabs, CircularProgress,
    Snackbar, Alert, Tooltip, IconButton,
    Dialog, TextField, Divider, Fade,
    Pagination,
} from "@mui/material";

import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";

import studentApi from "../../../../api/handler/endpoints/studentApi";
import archiveApi from "../../../../api/handler/endpoints/archiveApi";
import JoinOrCreateModal from "../Onboarding/JoinOrCreateModal";
import CreateTeamFlow from "../Onboarding/CreateTeamFlow";
import JoinTeamFlow from "../Onboarding/JoinTeamFlow";
import AIProjectSuggester from "../AIResearchSuggester/AIResearchSuggester.jsx";

/* ════════════════════════════════════════════════════════════════
   DESIGN TOKENS
════════════════════════════════════════════════════════════════ */
const ACCENT = "#c87941";
const ACCENT_LIGHT = "#e8a96e";
const GREEN = "#3a9e6f";
const RED = "#d95555";
const ORANGE = "#e07b2a";

const MAX_TEAM_SIZE = 4;

const SKILL_PALETTE = [
    "#c87941", "#5b8fa8", "#6d8a7d", "#9b7ec8",
    "#a85b6d", "#7a9e5b", "#c49a6c", "#7e9fc4",
];
const MBR_COLORS = ["#c87941", "#5b8fa8", "#6d8a7d", "#9b7ec8", "#a85b6d"];
const CARDS_PER_PAGE = 6;

/* ── helpers ─────────────────────────────────────────────────── */
const initials = (name = "") =>
    (name ?? "").split(" ").map(w => w[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";

const skillClr = (i) => SKILL_PALETTE[i % SKILL_PALETTE.length];

const statusMeta = (s) => {
    const v = (s ?? "").toLowerCase();
    if (v.includes("accept") || v === "accepted") return { bg: `${GREEN}18`, fg: GREEN };
    if (v.includes("reject") || v === "rejected") return { bg: `${RED}18`, fg: RED };
    return { bg: `${ACCENT}18`, fg: ACCENT };
};

const extractErrorMsg = (err, fallback = "Something went wrong. Please try again.") =>
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.response?.data?.title ||
    err?.message ||
    fallback;

/* ════════════════════════════════════════════════════════════════
   TEAM STATUS LOGIC
════════════════════════════════════════════════════════════════ */
const TEAM_STATE = {
    NONE: "NONE",
    PENDING: "PENDING",
    ACTIVE: "ACTIVE",
};

const resolveTeamState = (team) => {
    if (!team) return TEAM_STATE.NONE;
    const s = (team.status ?? team.teamStatus ?? "").toLowerCase();
    if (s === "pending") return TEAM_STATE.PENDING;
    if (s === "rejected") return TEAM_STATE.NONE;
    return TEAM_STATE.ACTIVE;
};

/* ════════════════════════════════════════════════════════════════
   STUDENT PROFILE MODAL
════════════════════════════════════════════════════════════════ */
function StudentProfileModal({ open, onClose, student, onInvite, isInviting, sentInviteIds }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);

    const bg = theme.palette.background.paper;
    const brd = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const accent = isDark ? ACCENT_LIGHT : ACCENT;

    const sid = student?.userId ?? student?.id ?? null;
    const name = student?.fullName ?? student?.name ?? "Student";
    const dept = student?.department ?? "";
    const alreadyInvited = sentInviteIds?.has(sid);

    useEffect(() => {
        if (!open || !sid) return;
        setProfile(null);
        setLoading(true);
        studentApi.getProfileById(sid)
            .then(d => {
                if (!d) return;
                setProfile({
                    fullName: d.fullName ?? "",
                    phone: d.phoneNumber ?? "",
                    department: d.department ?? "",
                    skills: d.field ? d.field.split(",").map(s => s.trim()).filter(Boolean) : [],
                    github: d.gitHubLink ?? d.github ?? "",
                    linkedin: d.linkedinLink ?? d.linkedin ?? "",
                    email: d.personalEmail ?? d.email ?? "",
                    bio: d.bio ?? "",
                });
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [open, sid]);

    const skills = profile?.skills?.length
        ? profile.skills
        : (student?.field ? student.field.split(",").map(s => s.trim()).filter(Boolean) : []);
    const displayName = profile?.fullName || name;
    const displayDept = profile?.department || dept;
    const av = initials(displayName);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            TransitionComponent={Fade} transitionDuration={260}
            PaperProps={{
                sx: {
                    borderRadius: "20px", overflow: "hidden",
                    border: `1px solid ${brd}`, bgcolor: bg,
                    boxShadow: isDark ? "0 32px 80px rgba(0,0,0,0.65)" : "0 32px 80px rgba(0,0,0,0.13)",
                }
            }}>
            <Box sx={{
                height: 110,
                background: isDark
                    ? "linear-gradient(135deg,#1e1208 0%,#261a0e 50%,#1a1a20 100%)"
                    : "linear-gradient(135deg,#fdf4ec 0%,#f5e4d0 60%,#eef2f8 100%)",
                position: "relative", overflow: "visible",
            }}>
                <Box sx={{
                    position: "absolute", inset: 0,
                    backgroundImage: `linear-gradient(${ACCENT}12 1px,transparent 1px),linear-gradient(90deg,${ACCENT}12 1px,transparent 1px)`,
                    backgroundSize: "28px 28px", borderRadius: "inherit",
                }} />
                <IconButton onClick={onClose} size="small" sx={{
                    position: "absolute", top: 12, right: 12, zIndex: 10,
                    bgcolor: isDark ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.88)",
                    backdropFilter: "blur(6px)", border: `1px solid ${brd}`, color: tSec,
                    "&:hover": { color: accent },
                }}>
                    <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
                <Box sx={{
                    position: "absolute", bottom: -36, left: 24, zIndex: 5,
                    width: 72, height: 72, borderRadius: "18px",
                    bgcolor: accent, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.55rem", fontWeight: 800, color: "#fff",
                    border: `4px solid ${bg}`, boxShadow: `0 6px 20px ${ACCENT}45`, letterSpacing: "-1px",
                }}>{av}</Box>
            </Box>

            <Box sx={{ px: 3, pt: "46px", pb: 0 }}>
                <Stack direction="row" justifyContent="flex-end" gap={0.8} mb={1.2}>
                    {profile?.linkedin && (
                        <Tooltip title="LinkedIn">
                            <IconButton component="a" href={profile.linkedin} target="_blank" size="small"
                                sx={{
                                    width: 34, height: 34,
                                    bgcolor: isDark ? "rgba(0,119,181,0.14)" : "rgba(0,119,181,0.08)",
                                    border: `1px solid ${isDark ? "rgba(0,119,181,0.28)" : "rgba(0,119,181,0.18)"}`,
                                    "&:hover": { bgcolor: "#0077B5", color: "#fff", transform: "translateY(-2px)" },
                                    transition: "all 0.18s",
                                }}>
                                <LinkedInIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {profile?.github && (
                        <Tooltip title="GitHub">
                            <IconButton component="a" href={profile.github} target="_blank" size="small"
                                sx={{
                                    width: 34, height: 34,
                                    bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)",
                                    border: `1px solid ${brd}`,
                                    "&:hover": { bgcolor: isDark ? "#fff" : "#000", color: isDark ? "#000" : "#fff", transform: "translateY(-2px)" },
                                    transition: "all 0.18s",
                                }}>
                                <GitHubIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>

                <Typography fontWeight={800} fontSize="1.15rem" sx={{ color: tPri, lineHeight: 1.2, mb: 0.5 }}>
                    {displayName}
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1.2} mb={0.8}>
                    {(profile?.email || student?.email) && (
                        <Stack direction="row" alignItems="center" gap={0.5}>
                            <EmailOutlinedIcon sx={{ fontSize: 12, color: tSec }} />
                            <Typography fontSize="0.73rem" sx={{ color: tSec }}>
                                {profile?.email || student?.email}
                            </Typography>
                        </Stack>
                    )}
                    {profile?.phone && (
                        <Stack direction="row" alignItems="center" gap={0.5}>
                            <PhoneOutlinedIcon sx={{ fontSize: 12, color: tSec }} />
                            <Typography fontSize="0.73rem" sx={{ color: tSec }}>{profile.phone}</Typography>
                        </Stack>
                    )}
                </Stack>
                {displayDept && (
                    <Chip
                        icon={<SchoolOutlinedIcon sx={{ fontSize: "12px !important", color: `${accent} !important` }} />}
                        label={displayDept} size="small"
                        sx={{
                            mb: 1.5, height: 24, borderRadius: "8px",
                            bgcolor: `${ACCENT}12`, color: accent,
                            fontWeight: 700, fontSize: "0.7rem", border: `1px solid ${ACCENT}28`
                        }}
                    />
                )}
            </Box>

            <Divider sx={{ borderColor: brd, mx: 3, my: 0.5 }} />

            <Box sx={{ px: 3, py: 2, overflowY: "auto", maxHeight: 300 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" py={5}>
                        <Stack alignItems="center" gap={1.5}>
                            <CircularProgress size={26} sx={{ color: accent }} />
                            <Typography fontSize="0.78rem" sx={{ color: tSec }}>Loading profile…</Typography>
                        </Stack>
                    </Box>
                ) : (
                    <Stack spacing={2.5}>
                        {profile?.bio && (
                            <Box>
                                <Stack direction="row" alignItems="center" gap={0.7} mb={1}>
                                    <AutoStoriesOutlinedIcon sx={{ fontSize: 14, color: accent }} />
                                    <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.7px", color: tSec }}>
                                        About
                                    </Typography>
                                </Stack>
                                <Typography fontSize="0.83rem" sx={{ color: tPri, lineHeight: 1.78, whiteSpace: "pre-line" }}>
                                    {profile.bio}
                                </Typography>
                            </Box>
                        )}
                        {skills.length > 0 && (
                            <Box>
                                <Stack direction="row" alignItems="center" gap={0.7} mb={1.2}>
                                    <CodeOutlinedIcon sx={{ fontSize: 14, color: accent }} />
                                    <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.7px", color: tSec }}>
                                        Skills & Expertise ({skills.length})
                                    </Typography>
                                </Stack>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.9 }}>
                                    {skills.map((sk, j) => {
                                        const c = skillClr(j);
                                        return (
                                            <Box key={sk} sx={{
                                                display: "flex", alignItems: "center", gap: 0.6,
                                                px: 1.3, py: 0.5, borderRadius: "20px",
                                                bgcolor: `${c}0D`, border: `1px solid ${c}30`,
                                                transition: "all 0.15s",
                                                "&:hover": { bgcolor: `${c}1C`, borderColor: c, transform: "translateY(-1px)" },
                                            }}>
                                                <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: c, flexShrink: 0 }} />
                                                <Typography fontSize="0.71rem" fontWeight={600} sx={{ color: c }}>{sk}</Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                        )}
                        {!loading && !profile?.bio && skills.length === 0 && (
                            <Box sx={{ textAlign: "center", py: 5, border: `1px dashed ${ACCENT}30`, borderRadius: "14px", bgcolor: `${ACCENT}06` }}>
                                <PersonOutlineIcon sx={{ fontSize: 30, color: accent, opacity: 0.4, mb: 1 }} />
                                <Typography fontSize="0.83rem" sx={{ color: tSec }}>Profile not completed yet.</Typography>
                            </Box>
                        )}
                    </Stack>
                )}
            </Box>

            <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${brd}`, display: "flex", gap: 1.2, justifyContent: "flex-end" }}>
                <Button onClick={onClose} sx={{ color: tSec, textTransform: "none", fontWeight: 500, borderRadius: "10px", px: 2 }}>
                    Close
                </Button>
                {alreadyInvited ? (
                    <Button variant="outlined" disabled startIcon={<MarkEmailReadOutlinedIcon sx={{ fontSize: 15 }} />}
                        sx={{
                            borderRadius: "10px", px: 3, py: 0.85, textTransform: "none", fontWeight: 700, fontSize: "0.82rem",
                            borderColor: `${GREEN}55`, color: GREEN
                        }}>
                        Invite Sent
                    </Button>
                ) : (
                    <Button variant="contained" disabled={isInviting}
                        startIcon={isInviting ? null : <PersonAddOutlinedIcon sx={{ fontSize: 15 }} />}
                        onClick={() => { onInvite(sid); onClose(); }}
                        sx={{
                            bgcolor: accent, "&:hover": { bgcolor: isDark ? ACCENT : "#a8622e", boxShadow: "none" },
                            borderRadius: "10px", px: 3, py: 0.85, textTransform: "none", fontWeight: 700,
                            boxShadow: "none", fontSize: "0.82rem"
                        }}>
                        {isInviting ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : "Send Invite"}
                    </Button>
                )}
            </Box>
        </Dialog>
    );
}

/* ════════════════════════════════════════════════════════════════
   STUDENT CARD
════════════════════════════════════════════════════════════════ */
function StudentCard({ student, onInvite, onViewProfile, busyId, colorIndex, alreadyInvited }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const brd = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const accent = isDark ? ACCENT_LIGHT : ACCENT;

    const name = student.fullName ?? student.name ?? "Student";
    const email = student.email ?? student.studentId ?? "";
    const dept = student.department ?? "";
    const skills = student.field
        ? student.field.split(",").map(s => s.trim()).filter(Boolean)
        : (student.skills ?? []);
    const av = initials(name);
    const barColor = MBR_COLORS[colorIndex % MBR_COLORS.length];
    const studentId = student.userId ?? student.id;
    const busy = busyId === studentId;

    return (
        <Paper elevation={0} sx={{
            borderRadius: "16px",
            border: `1px solid ${alreadyInvited ? `${GREEN}35` : brd}`,
            bgcolor: theme.palette.background.paper,
            overflow: "hidden", display: "flex", flexDirection: "column",
            transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
            "&:hover": {
                borderColor: alreadyInvited ? `${GREEN}60` : `${ACCENT}50`,
                boxShadow: isDark
                    ? `0 8px 32px rgba(0,0,0,0.45),0 0 0 1px ${alreadyInvited ? GREEN : ACCENT}20`
                    : `0 8px 32px rgba(0,0,0,0.08),0 0 0 1px ${alreadyInvited ? GREEN : ACCENT}15`,
                transform: "translateY(-3px)",
            },
        }}>
            <Box sx={{ height: 4, background: `linear-gradient(90deg,${barColor} 0%,${barColor}70 100%)` }} />
            <Box sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column", gap: 1.4 }}>
                <Stack direction="row" alignItems="center" gap={1.4}>
                    <Box sx={{
                        width: 44, height: 44, borderRadius: "13px",
                        bgcolor: `${barColor}15`, border: `1.5px solid ${barColor}28`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1rem", fontWeight: 800, color: barColor, flexShrink: 0, letterSpacing: "-0.5px",
                    }}>{av}</Box>
                    <Box minWidth={0} flex={1}>
                        <Typography fontWeight={700} fontSize="0.88rem" noWrap sx={{ color: tPri }}>{name}</Typography>
                        {email && <Typography fontSize="0.7rem" noWrap sx={{ color: tSec, mt: 0.1 }}>{email}</Typography>}
                    </Box>
                </Stack>

                {alreadyInvited && (
                    <Stack direction="row" alignItems="center" gap={0.7}
                        sx={{ px: 1.2, py: 0.7, borderRadius: "10px", bgcolor: `${GREEN}0E`, border: `1px solid ${GREEN}28` }}>
                        <MarkEmailReadOutlinedIcon sx={{ fontSize: 13, color: GREEN }} />
                        <Typography fontSize="0.68rem" fontWeight={700} sx={{ color: GREEN }}>Invitation sent</Typography>
                    </Stack>
                )}

                {dept && (
                    <Chip icon={<SchoolOutlinedIcon sx={{ fontSize: "11px !important", color: `${accent} !important` }} />}
                        label={dept} size="small"
                        sx={{
                            height: 22, width: "fit-content", borderRadius: "7px",
                            bgcolor: `${ACCENT}0D`, color: accent,
                            fontWeight: 600, fontSize: "0.66rem", border: `1px solid ${ACCENT}20`
                        }}
                    />
                )}

                {skills.length > 0 && (
                    <Box>
                        <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: tSec, mb: 0.8 }}>Skills</Typography>
                        <Stack direction="row" flexWrap="wrap" gap={0.7}>
                            {skills.slice(0, 4).map((sk, j) => {
                                const c = skillClr(j);
                                return (
                                    <Box key={sk} sx={{ px: 1.1, py: 0.32, borderRadius: "6px", bgcolor: `${c}0D`, border: `1px solid ${c}22` }}>
                                        <Typography fontSize="0.63rem" fontWeight={600} sx={{ color: c }}>
                                            {sk.length > 14 ? sk.slice(0, 12) + "…" : sk}
                                        </Typography>
                                    </Box>
                                );
                            })}
                            {skills.length > 4 && (
                                <Box sx={{ px: 1.1, py: 0.32, borderRadius: "6px", bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: `1px solid ${brd}` }}>
                                    <Typography fontSize="0.63rem" fontWeight={600} sx={{ color: tSec }}>+{skills.length - 4}</Typography>
                                </Box>
                            )}
                        </Stack>
                    </Box>
                )}

                {!dept && skills.length === 0 && !alreadyInvited && (
                    <Typography fontSize="0.73rem" sx={{ color: tSec, fontStyle: "italic" }}>No additional info available</Typography>
                )}

                <Box sx={{ flex: 1 }} />

                <Stack direction="row" gap={1} mt={0.5}>
                    <Button size="small" variant="outlined"
                        onClick={() => onViewProfile(student)}
                        startIcon={<BadgeOutlinedIcon sx={{ fontSize: 13 }} />}
                        sx={{
                            flex: 1, borderColor: brd, color: tSec, borderRadius: "9px", textTransform: "none",
                            fontWeight: 600, fontSize: "0.7rem", py: 0.6,
                            "&:hover": { borderColor: `${ACCENT}55`, color: accent, bgcolor: `${ACCENT}08` },
                            transition: "all 0.16s",
                        }}>
                        View Profile
                    </Button>
                    {alreadyInvited ? (
                        <Button size="small" variant="outlined" disabled
                            startIcon={<MarkEmailReadOutlinedIcon sx={{ fontSize: 13 }} />}
                            sx={{ flex: 1, borderColor: `${GREEN}40`, color: GREEN, borderRadius: "9px", textTransform: "none", fontWeight: 700, fontSize: "0.7rem", py: 0.6 }}>
                            Invited
                        </Button>
                    ) : (
                        <Button size="small" variant="contained" disabled={busy}
                            onClick={() => onInvite(studentId)}
                            startIcon={busy ? null : <PersonAddOutlinedIcon sx={{ fontSize: 13 }} />}
                            sx={{
                                flex: 1, bgcolor: accent,
                                "&:hover": { bgcolor: isDark ? ACCENT : "#a8622e", boxShadow: "none" },
                                borderRadius: "9px", textTransform: "none", fontWeight: 700,
                                fontSize: "0.7rem", py: 0.6, boxShadow: "none", transition: "all 0.16s",
                            }}>
                            {busy ? <CircularProgress size={12} sx={{ color: "#fff" }} /> : "Invite"}
                        </Button>
                    )}
                </Stack>
            </Box>
        </Paper>
    );
}

/* ════════════════════════════════════════════════════════════════
   ROW COMPONENTS
════════════════════════════════════════════════════════════════ */
function InviteRow({ inv, onAccept, onDecline, busy, teamState }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const brd = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
    const accent = isDark ? ACCENT_LIGHT : ACCENT;

    const id = inv.joinRequestId ?? inv.id;
    const teamName = inv.teamName ?? "A team";
    const projectDesc = inv.projectDescription ?? inv.description ?? null;
    const status = inv.status ?? "Pending";
    const sentAt = inv.sentAt ? new Date(inv.sentAt).toLocaleDateString() : null;
    const senderName = inv.sender?.fullName ?? inv.senderName ?? null;
    const senderEmail = inv.sender?.email ?? inv.senderEmail ?? null;
    const clr = statusMeta(status);
    const isInActiveTeam = teamState === TEAM_STATE.ACTIVE;

    return (
        <Stack direction="row" alignItems="flex-start" gap={1.5}
            sx={{
                p: 1.6, borderRadius: "12px", border: `1px solid ${brd}`,
                bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"
            }}>
            <Avatar sx={{
                width: 36, height: 36, bgcolor: MBR_COLORS[1], fontSize: "0.72rem",
                fontWeight: 700, borderRadius: "10px", flexShrink: 0
            }}>
                {initials(teamName)}
            </Avatar>

            <Box flex={1} minWidth={0}>
                <Typography fontWeight={600} fontSize="0.83rem" noWrap sx={{ color: tPri }}>
                    <Box component="span" sx={{ color: accent }}>{teamName}</Box>{" "}invited you to join
                </Typography>
                {senderName && (
                    <Typography fontSize="0.74rem" sx={{ color: tSec, mt: 0.2 }}>
                        From: <Box component="span" sx={{ fontWeight: 600 }}>{senderName}</Box>
                        {senderEmail && ` · ${senderEmail}`}
                    </Typography>
                )}
                {projectDesc && (
                    <Typography fontSize="0.74rem" sx={{
                        color: tSec, mt: 0.35,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                    }}>
                        {projectDesc}
                    </Typography>
                )}
                <Stack direction="row" alignItems="center" gap={0.8} mt={0.5}>
                    <Chip label={status} size="small" sx={{
                        height: 16, fontSize: "0.6rem", fontWeight: 700,
                        bgcolor: clr.bg, color: clr.fg, borderRadius: "5px"
                    }} />
                    {sentAt && <Typography fontSize="0.68rem" sx={{ color: tSec }}>{sentAt}</Typography>}
                </Stack>

                {status === "Pending" && isInActiveTeam && (
                    <Stack direction="row" alignItems="center" gap={0.6} mt={0.8}
                        sx={{
                            px: 1.2, py: 0.6, borderRadius: "8px",
                            bgcolor: `${RED}0C`, border: `1px solid ${RED}22`,
                        }}>
                        <BlockOutlinedIcon sx={{ fontSize: 12, color: RED, flexShrink: 0 }} />
                        <Typography fontSize="0.67rem" fontWeight={600} sx={{ color: RED, lineHeight: 1.4 }}>
                            You are already in an active team. Leave your current team first to accept this invitation.
                        </Typography>
                    </Stack>
                )}
            </Box>

            {status === "Pending" && (
                <Stack direction="row" gap={0.5} flexShrink={0}>
                    <Tooltip title={isInActiveTeam ? "Leave your current team first" : "Accept"}>
                        <span>
                            <IconButton
                                size="small"
                                disabled={busy || isInActiveTeam}
                                onClick={() => onAccept(id)}
                                sx={{
                                    color: isInActiveTeam ? "text.disabled" : GREEN,
                                    "&:hover": { bgcolor: isInActiveTeam ? "transparent" : `${GREEN}12` },
                                }}>
                                <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Decline">
                        <IconButton size="small" disabled={busy} onClick={() => onDecline(id)}
                            sx={{ color: RED, "&:hover": { bgcolor: `${RED}12` } }}>
                            <CancelOutlinedIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )}
        </Stack>
    );
}

function SentInvitationRow({ inv }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const brd = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
    const accent = isDark ? ACCENT_LIGHT : ACCENT;

    const studentName = inv.receiverName ?? inv.studentName ?? inv.fullName ?? "Student";
    const studentEmail = inv.receiverEmail ?? inv.studentEmail ?? inv.email ?? null;
    const status = inv.status ?? "Pending";
    const sentAt = inv.sentAt ? new Date(inv.sentAt).toLocaleDateString() : null;
    const clr = statusMeta(status);

    return (
        <Stack direction="row" alignItems="flex-start" gap={1.5}
            sx={{ p: 1.6, borderRadius: "12px", border: `1px solid ${brd}`, bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" }}>
            <Box sx={{
                width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
                bgcolor: `${ACCENT}12`, border: `1px solid ${ACCENT}28`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.72rem", fontWeight: 800, color: accent,
            }}>{initials(studentName)}</Box>
            <Box flex={1} minWidth={0}>
                <Typography fontWeight={600} fontSize="0.83rem" noWrap sx={{ color: tPri }}>
                    Invited{" "}<Box component="span" sx={{ color: accent }}>{studentName}</Box>{" "}to join your team
                </Typography>
                {studentEmail && (
                    <Stack direction="row" alignItems="center" gap={0.5} mt={0.2}>
                        <EmailOutlinedIcon sx={{ fontSize: 11, color: tSec }} />
                        <Typography fontSize="0.74rem" sx={{ color: tSec }}>{studentEmail}</Typography>
                    </Stack>
                )}
                <Stack direction="row" alignItems="center" gap={0.8} mt={0.5}>
                    <Chip label={status} size="small" sx={{ height: 16, fontSize: "0.6rem", fontWeight: 700, bgcolor: clr.bg, color: clr.fg, borderRadius: "5px" }} />
                    {sentAt && <Typography fontSize="0.68rem" sx={{ color: tSec }}>{sentAt}</Typography>}
                </Stack>
            </Box>
        </Stack>
    );
}

function MyJoinRequestRow({ req, onCancel, busy }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const brd = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
    const accent = isDark ? ACCENT_LIGHT : ACCENT;

    const id = req.joinRequestId ?? req.id;
    const teamName = req.teamName ?? "A team";
    const projectDesc = req.projectDescription ?? req.description ?? null;
    const status = req.status ?? "Pending";
    const sentAt = req.sentAt ? new Date(req.sentAt).toLocaleDateString() : null;
    const clr = statusMeta(status);

    return (
        <Stack direction="row" alignItems="flex-start" gap={1.5}
            sx={{ p: 1.6, borderRadius: "12px", border: `1px solid ${brd}`, bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" }}>
            <Box sx={{
                width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
                bgcolor: `${ACCENT}12`, border: `1px solid ${ACCENT}28`,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <SendOutlinedIcon sx={{ fontSize: 16, color: accent }} />
            </Box>
            <Box flex={1} minWidth={0}>
                <Typography fontWeight={600} fontSize="0.83rem" noWrap sx={{ color: tPri }}>
                    Request to join{" "}<Box component="span" sx={{ color: accent }}>{teamName}</Box>
                </Typography>
                {projectDesc && (
                    <Typography fontSize="0.74rem" sx={{ color: tSec, mt: 0.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {projectDesc}
                    </Typography>
                )}
                <Stack direction="row" alignItems="center" gap={0.8} mt={0.5}>
                    <Chip label={status} size="small" sx={{ height: 16, fontSize: "0.6rem", fontWeight: 700, bgcolor: clr.bg, color: clr.fg, borderRadius: "5px" }} />
                    {sentAt && <Typography fontSize="0.68rem" sx={{ color: tSec }}>{sentAt}</Typography>}
                </Stack>
            </Box>
            {status === "Pending" && (
                <Tooltip title="Cancel request">
                    <IconButton size="small" disabled={busy} onClick={() => onCancel(id)}
                        sx={{ color: RED, flexShrink: 0, "&:hover": { bgcolor: `${RED}12` } }}>
                        <DeleteOutlineIcon sx={{ fontSize: 19 }} />
                    </IconButton>
                </Tooltip>
            )}
        </Stack>
    );
}

function TeamJoinRequestRow({ req, onAccept, onReject, busy }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const brd = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
    const accent = isDark ? ACCENT_LIGHT : ACCENT;

    const id = req.joinRequestId ?? req.id;
    const studentName = req.studentName ?? req.fullName ?? "Student";
    const studentEmail = req.studentEmail ?? req.email ?? null;
    const status = req.status ?? "Pending";
    const sentAt = req.sentAt ? new Date(req.sentAt).toLocaleDateString() : null;
    const clr = statusMeta(status);

    return (
        <Stack direction="row" alignItems="flex-start" gap={1.5}
            sx={{ p: 1.6, borderRadius: "12px", border: `1px solid ${brd}`, bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: MBR_COLORS[3], fontSize: "0.72rem", fontWeight: 700, borderRadius: "10px", flexShrink: 0 }}>
                {initials(studentName)}
            </Avatar>
            <Box flex={1} minWidth={0}>
                <Typography fontWeight={600} fontSize="0.83rem" noWrap sx={{ color: tPri }}>
                    <Box component="span" sx={{ color: accent }}>{studentName}</Box>{" "}wants to join
                </Typography>
                {studentEmail && <Typography fontSize="0.74rem" sx={{ color: tSec, mt: 0.2 }}>{studentEmail}</Typography>}
                <Stack direction="row" alignItems="center" gap={0.8} mt={0.5}>
                    <Chip label={status} size="small" sx={{ height: 16, fontSize: "0.6rem", fontWeight: 700, bgcolor: clr.bg, color: clr.fg, borderRadius: "5px" }} />
                    {sentAt && <Typography fontSize="0.68rem" sx={{ color: tSec }}>{sentAt}</Typography>}
                </Stack>
            </Box>
            {status === "Pending" && (
                <Stack direction="row" gap={0.5} flexShrink={0}>
                    <Tooltip title="Accept">
                        <IconButton size="small" disabled={busy} onClick={() => onAccept(id)}
                            sx={{ color: GREEN, "&:hover": { bgcolor: `${GREEN}12` } }}>
                            <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject">
                        <IconButton size="small" disabled={busy} onClick={() => onReject(id)}
                            sx={{ color: RED, "&:hover": { bgcolor: `${RED}12` } }}>
                            <CancelOutlinedIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )}
        </Stack>
    );
}

/* ════════════════════════════════════════════════════════════════
   PENDING STATE VIEW
════════════════════════════════════════════════════════════════ */
function PendingApprovalView({ team, onRefresh, loading }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const brd = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    const accent = isDark ? ACCENT_LIGHT : ACCENT;
    const paperBg = theme.palette.background.paper;

    const project = team?.projectTitle ?? team?.project ?? "—";
    const projectDesc = team?.projectDescription ?? team?.description ?? null;
    const supervisor = team?.supervisor ?? team?.supervisorName ?? null;
    const supName = typeof supervisor === "string" ? supervisor : supervisor?.fullName ?? supervisor?.name ?? "—";

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h2" sx={{ color: tPri, mb: 0.3 }}>My Team</Typography>
                    <Typography sx={{ color: tSec, fontSize: "0.84rem" }}>Waiting for supervisor approval</Typography>
                </Box>
                <Tooltip title="Refresh">
                    <IconButton size="small" onClick={onRefresh}
                        sx={{ color: tSec, border: `1px solid ${brd}`, borderRadius: "10px", "&:hover": { color: accent } }}>
                        {loading ? <CircularProgress size={16} sx={{ color: accent }} /> : <RefreshOutlinedIcon sx={{ fontSize: 17 }} />}
                    </IconButton>
                </Tooltip>
            </Stack>

            <Box sx={{
                px: 2.5, py: 2, borderRadius: "14px",
                background: isDark
                    ? "linear-gradient(135deg,rgba(200,121,65,0.12) 0%,rgba(200,121,65,0.06) 100%)"
                    : "linear-gradient(135deg,rgba(200,121,65,0.10) 0%,rgba(200,121,65,0.04) 100%)",
                border: `1px solid ${ACCENT}35`,
                display: "flex", alignItems: "flex-start", gap: 1.5,
            }}>
                <Box sx={{ width: 38, height: 38, borderRadius: "11px", flexShrink: 0, bgcolor: `${ACCENT}18`, border: `1px solid ${ACCENT}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <HourglassEmptyOutlinedIcon sx={{ fontSize: 20, color: accent }} />
                </Box>
                <Box>
                    <Typography fontSize="0.88rem" fontWeight={700} sx={{ color: accent, mb: 0.4 }}>
                        Team request submitted — awaiting supervisor approval
                    </Typography>
                    <Typography fontSize="0.78rem" sx={{ color: tSec, lineHeight: 1.7 }}>
                        Your request has been sent. Once the supervisor approves it, you'll be able to invite members and start working on your project.
                    </Typography>
                </Box>
            </Box>

            <Paper elevation={0} sx={{ p: 2.5, borderRadius: "18px", border: `1px solid ${brd}`, bgcolor: paperBg }}>
                <Typography fontSize="0.72rem" fontWeight={700} sx={{ color: tSec, textTransform: "uppercase", letterSpacing: "0.08em", mb: 2 }}>
                    Request Summary
                </Typography>
                <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                        <Box sx={{ width: 34, height: 34, borderRadius: "10px", bgcolor: `${ACCENT}12`, border: `1px solid ${ACCENT}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <FolderOutlinedIcon sx={{ fontSize: 17, color: accent }} />
                        </Box>
                        <Box>
                            <Typography fontSize="0.72rem" sx={{ color: tSec }}>Project Title</Typography>
                            <Typography fontSize="0.88rem" fontWeight={700} sx={{ color: tPri }}>{project}</Typography>
                            {projectDesc && (
                                <Typography fontSize="0.74rem" sx={{ color: tSec, mt: 0.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                    {projectDesc}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                        <Box sx={{ width: 34, height: 34, borderRadius: "10px", bgcolor: "rgba(109,138,125,0.12)", border: "1px solid rgba(109,138,125,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <SchoolOutlinedIcon sx={{ fontSize: 17, color: "#6D8A7D" }} />
                        </Box>
                        <Box>
                            <Typography fontSize="0.72rem" sx={{ color: tSec }}>Supervisor</Typography>
                            <Typography fontSize="0.88rem" fontWeight={700} sx={{ color: tPri }}>{supName}</Typography>
                        </Box>
                    </Stack>
                </Stack>
            </Paper>
        </Box>
    );
}

/* ════════════════════════════════════════════════════════════════
   REJECTED BANNER
════════════════════════════════════════════════════════════════ */
function RejectedBanner({ team }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tSec = theme.palette.text.secondary;

    const supName = (() => {
        const s = team?.supervisor ?? team?.supervisorName ?? null;
        return typeof s === "string" ? s : s?.fullName ?? s?.name ?? null;
    })();

    return (
        <Box sx={{ px: 2, py: 1.5, borderRadius: "12px", bgcolor: `${RED}0C`, border: `1px solid ${RED}28`, display: "flex", alignItems: "center", gap: 1.2, mb: 2 }}>
            <CancelOutlinedIcon sx={{ fontSize: 16, color: RED, flexShrink: 0 }} />
            <Typography fontSize="0.78rem" sx={{ color: tSec, lineHeight: 1.6 }}>
                Your previous team request was rejected{supName ? ` by ${supName}` : ""}.{" "}
                You can submit a new request below.
            </Typography>
        </Box>
    );
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
export default function MyTeamPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const brd = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    const paperBg = theme.palette.background.paper;
    const accent = isDark ? ACCENT_LIGHT : ACCENT;

    /* ── data ── */
    const [myTeam, setMyTeam] = useState(null);
    const [teamState, setTeamState] = useState(TEAM_STATE.NONE);
    const [invitations, setInvitations] = useState([]);
    const [sentInvitations, setSentInvitations] = useState([]);
    const [myJoinRequests, setMyJoinRequests] = useState([]);
    const [teamJoinRequests, setTeamJoinRequests] = useState([]);
    const [available, setAvailable] = useState([]);
    const [leaveRequestPending, setLeaveRequestPending] = useState(false);
    const [sentInviteIds, setSentInviteIds] = useState(new Set());

    /* ── loading ── */
    const [loadingTeam, setLoadingTeam] = useState(true);
    const [loadingInv, setLoadingInv] = useState(false);
    const [loadingMyJoinReqs, setLoadingMyJoinReqs] = useState(false);
    const [loadingTeamJoinReqs, setLoadingTeamJoinReqs] = useState(false);
    const [loadingAvail, setLoadingAvail] = useState(false);
    const [loadingSentInv, setLoadingSentInv] = useState(false);
    const [actionBusy, setActionBusy] = useState(false);
    const [invitingId, setInvitingId] = useState(null);

    /* ── UI ── */
    const [tab, setTab] = useState(0);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    /* ── modals ── */
    const [showGate, setShowGate] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [leaveOpen, setLeaveOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editBusy, setEditBusy] = useState(false);
    const [profileStudent, setProfileStudent] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);

    /* ── Archive ── */
    const [archiveOpen, setArchiveOpen] = useState(false);
    const [archiveGithub, setArchiveGithub] = useState("");
    const [archiveNotes, setArchiveNotes] = useState("");
    const [archiveBusy, setArchiveBusy] = useState(false);

    /* ── AI Project Suggester ── */
    const [suggesterOpen, setSuggesterOpen] = useState(false);

    /* ── snack ── */
    const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
    const snap = (msg, sev = "success") => setSnack({ open: true, msg, sev });

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: "12px", fontSize: "0.875rem",
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: accent }
        },
        "& .MuiInputLabel-root.Mui-focused": { color: accent },
        "& .MuiInputLabel-root": { fontSize: "0.875rem" },
    };

    /* ── fetchers ── */
    const fetchTeam = useCallback(async () => {
        try {
            setLoadingTeam(true);
            const team = await studentApi.getMyTeam() ?? null;
            setMyTeam(team);
            const state = resolveTeamState(team);
            setTeamState(state);
            if (state === TEAM_STATE.ACTIVE) {
                setLeaveRequestPending(
                    team?.leaveRequestStatus?.toLowerCase() === "pending" ||
                    team?.hasPendingLeaveRequest === true
                );
            } else {
                setLeaveRequestPending(false);
            }
        } catch {
            setMyTeam(null);
            setTeamState(TEAM_STATE.NONE);
            setLeaveRequestPending(false);
        } finally {
            setLoadingTeam(false);
        }
    }, []);

    const fetchInvitations = useCallback(async () => {
        try {
            setLoadingInv(true);
            const d = await studentApi.getMyInvitations();
            setInvitations(Array.isArray(d) ? d : []);
        } catch { setInvitations([]); }
        finally { setLoadingInv(false); }
    }, []);

    const fetchSentInvitations = useCallback(async () => {
        try {
            setLoadingSentInv(true);
            let d = null;
            if (typeof studentApi.getSentInvitations === "function")
                d = await studentApi.getSentInvitations();
            else if (typeof studentApi.getTeamSentInvitations === "function")
                d = await studentApi.getTeamSentInvitations();
            const list = Array.isArray(d) ? d : [];
            setSentInvitations(list);
            const ids = new Set(list.map(inv =>
                inv.receiverId ?? inv.studentId ?? inv.userId ?? inv.receiverStudentId
            ).filter(Boolean));
            setSentInviteIds(ids);
        } catch { setSentInvitations([]); }
        finally { setLoadingSentInv(false); }
    }, []);

    const fetchMyJoinRequests = useCallback(async () => {
        try { setLoadingMyJoinReqs(true); const d = await studentApi.getMyJoinRequests(); setMyJoinRequests(Array.isArray(d) ? d : []); }
        catch { setMyJoinRequests([]); }
        finally { setLoadingMyJoinReqs(false); }
    }, []);

    const fetchTeamJoinRequests = useCallback(async () => {
        try { setLoadingTeamJoinReqs(true); const d = await studentApi.getTeamJoinRequests(); setTeamJoinRequests(Array.isArray(d) ? d : []); }
        catch { setTeamJoinRequests([]); }
        finally { setLoadingTeamJoinReqs(false); }
    }, []);

    const fetchAvailable = useCallback(async () => {
        try { setLoadingAvail(true); const d = await studentApi.getAvailableStudents(); setAvailable(Array.isArray(d) ? d : []); }
        catch { setAvailable([]); }
        finally { setLoadingAvail(false); }
    }, []);

    useEffect(() => {
        fetchTeam();
        fetchInvitations();
        fetchMyJoinRequests();
    }, [fetchTeam, fetchInvitations, fetchMyJoinRequests]);

    useEffect(() => {
        if (teamState !== TEAM_STATE.ACTIVE) return;
        if (tab === 1) { fetchAvailable(); fetchSentInvitations(); }
        if (tab === 2) fetchTeamJoinRequests();
        if (tab === 3) fetchSentInvitations();
        if (tab === 4) fetchInvitations();
    }, [tab, teamState, fetchAvailable, fetchTeamJoinRequests, fetchInvitations, fetchSentInvitations]);

    useEffect(() => { setPage(1); }, [search, tab]);

    /* ── derived ── */
    const filtered = available.filter(s =>
        (s.fullName ?? s.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (s.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (s.department ?? "").toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);
    const paginatedList = filtered.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE);

    const pendingInvCount = invitations.filter(i => (i.status ?? "Pending") === "Pending").length;
    const pendingMyJoinCount = myJoinRequests.filter(r => (r.status ?? "Pending") === "Pending").length;
    const pendingTeamJoinCount = teamJoinRequests.filter(r => (r.status ?? "Pending") === "Pending").length;
    const pendingSentInvCount = sentInvitations.filter(i => (i.status ?? "Pending") === "Pending").length;
    const myRequestsBadgeCount = pendingMyJoinCount + pendingSentInvCount;

    const visibleMyJoinRequests = myJoinRequests.filter(
        req => (req.status ?? "Pending").toLowerCase() !== "accepted"
    );

    /* ── actions ── */
    const openEdit = () => {
        setEditTitle(myTeam?.projectTitle ?? myTeam?.project ?? "");
        setEditDesc(myTeam?.projectDescription ?? myTeam?.description ?? "");
        setEditOpen(true);
    };

    const handleSaveProject = async () => {
        if (!editTitle.trim()) { snap("Project title cannot be empty.", "error"); return; }
        try {
            setEditBusy(true);
            await studentApi.updateProjectInfo({ projectTitle: editTitle.trim(), projectDescription: editDesc.trim() });
            snap("Project info updated!"); setEditOpen(false); fetchTeam();
        } catch (e) { snap(extractErrorMsg(e, "Failed to update project info."), "error"); }
        finally { setEditBusy(false); }
    };

    const handleAcceptInv = async (id) => {
        if (teamState === TEAM_STATE.ACTIVE) {
            snap("You are already in an active team. You must leave your current team before accepting another invitation.", "error");
            return;
        }
        try {
            setActionBusy(true);
            await studentApi.respondToInvitation(id, true);
            snap("Invitation accepted!");
            fetchTeam(); fetchInvitations();
        } catch (e) { snap(extractErrorMsg(e), "error"); }
        finally { setActionBusy(false); }
    };

    const handleDeclineInv = async (id) => {
        try {
            setActionBusy(true);
            await studentApi.respondToInvitation(id, false);
            snap("Invitation declined.");
            fetchInvitations();
        } catch (e) { snap(extractErrorMsg(e), "error"); }
        finally { setActionBusy(false); }
    };

    const handleCancelJoin = async (id) => {
        try {
            setActionBusy(true);
            await studentApi.deleteJoinRequest(id);
            snap("Request cancelled."); fetchMyJoinRequests();
        } catch (e) { snap(extractErrorMsg(e), "error"); }
        finally { setActionBusy(false); }
    };

    const handleAcceptTeamJoin = async (id) => {
        try {
            setActionBusy(true);
            await studentApi.respondToJoinRequest(id, true);
            snap("Accepted!"); fetchTeam(); fetchTeamJoinRequests();
        } catch (e) { snap(extractErrorMsg(e), "error"); }
        finally { setActionBusy(false); }
    };

    const handleRejectTeamJoin = async (id) => {
        try {
            setActionBusy(true);
            await studentApi.rejectJoinRequest(id);
            snap("Rejected."); fetchTeamJoinRequests();
        } catch (e) { snap(extractErrorMsg(e), "error"); }
        finally { setActionBusy(false); }
    };

    const handleLeave = async () => {
        try {
            setActionBusy(true);
            await studentApi.requestLeave();
            snap("Leave request submitted. Waiting for supervisor approval.");
            setLeaveOpen(false);
            setLeaveRequestPending(true);
        } catch (e) { snap(extractErrorMsg(e, "Failed to submit leave request."), "error"); }
        finally { setActionBusy(false); }
    };

    const handleInvite = async (studentId) => {
        const currentMembers = myTeam?.members ?? myTeam?.students ?? [];
        if (currentMembers.length >= MAX_TEAM_SIZE) {
            snap(`Your team is full. Maximum team size is ${MAX_TEAM_SIZE} members.`, "warning");
            return;
        }
        try {
            setInvitingId(studentId);
            await studentApi.sendInvitation(studentId);
            const invitedStudent = available.find(s => (s.userId ?? s.id) === studentId);
            const invitedName = invitedStudent?.fullName ?? invitedStudent?.name ?? "Student";
            snap(`Invitation sent to ${invitedName}!`);
            setSentInviteIds(prev => new Set([...prev, studentId]));
            if (invitedStudent) {
                setSentInvitations(prev => [{
                    joinRequestId: `local_${Date.now()}`,
                    receiverName: invitedName,
                    receiverEmail: invitedStudent.email ?? null,
                    receiverId: studentId,
                    status: "Pending",
                    sentAt: new Date().toISOString(),
                }, ...prev]);
            }
            fetchInvitations();
        } catch (e) { snap(extractErrorMsg(e, "Failed to send invitation."), "error"); }
        finally { setInvitingId(null); }
    };

    /* ── Archive handler ── */
    const handleSubmitArchive = async () => {
        if (!archiveGithub.trim()) return;
        try {
            setArchiveBusy(true);
            await archiveApi.submitProject({
                version: myTeam?.version ?? 0,
                githubRepo: archiveGithub.trim(),
                notes: archiveNotes.trim() || undefined,
            });
            snap("Project submitted for supervisor review!");
            setArchiveOpen(false);
            setArchiveGithub("");
            setArchiveNotes("");
            fetchTeam();
        } catch (e) {
            snap(extractErrorMsg(e, "Could not submit project. Please try again."), "error");
        } finally {
            setArchiveBusy(false);
        }
    };

    /* ══ LOADING ════════════════════════════════════════════════ */
    if (loadingTeam) return (
        <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Stack alignItems="center" gap={2}>
                <CircularProgress sx={{ color: accent }} />
                <Typography sx={{ color: tSec, fontSize: "0.84rem" }}>Loading team info…</Typography>
            </Stack>
        </Box>
    );

    /* ══ PENDING STATE ══════════════════════════════════════════ */
    if (teamState === TEAM_STATE.PENDING) return (
        <>
            <PendingApprovalView team={myTeam} onRefresh={fetchTeam} loading={loadingTeam} />
            <Snackbar open={snack.open} autoHideDuration={4000}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity={snack.sev} variant="filled" sx={{ borderRadius: "12px" }}>{snack.msg}</Alert>
            </Snackbar>
        </>
    );

    /* ══ NO TEAM ════════════════════════════════════════════════ */
    if (teamState === TEAM_STATE.NONE) return (
        <>
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                    <Box>
                        <Typography variant="h2" sx={{ color: tPri, mb: 0.4 }}>My Team</Typography>
                        <Typography sx={{ color: tSec, fontSize: "0.85rem" }}>You are not part of any team yet</Typography>
                    </Box>
                </Stack>

                {myTeam && (myTeam.status ?? myTeam.teamStatus ?? "").toLowerCase() === "rejected" && (
                    <RejectedBanner team={myTeam} />
                )}

                {invitations.length > 0 && (
                    <Paper elevation={0} sx={{ mb: 3, borderRadius: "16px", overflow: "hidden", border: `1px solid ${brd}`, bgcolor: paperBg }}>
                        <Stack direction="row" alignItems="center" gap={1} sx={{
                            px: 2.5, py: 1.8,
                            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                        }}>
                            <HowToRegOutlinedIcon sx={{ fontSize: 18, color: accent }} />
                            <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: tPri }}>Pending Invitations</Typography>
                            {pendingInvCount > 0 && (
                                <Chip label={pendingInvCount} size="small" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700, bgcolor: `${ACCENT}18`, color: accent, borderRadius: "6px" }} />
                            )}
                        </Stack>
                        <Stack gap={1} sx={{ p: 2.5 }}>
                            {loadingInv
                                ? <CircularProgress size={22} sx={{ color: accent, mx: "auto" }} />
                                : invitations.map((inv, i) => (
                                    <InviteRow
                                        key={inv.joinRequestId ?? inv.id ?? i}
                                        inv={inv}
                                        busy={actionBusy}
                                        teamState={teamState}
                                        onAccept={handleAcceptInv}
                                        onDecline={handleDeclineInv}
                                    />
                                ))
                            }
                        </Stack>
                    </Paper>
                )}

                {visibleMyJoinRequests.length > 0 && (
                    <Paper elevation={0} sx={{ mb: 3, borderRadius: "16px", overflow: "hidden", border: `1px solid ${brd}`, bgcolor: paperBg }}>
                        <Stack direction="row" alignItems="center" gap={1} sx={{
                            px: 2.5, py: 1.8,
                            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                        }}>
                            <SendOutlinedIcon sx={{ fontSize: 18, color: accent }} />
                            <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: tPri }}>My Join Requests</Typography>
                            {pendingMyJoinCount > 0 && (
                                <Chip label={pendingMyJoinCount} size="small" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700, bgcolor: `${ACCENT}18`, color: accent, borderRadius: "6px" }} />
                            )}
                        </Stack>
                        <Stack gap={1} sx={{ p: 2.5 }}>
                            {loadingMyJoinReqs
                                ? <CircularProgress size={22} sx={{ color: accent, mx: "auto" }} />
                                : visibleMyJoinRequests.map((req, i) => (
                                    <MyJoinRequestRow key={req.joinRequestId ?? req.id ?? i} req={req}
                                        busy={actionBusy} onCancel={handleCancelJoin} />
                                ))
                            }
                        </Stack>
                    </Paper>
                )}

                <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Stack alignItems="center" gap={3} sx={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
                        <Box sx={{ width: 68, height: 68, borderRadius: "18px", bgcolor: `${ACCENT}12`, border: `1.5px solid ${ACCENT}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <GroupsOutlinedIcon sx={{ fontSize: 32, color: accent }} />
                        </Box>
                        <Box>
                            <Typography fontWeight={700} fontSize="1.05rem" sx={{ color: tPri, mb: 0.6 }}>You're not in a team yet</Typography>
                            <Typography fontSize="0.83rem" sx={{ color: tSec, lineHeight: 1.75 }}>
                                Create a new team with a supervisor, or join an existing one to start your graduation project.
                            </Typography>
                        </Box>
                        <Paper elevation={0} onClick={() => setShowGate(true)} sx={{
                            p: 2.2, borderRadius: "14px", cursor: "pointer", width: "100%",
                            border: `1.5px solid ${ACCENT}50`, bgcolor: `${ACCENT}08`,
                            transition: "all 0.18s ease",
                            "&:hover": { bgcolor: `${ACCENT}12`, transform: "translateY(-2px)", boxShadow: `0 6px 20px ${ACCENT}18` },
                        }}>
                            <Stack direction="row" alignItems="center" gap={2}>
                                <Box sx={{ width: 40, height: 40, borderRadius: "12px", flexShrink: 0, bgcolor: `${ACCENT}18`, border: `1px solid ${ACCENT}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <AddCircleOutlineIcon sx={{ fontSize: 22, color: accent }} />
                                </Box>
                                <Box textAlign="left">
                                    <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: tPri }}>Create or Join a Team</Typography>
                                    <Typography fontSize="0.76rem" sx={{ color: tSec }}>Start fresh or browse available teams</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Stack>
                </Box>
            </Box>

            <JoinOrCreateModal open={showGate} onClose={() => setShowGate(false)}
                onCreate={() => { setShowGate(false); setShowCreate(true); }}
                onJoin={() => { setShowGate(false); setShowJoin(true); }} />
            <CreateTeamFlow open={showCreate} onClose={() => setShowCreate(false)}
                onSuccess={msg => { snap(msg); setShowCreate(false); fetchTeam(); }} />
            <JoinTeamFlow open={showJoin} onClose={() => setShowJoin(false)}
                onSuccess={msg => { snap(msg); setShowJoin(false); fetchTeam(); fetchMyJoinRequests(); }} />

            <Snackbar open={snack.open} autoHideDuration={3500}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity={snack.sev} variant="filled" sx={{ borderRadius: "12px" }}>{snack.msg}</Alert>
            </Snackbar>
        </>
    );

    /* ══ ACTIVE TEAM ════════════════════════════════════════════ */
    const members = myTeam.members ?? myTeam.students ?? [];
    const supervisor = myTeam.supervisor ?? myTeam.supervisorName ?? null;
    const project = myTeam.projectTitle ?? myTeam.project ?? "—";
    const projectDesc = myTeam.projectDescription ?? myTeam.description ?? null;
    const teamStatus = myTeam.status ?? myTeam.teamStatus ?? null;
    const teamName = myTeam.teamName ?? myTeam.name ?? null;
    const isTeamFull = members.length >= MAX_TEAM_SIZE;

    /* ── build project context for suggester ── */
    const suggesterProject = {
        title: myTeam.projectTitle ?? myTeam.project ?? "",
        description: myTeam.projectDescription ?? myTeam.description ?? "",
        field: members.map(m => m.field ?? m.skills).filter(Boolean).join(", "),
        department: typeof supervisor === "object" ? supervisor?.department ?? "" : "",
        teamMembers: members,
    };

    return (
        <>
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 2.5 }}>

                {/* ── HEADER ── */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h2" sx={{ color: tPri, mb: 0.3 }}>My Team</Typography>
                        <Typography sx={{ color: tSec, fontSize: "0.84rem" }}>
                            {teamName ? `Team: ${teamName}` : "Your current team & project"}
                        </Typography>
                    </Box>

                    <Stack direction="row" gap={1} alignItems="center">
                        <Tooltip title="Refresh">
                            <IconButton size="small"
                                onClick={() => { fetchTeam(); fetchInvitations(); fetchMyJoinRequests(); fetchTeamJoinRequests(); fetchSentInvitations(); }}
                                sx={{ color: tSec, border: `1px solid ${brd}`, borderRadius: "10px", "&:hover": { color: accent } }}>
                                <RefreshOutlinedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Find similar projects & get AI-powered ideas">
                            <span>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<AutoFixHighOutlinedIcon sx={{ fontSize: 15 }} />}
                                    onClick={() => setSuggesterOpen(true)}
                                    disabled={!suggesterProject.title && !suggesterProject.description}
                                    sx={{
                                        borderColor: `${accent}50`, color: accent, borderRadius: "10px",
                                        textTransform: "none", fontWeight: 600, fontSize: "0.78rem",
                                        "&:hover": { bgcolor: `${accent}08`, borderColor: accent, boxShadow: `0 2px 12px ${accent}20` },
                                        "&.Mui-disabled": { borderColor: `${accent}25`, color: `${accent}50` },
                                    }}
                                >
                                    AI Suggest
                                </Button>
                            </span>
                        </Tooltip>

                        {leaveRequestPending ? (
                            <Tooltip title="Your leave request is awaiting supervisor approval">
                                <Box>
                                    <Button size="small" variant="outlined" disabled
                                        startIcon={<HourglassEmptyOutlinedIcon sx={{ fontSize: 15 }} />}
                                        sx={{ borderColor: `${ORANGE}55`, color: ORANGE, borderRadius: "10px", textTransform: "none", fontWeight: 600, fontSize: "0.78rem", opacity: 0.85 }}>
                                        Leave Pending…
                                    </Button>
                                </Box>
                            </Tooltip>
                        ) : (
                            <Button size="small" variant="outlined"
                                startIcon={<ExitToAppOutlinedIcon />}
                                onClick={() => setLeaveOpen(true)}
                                sx={{ borderColor: `${RED}55`, color: RED, borderRadius: "10px", textTransform: "none", fontWeight: 600, fontSize: "0.78rem", "&:hover": { bgcolor: `${RED}08`, borderColor: RED } }}>
                                Leave Team
                            </Button>
                        )}
                    </Stack>
                </Stack>

                {/* ── Pending Leave Banner ── */}
                {leaveRequestPending && (
                    <Box sx={{ px: 2, py: 1.4, borderRadius: "12px", bgcolor: `${ORANGE}10`, border: `1px solid ${ORANGE}35`, display: "flex", alignItems: "center", gap: 1.2 }}>
                        <HourglassEmptyOutlinedIcon sx={{ fontSize: 16, color: ORANGE, flexShrink: 0 }} />
                        <Box>
                            <Typography fontSize="0.8rem" fontWeight={700} sx={{ color: ORANGE }}>Leave Request Pending</Typography>
                            <Typography fontSize="0.72rem" sx={{ color: tSec }}>
                                Your request to leave this team is awaiting supervisor approval. You remain a member until it's approved.
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* ── PROJECT + SUPERVISOR ── */}
                <Stack direction={{ xs: "column", sm: "row" }} gap={2}>


                    {/* PROJECT CARD */}
                    <Paper elevation={0} sx={{ flex: 1, p: 2.5, borderRadius: "18px", border: `1px solid ${brd}`, bgcolor: paperBg }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.8}>
                            <Stack direction="row" alignItems="center" gap={1.2}>
                                <Box sx={{ width: 36, height: 36, borderRadius: "11px", flexShrink: 0, bgcolor: `${ACCENT}12`, border: `1px solid ${ACCENT}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <FolderOutlinedIcon sx={{ fontSize: 18, color: accent }} />
                                </Box>
                                <Typography fontWeight={700} fontSize="0.78rem" sx={{ color: tSec, textTransform: "uppercase", letterSpacing: "0.08em" }}>Project</Typography>
                            </Stack>

                            <Stack direction="row" gap={1}>
                                <Tooltip title="Final project submission after completing your work - request will be reviewed by your supervisor">
                                    <Button
                                        size="small"
                                        variant="contained"
                                        startIcon={<ArchiveOutlinedIcon sx={{ fontSize: 14 }} />}
                                        onClick={() => setArchiveOpen(true)}
                                        sx={{
                                            bgcolor: accent, borderRadius: "10px", boxShadow: "none",
                                            textTransform: "none", fontWeight: 700, fontSize: "0.7rem",
                                            "&:hover": { bgcolor: accent, filter: "brightness(0.92)", boxShadow: "none" },
                                        }}
                                    >
                                        Submit for Archive
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Edit project info">
                                    <IconButton size="small" onClick={openEdit}
                                        sx={{ color: tSec, borderRadius: "8px", "&:hover": { color: accent, bgcolor: `${ACCENT}0D` } }}>
                                        <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Stack>

                        <Typography fontWeight={700} fontSize="1rem" sx={{ color: tPri, mb: 0.5 }}>{project}</Typography>
                        {projectDesc && (
                            <Typography fontSize="0.78rem" sx={{ color: tSec, lineHeight: 1.65, mb: 0.8, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {projectDesc}
                            </Typography>
                        )}
                        {teamStatus && (() => {
                            const m = statusMeta(teamStatus);
                            return <Chip label={teamStatus} size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, bgcolor: m.bg, color: m.fg, borderRadius: "7px" }} />;
                        })()}
                    </Paper>
                    {/* SUPERVISOR CARD */}
                    <Paper elevation={0} sx={{ flex: 1, p: 2.5, borderRadius: "18px", border: `1px solid ${brd}`, bgcolor: paperBg }}>
                        <Stack direction="row" alignItems="center" gap={1.2} mb={1.8}>
                            <Box sx={{ width: 36, height: 36, borderRadius: "11px", flexShrink: 0, bgcolor: "rgba(109,138,125,0.12)", border: "1px solid rgba(109,138,125,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <SchoolOutlinedIcon sx={{ fontSize: 18, color: "#6D8A7D" }} />
                            </Box>
                            <Typography fontWeight={700} fontSize="0.78rem" sx={{ color: tSec, textTransform: "uppercase", letterSpacing: "0.08em" }}>Supervisor</Typography>
                        </Stack>
                        {supervisor ? (
                            <Stack direction="row" alignItems="center" gap={1.5}>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: "#6D8A7D", fontWeight: 700, fontSize: "0.9rem", borderRadius: "12px" }}>
                                    {initials(typeof supervisor === "string" ? supervisor : supervisor.fullName ?? supervisor.name ?? "?")}
                                </Avatar>
                                <Box>
                                    <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: tPri }}>
                                        {typeof supervisor === "string" ? supervisor : supervisor.fullName ?? supervisor.name ?? "—"}
                                    </Typography>
                                    {typeof supervisor === "object" && supervisor?.department && (
                                        <Typography fontSize="0.74rem" sx={{ color: tSec }}>{supervisor.department}</Typography>
                                    )}
                                </Box>
                            </Stack>
                        ) : (
                            <Typography fontSize="0.84rem" sx={{ color: tSec }}>Not assigned yet</Typography>
                        )}
                    </Paper>
                </Stack>

                {/* ── TABS ── */}
                <Paper elevation={0} sx={{ flex: 1, borderRadius: "18px", overflow: "hidden", border: `1px solid ${brd}`, bgcolor: paperBg, display: "flex", flexDirection: "column" }}>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
                        px: 1.5, minHeight: 46,
                        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                        "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.8rem", minHeight: 46, color: tSec },
                        "& .Mui-selected": { color: accent },
                        "& .MuiTabs-indicator": { bgcolor: accent, height: 2.5, borderRadius: "2px" },
                    }}>
                        <Tab label={<Stack direction="row" alignItems="center" gap={0.7}><PeopleOutlineIcon sx={{ fontSize: 15 }} /><span>Members ({members.length})</span></Stack>} />
                        <Tab label={
                            <Stack direction="row" alignItems="center" gap={0.7}>
                                <PersonAddOutlinedIcon sx={{ fontSize: 15 }} />
                                <span>Invite Students</span>
                                {isTeamFull
                                    ? <Chip label="Full" size="small" sx={{ height: 16, fontSize: "0.6rem", fontWeight: 700, bgcolor: `${RED}18`, color: RED, borderRadius: "5px" }} />
                                    : filtered.length > 0 && <Chip label={filtered.length} size="small" sx={{ height: 16, fontSize: "0.6rem", fontWeight: 700, bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)", color: tSec, borderRadius: "5px" }} />
                                }
                            </Stack>
                        } />
                        <Tab label={
                            <Stack direction="row" alignItems="center" gap={0.7}>
                                <HowToRegOutlinedIcon sx={{ fontSize: 15 }} />
                                <span>Join Requests</span>
                                {pendingTeamJoinCount > 0 && <Chip label={pendingTeamJoinCount} size="small" sx={{ height: 16, fontSize: "0.6rem", fontWeight: 700, bgcolor: `${ACCENT}20`, color: accent, borderRadius: "5px" }} />}
                            </Stack>
                        } />
                        <Tab label={
                            <Stack direction="row" alignItems="center" gap={0.7}>
                                <SendOutlinedIcon sx={{ fontSize: 15 }} />
                                <span>My Requests</span>
                                {myRequestsBadgeCount > 0 && <Chip label={myRequestsBadgeCount} size="small" sx={{ height: 16, fontSize: "0.6rem", fontWeight: 700, bgcolor: `${ACCENT}20`, color: accent, borderRadius: "5px" }} />}
                            </Stack>
                        } />
                        <Tab label={
                            <Stack direction="row" alignItems="center" gap={0.7}>
                                <HowToRegOutlinedIcon sx={{ fontSize: 15 }} />
                                <span>My Invitations</span>
                                {pendingInvCount > 0 && <Chip label={pendingInvCount} size="small" sx={{ height: 16, fontSize: "0.6rem", fontWeight: 700, bgcolor: `${ACCENT}20`, color: accent, borderRadius: "5px" }} />}
                            </Stack>
                        } />
                    </Tabs>

                    {/* TAB 0 — Members */}
                    {tab === 0 && (
                        <Box sx={{ p: 2.5, flex: 1, overflowY: "auto" }}>
                            {members.length === 0
                                ? <Typography sx={{ color: tSec, fontSize: "0.84rem", textAlign: "center", mt: 4 }}>No members yet</Typography>
                                : <Stack gap={1.2}>
                                    {members.map((m, i) => {
                                        const mName = m.fullName ?? m.name ?? "Student";
                                        const leader = m.isLeader ?? m.role === "leader" ?? i === 0;
                                        const c = MBR_COLORS[i % MBR_COLORS.length];
                                        return (
                                            <Stack key={m.userId ?? m.id ?? i} direction="row" alignItems="center" gap={1.5}
                                                sx={{ p: 1.5, borderRadius: "12px", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`, bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" }}>
                                                <Box sx={{ width: 40, height: 40, borderRadius: "12px", bgcolor: `${c}18`, border: `1.5px solid ${c}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 800, color: c }}>
                                                    {initials(mName)}
                                                </Box>
                                                <Box flex={1} minWidth={0}>
                                                    <Stack direction="row" alignItems="center" gap={0.8}>
                                                        <Typography fontWeight={600} fontSize="0.87rem" noWrap sx={{ color: tPri }}>{mName}</Typography>
                                                        {leader && <Chip label="Leader" size="small" sx={{ height: 17, fontSize: "0.6rem", fontWeight: 700, bgcolor: `${ACCENT}14`, color: accent, borderRadius: "5px" }} />}
                                                    </Stack>
                                                    <Typography fontSize="0.73rem" noWrap sx={{ color: tSec }}>{m.email ?? m.studentId ?? ""}</Typography>
                                                </Box>
                                            </Stack>
                                        );
                                    })}
                                </Stack>
                            }
                        </Box>
                    )}

                    {/* TAB 1 — Invite Students */}
                    {tab === 1 && (
                        <Box sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                            {isTeamFull && (
                                <Box sx={{ mb: 2, px: 2, py: 1.4, borderRadius: "12px", bgcolor: `${RED}10`, border: `1px solid ${RED}30`, display: "flex", alignItems: "center", gap: 1 }}>
                                    <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: `${RED}18`, border: `1px solid ${RED}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <GroupsOutlinedIcon sx={{ fontSize: 15, color: RED }} />
                                    </Box>
                                    <Box>
                                        <Typography fontSize="0.78rem" fontWeight={700} sx={{ color: RED }}>Team is full ({members.length}/{MAX_TEAM_SIZE} members)</Typography>
                                        <Typography fontSize="0.71rem" sx={{ color: tSec }}>You cannot invite more students until a member leaves.</Typography>
                                    </Box>
                                </Box>
                            )}

                            <Stack direction="row" alignItems="center" gap={1.5} mb={2.5}>
                                <TextField size="small" fullWidth
                                    placeholder="Search by name, email or department…"
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    InputProps={{ startAdornment: <SearchOutlinedIcon sx={{ fontSize: 17, color: tSec, mr: 0.8 }} /> }}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", fontSize: "0.85rem", "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: accent } } }}
                                />
                                {!loadingAvail && filtered.length > 0 && (
                                    <Typography fontSize="0.76rem" sx={{ color: tSec, whiteSpace: "nowrap" }}>
                                        {filtered.length} student{filtered.length !== 1 ? "s" : ""}
                                    </Typography>
                                )}
                            </Stack>

                            <Box sx={{ flex: 1, overflowY: "auto" }}>
                                {loadingAvail ? (
                                    <Box display="flex" justifyContent="center" pt={5}><CircularProgress size={28} sx={{ color: accent }} /></Box>
                                ) : paginatedList.length === 0 ? (
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pt: 7, gap: 1.5 }}>
                                        <Box sx={{ width: 56, height: 56, borderRadius: "16px", bgcolor: `${ACCENT}0D`, border: `1px solid ${ACCENT}1E`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <PersonAddOutlinedIcon sx={{ fontSize: 26, color: accent, opacity: 0.55 }} />
                                        </Box>
                                        <Typography fontSize="0.84rem" sx={{ color: tSec }}>
                                            {search ? "No students match your search." : "No available students found."}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 2, pb: 1 }}>
                                        {paginatedList.map((s, i) => {
                                            const sid = s.userId ?? s.id;
                                            return (
                                                <StudentCard key={sid ?? i} student={s}
                                                    colorIndex={(page - 1) * CARDS_PER_PAGE + i}
                                                    busyId={invitingId}
                                                    onInvite={handleInvite}
                                                    onViewProfile={st => { setProfileStudent(st); setProfileOpen(true); }}
                                                    alreadyInvited={sentInviteIds.has(sid)}
                                                />
                                            );
                                        })}
                                    </Box>
                                )}
                            </Box>

                            {totalPages > 1 && (
                                <Stack alignItems="center" sx={{ pt: 2.5, mt: 1.5, borderTop: `1px solid ${brd}` }}>
                                    <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} size="small"
                                        sx={{
                                            "& .MuiPaginationItem-root": { borderRadius: "8px", fontWeight: 600, fontSize: "0.78rem", color: tSec },
                                            "& .Mui-selected": { bgcolor: `${ACCENT} !important`, color: "#fff !important" },
                                            "& .MuiPaginationItem-root:hover:not(.Mui-selected)": { bgcolor: `${ACCENT}12`, color: accent },
                                        }}
                                    />
                                    <Typography fontSize="0.71rem" sx={{ color: tSec, mt: 0.8 }}>
                                        Showing {(page - 1) * CARDS_PER_PAGE + 1}–{Math.min(page * CARDS_PER_PAGE, filtered.length)} of {filtered.length}
                                    </Typography>
                                </Stack>
                            )}
                        </Box>
                    )}

                    {/* TAB 2 — Team join requests */}
                    {tab === 2 && (
                        <Box sx={{ p: 2.5, flex: 1, overflowY: "auto" }}>
                            {loadingTeamJoinReqs
                                ? <Box display="flex" justifyContent="center" pt={4}><CircularProgress size={24} sx={{ color: accent }} /></Box>
                                : teamJoinRequests.length === 0
                                    ? <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pt: 7, gap: 1.5 }}>
                                        <Box sx={{ width: 56, height: 56, borderRadius: "16px", bgcolor: `${ACCENT}0D`, border: `1px solid ${ACCENT}1E`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <HowToRegOutlinedIcon sx={{ fontSize: 26, color: accent, opacity: 0.55 }} />
                                        </Box>
                                        <Typography fontSize="0.84rem" sx={{ color: tSec }}>No join requests yet</Typography>
                                    </Box>
                                    : <Stack gap={1.2}>
                                        {teamJoinRequests.map((req, i) => (
                                            <TeamJoinRequestRow key={req.joinRequestId ?? req.id ?? i} req={req}
                                                busy={actionBusy} onAccept={handleAcceptTeamJoin} onReject={handleRejectTeamJoin} />
                                        ))}
                                    </Stack>
                            }
                        </Box>
                    )}

                    {/* TAB 3 — My Requests */}
                    {tab === 3 && (
                        <Box sx={{ p: 2.5, flex: 1, overflowY: "auto" }}>
                            {(loadingMyJoinReqs || loadingSentInv) ? (
                                <Box display="flex" justifyContent="center" pt={4}><CircularProgress size={24} sx={{ color: accent }} /></Box>
                            ) : (visibleMyJoinRequests.length === 0 && sentInvitations.length === 0) ? (
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pt: 7, gap: 1.5 }}>
                                    <Box sx={{ width: 56, height: 56, borderRadius: "16px", bgcolor: `${ACCENT}0D`, border: `1px solid ${ACCENT}1E`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <SendOutlinedIcon sx={{ fontSize: 26, color: accent, opacity: 0.55 }} />
                                    </Box>
                                    <Typography fontSize="0.84rem" sx={{ color: tSec }}>You haven't sent any requests or invitations yet</Typography>
                                </Box>
                            ) : (
                                <Stack gap={2.5}>
                                    {sentInvitations.length > 0 && (
                                        <Box>
                                            <Stack direction="row" alignItems="center" gap={0.8} mb={1.5}>
                                                <MarkEmailReadOutlinedIcon sx={{ fontSize: 15, color: accent }} />
                                                <Typography fontSize="0.72rem" fontWeight={700} sx={{ color: tSec, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                                    Invitations Sent to Students ({sentInvitations.length})
                                                </Typography>
                                            </Stack>
                                            <Stack gap={1.2}>
                                                {sentInvitations.map((inv, i) => <SentInvitationRow key={inv.joinRequestId ?? inv.id ?? i} inv={inv} />)}
                                            </Stack>
                                        </Box>
                                    )}
                                    {visibleMyJoinRequests.length > 0 && (
                                        <Box>
                                            <Stack direction="row" alignItems="center" gap={0.8} mb={1.5}>
                                                <SendOutlinedIcon sx={{ fontSize: 15, color: accent }} />
                                                <Typography fontSize="0.72rem" fontWeight={700} sx={{ color: tSec, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                                    My Join Requests ({visibleMyJoinRequests.length})
                                                </Typography>
                                            </Stack>
                                            <Stack gap={1.2}>
                                                {visibleMyJoinRequests.map((req, i) => (
                                                    <MyJoinRequestRow key={req.joinRequestId ?? req.id ?? i} req={req}
                                                        busy={actionBusy} onCancel={handleCancelJoin} />
                                                ))}
                                            </Stack>
                                        </Box>
                                    )}
                                </Stack>
                            )}
                        </Box>
                    )}

                    {/* TAB 4 — My Invitations (received) */}
                    {tab === 4 && (
                        <Box sx={{ p: 2.5, flex: 1, overflowY: "auto" }}>
                            {teamState === TEAM_STATE.ACTIVE && invitations.some(i => (i.status ?? "Pending") === "Pending") && (
                                <Box sx={{ mb: 2, px: 2, py: 1.4, borderRadius: "12px", bgcolor: `${RED}08`, border: `1px solid ${RED}22`, display: "flex", alignItems: "center", gap: 1.2 }}>
                                    <BlockOutlinedIcon sx={{ fontSize: 16, color: RED, flexShrink: 0 }} />
                                    <Typography fontSize="0.78rem" sx={{ color: RED, fontWeight: 600, lineHeight: 1.5 }}>
                                        You are already in an active team. You must leave your current team before accepting any invitation.
                                    </Typography>
                                </Box>
                            )}

                            {loadingInv ? (
                                <Box display="flex" justifyContent="center" pt={4}><CircularProgress size={24} sx={{ color: accent }} /></Box>
                            ) : invitations.length === 0 ? (
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pt: 7, gap: 1.5 }}>
                                    <Box sx={{ width: 56, height: 56, borderRadius: "16px", bgcolor: `${ACCENT}0D`, border: `1px solid ${ACCENT}1E`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <HowToRegOutlinedIcon sx={{ fontSize: 26, color: accent, opacity: 0.55 }} />
                                    </Box>
                                    <Typography fontSize="0.84rem" sx={{ color: tSec }}>No invitations yet</Typography>
                                </Box>
                            ) : (
                                <Stack gap={1.2}>
                                    {invitations.map((inv, i) => (
                                        <InviteRow
                                            key={inv.joinRequestId ?? inv.id ?? i}
                                            inv={inv}
                                            busy={actionBusy}
                                            teamState={teamState}
                                            onAccept={handleAcceptInv}
                                            onDecline={handleDeclineInv}
                                        />
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    )}
                </Paper>
            </Box>

            {/* ══ AI PROJECT SUGGESTER DIALOG ══ */}
            <AIProjectSuggester
                open={suggesterOpen}
                onClose={() => setSuggesterOpen(false)}
                project={suggesterProject}
            />

            {/* ══ PROFILE MODAL ══ */}
            <StudentProfileModal open={profileOpen}
                onClose={() => { setProfileOpen(false); setProfileStudent(null); }}
                student={profileStudent} onInvite={handleInvite}
                isInviting={!!invitingId} sentInviteIds={sentInviteIds} />

            {/* ══ EDIT PROJECT DIALOG ══ */}
            <Dialog open={editOpen} onClose={() => !editBusy && setEditOpen(false)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: "18px", border: `1px solid ${brd}`, bgcolor: paperBg } }}>
                <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${brd}` }}>
                    <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: tPri }}>Edit Project Info</Typography>
                </Box>
                <Box sx={{ px: 3, py: 2.5 }}>
                    <Stack gap={2}>
                        <TextField label="Project Title" size="small" fullWidth required value={editTitle} onChange={e => setEditTitle(e.target.value)} sx={inputSx} />
                        <TextField label="Project Description" size="small" fullWidth multiline rows={3} value={editDesc} onChange={e => setEditDesc(e.target.value)} sx={inputSx} />
                    </Stack>
                </Box>
                <Box sx={{ px: 3, pb: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <Button disabled={editBusy} onClick={() => setEditOpen(false)} sx={{ color: tSec, textTransform: "none", fontWeight: 500, borderRadius: "10px" }}>Cancel</Button>
                    <Button variant="contained" disabled={editBusy} onClick={handleSaveProject}
                        sx={{ bgcolor: accent, "&:hover": { bgcolor: isDark ? ACCENT : "#a8622e", boxShadow: "none" }, textTransform: "none", fontWeight: 700, borderRadius: "10px", boxShadow: "none" }}>
                        {editBusy ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Save"}
                    </Button>
                </Box>
            </Dialog>

            {/* ══ ARCHIVE DIALOG ══ */}
            <Dialog open={archiveOpen} onClose={() => !archiveBusy && setArchiveOpen(false)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: "18px", border: `1px solid ${brd}`, bgcolor: paperBg } }}>
                <Box sx={{ height: 3, bgcolor: accent, borderRadius: "18px 18px 0 0" }} />
                <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${brd}` }}>
                    <Stack direction="row" alignItems="center" gap={1}>
                        <ArchiveOutlinedIcon sx={{ fontSize: 18, color: accent }} />
                        <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: tPri }}>Submit Project for Archive - Final Submission</Typography>
                    </Stack>
                    <Typography fontSize="0.78rem" sx={{ color: tSec, mt: 0.5 }}>
                        ⚠️ This is the final submission of your project after completing all work. Your supervisor will be notified for review.
                    </Typography>
                </Box>
                <Box sx={{ px: 3, py: 2.5 }}>
                    <Stack gap={2}>
                        <TextField
                            label="GitHub Repository URL"
                            size="small"
                            fullWidth
                            required
                            placeholder="https://github.com/username/repo"
                            value={archiveGithub}
                            onChange={e => setArchiveGithub(e.target.value)}
                            sx={inputSx}
                            InputProps={{
                                startAdornment: <GitHubIcon sx={{ fontSize: 15, color: tSec, mr: 0.8 }} />,
                            }}
                        />
                        <TextField
                            label="Additional Notes (Optional)"
                            size="small"
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="Any notes you'd like to add for your supervisor..."
                            value={archiveNotes}
                            onChange={e => setArchiveNotes(e.target.value)}
                            sx={inputSx}
                        />
                    </Stack>
                </Box>
                <Box sx={{ px: 3, pb: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <Button disabled={archiveBusy} onClick={() => setArchiveOpen(false)}
                        sx={{ color: tSec, textTransform: "none", fontWeight: 500, borderRadius: "10px" }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disabled={archiveBusy || !archiveGithub.trim()}
                        onClick={handleSubmitArchive}
                        startIcon={archiveBusy ? null : <SendOutlinedIcon sx={{ fontSize: 14 }} />}
                        sx={{
                            bgcolor: accent, textTransform: "none", fontWeight: 700,
                            borderRadius: "10px", boxShadow: "none",
                            "&:hover": { bgcolor: accent, filter: "brightness(0.92)", boxShadow: "none" },
                            "&.Mui-disabled": { opacity: 0.5 },
                        }}
                    >
                        {archiveBusy ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Submit Archive Request"}
                    </Button>
                </Box>
            </Dialog>

            {/* ══ LEAVE CONFIRM DIALOG ══ */}
            <Dialog open={leaveOpen} onClose={() => !actionBusy && setLeaveOpen(false)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: "18px", border: `1px solid ${brd}`, bgcolor: paperBg } }}>
                <Box sx={{ p: 3 }}>
                    <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: tPri, mb: 0.8 }}>Leave Team?</Typography>
                    <Typography fontSize="0.83rem" sx={{ color: tSec, lineHeight: 1.75, mb: 2.5 }}>
                        A leave request will be submitted. You'll remain a member until the supervisor approves it.
                        You cannot submit another leave request while one is pending.
                    </Typography>
                    <Stack direction="row" gap={1} justifyContent="flex-end">
                        <Button onClick={() => setLeaveOpen(false)} disabled={actionBusy} sx={{ textTransform: "none", color: tSec, borderRadius: "10px", fontWeight: 500 }}>Cancel</Button>
                        <Button variant="contained" disabled={actionBusy} onClick={handleLeave}
                            sx={{ bgcolor: RED, "&:hover": { bgcolor: "#b83f3f", boxShadow: "none" }, textTransform: "none", fontWeight: 700, borderRadius: "10px", boxShadow: "none", px: 3 }}>
                            {actionBusy ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Confirm Leave"}
                        </Button>
                    </Stack>
                </Box>
            </Dialog>

            {/* ── SNACKBAR ── */}
            <Snackbar open={snack.open} autoHideDuration={4000}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity={snack.sev} variant="filled" sx={{ borderRadius: "12px" }}>{snack.msg}</Alert>
            </Snackbar>
        </>
    );
}