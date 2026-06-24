// src/components/common/supervisor/Groups/DescriptionModal.jsx

import { Dialog, Box, Typography, Stack, Button, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon        from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const PALETTE = ["#C97B4B", "#5B8FA8", "#6D8A7D", "#9B7EC8", "#A85B6D", "#7A9E5B"];
const ini = (n = "") =>
    (n ?? "").split(" ").map((w) => w[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";
const palette = (i) => PALETTE[i % PALETTE.length];

export default function DescriptionModal({ open, group, onClose }) {
    const theme  = useTheme();
    const isDark = theme.palette.mode === "dark";
    const border   = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const dialogBg = isDark ? "#252930" : "#ffffff";
    const tPri     = theme.palette.text.primary;
    const tSec     = theme.palette.text.secondary;

    if (!group) return null;

    const colorIdx = Math.abs((group.id ?? 0) + ((group.projectTitle ?? group.name ?? "").charCodeAt(0) || 0)) % PALETTE.length;
    const aClr = palette(colorIdx);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "16px",
                    border: `1px solid ${border}`,
                    bgcolor: dialogBg,
                    backgroundImage: "none",
                    overflow: "hidden",
                },
            }}
        >
            {/* Color top bar */}
            <Box sx={{ height: 4, bgcolor: aClr }} />

            {/* Header */}
            <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${border}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction="row" alignItems="center" gap={1.5}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: "10px",
                            background: `linear-gradient(145deg, ${aClr}, ${aClr}bb)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.82rem", fontWeight: 800, color: "#fff",
                            flexShrink: 0,
                        }}>
                            {ini(group.projectTitle ?? group.name)}
                        </Box>
                        <Box>
                            <Typography fontWeight={800} fontSize="0.95rem" sx={{ color: tPri }}>
                                {group.projectTitle ?? group.name ?? "Project"}
                            </Typography>
                            {group.teamName && group.teamName !== (group.projectTitle ?? group.name) && (
                                <Typography fontSize="0.72rem" sx={{ color: tSec, mt: 0.1 }}>
                                    {group.teamName}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                    <IconButton size="small" onClick={onClose} sx={{ color: tSec, mt: -0.5 }}>
                        <CloseIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                </Stack>
            </Box>

            {/* Content */}
            <Box sx={{ px: 3, py: 2.5 }}>
                <Typography sx={{
                    fontSize: "0.66rem", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.08em", color: tSec, mb: 1,
                }}>
                    Description
                </Typography>
                {group.projectDescription ? (
                    <Typography sx={{ fontSize: "0.84rem", color: tPri, lineHeight: 1.7 }}>
                        {group.projectDescription}
                    </Typography>
                ) : (
                    <Box sx={{
                        py: 4, textAlign: "center",
                        border: `1.5px dashed ${aClr}25`, borderRadius: 2, bgcolor: `${aClr}04`,
                    }}>
                        <InfoOutlinedIcon sx={{ fontSize: 24, color: aClr, opacity: 0.4, mb: 1 }} />
                        <Typography sx={{ fontSize: "0.82rem", color: tSec }}>
                            No description provided.
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Footer */}
            <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${border}`, display: "flex", justifyContent: "flex-end" }}>
                <Button
                    onClick={onClose}
                    sx={{ color: tSec, textTransform: "none", fontWeight: 600, borderRadius: "10px", fontSize: "0.8rem" }}
                >
                    Close
                </Button>
            </Box>
        </Dialog>
    );
}