
// import { useState, useEffect } from "react";
// import {
//     Box, Paper, Typography, Stack, Avatar, Chip, Button,
//     TextField, InputAdornment, LinearProgress,
//     Dialog, DialogContent,
//     Grid, CircularProgress, Divider, IconButton, Tooltip,
// } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// import SearchIcon from "@mui/icons-material/Search";
// import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
// import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
// import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
// import CloseIcon from "@mui/icons-material/Close";
// import LinkedInIcon from "@mui/icons-material/LinkedIn";
// import GitHubIcon from "@mui/icons-material/GitHub";
// import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
// import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
// import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
// import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
// import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
// import studentApi from "../../../../api/handler/endpoints/studentApi";
// import UserProfileApi from "../../../../api/handler/endpoints/UserProfileApi";

// // ══════════════════════════════════════════════════════════════════════
// // ثوابت
// // ══════════════════════════════════════════════════════════════════════
// const SKILL_COLORS = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8", "#C47E7E"];
// const DEPT_CLR = { CS: "#B46F4C", CE: "#7E9FC4", EE: "#6D8A7D" };
// const ACCENT = "#d0895b";
// const A10_LIGHT = "rgba(208,137,91,0.07)";
// const A10_DARK = "rgba(208,137,91,0.10)";
// const A22 = "rgba(208,137,91,0.22)";

// const getId = (s) => s?.id ?? s?.userId ?? s?._id ?? null;

// // ══════════════════════════════════════════════════════════════════════
// // StudentProfileModal — مودال البروفايل الكامل
// // ══════════════════════════════════════════════════════════════════════
// function StudentProfileModal({ open, onClose, student, onInvite, isInvited, isInviting }) {
//     const theme = useTheme();
//     const isDark = theme.palette.mode === "dark";

//     const [fullProfile, setFullProfile] = useState(null);
//     const [profLoading, setProfLoading] = useState(false);

//     const a10 = isDark ? A10_DARK : A10_LIGHT;
//     const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
//     const cardBg = theme.palette.background.paper;
//     const sidebarBg = isDark ? "rgba(255,255,255,0.02)" : "#fafaf9";
//     const textPri = theme.palette.text.primary;
//     const textSec = theme.palette.text.secondary;

//     const sid = getId(student);
//     const name = student?.fullName ?? student?.name ?? student?.username ?? "Student";
//     const dept = student?.department ?? student?.dept ?? "";
//     const skills = fullProfile?.skills ?? student?.skills ?? [];
//     const match = student?.matchPercentage ?? student?.match ?? null;

//     // جلب بروفايل كامل لما المودال يفتح
//     useEffect(() => {
//         if (!open || !sid) return;
//         setFullProfile(null);
//         setProfLoading(true);
//         UserProfileApi.getProfileById(sid)
//             .then((d) => setFullProfile(normalizeProfile(d)))
//             .catch(() => setFullProfile(null))
//             .finally(() => setProfLoading(false));
//     }, [open, sid]);

//     const normalizeProfile = (raw) => {
//         if (!raw) return null;
//         const skillsFromField = raw.field
//             ? raw.field.split(",").map((s) => s.trim()).filter(Boolean)
//             : [];
//         return {
//             fullName: raw.fullName ?? "",
//             phoneNumber: raw.phoneNumber ?? "",
//             department: raw.department ?? "",
//             skills: skillsFromField,
//             github: raw.gitHubLink ?? raw.github ?? "",
//             linkedin: raw.linkedinLink ?? raw.linkedin ?? "",
//             email: raw.personalEmail ?? raw.email ?? "",
//             bio: raw.bio ?? "",
//         };
//     };

//     const displayDept = fullProfile?.department || dept;
//     const displayName = fullProfile?.fullName || name;
//     const avatarLetters = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

//     const coverGradient = isDark
//         ? "linear-gradient(135deg, #2a1f18 0%, #1e1510 100%)"
//         : "linear-gradient(135deg, #fdf0e8 0%, #f5e0cc 100%)";

//     const labelSx = {
//         fontSize: "0.66rem", fontWeight: 700,
//         letterSpacing: "0.08em", textTransform: "uppercase", color: textSec,
//     };

//     // ── Section card helper ──────────────────────────────────────────
//     const SectionBlock = ({ icon: Icon, title, children }) => (
//         <Paper elevation={0} sx={{
//             borderRadius: 2.5, border: `1px solid ${border}`,
//             bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
//             overflow: "hidden",
//         }}>
//             <Box sx={{
//                 px: 2, py: 1.4, borderBottom: `1px solid ${border}`,
//                 display: "flex", alignItems: "center", gap: 1,
//             }}>
//                 <Icon sx={{ fontSize: 13, color: ACCENT }} />
//                 <Typography sx={labelSx}>{title}</Typography>
//             </Box>
//             <Box sx={{ px: 2, py: 1.8 }}>{children}</Box>
//         </Paper>
//     );

//     return (
//         <Dialog
//             open={open} onClose={onClose}
//             maxWidth="sm" fullWidth
//             PaperProps={{
//                 sx: {
//                     borderRadius: 3, overflow: "hidden",
//                     border: `1px solid ${border}`, bgcolor: cardBg,
//                     boxShadow: isDark
//                         ? "0 24px 64px rgba(0,0,0,0.6)"
//                         : "0 24px 64px rgba(0,0,0,0.12)",
//                 },
//             }}
//         >
//             {/* ── Cover + Avatar ─────────────────────────────────────────── */}
//             <Box sx={{ position: "relative" }}>
//                 <Box sx={{
//                     height: 110, background: coverGradient, position: "relative", overflow: "hidden",
//                 }}>
//                     {/* دوائر زخرفية */}
//                     {[
//                         { size: 160, top: -55, right: -30, opacity: isDark ? 0.12 : 0.18 },
//                         { size: 90, top: 15, right: 110, opacity: isDark ? 0.07 : 0.12 },
//                     ].map((c, i) => (
//                         <Box key={i} sx={{
//                             position: "absolute", borderRadius: "50%",
//                             border: `2px solid ${ACCENT}`,
//                             width: c.size, height: c.size,
//                             top: c.top, right: c.right, opacity: c.opacity,
//                         }} />
//                     ))}
//                     <Box sx={{
//                         position: "absolute", inset: 0,
//                         backgroundImage: `radial-gradient(${ACCENT}30 1px, transparent 1px)`,
//                         backgroundSize: "20px 20px", opacity: isDark ? 0.4 : 0.5,
//                     }} />
//                 </Box>

//                 {/* زر الإغلاق */}
//                 <IconButton onClick={onClose} size="small" sx={{
//                     position: "absolute", top: 10, right: 12,
//                     bgcolor: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.75)",
//                     backdropFilter: "blur(6px)",
//                     border: `1px solid ${border}`, color: textSec,
//                     "&:hover": { color: ACCENT },
//                 }}>
//                     <CloseIcon sx={{ fontSize: 15 }} />
//                 </IconButton>

//                 {/* Avatar */}
//                 <Box sx={{ px: 3, pb: 0 }}>
//                     <Stack direction="row" alignItems="flex-end" justifyContent="space-between"
//                         sx={{ mt: "-32px", mb: 1.5 }}>
//                         <Avatar sx={{
//                             width: 66, height: 66,
//                             bgcolor: DEPT_CLR[dept] ?? ACCENT,
//                             fontSize: "1.4rem", fontWeight: 800,
//                             border: `3px solid ${cardBg}`,
//                             boxShadow: `0 4px 14px ${A22}`,
//                         }}>
//                             {avatarLetters}
//                         </Avatar>

