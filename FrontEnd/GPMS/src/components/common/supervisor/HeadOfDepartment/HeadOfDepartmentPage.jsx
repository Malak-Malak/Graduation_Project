// src/components/common/supervisor/HeadOfDepartment/HeadOfDepartmentPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@mui/material/styles";
import {
    Box, Typography, Stack, Paper, Button, Chip, Avatar,
    CircularProgress, Snackbar, Alert, Tooltip, IconButton,
    Dialog, TextField, Tab, Tabs, Table, TableBody,
    TableCell, TableHead, TableRow, TableContainer, AvatarGroup,
} from "@mui/material";

import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import NoteOutlinedIcon from "@mui/icons-material/NoteOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CloseIcon from "@mui/icons-material/Close";

import {
    createSlot, deleteSlot, getSlots, assignTeamToSlot,
    getDepartmentTeams, getDepartmentSupervisors,
    getStudentRequests, reviewStudentRequest, getDepartmentStudents,
} from "../../../../api/handler/endpoints/headOfDepartmentApi";

const ACCENT = "#c87941";
const ACCENT_LIGHT = "#e8a96e";
const GREEN = "#3a9e6f";
const RED = "#d95555";
const MBR_COLORS = ["#c87941", "#5b8fa8", "#6d8a7d", "#9b7ec8", "#a85b6d"];

