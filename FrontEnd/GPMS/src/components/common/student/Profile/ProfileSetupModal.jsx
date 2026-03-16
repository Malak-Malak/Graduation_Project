import { useState } from "react";
import {
    Dialog, DialogContent, DialogActions,
    Box, Typography, Button, Stack, TextField,
    Chip, Avatar, LinearProgress,
} from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

const ALL_SKILLS = [
    "Frontend", "Backend", "AI / ML", "Data Analysis",
    "UI/UX", "DevOps", "Mobile", "Security",
    "Database", "Testing / QA", "Embedded", "Networks",
];

const ALL_FIELDS = [
    "Computer Science", "Computer Engineering",
    "Electrical Engineering", "Information Technology",
    "Software Engineering", "Cybersecurity",
];

const STEPS = ["Your Field", "Your Skills", "Contact Info", "About You"];

export default function ProfileSetupModal({ open, onDone }) {
    const [step, setStep] = useState(0);
    const [field, setField] = useState("");
    const [skills, setSkills] = useState([]);
    const [linkedin, setLinkedin] = useState("");
    const [github, setGithub] = useState("");
    const [bio, setBio] = useState("");

    const toggleSkill = (skill) =>
        setSkills((p) => p.includes(skill) ? p.filter((s) => s !== skill) : [...p, skill]);

    const handleNext = () => {
        if (step < STEPS.length - 1) setStep((s) => s + 1);
        else onDone({ field, skills, linkedin, github, bio });
    };

    const handleSkip = () => onDone(null);

    const canNext =
        step === 0 ? Boolean(field) :
            step === 1 ? skills.length > 0 :
                true;

    return (
        <Dialog open={open} maxWidth="xs" fullWidth
            PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>

            <DialogContent>
                <Stack spacing={3}>

                    {/* Progress */}
                    <Box>
                        <Stack direction="row" justifyContent="space-between" mb={0.8}>
                            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#C47E7E", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                Step {step + 1} of {STEPS.length}
                            </Typography>
                            <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
                                {STEPS[step]}
                            </Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={((step + 1) / STEPS.length) * 100}
                            sx={{ height: 4, borderRadius: 2, bgcolor: "#C47E7E22", "& .MuiLinearProgress-bar": { bgcolor: "#C47E7E" } }} />
                    </Box>

                    {/* Avatar + title */}
                    <Stack alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: "#C47E7E22" }}>
                            <PersonOutlineIcon sx={{ fontSize: 32, color: "#C47E7E" }} />
                        </Avatar>
                        <Typography variant="h6" fontWeight={700}>Complete Your Profile</Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                            {step === 0 && "Select your academic field"}
                            {step === 1 && "Select your skills so teammates can find you"}
                            {step === 2 && "Add your social links so others can connect with you"}
                            {step === 3 && "Write a short bio about yourself"}
                        </Typography>
                    </Stack>

                    {/* Step 0 — Field */}
                    {step === 0 && (
                        <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center">
                            {ALL_FIELDS.map((f) => {
                                const selected = field === f;
                                return (
                                    <Chip key={f} label={f} onClick={() => setField(f)}
                                        sx={{
                                            bgcolor: selected ? "#C47E7E" : "#C47E7E15",
                                            color: selected ? "#fff" : "#C47E7E",
                                            fontWeight: 600, fontSize: "0.78rem",
                                            border: `1px solid ${selected ? "#C47E7E" : "#C47E7E40"}`,
                                            cursor: "pointer",
                                            "&:hover": { bgcolor: selected ? "#b06b6b" : "#C47E7E25" },
                                        }} />
                                );
                            })}
                        </Stack>
                    )}

                    {/* Step 1 — Skills */}
                    {step === 1 && (
                        <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center">
                            {ALL_SKILLS.map((skill) => {
                                const selected = skills.includes(skill);
                                return (
                                    <Chip key={skill} label={skill} onClick={() => toggleSkill(skill)}
                                        sx={{
                                            bgcolor: selected ? "#C47E7E" : "#C47E7E15",
                                            color: selected ? "#fff" : "#C47E7E",
                                            fontWeight: 600, fontSize: "0.78rem",
                                            border: `1px solid ${selected ? "#C47E7E" : "#C47E7E40"}`,
                                            cursor: "pointer",
                                            "&:hover": { bgcolor: selected ? "#b06b6b" : "#C47E7E25" },
                                        }} />
                                );
                            })}
                        </Stack>
                    )}

                    {/* Step 2 — Contact */}
                    {step === 2 && (
                        <Stack spacing={2}>
                            <TextField size="small" fullWidth label="LinkedIn URL"
                                placeholder="https://linkedin.com/in/username"
                                value={linkedin} onChange={(e) => setLinkedin(e.target.value)}
                                InputProps={{ startAdornment: <LinkedInIcon sx={{ mr: 1, color: "#0077B5", fontSize: 20 }} /> }} />
                            <TextField size="small" fullWidth label="GitHub URL"
                                placeholder="https://github.com/username"
                                value={github} onChange={(e) => setGithub(e.target.value)}
                                InputProps={{ startAdornment: <GitHubIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} /> }} />
                        </Stack>
                    )}

                    {/* Step 3 — Bio */}
                    {step === 3 && (
                        <TextField multiline rows={4} fullWidth label="Bio"
                            placeholder="Tell your teammates a bit about yourself..."
                            value={bio} onChange={(e) => setBio(e.target.value)}
                            inputProps={{ maxLength: 300 }}
                            helperText={`${bio.length}/300`} />
                    )}

                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button onClick={handleSkip} sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                    Skip for now
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                {step > 0 && (
                    <Button onClick={() => setStep((s) => s - 1)} sx={{ color: "text.secondary" }}>
                        Back
                    </Button>
                )}
                <Button variant="contained" onClick={handleNext} disabled={!canNext}
                    sx={{ bgcolor: "#C47E7E", "&:hover": { bgcolor: "#b06b6b" }, borderRadius: 2, px: 3 }}>
                    {step === STEPS.length - 1 ? "Finish" : "Next"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}