//                         {/* Social buttons */}
//                         <Stack direction="row" gap={0.8} pb={0.5}>
//                             {fullProfile?.linkedin && (
//                                 <Button size="small" startIcon={<LinkedInIcon sx={{ fontSize: "13px !important" }} />}
//                                     href={fullProfile.linkedin} target="_blank" sx={{
//                                         color: "#0077B5",
//                                         bgcolor: isDark ? "rgba(0,119,181,0.10)" : "rgba(0,119,181,0.07)",
//                                         border: "1px solid rgba(0,119,181,0.20)",
//                                         borderRadius: 1.5, fontSize: "0.72rem",
//                                         textTransform: "none", fontWeight: 600, px: 1.4,
//                                         minWidth: 0,
//                                     }}>LinkedIn</Button>
//                             )}
//                             {fullProfile?.github && (
//                                 <Button size="small" startIcon={<GitHubIcon sx={{ fontSize: "13px !important" }} />}
//                                     href={fullProfile.github} target="_blank" sx={{
//                                         color: textPri,
//                                         bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
//                                         border: `1px solid ${border}`,
//                                         borderRadius: 1.5, fontSize: "0.72rem",
//                                         textTransform: "none", fontWeight: 600, px: 1.4,
//                                         minWidth: 0,
//                                     }}>GitHub</Button>
//                             )}
//                         </Stack>
//                     </Stack>

//                     {/* Name + dept + contact */}
//                     <Typography fontWeight={800} fontSize="1.1rem" sx={{ color: textPri, lineHeight: 1.2 }}>
//                         {displayName}
//                     </Typography>

//                     <Stack direction="row" flexWrap="wrap" gap={1.5} mt={0.7}>
//                         {(fullProfile?.email) && (
//                             <Stack direction="row" alignItems="center" gap={0.5}>
//                                 <EmailOutlinedIcon sx={{ fontSize: 12, color: textSec }} />
//                                 <Typography fontSize="0.74rem" sx={{ color: textSec }}>{fullProfile.email}</Typography>
//                             </Stack>
//                         )}
//                         {fullProfile?.phoneNumber && (
//                             <Stack direction="row" alignItems="center" gap={0.5}>
//                                 <PhoneOutlinedIcon sx={{ fontSize: 12, color: textSec }} />
//                                 <Typography fontSize="0.74rem" sx={{ color: textSec }}>{fullProfile.phoneNumber}</Typography>
//                             </Stack>
//                         )}
//                     </Stack>

//                     {displayDept && (
//                         <Box sx={{ mt: 1, mb: 0.5 }}>
//                             <Chip
//                                 icon={<SchoolOutlinedIcon sx={{ fontSize: "12px !important", color: `${ACCENT} !important` }} />}
//                                 label={displayDept} size="small"
//                                 sx={{
//                                     height: 24, borderRadius: 1.5,
//                                     bgcolor: a10, color: ACCENT,
//                                     fontWeight: 700, fontSize: "0.72rem",
//                                     border: `1px solid ${A22}`,
//                                 }}
//                             />
//                         </Box>
//                     )}
//                 </Box>

//                 <Divider sx={{ borderColor: border, mt: 1.5 }} />
//             </Box>

//             {/* ── Body ────────────────────────────────────────────────────── */}
//             <DialogContent sx={{ px: 3, py: 2.5, overflowY: "auto" }}>
//                 {profLoading ? (
//                     <Box display="flex" justifyContent="center" py={4}>
//                         <CircularProgress size={24} sx={{ color: ACCENT }} />
//                     </Box>
//                 ) : (
//                     <Stack spacing={2}>

//                         {/* Match % */}
//                         {match !== null && (
//                             <Box sx={{
//                                 p: 2, borderRadius: 2.5,
//                                 bgcolor: a10, border: `1px solid ${A22}`,
//                                 display: "flex", alignItems: "center", gap: 2,
//                             }}>
//                                 <Box sx={{ flex: 1 }}>
//                                     <Stack direction="row" justifyContent="space-between" mb={0.6}>
//                                         <Typography fontSize="0.72rem" sx={{ color: textSec }}>Team Compatibility</Typography>
//                                         <Typography fontSize="0.72rem" fontWeight={700} sx={{ color: ACCENT }}>{match}%</Typography>
//                                     </Stack>
//                                     <LinearProgress variant="determinate" value={match} sx={{
//                                         height: 6, borderRadius: 3,
//                                         bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
//                                         "& .MuiLinearProgress-bar": {
//                                             bgcolor: match >= 80 ? "#5ba87d" : ACCENT,
//                                             borderRadius: 3,
//                                         },
//                                     }} />
//                                 </Box>
//                                 <Typography fontWeight={800} fontSize="1.5rem" sx={{ color: match >= 80 ? "#5ba87d" : ACCENT }}>
//                                     {match}%
//                                 </Typography>
//                             </Box>
//                         )}

//                         {/* Bio */}
//                         {fullProfile?.bio && (
//                             <SectionBlock icon={PersonOutlineIcon} title="About">
//                                 <Typography fontSize="0.84rem" sx={{ color: textSec, lineHeight: 1.85, whiteSpace: "pre-line" }}>
//                                     {fullProfile.bio}
//                                 </Typography>
//                             </SectionBlock>
//                         )}

//                         {/* Skills */}
//                         {skills.length > 0 && (
//                             <SectionBlock icon={CodeOutlinedIcon} title={`Skills (${skills.length})`}>
//                                 <Stack direction="row" flexWrap="wrap" gap={0.8}>
//                                     {skills.map((sk, j) => (
//                                         <Chip key={sk} label={sk} size="small" sx={{
//                                             height: 26, borderRadius: 1.5,
//                                             fontSize: "0.73rem", fontWeight: 600,
//                                             bgcolor: `${SKILL_COLORS[j % SKILL_COLORS.length]}15`,
//                                             color: SKILL_COLORS[j % SKILL_COLORS.length],
//                                             border: `1px solid ${SKILL_COLORS[j % SKILL_COLORS.length]}30`,
//                                         }} />
//                                     ))}
//                                 </Stack>
//                             </SectionBlock>
//                         )}

//                         {/* لو ما في بروفايل كامل */}
//                         {!profLoading && !fullProfile?.bio && skills.length === 0 && (
//                             <Box sx={{
//                                 textAlign: "center", py: 3,
//                                 border: `1px dashed ${A22}`, borderRadius: 2.5, bgcolor: a10,
//                             }}>
//                                 <PersonOutlineIcon sx={{ fontSize: 28, color: ACCENT, opacity: 0.5, mb: 0.5 }} />
//                                 <Typography fontSize="0.82rem" sx={{ color: textSec }}>
//                                     This student hasn't completed their profile yet.
//                                 </Typography>
//                             </Box>
//                         )}

//                     </Stack>
//                 )}
//             </DialogContent>

//             {/* ── Footer ──────────────────────────────────────────────────── */}
//             <Box sx={{
//                 px: 3, py: 2,
//                 borderTop: `1px solid ${border}`,
//                 display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1,
//             }}>
//                 <Button onClick={onClose} sx={{
//                     color: textSec, textTransform: "none",
//                     fontWeight: 500, fontSize: "0.85rem", borderRadius: 2, px: 2.5,
//                 }}>
//                     Close
//                 </Button>
//                 <Button
//                     variant="contained"
//                     disabled={isInvited || isInviting}
//                     startIcon={isInviting
//                         ? null
//                         : isInvited
//                             ? <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
//                             : <PersonAddOutlinedIcon sx={{ fontSize: 16 }} />
//                     }
//                     onClick={() => { onInvite(sid); onClose(); }}
//                     sx={{
//                         bgcolor: isInvited ? "#5ba87d" : ACCENT,
//                         "&:hover": { bgcolor: isInvited ? "#4e9470" : "#be7a4f", boxShadow: "none" },
//                         borderRadius: 2, px: 3,
//                         textTransform: "none", fontWeight: 700, fontSize: "0.85rem",
//                         boxShadow: "none",
//                         "&.Mui-disabled": { opacity: 0.55 },
//                     }}
//                 >
//                     {isInviting
//                         ? <CircularProgress size={14} sx={{ color: "#fff" }} />
//                         : isInvited ? "Invited ✓" : "Send Invite"
//                     }
//                 </Button>
//             </Box>
//         </Dialog>
//     );
// }