const initials = (name = "") =>
    (name ?? "").split(" ").map(w => w[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";

const statusMeta = (s) => {
    const v = (s ?? "").toLowerCase();
    if (v === "active" || v.includes("accept")) return { bg: `${GREEN}18`, fg: GREEN };
    if (v === "pending") return { bg: `${ACCENT}18`, fg: ACCENT };
    if (v.includes("reject")) return { bg: `${RED}18`, fg: RED };
    return { bg: `${ACCENT}18`, fg: ACCENT };
};

const extractErr = (e, fallback = "Something went wrong.") =>
    e?.response?.data?.message || e?.response?.data?.error || e?.message || fallback;

const fmtDateTime = (dt) => {
    if (!dt) return "—";
    try {
        return new Date(dt).toLocaleString("en-GB", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    } catch { return dt; }
};

/* ════════════════════════════════════════════════════════════════
   TAB 0 — DISCUSSION SLOTS
════════════════════════════════════════════════════════════════ */
function DiscussionSlotsTab({ accent, brd, paperBg, isDark, tPri, tSec }) {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState([]);
    const [createOpen, setCreateOpen] = useState(false);
    const [form, setForm] = useState({ dateTime: "", location: "", notes: "" });
    const [createBusy, setCreateBusy] = useState(false);
    const [assignOpen, setAssignOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState("");
    const [assignBusy, setAssignBusy] = useState(false);
    const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
    const snap = (msg, sev = "success") => setSnack({ open: true, msg, sev });

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: "12px", fontSize: "0.875rem",
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: accent },
        },
        "& .MuiInputLabel-root.Mui-focused": { color: accent },
        "& .MuiInputLabel-root": { fontSize: "0.875rem" },
    };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [s, t] = await Promise.all([getSlots(), getDepartmentTeams()]);
            setSlots(Array.isArray(s) ? s : s?.data ?? []);
            setTeams(Array.isArray(t) ? t : t?.data ?? []);
        } catch { }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleCreate = async () => {
        if (!form.dateTime || !form.location.trim()) { snap("Date/time and location are required.", "error"); return; }
        try {
            setCreateBusy(true);
            await createSlot({ dateTime: new Date(form.dateTime).toISOString(), location: form.location.trim(), notes: form.notes.trim() || undefined });
            snap("Slot created!");
            setCreateOpen(false);
            setForm({ dateTime: "", location: "", notes: "" });
            load();
        } catch (e) { snap(extractErr(e, "Failed to create slot."), "error"); }
        finally { setCreateBusy(false); }
    };

    const handleDelete = async (slotId) => {
        try { await deleteSlot(slotId); snap("Slot deleted."); load(); }
        catch (e) { snap(extractErr(e, "Failed to delete slot."), "error"); }
    };

    const handleAssign = async () => {
        if (!selectedTeam) return;
        try {
            setAssignBusy(true);
            await assignTeamToSlot({ teamId: Number(selectedTeam), slotId: selectedSlot.slotId ?? selectedSlot.id });
            snap("Team assigned to slot!");
            setAssignOpen(false);
            setSelectedTeam("");
            load();
        } catch (e) { snap(extractErr(e, "Failed to assign team."), "error"); }
        finally { setAssignBusy(false); }
    };

    // team has no slot if assignedSlot is null
    const unassignedTeams = teams.filter(t => !t.assignedSlot && !(t.slotId ?? t.discussionSlotId));

    return (
        <Box sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: tSec, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Final Discussion Slots ({slots.length})
                </Typography>
                <Stack direction="row" gap={1}>
                    <Tooltip title="Refresh">
                        <IconButton size="small" onClick={load} sx={{ color: tSec, border: `1px solid ${brd}`, borderRadius: "9px" }}>
                            {loading ? <CircularProgress size={14} sx={{ color: accent }} /> : <RefreshOutlinedIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                    </Tooltip>
                    <Button size="small" variant="contained" startIcon={<AddCircleOutlineIcon sx={{ fontSize: 15 }} />}
                        onClick={() => setCreateOpen(true)}
                        sx={{ bgcolor: accent, borderRadius: "10px", textTransform: "none", fontWeight: 700, fontSize: "0.78rem", boxShadow: "none", "&:hover": { bgcolor: isDark ? ACCENT : "#a8622e", boxShadow: "none" } }}>
                        New Slot
                    </Button>
                </Stack>
            </Stack>

            {loading ? (
                <Box display="flex" justifyContent="center" pt={6}><CircularProgress sx={{ color: accent }} /></Box>
            ) : slots.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 7, border: `1px dashed ${ACCENT}30`, borderRadius: "14px", bgcolor: `${ACCENT}05` }}>
                    <EventOutlinedIcon sx={{ fontSize: 36, color: accent, opacity: 0.4, mb: 1 }} />
                    <Typography fontSize="0.84rem" sx={{ color: tSec }}>No slots created yet</Typography>
                    <Typography fontSize="0.74rem" sx={{ color: tSec, mt: 0.4 }}>Create a slot and assign teams to schedule final discussions</Typography>
                </Box>
            ) : (
                <Stack gap={1.5}>
                    {slots.map((slot) => {
                        const slotId = slot.slotId ?? slot.id;
                        // assignedTeams from slot.assignedTeams array
                        const assignedTeams = slot.assignedTeams ?? teams.filter(t => (t.slotId ?? t.discussionSlotId) === slotId);
                        return (
                            <Paper key={slotId} elevation={0} sx={{ p: 2, borderRadius: "14px", border: `1px solid ${brd}`, bgcolor: paperBg }}>
                                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
                                    <Stack gap={1} flex={1}>
                                        <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
                                            <Stack direction="row" alignItems="center" gap={0.6}>
                                                <EventOutlinedIcon sx={{ fontSize: 15, color: accent }} />
                                                <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: tPri }}>
                                                    {fmtDateTime(slot.dateTime ?? slot.date)}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" alignItems="center" gap={0.5}>
                                                <LocationOnOutlinedIcon sx={{ fontSize: 14, color: tSec }} />
                                                <Typography fontSize="0.82rem" sx={{ color: tSec }}>{slot.location ?? "—"}</Typography>
                                            </Stack>
                                            {slot.department && (
                                                <Chip label={slot.department} size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 600, bgcolor: `${accent}12`, color: accent, borderRadius: "6px" }} />
                                            )}
                                        </Stack>
                                        {slot.notes && (
                                            <Stack direction="row" alignItems="center" gap={0.5}>
                                                <NoteOutlinedIcon sx={{ fontSize: 13, color: tSec }} />
                                                <Typography fontSize="0.74rem" sx={{ color: tSec }}>{slot.notes}</Typography>
                                            </Stack>
                                        )}
                                        {/* Assigned teams */}
                                        {assignedTeams.length > 0 ? (
                                            <Stack gap={0.6} mt={0.5}>
                                                <Typography fontSize="0.7rem" fontWeight={700} sx={{ color: tSec, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                                    Assigned Teams
                                                </Typography>
                                                {assignedTeams.map((t, ti) => (
                                                    <Stack key={t.teamId ?? t.id ?? ti} direction="row" alignItems="center" gap={1}
                                                        sx={{ p: 1, borderRadius: "8px", bgcolor: `${accent}06`, border: `1px solid ${accent}15` }}>
                                                        <GroupsOutlinedIcon sx={{ fontSize: 13, color: accent }} />
                                                        <Typography fontSize="0.78rem" fontWeight={600} sx={{ color: tPri }}>
                                                            {t.teamName ?? t.name ?? "—"}
                                                        </Typography>
                                                        {(t.projectName ?? t.projectTitle) && (
                                                            <Typography fontSize="0.72rem" sx={{ color: tSec }}>· {t.projectName ?? t.projectTitle}</Typography>
                                                        )}
                                                    </Stack>
                                                ))}
                                            </Stack>
                                        ) : (
                                            <Typography fontSize="0.72rem" sx={{ color: tSec, fontStyle: "italic" }}>No teams assigned yet</Typography>
                                        )}
                                    </Stack>
                                    <Stack direction="row" gap={0.5} flexShrink={0}>
                                        <Tooltip title="Assign a team to this slot">
                                            <Button size="small" variant="outlined"
                                                startIcon={<AssignmentOutlinedIcon sx={{ fontSize: 13 }} />}
                                                disabled={unassignedTeams.length === 0}
                                                onClick={() => { setSelectedSlot(slot); setAssignOpen(true); }}
                                                sx={{ borderColor: `${accent}50`, color: accent, borderRadius: "9px", textTransform: "none", fontWeight: 600, fontSize: "0.72rem", "&:hover": { bgcolor: `${accent}08`, borderColor: accent }, "&.Mui-disabled": { borderColor: `${accent}25`, color: `${accent}50` } }}>
                                                Assign
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Delete slot">
                                            <IconButton size="small" onClick={() => handleDelete(slotId)}
                                                sx={{ color: RED, borderRadius: "8px", "&:hover": { bgcolor: `${RED}0D` } }}>
                                                <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </Stack>
                            </Paper>
                        );
                    })}
                </Stack>
            )}

            {/* Create Slot Dialog */}
            <Dialog open={createOpen} onClose={() => !createBusy && setCreateOpen(false)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: "18px", border: `1px solid ${brd}`, bgcolor: paperBg, overflow: "hidden" } }}>
                <Box sx={{ height: 3, bgcolor: accent }} />
                <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${brd}` }}>
                    <Stack direction="row" alignItems="center" gap={1}>
                        <EventOutlinedIcon sx={{ fontSize: 18, color: accent }} />
                        <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: tPri }}>Create Discussion Slot</Typography>
                    </Stack>
                </Box>
                <Box sx={{ px: 3, py: 2.5 }}>
                    <Stack gap={2}>
                        <TextField label="Date & Time" type="datetime-local" size="small" fullWidth required
                            value={form.dateTime} onChange={e => setForm(f => ({ ...f, dateTime: e.target.value }))}
                            InputLabelProps={{ shrink: true }} sx={inputSx} />
                        <TextField label="Location" size="small" fullWidth required
                            placeholder="e.g. Room 201, Engineering Building"
                            value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} sx={inputSx} />
                        <TextField label="Notes (Optional)" size="small" fullWidth multiline rows={2}
                            value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} sx={inputSx} />
                    </Stack>
                </Box>
                <Box sx={{ px: 3, pb: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <Button disabled={createBusy} onClick={() => setCreateOpen(false)} sx={{ color: tSec, textTransform: "none", fontWeight: 500, borderRadius: "10px" }}>Cancel</Button>
                    <Button variant="contained" disabled={createBusy} onClick={handleCreate}
                        sx={{ bgcolor: accent, borderRadius: "10px", boxShadow: "none", textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: isDark ? ACCENT : "#a8622e", boxShadow: "none" } }}>
                        {createBusy ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Create Slot"}
                    </Button>
                </Box>
            </Dialog>

            {/* Assign Team Dialog */}
            <Dialog open={assignOpen} onClose={() => !assignBusy && setAssignOpen(false)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: "18px", border: `1px solid ${brd}`, bgcolor: paperBg, overflow: "hidden" } }}>
                <Box sx={{ height: 3, bgcolor: accent }} />
                <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${brd}` }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" gap={1}>
                            <AssignmentOutlinedIcon sx={{ fontSize: 18, color: accent }} />
                            <Box>
                                <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: tPri }}>Assign Team to Slot</Typography>
                                {selectedSlot && (
                                    <Typography fontSize="0.73rem" sx={{ color: tSec }}>
                                        {fmtDateTime(selectedSlot.dateTime ?? selectedSlot.date)} · {selectedSlot.location}
                                    </Typography>
                                )}
                            </Box>
                        </Stack>
                        <IconButton size="small" onClick={() => setAssignOpen(false)} sx={{ color: tSec, borderRadius: "8px" }}>
                            <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Stack>
                </Box>
                <Box sx={{ px: 3, py: 2 }}>
                    <Typography fontSize="0.78rem" fontWeight={700} sx={{ color: tSec, mb: 1.2, textTransform: "uppercase", letterSpacing: "0.06em" }}>Select Team</Typography>
                    <Stack gap={1}>
                        {unassignedTeams.map(t => {
                            const tid = String(t.teamId ?? t.id);
                            const selected = selectedTeam === tid;
                            const members = t.memberNames ?? [];
                            return (
                                <Paper key={tid} elevation={0} onClick={() => setSelectedTeam(tid)}
                                    sx={{ p: 1.4, borderRadius: "12px", cursor: "pointer", border: `1.5px solid ${selected ? accent : brd}`, bgcolor: selected ? `${ACCENT}08` : "transparent", transition: "all 0.15s", "&:hover": { borderColor: `${accent}70` } }}>
                                    <Stack direction="row" alignItems="center" gap={1.2}>
                                        <Box sx={{ width: 32, height: 32, borderRadius: "9px", bgcolor: `${ACCENT}12`, border: `1px solid ${ACCENT}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 800, color: accent }}>
                                            {initials(t.teamName ?? t.name ?? "T")}
                                        </Box>
                                        <Box>
                                            <Typography fontWeight={700} fontSize="0.84rem" sx={{ color: tPri }}>{t.teamName ?? t.name ?? "Team"}</Typography>
                                            <Typography fontSize="0.7rem" sx={{ color: tSec }}>{t.projectName ?? t.projectTitle ?? ""}</Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            );
                        })}
                    </Stack>
                </Box>
                <Box sx={{ px: 3, pb: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <Button disabled={assignBusy} onClick={() => setAssignOpen(false)} sx={{ color: tSec, textTransform: "none", fontWeight: 500, borderRadius: "10px" }}>Cancel</Button>
                    <Button variant="contained" disabled={assignBusy || !selectedTeam} onClick={handleAssign}
                        sx={{ bgcolor: accent, borderRadius: "10px", boxShadow: "none", textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: isDark ? ACCENT : "#a8622e", boxShadow: "none" }, "&.Mui-disabled": { opacity: 0.5 } }}>
                        {assignBusy ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Assign"}
                    </Button>
                </Box>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity={snack.sev} variant="filled" sx={{ borderRadius: "12px" }}>{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}

/* ════════════════════════════════════════════════════════════════
   TAB 1 — DEPARTMENT TEAMS
   Real shape: { teamId, projectName, status, supervisorName, memberNames: string[], assignedSlot }
════════════════════════════════════════════════════════════════ */
function DepartmentTeamsTab({ accent, brd, paperBg, isDark, tPri, tSec }) {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const d = await getDepartmentTeams();
            setTeams(Array.isArray(d) ? d : d?.data ?? []);
        } catch { }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    return (
        <Box sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: tSec, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    All Teams ({teams.length})
                </Typography>
                <Tooltip title="Refresh">
                    <IconButton size="small" onClick={load} sx={{ color: tSec, border: `1px solid ${brd}`, borderRadius: "9px" }}>
                        {loading ? <CircularProgress size={14} sx={{ color: accent }} /> : <RefreshOutlinedIcon sx={{ fontSize: 16 }} />}
                    </IconButton>
                </Tooltip>
            </Stack>

            {loading ? (
                <Box display="flex" justifyContent="center" pt={6}><CircularProgress sx={{ color: accent }} /></Box>
            ) : teams.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 7, border: `1px dashed ${ACCENT}30`, borderRadius: "14px", bgcolor: `${ACCENT}05` }}>
                    <GroupsOutlinedIcon sx={{ fontSize: 36, color: accent, opacity: 0.4, mb: 1 }} />
                    <Typography fontSize="0.84rem" sx={{ color: tSec }}>No teams in your department</Typography>
                </Box>
            ) : (
                <Stack gap={1.5}>
                    {teams.map((team, i) => {
                        const tid = team.teamId ?? team.id;
                        const m = statusMeta(team.status ?? "active");
                        const hasSlot = team.assignedSlot != null;
                        // memberNames is string[]
                        const memberNames = team.memberNames ?? [];
                        return (
                            <Paper key={tid ?? i} elevation={0} sx={{ p: 2, borderRadius: "14px", border: `1px solid ${brd}`, bgcolor: paperBg }}>
                                <Stack direction="row" alignItems="flex-start" gap={1.5}>
                                    {/* Team avatar */}
                                    <Box sx={{
                                        width: 44, height: 44, borderRadius: "12px", flexShrink: 0,
                                        bgcolor: `${MBR_COLORS[i % MBR_COLORS.length]}15`,
                                        border: `1.5px solid ${MBR_COLORS[i % MBR_COLORS.length]}30`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "0.88rem", fontWeight: 800, color: MBR_COLORS[i % MBR_COLORS.length],
                                    }}>
                                        {initials(team.teamName ?? team.name ?? "T")}
                                    </Box>
                                    <Box flex={1} minWidth={0}>
                                        {/* Title row */}
                                        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" mb={0.3}>
                                            <Typography fontWeight={700} fontSize="0.92rem" sx={{ color: tPri }}>
                                                {team.teamName ?? team.name ?? "—"}
                                            </Typography>
                                            <Chip label={team.status ?? "Active"} size="small" sx={{ height: 18, fontSize: "0.62rem", fontWeight: 700, bgcolor: m.bg, color: m.fg, borderRadius: "6px" }} />
                                        </Stack>

                                        {/* Project name */}
                                        {(team.projectName ?? team.projectTitle) && (
                                            <Typography fontSize="0.78rem" sx={{ color: tSec, mb: 0.8 }}>
                                                📁 {team.projectName ?? team.projectTitle}
                                            </Typography>
                                        )}

                                        {/* Members */}
                                        {memberNames.length > 0 && (
                                            <Stack direction="row" flexWrap="wrap" gap={0.6} mb={0.8}>
                                                {memberNames.map((name, j) => (
                                                    <Stack key={j} direction="row" alignItems="center" gap={0.5}
                                                        sx={{ px: 1, py: 0.3, borderRadius: "6px", bgcolor: `${MBR_COLORS[j % MBR_COLORS.length]}10`, border: `1px solid ${MBR_COLORS[j % MBR_COLORS.length]}20` }}>
                                                        <Box sx={{
                                                            width: 18, height: 18, borderRadius: "50%",
                                                            bgcolor: MBR_COLORS[j % MBR_COLORS.length],
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            fontSize: "0.58rem", fontWeight: 800, color: "#fff",
                                                        }}>
                                                            {initials(name)}
                                                        </Box>
                                                        <Typography fontSize="0.72rem" fontWeight={500} sx={{ color: tPri }}>{name}</Typography>
                                                    </Stack>
                                                ))}
                                            </Stack>
                                        )}

                                        {/* Bottom row: supervisor + slot status */}
                                        <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
                                            {team.supervisorName && (
                                                <Stack direction="row" alignItems="center" gap={0.5}>
                                                    <SchoolOutlinedIcon sx={{ fontSize: 13, color: tSec }} />
                                                    <Typography fontSize="0.73rem" sx={{ color: tSec }}>{team.supervisorName}</Typography>
                                                </Stack>
                                            )}
                                            {hasSlot ? (
                                                <Stack direction="row" alignItems="center" gap={0.5}>
                                                    <EventOutlinedIcon sx={{ fontSize: 13, color: GREEN }} />
                                                    <Typography fontSize="0.73rem" fontWeight={600} sx={{ color: GREEN }}>
                                                        {fmtDateTime(team.assignedSlot?.dateTime)} — {team.assignedSlot?.location ?? "Slot assigned"}
                                                    </Typography>
                                                </Stack>
                                            ) : (
                                                <Typography fontSize="0.72rem" sx={{ color: ACCENT, fontStyle: "italic" }}>No slot yet</Typography>
                                            )}
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Paper>
                        );
                    })}
                </Stack>
            )}
        </Box>
    );
}

/* ════════════════════════════════════════════════════════════════
   TAB 2 — DEPARTMENT SUPERVISORS
   Real shape: { userId, username, fullName, teams: [{ teamId, projectName, status, supervisorName, memberNames, assignedSlot }] }
════════════════════════════════════════════════════════════════ */
function DepartmentSupervisorsTab({ accent, brd, paperBg, isDark, tPri, tSec }) {
    const [supervisors, setSupervisors] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const d = await getDepartmentSupervisors();
            setSupervisors(Array.isArray(d) ? d : d?.data ?? []);
        } catch { }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    return (
        <Box sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: tSec, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Supervisors ({supervisors.length})
                </Typography>
                <Tooltip title="Refresh">
                    <IconButton size="small" onClick={load} sx={{ color: tSec, border: `1px solid ${brd}`, borderRadius: "9px" }}>
                        {loading ? <CircularProgress size={14} sx={{ color: accent }} /> : <RefreshOutlinedIcon sx={{ fontSize: 16 }} />}
                    </IconButton>
                </Tooltip>
            </Stack>

            {loading ? (
                <Box display="flex" justifyContent="center" pt={6}><CircularProgress sx={{ color: accent }} /></Box>
            ) : supervisors.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 7, border: `1px dashed ${ACCENT}30`, borderRadius: "14px", bgcolor: `${ACCENT}05` }}>
                    <SchoolOutlinedIcon sx={{ fontSize: 36, color: accent, opacity: 0.4, mb: 1 }} />
                    <Typography fontSize="0.84rem" sx={{ color: tSec }}>No supervisors found</Typography>
                </Box>
            ) : (
                <Stack gap={2}>
                    {supervisors.map((sup, i) => {
                        // real field: sup.teams (same shape as department teams)
                        const supTeams = sup.teams ?? sup.supervisedTeams ?? [];
                        const isHead = sup.isHeadOfDepartment ?? sup.isHead ?? false;
                        return (
                            <Paper key={sup.userId ?? sup.id ?? i} elevation={0} sx={{ borderRadius: "14px", border: `1px solid ${brd}`, bgcolor: paperBg, overflow: "hidden" }}>
                                {/* Supervisor header */}
                                <Stack direction="row" alignItems="center" gap={1.5} sx={{ p: 2, borderBottom: supTeams.length > 0 ? `1px solid ${brd}` : "none" }}>
                                    <Avatar sx={{ width: 42, height: 42, borderRadius: "12px", bgcolor: `${MBR_COLORS[i % MBR_COLORS.length]}15`, color: MBR_COLORS[i % MBR_COLORS.length], fontWeight: 800, fontSize: "0.9rem" }}>
                                        {initials(sup.fullName ?? sup.name ?? "S")}
                                    </Avatar>
                                    <Box flex={1}>
                                        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                                            <Typography fontWeight={700} fontSize="0.92rem" sx={{ color: tPri }}>
                                                {sup.fullName ?? sup.name ?? "—"}
                                            </Typography>
                                            {isHead && (
                                                <Chip label="Head of Dept." size="small" sx={{ height: 18, fontSize: "0.6rem", fontWeight: 700, bgcolor: `${ACCENT}18`, color: accent, borderRadius: "6px" }} />
                                            )}
                                        </Stack>
                                        <Typography fontSize="0.74rem" sx={{ color: tSec }}>
                                            @{sup.username ?? "—"} · {supTeams.length} team{supTeams.length !== 1 ? "s" : ""} supervised
                                        </Typography>
                                    </Box>
                                </Stack>

                                {/* Teams under this supervisor */}
                                {supTeams.length > 0 && (
                                    <Stack gap={0} sx={{ px: 2, py: 1.2 }}>
                                        {supTeams.map((t, j) => {
                                            const members = t.memberNames ?? [];
                                            const hasSlot = t.assignedSlot != null;
                                            return (
                                                <Box key={t.teamId ?? t.id ?? j}
                                                    sx={{ py: 1.2, borderBottom: j < supTeams.length - 1 ? `1px solid ${brd}` : "none" }}>
                                                    <Stack direction="row" alignItems="flex-start" gap={1.2}>
                                                        <Box sx={{
                                                            width: 8, height: 8, borderRadius: "50%", mt: 0.7, flexShrink: 0,
                                                            bgcolor: MBR_COLORS[j % MBR_COLORS.length],
                                                        }} />
                                                        <Box flex={1}>
                                                            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                                                                <Typography fontSize="0.82rem" fontWeight={700} sx={{ color: tPri }}>
                                                                    {t.teamName ?? t.name ?? "—"}
                                                                </Typography>
                                                                {t.status && (
                                                                    <Chip label={t.status} size="small" sx={{ height: 16, fontSize: "0.58rem", fontWeight: 700, bgcolor: statusMeta(t.status).bg, color: statusMeta(t.status).fg, borderRadius: "5px" }} />
                                                                )}
                                                            </Stack>
                                                            {(t.projectName ?? t.projectTitle) && (
                                                                <Typography fontSize="0.74rem" sx={{ color: tSec, mt: 0.2 }}>
                                                                    {t.projectName ?? t.projectTitle}
                                                                </Typography>
                                                            )}
                                                            {/* Member name pills */}
                                                            {members.length > 0 && (
                                                                <Stack direction="row" flexWrap="wrap" gap={0.5} mt={0.6}>
                                                                    {members.map((name, k) => (
                                                                        <Stack key={k} direction="row" alignItems="center" gap={0.4}
                                                                            sx={{ px: 0.8, py: 0.2, borderRadius: "5px", bgcolor: `${MBR_COLORS[k % MBR_COLORS.length]}10` }}>
                                                                            <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: MBR_COLORS[k % MBR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5rem", fontWeight: 800, color: "#fff" }}>
                                                                                {initials(name)}
                                                                            </Box>
                                                                            <Typography fontSize="0.68rem" sx={{ color: tPri }}>{name}</Typography>
                                                                        </Stack>
                                                                    ))}
                                                                </Stack>
                                                            )}
                                                            {/* Slot info */}
                                                            <Stack direction="row" alignItems="center" gap={0.5} mt={0.5}>
                                                                {hasSlot ? (
                                                                    <>
                                                                        <EventOutlinedIcon sx={{ fontSize: 12, color: GREEN }} />
                                                                        <Typography fontSize="0.7rem" fontWeight={600} sx={{ color: GREEN }}>
                                                                            {fmtDateTime(t.assignedSlot?.dateTime)} — {t.assignedSlot?.location}
                                                                        </Typography>
                                                                    </>
                                                                ) : (
                                                                    <Typography fontSize="0.7rem" sx={{ color: ACCENT, fontStyle: "italic" }}>No slot assigned</Typography>
                                                                )}
                                                            </Stack>
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                            );
                                        })}
                                    </Stack>
                                )}
                            </Paper>
                        );
                    })}
                </Stack>
            )}
        </Box>
    );
}

/* ════════════════════════════════════════════════════════════════
   TAB 3 — STUDENT REQUESTS
════════════════════════════════════════════════════════════════ */
function StudentRequestsTab({ accent, brd, paperBg, isDark, tPri, tSec }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionBusy, setActionBusy] = useState(null);
    const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
    const snap = (msg, sev = "success") => setSnack({ open: true, msg, sev });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const d = await getStudentRequests();
            setRequests(Array.isArray(d) ? d : d?.data ?? []);
        } catch { }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleReview = async (requestId, isApproved) => {
        setActionBusy(requestId);
        try {
            await reviewStudentRequest({ requestId, isApproved });
            snap(isApproved ? "Request approved!" : "Request rejected.");
            setRequests(prev => prev.filter(r => (r.requestId ?? r.id) !== requestId));
        } catch (e) { snap(extractErr(e, "Failed to process request."), "error"); }
        finally { setActionBusy(null); }
    };

    return (
        <Box sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: tSec, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Pending Student Requests ({requests.length})
                </Typography>
                <Tooltip title="Refresh">
                    <IconButton size="small" onClick={load} sx={{ color: tSec, border: `1px solid ${brd}`, borderRadius: "9px" }}>
                        {loading ? <CircularProgress size={14} sx={{ color: accent }} /> : <RefreshOutlinedIcon sx={{ fontSize: 16 }} />}
                    </IconButton>
                </Tooltip>
            </Stack>

            {loading ? (
                <Box display="flex" justifyContent="center" pt={6}><CircularProgress sx={{ color: accent }} /></Box>
            ) : requests.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 7, border: `1px dashed ${ACCENT}30`, borderRadius: "14px", bgcolor: `${ACCENT}05` }}>
                    <HowToRegOutlinedIcon sx={{ fontSize: 36, color: accent, opacity: 0.4, mb: 1 }} />
                    <Typography fontSize="0.84rem" sx={{ color: tSec }}>No pending requests</Typography>
                </Box>
            ) : (
                <Stack gap={1.5}>
                    {requests.map((req) => {
                        const rid = req.requestId ?? req.id;
                        const name = req.fullName ?? req.name ?? req.studentName ?? "—";
                        const email = req.universityEmail ?? req.email ?? "";
                        const date = req.requestDate ?? req.createdAt ?? null;
                        const busy = actionBusy === rid;
                        return (
                            <Paper key={rid} elevation={0} sx={{ p: 2, borderRadius: "14px", border: `1px solid ${brd}`, bgcolor: paperBg, opacity: busy ? 0.6 : 1, transition: "opacity 0.2s" }}>
                                <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" gap={1.5}>
                                    <Stack direction="row" alignItems="center" gap={1.4}>
                                        <Avatar sx={{ width: 40, height: 40, borderRadius: "12px", bgcolor: `${ACCENT}12`, color: accent, fontWeight: 800, fontSize: "0.88rem" }}>
                                            {initials(name)}
                                        </Avatar>
                                        <Box>
                                            <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: tPri }}>{name}</Typography>
                                            <Typography fontSize="0.74rem" sx={{ color: tSec, fontFamily: "monospace" }}>{email}</Typography>
                                            {date && (
                                                <Stack direction="row" alignItems="center" gap={0.5} mt={0.2}>
                                                    <AccessTimeOutlinedIcon sx={{ fontSize: 11, color: tSec }} />
                                                    <Typography fontSize="0.68rem" sx={{ color: tSec }}>{new Date(date).toLocaleDateString("en-GB")}</Typography>
                                                </Stack>
                                            )}
                                        </Box>
                                    </Stack>
                                    <Stack direction="row" gap={1}>
                                        {busy ? <CircularProgress size={22} sx={{ color: accent }} /> : (
                                            <>
                                                <Button variant="contained" size="small" startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 14 }} />}
                                                    onClick={() => handleReview(rid, true)}
                                                    sx={{ bgcolor: "#2e7d32", "&:hover": { bgcolor: "#1b5e20", boxShadow: "none" }, borderRadius: "9px", textTransform: "none", fontWeight: 700, fontSize: "0.75rem", boxShadow: "none" }}>
                                                    Approve
                                                </Button>
                                                <Button variant="outlined" size="small" startIcon={<CancelOutlinedIcon sx={{ fontSize: 14 }} />}
                                                    onClick={() => handleReview(rid, false)}
                                                    sx={{ borderColor: `${RED}55`, color: RED, "&:hover": { bgcolor: `${RED}08`, borderColor: RED }, borderRadius: "9px", textTransform: "none", fontWeight: 700, fontSize: "0.75rem" }}>
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                    </Stack>
                                </Stack>
                            </Paper>
                        );
                    })}
                </Stack>
            )}
            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity={snack.sev} variant="filled" sx={{ borderRadius: "12px" }}>{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}

/* ════════════════════════════════════════════════════════════════
   TAB 4 — DEPARTMENT STUDENTS
════════════════════════════════════════════════════════════════ */
function DepartmentStudentsTab({ accent, brd, paperBg, isDark, tPri, tSec }) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const d = await getDepartmentStudents();
            setStudents(Array.isArray(d) ? d : d?.data ?? []);
        } catch { }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    return (
        <Box sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: tSec, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Registered Students ({students.length})
                </Typography>
                <Tooltip title="Refresh">
                    <IconButton size="small" onClick={load} sx={{ color: tSec, border: `1px solid ${brd}`, borderRadius: "9px" }}>
                        {loading ? <CircularProgress size={14} sx={{ color: accent }} /> : <RefreshOutlinedIcon sx={{ fontSize: 16 }} />}
                    </IconButton>
                </Tooltip>
            </Stack>

            {loading ? (
                <Box display="flex" justifyContent="center" pt={6}><CircularProgress sx={{ color: accent }} /></Box>
            ) : students.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 7, border: `1px dashed ${ACCENT}30`, borderRadius: "14px", bgcolor: `${ACCENT}05` }}>
                    <PersonOutlineIcon sx={{ fontSize: 36, color: accent, opacity: 0.4, mb: 1 }} />
                    <Typography fontSize="0.84rem" sx={{ color: tSec }}>No students registered yet</Typography>
                </Box>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "14px", border: `1px solid ${brd}` }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ "& th": { fontWeight: 700, fontSize: "0.72rem", color: tSec, textTransform: "uppercase", letterSpacing: "0.06em", bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: "none" } }}>
                                <TableCell>Student</TableCell>
                                <TableCell>Email / Username</TableCell>
                                <TableCell align="center">Team Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.map((s, i) => {
                                const name = s.fullName ?? s.name ?? "—";
                                const email = s.universityEmail ?? s.email ?? s.username ?? "—";
                                const inTeam = s.hasTeam ?? s.isInTeam ?? s.teamId != null;
                                return (
                                    <TableRow key={s.userId ?? s.id ?? i} sx={{ "& td": { border: "none", borderBottom: `1px solid ${brd}`, fontSize: "0.82rem" }, "&:last-child td": { borderBottom: "none" }, "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" } }}>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" gap={1.2}>
                                                <Box sx={{ width: 30, height: 30, borderRadius: "9px", bgcolor: `${MBR_COLORS[i % MBR_COLORS.length]}15`, border: `1px solid ${MBR_COLORS[i % MBR_COLORS.length]}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: 800, color: MBR_COLORS[i % MBR_COLORS.length] }}>
                                                    {initials(name)}
                                                </Box>
                                                <Typography fontSize="0.82rem" fontWeight={600} sx={{ color: tPri }}>{name}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ fontFamily: "monospace", color: tSec, fontSize: "0.78rem" }}>{email}</TableCell>
                                        <TableCell align="center">
                                            <Chip label={inTeam ? "In Team" : "No Team"} size="small" sx={{ height: 20, fontSize: "0.62rem", fontWeight: 700, bgcolor: inTeam ? `${GREEN}12` : `${ACCENT}12`, color: inTeam ? GREEN : ACCENT, borderRadius: "6px" }} />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
export default function HeadOfDepartmentPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const tPri = theme.palette.text.primary;
    const tSec = theme.palette.text.secondary;
    const brd = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    const paperBg = theme.palette.background.paper;
    const accent = isDark ? ACCENT_LIGHT : ACCENT;
    const [tab, setTab] = useState(0);
    const sharedProps = { accent, brd, paperBg, isDark, tPri, tSec };

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box>
                <Stack direction="row" alignItems="center" gap={1.2} mb={0.4}>
                    <Box sx={{ width: 36, height: 36, borderRadius: "11px", bgcolor: `${ACCENT}12`, border: `1px solid ${ACCENT}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <SchoolOutlinedIcon sx={{ fontSize: 18, color: accent }} />
                    </Box>
                    <Box>
                        <Typography variant="h2" sx={{ color: tPri }}>Head of Department</Typography>
                        <Typography sx={{ color: tSec, fontSize: "0.82rem" }}>Manage discussion slots, department teams, supervisors, and student requests</Typography>
                    </Box>
                </Stack>
            </Box>

            <Paper elevation={0} sx={{ flex: 1, borderRadius: "18px", overflow: "hidden", border: `1px solid ${brd}`, bgcolor: paperBg, display: "flex", flexDirection: "column" }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
                    sx={{ px: 1.5, minHeight: 48, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.8rem", minHeight: 48, color: tSec }, "& .Mui-selected": { color: accent }, "& .MuiTabs-indicator": { bgcolor: accent, height: 2.5, borderRadius: "2px" } }}>
                    <Tab label={<Stack direction="row" alignItems="center" gap={0.7}><EventOutlinedIcon sx={{ fontSize: 15 }} /><span>Discussion Slots</span></Stack>} />
                    <Tab label={<Stack direction="row" alignItems="center" gap={0.7}><GroupsOutlinedIcon sx={{ fontSize: 15 }} /><span>Department Teams</span></Stack>} />
                    <Tab label={<Stack direction="row" alignItems="center" gap={0.7}><SchoolOutlinedIcon sx={{ fontSize: 15 }} /><span>Supervisors</span></Stack>} />
                    <Tab label={<Stack direction="row" alignItems="center" gap={0.7}><HowToRegOutlinedIcon sx={{ fontSize: 15 }} /><span>Student Requests</span></Stack>} />
                    <Tab label={<Stack direction="row" alignItems="center" gap={0.7}><PersonOutlineIcon sx={{ fontSize: 15 }} /><span>Department Students</span></Stack>} />
                </Tabs>
                <Box sx={{ flex: 1, overflowY: "auto" }}>
                    {tab === 0 && <DiscussionSlotsTab {...sharedProps} />}
                    {tab === 1 && <DepartmentTeamsTab {...sharedProps} />}
                    {tab === 2 && <DepartmentSupervisorsTab {...sharedProps} />}
                    {tab === 3 && <StudentRequestsTab {...sharedProps} />}
                    {tab === 4 && <DepartmentStudentsTab {...sharedProps} />}
                </Box>
            </Paper>
        </Box>
    );
}