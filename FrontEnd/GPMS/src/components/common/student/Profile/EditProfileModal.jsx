import { useState, useEffect } from "react";
import {
    Dialog, DialogContent, DialogActions,
    Box, Typography, Button, Stack, TextField,
    Chip, Divider,
} from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

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

export default function EditProfileModal({ open, profile, onSave, onClose }) {
    const [field, setField] = useState("");
    const [skills, setSkills] = useState([]);
    const [linkedin, setLinkedin] = useState("");
    const [github, setGithub] = useState("");
    const [bio, setBio] = useState("");

    // ← sync مع البروفايل الحالي كل ما يفتح المودال
    useEffect(() => {
        if (open) {
            setField(profile?.field || "");
            setSkills(profile?.skills || []);
            setLinkedin(profile?.linkedin || "");
            setGithub(profile?.github || "");
            setBio(profile?.bio || "");
        }
    }, [open, profile]);

    const toggleSkill = (skill) =>
        setSkills((p) => p.includes(skill) ? p.filter((s) => s !== skill) : [...p, skill]);

    const handleSave = () => {
        onSave({ field, skills, linkedin, github, bio });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 4 } }}>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, pt: 2.5, pb: 1 }}>
                <Typography fontWeight={700} fontSize="1.05rem">Edit Profile</Typography>
                <IconButton size="small" onClick={onClose}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <DialogContent sx={{ pt: 1 }}>
                <Stack spacing={3}>

                    {/* Field */}
                    <Box>
                        <Typography sx={{
                            fontSize: "0.78rem", fontWeight: 700, color: "text.secondary",
                            textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.2
                        }}>
                            Academic Field
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {ALL_FIELDS.map((f) => {
                                const selected = field === f;
                                return (
                                    <Chip key={f} label={f} onClick={() => setField(f)}
                                        sx={{
                                            bgcolor: selected ? "#C47E7E" : "#C47E7E15",
                                            color: selected ? "#fff" : "#C47E7E",
                                            fontWeight: 600, fontSize: "0.75rem",
                                            border: `1px solid ${selected ? "#C47E7E" : "#C47E7E40"}`,
                                            cursor: "pointer",
                                            "&:hover": { bgcolor: selected ? "#b06b6b" : "#C47E7E25" },
                                        }} />
                                );
                            })}
                        </Stack>
                    </Box>

                    <Divider />

                    {/* Skills */}
                    <Box>
                        <Typography sx={{
                            fontSize: "0.78rem", fontWeight: 700, color: "text.secondary",
                            textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.2
                        }}>
                            Skills
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {ALL_SKILLS.map((skill) => {
                                const selected = skills.includes(skill);
                                return (
                                    <Chip key={skill} label={skill} onClick={() => toggleSkill(skill)}
                                        sx={{
                                            bgcolor: selected ? "#C47E7E" : "#C47E7E15",
                                            color: selected ? "#fff" : "#C47E7E",
                                            fontWeight: 600, fontSize: "0.75rem",
                                            border: `1px solid ${selected ? "#C47E7E" : "#C47E7E40"}`,
                                            cursor: "pointer",
                                            "&:hover": { bgcolor: selected ? "#b06b6b" : "#C47E7E25" },
                                        }} />
                                );
                            })}
                        </Stack>
                    </Box>

                    <Divider />

                    {/* Contact */}
                    <Box>
                        <Typography sx={{
                            fontSize: "0.78rem", fontWeight: 700, color: "text.secondary",
                            textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.5
                        }}>
                            Contact Links
                        </Typography>
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
                    </Box>

                    <Divider />

                    {/* Bio */}
                    <Box>
                        <Typography sx={{
                            fontSize: "0.78rem", fontWeight: 700, color: "text.secondary",
                            textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.5
                        }}>
                            Bio
                        </Typography>
                        <TextField multiline rows={4} fullWidth
                            placeholder="Tell your teammates a bit about yourself..."
                            value={bio} onChange={(e) => setBio(e.target.value)}
                            inputProps={{ maxLength: 300 }}
                            helperText={`${bio.length}/300`} />
                    </Box>

                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button onClick={onClose} sx={{ color: "text.secondary" }}>Cancel</Button>
                <Button variant="contained" onClick={handleSave}
                    sx={{ bgcolor: "#C47E7E", "&:hover": { bgcolor: "#b06b6b" }, borderRadius: 2, px: 3 }}>
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}