// // ══════════════════════════════════════════════════════════════════════
// // TeamFinder — الصفحة الرئيسية
// // ══════════════════════════════════════════════════════════════════════
// export default function TeamFinder() {
//     const theme = useTheme();
//     const isDark = theme.palette.mode === "dark";
//     const t = theme.palette.custom;

//     const [students, setStudents] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [search, setSearch] = useState("");
//     const [invited, setInvited] = useState([]);
//     const [inviting, setInviting] = useState(null);
//     const [selected, setSelected] = useState(null);
//     const [profileOpen, setProfileOpen] = useState(false);
//     const [error, setError] = useState("");

//     const a10 = isDark ? A10_DARK : A10_LIGHT;

//     // ── جلب الطلاب ──────────────────────────────────────────────────
//     useEffect(() => {
//         setLoading(true);
//         studentApi.getAvailableStudents()
//             .then((data) => setStudents(Array.isArray(data) ? data : []))
//             .catch(() => setError("Failed to load available students"))
//             .finally(() => setLoading(false));
//     }, []);

//     // ── فلترة ────────────────────────────────────────────────────────
//     const filtered = students.filter((s) => {
//         const q = search.toLowerCase();
//         const name = (s.fullName ?? s.name ?? s.username ?? "").toLowerCase();
//         const dept = (s.department ?? s.dept ?? "").toLowerCase();
//         const skls = (s.skills ?? []).map((sk) => sk.toLowerCase());
//         return name.includes(q) || dept.includes(q) || skls.some((sk) => sk.includes(q));
//     });

//     // ── إرسال دعوة ──────────────────────────────────────────────────
//     const handleInvite = async (studentId) => {
//         if (!studentId || invited.includes(studentId)) return;
//         setInviting(studentId);
//         setError("");
//         try {
//             await studentApi.sendInvitation(studentId);
//             setInvited((p) => [...p, studentId]);
//         } catch (e) {
//             setError(e?.response?.data?.message ?? "Failed to send invitation");
//         } finally {
//             setInviting(null);
//         }
//     };

//     const openProfile = (s) => { setSelected(s); setProfileOpen(true); };

//     return (
//         <Box sx={{ maxWidth: 1000 }}>

//             {/* Header */}
//             <Box sx={{ mb: 3 }}>
//                 <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>Team Discovery Hub</Typography>
//                 <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
//                     Find teammates by skill ·{" "}
//                     {loading ? "Loading…" : `${filtered.length} students available`}
//                 </Typography>
//             </Box>

//             {/* Error */}
//             {error && (
//                 <Typography fontSize="0.82rem" sx={{ color: "error.main", mb: 2 }}>{error}</Typography>
//             )}

//             {/* Pending Invites banner */}
//             {invited.length > 0 && (
//                 <Paper elevation={1} sx={{
//                     p: 2, borderRadius: 3,
//                     bgcolor: `${t.accentPrimary}08`,
//                     border: `1px solid ${t.accentPrimary}30`, mb: 2.5,
//                 }}>
//                     <Stack direction="row" alignItems="center" justifyContent="space-between">
//                         <Stack direction="row" alignItems="center" gap={1.5}>
//                             <GroupsOutlinedIcon sx={{ color: t.accentPrimary, fontSize: 20 }} />
//                             <Typography sx={{ fontWeight: 600, color: t.textPrimary }}>
//                                 Pending Invites ({invited.length})
//                             </Typography>
//                         </Stack>
//                         <Stack direction="row" gap={0.8}>
//                             {invited.map((id) => {
//                                 const s = students.find((st) => getId(st) === id);
//                                 const name = s?.fullName ?? s?.name ?? s?.username ?? "Student";
//                                 return (
//                                     <Chip key={id} label={name.split(" ")[0]} size="small" sx={{
//                                         bgcolor: `${t.accentPrimary}18`,
//                                         color: t.accentPrimary,
//                                         fontWeight: 600, fontSize: "0.72rem",
//                                     }} />
//                                 );
//                             })}
//                         </Stack>
//                     </Stack>
//                 </Paper>
//             )}

//             {/* Search */}
//             <TextField
//                 fullWidth
//                 placeholder="Search by name, skill, or department…"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 size="small"
//                 sx={{ mb: 2.5 }}
//                 InputProps={{
//                     startAdornment: (
//                         <InputAdornment position="start">
//                             <SearchIcon sx={{ fontSize: 17, color: t.textTertiary }} />
//                         </InputAdornment>
//                     ),
//                 }}
//             />

//             {/* Loading */}
//             {loading ? (
//                 <Box display="flex" justifyContent="center" py={6}>
//                     <CircularProgress size={32} sx={{ color: ACCENT }} />
//                 </Box>

//             ) : filtered.length === 0 ? (
//                 <Box textAlign="center" py={6}>
//                     <Box sx={{
//                         width: 52, height: 52, borderRadius: 3, mx: "auto", mb: 1.5,
//                         bgcolor: a10, border: `1px solid ${A22}`,
//                         display: "flex", alignItems: "center", justifyContent: "center",
//                     }}>
//                         <PersonOffOutlinedIcon sx={{ fontSize: 24, color: ACCENT }} />
//                     </Box>
//                     <Typography fontWeight={600} sx={{ color: t.textPrimary }}>No students found</Typography>
//                     <Typography fontSize="0.82rem" sx={{ color: t.textSecondary, mt: 0.5 }}>
//                         {search ? "Try a different search term" : "No available students at the moment"}
//                     </Typography>
//                 </Box>

//             ) : (
//                 <Grid container spacing={2}>
//                     {filtered.map((s) => {
//                         const sid = getId(s);
//                         const isInvited = invited.includes(sid);
//                         const isLoading = inviting === sid;
//                         const name = s.fullName ?? s.name ?? s.username ?? "Student";
//                         const dept = s.department ?? s.dept ?? "";
//                         const skills = s.skills ?? [];
//                         const match = s.matchPercentage ?? s.match ?? null;

//                         return (
//                             <Grid size={{ xs: 12, sm: 6, md: 4 }} key={sid}>
//                                 <Paper
//                                     elevation={1}
//                                     sx={{
//                                         p: 2, borderRadius: 3,
//                                         bgcolor: theme.palette.background.paper,
//                                         border: isInvited
//                                             ? `2px solid ${t.accentPrimary}`
//                                             : `1px solid ${t.borderLight}`,
//                                         transition: "all 0.2s",
//                                         display: "flex", flexDirection: "column",
//                                     }}
//                                 >
//                                     <Stack alignItems="center" spacing={1.5} sx={{ flex: 1 }}>

//                                         {/* Avatar */}
//                                         <Box sx={{ position: "relative" }}>
//                                             <Avatar sx={{
//                                                 width: 52, height: 52,
//                                                 bgcolor: DEPT_CLR[dept] ?? t.accentPrimary,
//                                                 fontSize: "1.1rem", fontWeight: 700,
//                                             }}>
//                                                 {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
//                                             </Avatar>
//                                             {isInvited && (
//                                                 <CheckCircleOutlineIcon sx={{
//                                                     position: "absolute", bottom: -4, right: -4,
//                                                     fontSize: 18, color: t.accentPrimary,
//                                                     bgcolor: theme.palette.background.paper,
//                                                     borderRadius: "50%",
//                                                 }} />
//                                             )}
//                                         </Box>

