import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import {
    Dialog, DialogContent,
    Box, Typography, Button, Stack,
    Avatar, AvatarGroup, CircularProgress, IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import studentApi from "../../../../api/handler/endpoints/studentApi";

export default function JoinTeamFlow({ open, onClose, onSuccess }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [joining, setJoining] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        studentApi.getAvailableTeams()
            .then((d) => setTeams(Array.isArray(d) ? d : []))
            .catch(() => setError("Failed to load available teams"))
            .finally(() => setLoading(false));
    }, [open]);

    const handleJoin = async (teamId) => {
        setJoining(teamId); setError("");
        try {
            const res = await studentApi.requestToJoin(teamId);
            if (res?.success !== false) {
                onSuccess?.("Join request sent! Waiting for team leader approval.");
                onClose();
            } else {
                setError(res?.message ?? "Something went wrong");
            }
        } catch (e) {
            setError(e?.response?.data?.message ?? "Unable to connect to server");
        } finally {
            setJoining(null);
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

    return (
        <Dialog
            open={open}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3, overflow: "hidden",
                    border: `1px solid ${border}`, bgcolor: paperBg,
                    boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.55)" : "0 20px 60px rgba(0,0,0,0.10)",
                }
            }}
        >
            {/* header */}
            <Box sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                px: 3, py: 2.5, borderBottom: `1px solid ${border}`,
            }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                        bgcolor: a10, border: `1px solid ${a22}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <PeopleOutlineIcon sx={{ fontSize: 18, color: accent }} />
                    </Box>
                    <Box>
                        <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: textPri }}>
                            Available Teams
                        </Typography>
                        <Typography fontSize="0.75rem" sx={{ color: textSec, mt: 0.1 }}>
                            Send a request to join a team
                        </Typography>
                    </Box>
                </Box>
                <IconButton size="small" onClick={onClose} sx={{ color: textSec }}>
                    <CloseIcon sx={{ fontSize: 17 }} />
                </IconButton>
            </Box>

            <DialogContent sx={{ px: 3, py: 2.5 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" py={5}>
                        <CircularProgress size={28} sx={{ color: accent }} />
                    </Box>
                ) : teams.length === 0 ? (
                    <Box textAlign="center" py={5}>
                        <Box sx={{
                            width: 52, height: 52, borderRadius: 3, mx: "auto", mb: 1.5,
                            bgcolor: a10, border: `1px solid ${a22}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <PeopleOutlineIcon sx={{ fontSize: 24, color: accent }} />
                        </Box>
                        <Typography fontWeight={600} fontSize="0.88rem" sx={{ color: textPri }}>
                            No teams available
                        </Typography>
                        <Typography fontSize="0.8rem" sx={{ color: textSec, mt: 0.4 }}>
                            Check back later or create your own team
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={1.5}>
                        {error && (
                            <Typography fontSize="0.78rem" sx={{ color: "error.main" }}>{error}</Typography>
                        )}
                        {teams.map((team) => (
                            <Box key={team.id} sx={{
                                border: `1.5px solid ${border}`,
                                borderRadius: 2.5, p: 2.5,
                                bgcolor: cardAlt,
                                transition: "all 0.15s ease",
                                "&:hover": { borderColor: accent, bgcolor: a10 },
                            }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: textPri }}>
                                            {team.projectTitle ?? team.name ?? "Team"}
                                        </Typography>
                                        <Typography fontSize="0.76rem" sx={{ color: textSec, mt: 0.3 }}>
                                            Supervisor: {team.supervisorName ?? "—"}
                                        </Typography>

                                        {/* members row */}
                                        <Stack direction="row" alignItems="center" gap={1} mt={1.2}>
                                            <AvatarGroup max={4} sx={{
                                                "& .MuiAvatar-root": {
                                                    width: 24, height: 24, fontSize: "0.7rem",
                                                    bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                                                    color: textSec, border: `1.5px solid ${paperBg}`,
                                                },
                                            }}>
                                                {(team.members ?? []).map((m, i) => (
                                                    <Avatar key={i}>
                                                        {(m.name ?? m.username ?? "?").charAt(0).toUpperCase()}
                                                    </Avatar>
                                                ))}
                                            </AvatarGroup>
                                            <Box sx={{
                                                px: 1, py: 0.2, borderRadius: 10,
                                                bgcolor: a10, border: `1px solid ${a22}`,
                                            }}>
                                                <Typography fontSize="0.68rem" fontWeight={700} sx={{ color: accent }}>
                                                    {team.currentCount ?? team.members?.length ?? 0} / {team.maxSize ?? 4}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        size="small"
                                        disabled={joining === team.id}
                                        onClick={() => handleJoin(team.id)}
                                        sx={{
                                            bgcolor: accent,
                                            "&:hover": { bgcolor: "#be7a4f", boxShadow: "none" },
                                            borderRadius: 2, px: 2,
                                            textTransform: "none", fontWeight: 700,
                                            fontSize: "0.8rem", boxShadow: "none",
                                            minWidth: 100, flexShrink: 0,
                                            "&.Mui-disabled": { opacity: 0.45 },
                                        }}
                                    >
                                        {joining === team.id
                                            ? <CircularProgress size={16} sx={{ color: "#fff" }} />
                                            : "Request to Join"
                                        }
                                    </Button>
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    );
}