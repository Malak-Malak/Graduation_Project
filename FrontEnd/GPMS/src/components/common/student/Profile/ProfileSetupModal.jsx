// ─────────────────────────────────────────────────────────────────────────────
// ProfileSetupModal.jsx
// يظهر مرة واحدة فقط عند أول دخول الطالب لإنشاء بروفايله.
// يستخدم POST /api/UserProfile (createProfile) مش PUT
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from "react";
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
import CheckIcon from "@mui/icons-material/Check";
import studentApi from "../../../../api/handler/endpoints/studentApi";

// ── ثوابت ─────────────────────────────────────────────────────────────────
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

const STEPS = [
    { id: "department", label: "Department", icon: SchoolOutlinedIcon, desc: "Select your academic department" },
    { id: "skills", label: "Skills", icon: CodeOutlinedIcon, desc: "Pick your skills — teammates will find you based on these" },
    { id: "contact", label: "Contact Info", icon: BadgeOutlinedIcon, desc: "Let teammates know how to reach you" },
    { id: "bio", label: "About You", icon: PersonOutlineIcon, desc: "Write a short bio about yourself" },
];

export default function ProfileSetupModal({ open, onDone }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    // ── State ─────────────────────────────────────────────────────────────────
    const [step, setStep] = useState(0);
    const [field, setField] = useState("");
    const [skills, setSkills] = useState([]);
    const skillInputRef = useRef(null);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [github, setGithub] = useState("");
    const [bio, setBio] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // ── Skills helpers ────────────────────────────────────────────────────────
    const toggleSkill = (s) =>
        setSkills((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);

    const addCustomSkill = () => {
        const t = skillInputRef.current?.value?.trim();
        if (t && !skills.includes(t)) setSkills((p) => [...p, t]);
        if (skillInputRef.current) skillInputRef.current.value = "";
    };

    const removeSkill = (s) => setSkills((p) => p.filter((x) => x !== s));

    // ── Next / Finish ─────────────────────────────────────────────────────────
    const handleNext = async () => {
        // لو مش آخر خطوة انتقل للتالية
        if (step < STEPS.length - 1) { setStep((s) => s + 1); return; }

        // آخر خطوة: أرسل البيانات للـ backend
        const data = { field, skills, fullName, email, phoneNumber, linkedin, github, bio };
        setSaving(true);
        setError("");
        try {
            // ✅ نستخدم createProfile (POST) مش updateProfile (PUT)
            // لأن هذا أول مرة الطالب يعمل بروفايل
            await studentApi.createProfile(data);
            onDone(data); // أعلم الـ parent إن البروفايل اتحفظ
        } catch (e) {
            setError(e?.response?.data?.message ?? "Failed to save profile, please try again.");
        } finally {
            setSaving(false);
        }
    };

    // ── Validation: متى يُفعَّل زر Next ─────────────────────────────────────
    const canNext =
        step === 0 ? Boolean(field) :                                           // لازم يختار department
            step === 2 ? Boolean(fullName.trim()) && Boolean(email.trim()) :        // لازم name + email
                true;                                                                   // باقي الخطوات اختيارية

    /* ── Design tokens ────────────────────────────────────────────────── */
    const accent = "#d0895b";
    const a10 = isDark ? "rgba(208,137,91,0.10)" : "rgba(208,137,91,0.07)";
    const a22 = "rgba(208,137,91,0.22)";
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
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

    // chip style — selected أو لا
    const chipSx = (sel) => ({
        height: 30, borderRadius: 1.5, fontSize: "0.78rem", fontWeight: sel ? 700 : 400,
        bgcolor: sel ? accent : "transparent", color: sel ? "#fff" : textSec,
        border: `1px solid ${sel ? accent : border}`, cursor: "pointer",
        "&:hover": { bgcolor: sel ? "#be7a4f" : a10, borderColor: sel ? "#be7a4f" : a22 },
    });

    /* ── Reusable inner card ──────────────────────────────────────────── */
    const InnerCard = ({ icon: Icon, title, count, action, children }) => (
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

    const CurrentIcon = STEPS[step].icon;

    return (
        <Dialog
            open={open}
            maxWidth="sm"
            fullWidth
            disableEscapeKeyDown
            onKeyDown={(e) => e.stopPropagation()}   // منع إغلاق الـ Dialog بالـ keyboard
            PaperProps={{
                sx: {
                    borderRadius: 3, overflow: "hidden",
                    border: `1px solid ${border}`, bgcolor: paperBg,
                    boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.55)" : "0 20px 60px rgba(0,0,0,0.10)",
                }
            }}
        >
            {/* ── Progress bar ──────────────────────────────────────────────── */}
            <LinearProgress
                variant="determinate"
                value={((step + 1) / STEPS.length) * 100}
                sx={{
                    height: 3,
                    bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                    "& .MuiLinearProgress-bar": { bgcolor: accent, transition: "transform 0.5s ease" },
                }}
            />

            {/* ── Header ────────────────────────────────────────────────────── */}
            <Box sx={{
                px: 3, py: 2.5, borderBottom: `1px solid ${border}`,
                display: "flex", alignItems: "center", gap: 2,
            }}>
                <Box sx={{
                    width: 44, height: 44, borderRadius: 2.5, flexShrink: 0,
                    bgcolor: a10, border: `1px solid ${a22}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <CurrentIcon sx={{ fontSize: 22, color: accent }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: textPri, lineHeight: 1.2 }}>
                        {STEPS[step].label}
                    </Typography>
                    <Typography fontSize="0.77rem" sx={{ color: textSec, mt: 0.3 }}>
                        {STEPS[step].desc}
                    </Typography>
                </Box>
                <Box sx={{ px: 1.5, py: 0.4, borderRadius: 10, flexShrink: 0, bgcolor: a10, border: `1px solid ${a22}` }}>
                    <Typography fontSize="0.7rem" fontWeight={700} sx={{ color: accent }}>
                        {step + 1} / {STEPS.length}
                    </Typography>
                </Box>
            </Box>

            {/* ── Step dots ─────────────────────────────────────────────────── */}
            <Box sx={{
                px: 3.5, py: 1.6, borderBottom: `1px solid ${border}`,
                bgcolor: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.012)",
            }}>
                <Stack direction="row" alignItems="center">
                    {STEPS.map((s, i) => {
                        const done = i < step;
                        const current = i === step;
                        return (
                            <Stack key={i} direction="row" alignItems="center"
                                sx={{ flex: i < STEPS.length - 1 ? 1 : 0 }}>
                                <Stack alignItems="center" spacing={0.5}>
                                    <Box sx={{
                                        width: 22, height: 22, borderRadius: "50%",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        bgcolor: done || current ? accent
                                            : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                                        border: `1.5px solid ${done || current ? accent : border}`,
                                        transition: "all 0.25s ease",
                                    }}>
                                        {done
                                            ? <CheckIcon sx={{ fontSize: 11, color: "#fff" }} />
                                            : <Typography fontSize="0.6rem" fontWeight={700}
                                                sx={{ color: current ? "#fff" : textSec }}>{i + 1}</Typography>
                                        }
                                    </Box>
                                    <Typography fontSize="0.6rem" fontWeight={current ? 700 : 400}
                                        sx={{ color: current ? accent : textSec, whiteSpace: "nowrap" }}>
                                        {s.label}
                                    </Typography>
                                </Stack>
                                {i < STEPS.length - 1 && (
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

            {/* ── Content ───────────────────────────────────────────────────── */}
            <DialogContent sx={{ px: 3.5, py: 3, overflowY: "auto" }}>

                {/* ── STEP 0: Department ────────────────────────────────────── */}
                {step === 0 && (
                    <Stack spacing={2}>
                        {/* عرض الاختيار الحالي */}
                        <InnerCard icon={SchoolOutlinedIcon} title="Selected">
                            {field ? (
                                <Stack direction="row" alignItems="center" gap={1.5}>
                                    <Box sx={{
                                        width: 32, height: 32, borderRadius: 1.5,
                                        bgcolor: accent, flexShrink: 0,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <CheckIcon sx={{ fontSize: 16, color: "#fff" }} />
                                    </Box>
                                    <Box>
                                        <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: textPri }}>{field}</Typography>
                                        <Typography fontSize="0.72rem" sx={{ color: textSec }}>Your academic department</Typography>
                                    </Box>
                                </Stack>
                            ) : (
                                <Typography fontSize="0.82rem" sx={{ color: textSec }}>No department selected yet</Typography>
                            )}
                        </InnerCard>

                        {/* اختيار التخصص */}
                        <InnerCard icon={SchoolOutlinedIcon} title="Choose Department *">
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                                {ALL_FIELDS.map((f) => (
                                    <Chip key={f} label={f} onClick={() => setField(f)} sx={chipSx(field === f)} />
                                ))}
                            </Stack>
                        </InnerCard>
                    </Stack>
                )}

                {/* ── STEP 1: Skills ────────────────────────────────────────── */}
                {step === 1 && (
                    <Stack spacing={2}>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            {/* حقل إضافة skill مخصص */}
                            <InnerCard icon={AddIcon} title="Add Custom Skill">
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

                            {/* Skills المختارة */}
                            <InnerCard icon={CodeOutlinedIcon} title="Selected" count={skills.length}
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
                                    <Typography fontSize="0.8rem" sx={{ color: textSec }}>None yet</Typography>
                                )}
                            </InnerCard>
                        </Stack>

                        {/* Skills مقترحة */}
                        <InnerCard icon={CodeOutlinedIcon} title="Suggestions">
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                                {SUGGESTED_SKILLS.map((s) => (
                                    <Chip key={s} label={s} onClick={() => toggleSkill(s)} sx={chipSx(skills.includes(s))} />
                                ))}
                            </Stack>
                        </InnerCard>
                    </Stack>
                )}

                {/* ── STEP 2: Contact ───────────────────────────────────────── */}
                {step === 2 && (
                    <Stack spacing={2}>
                        <InnerCard icon={BadgeOutlinedIcon} title="Identity">
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
                        </InnerCard>

                        <InnerCard icon={LinkedInIcon} title="Social Links">
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
                        </InnerCard>
                    </Stack>
                )}

                {/* ── STEP 3: Bio ───────────────────────────────────────────── */}
                {step === 3 && (
                    <Stack spacing={2}>
                        {/* نصائح */}
                        <Box sx={{ display: "flex", gap: 1.5, p: 2, borderRadius: 2.5, bgcolor: a10, border: `1px solid ${a22}` }}>
                            <Box sx={{
                                width: 30, height: 30, borderRadius: 1.5, flexShrink: 0,
                                bgcolor: accent, display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <Typography fontSize="0.8rem">💡</Typography>
                            </Box>
                            <Stack spacing={0.3}>
                                <Typography fontSize="0.78rem" fontWeight={700} sx={{ color: textPri }}>Tips for a great bio</Typography>
                                {[
                                    "Programming languages: Python, JavaScript, C++…",
                                    "Frameworks & tools: React, Django, Flutter…",
                                    "Previous projects or experience",
                                    "Competitions or contributions (e.g. hackathons)",
                                ].map((t) => (
                                    <Typography key={t} fontSize="0.74rem" sx={{ color: textSec }}>· {t}</Typography>
                                ))}
                            </Stack>
                        </Box>

                        <InnerCard icon={PersonOutlineIcon} title="Your Bio"
                            count={bio.length > 0 ? `${bio.length}/400` : undefined}>
                            <TextField
                                multiline rows={5} fullWidth
                                placeholder="Tell teammates about yourself…"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                inputProps={{ maxLength: 400 }}
                                sx={inputSx}
                            />
                        </InnerCard>
                    </Stack>
                )}

                {/* رسالة خطأ */}
                {error && (
                    <Typography fontSize="0.78rem" sx={{ color: "error.main", mt: 1.5 }}>{error}</Typography>
                )}
            </DialogContent>

            {/* ── Footer ────────────────────────────────────────────────────── */}
            <Box sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                px: 3.5, py: 2, borderTop: `1px solid ${border}`,
            }}>
                <Typography fontSize="0.74rem" sx={{ color: textSec }}>
                    {step < STEPS.length - 1 ? `Next: ${STEPS[step + 1].label}` : "Almost done!"}
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
                        {saving ? "Saving…" : step === STEPS.length - 1 ? "Finish" : "Next"}
                    </Button>
                </Stack>
            </Box>
        </Dialog>
    );
}