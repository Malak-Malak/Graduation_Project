import { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Stack, Paper, Button, CircularProgress,
    Alert, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, Snackbar, Checkbox,
    Divider, Tooltip, Tab, Tabs, TextField, InputAdornment, Pagination,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import SelectAllOutlinedIcon from "@mui/icons-material/SelectAllOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { IconButton } from "@mui/material";

import archiveApi from "../../../../api/handler/endpoints/archiveApi";

/* ─── Tokens ─────────────────────────────────────────────────── */
const ACCENT = "#6D8A7D";
const PALETTE = ["#C97B4B", "#5B8FA8", "#6D8A7D", "#9B7EC8", "#A85B6D", "#7A9E5B"];

const ini = (n = "") =>
    (n ?? "").split(" ").map((w) => w[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";
const palette = (i) => PALETTE[i % PALETTE.length];

const extractArray = (d) => {
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.data)) return d.data;
    return [];
};

const formatDate = (dateStr, opts = { year: "numeric", month: "short", day: "numeric" }) => {
    if (!dateStr) return null;
    try { return new Date(dateStr).toLocaleDateString("en-US", opts); }
    catch { return null; }
};

const CARDS_PER_PAGE = 9;

/* ═══════════════════════════════════════════════════════════════
   FILE ITEM (used in both submitted & archived views)
═══════════════════════════════════════════════════════════════ */
function FileItem({ file, checked, onChange, accentColor, isDark, t, border }) {
    return (
        <Box
            onClick={() => onChange && onChange(file.id)}
            sx={{
                display: "flex", alignItems: "flex-start", gap: 1.5,
                p: 1.5, borderRadius: 2,
                cursor: onChange ? "pointer" : "default",
                border: `1px solid ${checked ? accentColor + "50" : border}`,
                bgcolor: checked ? `${accentColor}08` : isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                transition: "all 0.15s",
                "&:hover": onChange ? { borderColor: accentColor + "40", bgcolor: `${accentColor}05` } : {},
            }}
        >
            {onChange && (
                <Checkbox
                    checked={checked}
                    onChange={() => onChange(file.id)}
                    onClick={(e) => e.stopPropagation()}
                    size="small"
                    sx={{ p: 0, mt: 0.2, flexShrink: 0, color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)", "&.Mui-checked": { color: accentColor } }}
                />
            )}
            <Box sx={{ width: 34, height: 34, borderRadius: 1.5, flexShrink: 0, bgcolor: `${accentColor}12`, border: `1px solid ${accentColor}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <InsertDriveFileOutlinedIcon sx={{ fontSize: 17, color: accentColor }} />
            </Box>
            <Box flex={1} minWidth={0}>
                <Stack direction="row" alignItems="center" gap={0.8} mb={0.3}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: t.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                        {file.fileName}
                    </Typography>
                    {file.filePath && (
                        <Tooltip title="Open file">
                            <Box component="a" href={file.filePath} target="_blank" rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                sx={{ display: "flex", alignItems: "center", color: accentColor, flexShrink: 0, "&:hover": { opacity: 0.75 } }}>
                                <LinkOutlinedIcon sx={{ fontSize: 14 }} />
                            </Box>
                        </Tooltip>
                    )}
                </Stack>
                {file.description && (
                    <Typography sx={{ fontSize: "0.74rem", color: t.textSecondary, lineHeight: 1.5, mb: 0.5, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {file.description}
                    </Typography>
                )}
                <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
                    {file.uploadedByName && (
                        <Stack direction="row" alignItems="center" gap={0.4}>
                            <PersonOutlineIcon sx={{ fontSize: 11, color: t.textSecondary }} />
                            <Typography sx={{ fontSize: "0.7rem", color: t.textSecondary }}>{file.uploadedByName}</Typography>
                        </Stack>
                    )}
                    {file.uploadedAt && (
                        <Stack direction="row" alignItems="center" gap={0.4}>
                            <CalendarTodayOutlinedIcon sx={{ fontSize: 11, color: t.textSecondary }} />
                            <Typography sx={{ fontSize: "0.7rem", color: t.textSecondary }}>{formatDate(file.uploadedAt)}</Typography>
                        </Stack>
                    )}
                </Stack>
            </Box>
        </Box>
    );
}

/* ═══════════════════════════════════════════════════════════════
   FILE REVIEW DIALOG (supervisor → submitted teams)
═══════════════════════════════════════════════════════════════ */
function FileReviewDialog({ open, onClose, team, accentColor, isDark, t, border, paperBg, onArchived }) {
    const [files, setFiles] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [filesError, setFilesError] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [archiving, setArchiving] = useState(false);
    const [archiveError, setArchiveError] = useState(null);
    const phaseLabel = team?.version === 0 ? "Phase 1" : "Phase 2";

    useEffect(() => {
        if (!open || !team) return;
        setFiles([]); setSelectedIds(new Set()); setFilesError(null); setArchiveError(null); setLoadingFiles(true);
        archiveApi.getTeamFiles(team.teamId, team.version)
            .then((res) => { const data = res?.data ?? res; setFiles(Array.isArray(data) ? data : []); })
            .catch((err) => setFilesError(err?.response?.data?.message ?? "Failed to load files."))
            .finally(() => setLoadingFiles(false));
    }, [open, team]);

    const toggleFile = (id) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const handleSelectAll = () => setSelectedIds(selectedIds.size === files.length ? new Set() : new Set(files.map(f => f.id)));

    const handleArchive = async () => {
        if (selectedIds.size === 0) return;
        setArchiving(true); setArchiveError(null);
        try {
            await archiveApi.sendToArchive(team.teamId, team.version, Array.from(selectedIds));
            onArchived(team.teamId); onClose();
        } catch (err) {
            setArchiveError(err?.response?.data?.message ?? "Could not archive project.");
        } finally { setArchiving(false); }
    };

    const allSelected = files.length > 0 && selectedIds.size === files.length;

    return (
        <Dialog open={open} onClose={() => !archiving && onClose()} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${border}`, bgcolor: paperBg, boxShadow: isDark ? "0 24px 64px rgba(0,0,0,0.55)" : "0 24px 48px rgba(0,0,0,0.12)" } }}>
            <Box sx={{ height: 3, bgcolor: accentColor }} />
            <DialogTitle sx={{ fontWeight: 700, fontSize: "0.95rem", color: t.textPrimary, pb: 0.5 }}>
                <Stack direction="row" alignItems="center" gap={1.2}>
                    <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: `${accentColor}15`, border: `1px solid ${accentColor}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FolderOpenOutlinedIcon sx={{ fontSize: 16, color: accentColor }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.93rem", color: t.textPrimary }}>Review Files — {phaseLabel}</Typography>
                        <Typography sx={{ fontSize: "0.74rem", color: t.textSecondary, fontWeight: 400 }}>{team?.projectName}</Typography>
                    </Box>
                </Stack>
            </DialogTitle>
            <Divider sx={{ borderColor: border }} />
            <DialogContent sx={{ p: 2.5 }}>
                {files.length > 0 && !loadingFiles && (
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                        <Typography sx={{ fontSize: "0.76rem", color: t.textSecondary }}>{selectedIds.size} of {files.length} file{files.length !== 1 ? "s" : ""} selected</Typography>
                        <Button size="small" startIcon={<SelectAllOutlinedIcon sx={{ fontSize: 14 }} />} onClick={handleSelectAll}
                            sx={{ color: accentColor, fontSize: "0.74rem", fontWeight: 600, textTransform: "none", borderRadius: 1.5, px: 1, "&:hover": { bgcolor: `${accentColor}10` } }}>
                            {allSelected ? "Deselect All" : "Select All"}
                        </Button>
                    </Stack>
                )}
                {loadingFiles && <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}><CircularProgress size={26} sx={{ color: accentColor }} /></Box>}
                {!loadingFiles && filesError && <Alert severity="error" sx={{ borderRadius: 2, fontSize: "0.8rem" }}>{filesError}</Alert>}
                {!loadingFiles && !filesError && files.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 5, border: `1.5px dashed ${accentColor}25`, borderRadius: 2, bgcolor: `${accentColor}04` }}>
                        <InsertDriveFileOutlinedIcon sx={{ fontSize: 28, color: accentColor, opacity: 0.35, mb: 1 }} />
                        <Typography sx={{ fontSize: "0.83rem", color: t.textSecondary }}>No files uploaded for this phase.</Typography>
                    </Box>
                )}
                {!loadingFiles && !filesError && files.length > 0 && (
                    <Stack gap={1}>
                        {files.map(file => (
                            <FileItem key={file.id} file={file} checked={selectedIds.has(file.id)} onChange={toggleFile}
                                accentColor={accentColor} isDark={isDark} t={t} border={border} />
                        ))}
                    </Stack>
                )}
                {archiveError && <Alert severity="error" sx={{ borderRadius: 2, fontSize: "0.8rem", mt: 2 }}>{archiveError}</Alert>}
                {!loadingFiles && files.length > 0 && (
                    <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: `1px solid ${border}` }}>
                        <Typography sx={{ fontSize: "0.74rem", color: t.textSecondary, lineHeight: 1.65 }}>
                            Select the files you want to keep in the archive. Unselected files will not appear in the public archive.
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <Divider sx={{ borderColor: border }} />
            <DialogActions sx={{ px: 2.5, py: 2, gap: 1 }}>
                <Button onClick={onClose} disabled={archiving} sx={{ color: t.textSecondary, textTransform: "none", borderRadius: 2 }}>Cancel</Button>
                <Tooltip title={selectedIds.size === 0 ? "Select at least one file to archive" : ""} placement="top">
                    <span>
                        <Button variant="contained" onClick={handleArchive}
                            disabled={archiving || selectedIds.size === 0 || files.length === 0}
                            startIcon={archiving ? <CircularProgress size={13} color="inherit" /> : <ArchiveOutlinedIcon />}
                            sx={{ bgcolor: accentColor, borderRadius: 2, boxShadow: "none", textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: accentColor, filter: "brightness(0.92)", boxShadow: "none" }, "&.Mui-disabled": { opacity: 0.5 } }}>
                            {archiving ? "Archiving…" : `Archive ${phaseLabel} (${selectedIds.size} file${selectedIds.size !== 1 ? "s" : ""})`}
                        </Button>
                    </span>
                </Tooltip>
            </DialogActions>
        </Dialog>
    );
}

/* ═══════════════════════════════════════════════════════════════
   ARCHIVE DETAIL DIALOG (supervisor → view archived project)
═══════════════════════════════════════════════════════════════ */
function ArchiveDetailDialog({ open, onClose, project, accentColor, isDark, t, border, paperBg }) {
    if (!project) return null;

    const colorIdx = Math.abs((project.teamId ?? 0) + (project.projectName ?? "").charCodeAt(0)) % PALETTE.length;
    const aClr = palette(colorIdx);

    const hasP1 = project.hasPhase1 ?? false;
    const hasP2 = project.hasPhase2 ?? false;
    const archivedP1 = formatDate(project.archivedAtV0, { year: "numeric", month: "long", day: "numeric" });
    const archivedP2 = formatDate(project.archivedAtV1, { year: "numeric", month: "long", day: "numeric" });

    const filesP1 = (project.files ?? []).filter(f => f.version === 0);
    const filesP2 = (project.files ?? []).filter(f => f.version === 1);

    const PhaseBadge = ({ label, active, date }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: .7, px: 1.2, py: .5, borderRadius: "8px", bgcolor: active ? "rgba(61,185,122,.1)" : isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)", border: `1px solid ${active ? "rgba(61,185,122,.3)" : border}` }}>
            {active ? <CheckCircleOutlineIcon sx={{ fontSize: 13, color: "#3DB97A" }} /> : <CancelOutlinedIcon sx={{ fontSize: 13, color: t.textSecondary, opacity: .5 }} />}
            <Typography fontSize=".72rem" fontWeight={700} sx={{ color: active ? "#3DB97A" : t.textSecondary }}>{label}</Typography>
            {date && <Typography fontSize=".65rem" sx={{ color: t.textSecondary }}>· {date}</Typography>}
        </Box>
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: "20px", overflow: "hidden", border: `1px solid ${border}`, bgcolor: paperBg, boxShadow: isDark ? "0 40px 100px rgba(0,0,0,.7)" : "0 40px 100px rgba(0,0,0,.15)" } }}>
            {/* Banner */}
            <Box sx={{ height: 90, position: "relative", overflow: "hidden", background: isDark ? `linear-gradient(135deg,${aClr}28 0%,${aClr}0A 100%)` : `linear-gradient(135deg,${aClr}14 0%,${aClr}05 100%)` }}>
                <Box sx={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${aClr}25 1.5px,transparent 1.5px)`, backgroundSize: "22px 22px" }} />
                <IconButton size="small" onClick={onClose} sx={{ position: "absolute", top: 12, right: 12, bgcolor: isDark ? "rgba(0,0,0,.5)" : "rgba(255,255,255,.9)", border: `1px solid ${border}`, color: t.textSecondary, width: 28, height: 28, "&:hover": { color: aClr }, transition: "all .18s", zIndex: 2 }}>
                    <CloseIcon sx={{ fontSize: 13 }} />
                </IconButton>
            </Box>

            {/* Avatar */}
            <Box sx={{ px: 3, mt: "-24px", mb: 0, position: "relative", zIndex: 1 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: "14px", background: `linear-gradient(145deg,${aClr},${aClr}bb)`, border: `3px solid ${isDark ? paperBg : "#fff"}`, boxShadow: `0 6px 20px ${aClr}45`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 800, color: "#fff" }}>
                    {ini(project.projectName)}
                </Box>
            </Box>

            <Box sx={{ px: 3, pt: 1.5, pb: 1 }}>
                <Typography fontWeight={800} fontSize="1rem" sx={{ color: t.textPrimary, mb: .7 }}>{project.projectName}</Typography>
                <Stack direction="row" gap={.7} flexWrap="wrap" mb={1}>
                    {project.supervisorName && (
                        <Chip icon={<SchoolOutlinedIcon sx={{ fontSize: "11px !important", color: `${t.textSecondary} !important` }} />}
                            label={project.supervisorName} size="small"
                            sx={{ height: 22, borderRadius: "7px", bgcolor: isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.06)", color: t.textSecondary, fontSize: ".67rem", fontWeight: 600 }} />
                    )}
                    {project.department && (
                        <Chip label={project.department} size="small"
                            sx={{ height: 22, borderRadius: "7px", bgcolor: `${aClr}14`, color: aClr, fontSize: ".67rem", fontWeight: 700, border: `1px solid ${aClr}2E` }} />
                    )}
                </Stack>
                <Stack direction="row" gap={1} flexWrap="wrap">
                    <PhaseBadge label="Phase 1" active={hasP1} date={archivedP1} />
                    <PhaseBadge label="Phase 2" active={hasP2} date={archivedP2} />
                </Stack>
            </Box>

            <Divider sx={{ borderColor: border, mt: 1.5 }} />

            <DialogContent sx={{ px: 3, py: 2.5, overflowY: "auto", maxHeight: 400 }}>
                <Stack spacing={2.5}>
                    {/* Description */}
                    {project.projectDescription && (
                        <Box>
                            <Typography sx={{ fontSize: ".66rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".8px", color: t.textSecondary, mb: .8 }}>Description</Typography>
                            <Typography fontSize=".83rem" sx={{ color: t.textPrimary, lineHeight: 1.7 }}>{project.projectDescription}</Typography>
                        </Box>
                    )}

                    {/* GitHub */}
                    {project.githubRepo && (
                        <Box>
                            <Typography sx={{ fontSize: ".66rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".8px", color: t.textSecondary, mb: .8 }}>Repository</Typography>
                            <Stack direction="row" alignItems="center" gap={1} component="a" href={project.githubRepo} target="_blank" rel="noopener noreferrer"
                                sx={{ textDecoration: "none", display: "inline-flex", p: "8px 12px", borderRadius: "10px", border: `1px solid ${border}`, bgcolor: isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)", "&:hover": { borderColor: aClr, bgcolor: `${aClr}08` }, transition: "all .18s" }}>
                                <GitHubIcon sx={{ fontSize: 15, color: isDark ? "#ccc" : "#333" }} />
                                <Typography fontSize=".78rem" fontWeight={600} sx={{ color: aClr }}>
                                    {project.githubRepo.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
                                </Typography>
                            </Stack>
                        </Box>
                    )}

                    {/* Members */}
                    {project.memberNames?.length > 0 && (
                        <Box>
                            <Typography sx={{ fontSize: ".66rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".8px", color: t.textSecondary, mb: 1 }}>
                                Team Members ({project.memberNames.length})
                            </Typography>
                            <Stack gap={.7}>
                                {project.memberNames.map((mName, i) => (
                                    <Stack key={i} direction="row" alignItems="center" gap={1.2}
                                        sx={{ p: "9px 12px", borderRadius: "11px", border: `1px solid ${isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"}`, bgcolor: isDark ? "rgba(255,255,255,.025)" : "rgba(0,0,0,.018)" }}>
                                        <Box sx={{ width: 30, height: 30, borderRadius: "9px", bgcolor: palette(i), display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".68rem", fontWeight: 700, color: "#fff" }}>{ini(mName)}</Box>
                                        <Typography fontWeight={600} fontSize=".82rem" sx={{ color: t.textPrimary }}>{mName}</Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Box>
                    )}

                    {/* Files Phase 1 */}
                    {filesP1.length > 0 && (
                        <Box>
                            <Stack direction="row" alignItems="center" gap={.6} mb={1}>
                                <CheckCircleOutlineIcon sx={{ fontSize: 13, color: "#3DB97A" }} />
                                <Typography sx={{ fontSize: ".66rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".8px", color: t.textSecondary }}>
                                    Phase 1 Files ({filesP1.length})
                                </Typography>
                            </Stack>
                            <Stack gap={.7}>
                                {filesP1.map(f => <FileItem key={f.id} file={f} accentColor={aClr} isDark={isDark} t={t} border={border} />)}
                            </Stack>
                        </Box>
                    )}

                    {/* Files Phase 2 */}
                    {filesP2.length > 0 && (
                        <Box>
                            <Stack direction="row" alignItems="center" gap={.6} mb={1}>
                                <CheckCircleOutlineIcon sx={{ fontSize: 13, color: "#3DB97A" }} />
                                <Typography sx={{ fontSize: ".66rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".8px", color: t.textSecondary }}>
                                    Phase 2 Files ({filesP2.length})
                                </Typography>
                            </Stack>
                            <Stack gap={.7}>
                                {filesP2.map(f => <FileItem key={f.id} file={f} accentColor={aClr} isDark={isDark} t={t} border={border} />)}
                            </Stack>
                        </Box>
                    )}

                    {/* No files at all */}
                    {filesP1.length === 0 && filesP2.length === 0 && (
                        <Box sx={{ textAlign: "center", py: 4, border: `1.5px dashed ${aClr}25`, borderRadius: 2, bgcolor: `${aClr}04` }}>
                            <InsertDriveFileOutlinedIcon sx={{ fontSize: 26, color: aClr, opacity: .35, mb: 1 }} />
                            <Typography sx={{ fontSize: ".82rem", color: t.textSecondary }}>No files attached to this archived project.</Typography>
                        </Box>
                    )}
                </Stack>
            </DialogContent>

            <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${border}`, display: "flex", justifyContent: "flex-end" }}>
                <Button onClick={onClose} sx={{ color: t.textSecondary, textTransform: "none", fontWeight: 600, borderRadius: "10px", px: 2.5, fontSize: ".8rem", "&:hover": { bgcolor: isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)" } }}>Close</Button>
            </Box>
        </Dialog>
    );
}

/* ═══════════════════════════════════════════════════════════════
   SUBMITTED TEAM CARD
═══════════════════════════════════════════════════════════════ */
function SubmittedTeamCard({ team, accentColor, isDark, t, border, onReviewFiles }) {
    const cardBg = isDark ? "rgba(255,255,255,0.025)" : "#fff";
    const versionLabel = team.version === 0 ? "Phase 1" : "Phase 2";

    return (
        <Paper elevation={0} sx={{ borderRadius: 2.5, bgcolor: cardBg, border: `1px solid ${border}`, borderLeft: `3px solid ${accentColor}`, overflow: "hidden", transition: "box-shadow 0.15s", "&:hover": { boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.25)" : "0 4px 16px rgba(0,0,0,0.07)" } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`, bgcolor: isDark ? "rgba(255,255,255,0.02)" : `${accentColor}06` }}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: `${accentColor}15`, border: `1px solid ${accentColor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700, color: accentColor }}>{ini(team.projectName)}</Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: t.textPrimary }}>{team.projectName}</Typography>
                </Stack>
                <Chip label={versionLabel} size="small" sx={{ bgcolor: `${accentColor}12`, color: accentColor, border: `1px solid ${accentColor}25`, fontWeight: 700, fontSize: "0.67rem", borderRadius: 1 }} />
            </Stack>
            <Box sx={{ px: 2.5, pt: 1.5, pb: 2 }}>
                {team.projectDescription && (
                    <Typography sx={{ fontSize: "0.8rem", color: t.textSecondary, lineHeight: 1.7, mb: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {team.projectDescription}
                    </Typography>
                )}
                {team.version === 1 && team.githubRepo && (
                    <Stack direction="row" alignItems="center" gap={0.8} mb={1.5}>
                        <GitHubIcon sx={{ fontSize: 13, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }} />
                        <Typography component="a" href={team.githubRepo} target="_blank" rel="noopener noreferrer"
                            sx={{ fontSize: "0.75rem", color: accentColor, textDecoration: "none", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}>
                            {team.githubRepo.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
                        </Typography>
                    </Stack>
                )}
                {team.memberNames?.length > 0 && (
                    <Box mb={2}>
                        <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: t.textSecondary, mb: 0.8 }}>Members ({team.memberNames.length})</Typography>
                        <Stack direction="row" flexWrap="wrap" gap={0.7}>
                            {team.memberNames.map((name, i) => (
                                <Stack key={i} direction="row" alignItems="center" gap={0.6} sx={{ px: 1, py: 0.3, borderRadius: 1.5, bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${border}` }}>
                                    <Box sx={{ width: 18, height: 18, borderRadius: 0.8, bgcolor: palette(i), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>{ini(name)}</Box>
                                    <Typography sx={{ fontSize: "0.72rem", fontWeight: 500, color: t.textPrimary }}>{name}</Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </Box>
                )}
                <Button variant="contained" size="small" fullWidth startIcon={<FolderOpenOutlinedIcon />}
                    onClick={() => onReviewFiles(team)}
                    sx={{ bgcolor: accentColor, borderRadius: 2, boxShadow: "none", fontWeight: 600, fontSize: "0.82rem", textTransform: "none", "&:hover": { bgcolor: accentColor, filter: "brightness(0.92)", boxShadow: "none" } }}>
                    Review Files
                </Button>
            </Box>
        </Paper>
    );
}

/* ═══════════════════════════════════════════════════════════════
   ARCHIVED PROJECT CARD (supervisor view)
═══════════════════════════════════════════════════════════════ */
function ArchivedProjectCard({ project, accentColor: _a, isDark, t, border, onView }) {
    const colorIdx = Math.abs((project.teamId ?? 0) + (project.projectName ?? "").charCodeAt(0)) % PALETTE.length;
    const aClr = palette(colorIdx);
    const cardBg = isDark ? "rgba(255,255,255,0.025)" : "#fff";

    const hasP1 = project.hasPhase1 ?? false;
    const hasP2 = project.hasPhase2 ?? false;
    const date = formatDate(project.archivedAtV0 ?? project.archivedAtV1 ?? project.archivedAt);

    return (
        <Paper elevation={0} sx={{ borderRadius: 2.5, bgcolor: cardBg, border: `1px solid ${border}`, borderLeft: `3px solid ${aClr}`, overflow: "hidden", transition: "box-shadow 0.15s", "&:hover": { boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.25)" : "0 4px 16px rgba(0,0,0,0.07)" } }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between"
                sx={{ px: 2, py: 1, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`, bgcolor: isDark ? "rgba(255,255,255,0.02)" : `${aClr}06` }}>
                <Stack direction="row" alignItems="center" gap={1} minWidth={0} flex={1} overflow="hidden">
                    <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: `${aClr}15`, border: `1px solid ${aClr}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700, color: aClr, flexShrink: 0 }}>{ini(project.projectName)}</Box>
                    <Typography noWrap sx={{ fontWeight: 700, fontSize: "0.88rem", color: t.textPrimary }}>{project.projectName}</Typography>
                </Stack>
                {/* Phase badges */}
                <Stack direction="row" gap={.5} flexShrink={0} ml={1}>
                    <Chip label="P1" size="small" sx={{ height: 18, borderRadius: "5px", bgcolor: hasP1 ? "rgba(61,185,122,.12)" : isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)", color: hasP1 ? "#3DB97A" : t.textSecondary, fontSize: ".6rem", fontWeight: 700, border: `1px solid ${hasP1 ? "rgba(61,185,122,.3)" : "transparent"}` }} />
                    <Chip label="P2" size="small" sx={{ height: 18, borderRadius: "5px", bgcolor: hasP2 ? "rgba(61,185,122,.12)" : isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)", color: hasP2 ? "#3DB97A" : t.textSecondary, fontSize: ".6rem", fontWeight: 700, border: `1px solid ${hasP2 ? "rgba(61,185,122,.3)" : "transparent"}` }} />
                </Stack>
            </Stack>

            {/* Body */}
            <Box sx={{ px: 2.5, pt: 1.5, pb: 2 }}>
                {project.projectDescription && (
                    <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary, lineHeight: 1.65, mb: 1.2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {project.projectDescription}
                    </Typography>
                )}

                {/* Meta row */}
                <Stack direction="row" gap={1} flexWrap="wrap" mb={1.5}>
                    {project.supervisorName && (
                        <Stack direction="row" alignItems="center" gap={.4}>
                            <SchoolOutlinedIcon sx={{ fontSize: 11, color: t.textSecondary }} />
                            <Typography sx={{ fontSize: ".72rem", color: t.textSecondary }}>{project.supervisorName}</Typography>
                        </Stack>
                    )}
                    {date && (
                        <Stack direction="row" alignItems="center" gap={.4}>
                            <CalendarTodayOutlinedIcon sx={{ fontSize: 11, color: t.textSecondary }} />
                            <Typography sx={{ fontSize: ".72rem", color: t.textSecondary }}>{date}</Typography>
                        </Stack>
                    )}
                    {project.department && (
                        <Chip label={project.department} size="small"
                            sx={{ height: 18, borderRadius: "5px", bgcolor: `${aClr}12`, color: aClr, fontSize: ".6rem", fontWeight: 600, border: `1px solid ${aClr}25` }} />
                    )}
                </Stack>

                {/* Members mini stack */}
                {project.memberNames?.length > 0 && (
                    <Stack direction="row" alignItems="center" gap={.6} mb={1.5}>
                        {project.memberNames.slice(0, 5).map((mn, i) => (
                            <Tooltip key={i} title={mn}>
                                <Box sx={{ width: 22, height: 22, borderRadius: "6px", bgcolor: palette(i), border: `2px solid ${isDark ? "#1A1D22" : "#fff"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".5rem", fontWeight: 700, color: "#fff", ml: i === 0 ? 0 : "-4px", zIndex: 5 - i, position: "relative" }}>{ini(mn)}</Box>
                            </Tooltip>
                        ))}
                        {project.memberNames.length > 5 && (
                            <Typography sx={{ fontSize: ".68rem", color: t.textSecondary, ml: .5 }}>+{project.memberNames.length - 5} more</Typography>
                        )}
                    </Stack>
                )}

                <Button variant="outlined" size="small" fullWidth startIcon={<InfoOutlinedIcon sx={{ fontSize: 13 }} />}
                    onClick={() => onView(project)}
                    sx={{ borderRadius: 2, textTransform: "none", fontSize: "0.78rem", fontWeight: 600, borderColor: border, color: t.textSecondary, "&:hover": { borderColor: aClr, color: aClr, bgcolor: `${aClr}08` }, transition: "all .15s" }}>
                    View Details
                </Button>
            </Box>
        </Paper>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN — SUBMITTED TEAMS + ARCHIVE TABS
═══════════════════════════════════════════════════════════════ */
export default function SubmittedTeams() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const t = theme.palette.custom ?? {};
    const accentColor = t.accentPrimary ?? ACCENT;

    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const paperBg = theme.palette.background.paper;
    const cardBg = isDark ? "#1A1D22" : "#fff";

    const [mainTab, setMainTab] = useState(0);

    // ── Submitted teams state ──
    const [teams, setTeams] = useState([]);
    const [loadingTeams, setLoadingTeams] = useState(true);
    const [teamsError, setTeamsError] = useState(null);
    const [reviewTeam, setReviewTeam] = useState(null);

    // ── Archived projects state ──
    const [archivedProjects, setArchivedProjects] = useState([]);
    const [loadingArchive, setLoadingArchive] = useState(false);
    const [archiveError, setArchiveError] = useState(null);
    const [searchArchive, setSearchArchive] = useState("");
    const [archivePage, setArchivePage] = useState(1);
    const [selectedArchive, setSelectedArchive] = useState(null);
    const [archiveDetailOpen, setArchiveDetailOpen] = useState(false);

    const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
    const snap = (msg, sev = "success") => setSnack({ open: true, msg, sev });

    // Fetch submitted teams
    const fetchTeams = useCallback(async () => {
        setLoadingTeams(true); setTeamsError(null);
        try { const data = await archiveApi.getSubmittedTeams(); setTeams(extractArray(data)); }
        catch (err) { setTeamsError(err?.response?.data?.message ?? "Failed to load submitted teams."); }
        finally { setLoadingTeams(false); }
    }, []);

    // Fetch archived projects
    const fetchArchivedProjects = useCallback(async () => {
        if (archivedProjects.length > 0) return;
        setLoadingArchive(true); setArchiveError(null);
        try { const data = await archiveApi.getAllArchivedProjects(); setArchivedProjects(extractArray(data)); }
        catch (err) { setArchiveError(err?.response?.data?.message ?? "Failed to load archived projects."); }
        finally { setLoadingArchive(false); }
    }, [archivedProjects.length]);

    useEffect(() => { fetchTeams(); }, [fetchTeams]);
    useEffect(() => { if (mainTab === 1) fetchArchivedProjects(); }, [mainTab, fetchArchivedProjects]);
    useEffect(() => { setArchivePage(1); }, [searchArchive]);

    const handleArchived = (teamId) => {
        setTeams(prev => prev.filter(team => team.teamId !== teamId));
        // Bust archive cache so it reloads fresh
        setArchivedProjects([]);
        snap("Project successfully archived!", "success");
    };

    // Filtered archive
    const filteredArchive = archivedProjects.filter(p => {
        if (!searchArchive) return true;
        const q = searchArchive.toLowerCase();
        return (p.projectName ?? "").toLowerCase().includes(q)
            || (p.projectDescription ?? "").toLowerCase().includes(q)
            || (p.supervisorName ?? "").toLowerCase().includes(q)
            || (p.department ?? "").toLowerCase().includes(q);
    });
    const totalArchivePages = Math.ceil(filteredArchive.length / CARDS_PER_PAGE);
    const pagedArchive = filteredArchive.slice((archivePage - 1) * CARDS_PER_PAGE, archivePage * CARDS_PER_PAGE);

    const searchSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: "12px", fontSize: ".875rem", bgcolor: cardBg,
            "& fieldset": { borderColor: border },
            "&:hover fieldset": { borderColor: `${accentColor}55` },
            "&.Mui-focused fieldset": { borderColor: accentColor, borderWidth: "1.5px" },
        },
        "& .MuiOutlinedInput-input": { py: "10px" },
    };
    const paginationSx = {
        "& .MuiPaginationItem-root": { borderRadius: "8px", fontWeight: 600, fontSize: ".78rem", color: t.textSecondary },
        "& .Mui-selected": { bgcolor: `${accentColor} !important`, color: "#fff !important" },
        "& .MuiPaginationItem-root:hover:not(.Mui-selected)": { bgcolor: `${accentColor}12`, color: accentColor },
    };

    return (
        <Box sx={{ width: "100%", mx: "auto" }}>
            {/* Page Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                    <Stack direction="row" alignItems="center" gap={1.2} mb={0.5}>
                        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: `${accentColor}15`, border: `1px solid ${accentColor}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <InventoryOutlinedIcon sx={{ fontSize: 17, color: accentColor }} />
                        </Box>
                        <Typography variant="h2" sx={{ color: t.textPrimary, fontWeight: 700 }}>
                            {mainTab === 0 ? "Submitted Projects" : "Archived Projects"}
                        </Typography>
                    </Stack>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.83rem", pl: "44px" }}>
                        {mainTab === 0
                            ? "Review files and archive completed graduation projects"
                            : "Browse all archived graduation projects"}
                    </Typography>
                </Box>
                {mainTab === 0 && !loadingTeams && (
                    <Chip label={`${teams.length} pending`} size="small"
                        sx={{ bgcolor: teams.length > 0 ? `${accentColor}12` : "transparent", color: teams.length > 0 ? accentColor : t.textSecondary, border: `1px solid ${teams.length > 0 ? accentColor + "30" : border}`, fontWeight: 700, fontSize: "0.72rem" }} />
                )}
                {mainTab === 1 && !loadingArchive && (
                    <Chip label={`${filteredArchive.length} projects`} size="small"
                        sx={{ bgcolor: `${accentColor}12`, color: accentColor, border: `1px solid ${accentColor}30`, fontWeight: 700, fontSize: "0.72rem" }} />
                )}
            </Stack>

            {/* Main Tabs */}
            <Box sx={{ mb: 3, bgcolor: cardBg, borderRadius: "14px", border: `1px solid ${border}`, overflow: "hidden" }}>
                <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)} sx={{
                    px: 1, minHeight: 48,
                    "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: ".84rem", minHeight: 48, color: t.textSecondary, transition: "color .18s", borderRadius: "10px", mx: .3 },
                    "& .Mui-selected": { color: accentColor },
                    "& .MuiTabs-indicator": { bgcolor: accentColor, height: 2.5, borderRadius: "2px" },
                }}>
                    <Tab label={
                        <Stack direction="row" alignItems="center" gap={.9}>
                            <InventoryOutlinedIcon sx={{ fontSize: 17 }} />
                            <span>Pending Review</span>
                            {teams.length > 0 && (
                                <Chip label={teams.length} size="small" sx={{ height: 19, minWidth: 24, bgcolor: `${accentColor}18`, color: accentColor, fontWeight: 700, fontSize: ".68rem", border: `1px solid ${accentColor}25`, borderRadius: "6px" }} />
                            )}
                        </Stack>
                    } />
                    <Tab label={
                        <Stack direction="row" alignItems="center" gap={.9}>
                            <ArchiveOutlinedIcon sx={{ fontSize: 17 }} />
                            <span>Archive</span>
                            {archivedProjects.length > 0 && (
                                <Chip label={archivedProjects.length} size="small" sx={{ height: 19, minWidth: 24, bgcolor: `${accentColor}18`, color: accentColor, fontWeight: 700, fontSize: ".68rem", border: `1px solid ${accentColor}25`, borderRadius: "6px" }} />
                            )}
                        </Stack>
                    } />
                </Tabs>
            </Box>

            {/* ── Tab 0: Pending Review ── */}
            {mainTab === 0 && (
                <>
                    {loadingTeams && <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress sx={{ color: accentColor }} size={28} /></Box>}
                    {!loadingTeams && teamsError && <Alert severity="error" sx={{ borderRadius: 2 }}>{teamsError}</Alert>}
                    {!loadingTeams && !teamsError && teams.length === 0 && (
                        <Box sx={{ textAlign: "center", py: 8, border: `1.5px dashed ${accentColor}30`, borderRadius: 3, bgcolor: `${accentColor}04` }}>
                            <Box sx={{ width: 52, height: 52, borderRadius: 3, bgcolor: `${accentColor}12`, border: `1px solid ${accentColor}25`, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                                <GroupsOutlinedIcon sx={{ fontSize: 26, color: accentColor }} />
                            </Box>
                            <Typography sx={{ color: t.textPrimary, fontWeight: 600, fontSize: "0.9rem", mb: 0.5 }}>No submitted projects</Typography>
                            <Typography sx={{ color: t.textSecondary, fontSize: "0.8rem" }}>Teams that submit their project will appear here for your review</Typography>
                        </Box>
                    )}
                    {!loadingTeams && !teamsError && teams.length > 0 && (
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
                            {teams.map(team => (
                                <SubmittedTeamCard key={`${team.teamId}-${team.version}`} team={team}
                                    accentColor={accentColor} isDark={isDark} t={t} border={border}
                                    onReviewFiles={setReviewTeam} />
                            ))}
                        </Box>
                    )}
                </>
            )}

            {/* ── Tab 1: Archive ── */}
            {mainTab === 1 && (
                <>
                    {/* Search */}
                    <TextField fullWidth size="small" placeholder="Search by project, department or supervisor…"
                        value={searchArchive} onChange={e => setSearchArchive(e.target.value)}
                        sx={{ mb: 3, ...searchSx }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: t.textSecondary }} /></InputAdornment> }} />

                    {loadingArchive && <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress sx={{ color: accentColor }} size={28} /></Box>}
                    {!loadingArchive && archiveError && <Alert severity="error" sx={{ borderRadius: 2 }}>{archiveError}</Alert>}
                    {!loadingArchive && !archiveError && filteredArchive.length === 0 && (
                        <Box sx={{ textAlign: "center", py: 8, border: `1.5px dashed ${accentColor}30`, borderRadius: 3, bgcolor: `${accentColor}04` }}>
                            <Box sx={{ width: 52, height: 52, borderRadius: 3, bgcolor: `${accentColor}12`, border: `1px solid ${accentColor}25`, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                                <ArchiveOutlinedIcon sx={{ fontSize: 26, color: accentColor }} />
                            </Box>
                            <Typography sx={{ color: t.textPrimary, fontWeight: 600, fontSize: "0.9rem", mb: 0.5 }}>
                                {searchArchive ? "No results found" : "No archived projects yet"}
                            </Typography>
                            <Typography sx={{ color: t.textSecondary, fontSize: "0.8rem" }}>
                                {searchArchive ? "Try a different search term" : "Archived projects will appear here once reviewed"}
                            </Typography>
                        </Box>
                    )}
                    {!loadingArchive && !archiveError && filteredArchive.length > 0 && (
                        <>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 2, mb: 3 }}>
                                {pagedArchive.map((project, i) => (
                                    <ArchivedProjectCard key={project.teamId ?? i} project={project}
                                        accentColor={accentColor} isDark={isDark} t={t} border={border}
                                        onView={p => { setSelectedArchive(p); setArchiveDetailOpen(true); }} />
                                ))}
                            </Box>
                            {totalArchivePages > 1 && (
                                <Stack alignItems="center" gap={.8} sx={{ pt: 2.5, borderTop: `1px solid ${border}` }}>
                                    <Pagination count={totalArchivePages} page={archivePage}
                                        onChange={(_, v) => { setArchivePage(v); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                        size="small" sx={paginationSx} />
                                    <Typography fontSize=".71rem" sx={{ color: t.textSecondary }}>
                                        Showing {(archivePage - 1) * CARDS_PER_PAGE + 1}–{Math.min(archivePage * CARDS_PER_PAGE, filteredArchive.length)} of {filteredArchive.length} projects
                                    </Typography>
                                </Stack>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Dialogs */}
            <FileReviewDialog
                open={Boolean(reviewTeam)} onClose={() => setReviewTeam(null)} team={reviewTeam}
                accentColor={accentColor} isDark={isDark} t={t} border={border} paperBg={paperBg}
                onArchived={handleArchived} />

            <ArchiveDetailDialog
                open={archiveDetailOpen} onClose={() => { setArchiveDetailOpen(false); setSelectedArchive(null); }}
                project={selectedArchive}
                accentColor={accentColor} isDark={isDark} t={t} border={border} paperBg={paperBg} />

            <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity={snack.sev} variant="filled" sx={{ borderRadius: 2, fontSize: "0.82rem" }}>{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}