//                                         {/* Name + dept */}
//                                         <Box sx={{ textAlign: "center" }}>
//                                             <Typography sx={{ fontWeight: 700, color: t.textPrimary }}>{name}</Typography>
//                                             <Stack direction="row" justifyContent="center" gap={0.8} mt={0.3}>
//                                                 {dept && (
//                                                     <Chip label={dept} size="small" sx={{
//                                                         bgcolor: `${DEPT_CLR[dept] ?? t.accentPrimary}15`,
//                                                         color: DEPT_CLR[dept] ?? t.accentPrimary,
//                                                         fontSize: "0.68rem", height: 20,
//                                                     }} />
//                                                 )}
//                                                 {s.year && (
//                                                     <Chip label={s.year} size="small" sx={{
//                                                         bgcolor: t.surfaceHover, color: t.textTertiary,
//                                                         fontSize: "0.68rem", height: 20,
//                                                     }} />
//                                                 )}
//                                             </Stack>
//                                         </Box>

//                                         {/* Match % */}
//                                         {match !== null && (
//                                             <Box sx={{ width: "100%" }}>
//                                                 <Stack direction="row" justifyContent="space-between" mb={0.4}>
//                                                     <Typography sx={{ fontSize: "0.7rem", color: t.textTertiary }}>Match</Typography>
//                                                     <Typography sx={{
//                                                         fontSize: "0.7rem", fontWeight: 700,
//                                                         color: match >= 85 ? t.success : t.accentTertiary,
//                                                     }}>{match}%</Typography>
//                                                 </Stack>
//                                                 <LinearProgress variant="determinate" value={match} sx={{
//                                                     bgcolor: t.borderLight,
//                                                     "& .MuiLinearProgress-bar": {
//                                                         bgcolor: match >= 85 ? t.success : t.accentTertiary,
//                                                     },
//                                                 }} />
//                                             </Box>
//                                         )}

//                                         {/* Skills */}
//                                         {skills.length > 0 && (
//                                             <Stack direction="row" flexWrap="wrap" gap={0.5} justifyContent="center">
//                                                 {skills.slice(0, 3).map((sk, j) => (
//                                                     <Chip key={sk} label={sk} size="small" sx={{
//                                                         bgcolor: `${SKILL_COLORS[j % SKILL_COLORS.length]}15`,
//                                                         color: SKILL_COLORS[j % SKILL_COLORS.length],
//                                                         fontSize: "0.65rem", fontWeight: 500, height: 20,
//                                                     }} />
//                                                 ))}
//                                                 {skills.length > 3 && (
//                                                     <Chip label={`+${skills.length - 3}`} size="small" sx={{
//                                                         bgcolor: t.surfaceHover, color: t.textTertiary,
//                                                         fontSize: "0.65rem", height: 20,
//                                                     }} />
//                                                 )}
//                                             </Stack>
//                                         )}
//                                     </Stack>

//                                     {/* ── Action buttons ── */}
//                                     <Stack direction="row" gap={1} mt={1.5}>

//                                         {/* زر Profile */}
//                                         <Button
//                                             size="small"
//                                             variant="outlined"
//                                             onClick={() => openProfile(s)}
//                                             sx={{
//                                                 flex: 1,
//                                                 fontSize: "0.75rem", fontWeight: 600,
//                                                 borderRadius: 2,
//                                                 textTransform: "none",
//                                                 borderColor: t.borderLight,
//                                                 color: t.textSecondary,
//                                                 "&:hover": {
//                                                     borderColor: ACCENT,
//                                                     color: ACCENT,
//                                                     bgcolor: `${ACCENT}08`,
//                                                 },
//                                             }}
//                                         >
//                                             Profile
//                                         </Button>

//                                         {/* زر Invite */}
//                                         <Button
//                                             size="small"
//                                             variant={isInvited ? "contained" : "outlined"}
//                                             startIcon={
//                                                 isLoading ? null :
//                                                     isInvited
//                                                         ? <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
//                                                         : <PersonAddOutlinedIcon sx={{ fontSize: 14 }} />
//                                             }
//                                             disabled={isLoading || isInvited}
//                                             onClick={(e) => { e.stopPropagation(); handleInvite(sid); }}
//                                             sx={{
//                                                 flex: 1,
//                                                 fontSize: "0.75rem", fontWeight: 600,
//                                                 borderRadius: 2,
//                                                 textTransform: "none",
//                                                 bgcolor: isInvited ? t.accentPrimary : "transparent",
//                                                 borderColor: isInvited ? t.accentPrimary : t.borderLight,
//                                                 color: isInvited ? "#fff" : t.accentPrimary,
//                                                 "&:hover": {
//                                                     bgcolor: isInvited ? "#be7a4f" : `${t.accentPrimary}10`,
//                                                     borderColor: t.accentPrimary,
//                                                 },
//                                                 "&.Mui-disabled": { opacity: 0.6 },
//                                             }}
//                                         >
//                                             {isLoading
//                                                 ? <CircularProgress size={13} sx={{ color: ACCENT }} />
//                                                 : isInvited ? "Invited ✓" : "Invite"
//                                             }
//                                         </Button>
//                                     </Stack>
//                                 </Paper>
//                             </Grid>
//                         );
//                     })}
//                 </Grid>
//             )}

