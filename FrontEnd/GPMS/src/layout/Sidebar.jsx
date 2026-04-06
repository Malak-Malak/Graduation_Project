// src/layout/Sidebar.jsx

import { useLocation, useNavigate } from "react-router-dom";
import {
    Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
    Typography, Avatar, IconButton, Tooltip, Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

import { useAuth } from "../contexts/AuthContext";
import { useThemeContext } from "../contexts/ThemeContext";

// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = {
    admin: [
        { label: "Dashboard", icon: <DashboardOutlinedIcon />, path: "/admin" },
        { label: "Profile", icon: <AccountCircleOutlinedIcon />, path: "/admin/profile" },
        { label: "Pending Requests", icon: <HowToRegOutlinedIcon />, path: "/admin/pending-requests" },
        { label: "User Management", icon: <PeopleOutlineIcon />, path: "/admin/users" },
        { label: "Reports", icon: <AssessmentOutlinedIcon />, path: "/admin/reports" },
        { label: "Activity Logs", icon: <HistoryOutlinedIcon />, path: "/admin/logs" },
        { label: "All Requests", icon: <AssessmentOutlinedIcon />, path: "/admin/all-requests" },
        { label: "Configuration", icon: <SettingsOutlinedIcon />, path: "/admin/settings" },
    ],
    supervisor: [
        { label: "Dashboard", icon: <DashboardOutlinedIcon />, path: "/supervisor" },
        { label: "Profile", icon: <AccountCircleOutlinedIcon />, path: "/supervisor/profile" },
        { label: "My Groups", icon: <GroupsOutlinedIcon />, path: "/supervisor/groups" },
        { label: "Pending Requests", icon: <PendingActionsOutlinedIcon />, path: "/supervisor/requests" },
        { label: "File Review", icon: <FolderOutlinedIcon />, path: "/supervisor/files" },
        { label: "Meetings", icon: <CalendarMonthOutlinedIcon />, path: "/supervisor/meetings" },
        { label: "AI Reports", icon: <AutoAwesomeOutlinedIcon />, path: "/supervisor/ai-reports" },
        { label: "Analytics", icon: <QueryStatsOutlinedIcon />, path: "/supervisor/analytics" },
    ],
    student: [
        { label: "Dashboard", icon: <DashboardOutlinedIcon />, path: "/student" },
        { label: "Profile", icon: <AccountCircleOutlinedIcon />, path: "/student/profile" },
        { label: "Discovery Hub", icon: <SearchOutlinedIcon />, path: "/student/team-finder" },
        { label: "Kanban Board", icon: <ViewKanbanOutlinedIcon />, path: "/student/kanban" },
        { label: "Timeline", icon: <TimelineOutlinedIcon />, path: "/student/timeline" },
        { label: "Requirements", icon: <AssignmentOutlinedIcon />, path: "/student/requirements", phase2Only: true },
        { label: "Files", icon: <FolderOutlinedIcon />, path: "/student/files" },
        { label: "Meetings", icon: <CalendarMonthOutlinedIcon />, path: "/student/meetings" },
        { label: "Analytics", icon: <QueryStatsOutlinedIcon />, path: "/student/analytics" },
        { label: "My Team", icon: <GroupsOutlinedIcon />, path: "/student/my-team" },
    ],
};

const ROLE_LABEL = { admin: "Administrator", supervisor: "Supervisor", student: "Student" };
const ROLE_COLOR = { admin: "#C47E7E", supervisor: "#6D8A7D", student: "#B46F4C" };

const P1 = { color: "#C49A6C", label: "Phase 1", sub: "Proposal" };
const P2 = { color: "#6D8A7D", label: "Phase 2", sub: "Project" };

