import { useState } from "react";
import {
    Box, Paper, Typography, Stack, Chip, Button, IconButton, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    MenuItem, Select, FormControl, InputLabel,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import SlideshowOutlinedIcon from "@mui/icons-material/SlideshowOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";

const INIT_FILES = [
    { id: 1, name: "proposal_v3.pdf", type: "pdf", team: "EcoTrackers", uploader: "Aya Abu Ghozeh", size: "2.4 MB", uploaded: "2h ago", status: "pending" },
    { id: 2, name: "system_architecture.png", type: "img", team: "EcoTrackers", uploader: "Malak Malak", size: "3.8 MB", uploaded: "1d ago", status: "pending" },
    { id: 3, name: "midterm_presentation.pptx", type: "pptx", team: "CodeCraft", uploader: "Omar Jawad", size: "8.2 MB", uploaded: "3d ago", status: "pending" },
    { id: 4, name: "database_schema_v2.pdf", type: "pdf", team: "EcoTrackers", uploader: "Sara Ahmad", size: "1.2 MB", uploaded: "3h ago", status: "pending" },
    { id: 5, name: "final_report_draft.docx", type: "docx", team: "InnovateX", uploader: "Yara Hassan", size: "1.9 MB", uploaded: "5d ago", status: "approved" },
    { id: 6, name: "requirements_doc.pdf", type: "pdf", team: "SmartCampus", uploader: "Daoud Issa", size: "0.8 MB", uploaded: "1 week ago", status: "feedback" },
];

const FILE_ICON = {
    pdf: <PictureAsPdfOutlinedIcon />,
    pptx: <SlideshowOutlinedIcon />,
    docx: <DescriptionOutlinedIcon />,
    img: <ImageOutlinedIcon />,
};
const FILE_CLR = { pdf: "#C47E7E", pptx: "#C49A6C", docx: "#7E9FC4", img: "#6D8A7D" };
const STATUS_CLR = { pending: "#C49A6C", approved: "#6D8A7D", feedback: "#B46F4C", rejected: "#C47E7E" };
const STATUS_LBL = { pending: "Pending", approved: "Approved", feedback: "Feedback Sent", rejected: "Rejected" };

export default function FileReview() {
    const theme = useTheme();
    const t = theme.palette.custom;

    const [files, setFiles] = useState(INIT_FILES);
    const [teamFilter, setTeamF] = useState("all");
    const [selected, setSelected] = useState(null);
    const [feedOpen, setFeedOpen] = useState(false);
    const [feedback, setFeedback] = useState("");

    const teams = ["all", ...new Set(INIT_FILES.map((f) => f.team))];

    const filtered = files.filter((f) => teamFilter === "all" || f.team === teamFilter);

    const approve = (id) => setFiles((p) => p.map((f) => f.id === id ? { ...f, status: "approved" } : f));
    const openFeed = (f) => { setSelected(f); setFeedback(""); setFeedOpen(true); };
    const sendFeedback = () => {
        setFiles((p) => p.map((f) => f.id === selected.id ? { ...f, status: "feedback" } : f));
        setFeedOpen(false);
    };

    const pending = filtered.filter((f) => f.status === "pending").length;

    return (
        <Box sx={{ maxWidth: 900 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                    <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>File Review</Typography>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                        {pending} pending · {filtered.length} total files
                    </Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Team</InputLabel>
                    <Select label="Team" value={teamFilter} onChange={(e) => setTeamF(e.target.value)}>
                        {teams.map((team) => <MenuItem key={team} value={team}>{team === "all" ? "All Teams" : team}</MenuItem>)}
                    </Select>
                </FormControl>
            </Stack>

            <Stack spacing={1.5}>
                {filtered.map((f) => (
                    <Paper key={f.id} elevation={1} sx={{
                        p: 2, borderRadius: 3, bgcolor: theme.palette.background.paper,
                        borderLeft: f.status === "pending" ? `3px solid ${t.accentTertiary}` : "none"
                    }}>
                        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" gap={2}>
                            <Stack direction="row" alignItems="center" gap={1.5}>
                                <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${FILE_CLR[f.type]}15`, color: FILE_CLR[f.type], "& svg": { fontSize: 22 } }}>
                                    {FILE_ICON[f.type] ?? <FolderOutlinedIcon />}
                                </Box>
                                <Box>
                                    <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: t.textPrimary }}>{f.name}</Typography>
                                    <Stack direction="row" gap={1} mt={0.2} flexWrap="wrap">
                                        <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>{f.uploader}</Typography>
                                        <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>·</Typography>
                                        <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>{f.team}</Typography>
                                        <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>·</Typography>
                                        <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>{f.size}</Typography>
                                        <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>·</Typography>
                                        <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>{f.uploaded}</Typography>
                                    </Stack>
                                </Box>
                            </Stack>

                            <Stack direction="row" alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
                                <Chip label={STATUS_LBL[f.status]} size="small"
                                    sx={{ bgcolor: `${STATUS_CLR[f.status]}18`, color: STATUS_CLR[f.status], fontWeight: 600, fontSize: "0.7rem", height: 24 }} />

                                {f.status === "pending" && (
                                    <>
                                        <Tooltip title="Approve">
                                            <IconButton size="small" onClick={() => approve(f.id)}
                                                sx={{ color: t.success, "&:hover": { bgcolor: `${t.success}12` } }}>
                                                <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Send Feedback">
                                            <IconButton size="small" onClick={() => openFeed(f)}
                                                sx={{ color: t.accentPrimary, "&:hover": { bgcolor: `${t.accentPrimary}12` } }}>
                                                <CommentOutlinedIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                )}
                                <Tooltip title="Download">
                                    <IconButton size="small" sx={{ color: t.textTertiary, "&:hover": { color: t.accentPrimary } }}>
                                        <DownloadOutlinedIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Stack>
                    </Paper>
                ))}
                {filtered.length === 0 && (
                    <Paper elevation={1} sx={{ p: 4, borderRadius: 3, textAlign: "center", bgcolor: theme.palette.background.paper }}>
                        <Typography sx={{ color: t.textTertiary }}>No files found.</Typography>
                    </Paper>
                )}
            </Stack>

            {/* Feedback dialog */}
            <Dialog open={feedOpen} onClose={() => setFeedOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, color: t.textPrimary }}>Send Feedback</DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: "0.875rem", color: t.textSecondary, mb: 2 }}>
                        File: <strong style={{ color: t.textPrimary }}>{selected?.name}</strong>
                    </Typography>
                    <TextField label="Feedback" multiline rows={4} fullWidth size="small"
                        placeholder="Write your comments or revision requests…"
                        value={feedback} onChange={(e) => setFeedback(e.target.value)} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setFeedOpen(false)} sx={{ color: t.textSecondary }}>Cancel</Button>
                    <Button variant="contained" onClick={sendFeedback} sx={{ bgcolor: t.accentPrimary }}>Send</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}