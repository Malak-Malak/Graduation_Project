// src/components/common/supervisor/Groups/GroupCard.jsx

import { useState, useRef, useEffect } from "react";
import {
    Box, Typography, Stack, Chip, Paper, Tooltip, Button,
    Dialog, DialogContent, IconButton, Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import FolderOutlinedIcon        from "@mui/icons-material/FolderOutlined";
import DashboardOutlinedIcon     from "@mui/icons-material/DashboardOutlined";
import EventOutlinedIcon         from "@mui/icons-material/EventOutlined";
import InfoOutlinedIcon          from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon            from "@mui/icons-material/ExpandMore";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CloseIcon                 from "@mui/icons-material/Close";

/* ── palette (mirrors ArchivedProjectCard exactly) ── */
const PALETTE = ["#C97B4B", "#5B8FA8", "#6D8A7D", "#9B7EC8", "#A85B6D", "#7A9E5B"];
const ini     = (n = "") => (n ?? "").split(" ").map((w) => w[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";
const palette = (i)      => PALETTE[i % PALETTE.length];

/* ── action items ── */
const MENU_ITEMS = [
    { key: "description", Icon: InfoOutlinedIcon,      label: "Description",     sub: "View project description",      accent: "#6D8A7D" },
    { key: "kanban1",     Icon: DashboardOutlinedIcon, label: "Kanban — Phase 1", sub: "Monitor phase 1 board",         accent: "#5B8AF0" },
    { key: "kanban2",     Icon: DashboardOutlinedIcon, label: "Kanban — Phase 2", sub: "Monitor phase 2 board",         accent: "#A85B6D" },
    { key: "files",       Icon: FolderOutlinedIcon,    label: "Files",            sub: "View submitted files",          accent: "#7E9FC4" },
    { key: "discussion",  Icon: EventOutlinedIcon,     label: "Discussion Slot",  sub: "View scheduled discussion",     accent: "#C97B4B" },
];

/* ══════════════════════════════════════════════════════════════
   ACTION POPUP
══════════════════════════════════════════════════════════════ */
function ActionPopup({ open, onSelect, onClose, isDark, paperBg, border, tPri, tSec }) {
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            ref={ref}
            onClick={(e) => e.stopPropagation()}
            style={{
                position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0, zIndex: 1400,
                background: paperBg,
                border: `1px solid ${border}`,
                borderRadius: 14,
                boxShadow: isDark
                    ? "0 20px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)"
                    : "0 8px 32px rgba(0,0,0,0.13)",
                padding: 6,
                display: "flex", flexDirection: "column", gap: 2,
            }}
        >
            {MENU_ITEMS.map(({ key, Icon, label, sub, accent }) => (
                <button
                    key={key}
                    onClick={() => { onSelect(key); onClose(); }}
                    style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 11px", borderRadius: 10,
                        border: "1px solid transparent", background: "transparent",
                        cursor: "pointer", textAlign: "left", width: "100%",
                        transition: "all 0.13s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background    = `${accent}12`;
                        e.currentTarget.style.borderColor   = `${accent}28`;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background    = "transparent";
                        e.currentTarget.style.borderColor   = "transparent";
                    }}
                >
                    <div style={{
                        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                        background: `${accent}12`, border: `1px solid ${accent}28`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <Icon sx={{ fontSize: 15, color: accent }} />
                    </div>
                    <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: tPri, marginBottom: 1 }}>{label}</div>
                        <div style={{ fontSize: 10.5, color: tSec }}>{sub}</div>
                    </div>
                </button>
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   DESCRIPTION MODAL
══════════════════════════════════════════════════════════════ */
function DescriptionModal({ open, onClose, group, isDark, border, paperBg, aClr }) {
    const tPri = isDark ? "#e2e5eb" : "#172b4d";
    const tSec = isDark ? "#8d9199" : "#5e6c84";

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "14px",
                    border: `1px solid ${border}`,
                    bgcolor: paperBg,
                    backgroundImage: "none",
                },
            }}
        >
            <Box sx={{ height: 3, bgcolor: aClr }} />
            <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${border}` }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" gap={1.2}>
                        <Box sx={{
                            width: 32, height: 32, borderRadius: 1.5,
                            bgcolor: `${aClr}15`, border: `1px solid ${aClr}30`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.65rem", fontWeight: 700, color: aClr, flexShrink: 0,
                        }}>
                            {ini(group?.projectTitle ?? group?.name)}
                        </Box>
                        <Box>
                            <Typography fontWeight={700} fontSize="0.93rem" sx={{ color: tPri }}>
                                {group?.projectTitle ?? group?.name ?? "Project"}
                            </Typography>
                            {group?.teamName && group.teamName !== (group.projectTitle ?? group.name) && (
                                <Typography fontSize="0.72rem" sx={{ color: tSec, mt: 0.1 }}>
                                    {group.teamName}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                    <IconButton size="small" onClick={onClose} sx={{ color: tSec }}>
                        <CloseIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                </Stack>
            </Box>

            <DialogContent sx={{ px: 3, py: 2.5 }}>
                {group?.projectDescription ? (
                    <Typography
                        fontSize="0.86rem"
                        sx={{ color: tSec, lineHeight: 1.75, whiteSpace: "pre-wrap" }}
                    >
                        {group.projectDescription}
                    </Typography>
                ) : (
                    <Box sx={{
                        textAlign: "center", py: 4,
                        border: `1.5px dashed ${aClr}25`,
                        borderRadius: 2, bgcolor: `${aClr}04`,
                    }}>
                        <InfoOutlinedIcon sx={{ fontSize: 26, color: aClr, opacity: 0.35, mb: 1 }} />
                        <Typography fontSize="0.82rem" sx={{ color: tSec }}>
                            No description added for this project.
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <Divider sx={{ borderColor: border }} />
            <Box sx={{ px: 3, py: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                    onClick={onClose}
                    sx={{ color: tSec, textTransform: "none", fontWeight: 500, borderRadius: 2 }}
                >
                    Close
                </Button>
            </Box>
        </Dialog>
    );
}

/* ══════════════════════════════════════════════════════════════
   GROUP CARD  —  mirrors ArchivedProjectCard exactly
══════════════════════════════════════════════════════════════ */
export default function GroupCard({ g, onOpenKanban, onOpenFiles, onOpenSlot }) {
    const theme  = useTheme();
    const isDark = theme.palette.mode === "dark";

    const [popupOpen, setPopupOpen]   = useState(false);
    const [descOpen,  setDescOpen]    = useState(false);

    /* colour — same logic as ArchivedProjectCard */
    const colorIdx = Math.abs(
        (g.id ?? 0) + ((g.projectTitle ?? g.name ?? "").charCodeAt(0) || 0)
    ) % PALETTE.length;
    const aClr    = palette(colorIdx);
    const cardBg  = isDark ? "rgba(255,255,255,0.025)" : "#fff";
    const border  = isDark ? "rgba(255,255,255,0.07)"  : "rgba(0,0,0,0.08)";
    const tPri    = theme.palette.text.primary;
    const tSec    = theme.palette.text.secondary;
    const paperBg = theme.palette.background.paper;

    const memberCount = g.members?.length ?? 0;

    const handleSelect = (key) => {
        if      (key === "files")       onOpenFiles(g);
        else if (key === "kanban1")     onOpenKanban(g, 1);
        else if (key === "kanban2")     onOpenKanban(g, 2);
        else if (key === "discussion")  onOpenSlot(g);
        else if (key === "description") setDescOpen(true);
    };

    return (
        <>
            {/* ── Card ──────────────────────────────────────────── */}
            <Paper elevation={0} sx={{
                borderRadius: 2.5,
                bgcolor: cardBg,
                border: `1px solid ${border}`,
                borderLeft: `3px solid ${aClr}`,   /* ← same as ArchivedProjectCard */
                overflow: "visible",
                display: "flex", flexDirection: "column", height: "100%",
                transition: "box-shadow 0.15s",
                "&:hover": {
                    boxShadow: isDark
                        ? "0 4px 20px rgba(0,0,0,0.25)"
                        : "0 4px 16px rgba(0,0,0,0.07)",
                },
            }}>

                {/* ── Header ── */}
                <Stack
                    direction="row" alignItems="center" justifyContent="space-between"
                    sx={{
                        px: 2, py: 1,
                        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
                        bgcolor: isDark ? "rgba(255,255,255,0.02)" : `${aClr}06`,
                        borderRadius: "10px 10px 0 0",
                        flexShrink: 0,
                    }}
                >
                    <Stack direction="row" alignItems="center" gap={1} minWidth={0} flex={1} overflow="hidden">
                        <Box sx={{
                            width: 28, height: 28, borderRadius: 1.5, flexShrink: 0,
                            bgcolor: `${aClr}15`, border: `1px solid ${aClr}30`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.65rem", fontWeight: 700, color: aClr,
                        }}>
                            {ini(g.projectTitle ?? g.name)}
                        </Box>
                        <Typography noWrap sx={{ fontWeight: 700, fontSize: "0.88rem", color: tPri }}>
                            {g.projectTitle ?? g.name ?? "Unnamed"}
                        </Typography>
                    </Stack>

                    {/* Status chip — same as P1/P2 chips in ArchivedProjectCard */}
                    <Chip
                        label={g.status ?? "Active"}
                        size="small"
                        sx={{
                            height: 18, borderRadius: "5px", ml: 1, flexShrink: 0,
                            bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                            color: tSec, fontSize: "0.6rem", fontWeight: 700,
                        }}
                    />
                </Stack>

                {/* ── Body ── */}
                <Box sx={{ px: 2.5, pt: 1.5, pb: 2, display: "flex", flexDirection: "column", flex: 1 }}>

                    {/* Description — clipped 2 lines, same as ArchivedProjectCard */}
                    {g.projectDescription && (
                        <Typography sx={{
                            fontSize: "0.78rem", color: tSec, lineHeight: 1.65, mb: 1.2,
                            display: "-webkit-box", WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>
                            {g.projectDescription}
                        </Typography>
                    )}

                    {/* Meta row */}
                    <Stack direction="row" gap={1} flexWrap="wrap" mb={1.5}>
                        {g.lastActive && (
                            <Stack direction="row" alignItems="center" gap={0.4}>
                                <CalendarTodayOutlinedIcon sx={{ fontSize: 11, color: tSec }} />
                                <Typography sx={{ fontSize: "0.72rem", color: tSec }}>{g.lastActive}</Typography>
                            </Stack>
                        )}
                        {g.teamName && g.teamName !== (g.projectTitle ?? g.name) && (
                            <Chip
                                label={g.teamName} size="small"
                                sx={{
                                    height: 18, borderRadius: "5px",
                                    bgcolor: `${aClr}12`, color: aClr,
                                    fontSize: "0.6rem", fontWeight: 600,
                                    border: `1px solid ${aClr}25`,
                                }}
                            />
                        )}
                    </Stack>

                    {/* Members — full names listed (one row per member) */}
                    {memberCount > 0 ? (
                        <Stack gap={0.6} mb={1.5}>
                            {(g.members ?? []).map((m, i) => (
                                <Stack key={m.userId ?? i} direction="row" alignItems="center" gap={0.8}>
                                    <Box sx={{
                                        width: 20, height: 20, borderRadius: "6px", flexShrink: 0,
                                        bgcolor: palette(i),
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "0.5rem", fontWeight: 700, color: "#fff",
                                    }}>
                                        {ini(m.fullName)}
                                    </Box>
                                    <Typography noWrap sx={{ fontSize: "0.74rem", color: tSec, fontWeight: 500 }}>
                                        {m.fullName ?? "—"}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    ) : (
                        <Typography sx={{ fontSize: "0.75rem", color: tSec, fontStyle: "italic", mb: 1.5 }}>
                            No members yet
                        </Typography>
                    )}

                    <Box sx={{ flex: 1 }} />

                    {/* ── Open button + popup ── */}
                    <Box sx={{ position: "relative" }}>
                        <ActionPopup
                            open={popupOpen}
                            onSelect={handleSelect}
                            onClose={() => setPopupOpen(false)}
                            isDark={isDark}
                            paperBg={paperBg}
                            border={border}
                            tPri={tPri}
                            tSec={tSec}
                        />
                        <Button
                            variant="outlined"
                            size="small"
                            fullWidth
                            endIcon={
                                <ExpandMoreIcon sx={{
                                    fontSize: 16,
                                    transform: popupOpen ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "transform 0.2s",
                                }} />
                            }
                            onClick={(e) => { e.stopPropagation(); setPopupOpen((p) => !p); }}
                            sx={{
                                borderRadius: 2, textTransform: "none",
                                fontSize: "0.78rem", fontWeight: 600,
                                borderColor: popupOpen ? aClr : border,
                                color:       popupOpen ? aClr : tSec,
                                bgcolor:     popupOpen ? `${aClr}08` : "transparent",
                                "&:hover": { borderColor: aClr, color: aClr, bgcolor: `${aClr}08` },
                                transition: "all .15s",
                            }}
                        >
                            Open
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* ── Description modal ── */}
            <DescriptionModal
                open={descOpen}
                onClose={() => setDescOpen(false)}
                group={g}
                isDark={isDark}
                border={border}
                paperBg={paperBg}
                aClr={aClr}
            />
        </>
    );
}