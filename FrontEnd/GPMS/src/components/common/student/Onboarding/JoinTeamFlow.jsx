import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import {
    Dialog, DialogContent,
    Box, Typography, Button, Stack,
    CircularProgress, IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import studentApi from "../../../../api/handler/endpoints/studentApi";

const ACCENT = "#d0895b";
const ACCENT_LIGHT = "#faeeda";
const ACCENT_BORDER = "#fac775";
const ACCENT_TEXT = "#854f0b";

const AVATAR_PALETTES = [
    { bg: "#faeeda", color: "#854f0b" },
    { bg: "#e1f5ee", color: "#0f6e56" },
    { bg: "#eeedfe", color: "#3c3489" },
    { bg: "#fbeaf0", color: "#72243e" },
    { bg: "#e6f1fb", color: "#0c447c" },
];

function MemberChip({ name, index }) {
    const palette = AVATAR_PALETTES[index % AVATAR_PALETTES.length];
    const initial = (name ?? "?").trim().charAt(0).toUpperCase();
    return (
        <Box sx={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            fontSize: "0.75rem", px: 1, py: "3px",
            borderRadius: "20px",
            border: "0.5px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            color: "text.secondary",
            whiteSpace: "nowrap",
        }}>
            <Box sx={{
                width: 20, height: 20, borderRadius: "50%",
                bgcolor: palette.bg, color: palette.color,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.68rem", fontWeight: 700, flexShrink: 0,
            }}>
                {initial}
            </Box>
            {name}
        </Box>
    );
}

