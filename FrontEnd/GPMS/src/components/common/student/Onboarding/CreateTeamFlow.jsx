import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import {
    Dialog, DialogContent,
    Box, Typography, TextField, Button, Stack,
    Avatar, CircularProgress, IconButton, LinearProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import TitleOutlinedIcon from "@mui/icons-material/TitleOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import { useAuth } from "../../../../contexts/AuthContext";
import studentApi from "../../../../api/handler/endpoints/studentApi";

const STEPS = [
    { label: "Supervisor", icon: SchoolOutlinedIcon, desc: "Select the supervisor for your team" },
    { label: "Details", icon: TitleOutlinedIcon, desc: "Enter your project info" },
    { label: "Review", icon: FactCheckOutlinedIcon, desc: "Confirm and submit your request" },
];

/* ── helper: normalize id regardless of _id / id / userId ── */
const getId = (obj) => obj?._id ?? obj?.id ?? obj?.userId ?? null;

export default function CreateTeamFlow({ open, onClose, onSuccess }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const { updateUser } = useAuth();

    const [step, setStep] = useState(0);
    const [supervisors, setSupervisors] = useState([]);
    const [loadingSups, setLoadingSups] = useState(false);
    const [selectedSup, setSelectedSup] = useState(null);
    const [projectTitle, setProjectTitle] = useState("");
    const [projectDesc, setProjectDesc] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;
        setLoadingSups(true);
        studentApi.getSupervisors()
            .then((d) => setSupervisors(Array.isArray(d) ? d : []))
            .catch(() => setError("Failed to load supervisors list"))
            .finally(() => setLoadingSups(false));
    }, [open]);

    const handleReset = () => {
        setStep(0); setSelectedSup(null);
        setProjectTitle(""); setProjectDesc(""); setError("");
    };
    const handleClose = () => { handleReset(); onClose(); };

    const handleSubmit = async () => {
        if (!selectedSup || !projectTitle.trim()) return;
        setSubmitting(true); setError("");
        try {
            const res = await studentApi.createTeam({
                projectTitle: projectTitle.trim(),
                projectDescription: projectDesc.trim(),
                supervisorId: getId(selectedSup),
                studentIds: [],
            });
            if (res?.teamId || res?.id || res?._id || res?.success !== false) {
                updateUser({ teamId: res?.teamId ?? res?.id ?? res?._id ?? "pending" });
                handleReset();
                onSuccess?.("Team request sent! Waiting for supervisor approval.");
            } else {
                setError(res?.message ?? "Something went wrong, please try again.");
            }
        } catch (e) {
            setError(e?.response?.data?.message ?? "Unable to connect to server");
        } finally {
            setSubmitting(false);
        }
    };

    /* ── tokens ── */
    const accent = "#d0895b";
    const a10 = isDark ? "rgba(208,137,91,0.10)" : "rgba(208,137,91,0.07)";
    const a22 = "rgba(208,137,91,0.22)";
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const cardAlt = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
    const paperBg = theme.palette.background.paper;
    const textPri = theme.palette.text.primary;
    const textSec = theme.palette.text.secondary;

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: 2, fontSize: "0.875rem",
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: accent },
        },
        "& .MuiInputLabel-root.Mui-focused": { color: accent },
        "& .MuiInputLabel-root": { fontSize: "0.875rem" },
    };

    /* inner review card */
    const ReviewCard = ({ label, value }) => (
        <Box sx={{ borderRadius: 2.5, border: `1px solid ${border}`, bgcolor: cardAlt, overflow: "hidden" }}>
            <Box sx={{
                px: 2.5, py: 1.2, borderBottom: `1px solid ${border}`,
                bgcolor: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.015)",
            }}>
                <Typography sx={{
                    fontSize: "0.68rem", fontWeight: 700,
                    letterSpacing: "0.08em", textTransform: "uppercase", color: textSec,
                }}>
                    {label}
                </Typography>
            </Box>
            <Box sx={{ px: 2.5, py: 1.8 }}>
                <Typography fontWeight={600} fontSize="0.88rem" sx={{ color: textPri }}>
                    {value || <Box component="span" sx={{ color: textSec, fontWeight: 400, fontStyle: "italic" }}>Not provided</Box>}
                </Typography>
            </Box>
        </Box>
    );

    const canNext = step === 0 ? Boolean(selectedSup) : step === 1 ? Boolean(projectTitle.trim()) : true;
    const CurrentIcon = STEPS[step].icon;

    return (
        <Dialog
            open={open}
            maxWidth="sm"
            fullWidth
            onKeyDown={(e) => e.stopPropagation()}
            PaperProps={{
                sx: {
                    borderRadius: 3, overflow: "hidden",
                    border: `1px solid ${border}`, bgcolor: paperBg,
                    /* كبّرنا المودال شوي */
                    "& .MuiDialog-paper": { minHeight: 540 },
                    boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.55)" : "0 20px 60px rgba(0,0,0,0.10)",
                }
            }}
            /* هذا بيكبّر المودال فعلياً */
            sx={{ "& .MuiDialog-paper": { minHeight: 560 } }}
        >
            {/* progress */}
            <LinearProgress
                variant="determinate"
                value={((step + 1) / STEPS.length) * 100}
                sx={{
                    height: 3,
                    bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                    "& .MuiLinearProgress-bar": { bgcolor: accent, transition: "transform 0.45s ease" },
                }}
            />

            {/* header */}
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
                    <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: textPri }}>
                        {STEPS[step].label}
                    </Typography>
                    <Typography fontSize="0.77rem" sx={{ color: textSec, mt: 0.2 }}>
                        {STEPS[step].desc}
                    </Typography>
                </Box>
                <Box sx={{
                    px: 1.5, py: 0.4, borderRadius: 10, flexShrink: 0,
                    bgcolor: a10, border: `1px solid ${a22}`,
                }}>
                    <Typography fontSize="0.7rem" fontWeight={700} sx={{ color: accent }}>
                        {step + 1} / {STEPS.length}
                    </Typography>
                </Box>
                <IconButton size="small" onClick={handleClose} sx={{ color: textSec }}>
                    <CloseIcon sx={{ fontSize: 17 }} />
                </IconButton>
            </Box>

            {/* step dots */}
            <Box sx={{
                px: 3.5, py: 1.6, borderBottom: `1px solid ${border}`,
                bgcolor: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.012)",
            }}>
                <Stack direction="row" alignItems="center">
                    {STEPS.map((s, i) => {
                        const done = i < step, current = i === step;
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
                                                sx={{ color: current ? "#fff" : textSec }}>
                                                {i + 1}
                                            </Typography>
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

            {/* ── content ── */}
            <DialogContent sx={{ px: 3.5, py: 3, flex: 1 }}>

                {/* STEP 0 — Supervisor */}
                {step === 0 && (
                    <Box>
                        {loadingSups ? (
                            <Box display="flex" justifyContent="center" py={5}>
                                <CircularProgress size={28} sx={{ color: accent }} />
                            </Box>
                        ) : supervisors.length === 0 ? (
                            <Box textAlign="center" py={5}>
                                <Typography fontSize="0.85rem" sx={{ color: textSec }}>
                                    No supervisors available at the moment.
                                </Typography>
                            </Box>
                        ) : (
                            <Stack spacing={1.2}>
                                {supervisors.map((sup) => {
                                    /* ✅ نقارن بـ getId عشان نحل مشكلة _id vs id */
                                    const isSelected = selectedSup !== null &&
                                        getId(selectedSup) === getId(sup);
                                    return (
                                        <Box
                                            key={getId(sup)}
                                            onClick={() => setSelectedSup(sup)}
                                            sx={{
                                                border: `1.5px solid ${isSelected ? accent : border}`,
                                                borderRadius: 2.5, p: 2,
                                                cursor: "pointer",
                                                bgcolor: isSelected ? a10 : cardAlt,
                                                transition: "all 0.15s ease",
                                                "&:hover": { borderColor: accent, bgcolor: a10 },
                                            }}
                                        >
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar sx={{
                                                    width: 40, height: 40,
                                                    fontSize: "1rem", fontWeight: 700,
                                                    bgcolor: isSelected ? accent
                                                        : isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
                                                    color: isSelected ? "#fff" : textSec,
                                                    transition: "all 0.15s ease",
                                                }}>
                                                    {(sup.fullName || sup.name || sup.username || "S").charAt(0).toUpperCase()}
                                                </Avatar>

                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography fontWeight={600} fontSize="0.88rem"
                                                        sx={{ color: textPri }}>
                                                        {sup.fullName || sup.name || sup.username || "Supervisor"}
                                                    </Typography>
                                                    {(sup.department ?? sup.title) && (
                                                        <Typography fontSize="0.75rem" sx={{ color: textSec, mt: 0.2 }}>
                                                            {sup.department ?? sup.title}
                                                        </Typography>
                                                    )}
                                                </Box>

                                                {/* checkmark — only for the selected one */}
                                                <Box sx={{
                                                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    bgcolor: isSelected ? accent : "transparent",
                                                    border: `1.5px solid ${isSelected ? accent : border}`,
                                                    transition: "all 0.15s ease",
                                                }}>
                                                    {isSelected && <CheckIcon sx={{ fontSize: 13, color: "#fff" }} />}
                                                </Box>
                                            </Stack>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        )}
                    </Box>
                )}

                {/* STEP 1 — Details */}
                {step === 1 && (
                    <Stack spacing={2}>
                        <TextField
                            label="Project Title *"
                            fullWidth
                            value={projectTitle}
                            onChange={(e) => setProjectTitle(e.target.value)}
                            placeholder="e.g. Smart Graduation Management System"
                            sx={inputSx}
                        />
                        <TextField
                            label="Project Description"
                            fullWidth
                            multiline
                            rows={4}
                            value={projectDesc}
                            onChange={(e) => setProjectDesc(e.target.value)}
                            placeholder="Brief description of your project idea, goals, and technologies you plan to use…"
                            inputProps={{ maxLength: 500 }}
                            helperText={projectDesc.length > 0 ? `${projectDesc.length} / 500` : "Optional — you can fill this later"}
                            sx={inputSx}
                        />
                        <Typography fontSize="0.76rem" sx={{ color: textSec }}>
                            You can invite team members after the supervisor approves your request.
                        </Typography>
                    </Stack>
                )}

                {/* STEP 2 — Review */}
                {step === 2 && (
                    <Stack spacing={1.5}>
                        <ReviewCard
                            label="Supervisor"
                            value={selectedSup?.fullName || selectedSup?.name || selectedSup?.username}
                        />
                        <ReviewCard label="Project Title" value={projectTitle} />
                        {projectDesc.trim() && (
                            <ReviewCard label="Description" value={projectDesc} />
                        )}
                        <Typography fontSize="0.76rem" sx={{ color: textSec, pt: 0.5 }}>
                            A request will be sent to the supervisor. You'll be notified upon approval.
                        </Typography>
                        {error && (
                            <Typography fontSize="0.78rem" sx={{ color: "error.main" }}>
                                {error}
                            </Typography>
                        )}
                    </Stack>
                )}

            </DialogContent>

            {/* footer */}
            <Box sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                px: 3.5, py: 2, borderTop: `1px solid ${border}`,
            }}>
                <Typography fontSize="0.74rem" sx={{ color: textSec }}>
                    {step < STEPS.length - 1 ? `Next: ${STEPS[step + 1].label}` : "Ready to submit"}
                </Typography>
                <Stack direction="row" gap={1}>
                    {step > 0 && (
                        <Button onClick={() => setStep((s) => s - 1)} sx={{
                            color: textSec, textTransform: "none",
                            fontWeight: 500, fontSize: "0.85rem",
                            borderRadius: 2, px: 2.5,
                        }}>
                            Back
                        </Button>
                    )}
                    {step < 2 ? (
                        <Button
                            variant="contained"
                            disabled={!canNext}
                            onClick={() => setStep((s) => s + 1)}
                            sx={{
                                bgcolor: accent,
                                "&:hover": { bgcolor: "#be7a4f", boxShadow: "none" },
                                borderRadius: 2, px: 3,
                                textTransform: "none", fontWeight: 700,
                                fontSize: "0.85rem", boxShadow: "none",
                                "&.Mui-disabled": { opacity: 0.45 },
                            }}
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            disabled={submitting}
                            onClick={handleSubmit}
                            sx={{
                                bgcolor: accent,
                                "&:hover": { bgcolor: "#be7a4f", boxShadow: "none" },
                                borderRadius: 2, px: 3,
                                textTransform: "none", fontWeight: 700,
                                fontSize: "0.85rem", boxShadow: "none",
                                "&.Mui-disabled": { opacity: 0.45 },
                            }}
                        >
                            {submitting
                                ? <CircularProgress size={18} sx={{ color: "#fff" }} />
                                : "Submit Request"
                            }
                        </Button>
                    )}
                </Stack>
            </Box>
        </Dialog>
    );
}