//             {/* Profile Modal */}
//             {selected && (
//                 <StudentProfileModal
//                     open={profileOpen}
//                     onClose={() => setProfileOpen(false)}
//                     student={selected}
//                     onInvite={handleInvite}
//                     isInvited={invited.includes(getId(selected))}
//                     isInviting={inviting === getId(selected)}
//                 />
//             )}
//         </Box>
//     );
// }
import { useState, useEffect } from "react";
import {
    Box, Paper, Typography, Stack, Avatar, Chip, Button,
    TextField, InputAdornment, LinearProgress,
    Dialog, DialogContent,
    Grid, CircularProgress, Divider, IconButton,
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
import studentApi from "../../../../api/handler/endpoints/studentApi";
import UserProfileApi from "../../../../api/handler/endpoints/UserProfileApi";

// ══════════════════════════════════════════════════════════════════════
// Constants
// ══════════════════════════════════════════════════════════════════════
const SKILL_COLORS = ["#C97B4B", "#5B8FC4", "#9B7EC8", "#6D9E8A", "#C47E7E", "#B49340"];
const DEPT_CLR = { CS: "#C97B4B", CE: "#5B8FC4", EE: "#6D9E8A" };
const DEPT_BG = {
    CS: "rgba(201,123,75,0.12)",
    CE: "rgba(91,143,196,0.12)",
    EE: "rgba(109,158,138,0.12)",
};
const ACCENT = "#C97B4B";
const A10 = "rgba(201,123,75,0.10)";
const A22 = "rgba(201,123,75,0.22)";

const getId = (s) => s?.id ?? s?.userId ?? s?._id ?? null;

// ══════════════════════════════════════════════════════════════════════
// MatchArc — SVG ring around avatar showing match %
// ══════════════════════════════════════════════════════════════════════
function MatchArc({ match, color, size = 72 }) {
    const r = (size / 2) - 4;
    const cx = size / 2;
    const cy = size / 2;
    const full = 2 * Math.PI * r;
    const dash = ((match ?? 0) / 100) * full;
    return (
        <svg
            width={size} height={size}
            viewBox={`0 0 ${size} ${size}`}
            style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
        >
            <circle
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke="rgba(128,128,128,0.12)"
                strokeWidth={3}
            />
            <circle
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={color}
                strokeWidth={3}
                strokeDasharray={`${dash} ${full}`}
                strokeDashoffset={full * 0.25}
                strokeLinecap="round"
                opacity={0.8}
            />
        </svg>
    );
}

// ══════════════════════════════════════════════════════════════════════
// StudentProfileModal
// ══════════════════════════════════════════════════════════════════════
function StudentProfileModal({ open, onClose, student, onInvite, isInvited, isInviting }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const [fullProfile, setFullProfile] = useState(null);
    const [profLoading, setProfLoading] = useState(false);

    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const cardBg = theme.palette.background.paper;
    const textPri = theme.palette.text.primary;
    const textSec = theme.palette.text.secondary;
    const a10 = isDark ? "rgba(201,123,75,0.10)" : "rgba(201,123,75,0.07)";

    const sid = getId(student);
    const name = student?.fullName ?? student?.name ?? student?.username ?? "Student";
    const dept = student?.department ?? student?.dept ?? "";
    const skills = fullProfile?.skills ?? student?.skills ?? [];
    const match = student?.matchPercentage ?? student?.match ?? null;
    const deptColor = DEPT_CLR[dept] ?? ACCENT;

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

    const displayDept = fullProfile?.department || dept;
    const displayName = fullProfile?.fullName || name;
    const avatarLetters = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

    const coverGradient = isDark
        ? "linear-gradient(135deg, #2a1f18 0%, #1e1510 100%)"
        : "linear-gradient(135deg, #fdf0e8 0%, #f5e0cc 100%)";

    const labelSx = {
        fontSize: "0.66rem", fontWeight: 700,
        letterSpacing: "0.08em", textTransform: "uppercase", color: textSec,
    };

    const SectionBlock = ({ icon: Icon, title, children }) => (
        <Paper elevation={0} sx={{
            borderRadius: 2.5,
            border: `1px solid ${border}`,
            bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
            overflow: "hidden",
        }}>
            <Box sx={{
                px: 2, py: 1.4,
                borderBottom: `1px solid ${border}`,
                display: "flex", alignItems: "center", gap: 1,
            }}>
                <Icon sx={{ fontSize: 13, color: ACCENT }} />
                <Typography sx={labelSx}>{title}</Typography>
            </Box>
            <Box sx={{ px: 2, py: 1.8 }}>{children}</Box>
        </Paper>
    );

    return (
        <Dialog
            open={open} onClose={onClose}
            maxWidth="sm" fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3, overflow: "hidden",
                    border: `1px solid ${border}`, bgcolor: cardBg,
                    boxShadow: isDark
                        ? "0 24px 64px rgba(0,0,0,0.6)"
                        : "0 24px 64px rgba(0,0,0,0.12)",
                },
            }}
        >
            {/* Cover */}
            <Box sx={{ position: "relative" }}>
                <Box sx={{ height: 110, background: coverGradient, position: "relative", overflow: "hidden" }}>
                    {[
                        { size: 160, top: -55, right: -30, opacity: isDark ? 0.12 : 0.18 },
                        { size: 90, top: 15, right: 110, opacity: isDark ? 0.07 : 0.12 },
                    ].map((c, i) => (
                        <Box key={i} sx={{
                            position: "absolute", borderRadius: "50%",
                            border: `2px solid ${ACCENT}`,
                            width: c.size, height: c.size,
                            top: c.top, right: c.right, opacity: c.opacity,
                        }} />
                    ))}
                    <Box sx={{
                        position: "absolute", inset: 0,
                        backgroundImage: `radial-gradient(${ACCENT}30 1px, transparent 1px)`,
                        backgroundSize: "20px 20px", opacity: isDark ? 0.4 : 0.5,
                    }} />
                </Box>

                <IconButton onClick={onClose} size="small" sx={{
                    position: "absolute", top: 10, right: 12,
                    bgcolor: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.75)",
                    backdropFilter: "blur(6px)",
                    border: `1px solid ${border}`, color: textSec,
                    "&:hover": { color: ACCENT },
                }}>
                    <CloseIcon sx={{ fontSize: 15 }} />
                </IconButton>

                <Box sx={{ px: 3, pb: 0 }}>
                    <Stack direction="row" alignItems="flex-end" justifyContent="space-between"
                        sx={{ mt: "-36px", mb: 1.5 }}>
                        {/* Avatar with arc */}
                        <Box sx={{ position: "relative", width: 72, height: 72 }}>
                            {match !== null && <MatchArc match={match} color={deptColor} size={72} />}
                            <Avatar sx={{
                                position: "absolute",
                                top: 5, left: 5,
                                width: 62, height: 62,
                                bgcolor: deptColor,
                                fontSize: "1.3rem", fontWeight: 800,
                                border: `3px solid ${cardBg}`,
                            }}>
                                {avatarLetters}
                            </Avatar>
                            {match !== null && (
                                <Box sx={{
                                    position: "absolute", bottom: -2, right: -8,
                                    bgcolor: deptColor, color: "#fff",
                                    fontSize: "0.6rem", fontWeight: 700,
                                    px: 0.7, py: 0.2, borderRadius: 1,
                                    fontFamily: "'Space Mono', monospace",
                                    letterSpacing: "0.04em",
                                    boxShadow: `0 2px 6px ${deptColor}55`,
                                }}>
                                    {match}%
                                </Box>
                            )}
                        </Box>

                        {/* Social links */}
                        <Stack direction="row" gap={0.8} pb={0.5}>
                            {fullProfile?.linkedin && (
                                <Button size="small" startIcon={<LinkedInIcon sx={{ fontSize: "13px !important" }} />}
                                    href={fullProfile.linkedin} target="_blank" sx={{
                                        color: "#0077B5",
                                        bgcolor: isDark ? "rgba(0,119,181,0.10)" : "rgba(0,119,181,0.07)",
                                        border: "1px solid rgba(0,119,181,0.20)",
                                        borderRadius: 1.5, fontSize: "0.72rem",
                                        textTransform: "none", fontWeight: 600, px: 1.4, minWidth: 0,
                                    }}>LinkedIn</Button>
                            )}
                            {fullProfile?.github && (
                                <Button size="small" startIcon={<GitHubIcon sx={{ fontSize: "13px !important" }} />}
                                    href={fullProfile.github} target="_blank" sx={{
                                        color: textPri,
                                        bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                                        border: `1px solid ${border}`,
                                        borderRadius: 1.5, fontSize: "0.72rem",
                                        textTransform: "none", fontWeight: 600, px: 1.4, minWidth: 0,
                                    }}>GitHub</Button>
                            )}
                        </Stack>
                    </Stack>

                    <Typography fontWeight={800} fontSize="1.1rem" sx={{ color: textPri, lineHeight: 1.2 }}>
                        {displayName}
                    </Typography>

                    <Stack direction="row" flexWrap="wrap" gap={1.5} mt={0.7}>
                        {fullProfile?.email && (
                            <Stack direction="row" alignItems="center" gap={0.5}>
                                <EmailOutlinedIcon sx={{ fontSize: 12, color: textSec }} />
                                <Typography fontSize="0.74rem" sx={{ color: textSec }}>{fullProfile.email}</Typography>
                            </Stack>
                        )}
                        {fullProfile?.phoneNumber && (
                            <Stack direction="row" alignItems="center" gap={0.5}>
                                <PhoneOutlinedIcon sx={{ fontSize: 12, color: textSec }} />
                                <Typography fontSize="0.74rem" sx={{ color: textSec }}>{fullProfile.phoneNumber}</Typography>
                            </Stack>
                        )}
                    </Stack>

                    {displayDept && (
                        <Box sx={{ mt: 1, mb: 0.5 }}>
                            <Chip
                                icon={<SchoolOutlinedIcon sx={{ fontSize: "12px !important", color: `${deptColor} !important` }} />}
                                label={displayDept} size="small"
                                sx={{
                                    height: 24, borderRadius: 1.5,
                                    bgcolor: DEPT_BG[displayDept] ?? a10,
                                    color: deptColor,
                                    fontWeight: 700, fontSize: "0.72rem",
                                    border: `1px solid ${deptColor}30`,
                                }}
                            />
                        </Box>
                    )}
                </Box>
                <Divider sx={{ borderColor: border, mt: 1.5 }} />
            </Box>

            {/* Body */}
            <DialogContent sx={{ px: 3, py: 2.5, overflowY: "auto" }}>
                {profLoading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress size={24} sx={{ color: ACCENT }} />
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        {match !== null && (
                            <Box sx={{
                                p: 2, borderRadius: 2.5,
                                bgcolor: a10, border: `1px solid ${A22}`,
                                display: "flex", alignItems: "center", gap: 2,
                            }}>
                                <Box sx={{ flex: 1 }}>
                                    <Stack direction="row" justifyContent="space-between" mb={0.6}>
                                        <Typography fontSize="0.72rem" sx={{ color: textSec }}>Team Compatibility</Typography>
                                        <Typography fontSize="0.72rem" fontWeight={700} sx={{ color: match >= 80 ? "#5ba87d" : ACCENT }}>
                                            {match}%
                                        </Typography>
                                    </Stack>
                                    <LinearProgress variant="determinate" value={match} sx={{
                                        height: 6, borderRadius: 3,
                                        bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                                        "& .MuiLinearProgress-bar": {
                                            bgcolor: match >= 80 ? "#5ba87d" : ACCENT,
                                            borderRadius: 3,
                                        },
                                    }} />
                                </Box>
                                <Typography fontWeight={800} fontSize="1.5rem" sx={{ color: match >= 80 ? "#5ba87d" : ACCENT }}>
                                    {match}%
                                </Typography>
                            </Box>
                        )}

                        {fullProfile?.bio && (
                            <SectionBlock icon={PersonOutlineIcon} title="About">
                                <Typography fontSize="0.84rem" sx={{ color: textSec, lineHeight: 1.85, whiteSpace: "pre-line" }}>
                                    {fullProfile.bio}
                                </Typography>
                            </SectionBlock>
                        )}

                        {skills.length > 0 && (
                            <SectionBlock icon={CodeOutlinedIcon} title={`Skills (${skills.length})`}>
                                <Stack direction="row" flexWrap="wrap" gap={0.8}>
                                    {skills.map((sk, j) => (
                                        <Chip key={sk} label={sk} size="small" sx={{
                                            height: 26, borderRadius: 1.5,
                                            fontSize: "0.73rem", fontWeight: 600,
                                            bgcolor: `${SKILL_COLORS[j % SKILL_COLORS.length]}15`,
                                            color: SKILL_COLORS[j % SKILL_COLORS.length],
                                            border: `1px solid ${SKILL_COLORS[j % SKILL_COLORS.length]}30`,
                                        }} />
                                    ))}
                                </Stack>
                            </SectionBlock>
                        )}

                        {!profLoading && !fullProfile?.bio && skills.length === 0 && (
                            <Box sx={{
                                textAlign: "center", py: 3,
                                border: `1px dashed ${A22}`, borderRadius: 2.5, bgcolor: a10,
                            }}>
                                <PersonOutlineIcon sx={{ fontSize: 28, color: ACCENT, opacity: 0.5, mb: 0.5 }} />
                                <Typography fontSize="0.82rem" sx={{ color: textSec }}>
                                    This student hasn't completed their profile yet.
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                )}
            </DialogContent>

            {/* Footer */}
            <Box sx={{
                px: 3, py: 2,
                borderTop: `1px solid ${border}`,
                display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1,
            }}>
                <Button onClick={onClose} sx={{
                    color: textSec, textTransform: "none",
                    fontWeight: 500, fontSize: "0.85rem", borderRadius: 2, px: 2.5,
                }}>
                    Close
                </Button>
                <Button
                    variant="contained"
                    disabled={isInvited || isInviting}
                    startIcon={isInviting ? null : isInvited
                        ? <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
                        : <PersonAddOutlinedIcon sx={{ fontSize: 16 }} />
                    }
                    onClick={() => { onInvite(sid); onClose(); }}
                    sx={{
                        bgcolor: isInvited ? "#5ba87d" : ACCENT,
                        "&:hover": { bgcolor: isInvited ? "#4e9470" : "#be7a4f", boxShadow: "none" },
                        borderRadius: 2, px: 3,
                        textTransform: "none", fontWeight: 700, fontSize: "0.85rem",
                        boxShadow: "none",
                        "&.Mui-disabled": { opacity: 0.55 },
                    }}
                >
                    {isInviting
                        ? <CircularProgress size={14} sx={{ color: "#fff" }} />
                        : isInvited ? "Invited ✓" : "Send Invite"
                    }
                </Button>
            </Box>
        </Dialog>
    );
}