// ── Compact Phase Toggle ──────────────────────────────────────────────────────
// نفس المساحة الأصلية — avatar + اسم + رول + toggle في صف واحد أنيق
function PhaseToggle({ onSwitch, currentPhase }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const isP2 = currentPhase === "Phase2";
    const phase = isP2 ? P2 : P1;

    const TRACK_W = 34;
    const TRACK_H = 18;
    const KNOB = 12;
    const PAD = 3;

    const trackBg = isP2
        ? (isDark ? "#2e3d38" : "#c0d5cf")
        : (isDark ? "#362e25" : "#ddd0bc");

    return (
        <Box
            onClick={onSwitch}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.7,
                cursor: "pointer",
                userSelect: "none",
                "&:hover .phase-label": { opacity: 0.75 },
            }}
        >
            {/* Phase label — compact */}
            <Typography
                className="phase-label"
                sx={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    color: phase.color,
                    lineHeight: 1,
                    letterSpacing: "0.01em",
                    transition: "color 0.35s, opacity 0.2s",
                    whiteSpace: "nowrap",
                }}
            >
                {phase.label}
            </Typography>

            {/* Toggle track */}
            <Box
                sx={{
                    position: "relative",
                    width: TRACK_W,
                    height: TRACK_H,
                    borderRadius: TRACK_H / 2,
                    bgcolor: trackBg,
                    flexShrink: 0,
                    transition: "background-color 0.35s ease",
                    boxShadow: isDark
                        ? "inset 0 1px 2px rgba(0,0,0,0.45)"
                        : "inset 0 1px 2px rgba(0,0,0,0.12)",
                }}
            >
                <Box sx={{
                    position: "absolute",
                    top: PAD,
                    left: isP2 ? TRACK_W - KNOB - PAD : PAD,
                    width: KNOB,
                    height: KNOB,
                    borderRadius: "50%",
                    bgcolor: "#fff",
                    transition: "left 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: isDark
                        ? "0 1px 3px rgba(0,0,0,0.55)"
                        : "0 1px 3px rgba(0,0,0,0.22)",
                }} />
            </Box>
        </Box>
    );
}

