// src/layout/Sidebar.jsx

import { useLocation, useNavigate } from "react-router-dom";
import {
    Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
    Typography, Avatar, IconButton, Tooltip, Stack, Chip,
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
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";

import { useAuth } from "../contexts/AuthContext";
import { useThemeContext } from "../contexts/ThemeContext";

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
        { label: "Files", icon: <FolderOutlinedIcon />, path: "/student/files" },
        { label: "Meetings", icon: <CalendarMonthOutlinedIcon />, path: "/student/meetings" },
        { label: "Analytics", icon: <QueryStatsOutlinedIcon />, path: "/student/analytics" },
        { label: "My Team", icon: <GroupsOutlinedIcon />, path: "/student/my-team" },
    ],
};

const ROLE_LABEL = { admin: "Administrator", supervisor: "Supervisor", student: "Student" };
const ROLE_COLOR = { admin: "#C47E7E", supervisor: "#6D8A7D", student: "#B46F4C" };

// ── Phase Switcher (only for student) ────────────────────────────────────────

function PhaseSwitcher({ collapsed, onSwitch, currentPhase }) {
    const theme = useTheme();
    const t = theme.palette.custom ?? {};
    const isPhase2 = currentPhase === "Phase2";

    const phase1Color = "#C49A6C";
    const phase2Color = "#6D8A7D";
    const activeColor = isPhase2 ? phase2Color : phase1Color;
    const inactiveColor = theme.palette.text.secondary;

    if (collapsed) {
        return (
            <Tooltip
                title={`Switch to ${isPhase2 ? "Phase 1 (Proposal)" : "Phase 2 (Project)"}`}
                placement="right"
            >
                <Box
                    onClick={onSwitch}
                    sx={{
                        mx: 1,
                        mb: 0.5,
                        height: 40,
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        border: `1px solid ${activeColor}35`,
                        bgcolor: `${activeColor}10`,
                        transition: "all 0.2s ease",
                        "&:hover": {
                            bgcolor: `${activeColor}20`,
                            borderColor: `${activeColor}60`,
                        },
                    }}
                >
                    <SwapHorizOutlinedIcon sx={{ fontSize: 18, color: activeColor }} />
                </Box>
            </Tooltip>
        );
    }

    return (
        <Box sx={{ px: 1.5, pb: 1.5 }}>
            {/* section label */}
            <Typography sx={{
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: theme.palette.text.disabled,
                mb: 0.8,
                pl: 0.5,
            }}>
                Project Phase
            </Typography>

            {/* toggle bar */}
            <Box
                sx={{
                    display: "flex",
                    borderRadius: "10px",
                    border: `1px solid ${activeColor}30`,
                    bgcolor: `${activeColor}08`,
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                {/* sliding indicator */}
                <Box sx={{
                    position: "absolute",
                    top: 0,
                    left: isPhase2 ? "50%" : 0,
                    width: "50%",
                    height: "100%",
                    bgcolor: `${activeColor}18`,
                    borderRight: isPhase2 ? "none" : `1px solid ${activeColor}30`,
                    borderLeft: isPhase2 ? `1px solid ${activeColor}30` : "none",
                    transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)",
                    borderRadius: isPhase2 ? "0 9px 9px 0" : "9px 0 0 9px",
                }} />

                {/* Phase 1 button */}
                <Box
                    onClick={isPhase2 ? onSwitch : undefined}
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        py: 0.9,
                        gap: 0.3,
                        cursor: isPhase2 ? "pointer" : "default",
                        zIndex: 1,
                        position: "relative",
                        transition: "all 0.2s",
                        "&:hover": isPhase2 ? {
                            bgcolor: `${phase1Color}10`,
                        } : {},
                    }}
                >
                    <LightbulbOutlinedIcon sx={{
                        fontSize: 15,
                        color: !isPhase2 ? phase1Color : inactiveColor,
                        transition: "color 0.3s",
                    }} />
                    <Typography sx={{
                        fontSize: "0.65rem",
                        fontWeight: !isPhase2 ? 700 : 500,
                        color: !isPhase2 ? phase1Color : inactiveColor,
                        lineHeight: 1,
                        transition: "all 0.3s",
                    }}>
                        Phase 1
                    </Typography>
                    <Typography sx={{
                        fontSize: "0.55rem",
                        color: !isPhase2 ? `${phase1Color}99` : `${inactiveColor}70`,
                        lineHeight: 1,
                        transition: "all 0.3s",
                    }}>
                        Proposal
                    </Typography>
                </Box>

                {/* divider */}
                <Box sx={{ width: "1px", bgcolor: `${activeColor}20`, flexShrink: 0 }} />

                {/* Phase 2 button */}
                <Box
                    onClick={!isPhase2 ? onSwitch : undefined}
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        py: 0.9,
                        gap: 0.3,
                        cursor: !isPhase2 ? "pointer" : "default",
                        zIndex: 1,
                        position: "relative",
                        transition: "all 0.2s",
                        "&:hover": !isPhase2 ? {
                            bgcolor: `${phase2Color}10`,
                        } : {},
                    }}
                >
                    <RocketLaunchOutlinedIcon sx={{
                        fontSize: 15,
                        color: isPhase2 ? phase2Color : inactiveColor,
                        transition: "color 0.3s",
                    }} />
                    <Typography sx={{
                        fontSize: "0.65rem",
                        fontWeight: isPhase2 ? 700 : 500,
                        color: isPhase2 ? phase2Color : inactiveColor,
                        lineHeight: 1,
                        transition: "all 0.3s",
                    }}>
                        Phase 2
                    </Typography>
                    <Typography sx={{
                        fontSize: "0.55rem",
                        color: isPhase2 ? `${phase2Color}99` : `${inactiveColor}70`,
                        lineHeight: 1,
                        transition: "all 0.3s",
                    }}>
                        Project
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────

