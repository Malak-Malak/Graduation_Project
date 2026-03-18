import { useTheme } from "@mui/material/styles";
import {
    Dialog, DialogContent,
    Box, Typography, Stack, IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import AddBusinessOutlinedIcon from "@mui/icons-material/AddBusinessOutlined";

export default function JoinOrCreateModal({ open, onClose, onCreate, onJoin }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const accent = "#d0895b";
    const a10 = isDark ? "rgba(208,137,91,0.10)" : "rgba(208,137,91,0.07)";
    const a18 = "rgba(208,137,91,0.18)";
    const a22 = "rgba(208,137,91,0.22)";
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const paperBg = theme.palette.background.paper;
    const textPri = theme.palette.text.primary;
    const textSec = theme.palette.text.secondary;

    const OptionCard = ({ icon: Icon, iconColor, title, desc, onClick, highlighted }) => (
        <Box
            onClick={onClick}
            sx={{
                border: `1.5px solid ${highlighted ? accent : border}`,
                borderRadius: 2.5, p: 2.5,
                cursor: "pointer",
                transition: "all 0.15s ease",
                bgcolor: highlighted ? a10 : "transparent",
                "&:hover": {
                    borderColor: accent,
                    bgcolor: a10,
                },
            }}
        >
            <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{
                    width: 42, height: 42, borderRadius: 2, flexShrink: 0,
                    bgcolor: highlighted ? a18 : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                    border: `1px solid ${highlighted ? a22 : border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Icon sx={{ fontSize: 20, color: highlighted ? accent : textSec }} />
                </Box>
                <Box>
                    <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: textPri }}>
                        {title}
                    </Typography>
                    <Typography fontSize="0.78rem" sx={{ color: textSec, mt: 0.2 }}>
                        {desc}
                    </Typography>
                </Box>
            </Stack>
        </Box>
    );

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
                }
            }}
        >
            {/* header */}
            <Box sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                px: 3, py: 2.5, borderBottom: `1px solid ${border}`,
            }}>
                <Box>
                    <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: textPri }}>
                        Get Started
                    </Typography>
                    <Typography fontSize="0.76rem" sx={{ color: textSec, mt: 0.2 }}>
                        What would you like to do?
                    </Typography>
                </Box>
                <IconButton size="small" onClick={onClose} sx={{ color: textSec }}>
                    <CloseIcon sx={{ fontSize: 17 }} />
                </IconButton>
            </Box>

            <DialogContent sx={{ px: 3, py: 2.5 }}>
                <Stack spacing={1.5}>
                    <OptionCard
                        icon={AddBusinessOutlinedIcon}
                        title="Create a New Team"
                        desc="Choose a supervisor and start your project"
                        onClick={onCreate}
                        highlighted
                    />
                    <OptionCard
                        icon={GroupAddOutlinedIcon}
                        title="Join an Existing Team"
                        desc="Browse available teams and send a join request"
                        onClick={onJoin}
                    />
                </Stack>
            </DialogContent>
        </Dialog>
    );
}