// ── Collapsed dot indicator ───────────────────────────────────────────────────
function PhaseDot({ currentPhase, onSwitch }) {
    const isP2 = currentPhase === "Phase2";
    const phase = isP2 ? P2 : P1;
    return (
        <Tooltip title={`${phase.label} — click to switch`} placement="right">
            <Box
                onClick={onSwitch}
                sx={{
                    width: 7, height: 7, borderRadius: "50%",
                    bgcolor: phase.color,
                    mt: 0.7, cursor: "pointer",
                    transition: "background-color 0.4s ease",
                    "&:hover": { transform: "scale(1.35)" },
                }}
            />
        </Tooltip>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Sidebar({
    width, collapsedWidth, collapsed, mobileOpen,
    onMobileClose, onCollapse, isMobile, onPhaseSwitch,
}) {
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, role, logout, currentPhase } = useAuth();
    const { mode, toggleMode } = useThemeContext();

    const t = theme.palette.custom ?? {};
    const navItems = NAV_ITEMS[role] ?? [];
    const currentWidth = collapsed ? collapsedWidth : width;
    const isP2 = currentPhase === "Phase2";
    const phaseAccent = role === "student"
        ? (isP2 ? P2.color : P1.color)
        : (ROLE_COLOR[role] ?? "#B46F4C");

    const border = t.borderLight ?? theme.palette.divider;
    const tPri = t.textPrimary ?? theme.palette.text.primary;
    const tSec = t.textSecondary ?? theme.palette.text.secondary;

    const isActive = (path) =>
        path === `/${role}`
            ? location.pathname === path
            : location.pathname.startsWith(path);

    const handleNav = (path) => { navigate(path); if (isMobile) onMobileClose(); };

    const handleLogout = () => {
        sessionStorage.removeItem("team_checked");
        sessionStorage.removeItem("profile_done");
        sessionStorage.removeItem("student_profile");
        logout();
        navigate("/login");
    };

    const drawerContent = (
        <Box sx={{
            display: "flex", flexDirection: "column", height: "100%",
            width: currentWidth, overflow: "hidden",
            transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp, duration: 220,
            }),
        }}>

            {/* ── Logo ── */}
            <Box sx={{
                height: 64, display: "flex", alignItems: "center",
                px: collapsed ? 1.5 : 2.5,
                justifyContent: collapsed ? "center" : "space-between",
                borderBottom: `1px solid ${border}`, flexShrink: 0,
            }}>
                {!collapsed && (
                    <Box>
                        <Typography sx={{
                            fontFamily: '"Playfair Display", serif',
                            fontWeight: 700, fontSize: "1.05rem",
                            color: phaseAccent, lineHeight: 1.2,
                            transition: "color 0.4s ease",
                        }}>
                            GPMS
                        </Typography>
                        <Typography sx={{
                            fontSize: "0.65rem", color: theme.palette.text.disabled,
                            letterSpacing: "0.06em", textTransform: "uppercase",
                        }}>
                            Palestine Tech Uni
                        </Typography>
                    </Box>
                )}
                {!isMobile && (
                    <Tooltip title={collapsed ? "Expand" : "Collapse"} placement="right">
                        <IconButton size="small" onClick={onCollapse} sx={{
                            width: 28, height: 28,
                            border: `1px solid ${border}`,
                            color: tSec,
                            "&:hover": { bgcolor: theme.palette.action.hover },
                        }}>
                            {collapsed
                                ? <ChevronRightIcon sx={{ fontSize: 16 }} />
                                : <ChevronLeftIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                    </Tooltip>
                )}
            </Box>

            {/* ── User card — expanded ── */}
            {!collapsed && (
                <Box sx={{ px: 2, pt: 1.6, pb: 1.6, borderBottom: `1px solid ${border}` }}>

                    {/* Row 1: Avatar + Name + Role badge */}
                    <Stack direction="row" spacing={1.2} alignItems="center">
                        <Avatar src={user?.avatar} sx={{
                            width: 36, height: 36,
                            bgcolor: `${phaseAccent}20`,
                            color: phaseAccent,
                            fontSize: "0.85rem", fontWeight: 600, flexShrink: 0,
                            transition: "background-color 0.4s ease, color 0.4s ease",
                        }}>
                            {user?.name?.charAt(0).toUpperCase()
                                ?? user?.username?.charAt(0).toUpperCase() ?? "?"}
                        </Avatar>

                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            {/* Name */}
                            <Typography
                                variant="body2"
                                fontWeight={600}
                                noWrap
                                sx={{ fontSize: "1rem", color: tPri, lineHeight: 1.2 }}
                            >
                                {user?.name ?? user?.username ?? "User"}
                            </Typography>

                            {/* Row 2: Role pill + Phase toggle (inline, same row) */}
                            <Box sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mt: 0.5,
                                gap: 0.5,
                            }}>
                                {/* Role pill */}
                                <Box sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 0.4,
                                }}>
                                    {/* Accent dot */}
                                    <Box sx={{
                                        width: 5, height: 5, borderRadius: "50%",
                                        bgcolor: ROLE_COLOR[role] ?? phaseAccent,
                                        flexShrink: 0,
                                        transition: "background-color 0.4s",
                                    }} />
                                    <Typography sx={{
                                        fontSize: "0.65rem",
                                        color: tSec,
                                        lineHeight: 1,
                                    }}>
                                        {ROLE_LABEL[role] ?? role}
                                    </Typography>
                                </Box>

                                {/* Phase toggle — students only, inline */}
                                {role === "student" && (
                                    <Tooltip
                                        title={`Switch to ${isP2 ? "Phase 1 — Proposal" : "Phase 2 — Project"}`}
                                        placement="top"
                                    >
                                        <span>
                                            <PhaseToggle
                                                currentPhase={currentPhase}
                                                onSwitch={onPhaseSwitch}
                                            />
                                        </span>
                                    </Tooltip>
                                )}
                            </Box>
                        </Box>
                    </Stack>

                    {/* Row 3: Team or Department — only if data exists */}
                    {role === "student" && user?.teamName && (
                        <Typography sx={{ fontSize: "0.7rem", color: tSec, mt: 1, pl: "48px" }}>
                            <Box component="span" sx={{ color: phaseAccent, fontWeight: 600, transition: "color 0.4s" }}>
                                {user.teamName}
                            </Box>
                        </Typography>
                    )}
                    {role === "supervisor" && user?.department && (
                        <Typography sx={{ fontSize: "0.7rem", color: tSec, mt: 1, pl: "48px" }}>
                            {user.department}
                        </Typography>
                    )}
                </Box>
            )}

            {/* ── User avatar — collapsed ── */}
            {collapsed && (
                <Box sx={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    py: 2, borderBottom: `1px solid ${border}`,
                }}>
                    <Tooltip title={user?.name ?? user?.username ?? "User"} placement="right">
                        <Avatar src={user?.avatar} sx={{
                            width: 34, height: 34,
                            bgcolor: `${phaseAccent}20`,
                            color: phaseAccent,
                            fontSize: "0.82rem", fontWeight: 600,
                            transition: "background-color 0.4s ease, color 0.4s ease",
                        }}>
                            {user?.name?.charAt(0) ?? user?.username?.charAt(0) ?? "?"}
                        </Avatar>
                    </Tooltip>
                    {role === "student" && (
                        <PhaseDot currentPhase={currentPhase} onSwitch={onPhaseSwitch} />
                    )}
                </Box>
            )}

            {/* ── Nav items ── */}
            <Box sx={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden", py: 1 }}>
                <List dense disablePadding>
                    {navItems
                        .filter((item) => !item.phase2Only || isP2)
                        .map((item) => {
                            const active = isActive(item.path);
                            return (
                                <Tooltip key={item.path} title={collapsed ? item.label : ""} placement="right">
                                    <ListItemButton
                                        selected={active}
                                        onClick={() => handleNav(item.path)}
                                        sx={{
                                            mx: 1, mb: 0.25, px: 1.5,
                                            justifyContent: collapsed ? "center" : "flex-start",
                                            borderRadius: "8px", minHeight: 40,
                                            "&.Mui-selected": {
                                                bgcolor: `${phaseAccent}12`,
                                                "&:hover": { bgcolor: `${phaseAccent}1A` },
                                            },
                                        }}
                                    >
                                        <ListItemIcon sx={{
                                            minWidth: collapsed ? "auto" : 36,
                                            color: active ? phaseAccent : tSec,
                                            "& svg": { fontSize: 20 },
                                            transition: "color 0.3s ease",
                                        }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        {!collapsed && (
                                            <ListItemText
                                                primary={item.label}
                                                primaryTypographyProps={{
                                                    fontSize: "0.875rem",
                                                    fontWeight: active ? 600 : 500,
                                                    color: active ? phaseAccent : tPri,
                                                    noWrap: true,
                                                }}
                                            />
                                        )}
                                    </ListItemButton>
                                </Tooltip>
                            );
                        })}
                </List>
            </Box>

            {/* ── Bottom actions ── */}
            <Box sx={{ borderTop: `1px solid ${border}`, py: 1 }}>
                <Tooltip title={`Switch to ${mode === "light" ? "Dark" : "Light"} mode`} placement="right">
                    <ListItemButton onClick={toggleMode} sx={{
                        mx: 1, borderRadius: "8px",
                        justifyContent: collapsed ? "center" : "flex-start",
                        minHeight: 40, px: 1.5,
                    }}>
                        <ListItemIcon sx={{ minWidth: collapsed ? "auto" : 36, color: tSec, "& svg": { fontSize: 20 } }}>
                            {mode === "light" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
                        </ListItemIcon>
                        {!collapsed && (
                            <ListItemText
                                primary={mode === "light" ? "Dark Mode" : "Light Mode"}
                                primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500, color: tPri }}
                            />
                        )}
                    </ListItemButton>
                </Tooltip>

                {role !== "admin" && (
                    <Tooltip title={collapsed ? "Settings" : ""} placement="right">
                        <ListItemButton
                            onClick={() => handleNav(`/${role}/settings`)}
                            selected={isActive(`/${role}/settings`)}
                            sx={{
                                mx: 1, borderRadius: "8px",
                                justifyContent: collapsed ? "center" : "flex-start",
                                minHeight: 40, px: 1.5,
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: collapsed ? "auto" : 36, color: tSec, "& svg": { fontSize: 20 } }}>
                                <SettingsOutlinedIcon />
                            </ListItemIcon>
                            {!collapsed && (
                                <ListItemText
                                    primary="Settings"
                                    primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500, color: tPri }}
                                />
                            )}
                        </ListItemButton>
                    </Tooltip>
                )}

                <Tooltip title={collapsed ? "Logout" : ""} placement="right">
                    <ListItemButton onClick={handleLogout} sx={{
                        mx: 1, borderRadius: "8px",
                        justifyContent: collapsed ? "center" : "flex-start",
                        minHeight: 40, px: 1.5,
                        "&:hover": {
                            bgcolor: `${t.error ?? "#C47E7E"}14`,
                            "& .MuiListItemIcon-root": { color: t.error ?? "#C47E7E" },
                        },
                    }}>
                        <ListItemIcon sx={{ minWidth: collapsed ? "auto" : 36, color: tSec, "& svg": { fontSize: 20 } }}>
                            <LogoutOutlinedIcon />
                        </ListItemIcon>
                        {!collapsed && (
                            <ListItemText
                                primary="Logout"
                                primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500, color: tPri }}
                            />
                        )}
                    </ListItemButton>
                </Tooltip>
            </Box>
        </Box>
    );

    if (isMobile) {
        return (
            <Drawer variant="temporary" open={mobileOpen} onClose={onMobileClose}
                ModalProps={{ keepMounted: true }}
                sx={{ "& .MuiDrawer-paper": { width, boxSizing: "border-box", bgcolor: theme.palette.background.paper } }}>
                {drawerContent}
            </Drawer>
        );
    }

    return (
        <Drawer variant="permanent" sx={{
            width: currentWidth, flexShrink: 0,
            "& .MuiDrawer-paper": {
                width: currentWidth, boxSizing: "border-box",
                bgcolor: theme.palette.background.paper, overflowX: "hidden",
                transition: theme.transitions.create("width", {
                    easing: theme.transitions.easing.sharp, duration: 220,
                }),
            },
        }}>
            {drawerContent}
        </Drawer>
    );
}