import { useState, useRef } from "react";
import {
    Box, Typography, Stack, Paper, Chip, Button, IconButton, Tooltip, LinearProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import SlideshowOutlinedIcon from "@mui/icons-material/SlideshowOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";

const INIT = [
    { id: 1, name: "proposal_v3.pdf", type: "pdf", folder: "Proposals", size: "2.4 MB", uploaded: "2h ago", status: "approved", feedback: null },
    { id: 2, name: "proposal_v2.pdf", type: "pdf", folder: "Proposals", size: "2.1 MB", uploaded: "5d ago", status: "pending", feedback: null },
    { id: 3, name: "system_architecture.png", type: "img", folder: "Design", size: "3.8 MB", uploaded: "1d ago", status: "feedback", feedback: "Great work, just update the API flow section" },
    { id: 4, name: "database_schema_v2.pdf", type: "pdf", folder: "Design", size: "1.2 MB", uploaded: "3h ago", status: "pending", feedback: null },
    { id: 5, name: "midterm_presentation.pptx", type: "pptx", folder: "Presentations", size: "8.2 MB", uploaded: "3d ago", status: "approved", feedback: null },
];

const FOLDERS = ["All", "Proposals", "Design", "Presentations"];

const FILE_ICON = {
    pdf: <PictureAsPdfOutlinedIcon />,
    pptx: <SlideshowOutlinedIcon />,
    docx: <DescriptionOutlinedIcon />,
    img: <ImageOutlinedIcon />,
};
const FILE_CLR = { pdf: "#C47E7E", pptx: "#C49A6C", docx: "#7E9FC4", img: "#6D8A7D" };
const STATUS_CLR = { pending: "#C49A6C", approved: "#6D8A7D", feedback: "#B46F4C", rejected: "#C47E7E" };
const STATUS_LBL = { pending: "Under Review", approved: "Approved", feedback: "Feedback", rejected: "Rejected" };

export default function FileRepository() {
    const theme = useTheme();
    const t = theme.palette.custom;
    const fileInputRef = useRef();

    const [files, setFiles] = useState(INIT);
    const [folderF, setFolderF] = useState("All");
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadPct, setUploadPct] = useState(0);

    const filtered = files.filter((f) => folderF === "All" || f.folder === folderF);

    const simulateUpload = (name, size) => {
        setUploading(true);
        setUploadPct(0);
        let pct = 0;
        const interval = setInterval(() => {
            pct += 20;
            setUploadPct(pct);
            if (pct >= 100) {
                clearInterval(interval);
                setUploading(false);
                const ext = name.split(".").pop().toLowerCase();
                const type = ext === "pdf" ? "pdf" : ext === "pptx" ? "pptx" : ext === "docx" ? "docx" : "img";
                setFiles((p) => [...p, {
                    id: Date.now(), name, type, folder: folderF === "All" ? "Design" : folderF,
                    size, uploaded: "Just now", status: "pending", feedback: null,
                }]);
            }
        }, 200);
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) simulateUpload(f.name, `${(f.size / 1024 / 1024).toFixed(1)} MB`);
    };

    const handleFileSelect = (e) => {
        const f = e.target.files[0];
        if (f) simulateUpload(f.name, `${(f.size / 1024 / 1024).toFixed(1)} MB`);
    };

    const deleteFile = (id) => setFiles((p) => p.filter((f) => f.id !== id));

    // Group by folder
    const grouped = filtered.reduce((acc, f) => {
        if (!acc[f.folder]) acc[f.folder] = [];
        acc[f.folder].push(f);
        return acc;
    }, {});

    return (
        <Box sx={{ maxWidth: 900 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                    <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>Files</Typography>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>
                        {files.length} files · {files.filter((f) => f.status === "pending").length} under review
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<UploadFileOutlinedIcon />} onClick={() => fileInputRef.current?.click()}
                    sx={{ bgcolor: t.accentPrimary }}>
                    Upload File
                </Button>
                <input ref={fileInputRef} type="file" hidden onChange={handleFileSelect}
                    accept=".pdf,.docx,.pptx,.png,.jpg,.zip" />
            </Stack>

            {/* Folder tabs */}
            <Stack direction="row" gap={1} mb={2.5} flexWrap="wrap">
                {FOLDERS.map((f) => (
                    <Chip key={f} label={f} onClick={() => setFolderF(f)}
                        sx={{
                            cursor: "pointer",
                            bgcolor: folderF === f ? t.accentPrimary : t.surfaceHover,
                            color: folderF === f ? "#fff" : t.textSecondary,
                            fontWeight: folderF === f ? 600 : 500,
                            "&:hover": { bgcolor: folderF === f ? t.accentPrimary : t.borderLight },
                        }} />
                ))}
            </Stack>

            {/* Upload zone */}
            <Paper
                elevation={0}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                    p: 3, mb: 2.5, borderRadius: 3, textAlign: "center", cursor: "pointer",
                    border: `2px dashed ${dragging ? t.accentPrimary : t.borderLight}`,
                    bgcolor: dragging ? `${t.accentPrimary}06` : t.surfaceHover,
                    transition: "all 0.2s",
                    "&:hover": { borderColor: t.accentPrimary, bgcolor: `${t.accentPrimary}06` },
                }}
            >
                <UploadFileOutlinedIcon sx={{ fontSize: 32, color: dragging ? t.accentPrimary : t.textTertiary, mb: 1 }} />
                <Typography sx={{ fontSize: "0.875rem", color: t.textSecondary, fontWeight: 500 }}>
                    {dragging ? "Drop your file here" : "Drag & drop or click to upload"}
                </Typography>
                <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary, mt: 0.3 }}>
                    PDF, DOCX, PPTX, PNG, JPG, ZIP · max 50 MB
                </Typography>
                {uploading && (
                    <Box sx={{ mt: 1.5, mx: "auto", maxWidth: 200 }}>
                        <LinearProgress variant="determinate" value={uploadPct}
                            sx={{ bgcolor: t.borderLight, "& .MuiLinearProgress-bar": { bgcolor: t.accentPrimary } }} />
                        <Typography sx={{ fontSize: "0.72rem", color: t.accentPrimary, mt: 0.5 }}>Uploading… {uploadPct}%</Typography>
                    </Box>
                )}
            </Paper>

            {/* File list grouped */}
            <Stack spacing={2.5}>
                {Object.entries(grouped).map(([folder, fls]) => (
                    <Box key={folder}>
                        <Typography sx={{
                            fontSize: "0.8rem", fontWeight: 700, color: t.textTertiary, textTransform: "uppercase",
                            letterSpacing: "0.07em", mb: 1.2
                        }}>
                            📁 {folder} ({fls.length})
                        </Typography>
                        <Stack spacing={1}>
                            {fls.map((f) => (
                                <Paper key={f.id} elevation={1} sx={{
                                    p: 2, borderRadius: 3, bgcolor: theme.palette.background.paper,
                                    borderLeft: f.status === "feedback" ? `3px solid ${t.accentPrimary}` : "none"
                                }}>
                                    <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" gap={1.5}>
                                        <Stack direction="row" alignItems="center" gap={1.5}>
                                            <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: `${FILE_CLR[f.type]}15`, color: FILE_CLR[f.type], "& svg": { fontSize: 20 } }}>
                                                {FILE_ICON[f.type]}
                                            </Box>
                                            <Box>
                                                <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: t.textPrimary }}>{f.name}</Typography>
                                                <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>{f.size} · {f.uploaded}</Typography>
                                                {f.feedback && (
                                                    <Stack direction="row" alignItems="flex-start" gap={0.5} mt={0.5}>
                                                        <CommentOutlinedIcon sx={{ fontSize: 13, color: t.accentPrimary, mt: "1px", flexShrink: 0 }} />
                                                        <Typography sx={{ fontSize: "0.78rem", color: t.accentPrimary, lineHeight: 1.4 }}>
                                                            {f.feedback}
                                                        </Typography>
                                                    </Stack>
                                                )}
                                            </Box>
                                        </Stack>
                                        <Stack direction="row" alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
                                            <Chip label={STATUS_LBL[f.status]} size="small"
                                                sx={{ bgcolor: `${STATUS_CLR[f.status]}18`, color: STATUS_CLR[f.status], fontWeight: 600, fontSize: "0.7rem", height: 24 }} />
                                            <Tooltip title="Download">
                                                <IconButton size="small" sx={{ color: t.textTertiary, "&:hover": { color: t.accentPrimary } }}>
                                                    <DownloadOutlinedIcon sx={{ fontSize: 17 }} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" onClick={() => deleteFile(f.id)} sx={{ color: t.textTertiary, "&:hover": { color: t.error } }}>
                                                    <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    </Box>
                ))}
            </Stack>
        </Box>
    );
}