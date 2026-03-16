import { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, TextField, Button, Stack,
    Avatar, CircularProgress, IconButton,
    Stepper, Step, StepLabel, Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../../../../contexts/AuthContext";
import studentApi from "../../../../api/handler/endpoints/studentApi";

const STEPS = ["Select Supervisor", "Team Details", "Review & Submit"];

export default function CreateTeamFlow({ open, onClose, onSuccess }) {
    const { updateUser } = useAuth();
    const [step, setStep] = useState(0);
    const [supervisors, setSupervisors] = useState([]);
    const [loadingSups, setLoadingSups] = useState(false);
    const [selectedSup, setSelectedSup] = useState(null);
    const [projectTitle, setProjectTitle] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;
        setLoadingSups(true);
        studentApi.getSupervisors()
            .then((data) => setSupervisors(Array.isArray(data) ? data : []))
            .catch(() => setError("Failed to load supervisors list"))
            .finally(() => setLoadingSups(false));
    }, [open]);

    const handleReset = () => {
        setStep(0); setSelectedSup(null);
        setProjectTitle(""); setError("");
    };

    const handleClose = () => { handleReset(); onClose(); };

    const handleSubmit = async () => {
        if (!selectedSup || !projectTitle.trim()) return;
        setSubmitting(true); setError("");
        try {
            const res = await studentApi.createTeam({
                projectTitle: projectTitle.trim(),
                supervisorId: selectedSup.id,
                studentIds: [],
            });
            if (res?.teamId || res?.id || res?.success !== false) {
                updateUser({ teamId: res?.teamId ?? res?.id ?? "pending" });
                handleReset();
                onSuccess?.("Team request sent successfully! Waiting for supervisor approval.");
            } else {
                setError(res?.message ?? "Something went wrong, please try again.");
            }
        } catch (e) {
            setError(e?.response?.data?.message ?? "Unable to connect to server");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 4 } }}>

            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
                <Typography fontWeight={700}>Create a New Team</Typography>
                <IconButton size="small" onClick={handleClose}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <Box sx={{ px: 3, pb: 1 }}>
                <Stepper activeStep={step} alternativeLabel>
                    {STEPS.map((label) => (
                        <Step key={label}>
                            <StepLabel sx={{
                                "& .MuiStepLabel-label": { fontSize: "0.75rem" },
                                "& .MuiStepIcon-root.Mui-active": { color: "#C47E7E" },
                                "& .MuiStepIcon-root.Mui-completed": { color: "#C47E7E" },
                            }}>
                                {label}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>

            <DialogContent sx={{ pt: 2 }}>

                {/* Step 0 - Select Supervisor */}
                {step === 0 && (
                    <Box>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            Select the supervisor responsible for your team
                        </Typography>
                        {loadingSups ? (
                            <Box display="flex" justifyContent="center" py={4}>
                                <CircularProgress size={32} sx={{ color: "#C47E7E" }} />
                            </Box>
                        ) : (
                            <Stack spacing={1.5}>
                                {supervisors.map((sup) => (
                                    <Box key={sup.id} onClick={() => setSelectedSup(sup)} sx={{
                                        border: "2px solid",
                                        borderColor: selectedSup?.id === sup.id ? "#C47E7E" : "divider",
                                        borderRadius: 3, p: 2, cursor: "pointer",
                                        bgcolor: selectedSup?.id === sup.id ? "#C47E7E0D" : "transparent",
                                        transition: "all .2s",
                                        "&:hover": { borderColor: "#C47E7E" },
                                    }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ bgcolor: "#6D8A7D", width: 40, height: 40 }}>
                                                {(sup.name ?? sup.fullName ?? "S").charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography fontWeight={600} fontSize="0.9rem">
                                                    {sup.name ?? sup.fullName ?? "Supervisor"}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {sup.department ?? sup.title ?? ""}
                                                </Typography>
                                            </Box>
                                            {selectedSup?.id === sup.id && (
                                                <Chip label="Selected" size="small"
                                                    sx={{ ml: "auto", bgcolor: "#C47E7E", color: "#fff", fontSize: "0.7rem" }} />
                                            )}
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Box>
                )}

                {/* Step 1 - Team Details */}
                {step === 1 && (
                    <Stack spacing={2.5}>
                        <TextField
                            label="Project Title"
                            fullWidth
                            value={projectTitle}
                            onChange={(e) => setProjectTitle(e.target.value)}
                            placeholder="e.g. Smart Graduation Management System"
                            sx={{
                                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#C47E7E",
                                },
                            }}
                        />
                        <Typography variant="caption" color="text.secondary">
                            You can invite team members after the supervisor approves your request.
                        </Typography>
                    </Stack>
                )}

                {/* Step 2 - Review */}
                {step === 2 && (
                    <Stack spacing={2}>
                        <Box sx={{ bgcolor: "action.hover", borderRadius: 3, p: 2.5 }}>
                            <Typography variant="caption" color="text.secondary"
                                textTransform="uppercase" letterSpacing={1}>
                                Supervisor
                            </Typography>
                            <Typography fontWeight={600} mt={0.5}>
                                {selectedSup?.name ?? selectedSup?.fullName}
                            </Typography>
                        </Box>
                        <Box sx={{ bgcolor: "action.hover", borderRadius: 3, p: 2.5 }}>
                            <Typography variant="caption" color="text.secondary"
                                textTransform="uppercase" letterSpacing={1}>
                                Project Title
                            </Typography>
                            <Typography fontWeight={600} mt={0.5}>{projectTitle}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            A team creation request will be sent to the supervisor. You will be notified upon approval.
                        </Typography>
                        {error && <Typography color="error" variant="caption">{error}</Typography>}
                    </Stack>
                )}

            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                {step > 0 && (
                    <Button onClick={() => setStep((s) => s - 1)} sx={{ color: "text.secondary" }}>
                        Back
                    </Button>
                )}
                <Box sx={{ flexGrow: 1 }} />
                {step < 2 ? (
                    <Button variant="contained"
                        disabled={step === 0 ? !selectedSup : !projectTitle.trim()}
                        onClick={() => setStep((s) => s + 1)}
                        sx={{ bgcolor: "#C47E7E", "&:hover": { bgcolor: "#b06b6b" }, borderRadius: 2, px: 3 }}>
                        Next
                    </Button>
                ) : (
                    <Button variant="contained" disabled={submitting} onClick={handleSubmit}
                        sx={{ bgcolor: "#C47E7E", "&:hover": { bgcolor: "#b06b6b" }, borderRadius: 2, px: 3 }}>
                        {submitting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Submit Request"}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}