// ══════════════════════════════════════════════════════════════════════
// SidebarFilter
// ══════════════════════════════════════════════════════════════════════
function SidebarFilter({ deptFilter, setDeptFilter, matchFilter, setMatchFilter, skillFilter, setSkillFilter, allSkills }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const textSec = theme.palette.text.secondary;
    const textTert = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";

    const labelSx = {
        fontSize: "0.62rem", fontWeight: 700,
        letterSpacing: "0.1em", textTransform: "uppercase",
        color: textTert, mb: 0.8,
    };

    const FilterChip = ({ active, onClick, dotColor, children }) => (
        <Box
            onClick={onClick}
            sx={{
                display: "flex", alignItems: "center", gap: 1,
                px: 1.2, py: 0.75,
                borderRadius: 1.5, cursor: "pointer",
                fontSize: "0.78rem", fontWeight: 500,
                border: `0.5px solid ${active ? A22 : "transparent"}`,
                bgcolor: active ? A10 : "transparent",
                color: active ? ACCENT : textSec,
                transition: "all 0.15s",
                "&:hover": { bgcolor: active ? A10 : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", color: active ? ACCENT : theme.palette.text.primary },
            }}
        >
            {dotColor && (
                <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: dotColor, flexShrink: 0 }} />
            )}
            {children}
        </Box>
    );

    return (
        <Box sx={{
            width: 210, flexShrink: 0,
            borderRight: `0.5px solid ${border}`,
            p: "24px 14px",
            display: "flex", flexDirection: "column", gap: 2.5,
        }}>
            {/* Title */}
            <Typography sx={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.7rem", fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: textTert,
                pb: 1.5, borderBottom: `0.5px solid ${border}`,
            }}>
                Team Finder
            </Typography>

            {/* Dept */}
            <Box>
                <Typography sx={labelSx}>Department</Typography>
                <Stack spacing={0.3}>
                    <FilterChip active={deptFilter === "all"} onClick={() => setDeptFilter("all")} dotColor="#888">All departments</FilterChip>
                    <FilterChip active={deptFilter === "CS"} onClick={() => setDeptFilter("CS")} dotColor={DEPT_CLR.CS}>Computer Science</FilterChip>
                    <FilterChip active={deptFilter === "CE"} onClick={() => setDeptFilter("CE")} dotColor={DEPT_CLR.CE}>Comp. Engineering</FilterChip>
                    <FilterChip active={deptFilter === "EE"} onClick={() => setDeptFilter("EE")} dotColor={DEPT_CLR.EE}>Elec. Engineering</FilterChip>
                </Stack>
            </Box>

            {/* Match */}
            <Box>
                <Typography sx={labelSx}>Match</Typography>
                <Stack spacing={0.3}>
                    <FilterChip active={matchFilter === "all"} onClick={() => setMatchFilter("all")}>Any match</FilterChip>
                    <FilterChip active={matchFilter === "high"} onClick={() => setMatchFilter("high")}>High ≥ 80%</FilterChip>
                    <FilterChip active={matchFilter === "med"} onClick={() => setMatchFilter("med")}>Medium 50–79%</FilterChip>
                </Stack>
            </Box>

            {/* Skills */}
            <Box>
                <Typography sx={labelSx}>Skills</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                    {allSkills.map((sk) => (
                        <Box
                            key={sk}
                            onClick={() => setSkillFilter(skillFilter === sk ? null : sk)}
                            sx={{
                                fontSize: "0.68rem", fontWeight: 600,
                                px: 1, py: 0.4, borderRadius: 20,
                                cursor: "pointer",
                                border: `0.5px solid ${skillFilter === sk ? A22 : border}`,
                                bgcolor: skillFilter === sk ? A10 : "transparent",
                                color: skillFilter === sk ? ACCENT : textSec,
                                transition: "all 0.15s",
                                "&:hover": { borderColor: A22, color: ACCENT },
                            }}
                        >
                            {sk}
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}

// ══════════════════════════════════════════════════════════════════════
// StudentCard — rich profile preview
// ══════════════════════════════════════════════════════════════════════
function StudentCard({ student, isInvited, isInviting, onInvite, onOpenProfile }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const textPri = theme.palette.text.primary;
    const textSec = theme.palette.text.secondary;
    const surfaceHover = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";

    const sid = getId(student);
    const name = student?.fullName ?? student?.name ?? student?.username ?? "Student";
    const dept = student?.department ?? student?.dept ?? "";
    const skills = student?.skills ?? [];
    const match = student?.matchPercentage ?? student?.match ?? null;
    const bio = student?.bio ?? student?.description ?? null;
    const year = student?.year ?? student?.academicYear ?? null;
    const deptColor = DEPT_CLR[dept] ?? ACCENT;
    const deptBg = DEPT_BG[dept] ?? A10;
    const avatarLetters = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    const matchColor = (match ?? 0) >= 80 ? "#4caf82" : deptColor;

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: "18px",
                bgcolor: theme.palette.background.paper,
                border: isInvited ? `1.5px solid ${deptColor}55` : `0.5px solid ${border}`,
                overflow: "hidden",
                display: "flex", flexDirection: "column",
                transition: "transform 0.18s, border-color 0.18s, box-shadow 0.18s",
                "&:hover": {
                    borderColor: `${deptColor}66`,
                    transform: "translateY(-3px)",
                    boxShadow: isDark ? "0 10px 32px rgba(0,0,0,0.35)" : "0 10px 32px rgba(0,0,0,0.08)",
                },
            }}
        >
            {/* ── Top section: avatar + name + meta ── */}
            <Box sx={{ p: "20px 20px 0", display: "flex", gap: 1.8, alignItems: "flex-start" }}>

                {/* Avatar col */}
                <Box sx={{ position: "relative", flexShrink: 0 }}>
                    <Avatar sx={{
                        width: 56, height: 56,
                        bgcolor: deptColor,
                        borderRadius: "14px",
                        fontSize: "1rem", fontWeight: 800,
                        fontFamily: "'Space Mono', monospace",
                        letterSpacing: "-0.02em",
                    }}>
                        {avatarLetters}
                    </Avatar>
                    {/* match badge под avatar */}
                    {match !== null && (
                        <Box sx={{
                            position: "absolute", bottom: -7, left: "50%",
                            transform: "translateX(-50%)",
                            bgcolor: matchColor, color: "#fff",
                            fontSize: "0.6rem", fontWeight: 700,
                            px: 0.8, py: 0.25,
                            borderRadius: 20,
                            fontFamily: "'Space Mono', monospace",
                            border: `2px solid ${theme.palette.background.paper}`,
                            whiteSpace: "nowrap",
                            lineHeight: 1.4,
                        }}>
                            {match}%
                        </Box>
                    )}
                </Box>

                {/* Info col */}
                <Box sx={{ flex: 1, pt: 0.3 }}>
                    <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: textPri, lineHeight: 1.25, mb: 0.6 }}>
                        {name}
                    </Typography>
                    <Stack direction="row" gap={0.7} flexWrap="wrap" alignItems="center" mb={0.8}>
                        {dept && (
                            <Box sx={{
                                fontSize: "0.68rem", fontWeight: 700,
                                px: 1, py: "3px", borderRadius: 20,
                                bgcolor: deptBg, color: deptColor,
                                letterSpacing: "0.02em",
                            }}>
                                {dept}
                            </Box>
                        )}
                        {year && (
                            <Box sx={{
                                fontSize: "0.68rem", fontWeight: 500,
                                px: 1, py: "3px", borderRadius: 20,
                                bgcolor: surfaceHover, color: textSec,
                            }}>
                                {year}
                            </Box>
                        )}
                        {/* online dot */}
                        <Box sx={{
                            width: 7, height: 7, borderRadius: "50%",
                            bgcolor: "#4caf82", flexShrink: 0,
                            boxShadow: "0 0 0 2px rgba(76,175,130,0.2)",
                        }} />
                    </Stack>

                    {/* Bio preview */}
                    {bio && (
                        <Typography fontSize="0.76rem" sx={{
                            color: textSec, lineHeight: 1.65,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}>
                            {bio}
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* ── Match bar ── */}
            {match !== null && (
                <Box sx={{ px: 2.5, pt: 2, pb: 0, display: "flex", alignItems: "center", gap: 1.2 }}>
                    <Box sx={{
                        flex: 1, height: 4, borderRadius: 2,
                        bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
                        overflow: "hidden",
                    }}>
                        <Box sx={{
                            width: `${match}%`, height: "100%",
                            bgcolor: matchColor, borderRadius: 2,
                            transition: "width 0.5s ease",
                        }} />
                    </Box>
                    <Typography sx={{
                        fontSize: "0.68rem", fontWeight: 700,
                        color: matchColor, fontFamily: "'Space Mono', monospace",
                        minWidth: 32, textAlign: "right",
                    }}>
                        {match}%
                    </Typography>
                </Box>
            )}

            {/* ── Skills ── */}
            {skills.length > 0 && (
                <Stack direction="row" flexWrap="wrap" gap={0.7} sx={{ px: 2.5, pt: 1.5, pb: 0 }}>
                    {skills.slice(0, 3).map((sk, j) => (
                        <Box key={sk} sx={{
                            fontSize: "0.7rem", fontWeight: 500,
                            px: 1, py: "4px", borderRadius: 1,
                            border: `0.5px solid ${border}`,
                            color: SKILL_COLORS[j % SKILL_COLORS.length],
                            bgcolor: `${SKILL_COLORS[j % SKILL_COLORS.length]}10`,
                            transition: "border-color 0.15s",
                            ".card-hover &": { borderColor: `${SKILL_COLORS[j % SKILL_COLORS.length]}40` },
                        }}>
                            {sk}
                        </Box>
                    ))}
                    {skills.length > 3 && (
                        <Box sx={{
                            fontSize: "0.7rem", fontWeight: 600,
                            px: 1, py: "4px", borderRadius: 1,
                            bgcolor: surfaceHover, color: textSec,
                        }}>
                            +{skills.length - 3}
                        </Box>
                    )}
                </Stack>
            )}

            {/* ── Divider ── */}
            <Divider sx={{ borderColor: border, mt: 2 }} />

            {/* ── Actions ── */}
            <Stack direction="row" gap={1} sx={{ p: "12px 14px" }}>
                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onOpenProfile(student)}
                    sx={{
                        flex: 1, fontSize: "0.75rem", fontWeight: 600,
                        borderRadius: "10px", textTransform: "none", py: 0.9,
                        borderColor: border, color: textSec,
                        "&:hover": { borderColor: `${deptColor}55`, color: deptColor, bgcolor: `${deptColor}08` },
                    }}
                >
                    Profile
                </Button>
                <Button
                    size="small"
                    variant="contained"
                    disabled={isInvited || isInviting}
                    startIcon={isInviting ? null : isInvited
                        ? <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
                        : <PersonAddOutlinedIcon sx={{ fontSize: 14 }} />
                    }
                    onClick={(e) => { e.stopPropagation(); onInvite(sid); }}
                    sx={{
                        flex: 1.4, fontSize: "0.75rem", fontWeight: 700,
                        borderRadius: "10px", textTransform: "none", py: 0.9,
                        bgcolor: isInvited ? "#4caf82" : deptColor,
                        color: "#fff", boxShadow: "none",
                        "&:hover": {
                            bgcolor: isInvited ? "#3d9e6f" : `${deptColor}cc`,
                            boxShadow: "none",
                        },
                        "&.Mui-disabled": { opacity: 0.6, color: "#fff" },
                    }}
                >
                    {isInviting
                        ? <CircularProgress size={13} sx={{ color: "#fff" }} />
                        : isInvited ? "Invited ✓" : "Invite"
                    }
                </Button>
            </Stack>
        </Paper>
    );
}

