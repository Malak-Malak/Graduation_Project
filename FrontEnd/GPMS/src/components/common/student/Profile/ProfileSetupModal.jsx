// src/components/common/student/Profile/ProfileSetupModal.jsx
import { useState } from "react";
import {
    Dialog, DialogContent,
    Box, Typography, Button, Stack, TextField,
    Chip, LinearProgress, InputAdornment,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import studentApi, { getSkillsForDepartment } from "../../../../api/handler/endpoints/studentApi";

// ── Departments (supervisors only) ───────────────────────────────────────────
const ALL_DEPARTMENTS = [
    "Computer Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Mechatronics Engineering",
    "Telecommunications Engineering",
    "Power & Energy Engineering",
];

// ── Supervisor research areas ─────────────────────────────────────────────────
const SUPERVISOR_SKILLS = [
    "Artificial Intelligence",
    "Machine Learning",
    "Deep Learning",
    "Big Data & Analytics",
    "Data Science",
    "Cybersecurity & Networks",
    "Software Engineering & Architecture",
    "Cloud Computing & DevOps",
    "Human-Computer Interaction",
    "Embedded Systems & IoT",
    "Database Systems",
    "Computer Vision & NLP",
    "Distributed Systems & Blockchain",
];

// ── Steps ─────────────────────────────────────────────────────────────────────
const STUDENT_STEPS = [
    { id: "skills",  label: "Skills",       icon: CodeOutlinedIcon,  desc: "Pick your skills — teammates will find you based on these" },
    { id: "contact", label: "Contact Info", icon: BadgeOutlinedIcon, desc: "Let teammates know how to reach you" },
    { id: "bio",     label: "About You",    icon: PersonOutlineIcon, desc: "Write a short bio about yourself" },
];

const SUPERVISOR_STEPS = [
    { id: "department", label: "Department",      icon: SchoolOutlinedIcon, desc: "Select your engineering department" },
    { id: "skills",     label: "Research Areas",  icon: CodeOutlinedIcon,   desc: "Select your academic research specializations" },
    { id: "contact",    label: "Contact Info",    icon: BadgeOutlinedIcon,  desc: "Let students know how to reach you" },
    { id: "bio",        label: "About You",       icon: PersonOutlineIcon,  desc: "Write a short bio about yourself" },
];

const INPUT_SX = {
    "& .MuiOutlinedInput-root": {
        borderRadius: 2,
        fontSize: "0.875rem",
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#d0895b" },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#d0895b" },
    "& .MuiInputLabel-root": { fontSize: "0.875rem" },
};

function InnerCard({ icon: Icon, title, count, action, children, border, cardAlt, isDark, accent, a10, a22, labelSx }) {
    return (
        <Box sx={{ borderRadius: 2.5, border: `1px solid ${border}`, bgcolor: cardAlt, overflow: "hidden" }}>
            <Box sx={{
                px: 2.5, py: 1.5, borderBottom: `1px solid ${border}`,
                bgcolor: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.015)",
                display: "flex", alignItems: "center", gap: 1.2,
            }}>
                <Icon sx={{ fontSize: 13, color: accent }} />
                <Typography sx={labelSx}>{title}</Typography>
                {count !== undefined && (
                    <Box sx={{ px: 1, py: 0.1, borderRadius: 10, bgcolor: a10, border: `1px solid ${a22}` }}>
                        <Typography fontSize="0.63rem" fontWeight={700} sx={{ color: accent }}>{count}</Typography>
                    </Box>
                )}
                {action && <Box sx={{ ml: "auto" }}>{action}</Box>}
            </Box>
            <Box sx={{ px: 2.5, py: 2 }}>{children}</Box>
        </Box>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ProfileSetupModal({ open, onDone, role = "student", uniDepartment = "" }) {
    // ── ALL HOOKS MUST COME FIRST — before any conditional return ────────────
    const theme  = useTheme();
    const isDark = theme.palette.mode === "dark";

    const normalizedRole = (role ?? "student").toLowerCase();
    const isSupervisor   = normalizedRole === "supervisor";
    const isAdmin        = normalizedRole === "admin";
    const isStudent      = normalizedRole === "student";

    // Steps depend on role
    const steps = isSupervisor ? SUPERVISOR_STEPS : STUDENT_STEPS;

    // Skills suggestions
    const suggestedSkills = isSupervisor
        ? SUPERVISOR_SKILLS
        : getSkillsForDepartment(uniDepartment);

    const [step,             setStep]             = useState(0);
    const [department,       setDepartment]       = useState("");
    const [skills,           setSkills]           = useState([]);
    const [customSkillInput, setCustomSkillInput] = useState("");
    const [fullName,         setFullName]         = useState("");
    const [email,            setEmail]            = useState("");
    const [phoneNumber,      setPhoneNumber]      = useState("");
    const [linkedin,         setLinkedin]         = useState("");
    const [github,           setGithub]           = useState("");
    const [bio,              setBio]              = useState("");
    const [saving,           setSaving]           = useState(false);
    const [error,            setError]            = useState("");

    // ── NOW it's safe to conditionally render nothing ────────────────────────
    if (isAdmin || !open) return null;

    /* ── Design tokens ── */
    const accent  = "#d0895b";
    const a10     = isDark ? "rgba(208,137,91,0.10)" : "rgba(208,137,91,0.07)";
    const a22     = "rgba(208,137,91,0.22)";
    const border  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const cardAlt = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
    const paperBg = theme.palette.background.paper;
    const textPri = theme.palette.text.primary;
    const textSec = theme.palette.text.secondary;

    const labelSx = {
        fontSize: "0.68rem", fontWeight: 700,
        letterSpacing: "0.08em", textTransform: "uppercase", color: textSec,
    };

    const cardProps = { border, cardAlt, isDark, accent, a10, a22, labelSx };

    const chipSx = (sel) => ({
        height: 30, borderRadius: 1.5, fontSize: "0.78rem", fontWeight: sel ? 700 : 400,
        bgcolor: sel ? accent : "transparent", color: sel ? "#fff" : textSec,
        border: `1px solid ${sel ? accent : border}`, cursor: "pointer",
        "&:hover": { bgcolor: sel ? "#be7a4f" : a10, borderColor: sel ? "#be7a4f" : a22 },
    });

    /* ── Skills helpers ── */
    const toggleSkill = (s) =>
        setSkills((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);

    const addCustomSkill = () => {
        const t = customSkillInput.trim();
        if (t && !skills.includes(t)) setSkills((p) => [...p, t]);
        setCustomSkillInput("");
    };

    const removeSkill = (s) => setSkills((p) => p.filter((x) => x !== s));

    /* ── Next / Finish ── */
    const handleNext = async () => {
        if (step < steps.length - 1) { setStep((s) => s + 1); return; }

        const resolvedDepartment = isStudent ? uniDepartment : department;
        const data = { department: resolvedDepartment, skills, fullName, email, phoneNumber, linkedin, github, bio };
        setSaving(true);
        setError("");

        try {
            await studentApi.createProfile(data);
            sessionStorage.setItem("gpms_profile_done", "true");
            onDone(data);
        } catch (e) {
            const status  = e?.response?.status;
            const rawMsg  = e?.response?.data?.message ?? e?.response?.data ?? "";
            // Safely convert error message to string
            const message = typeof rawMsg === "object" ? JSON.stringify(rawMsg) : String(rawMsg ?? "");

            const isExists =
                status === 409 ||
                (status === 400 && message.toLowerCase().includes("exist"));

            if (isExists) {
                try {
                    await studentApi.updateProfile(data);
                    sessionStorage.setItem("gpms_profile_done", "true");
                    onDone(data);
                } catch (e2) {
                    const msg2 = e2?.response?.data?.message ?? e2?.response?.data ?? "Failed to update profile.";
                    setError(typeof msg2 === "object" ? JSON.stringify(msg2) : String(msg2));
                }
            } else {
                setError(message || "Failed to save profile, please try again.");
            }
        } finally {
            setSaving(false);
        }
    };

    // Validate current step before allowing Next
    const currentStepId = steps[step]?.id;
    const canNext =
        currentStepId === "department" ? Boolean(department) :
        currentStepId === "contact"    ? Boolean(fullName.trim()) && Boolean(email.trim()) :
        true;

    const CurrentIcon = steps[step].icon;

    return (
        <Dialog
            open={open}
            maxWidth="sm"
            fullWidth
            disableEscapeKeyDown
            PaperProps={{
                sx: {
                    borderRadius: 3, overflow: "hidden",
                    border: `1px solid ${border}`, bgcolor: paperBg,
                    boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.55)" : "0 20px 60px rgba(0,0,0,0.10)",
                }
            }}
        >
            {/* Progress bar */}
            <LinearProgress
                variant="determinate"
                value={((step + 1) / steps.length) * 100}
                sx={{
                    height: 3,
                    bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                    "& .MuiLinearProgress-bar": { bgcolor: accent, transition: "transform 0.5s ease" },
                }}
            />

            {/* Header */}
            <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{
                    width: 44, height: 44, borderRadius: 2.5, flexShrink: 0,
                    bgcolor: a10, border: `1px solid ${a22}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <CurrentIcon sx={{ fontSize: 22, color: accent }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: textPri, lineHeight: 1.2 }}>
                        {steps[step].label}
                    </Typography>
                    <Typography fontSize="0.77rem" sx={{ color: textSec, mt: 0.3 }}>
                        {steps[step].desc}
                    </Typography>
                </Box>
                <Box sx={{ px: 1.5, py: 0.4, borderRadius: 10, flexShrink: 0, bgcolor: a10, border: `1px solid ${a22}` }}>
                    <Typography fontSize="0.7rem" fontWeight={700} sx={{ color: accent }}>
                        {step + 1} / {steps.length}
                    </Typography>
                </Box>
            </Box>

            {/* Step dots */}
            <Box sx={{
                px: 3.5, py: 1.6, borderBottom: `1px solid ${border}`,
                bgcolor: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.012)",
            }}>
                <Stack direction="row" alignItems="center">
                    {steps.map((s, i) => {
                        const done    = i < step;
                        const current = i === step;
                        return (
                            <Stack key={i} direction="row" alignItems="center"
                                sx={{ flex: i < steps.length - 1 ? 1 : 0 }}>
                                <Stack alignItems="center" spacing={0.5}>
                                    <Box sx={{
                                        width: 22, height: 22, borderRadius: "50%",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        bgcolor: done || current ? accent : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                                        border: `1.5px solid ${done || current ? accent : border}`,
                                        transition: "all 0.25s ease",
                                    }}>
                                        {done
                                            ? <Box component="span" sx={{ fontSize: 11, color: "#fff", fontWeight: 700, lineHeight: 1 }}>✓</Box>
                                            : <Typography fontSize="0.6rem" fontWeight={700}
                                                sx={{ color: current ? "#fff" : textSec }}>{i + 1}</Typography>
                                        }
                                    </Box>
                                    <Typography fontSize="0.6rem" fontWeight={current ? 700 : 400}
                                        sx={{ color: current ? accent : textSec, whiteSpace: "nowrap" }}>
                                        {s.label}
                                    </Typography>
                                </Stack>
                                {i < steps.length - 1 && (
                                    <Box sx={{
                                        flex: 1, height: "1.5px", mx: 0.8, mb: 2.2, borderRadius: 1,
                                        bgcolor: done ? accent : border,
                                        transition: "background-color 0.3s ease",
                                    }} />
                                )}
                            </Stack>
                        );
                    })}
                </Stack>
            </Box>

            {/* Content */}
            <DialogContent sx={{ px: 3.5, py: 3, overflowY: "auto" }}>

                {/* DEPARTMENT — supervisors only */}
                {currentStepId === "department" && isSupervisor && (
                    <Stack spacing={2}>
                        <InnerCard {...cardProps} icon={SchoolOutlinedIcon} title="Selected">
                            {department ? (
                                <Stack direction="row" alignItems="center" gap={1.5}>
                                    <Box sx={{
                                        width: 32, height: 32, borderRadius: 1.5,
                                        bgcolor: accent, flexShrink: 0,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <Box component="span" sx={{ fontSize: 14, color: "#fff", fontWeight: 700 }}>✓</Box>
                                    </Box>
                                    <Box>
                                        <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: textPri }}>{department}</Typography>
                                        <Typography fontSize="0.72rem" sx={{ color: textSec }}>Your engineering department</Typography>
                                    </Box>
                                </Stack>
                            ) : (
                                <Typography fontSize="0.82rem" sx={{ color: textSec }}>No department selected yet</Typography>
                            )}
                        </InnerCard>

                        <InnerCard {...cardProps} icon={SchoolOutlinedIcon} title="Choose Department *">
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                                {ALL_DEPARTMENTS.map((d) => (
                                    <Chip key={d} label={d} onClick={() => setDepartment(d)} sx={chipSx(department === d)} />
                                ))}
                            </Stack>
                        </InnerCard>
                    </Stack>
                )}

                {/* SKILLS / RESEARCH AREAS */}
                {currentStepId === "skills" && (
                    <Stack spacing={2}>
                        {/* University department badge — students only */}
                        {isStudent && uniDepartment && (
                            <Box sx={{
                                display: "flex", alignItems: "center", gap: 1, px: 2, py: 1.2,
                                borderRadius: 2, bgcolor: a10, border: `1px solid ${a22}`,
                            }}>
                                <SchoolOutlinedIcon sx={{ fontSize: 14, color: accent }} />
                                <Typography fontSize="0.78rem" fontWeight={600} sx={{ color: textPri }}>
                                    {uniDepartment}
                                </Typography>
                                <Typography fontSize="0.72rem" sx={{ color: textSec, opacity: 0.7 }}>
                                    · skills tailored to your department
                                </Typography>
                            </Box>
                        )}

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            {/* Custom input — students only */}
                            {!isSupervisor && (
                                <InnerCard {...cardProps} icon={AddIcon} title="Add Custom Skill">
                                    <TextField
                                        size="small" fullWidth
                                        placeholder="e.g. Flutter, Figma, PyTorch…"
                                        value={customSkillInput}
                                        onChange={(e) => setCustomSkillInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); addCustomSkill(); }
                                        }}
                                        sx={INPUT_SX}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton size="small" onClick={addCustomSkill} sx={{
                                                        color: accent, bgcolor: a10, borderRadius: 1.5,
                                                        mr: -0.5, "&:hover": { bgcolor: a22 },
                                                    }}>
                                                        <AddIcon sx={{ fontSize: 17 }} />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Typography fontSize="0.7rem" sx={{ color: textSec, mt: 0.8 }}>
                                        Press Enter or + to add
                                    </Typography>
                                </InnerCard>
                            )}

                            <InnerCard {...cardProps} icon={CodeOutlinedIcon}
                                title={isSupervisor ? "Selected Areas" : "Selected"}
                                count={skills.length}
                                action={skills.length > 0 && (
                                    <Button size="small" onClick={() => setSkills([])}
                                        sx={{ fontSize: "0.68rem", color: textSec, textTransform: "none", p: 0, minWidth: 0 }}>
                                        Clear
                                    </Button>
                                )}>
                                {skills.length > 0 ? (
                                    <Stack direction="row" flexWrap="wrap" gap={0.8}>
                                        {skills.map((s) => (
                                            <Chip key={s} label={s} onDelete={() => removeSkill(s)} sx={{
                                                height: 26, borderRadius: 1.5, fontSize: "0.74rem", fontWeight: 600,
                                                bgcolor: a10, color: accent, border: `1px solid ${a22}`,
                                                "& .MuiChip-deleteIcon": { color: accent, fontSize: 13, "&:hover": { color: "#be7a4f" } },
                                            }} />
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography fontSize="0.8rem" sx={{ color: textSec }}>
                                        {isSupervisor ? "No areas selected yet" : "None yet"}
                                    </Typography>
                                )}
                            </InnerCard>
                        </Stack>

                        <InnerCard {...cardProps} icon={CodeOutlinedIcon}
                            title={isSupervisor ? "Research Areas" : "Suggestions"}>
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                                {suggestedSkills.map((s) => (
                                    <Chip key={s} label={s} onClick={() => toggleSkill(s)} sx={chipSx(skills.includes(s))} />
                                ))}
                            </Stack>
                        </InnerCard>
                    </Stack>
                )}

                {/* CONTACT */}
                {currentStepId === "contact" && (
                    <Stack spacing={2}>
                        <InnerCard {...cardProps} icon={BadgeOutlinedIcon} title="Identity">
                            <Stack spacing={2}>
                                <TextField size="small" fullWidth label="Full Name *"
                                    placeholder="e.g. Hanan Awad"
                                    value={fullName} onChange={(e) => setFullName(e.target.value)}
                                    InputProps={{ startAdornment: <BadgeOutlinedIcon sx={{ mr: 1, color: accent, fontSize: 18 }} /> }}
                                    sx={INPUT_SX} />
                                <TextField size="small" fullWidth label="Contact Email *"
                                    placeholder="e.g. personal@gmail.com"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                    InputProps={{ startAdornment: <EmailOutlinedIcon sx={{ mr: 1, color: accent, fontSize: 18 }} /> }}
                                    sx={INPUT_SX} />
                                <TextField size="small" fullWidth label="Phone Number"
                                    placeholder="e.g. +970591234567"
                                    value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                                    InputProps={{ startAdornment: <PhoneOutlinedIcon sx={{ mr: 1, color: textSec, fontSize: 18 }} /> }}
                                    sx={INPUT_SX} />
                            </Stack>
                        </InnerCard>

                        <InnerCard {...cardProps} icon={LinkedInIcon} title="Social Links">
                            <Stack spacing={2}>
                                <TextField size="small" fullWidth label="LinkedIn URL"
                                    placeholder="https://linkedin.com/in/username"
                                    value={linkedin} onChange={(e) => setLinkedin(e.target.value)}
                                    InputProps={{ startAdornment: <LinkedInIcon sx={{ mr: 1, color: "#0077B5", fontSize: 18 }} /> }}
                                    sx={INPUT_SX} />
                                <TextField size="small" fullWidth label="GitHub URL"
                                    placeholder="https://github.com/username"
                                    value={github} onChange={(e) => setGithub(e.target.value)}
                                    InputProps={{ startAdornment: <GitHubIcon sx={{ mr: 1, color: textSec, fontSize: 18 }} /> }}
                                    sx={INPUT_SX} />
                            </Stack>
                        </InnerCard>
                    </Stack>
                )}

                {/* BIO */}
                {currentStepId === "bio" && (
                    <Stack spacing={2}>
                        <Box sx={{ display: "flex", gap: 1.5, p: 2, borderRadius: 2.5, bgcolor: a10, border: `1px solid ${a22}` }}>
                            <Box sx={{
                                width: 30, height: 30, borderRadius: 1.5, flexShrink: 0,
                                bgcolor: accent, display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <Typography fontSize="0.8rem">💡</Typography>
                            </Box>
                            <Stack spacing={0.3}>
                                <Typography fontSize="0.78rem" fontWeight={700} sx={{ color: textPri }}>Tips for a great bio</Typography>
                                {(isSupervisor ? [
                                    "Your research interests and specializations",
                                    "Publications or academic contributions",
                                    "Industry experience or projects",
                                    "What kind of projects you prefer to supervise",
                                ] : [
                                    "Programming languages: Python, JavaScript, C++…",
                                    "Frameworks & tools: React, Django, Flutter…",
                                    "Previous projects or experience",
                                    "Competitions or contributions (e.g. hackathons)",
                                ]).map((t) => (
                                    <Typography key={t} fontSize="0.74rem" sx={{ color: textSec }}>· {t}</Typography>
                                ))}
                            </Stack>
                        </Box>

                        <InnerCard {...cardProps} icon={PersonOutlineIcon} title="Your Bio"
                            count={bio.length > 0 ? `${bio.length}/400` : undefined}>
                            <TextField
                                multiline rows={5} fullWidth
                                placeholder={isSupervisor
                                    ? "Tell students about your research interests and supervision style…"
                                    : "Tell teammates about yourself…"}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                inputProps={{ maxLength: 400 }}
                                sx={INPUT_SX}
                            />
                        </InnerCard>
                    </Stack>
                )}

                {error && (
                    <Typography fontSize="0.78rem" sx={{ color: "error.main", mt: 1.5 }}>{error}</Typography>
                )}
            </DialogContent>

            {/* Footer */}
            <Box sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                px: 3.5, py: 2, borderTop: `1px solid ${border}`,
            }}>
                <Typography fontSize="0.74rem" sx={{ color: textSec }}>
                    {step < steps.length - 1 ? `Next: ${steps[step + 1].label}` : "Almost done!"}
                </Typography>
                <Stack direction="row" gap={1}>
                    {step > 0 && (
                        <Button onClick={() => setStep((s) => s - 1)} sx={{
                            color: textSec, textTransform: "none",
                            fontWeight: 500, fontSize: "0.85rem", borderRadius: 2, px: 2.5,
                        }}>
                            Back
                        </Button>
                    )}
                    <Button variant="contained" onClick={handleNext} disabled={!canNext || saving} sx={{
                        bgcolor: accent, "&:hover": { bgcolor: "#be7a4f", boxShadow: "none" },
                        borderRadius: 2, px: 3, textTransform: "none",
                        fontWeight: 700, fontSize: "0.85rem", boxShadow: "none",
                        "&.Mui-disabled": { opacity: 0.45 },
                    }}>
                        {saving ? "Saving…" : step === steps.length - 1 ? "Finish" : "Next"}
                    </Button>
                </Stack>
            </Box>
        </Dialog>
    );
}