// src/components/common/shared/PhaseTransitionOverlay.jsx
//
// Full-screen animated overlay — GPMS graduation project theme.
// Background: #111214 dark, accent: #d0895b warm copper.
// Icons are inline SVG paths (no external icon library needed).
//
// Props:
//   open        : boolean       — show/hide the overlay
//   targetPhase : "Phase1" | "Phase2"
//   onDone      : () => void    — called when animation finishes

import { useEffect, useState } from "react";
import { Box, Typography, keyframes } from "@mui/material";

// ── keyframes ─────────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;

const scaleIn = keyframes`
  0%   { transform: scale(0.82) translateY(18px); opacity: 0; }
  65%  { transform: scale(1.03) translateY(-3px); opacity: 1; }
  100% { transform: scale(1)    translateY(0);    opacity: 1; }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

const progressFill = keyframes`
  from { width: 0%; }
  to   { width: 100%; }
`;

const dotPulse = keyframes`
  0%, 100% { transform: scale(1);   opacity: 0.55; }
  50%       { transform: scale(1.7); opacity: 1;    }
`;

const orbPulse = keyframes`
  0%, 100% { transform: translate(-50%, -50%) scale(1);    opacity: 0.18; }
  50%       { transform: translate(-50%, -50%) scale(1.12); opacity: 0.28; }
`;

const gridScroll = keyframes`
  from { background-position: 0 0; }
  to   { background-position: 28px 28px; }