// ══════════════════════════════════════════════════════════════════════
// TeamFinder — Main Page
// ══════════════════════════════════════════════════════════════════════
export default function TeamFinder() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const t = theme.palette.custom;
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const textSec = theme.palette.text.secondary;
    const textTert = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [invited, setInvited] = useState([]);
    const [inviting, setInviting] = useState(null);
    const [selected, setSelected] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [error, setError] = useState("");

    const [deptFilter, setDeptFilter] = useState("all");
    const [matchFilter, setMatchFilter] = useState("all");
    const [skillFilter, setSkillFilter] = useState(null);

    useEffect(() => {
        setLoading(true);
        studentApi.getAvailableStudents()
            .then((data) => setStudents(Array.isArray(data) ? data : []))
            .catch(() => setError("Failed to load available students"))
            .finally(() => setLoading(false));
    }, []);

    const allSkills = [...new Set(students.flatMap((s) => s.skills ?? []))].slice(0, 16);

    const filtered = students.filter((s) => {
        const q = search.toLowerCase();
        const name = (s.fullName ?? s.name ?? s.username ?? "").toLowerCase();
        const dept = (s.department ?? s.dept ?? "").toLowerCase();
        const skls = (s.skills ?? []).map((sk) => sk.toLowerCase());

        if (deptFilter !== "all" && (s.department ?? s.dept) !== deptFilter) return false;
        const m = s.matchPercentage ?? s.match ?? 0;
        if (matchFilter === "high" && m < 80) return false;
        if (matchFilter === "med" && (m < 50 || m >= 80)) return false;
        if (skillFilter && !(s.skills ?? []).includes(skillFilter)) return false;
        if (q && !name.includes(q) && !dept.includes(q) && !skls.some((sk) => sk.includes(q))) return false;
        return true;
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
        <Box sx={{ display: "flex", maxWidth: 1100, minHeight: 600 }}>

            {/* Sidebar */}
            <SidebarFilter
                deptFilter={deptFilter} setDeptFilter={setDeptFilter}
                matchFilter={matchFilter} setMatchFilter={setMatchFilter}
                skillFilter={skillFilter} setSkillFilter={setSkillFilter}
                allSkills={allSkills}
            />

            {/* Main content */}
            <Box sx={{ flex: 1, p: "24px", overflowY: "auto" }}>

                {/* Topbar */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5}>
                    <Box>
                        <Typography sx={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: "1.1rem", fontWeight: 700,
                            color: theme.palette.text.primary,
                            letterSpacing: "-0.02em",
                        }}>
                            Discovery Hub
                        </Typography>
                        <Typography fontSize="0.78rem" sx={{ color: textTert, mt: 0.2 }}>
                            {loading ? "Loading…" : `${filtered.length} students available`}
                        </Typography>
                    </Box>

                    <TextField
                        placeholder="Name, skill, dept…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        size="small"
                        sx={{ width: 220 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 15, color: textTert }} />
                                </InputAdornment>
                            ),
                            sx: { fontSize: "0.8rem", borderRadius: 2 },
                        }}
                    />
                </Stack>

                {/* Error */}
                {error && (
                    <Typography fontSize="0.8rem" sx={{ color: "error.main", mb: 1.5 }}>{error}</Typography>
                )}

                {/* Pending Invites banner */}
                {invited.length > 0 && (
                    <Box sx={{
                        display: "flex", alignItems: "center", gap: 1.5,
                        p: "10px 14px", mb: 2,
                        bgcolor: A10, border: `0.5px solid ${A22}`,
                        borderRadius: 2,
                    }}>
                        <GroupsOutlinedIcon sx={{ fontSize: 16, color: ACCENT }} />
                        <Typography fontSize="0.72rem" fontWeight={700} sx={{
                            color: ACCENT, fontFamily: "'Space Mono', monospace",
                            letterSpacing: "0.06em",
                        }}>
                            Pending ·
                        </Typography>
                        <Stack direction="row" gap={0.6} flexWrap="wrap">
                            {invited.map((id) => {
                                const s = students.find((st) => getId(st) === id);
                                const n = s?.fullName ?? s?.name ?? s?.username ?? "Student";
                                return (
                                    <Box key={id} sx={{
                                        fontSize: "0.68rem", fontWeight: 600,
                                        px: 1, py: 0.3, borderRadius: 20,
                                        bgcolor: "rgba(201,123,75,0.18)", color: ACCENT,
                                    }}>
                                        {n.split(" ")[0]}
                                    </Box>
                                );
                            })}
                        </Stack>
                    </Box>
                )}

                {/* Grid */}
                {loading ? (
                    <Box display="flex" justifyContent="center" py={8}>
                        <CircularProgress size={28} sx={{ color: ACCENT }} />
                    </Box>
                ) : filtered.length === 0 ? (
                    <Box textAlign="center" py={8}>
                        <PersonOffOutlinedIcon sx={{ fontSize: 32, color: ACCENT, opacity: 0.4, mb: 1 }} />
                        <Typography fontWeight={600} fontSize="0.9rem" sx={{ color: theme.palette.text.primary }}>
                            No students found
                        </Typography>
                        <Typography fontSize="0.78rem" sx={{ color: textSec, mt: 0.5 }}>
                            {search ? "Try a different search term" : "Adjust your filters"}
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={1.8}>
                        {filtered.map((s) => {
                            const sid = getId(s);
                            return (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={sid}>
                                    <StudentCard
                                        student={{
                                            ...s,
                                            bio: s.bio ?? s.description ?? s.about ?? null,
                                            year: s.year ?? s.academicYear ?? s.studyYear ?? null,
                                        }}
                                        isInvited={invited.includes(sid)}
                                        isInviting={inviting === sid}
                                        onInvite={handleInvite}
                                        onOpenProfile={openProfile}
                                    />
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Box>

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
    );
}