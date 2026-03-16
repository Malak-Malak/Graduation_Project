import {
    Dialog, DialogContent, Box, Typography,
    Button, Stack,
} from "@mui/material";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SkipNextOutlinedIcon from "@mui/icons-material/SkipNextOutlined";

export default function OnboardingGate({ open, onCreateOrJoin, onSkip }) {
    return (
        <Dialog open={open} maxWidth="xs" fullWidth
            PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
            <DialogContent>
                <Stack spacing={3} alignItems="center" textAlign="center" py={2}>

                    <Box sx={{
                        width: 72, height: 72, borderRadius: "50%",
                        bgcolor: "#C47E7E22",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <GroupsOutlinedIcon sx={{ fontSize: 36, color: "#C47E7E" }} />
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={700}>
                            Are you registered in a team?
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                            No team found for your account. Create a new team or join an existing one.
                        </Typography>
                    </Box>

                    <Button fullWidth variant="contained"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={onCreateOrJoin}
                        sx={{ bgcolor: "#C47E7E", borderRadius: 2, py: 1.3, fontWeight: 600, "&:hover": { bgcolor: "#b06b6b" } }}>
                        Create or Join a Team
                    </Button>

                    <Button fullWidth variant="text"
                        startIcon={<SkipNextOutlinedIcon />}
                        onClick={onSkip}
                        sx={{ color: "text.secondary" }}>
                        Skip for now
                    </Button>

                </Stack>
            </DialogContent>
        </Dialog>
    );
}