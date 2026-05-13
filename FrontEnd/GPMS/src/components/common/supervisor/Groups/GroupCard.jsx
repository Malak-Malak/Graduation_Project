// src/components/common/supervisor/Groups/GroupCard.jsx
// Taller card with full visible details

import { Avatar, AvatarGroup, Tooltip } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import CircleIcon from "@mui/icons-material/Circle";
import TaskOutlinedIcon from "@mui/icons-material/TaskOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

const MBR_COLORS = ["#B46F4C", "#6D8A7D", "#C49A6C", "#7E9FC4", "#9B7EC8", "#C47E7E"];
const PRIMARY = "#d0895b";

const STATUS_CONFIG = {
    Active: { bg: "rgba(16,185,129,.10)", clr: "#059669", dot: "#10b981" },
    Review: { bg: "rgba(245,158,11,.10)", clr: "#d97706", dot: "#f59e0b" },
    Behind: { bg: "rgba(239,68,68,.10)", clr: "#dc2626", dot: "#ef4444" },
    Pending: { bg: "rgba(148,163,184,.12)", clr: "#64748b", dot: "#94a3b8" },
    default: { bg: "rgba(148,163,184,.12)", clr: "#64748b", dot: "#94a3b8" },
};

const initials = (name = "") =>
    (name ?? "?").split(" ").map((w) => w[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";

export default function GroupCard({ g, onOpenDetail, onOpenSize }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const statusCfg = STATUS_CONFIG[g.status] ?? STATUS_CONFIG.default;
    const memberCount = g.members?.length ?? 0;

    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const cardBg = theme.palette.background.paper;

    return (
        <div
            onClick={() => onOpenDetail(g)}
            style={{
                width: "100%",
                boxSizing: "border-box",
                background: cardBg,
                borderRadius: 16,
                border: `1px solid ${border}`,
                borderLeft: `4px solid ${PRIMARY}`,
                cursor: "pointer",
                transition: "box-shadow .2s, transform .18s",
                overflow: "hidden",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = isDark
                    ? "0 8px 24px rgba(0,0,0,0.25)"
                    : "0 8px 24px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "";
            }}
        >
            <div style={{
                display: "flex",
                flexDirection: "column",
                padding: "24px",
                gap: 20,
            }}>
                {/* Row 1: Header with icon, title, status */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, minWidth: 0 }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                        background: alpha(PRIMARY, 0.08),
                        border: `1px solid ${alpha(PRIMARY, 0.16)}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <FolderOutlinedIcon sx={{ fontSize: 26, color: PRIMARY }} />
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                            <span style={{
                                fontSize: 18, fontWeight: 700,
                                color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)"
                            }}>
                                {g.projectTitle ?? g.name ?? "Unnamed"}
                            </span>
                            <span style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                fontSize: 11.5, fontWeight: 600,
                                padding: "4px 12px", borderRadius: 20,
                                background: statusCfg.bg, color: statusCfg.clr,
                            }}>
                                <CircleIcon sx={{ fontSize: 7 }} />
                                {g.status ?? "Active"}
                            </span>
                        </div>

                        {/* Project description - full visibility, no ellipsis */}
                        <div style={{
                            fontSize: 13.5,
                            color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)",
                            lineHeight: 1.5,
                            marginTop: 4,
                        }}>
                            {g.projectDescription ? (
                                g.projectDescription
                            ) : (
                                <span style={{
                                    color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
                                    fontStyle: "italic"
                                }}>
                                    No description provided
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Row 2: Stats grid - Members, Tasks, Files */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 16,
                    padding: "16px 0",
                    borderTop: `1px solid ${border}`,
                    borderBottom: `1px solid ${border}`,
                }}>
                    {/* Members section */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <AvatarGroup max={4} sx={{
                            "& .MuiAvatar-root": {
                                width: 36, height: 36, fontSize: "0.7rem", fontWeight: 700,
                                border: `2px solid ${cardBg} !important`,
                                marginLeft: "-8px",
                                "&:first-of-type": { marginLeft: 0 },
                            },
                        }}>
                            {(g.members ?? []).slice(0, 4).map((m, i) => (
                                <Tooltip key={i} title={m.fullName ?? "?"}>
                                    <Avatar sx={{ bgcolor: MBR_COLORS[i % MBR_COLORS.length] }}>
                                        {initials(m.fullName)}
                                    </Avatar>
                                </Tooltip>
                            ))}
                            {memberCount === 0 && (
                                <Avatar sx={{ bgcolor: MBR_COLORS[0] }}>?</Avatar>
                            )}
                        </AvatarGroup>
                        <div>
                            <span style={{
                                fontSize: 20, fontWeight: 700,
                                color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)"
                            }}>
                                {memberCount}
                            </span>
                            <span style={{
                                fontSize: 11.5,
                                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                                display: "block",
                            }}>
                                Members
                            </span>
                        </div>
                    </div>

                    {/* Tasks section */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                            background: alpha(PRIMARY, 0.08),
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <TaskOutlinedIcon sx={{ fontSize: 20, color: PRIMARY }} />
                        </div>
                        <div>
                            <div style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
                                <div>
                                    <span style={{
                                        fontSize: 18, fontWeight: 700,
                                        color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)"
                                    }}>
                                        {g.tasks?.todo ?? 0}
                                    </span>
                                    <span style={{
                                        fontSize: 10, marginLeft: 4,
                                        color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"
                                    }}>To Do</span>
                                </div>
                                <div>
                                    <span style={{
                                        fontSize: 18, fontWeight: 700,
                                        color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)"
                                    }}>
                                        {g.tasks?.inProgress ?? 0}
                                    </span>
                                    <span style={{
                                        fontSize: 10, marginLeft: 4,
                                        color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"
                                    }}>In Progress</span>
                                </div>
                                <div>
                                    <span style={{
                                        fontSize: 18, fontWeight: 700,
                                        color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)"
                                    }}>
                                        {g.tasks?.done ?? 0}
                                    </span>
                                    <span style={{
                                        fontSize: 10, marginLeft: 4,
                                        color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"
                                    }}>Done</span>
                                </div>
                            </div>
                            <span style={{
                                fontSize: 11,
                                color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
                                display: "block",
                            }}>
                                Total Tasks
                            </span>
                        </div>
                    </div>

                    {/* Files section */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                            background: alpha("#7E9FC4", 0.08),
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <DescriptionOutlinedIcon sx={{ fontSize: 20, color: "#7E9FC4" }} />
                        </div>
                        <div>
                            <span style={{
                                fontSize: 20, fontWeight: 700,
                                color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)"
                            }}>
                                {g.files?.total ?? 0}
                            </span>
                            <span style={{
                                fontSize: 11.5,
                                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                                display: "block",
                            }}>
                                Total Files
                            </span>
                            {g.files?.pending > 0 && (
                                <span style={{
                                    fontSize: 10,
                                    color: "#C49A6C",
                                    display: "block",
                                }}>
                                    {g.files.pending} pending review
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Row 3: Progress bar + Last active + Actions */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    {/* Progress section */}
                    <div style={{ flex: "1 1 200px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 11.5, fontWeight: 600, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
                                Overall Progress
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)" }}>
                                {g.progress ?? 0}%
                            </span>
                        </div>
                        <div style={{
                            height: 6, borderRadius: 3, overflow: "hidden",
                            background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"
                        }}>
                            <div style={{
                                width: `${g.progress ?? 0}%`,
                                height: "100%",
                                background: PRIMARY,
                                borderRadius: 3,
                            }} />
                        </div>
                    </div>

                    {/* Last active */}
                    {g.lastActive && (
                        <div style={{ flexShrink: 0 }}>
                            <span style={{
                                fontSize: 11,
                                color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"
                            }}>
                                Last active: {g.lastActive}
                            </span>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                        <Tooltip title="Edit team size">
                            <button
                                onClick={(e) => { e.stopPropagation(); onOpenSize(g); }}
                                style={{
                                    padding: "8px 16px", borderRadius: 10, fontSize: 12.5, fontWeight: 500,
                                    border: `1px solid ${border}`,
                                    background: "transparent",
                                    cursor: "pointer",
                                    color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.55)",
                                    display: "flex", alignItems: "center", gap: 8,
                                    transition: "all 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = alpha(PRIMARY, 0.08);
                                    e.currentTarget.style.borderColor = PRIMARY;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "transparent";
                                    e.currentTarget.style.borderColor = border;
                                }}
                            >
                                <SettingsOutlinedIcon sx={{ fontSize: 15 }} />
                                Team Size: {g.members?.length ?? 0}/{g.maxMembers ?? "?"}
                            </button>
                        </Tooltip>

                        <button
                            onClick={(e) => { e.stopPropagation(); onOpenDetail(g); }}
                            style={{
                                padding: "8px 20px", borderRadius: 10, fontSize: 12.5, fontWeight: 600,
                                border: `1px solid ${alpha(PRIMARY, 0.3)}`,
                                background: alpha(PRIMARY, 0.08),
                                cursor: "pointer", color: PRIMARY,
                                display: "flex", alignItems: "center", gap: 8,
                                transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = alpha(PRIMARY, 0.15);
                                e.currentTarget.style.transform = "translateX(2px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = alpha(PRIMARY, 0.08);
                                e.currentTarget.style.transform = "";
                            }}
                        >
                            View Details
                            <ArrowForwardIcon sx={{ fontSize: 14 }} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}