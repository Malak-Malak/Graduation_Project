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
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";

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
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [github, setGithub] = useState("");
    const [bio, setBio] = useState("");

    useEffect(() => {
        if (open) {
            setField(profile?.field || "");
            setSkills(profile?.skills || []);
            setFullName(profile?.fullName || "");
            setPhoneNumber(profile?.phoneNumber || "");
            setLinkedin(profile?.linkedin || "");
            setGithub(profile?.github || "");
            setBio(profile?.bio || "");
        }
    }, [open, profile]);

    const toggleSkill = (skill) =>
        setSkills((p) => p.includes(skill) ? p.filter((s) => s !== skill) : [...p, skill]);

    const handleSave = () => {
        onSave({ field, skills, fullName, phoneNumber, linkedin, github, bio });
    };

    const canSave = Boolean(fullName.trim()) && Boolean(phoneNumber.trim());

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
                        <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.2 }}>
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
                        <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.2 }}>
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
                        <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.5 }}>
                            Contact Info
                        </Typography>
                        <Stack spacing={2}>
                            <TextField size="small" fullWidth label="Full Name *"
                                placeholder="e.g. Hanan Awad"
                                value={fullName} onChange={(e) => setFullName(e.target.value)}
                                InputProps={{ startAdornment: <BadgeOutlinedIcon sx={{ mr: 1, color: "#C47E7E", fontSize: 20 }} /> }} />
                            <TextField size="small" fullWidth label="Phone Number *"
                                placeholder="e.g. +970591234567"
                                value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                                InputProps={{ startAdornment: <PhoneOutlinedIcon sx={{ mr: 1, color: "#C47E7E", fontSize: 20 }} /> }} />
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
                        <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.5 }}>
                            Bio
                        </Typography>
                        <TextField multiline rows={5} fullWidth label="Bio"
                            placeholder={[
                                "💡 Tips for a great bio:",
                                "• Programming languages: Python, JavaScript, C++...",
                                "• Frameworks & tools: React, Django, Flutter...",
                                "• Previous projects or experience",
                                "• Competitions or contributions (e.g. hackathons)",
                            ].join("\n")}
                            value={bio} onChange={(e) => setBio(e.target.value)}
                            inputProps={{ maxLength: 400 }}
                            helperText={
                                bio.length === 0
                                    ? "Mention your languages, frameworks, projects, and any relevant experience"
                                    : `${bio.length}/400`
                            } />
                    </Box>

                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button onClick={onClose} sx={{ color: "text.secondary" }}>Cancel</Button>
                <Button variant="contained" onClick={handleSave} disabled={!canSave}
                    sx={{ bgcolor: "#C47E7E", "&:hover": { bgcolor: "#b06b6b" }, borderRadius: 2, px: 3 }}>
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}