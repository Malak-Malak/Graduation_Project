import { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent,
    Box, Typography, Button, Stack,
    Avatar, AvatarGroup, CircularProgress,
    Chip, IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import studentApi from "../../../../api/handler/endpoints/studentApi";

export default function JoinTeamFlow({ open, onClose, onSuccess }) {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [joining, setJoining] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        studentApi.getAvailableTeams()
            .then((data) => setTeams(Array.isArray(data) ? data : []))
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

    return (
        <Dialog open={open} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 4 } }}>

            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography fontWeight={700}>Available Teams</Typography>
                <IconButton size="small" onClick={onClose}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                {loading ? (
                    <Box display="flex" justifyContent="center" py={5}>
                        <CircularProgress size={36} sx={{ color: "#C47E7E" }} />
                    </Box>
                ) : teams.length === 0 ? (
                    <Box textAlign="center" py={5}>
                        <PeopleOutlineIcon sx={{ fontSize: 48, color: "text.disabled" }} />
                        <Typography color="text.secondary" mt={1}>
                            No available teams at the moment
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={2} pt={1}>
                        {error && <Typography color="error" variant="caption">{error}</Typography>}
                        {teams.map((team) => (
                            <Box key={team.id} sx={{
                                border: "1px solid", borderColor: "divider",
                                borderRadius: 3, p: 2.5,
                                transition: "box-shadow .2s",
                                "&:hover": { boxShadow: 2 },
                            }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box sx={{ flex: 1, mr: 2 }}>
                                        <Typography fontWeight={700} fontSize="0.95rem">
                                            {team.projectTitle ?? team.name ?? "Team"}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Supervisor: {team.supervisorName ?? "—"}
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" mt={1.5}>
                                            <AvatarGroup max={4} sx={{
                                                "& .MuiAvatar-root": { width: 28, height: 28, fontSize: "0.75rem" }
                                            }}>
                                                {(team.members ?? []).map((m, i) => (
                                                    <Avatar key={i} sx={{ bgcolor: "#C47E7E" }}>
                                                        {(m.name ?? m.username ?? "?").charAt(0).toUpperCase()}
                                                    </Avatar>
                                                ))}
                                            </AvatarGroup>
                                            <Chip
                                                label={`${team.currentCount ?? team.members?.length ?? 0} / ${team.maxSize ?? 4}`}
                                                size="small"
                                                icon={<PeopleOutlineIcon sx={{ fontSize: "14px !important" }} />}
                                                sx={{ fontSize: "0.72rem" }}
                                            />
                                        </Stack>
                                    </Box>
                                    <Button variant="contained" size="small"
                                        disabled={joining === team.id}
                                        onClick={() => handleJoin(team.id)}
                                        sx={{
                                            bgcolor: "#C47E7E", "&:hover": { bgcolor: "#b06b6b" },
                                            borderRadius: 2, px: 2, alignSelf: "center", minWidth: 90,
                                        }}>
                                        {joining === team.id
                                            ? <CircularProgress size={16} sx={{ color: "#fff" }} />
                                            : "Request to Join"}
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