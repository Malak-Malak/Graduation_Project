// src/layout/PhaseBanner.jsx

import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../contexts/AuthContext";

const P1 = { color: "#C49A6C", borderColor: "#C49A6C50" };
const P2 = { color: "#6D8A7D", borderColor: "#6D8A7D50" };

// ── رسائل الـ banner حسب الـ phase والـ role ──────────────────────────────────
const MESSAGES = {
    student: {
        Phase1: {
            main: "Phase 1 — Proposal is now open.",
            sub: "Submit your proposal through the Discovery Hub to get started.",
        },
        Phase2: {
            main: "Phase 2 — Project is underway.",
            sub: "Track your progress on the Kanban board and keep your files up to date.",
        },
    },
    supervisor: {
        Phase1: {
            main: "Phase 1 — Proposals are being submitted.",
            sub: "Review pending requests from your groups when ready.",
        },
        Phase2: {
            main: "Phase 2 — Projects are in progress.",
            sub: "Monitor your groups' timelines and schedule meetings as needed.",
        },
    },
    admin: {
        Phase1: {
            main: "Phase 1 — Proposal phase is active.",
            sub: "Review pending requests and manage user submissions.",
        },
        Phase2: {
            main: "Phase 2 — Project phase is active.",
            sub: "Monitor overall progress and review reports across all groups.",
        },
    },
};

export default function PhaseBanner() {
    const theme = useTheme();
    const { role, currentPhase } = useAuth();
    const isDark = theme.palette.mode === "dark";

    const isP2 = currentPhase === "Phase2";
    const phase = isP2 ? P2 : P1;
    const msg = MESSAGES[role]?.[currentPhase] ?? MESSAGES.student.Phase1;

    return (
        <Box
            sx={{
                width: "100%",
                px: { xs: 2, sm: 3 },
                py: "7px",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                borderBottom: `0.5px solid ${theme.palette.divider}`,
                borderLeft: `2.5px solid ${phase.color}`,
                bgcolor: isDark
                    ? `${phase.color}0D`
                    : `${phase.color}09`,
                transition: "background-color 0.4s ease, border-color 0.4s ease",
                flexShrink: 0,
            }}
        >
            {/* Phase dot */}
            <Box
                sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    bgcolor: phase.color,
                    flexShrink: 0,
                    transition: "background-color 0.4s ease",
                }}
            />

            {/* Text */}
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap", minWidth: 0 }}>
                <Typography
                    sx={{
                        fontSize: "0.775rem",
                        fontWeight: 600,
                        color: phase.color,
                        lineHeight: 1.4,
                        whiteSpace: "nowrap",
                        transition: "color 0.4s ease",
                    }}
                >
                    {msg.main}
                </Typography>
                <Typography
                    sx={{
                        fontSize: "0.75rem",
                        color: theme.palette.text.secondary,
                        lineHeight: 1.4,
                    }}
                >
                    {msg.sub}
                </Typography>
            </Box>
        </Box>
    );
}