`;

// ── inline SVG icons ──────────────────────────────────────────────────────────

// Lightbulb — Phase 1 (Proposal)
function BulbIcon({ color = "#d0895b", size = 36 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21h6" />
            <path d="M12 3a6 6 0 0 1 6 6c0 2.22-1.21 4.16-3 5.2V17a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2.8C7.21 13.16 6 11.22 6 9a6 6 0 0 1 6-6z" />
            <line x1="9" y1="17" x2="15" y2="17" />
        </svg>
    );
}

// Rocket — Phase 2 (Execution)
function RocketIcon({ color = "#d0895b", size = 36 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
    );
}

// ── phase config ──────────────────────────────────────────────────────────────

const ACCENT = "#d0895b";

const PHASE_CONFIG = {
    Phase1: {
        label: "Phase 1",
        sublabel: "Proposal Stage",
        description: "You're now in the Project Proposal phase.\nDefine your idea and build your team.",
        statusText: "Proposal stage activated",
        Icon: BulbIcon,
    },
    Phase2: {
        label: "Phase 2",
        sublabel: "Project Execution",
        description: "You're now in the Project Execution phase.\nBuild, collaborate, and deliver.",
        statusText: "Phase switched successfully",
        Icon: RocketIcon,
    },
};

// ── component ─────────────────────────────────────────────────────────────────

export default function PhaseTransitionOverlay({ open, targetPhase, onDone }) {
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);

    const phase = targetPhase ?? "Phase1";
    const config = PHASE_CONFIG[phase] ?? PHASE_CONFIG.Phase1;

    useEffect(() => {
        if (!open) return;
        setLeaving(false);
        setVisible(true);

        const showTimer = setTimeout(() => setLeaving(true), 2400);
        const doneTimer = setTimeout(() => { setVisible(false); onDone?.(); }, 2900);

        return () => { clearTimeout(showTimer); clearTimeout(doneTimer); };
    }, [open, onDone]);

    if (!visible) return null;

    // corner bracket styles
    const corners = [
        { top: 20, left: 20, borderTop: `1.5px solid ${ACCENT}`, borderLeft: `1.5px solid ${ACCENT}`, borderRadius: "4px 0 0 0" },
        { top: 20, right: 20, borderTop: `1.5px solid ${ACCENT}`, borderRight: `1.5px solid ${ACCENT}`, borderRadius: "0 4px 0 0" },
        { bottom: 20, left: 20, borderBottom: `1.5px solid ${ACCENT}`, borderLeft: `1.5px solid ${ACCENT}`, borderRadius: "0 0 0 4px" },
        { bottom: 20, right: 20, borderBottom: `1.5px solid ${ACCENT}`, borderRight: `1.5px solid ${ACCENT}`, borderRadius: "0 0 4px 0" },
    ];

    return (
        <Box
            sx={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#111214",
                animation: leaving
                    ? `${fadeOut} 0.5s ease forwards`
                    : `${fadeIn}  0.3s ease forwards`,
                overflow: "hidden",
            }}
        >
            {/* ── Animated dot grid ── */}
            <Box sx={{
                position: "absolute", inset: 0, pointerEvents: "none",
                backgroundImage: `radial-gradient(circle, rgba(208,137,91,0.11) 1px, transparent 1px)`,
                backgroundSize: "28px 28px",
                animation: `${gridScroll} 8s linear infinite`,
            }} />

            {/* ── Central glow orb ── */}
            <Box sx={{
                position: "absolute",
                width: 520, height: 520,
                borderRadius: "50%",
                background: `radial-gradient(circle, rgba(208,137,91,0.22) 0%, transparent 70%)`,
                top: "50%", left: "50%",
                animation: `${orbPulse} 3s ease-in-out infinite`,
                pointerEvents: "none",
            }} />

            {/* ── Corner brackets ── */}
            {corners.map((s, i) => (
                <Box key={i} sx={{
                    position: "absolute",
                    width: 56, height: 56,
                    opacity: 0.35,
                    pointerEvents: "none",
                    ...s,
                }} />
            ))}

            {/* ── Main card ── */}
            <Box sx={{
                position: "relative", zIndex: 1,
                display: "flex", flexDirection: "column", alignItems: "center",
                animation: `${scaleIn} 0.65s cubic-bezier(0.34,1.4,0.64,1) forwards`,
            }}>

                {/* Tag pill */}
                <Box sx={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: "10px", fontWeight: 700,
                    letterSpacing: "0.2em", textTransform: "uppercase",
                    color: ACCENT,
                    background: "rgba(208,137,91,0.1)",
                    border: `1px solid rgba(208,137,91,0.3)`,
                    borderRadius: "100px",
                    px: 2, py: 0.6,
                    mb: 3,
                }}>
                    Switching to
                </Box>

                {/* Icon box */}
                <Box sx={{
                    width: 80, height: 80,
                    borderRadius: "22px",
                    background: "rgba(208,137,91,0.09)",
                    border: `1.5px solid rgba(208,137,91,0.28)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    mb: 2.75,
                    boxShadow: "0 0 48px rgba(208,137,91,0.18)",
                }}>
                    <config.Icon color={ACCENT} size={36} />
                </Box>

                {/* Phase label with shimmer */}
                <Typography sx={{
                    fontFamily: '"Playfair Display", "Georgia", serif',
                    fontSize: "3.25rem", fontWeight: 700,
                    lineHeight: 1, textAlign: "center",
                    background: `linear-gradient(90deg,
                        rgba(208,137,91,0.6)  0%,
                        #d0895b             20%,
                        #f5c895             45%,
                        #ffffff             50%,
                        #f5c895             55%,
                        #d0895b             80%,
                        rgba(208,137,91,0.6) 100%
                    )`,
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    animation: `${shimmer} 2.4s linear infinite`,
                    mb: 0.75,
                }}>
                    {config.label}
                </Typography>

                {/* Sublabel */}
                <Typography sx={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: "11px", fontWeight: 700,
                    letterSpacing: "0.16em", textTransform: "uppercase",
                    color: ACCENT, opacity: 0.8,
                    textAlign: "center",
                    mb: 2.5,
                }}>
                    {config.sublabel}
                </Typography>

                {/* Divider */}
                <Box sx={{
                    width: 48, height: "1px",
                    background: "rgba(208,137,91,0.35)",
                    borderRadius: 1, mb: 2.25,
                }} />

                {/* Description */}
                <Typography sx={{
                    fontSize: "13.5px", lineHeight: 1.75,
                    color: "rgba(255,255,255,0.52)",
                    textAlign: "center",
                    maxWidth: 280,
                    whiteSpace: "pre-line",
                    mb: 3,
                }}>
                    {config.description}
                </Typography>

                {/* Progress bar */}
                <Box sx={{
                    width: 200, height: "2px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 1, overflow: "hidden",
                    mb: 2.25,
                }}>
                    <Box sx={{
                        height: "100%",
                        background: `linear-gradient(90deg, rgba(208,137,91,0.4), ${ACCENT})`,
                        borderRadius: 1,
                        animation: `${progressFill} 1.8s cubic-bezier(0.4,0,0.2,1) forwards`,
                    }} />
                </Box>

                {/* Status row */}
                <Box sx={{
                    display: "flex", alignItems: "center", gap: 1,
                    background: "rgba(208,137,91,0.07)",
                    border: `1px solid rgba(208,137,91,0.2)`,
                    borderRadius: "8px",
                    px: 2, py: 1,
                }}>
                    <Box sx={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: ACCENT,
                        animation: `${dotPulse} 1.5s ease-in-out infinite`,
                        flexShrink: 0,
                    }} />
                    <Typography sx={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: "11px",
                        color: ACCENT,
                        opacity: 0.9,
                    }}>
                        {config.statusText}
                    </Typography>
                </Box>

            </Box>
        </Box>
    );
}