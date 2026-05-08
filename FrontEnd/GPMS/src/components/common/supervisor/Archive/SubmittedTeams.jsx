import { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Stack, Paper, Button, CircularProgress,
    Alert, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, Snackbar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";

import archiveApi from "../../../../api/handler/endpoints/archiveApi";

const ACCENT = "#6D8A7D";
const PALETTE = ["#C97B4B", "#5B8FA8", "#6D8A7D", "#9B7EC8", "#A85B6D", "#7A9E5B"];
const ini = (n = "") =>
    (n ?? "").split(" ").map((w) => w[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";
const palette = (i) => PALETTE[i % PALETTE.length];

// ── Team Card ─────────────────────────────────────────────────────────────────
function SubmittedTeamCard({ team, accentColor, isDark, t, border, onSendToArchive, sending }) {
    const cardBg = isDark ? "rgba(255,255,255,0.025)" : "#fff";
    const versionLabel = team.version === 0 ? "Phase 1" : "Phase 2";

    return (
        <Paper elevation={0} sx={{
            borderRadius: 2.5,
            bgcolor: cardBg,
            border: `1px solid ${border}`,
            borderLeft: `3px solid ${accentColor}`,
            overflow: "hidden",
            transition: "box-shadow 0.15s",
            "&:hover": {
                boxShadow: isDark
                    ? "0 4px 20px rgba(0,0,0,0.25)"
                    : "0 4px 16px rgba(0,0,0,0.07)",
            },
        }}>
            {/* Top strip */}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                    px: 2, py: 1,
                    borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
                    bgcolor: isDark ? "rgba(255,255,255,0.02)" : `${accentColor}06`,
                }}
            >
                <Stack direction="row" alignItems="center" gap={1}>
                    <Box sx={{
                        width: 28, height: 28, borderRadius: 1.5,
                        bgcolor: `${accentColor}15`,
                        border: `1px solid ${accentColor}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.65rem", fontWeight: 700, color: accentColor,
                    }}>
                        {ini(team.projectName)}
                    </Box>
                    <Typography sx={{
                        fontWeight: 700, fontSize: "0.9rem",
                        color: t.textPrimary,
                    }}>
                        {team.projectName}
                    </Typography>
                </Stack>

                <Chip
                    label={versionLabel}
                    size="small"
                    sx={{
                        bgcolor: `${accentColor}12`,
                        color: accentColor,
                        border: `1px solid ${accentColor}25`,
                        fontWeight: 700, fontSize: "0.67rem", borderRadius: 1,
                    }}
                />
            </Stack>

            {/* Body */}
            <Box sx={{ px: 2.5, pt: 1.5, pb: 2 }}>
                {/* Description */}
                {team.projectDescription && (
                    <Typography sx={{
                        fontSize: "0.8rem", color: t.textSecondary,
                        lineHeight: 1.7, mb: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}>
                        {team.projectDescription}
                    </Typography>
                )}

                {/* GitHub */}
                {team.githubRepo && (
                    <Stack direction="row" alignItems="center" gap={0.8} mb={1.5}>
                        <GitHubIcon sx={{
                            fontSize: 13,
                            color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
                        }} />
                        <Typography
                            component="a"
                            href={team.githubRepo}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                fontSize: "0.75rem",
                                color: accentColor,
                                textDecoration: "none",
                                fontWeight: 600,
                                "&:hover": { textDecoration: "underline" },
                            }}
                        >
                            {team.githubRepo.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
                        </Typography>
                    </Stack>
                )}

                {/* Members */}
                {team.memberNames?.length > 0 && (
                    <Box mb={2}>
                        <Typography sx={{
                            fontSize: "0.65rem", fontWeight: 700,
                            textTransform: "uppercase", letterSpacing: "0.05em",
                            color: t.textSecondary, mb: 0.8,
                        }}>
                            Members ({team.memberNames.length})
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={0.7}>
                            {team.memberNames.map((name, i) => (
                                <Stack
                                    key={i}
                                    direction="row"
                                    alignItems="center"
                                    gap={0.6}
                                    sx={{
                                        px: 1, py: 0.3,
                                        borderRadius: 1.5,
                                        bgcolor: isDark
                                            ? "rgba(255,255,255,0.04)"
                                            : "rgba(0,0,0,0.03)",
                                        border: `1px solid ${border}`,
                                    }}
                                >
                                    <Box sx={{
                                        width: 18, height: 18, borderRadius: 0.8,
                                        bgcolor: palette(i),
                                        display: "flex", alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.55rem", fontWeight: 700, color: "#fff",
                                        flexShrink: 0,
                                    }}>
                                        {ini(name)}
                                    </Box>
                                    <Typography sx={{
                                        fontSize: "0.72rem",
                                        fontWeight: 500,
                                        color: t.textPrimary,
                                    }}>
                                        {name}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </Box>
                )}

                {/* Send to Archive button */}
                <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    startIcon={
                        sending
                            ? <CircularProgress size={13} color="inherit" />
                            : <ArchiveOutlinedIcon />
                    }
                    onClick={() => onSendToArchive(team)}
                    disabled={sending}
                    sx={{
                        bgcolor: accentColor, borderRadius: 2,
                        boxShadow: "none", fontWeight: 600,
                        fontSize: "0.82rem",
                        "&:hover": {
                            bgcolor: accentColor,
                            filter: "brightness(0.92)",
                            boxShadow: "none",
                        },
                        "&.Mui-disabled": { opacity: 0.5 },
                    }}
                >
                    {sending ? "Sending…" : "Send to Archive"}
                </Button>
            </Box>
        </Paper>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SubmittedTeams() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const t = theme.palette.custom ?? {};
    const accentColor = t.accentPrimary ?? ACCENT;

    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sendingId, setSendingId] = useState(null);
    const [confirmTeam, setConfirmTeam] = useState(null);
    const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const paperBg = theme.palette.background.paper;
    const snap = (msg, sev = "success") => setSnack({ open: true, msg, sev });

    const fetchTeams = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await archiveApi.getSubmittedTeams();
            setTeams(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(
                err?.response?.data?.message ??
                "Failed to load submitted teams."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTeams(); }, [fetchTeams]);

    const handleSendToArchive = async () => {
        if (!confirmTeam) return;
        const { teamId, version } = confirmTeam;
        setConfirmTeam(null);
        setSendingId(teamId);
        try {
            await archiveApi.sendToArchive(teamId, version);
            setTeams((prev) => prev.filter((t) => t.teamId !== teamId));
            snap("Project successfully archived!", "success");
        } catch (err) {
            snap(
                err?.response?.data?.message ??
                "Could not archive project. Please try again.",
                "error"
            );
        } finally {
            setSendingId(null);
        }
    };

    return (
        <Box sx={{ width: "100%", mx: "auto" }}>
            {/* Header */}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                mb={3}
            >
                <Box>
                    <Stack direction="row" alignItems="center" gap={1.2} mb={0.5}>
                        <Box sx={{
                            width: 32, height: 32, borderRadius: 1.5,
                            bgcolor: `${accentColor}15`,
                            border: `1px solid ${accentColor}30`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <InventoryOutlinedIcon sx={{ fontSize: 17, color: accentColor }} />
                        </Box>
                        <Typography variant="h2" sx={{ color: t.textPrimary, fontWeight: 700 }}>
                            Submitted Projects
                        </Typography>
                    </Stack>
                    <Typography sx={{
                        color: t.textSecondary, fontSize: "0.83rem", pl: "44px",
                    }}>
                        Review and archive completed graduation projects
                    </Typography>
                </Box>

                {!loading && (
                    <Chip
                        label={`${teams.length} pending`}
                        size="small"
                        sx={{
                            bgcolor: teams.length > 0 ? `${accentColor}12` : "transparent",
                            color: teams.length > 0 ? accentColor : t.textSecondary,
                            border: `1px solid ${teams.length > 0 ? accentColor + "30" : border}`,
                            fontWeight: 700, fontSize: "0.72rem",
                        }}
                    />
                )}
            </Stack>

            {/* Loading */}
            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress sx={{ color: accentColor }} size={28} />
                </Box>
            )}

            {/* Error */}
            {!loading && error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
            )}

            {/* Empty state */}
            {!loading && !error && teams.length === 0 && (
                <Box sx={{
                    textAlign: "center", py: 8,
                    border: `1.5px dashed ${accentColor}30`,
                    borderRadius: 3,
                    bgcolor: `${accentColor}04`,
                }}>
                    <Box sx={{
                        width: 52, height: 52, borderRadius: 3,
                        bgcolor: `${accentColor}12`,
                        border: `1px solid ${accentColor}25`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        mx: "auto", mb: 2,
                    }}>
                        <GroupsOutlinedIcon sx={{ fontSize: 26, color: accentColor }} />
                    </Box>
                    <Typography sx={{
                        color: t.textPrimary, fontWeight: 600,
                        fontSize: "0.9rem", mb: 0.5,
                    }}>
                        No submitted projects
                    </Typography>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.8rem" }}>
                        Teams that submit their project will appear here for your review
                    </Typography>
                </Box>
            )}

            {/* Team cards grid */}
            {!loading && !error && teams.length > 0 && (
                <Box sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "1fr 1fr",
                        md: "1fr 1fr 1fr",
                    },
                    gap: 2,
                }}>
                    {teams.map((team) => (
                        <SubmittedTeamCard
                            key={team.teamId}
                            team={team}
                            accentColor={accentColor}
                            isDark={isDark}
                            t={t}
                            border={border}
                            onSendToArchive={(tm) => setConfirmTeam(tm)}
                            sending={sendingId === team.teamId}
                        />
                    ))}
                </Box>
            )}

            {/* Confirm Dialog */}
            <Dialog
                open={Boolean(confirmTeam)}
                onClose={() => setConfirmTeam(null)}
                maxWidth="xs" fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        border: `1px solid ${border}`,
                        bgcolor: paperBg,
                        boxShadow: isDark
                            ? "0 20px 60px rgba(0,0,0,0.5)"
                            : "0 20px 40px rgba(0,0,0,0.10)",
                    },
                }}
            >
                <Box sx={{ height: 3, bgcolor: accentColor }} />
                <DialogTitle sx={{
                    fontWeight: 700, fontSize: "0.95rem",
                    color: t.textPrimary, pb: 0.5,
                }}>
                    <Stack direction="row" alignItems="center" gap={1.2}>
                        <Box sx={{
                            width: 28, height: 28, borderRadius: 1.5,
                            bgcolor: `${accentColor}15`,
                            border: `1px solid ${accentColor}30`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <ArchiveOutlinedIcon sx={{ fontSize: 15, color: accentColor }} />
                        </Box>
                        Send to Archive
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Typography sx={{
                        fontSize: "0.82rem",
                        color: t.textSecondary,
                        lineHeight: 1.7,
                    }}>
                        Are you sure you want to archive{" "}
                        <strong style={{ color: "inherit" }}>
                            {confirmTeam?.projectName}
                        </strong>
                        ? This will make the project publicly visible and will delete all tasks,
                        feedback, and appointments. Team members will be notified.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button
                        onClick={() => setConfirmTeam(null)}
                        sx={{
                            color: t.textSecondary,
                            textTransform: "none",
                            borderRadius: 2,
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSendToArchive}
                        startIcon={<CheckOutlinedIcon />}
                        sx={{
                            bgcolor: accentColor, borderRadius: 2,
                            boxShadow: "none", textTransform: "none", fontWeight: 600,
                            "&:hover": {
                                bgcolor: accentColor,
                                filter: "brightness(0.92)",
                                boxShadow: "none",
                            },
                        }}
                    >
                        Yes, Archive
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snack.open}
                autoHideDuration={3500}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    severity={snack.sev}
                    variant="filled"
                    sx={{ borderRadius: 2, fontSize: "0.82rem" }}
                >
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}