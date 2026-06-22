// src/components/common/supervisor/Groups/DiscussionSlotModal.jsx

import { useEffect, useState, useCallback } from "react";
import { Dialog, Box, Typography, Stack, CircularProgress, IconButton, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon                  from "@mui/icons-material/Close";
import EventOutlinedIcon          from "@mui/icons-material/EventOutlined";
import LocationOnOutlinedIcon     from "@mui/icons-material/LocationOnOutlined";
import NotesOutlinedIcon          from "@mui/icons-material/NotesOutlined";
import CheckCircleIcon            from "@mui/icons-material/CheckCircle";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import SchoolOutlined             from "@mui/icons-material/SchoolOutlined";

import { getMyTeamsSlots } from "../../../../api/handler/endpoints/headOfDepartmentApi";

const PRIMARY = "#d0895b";

const fmtDateTime = (iso) => {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleString("en-GB", {
            weekday: "short", day: "2-digit", month: "short",
            year: "numeric", hour: "2-digit", minute: "2-digit",
        });
    } catch { return iso; }
};

export default function DiscussionSlotModal({ open, team, onClose }) {
    const theme  = useTheme();
    const isDark = theme.palette.mode === "dark";
    const border   = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const dialogBg = isDark ? "#252930" : "#ffffff";
    const tPri     = theme.palette.text.primary;
    const tSec     = theme.palette.text.secondary;

    const [slot,    setSlot]    = useState(null);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);

    const fetchSlot = useCallback(async () => {
        if (!team?.id) return;
        setLoading(true); setError(null); setSlot(null);
        try {
            const res  = await getMyTeamsSlots();
            const list = Array.isArray(res) ? res : (res?.data ?? []);
            const entry = list.find((e) => e.teamId === team.id);
            setSlot(entry?.assignedSlot ?? null);
        } catch {
            setError("Failed to load discussion slot.");
        } finally { setLoading(false); }
    }, [team?.id]);

    useEffect(() => {
        if (open) fetchSlot();
        else { setSlot(null); setError(null); }
    }, [open, fetchSlot]);

    const rows = slot ? [
        { Icon: EventOutlinedIcon,      color: PRIMARY,   label: "Date & Time", value: fmtDateTime(slot.dateTime), highlight: true  },
        { Icon: LocationOnOutlinedIcon, color: "#7E9FC4", label: "Location",    value: slot.location ?? "—",       highlight: false },
        { Icon: SchoolOutlined,         color: "#6D8A7D", label: "Department",  value: slot.department ?? "—",     highlight: false },
        ...(slot.notes ? [{ Icon: NotesOutlinedIcon, color: "#C49A6C", label: "Notes", value: slot.notes, highlight: false }] : []),
    ] : [];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
            PaperProps={{ sx: { borderRadius: "12px", border: `1px solid ${border}`, bgcolor: dialogBg, backgroundImage: "none" } }}>

            <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${border}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" gap={1.2}>
                        <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: `${PRIMARY}12`, border: `1px solid ${PRIMARY}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <EventOutlinedIcon sx={{ fontSize: 17, color: PRIMARY }} />
                        </Box>
                        <Box>
                            <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: tPri }}>Discussion Slot</Typography>
                            {team?.projectTitle && (
                                <Typography fontSize="0.72rem" sx={{ color: tSec, mt: 0.1 }}>{team.projectTitle}</Typography>
                            )}
                        </Box>
                    </Stack>
                    <IconButton size="small" onClick={onClose} sx={{ color: tSec }}>
                        <CloseIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                </Stack>
            </Box>

            <Box sx={{ px: 3, py: 2.5 }}>
                {loading && <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress size={22} sx={{ color: PRIMARY }} /></Box>}
                {!loading && error && <Typography sx={{ color: "#e57373", fontSize: "0.82rem", textAlign: "center" }}>{error}</Typography>}

                {!loading && !error && !slot && (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                        <Box sx={{ width: 52, height: 52, borderRadius: 3, mx: "auto", mb: 2, bgcolor: `${PRIMARY}10`, border: `1px solid ${PRIMARY}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <HourglassEmptyOutlinedIcon sx={{ fontSize: 24, color: PRIMARY, opacity: 0.7 }} />
                        </Box>
                        <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: tPri, mb: 0.5 }}>No Discussion Slot Assigned</Typography>
                        <Typography fontSize="0.76rem" sx={{ color: tSec, maxWidth: 240, mx: "auto" }}>
                            The Head of Department will assign a slot when ready.
                        </Typography>
                    </Box>
                )}

                {!loading && !error && slot && (
                    <Stack spacing={1.5}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(61,185,122,0.08)", border: "1px solid rgba(61,185,122,0.22)", display: "flex", alignItems: "center", gap: 1.2 }}>
                            <CheckCircleIcon sx={{ fontSize: 18, color: "#3DB97A", flexShrink: 0 }} />
                            <Box>
                                <Typography fontSize="0.8rem" fontWeight={700} sx={{ color: "#3DB97A" }}>Discussion Slot Confirmed</Typography>
                                <Typography fontSize="0.7rem" sx={{ color: tSec }}>Slot #{slot.id} · Assigned by Head of Department</Typography>
                            </Box>
                        </Box>
                        {rows.map((row) => (
                            <Stack key={row.label} direction="row" alignItems="flex-start" gap={1.5} sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${border}`, bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)" }}>
                                <Box sx={{ width: 30, height: 30, borderRadius: 1.5, flexShrink: 0, bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <row.Icon sx={{ fontSize: 15, color: row.color }} />
                                </Box>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography fontSize="0.65rem" fontWeight={700} sx={{ color: tSec, textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.3 }}>{row.label}</Typography>
                                    <Typography fontSize="0.84rem" fontWeight={row.highlight ? 700 : 500} sx={{ color: row.highlight ? tPri : tSec, wordBreak: "break-word" }}>{row.value}</Typography>
                                </Box>
                            </Stack>
                        ))}
                    </Stack>
                )}
            </Box>

            <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${border}`, display: "flex", justifyContent: "flex-end" }}>
                <Button onClick={onClose} sx={{ color: tSec, textTransform: "none", fontWeight: 500, borderRadius: 2 }}>Close</Button>
            </Box>
        </Dialog>
    );
}