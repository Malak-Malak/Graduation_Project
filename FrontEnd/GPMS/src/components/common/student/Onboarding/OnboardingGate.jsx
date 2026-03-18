import { useTheme } from "@mui/material/styles";
import {
    Dialog, DialogContent, Box, Typography,
    Button, Stack,
} from "@mui/material";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SkipNextOutlinedIcon from "@mui/icons-material/SkipNextOutlined";

export default function OnboardingGate({ open, onCreateOrJoin, onSkip }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const accent = "#d0895b";
    const a10 = isDark ? "rgba(208,137,91,0.10)" : "rgba(208,137,91,0.07)";
    const a22 = "rgba(208,137,91,0.22)";
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const paperBg = theme.palette.background.paper;
    const textPri = theme.palette.text.primary;
    const textSec = theme.palette.text.secondary;

    return (
        <Dialog
            open={open}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    border: `1px solid ${border}`,
                    bgcolor: paperBg,
                    boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.55)" : "0 20px 60px rgba(0,0,0,0.10)",
                    overflow: "hidden",
                }
            }}
        >
            {/* thin accent top bar */}
            <Box sx={{ height: 3, bgcolor: accent }} />

            <DialogContent sx={{ px: 3.5, py: 3.5 }}>
                <Stack spacing={3} alignItems="center" textAlign="center">

                    {/* icon */}
                    <Box sx={{
                        width: 64, height: 64, borderRadius: 3,
                        bgcolor: a10, border: `1px solid ${a22}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <GroupsOutlinedIcon sx={{ fontSize: 30, color: accent }} />
                    </Box>

                    {/* text */}
                    <Box>
                        <Typography fontWeight={700} fontSize="1rem" sx={{ color: textPri }}>
                            You're not in a team yet
                        </Typography>
                        <Typography fontSize="0.82rem" sx={{ color: textSec, mt: 0.6, lineHeight: 1.6 }}>
                            Create a new team or join an existing one to get started with your project.
                        </Typography>
                    </Box>

                    {/* actions */}
                    <Stack spacing={1.2} width="100%">
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={onCreateOrJoin}
                            sx={{
                                bgcolor: accent,
                                "&:hover": { bgcolor: "#be7a4f", boxShadow: "none" },
                                borderRadius: 2, py: 1.2,
                                fontWeight: 700, fontSize: "0.875rem",
                                textTransform: "none", boxShadow: "none",
                            }}
                        >
                            Create or Join a Team
                        </Button>
                        <Button
                            fullWidth
                            variant="text"
                            startIcon={<SkipNextOutlinedIcon />}
                            onClick={onSkip}
                            sx={{
                                color: textSec,
                                textTransform: "none",
                                fontSize: "0.82rem",
                                fontWeight: 500,
                                borderRadius: 2,
                                "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" },
                            }}
                        >
                            Skip for now
                        </Button>
                    </Stack>

                </Stack>
            </DialogContent>
        </Dialog>
    );
}