function TeamCard({ team, joining, onJoin }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const cardBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
    const hoverBg = isDark ? "rgba(208,137,91,0.10)" : "rgba(208,137,91,0.07)";

    const total = (team.membersCount ?? 0) + (team.remainingSlots ?? 0);
    const isFull = (team.remainingSlots ?? 0) === 0;
    const isJoining = joining === team.id;

    return (
        <Box sx={{
            border: `0.5px solid ${border}`,
            borderRadius: 2.5, p: "14px 16px",
            bgcolor: cardBg,
            transition: "border-color 0.15s, background 0.15s",
            "&:hover": { borderColor: ACCENT, bgcolor: hoverBg },
        }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1.5}>

                {/* Left content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>

                    {/* Title + badge + slots */}
                    <Stack direction="row" alignItems="center" gap={0.8} flexWrap="wrap" mb={0.4}>
                        <Typography fontWeight={500} fontSize="0.875rem" color="text.primary">
                            {team.projectTitle ?? "Team"}
                        </Typography>
                        <Box sx={{
                            px: "7px", py: "1px", borderRadius: "20px",
                            bgcolor: ACCENT_LIGHT, color: ACCENT_TEXT,
                            border: `0.5px solid ${ACCENT_BORDER}`,
                            fontSize: "0.68rem", fontWeight: 700, flexShrink: 0,
                        }}>
                            {team.membersCount ?? 0} / {total}
                        </Box>
                        {!isFull && (
                            <Typography fontSize="0.68rem" color="text.secondary">
                                · {team.remainingSlots} slot{team.remainingSlots !== 1 ? "s" : ""} left
                            </Typography>
                        )}
                        {isFull && (
                            <Typography fontSize="0.68rem" color="error.main">· Full</Typography>
                        )}
                    </Stack>

                    {/* Supervisor */}
                    <Typography fontSize="0.75rem" color="text.secondary" mb={team.projectDescription ? 0.5 : 1}>
                        Supervisor: {team.supervisorName ?? "—"}
                    </Typography>

                    {/* Description */}
                    {!!team.projectDescription && (
                        <Typography fontSize="0.75rem" color="text.secondary" mb={1} sx={{
                            lineHeight: 1.55, opacity: 0.85,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}>
                            {team.projectDescription}
                        </Typography>
                    )}

                    {/* Member chips */}
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                        {(team.memberNames ?? []).map((name, i) => (
                            <MemberChip key={i} name={name} index={i} />
                        ))}
                    </Box>
                </Box>

                {/* Join button */}
                <Button
                    variant="contained"
                    size="small"
                    disabled={isJoining || isFull}
                    onClick={() => onJoin(team.id)}
                    sx={{
                        bgcolor: ACCENT,
                        "&:hover": { bgcolor: "#be7a4f", boxShadow: "none" },
                        borderRadius: 2, px: 2,
                        textTransform: "none", fontWeight: 500,
                        fontSize: "0.8rem", boxShadow: "none",
                        minWidth: 110, flexShrink: 0,
                        alignSelf: "center",
                        whiteSpace: "nowrap",
                        "&.Mui-disabled": { opacity: 0.45 },
                    }}
                >
                    {isJoining
                        ? <CircularProgress size={15} sx={{ color: "#fff" }} />
                        : isFull ? "Full" : "Request to Join"
                    }
                </Button>
            </Stack>
        </Box>
    );
}

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
        setError("");
        studentApi.getAvailableTeams()
            .then((d) => setTeams(Array.isArray(d) ? d : []))
            .catch(() => setError("Failed to load available teams"))
            .finally(() => setLoading(false));
    }, [open]);

    const handleJoin = async (teamId) => {
        setJoining(teamId);
        setError("");
        try {
            const res = await studentApi.requestToJoin(teamId);
            if (res?.success !== false) {
                onSuccess?.("Join request sent! Waiting for team leader approval.");
                onClose();
            } else {
                setError(res?.message ?? "request already sent , please wait for response");
            }
        } catch (e) {
            setError(e?.response?.data?.message ?? "Unable to connect to server");
        } finally {
            setJoining(null);
        }
    };

    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";

    return (
        <Dialog
            open={open}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3, overflow: "hidden",
                    border: `0.5px solid ${border}`,
                    bgcolor: "background.paper",
                    boxShadow: isDark
                        ? "0 20px 60px rgba(0,0,0,0.55)"
                        : "0 20px 60px rgba(0,0,0,0.10)",
                },
            }}
        >
            {/* Header */}
            <Box sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                px: 2.5, py: 2, borderBottom: `0.5px solid ${border}`,
            }}>
                <Stack direction="row" alignItems="center" gap={1.5}>
                    <Box sx={{
                        width: 34, height: 34, borderRadius: 2, flexShrink: 0,
                        bgcolor: ACCENT_LIGHT, border: `0.5px solid ${ACCENT_BORDER}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <PeopleOutlineIcon sx={{ fontSize: 17, color: ACCENT_TEXT }} />
                    </Box>
                    <Box>
                        <Typography fontWeight={500} fontSize="0.9rem" color="text.primary">
                            Available Teams
                        </Typography>
                        <Typography fontSize="0.72rem" color="text.secondary">
                            Send a request to join a team
                        </Typography>
                    </Box>
                </Stack>
                <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
                    <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Box>

            {/* Body */}
            <DialogContent sx={{ px: 2.5, py: 2 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" py={6}>
                        <CircularProgress size={26} sx={{ color: ACCENT }} />
                    </Box>
                ) : teams.length === 0 ? (
                    <Box textAlign="center" py={6}>
                        <Box sx={{
                            width: 48, height: 48, borderRadius: 2.5, mx: "auto", mb: 1.5,
                            bgcolor: ACCENT_LIGHT, border: `0.5px solid ${ACCENT_BORDER}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <PeopleOutlineIcon sx={{ fontSize: 22, color: ACCENT_TEXT }} />
                        </Box>
                        <Typography fontWeight={500} fontSize="0.875rem" color="text.primary">
                            No teams available
                        </Typography>
                        <Typography fontSize="0.78rem" color="text.secondary" mt={0.4}>
                            Check back later or create your own team
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={1.2}>
                        {error && (
                            <Typography fontSize="0.75rem" color="error.main">{error}</Typography>
                        )}
                        {teams.map((team) => (
                            <TeamCard
                                key={team.id}
                                team={team}
                                joining={joining}
                                onJoin={handleJoin}
                            />
                        ))}
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    );
}