export default function Sidebar({
    width,
    collapsedWidth,
    collapsed,
    mobileOpen,
    onMobileClose,
    onCollapse,
    isMobile,
    onPhaseSwitch,     // () => void  — called when user clicks phase switcher
}) {
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, role, logout, currentPhase } = useAuth();
    const { mode, toggleMode } = useThemeContext();

    const t = theme.palette.custom ?? {};
    const navItems = NAV_ITEMS[role] ?? [];
    const currentWidth = collapsed ? collapsedWidth : width;

    const isActive = (path) =>
        path === `/${role}`
            ? location.pathname === path
            : location.pathname.startsWith(path);

    const handleNav = (path) => {
        navigate(path);
        if (isMobile) onMobileClose();
    };

    const handleLogout = () => {
        sessionStorage.removeItem("team_checked");
        sessionStorage.removeItem("profile_done");
        sessionStorage.removeItem("student_profile");
        logout();
        navigate("/login");
    };

    // ── phase accent colour (only for student) ────────────────────────────
    const isPhase2 = currentPhase === "Phase2";
    const phaseAccent = role === "student"
        ? (isPhase2 ? "#6D8A7D" : "#C49A6C")
        : (ROLE_COLOR[role] ?? "#B46F4C");

    // ── drawer content ────────────────────────────────────────────────────
    const drawerContent = (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: currentWidth,
            overflow: "hidden",
            transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: 220,
            }),
            // Subtle phase-tinted left border for student
            borderRight: role === "student"
                ? `2px solid ${phaseAccent}25`
                : "none",
        }}>

            {/* ── Logo + collapse ── */}
            <Box sx={{
                height: 64,
                display: "flex",
                alignItems: "center",
                px: collapsed ? 1.5 : 2.5,
                justifyContent: collapsed ? "center" : "space-between",
                borderBottom: `1px solid ${t.borderLight ?? theme.palette.divider}`,
                flexShrink: 0,
            }}>
                {!collapsed && (
                    <Box>
                        <Typography sx={{
                            fontFamily: '"Playfair Display", serif',
                            fontWeight: 700,
                            fontSize: "1.05rem",
                            color: t.accentPrimary ?? phaseAccent,
                            lineHeight: 1.2,
                            transition: "color 0.4s ease",
                        }}>
                            GPMS
                        </Typography>
                        <Typography sx={{
                            fontSize: "0.65rem",
                            color: t.textTertiary ?? theme.palette.text.disabled,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                        }}>
                            Palestine Tech Uni
                        </Typography>
                    </Box>
                )}
                {!isMobile && (
                    <Tooltip title={collapsed ? "Expand" : "Collapse"} placement="right">
                        <IconButton
                            size="small"
                            onClick={onCollapse}
                            sx={{
                                width: 28,
                                height: 28,
                                border: `1px solid ${t.borderLight ?? theme.palette.divider}`,
                                color: t.textSecondary ?? theme.palette.text.secondary,
                                bgcolor: t.surfaceCard ?? "transparent",
                                "&:hover": { bgcolor: t.surfaceHover ?? theme.palette.action.hover },
                            }}
                        >
                            {collapsed
                                ? <ChevronRightIcon sx={{ fontSize: 16 }} />
                                : <ChevronLeftIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                    </Tooltip>
                )}
            </Box>

            {/* ── User profile (expanded) ── */}
            {!collapsed && (
                <Box sx={{
                    px: 2.5,
                    py: 2,
                    borderBottom: `1px solid ${t.borderLight ?? theme.palette.divider}`,
                }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                            src={user?.avatar}
                            sx={{
                                width: 38,
                                height: 38,
                                bgcolor: ROLE_COLOR[role],
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                flexShrink: 0,
                            }}
                        >
                            {user?.name?.charAt(0).toUpperCase()
                                ?? user?.username?.charAt(0).toUpperCase()
                                ?? "?"}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography
                                variant="body2"
                                fontWeight={600}
                                noWrap
                                sx={{ color: t.textPrimary ?? theme.palette.text.primary }}
                            >
                                {user?.name ?? user?.username ?? "User"}
                            </Typography>
                            <Stack direction="row" spacing={0.6} alignItems="center" mt={0.3}>
                                <Box sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    px: 0.8,
                                    py: 0.15,
                                    borderRadius: 1,
                                    bgcolor: `${ROLE_COLOR[role]}18`,
                                }}>
                                    <Typography sx={{
                                        fontSize: "0.65rem",
                                        fontWeight: 600,
                                        letterSpacing: "0.05em",
                                        textTransform: "uppercase",
                                        color: ROLE_COLOR[role],
                                    }}>
                                        {ROLE_LABEL[role] ?? role}
                                    </Typography>
                                </Box>

                                {/* Phase badge — only for student */}
                                {role === "student" && (
                                    <Chip
                                        label={currentPhase === "Phase2" ? "P2" : "P1"}
                                        size="small"
                                        sx={{
                                            height: 16,
                                            fontSize: "0.58rem",
                                            fontWeight: 700,
                                            bgcolor: `${phaseAccent}18`,
                                            color: phaseAccent,
                                            border: `1px solid ${phaseAccent}30`,
                                            "& .MuiChip-label": { px: 0.6 },
                                            transition: "all 0.4s ease",
                                        }}
                                    />
                                )}
                            </Stack>
                        </Box>
                    </Stack>

                    {role === "student" && (
                        <Box sx={{ mt: 1.5 }}>
                            {user?.teamName && (
                                <Typography sx={{ fontSize: "0.75rem", color: t.textSecondary ?? theme.palette.text.secondary }}>
                                    Team:{" "}
                                    <span style={{ color: phaseAccent, fontWeight: 600 }}>
                                        {user.teamName}
                                    </span>
                                </Typography>
                            )}
                            {user?.studentId && (
                                <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary ?? theme.palette.text.disabled, mt: 0.3 }}>
                                    ID: {user.studentId}
                                </Typography>
                            )}
                        </Box>
                    )}

                    {role === "supervisor" && user?.department && (
                        <Typography sx={{ fontSize: "0.75rem", color: t.textSecondary ?? theme.palette.text.secondary, mt: 1 }}>
                            {user.department}
                        </Typography>
                    )}
                </Box>
            )}

            {/* ── User avatar (collapsed) ── */}
            {collapsed && (
                <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    py: 2,
                    borderBottom: `1px solid ${t.borderLight ?? theme.palette.divider}`,
                }}>
                    <Tooltip title={user?.name ?? user?.username ?? "User"} placement="right">
                        <Avatar
                            src={user?.avatar}
                            sx={{
                                width: 36,
                                height: 36,
                                bgcolor: ROLE_COLOR[role],
                                fontSize: "0.85rem",
                                fontWeight: 600,
                            }}
                        >
                            {user?.name?.charAt(0) ?? user?.username?.charAt(0) ?? "?"}
                        </Avatar>
                    </Tooltip>
                </Box>
            )}

            {/* ── Phase Switcher (student only) ── */}
            {role === "student" && (
                <Box sx={{
                    pt: 1.5,
                    borderBottom: `1px solid ${t.borderLight ?? theme.palette.divider}`,
                    pb: collapsed ? 0 : 0,
                }}>
                    <PhaseSwitcher
                        collapsed={collapsed}
                        currentPhase={currentPhase}
                        onSwitch={onPhaseSwitch}
                    />
                </Box>
            )}

            {/* ── Nav items ── */}
            <Box sx={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden", py: 1 }}>
                <List dense disablePadding>
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Tooltip key={item.path} title={collapsed ? item.label : ""} placement="right">
                                <ListItemButton
                                    selected={active}
                                    onClick={() => handleNav(item.path)}
                                    sx={{
                                        mx: 1,
                                        mb: 0.25,
                                        px: 1.5,
                                        justifyContent: collapsed ? "center" : "flex-start",
                                        borderRadius: "8px",
                                        minHeight: 40,
                                        // active state uses phase accent for student
                                        "&.Mui-selected": {
                                            bgcolor: `${role === "student" ? phaseAccent : (t.accentPrimary ?? "#B46F4C")}12`,
                                            "&:hover": {
                                                bgcolor: `${role === "student" ? phaseAccent : (t.accentPrimary ?? "#B46F4C")}18`,
                                            },
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{
                                        minWidth: collapsed ? "auto" : 36,
                                        color: active
                                            ? (role === "student" ? phaseAccent : (t.accentPrimary ?? "#B46F4C"))
                                            : (t.textSecondary ?? theme.palette.text.secondary),
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
                                                color: active
                                                    ? (role === "student" ? phaseAccent : (t.accentPrimary ?? "#B46F4C"))
                                                    : (t.textPrimary ?? theme.palette.text.primary),
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
            <Box sx={{ borderTop: `1px solid ${t.borderLight ?? theme.palette.divider}`, py: 1 }}>

                {/* theme toggle */}
                <Tooltip title={`Switch to ${mode === "light" ? "Dark" : "Light"} mode`} placement="right">
                    <ListItemButton
                        onClick={toggleMode}
                        sx={{
                            mx: 1,
                            borderRadius: "8px",
                            justifyContent: collapsed ? "center" : "flex-start",
                            minHeight: 40,
                            px: 1.5,
                        }}
                    >
                        <ListItemIcon sx={{
                            minWidth: collapsed ? "auto" : 36,
                            color: t.textSecondary ?? theme.palette.text.secondary,
                            "& svg": { fontSize: 20 },
                        }}>
                            {mode === "light"
                                ? <DarkModeOutlinedIcon />
                                : <LightModeOutlinedIcon />}
                        </ListItemIcon>
                        {!collapsed && (
                            <ListItemText
                                primary={mode === "light" ? "Dark Mode" : "Light Mode"}
                                primaryTypographyProps={{
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                    color: t.textPrimary ?? theme.palette.text.primary,
                                }}
                            />
                        )}
                    </ListItemButton>
                </Tooltip>

                {/* settings */}
                {role !== "admin" && (
                    <Tooltip title={collapsed ? "Settings" : ""} placement="right">
                        <ListItemButton
                            onClick={() => handleNav(`/${role}/settings`)}
                            selected={isActive(`/${role}/settings`)}
                            sx={{
                                mx: 1,
                                borderRadius: "8px",
                                justifyContent: collapsed ? "center" : "flex-start",
                                minHeight: 40,
                                px: 1.5,
                            }}
                        >
                            <ListItemIcon sx={{
                                minWidth: collapsed ? "auto" : 36,
                                color: t.textSecondary ?? theme.palette.text.secondary,
                                "& svg": { fontSize: 20 },
                            }}>
                                <SettingsOutlinedIcon />
                            </ListItemIcon>
                            {!collapsed && (
                                <ListItemText
                                    primary="Settings"
                                    primaryTypographyProps={{
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                        color: t.textPrimary ?? theme.palette.text.primary,
                                    }}
                                />
                            )}
                        </ListItemButton>
                    </Tooltip>
                )}

                {/* logout */}
                <Tooltip title={collapsed ? "Logout" : ""} placement="right">
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            mx: 1,
                            borderRadius: "8px",
                            justifyContent: collapsed ? "center" : "flex-start",
                            minHeight: 40,
                            px: 1.5,
                            "&:hover": {
                                bgcolor: `${t.error ?? "#C47E7E"}14`,
                                "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
                                    color: t.error ?? "#C47E7E",
                                },
                            },
                        }}
                    >
                        <ListItemIcon sx={{
                            minWidth: collapsed ? "auto" : 36,
                            color: t.textSecondary ?? theme.palette.text.secondary,
                            "& svg": { fontSize: 20 },
                        }}>
                            <LogoutOutlinedIcon />
                        </ListItemIcon>
                        {!collapsed && (
                            <ListItemText
                                primary="Logout"
                                primaryTypographyProps={{
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                    color: t.textPrimary ?? theme.palette.text.primary,
                                }}
                            />
                        )}
                    </ListItemButton>
                </Tooltip>
            </Box>
        </Box>
    );

    if (isMobile) {
        return (
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onMobileClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    "& .MuiDrawer-paper": {
                        width,
                        boxSizing: "border-box",
                        bgcolor: theme.palette.background.paper,
                    },
                }}
            >
                {drawerContent}
            </Drawer>
        );
    }

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: currentWidth,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: currentWidth,
                    boxSizing: "border-box",
                    bgcolor: theme.palette.background.paper,
                    overflowX: "hidden",
                    transition: theme.transitions.create("width", {
                        easing: theme.transitions.easing.sharp,
                        duration: 220,
                    }),
                },
            }}
        >
            {drawerContent}
        </Drawer>
    );
}