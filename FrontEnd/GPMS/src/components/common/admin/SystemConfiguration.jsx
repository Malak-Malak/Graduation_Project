import { useState } from "react";
import {
    Box, Paper, Typography, Stack, Button, TextField, Switch, Grid,
    Divider, Chip, Alert, Snackbar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";

const DEFAULTS = {
    semester: "Spring 2025",
    teamMin: 2,
    teamMax: 5,
    fileLimit: 50,
    allowedTypes: "PDF, DOCX, PPTX, PNG, JPG, ZIP",
    emailNotif: true,
    inAppNotif: true,
    pushNotif: false,
    aiAlerts: true,
    deadlineReminders: true,
};

const PERMISSIONS = [
    { label: "Create Team", student: true, supervisor: false, admin: false },
    { label: "Upload Files", student: true, supervisor: true, admin: true },
    { label: "Approve", student: false, supervisor: true, admin: true },
    { label: "View All", student: false, supervisor: false, admin: true },
    { label: "Manage Users", student: false, supervisor: false, admin: true },
];

function SectionCard({ title, children }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    return (
        <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
            <Typography variant="h4" sx={{ color: t.textPrimary, mb: 2 }}>{title}</Typography>
            {children}
        </Paper>
    );
}

function Row({ label, value, onChange, type = "text" }) {
    const theme = useTheme();
    const t = theme.palette.custom;
    return (
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" gap={1.5} sx={{ py: 1.2, borderBottom: `1px solid ${t.borderLight}` }}>
            <Typography sx={{ fontSize: "0.875rem", color: t.textSecondary, minWidth: 180 }}>{label}</Typography>
            <TextField size="small" type={type} value={value} onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
                sx={{ width: { xs: "100%", sm: 260 } }} />
        </Stack>
    );
}

export default function SystemConfiguration() {
    const theme = useTheme();
    const t = theme.palette.custom;

    const [cfg, setCfg] = useState(DEFAULTS);
    const [snack, setSnack] = useState(false);

    const update = (key) => (val) => setCfg((p) => ({ ...p, [key]: val }));

    const handleSave = () => setSnack(true);
    const handleReset = () => setCfg(DEFAULTS);

    return (
        <Box sx={{ maxWidth: 900 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                    <Typography variant="h2" sx={{ color: t.textPrimary, mb: 0.5 }}>System Configuration</Typography>
                    <Typography sx={{ color: t.textSecondary, fontSize: "0.9rem" }}>Manage academic settings and permissions</Typography>
                </Box>
                <Stack direction="row" gap={1}>
                    <Button variant="outlined" startIcon={<RestartAltOutlinedIcon />} onClick={handleReset}
                        sx={{ borderColor: t.borderLight, color: t.textSecondary }}>Reset</Button>
                    <Button variant="contained" startIcon={<SaveOutlinedIcon />} onClick={handleSave}
                        sx={{ bgcolor: t.accentPrimary }}>Save Changes</Button>
                </Stack>
            </Stack>

            <Stack spacing={2.5}>
                {/* Academic settings */}
                <SectionCard title="Academic Settings">
                    <Row label="Current Semester" value={cfg.semester} onChange={update("semester")} />
                    <Row label="Min Team Size" value={cfg.teamMin} onChange={update("teamMin")} type="number" />
                    <Row label="Max Team Size" value={cfg.teamMax} onChange={update("teamMax")} type="number" />
                    <Row label="File Upload Limit (MB)" value={cfg.fileLimit} onChange={update("fileLimit")} type="number" />
                    <Row label="Allowed File Types" value={cfg.allowedTypes} onChange={update("allowedTypes")} />
                </SectionCard>

                {/* Role permissions */}
                <SectionCard title="Role Permissions">
                    <Box sx={{ overflowX: "auto" }}>
                        <Box sx={{ minWidth: 500 }}>
                            {/* Header */}
                            <Stack direction="row" sx={{ pb: 1, borderBottom: `1px solid ${t.borderLight}` }}>
                                <Typography sx={{ flex: 2, fontSize: "0.72rem", fontWeight: 600, color: t.textTertiary, textTransform: "uppercase", letterSpacing: "0.07em" }}>Permission</Typography>
                                {["Student", "Supervisor", "Admin"].map((r) => (
                                    <Typography key={r} sx={{ flex: 1, fontSize: "0.72rem", fontWeight: 600, color: t.textTertiary, textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "center" }}>{r}</Typography>
                                ))}
                            </Stack>
                            {PERMISSIONS.map((p) => (
                                <Stack key={p.label} direction="row" alignItems="center" sx={{ py: 1.2, borderBottom: `1px solid ${t.borderLight}` }}>
                                    <Typography sx={{ flex: 2, fontSize: "0.875rem", color: t.textPrimary }}>{p.label}</Typography>
                                    {["student", "supervisor", "admin"].map((role) => (
                                        <Box key={role} sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                                            <Chip
                                                label={p[role] ? "✓" : "—"}
                                                size="small"
                                                sx={{
                                                    bgcolor: p[role] ? `${t.success}18` : `${t.borderLight}`,
                                                    color: p[role] ? t.success : t.textTertiary,
                                                    fontWeight: 700,
                                                    fontSize: "0.75rem",
                                                    height: 22,
                                                    width: 36,
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Stack>
                            ))}
                        </Box>
                    </Box>
                </SectionCard>

                {/* Notifications */}
                <SectionCard title="Notification Settings">
                    <Stack spacing={0.5}>
                        {[
                            { key: "emailNotif", label: "Email Notifications" },
                            { key: "inAppNotif", label: "In-App Alerts" },
                            { key: "pushNotif", label: "Push Notifications" },
                            { key: "aiAlerts", label: "AI-Generated Alerts" },
                            { key: "deadlineReminders", label: "Deadline Reminders" },
                        ].map(({ key, label }) => (
                            <Stack key={key} direction="row" alignItems="center" justifyContent="space-between"
                                sx={{ py: 1.2, borderBottom: `1px solid ${t.borderLight}` }}>
                                <Typography sx={{ fontSize: "0.875rem", color: t.textPrimary }}>{label}</Typography>
                                <Switch checked={cfg[key]} onChange={(e) => update(key)(e.target.checked)}
                                    sx={{ "& .MuiSwitch-thumb": { bgcolor: cfg[key] ? t.accentPrimary : t.textTertiary } }} />
                            </Stack>
                        ))}
                    </Stack>
                </SectionCard>
            </Stack>

            <Snackbar open={snack} autoHideDuration={3000} onClose={() => setSnack(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert severity="success" sx={{ borderRadius: 2 }} onClose={() => setSnack(false)}>
                    Settings saved successfully.
                </Alert>
            </Snackbar>
        </Box>
    );
}