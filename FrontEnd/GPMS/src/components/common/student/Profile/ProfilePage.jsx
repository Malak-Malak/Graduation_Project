import { useState } from "react";
import {
    Box, Typography, Stack, Paper, Avatar, Chip, Button,
    Divider, IconButton, Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EditProfileModal from "./EditProfileModal";
import { useAuth } from "../../../../contexts/AuthContext";

const SKILL_COLORS = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8", "#C47E7E"];

export default function ProfilePage() {
    const theme = useTheme();
    const t = theme.palette.custom;
    const { user } = useAuth();

    // ← بنقرأ من sessionStorage مؤقتاً لحد ما API تجهز
    const stored = (() => {
        try { return JSON.parse(sessionStorage.getItem("student_profile") || "{}"); }
        catch { return {}; }
    })();

    const [profile, setProfile] = useState({
        field: stored.field || "",
        skills: stored.skills || [],
        linkedin: stored.linkedin || "",
        github: stored.github || "",
        bio: stored.bio || "",
    });

    const [editOpen, setEditOpen] = useState(false);

    const handleSave = (updated) => {
        setProfile(updated);
        sessionStorage.setItem("student_profile", JSON.stringify(updated));
        setEditOpen(false);
    };

    const displayName = user?.name ?? user?.username ?? "Student";
    const avatarLetter = displayName.charAt(0).toUpperCase();

    return (
        <Box sx={{ maxWidth: 700, mx: "auto" }}>

            {/* Header card */}
            <Paper elevation={1} sx={{ p: 3, borderRadius: 3, bgcolor: theme.palette.background.paper, mb: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction="row" spacing={2.5} alignItems="center">
                        <Avatar sx={{ width: 72, height: 72, bgcolor: "#C47E7E", fontSize: "1.6rem", fontWeight: 700 }}>
                            {avatarLetter}
                        </Avatar>
                        <Box>
                            <Typography variant="h4" fontWeight={700} sx={{ color: t.textPrimary }}>
                                {displayName}
                            </Typography>
                            <Typography sx={{ fontSize: "0.85rem", color: t.textSecondary, mt: 0.3 }}>
                                {user?.email ?? ""}
                            </Typography>
                            {profile.field && (
                                <Stack direction="row" alignItems="center" gap={0.6} mt={0.8}>
                                    <SchoolOutlinedIcon sx={{ fontSize: 15, color: t.accentPrimary }} />
                                    <Typography sx={{ fontSize: "0.82rem", color: t.accentPrimary, fontWeight: 600 }}>
                                        {profile.field}
                                    </Typography>
                                </Stack>
                            )}
                        </Box>
                    </Stack>

                    <Tooltip title="Edit Profile">
                        <IconButton onClick={() => setEditOpen(true)}
                            sx={{
                                border: `1px solid ${t.borderLight}`, borderRadius: 2, color: t.textSecondary,
                                "&:hover": { color: t.accentPrimary, borderColor: t.accentPrimary }
                            }}>
                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                </Stack>

                {/* Social links */}
                {(profile.linkedin || profile.github) && (
                    <Stack direction="row" gap={1.5} mt={2.5}>
                        {profile.linkedin && (
                            <Button size="small" startIcon={<LinkedInIcon sx={{ fontSize: 16 }} />}
                                href={profile.linkedin} target="_blank"
                                sx={{
                                    color: "#0077B5", bgcolor: "#0077B510", borderRadius: 2,
                                    fontSize: "0.78rem", textTransform: "none",
                                    "&:hover": { bgcolor: "#0077B520" }
                                }}>
                                LinkedIn
                            </Button>
                        )}
                        {profile.github && (
                            <Button size="small" startIcon={<GitHubIcon sx={{ fontSize: 16 }} />}
                                href={profile.github} target="_blank"
                                sx={{
                                    color: t.textPrimary, bgcolor: t.surfaceHover, borderRadius: 2,
                                    fontSize: "0.78rem", textTransform: "none",
                                    "&:hover": { bgcolor: t.borderLight }
                                }}>
                                GitHub
                            </Button>
                        )}
                    </Stack>
                )}
            </Paper>

            {/* Bio */}
            {profile.bio && (
                <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper, mb: 2.5 }}>
                    <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                        <PersonOutlineIcon sx={{ fontSize: 18, color: t.accentPrimary }} />
                        <Typography variant="h5" sx={{ color: t.textPrimary }}>About</Typography>
                    </Stack>
                    <Divider sx={{ mb: 1.5 }} />
                    <Typography sx={{ fontSize: "0.875rem", color: t.textSecondary, lineHeight: 1.7 }}>
                        {profile.bio}
                    </Typography>
                </Paper>
            )}

            {/* Skills */}
            <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper, mb: 2.5 }}>
                <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                    <CodeOutlinedIcon sx={{ fontSize: 18, color: t.accentPrimary }} />
                    <Typography variant="h5" sx={{ color: t.textPrimary }}>Skills</Typography>
                </Stack>
                <Divider sx={{ mb: 1.5 }} />
                {profile.skills.length > 0 ? (
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                        {profile.skills.map((skill, i) => (
                            <Chip key={skill} label={skill}
                                sx={{
                                    bgcolor: `${SKILL_COLORS[i % SKILL_COLORS.length]}15`,
                                    color: SKILL_COLORS[i % SKILL_COLORS.length],
                                    fontWeight: 600, fontSize: "0.78rem",
                                    border: `1px solid ${SKILL_COLORS[i % SKILL_COLORS.length]}40`,
                                }} />
                        ))}
                    </Stack>
                ) : (
                    <Typography sx={{ fontSize: "0.85rem", color: t.textTertiary }}>
                        No skills added yet.{" "}
                        <span style={{ color: t.accentPrimary, cursor: "pointer" }}
                            onClick={() => setEditOpen(true)}>
                            Add your skills
                        </span>
                    </Typography>
                )}
            </Paper>

            {/* Empty state */}
            {!profile.bio && !profile.linkedin && !profile.github && profile.skills.length === 0 && (
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px dashed ${t.borderLight}`, textAlign: "center" }}>
                    <Typography sx={{ color: t.textTertiary, fontSize: "0.875rem", mb: 1.5 }}>
                        Your profile looks empty. Complete it so teammates can find you!
                    </Typography>
                    <Button variant="contained" size="small" onClick={() => setEditOpen(true)}
                        sx={{ bgcolor: "#C47E7E", "&:hover": { bgcolor: "#b06b6b" }, borderRadius: 2 }}>
                        Complete Profile
                    </Button>
                </Paper>
            )}

            <EditProfileModal open={editOpen} profile={profile} onSave={handleSave} onClose={() => setEditOpen(false)} />
        </Box>
    );
}