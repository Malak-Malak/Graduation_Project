import {
    Dialog, DialogTitle, DialogContent,
    Box, Typography, Stack, IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import AddBusinessOutlinedIcon from "@mui/icons-material/AddBusinessOutlined";

export default function JoinOrCreateModal({ open, onClose, onCreate, onJoin }) {
    return (
        <Dialog open={open} maxWidth="xs" fullWidth
            PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>

            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography fontWeight={702}>What would you like to do?</Typography>
                <IconButton size="small" onClick={onClose}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} py={1}>

                    <Box onClick={onCreate} sx={{
                        border: "2px solid #C47E7E", borderRadius: 3, p: 2.5,
                        cursor: "pointer", transition: "all .2s",
                        "&:hover": { bgcolor: "#C47E7E11" },
                    }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{
                                width: 44, height: 44, borderRadius: 2, bgcolor: "#C47E7E22",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <AddBusinessOutlinedIcon sx={{ color: "#C47E7E" }} />
                            </Box>
                            <Box>
                                <Typography fontWeight={600}>Create a New Team</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Choose a supervisor and start your project
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    <Box onClick={onJoin} sx={{
                        border: "2px solid", borderColor: "divider",
                        borderRadius: 3, p: 2.5, cursor: "pointer", transition: "all .2s",
                        "&:hover": { borderColor: "#C47E7E", bgcolor: "#C47E7E08" },
                    }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{
                                width: 44, height: 44, borderRadius: 2, bgcolor: "action.hover",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <GroupAddOutlinedIcon sx={{ color: "text.secondary" }} />
                            </Box>
                            <Box>
                                <Typography fontWeight={600}>Join an Existing Team</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Browse available teams and send a join request
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                </Stack>
            </DialogContent>
        </Dialog>
    );
}