
import { useState, useEffect, useRef } from "react";
import {
    Dialog, DialogContent,
    Box, Typography, Button, Stack, TextField,
    Chip, Divider, useMediaQuery, InputAdornment, Avatar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ContactPhoneOutlinedIcon from "@mui/icons-material/ContactPhoneOutlined";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";

const SUGGESTED_SKILLS = [
    "Frontend", "Backend", "AI / ML", "Data Analysis",
    "UI/UX", "DevOps", "Mobile", "Security",
    "Database", "Testing / QA", "Embedded", "Networks",
];

const ALL_FIELDS = [
    "Computer Science", "Computer Engineering",
    "Electrical Engineering", "Information Technology",
    "Software Engineering", "Cybersecurity",
];

const SECTIONS = [
    { id: "department", label: "Department", icon: SchoolOutlinedIcon },
    { id: "skills", label: "Skills", icon: CodeOutlinedIcon },
    { id: "contact", label: "Contact", icon: ContactPhoneOutlinedIcon },
    { id: "bio", label: "Bio", icon: PersonOutlineIcon },
];

export default function EditProfileModal({ open, profile, onSave, onClose }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const [activeSection, setActiveSection] = useState("department");
    const [field, setField] = useState("");
    const [skills, setSkills] = useState([]);
    const skillInputRef = useRef(null);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [github, setGithub] = useState("");
    const [bio, setBio] = useState("");

    useEffect(() => {
        if (open) {
            setActiveSection("department");
            setField(profile?.field || "");
            setSkills(profile?.skills || []);
            if (skillInputRef.current) skillInputRef.current.value = "";
            setFullName(profile?.fullName || "");
            setEmail(profile?.email || "");
            setPhoneNumber(profile?.phoneNumber || "");
            setLinkedin(profile?.linkedin || "");
            setGithub(profile?.github || "");
            setBio(profile?.bio || "");
        }
    }, [open, profile]);

    const toggleSuggestedSkill = (s) =>
        setSkills((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);

    const addCustomSkill = () => {
        const t = skillInputRef.current?.value?.trim();
        if (t && !skills.includes(t)) setSkills((p) => [...p, t]);
        if (skillInputRef.current) skillInputRef.current.value = "";
    };

    const removeSkill = (s) => setSkills((p) => p.filter((x) => x !== s));
    const handleSave = () => onSave({ field, skills, fullName, email, phoneNumber, linkedin, github, bio });
    const canSave = Boolean(fullName.trim()) && Boolean(email.trim()) && Boolean(field);

    /* ── tokens ────────────────────────────────────────────── */
    const accent = "#d0895b";
    const accentSoft = isDark ? "rgba(208,137,91,0.09)" : "rgba(208,137,91,0.06)";
    const accentBorder = "rgba(208,137,91,0.22)";
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const sidebarBg = isDark ? "rgba(255,255,255,0.02)" : "#fafaf9";
    const cardAlt = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
    const paperBg = theme.palette.background.paper;
    const textPri = theme.palette.text.primary;
    const textSec = theme.palette.text.secondary;

    const labelSx = {
        fontSize: "0.68rem", fontWeight: 700,
        letterSpacing: "0.08em", textTransform: "uppercase", color: textSec,
    };

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: 2, fontSize: "0.875rem",
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: accent },
        },
        "& .MuiInputLabel-root.Mui-focused": { color: accent },
        "& .MuiInputLabel-root": { fontSize: "0.875rem" },
    };

    /* small reusable inner card */
    const InnerCard = ({ children, sx = {} }) => (
        <Box sx={{
            borderRadius: 2.5,
            border: `1px solid ${border}`,
            bgcolor: cardAlt,
            overflow: "hidden",
            ...sx,
        }}>
            {children}
        </Box>
    );

    /* inner card header bar */
    const CardHeader = ({ icon: Icon, title, count, action }) => (
        <Box sx={{
            display: "flex", alignItems: "center", gap: 1.2,
            px: 2, py: 1.5,
            borderBottom: `1px solid ${border}`,
            bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
        }}>
            <Icon sx={{ fontSize: 14, color: accent }} />
            <Typography sx={{ ...labelSx, letterSpacing: "0.07em" }}>{title}</Typography>
            {count !== undefined && (
                <Box sx={{ px: 1, py: 0.1, borderRadius: 10, bgcolor: accentSoft, border: `1px solid ${accentBorder}` }}>
                    <Typography fontSize="0.64rem" fontWeight={700} sx={{ color: accent }}>{count}</Typography>
                </Box>
            )}
            {action && <Box sx={{ ml: "auto" }}>{action}</Box>}
        </Box>
    );

    return (
        <Dialog
            open={open} onClose={onClose}
            maxWidth="md" fullWidth fullScreen={fullScreen}
            onKeyDown={(e) => e.stopPropagation()}
            PaperProps={{
                sx: {
                    borderRadius: fullScreen ? 0 : 3,
                    overflow: "hidden",
                    border: `1px solid ${border}`,
                    bgcolor: paperBg,
                    boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.55)" : "0 20px 60px rgba(0,0,0,0.10)",
                },
            }}
        >
            <Box sx={{ display: "flex", minHeight: 520 }}>

                {/* ── Sidebar ───────────────────────────────────────── */}
                <Box sx={{
                    width: 185, flexShrink: 0,
                    bgcolor: sidebarBg,
                    borderRight: `1px solid ${border}`,
                    display: { xs: "none", sm: "flex" },
                    flexDirection: "column",
                }}>
                    <Box sx={{ px: 2.5, py: 2.5, borderBottom: `1px solid ${border}` }}>
                        <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: textPri }}>Edit Profile</Typography>
                        <Typography fontSize="0.7rem" sx={{ color: textSec, mt: 0.3 }}>Update your information</Typography>
                    </Box>
                    <Stack spacing={0.3} sx={{ p: 1.5, flex: 1 }}>
                        {SECTIONS.map(({ id, label, icon: Icon }) => {
                            const active = activeSection === id;
                            return (
                                <Box key={id} onClick={() => setActiveSection(id)} sx={{
                                    display: "flex", alignItems: "center", gap: 1.5,
                                    px: 1.5, py: 1, borderRadius: 1.5, cursor: "pointer",
                                    bgcolor: active ? accentSoft : "transparent",
                                    borderLeft: `2px solid ${active ? accent : "transparent"}`,
                                    transition: "all 0.15s ease",
                                    "&:hover": { bgcolor: active ? accentSoft : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" },
                                }}>
                                    <Icon sx={{ fontSize: 15, color: active ? accent : textSec, flexShrink: 0 }} />
                                    <Typography fontSize="0.82rem" fontWeight={active ? 700 : 400}
                                        sx={{ color: active ? accent : textSec }}>
                                        {label}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Stack>
                </Box>

                {/* ── Main ──────────────────────────────────────────── */}
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

                    {/* header */}
                    <Box sx={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        px: 3, py: 2, borderBottom: `1px solid ${border}`,
                    }}>
                        <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: textPri }}>
                            {SECTIONS.find(s => s.id === activeSection)?.label}
                        </Typography>
                        <IconButton size="small" onClick={onClose} sx={{ color: textSec }}>
                            <CloseIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                    </Box>

                    {/* ── CONTENT ─────────────────────────────────── */}
                    <DialogContent sx={{ flex: 1, px: 3, py: 3, overflowY: "auto" }}>

                        {/* ══ DEPARTMENT ══════════════════════════════ */}
                        {activeSection === "department" && (
                            <Stack spacing={2}>

                                {/* selected preview card */}
                                <InnerCard>
                                    <CardHeader icon={SchoolOutlinedIcon} title="Selected Department" />
                                    <Box sx={{ px: 2.5, py: 2 }}>
                                        {field ? (
                                            <Stack direction="row" alignItems="center" gap={1.5}>
                                                <Box sx={{
                                                    width: 36, height: 36, borderRadius: 2,
                                                    bgcolor: accent, display: "flex",
                                                    alignItems: "center", justifyContent: "center", flexShrink: 0,
                                                }}>
                                                    <CheckIcon sx={{ fontSize: 18, color: "#fff" }} />
                                                </Box>
                                                <Box>
                                                    <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: textPri }}>
                                                        {field}
                                                    </Typography>
                                                    <Typography fontSize="0.72rem" sx={{ color: textSec }}>
                                                        Your academic department
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        ) : (
                                            <Typography fontSize="0.82rem" sx={{ color: textSec }}>
                                                No department selected yet
                                            </Typography>
                                        )}
                                    </Box>
                                </InnerCard>

                                {/* picker card */}
                                <InnerCard>
                                    <CardHeader icon={SchoolOutlinedIcon} title="Choose Department *" />
                                    <Box sx={{ px: 2.5, py: 2 }}>
                                        <Stack direction="row" flexWrap="wrap" gap={1}>
                                            {ALL_FIELDS.map((f) => {
                                                const sel = field === f;
                                                return (
                                                    <Chip key={f} label={f} onClick={() => setField(f)} sx={{
                                                        height: 30, borderRadius: 1.5,
                                                        fontSize: "0.78rem", fontWeight: sel ? 700 : 400,
                                                        bgcolor: sel ? accent : "transparent",
                                                        color: sel ? "#fff" : textSec,
                                                        border: `1px solid ${sel ? accent : border}`,
                                                        cursor: "pointer",
                                                        "&:hover": { bgcolor: sel ? "#be7a4f" : accentSoft, borderColor: sel ? "#be7a4f" : accentBorder },
                                                    }} />
                                                );
                                            })}
                                        </Stack>
                                    </Box>
                                </InnerCard>

                            </Stack>
                        )}

                        {/* ══ SKILLS ══════════════════════════════════ */}
                        {activeSection === "skills" && (
                            <Stack spacing={2}>

                                {/* add custom + selected — side by side on md+ */}
                                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>

                                    {/* custom input card */}
                                    <InnerCard sx={{ flex: 1 }}>
                                        <CardHeader icon={AddIcon} title="Add Custom Skill" />
                                        <Box sx={{ px: 2.5, py: 2 }}>
                                            <TextField
                                                size="small" fullWidth
                                                placeholder="e.g. Flutter, Figma, PyTorch…"
                                                inputRef={skillInputRef}
                                                onKeyDown={(e) => {
                                                    e.stopPropagation();
                                                    if (e.key === "Enter") { e.preventDefault(); addCustomSkill(); }
                                                }}
                                                sx={inputSx}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                size="small" onClick={addCustomSkill}
                                                                sx={{
                                                                    color: accent,
                                                                    bgcolor: accentSoft,
                                                                    borderRadius: 1.5, mr: -0.5,
                                                                    "&:hover": { bgcolor: accentBorder },
                                                                }}
                                                            >
                                                                <AddIcon sx={{ fontSize: 17 }} />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                            <Typography fontSize="0.7rem" sx={{ color: textSec, mt: 0.8 }}>
                                                Press Enter or click + to add
                                            </Typography>
                                        </Box>
                                    </InnerCard>

                                    {/* selected skills card */}
                                    <InnerCard sx={{ flex: 1 }}>
                                        <CardHeader
                                            icon={CodeOutlinedIcon}
                                            title="Selected"
                                            count={skills.length}
                                            action={skills.length > 0 && (
                                                <Button size="small" onClick={() => setSkills([])}
                                                    sx={{ fontSize: "0.68rem", color: textSec, textTransform: "none", p: 0, minWidth: 0 }}>
                                                    Clear all
                                                </Button>
                                            )}
                                        />
                                        <Box sx={{ px: 2.5, py: 2, minHeight: 72 }}>
                                            {skills.length > 0 ? (
                                                <Stack direction="row" flexWrap="wrap" gap={0.8}>
                                                    {skills.map((skill) => (
                                                        <Chip key={skill} label={skill}
                                                            onDelete={() => removeSkill(skill)}
                                                            sx={{
                                                                height: 26, borderRadius: 1.5,
                                                                fontSize: "0.74rem", fontWeight: 600,
                                                                bgcolor: accentSoft, color: accent,
                                                                border: `1px solid ${accentBorder}`,
                                                                "& .MuiChip-deleteIcon": {
                                                                    color: accent, fontSize: 13,
                                                                    "&:hover": { color: "#be7a4f" },
                                                                },
                                                            }}
                                                        />
                                                    ))}
                                                </Stack>
                                            ) : (
                                                <Typography fontSize="0.8rem" sx={{ color: textSec }}>
                                                    No skills selected yet
                                                </Typography>
                                            )}
                                        </Box>
                                    </InnerCard>

                                </Stack>

                                {/* suggestions card */}
                                <InnerCard>
                                    <CardHeader icon={CodeOutlinedIcon} title="Suggestions" />
                                    <Box sx={{ px: 2.5, py: 2 }}>
                                        <Stack direction="row" flexWrap="wrap" gap={1}>
                                            {SUGGESTED_SKILLS.map((skill) => {
                                                const sel = skills.includes(skill);
                                                return (
                                                    <Chip key={skill} label={skill}
                                                        onClick={() => toggleSuggestedSkill(skill)}
                                                        sx={{
                                                            height: 30, borderRadius: 1.5,
                                                            fontSize: "0.78rem", fontWeight: sel ? 700 : 400,
                                                            bgcolor: sel ? accent : "transparent",
                                                            color: sel ? "#fff" : textSec,
                                                            border: `1px solid ${sel ? accent : border}`,
                                                            cursor: "pointer",
                                                            "&:hover": { bgcolor: sel ? "#be7a4f" : accentSoft, borderColor: sel ? "#be7a4f" : accentBorder },
                                                        }}
                                                    />
                                                );
                                            })}
                                        </Stack>
                                    </Box>
                                </InnerCard>

                            </Stack>
                        )}

                        {/* ══ CONTACT ═════════════════════════════════ */}
                        {activeSection === "contact" && (
                            <Stack spacing={2}>

                                {/* identity card */}
                                <InnerCard>
                                    <CardHeader icon={BadgeOutlinedIcon} title="Identity" />
                                    <Box sx={{ px: 2.5, py: 2 }}>
                                        <Stack spacing={2}>
                                            <TextField size="small" fullWidth label="Full Name *"
                                                placeholder="e.g. Hanan Awad"
                                                value={fullName} onChange={(e) => setFullName(e.target.value)}
                                                InputProps={{ startAdornment: <BadgeOutlinedIcon sx={{ mr: 1, color: accent, fontSize: 18 }} /> }}
                                                sx={inputSx} />
                                            <TextField size="small" fullWidth label="Contact Email *"
                                                placeholder="e.g. personal@gmail.com"
                                                value={email} onChange={(e) => setEmail(e.target.value)}
                                                InputProps={{ startAdornment: <EmailOutlinedIcon sx={{ mr: 1, color: accent, fontSize: 18 }} /> }}
                                                sx={inputSx} />
                                            <TextField size="small" fullWidth label="Phone Number"
                                                placeholder="e.g. +970591234567"
                                                value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                                                InputProps={{ startAdornment: <PhoneOutlinedIcon sx={{ mr: 1, color: textSec, fontSize: 18 }} /> }}
                                                sx={inputSx} />
                                        </Stack>
                                    </Box>
                                </InnerCard>

                                {/* social links card */}
                                <InnerCard>
                                    <CardHeader icon={LinkedInIcon} title="Social Links" />
                                    <Box sx={{ px: 2.5, py: 2 }}>
                                        <Stack spacing={2}>
                                            <TextField size="small" fullWidth label="LinkedIn URL"
                                                placeholder="https://linkedin.com/in/username"
                                                value={linkedin} onChange={(e) => setLinkedin(e.target.value)}
                                                InputProps={{ startAdornment: <LinkedInIcon sx={{ mr: 1, color: "#0077B5", fontSize: 18 }} /> }}
                                                sx={inputSx} />
                                            <TextField size="small" fullWidth label="GitHub URL"
                                                placeholder="https://github.com/username"
                                                value={github} onChange={(e) => setGithub(e.target.value)}
                                                InputProps={{ startAdornment: <GitHubIcon sx={{ mr: 1, color: textSec, fontSize: 18 }} /> }}
                                                sx={inputSx} />
                                        </Stack>
                                    </Box>
                                </InnerCard>

                            </Stack>
                        )}

                        {/* ══ BIO ═════════════════════════════════════ */}
                        {activeSection === "bio" && (
                            <Stack spacing={2}>

                                {/* tips card */}
                                <Box sx={{
                                    display: "flex", gap: 1.5,
                                    p: 2, borderRadius: 2.5,
                                    bgcolor: accentSoft, border: `1px solid ${accentBorder}`,
                                }}>
                                    <Box sx={{
                                        width: 32, height: 32, borderRadius: 1.5, flexShrink: 0,
                                        bgcolor: accent, display: "flex",
                                        alignItems: "center", justifyContent: "center",
                                    }}>
                                        <Typography fontSize="0.85rem">💡</Typography>
                                    </Box>
                                    <Box>
                                        <Typography fontSize="0.8rem" fontWeight={700} sx={{ color: textPri, mb: 0.5 }}>
                                            Tips for a great bio
                                        </Typography>
                                        <Stack spacing={0.3}>
                                            {[
                                                "Programming languages: Python, JavaScript, C++…",
                                                "Frameworks & tools: React, Django, Flutter…",
                                                "Previous projects or experience",
                                                "Competitions or contributions (e.g. hackathons)",
                                            ].map((tip) => (
                                                <Typography key={tip} fontSize="0.76rem" sx={{ color: textSec }}>
                                                    · {tip}
                                                </Typography>
                                            ))}
                                        </Stack>
                                    </Box>
                                </Box>

                                {/* textarea card */}
                                <InnerCard>
                                    <CardHeader icon={PersonOutlineIcon} title="Your Bio"
                                        count={bio.length > 0 ? `${bio.length}/400` : undefined} />
                                    <Box sx={{ px: 2.5, py: 2 }}>
                                        <TextField
                                            multiline rows={6} fullWidth
                                            placeholder="Tell teammates about yourself…"
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            inputProps={{ maxLength: 400 }}
                                            sx={{ ...inputSx, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.875rem", "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: accent } } }}
                                        />
                                    </Box>
                                </InnerCard>

                            </Stack>
                        )}

                    </DialogContent>

                    {/* footer */}
                    <Box sx={{
                        display: "flex", alignItems: "center", justifyContent: "flex-end",
                        gap: 1, px: 3, py: 2, borderTop: `1px solid ${border}`,
                    }}>
                        <Button onClick={onClose} sx={{
                            color: textSec, textTransform: "none",
                            fontWeight: 500, fontSize: "0.85rem",
                            borderRadius: 2, px: 2.5,
                        }}>
                            Cancel
                        </Button>
                        <Button variant="contained" onClick={handleSave} disabled={!canSave} sx={{
                            bgcolor: accent,
                            "&:hover": { bgcolor: "#be7a4f", boxShadow: "none" },
                            borderRadius: 2, px: 3,
                            textTransform: "none", fontWeight: 700, fontSize: "0.85rem",
                            boxShadow: "none",
                            "&.Mui-disabled": { opacity: 0.45 },
                        }}>
                            Save Changes
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Dialog>
    );
}