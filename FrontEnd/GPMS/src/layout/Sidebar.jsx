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

import { useAuth } from "../contexts/AuthContext";
import { useThemeContext } from "../contexts/ThemeContext";

const NAV_ITEMS = {
    admin: [
        { label: "Dashboard", icon: <DashboardOutlinedIcon />, path: "/admin" },
        { label: "Pending Requests", icon: <HowToRegOutlinedIcon />, path: "/admin/pending-requests" },
        { label: "User Management", icon: <PeopleOutlineIcon />, path: "/admin/users" },
        { label: "Reports", icon: <AssessmentOutlinedIcon />, path: "/admin/reports" },
        { label: "Activity Logs", icon: <HistoryOutlinedIcon />, path: "/admin/logs" },
        { label: "All Requests", icon: <AssessmentOutlinedIcon />, path: "/admin/all-requests" },
        { label: "Configuration", icon: <SettingsOutlinedIcon />, path: "/admin/settings" },
    ],
    supervisor: [
        { label: "Dashboard", icon: <DashboardOutlinedIcon />, path: "/supervisor" },
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
        { label: "Team Finder", icon: <SearchOutlinedIcon />, path: "/student/team-finder" },
        { label: "Kanban Board", icon: <ViewKanbanOutlinedIcon />, path: "/student/kanban" },
        { label: "Timeline", icon: <TimelineOutlinedIcon />, path: "/student/timeline" },
        { label: "Files", icon: <FolderOutlinedIcon />, path: "/student/files" },
        { label: "Meetings", icon: <CalendarMonthOutlinedIcon />, path: "/student/meetings" },
        { label: "Analytics", icon: <QueryStatsOutlinedIcon />, path: "/student/analytics" },
    ],
};

const ROLE_LABEL = { admin: "Administrator", supervisor: "Supervisor", student: "Student" };
const ROLE_COLOR = { admin: "#C47E7E", supervisor: "#6D8A7D", student: "#B46F4C" };

export default function Sidebar({
    width, collapsedWidth, collapsed, mobileOpen,
    onMobileClose, onCollapse, isMobile,
}) {
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, role, logout } = useAuth();
    const { mode, toggleMode } = useThemeContext();

    const t = theme.palette.custom;
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

    const drawerContent = (
        <Box sx={{
            display: "flex", flexDirection: "column", height: "100%",
            width: currentWidth, overflow: "hidden",
            transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp, duration: 220,
            }),
        }}>

            {/* ── Logo + collapse ── */}
            <Box sx={{
                height: 64, display: "flex", alignItems: "center",
                px: collapsed ? 1.5 : 2.5,
                justifyContent: collapsed ? "center" : "space-between",
                borderBottom: `1px solid ${t.borderLight}`, flexShrink: 0,
            }}>
                {!collapsed && (
                    <Box>
                        <Typography sx={{
                            fontFamily: '"Playfair Display", serif',
                            fontWeight: 700, fontSize: "1.05rem",
                            color: t.accentPrimary, lineHeight: 1.2,
                        }}>
                            GPMS
                        </Typography>
                        <Typography sx={{
                            fontSize: "0.65rem", color: t.textTertiary,
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
                            border: `1px solid ${t.borderLight}`,
                            color: t.textSecondary, bgcolor: t.surfaceCard,
                            "&:hover": { bgcolor: t.surfaceHover },
                        }}>
                            {collapsed
                                ? <ChevronRightIcon sx={{ fontSize: 16 }} />
                                : <ChevronLeftIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                    </Tooltip>
                )}
            </Box>

            {/* ── User profile (expanded) ── */}
            {!collapsed && (
                <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${t.borderLight}` }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar src={user?.avatar} sx={{
                            width: 38, height: 38,
                            bgcolor: ROLE_COLOR[role],
                            fontSize: "0.9rem", fontWeight: 600, flexShrink: 0,
                        }}>
                            {user?.name?.charAt(0).toUpperCase()
                                ?? user?.username?.charAt(0).toUpperCase()
                                ?? "?"}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap
                                sx={{ color: t.textPrimary }}>
                                {user?.name ?? user?.username ?? "User"}
                            </Typography>
                            <Box sx={{
                                display: "inline-flex", alignItems: "center",
                                px: 0.8, py: 0.15, borderRadius: 1,
                                bgcolor: `${ROLE_COLOR[role]}18`, mt: 0.3,
                            }}>
                                <Typography sx={{
                                    fontSize: "0.65rem", fontWeight: 600,
                                    letterSpacing: "0.05em", textTransform: "uppercase",
                                    color: ROLE_COLOR[role],
                                }}>
                                    {ROLE_LABEL[role] ?? role}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>

                    {role === "student" && (
                        <Box sx={{ mt: 1.5 }}>
                            {user?.teamName && (
                                <Typography sx={{ fontSize: "0.75rem", color: t.textSecondary }}>
                                    Team:{" "}
                                    <span style={{ color: t.accentPrimary, fontWeight: 600 }}>
                                        {user.teamName}
                                    </span>
                                </Typography>
                            )}
                            {user?.studentId && (
                                <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary, mt: 0.3 }}>
                                    ID: {user.studentId}
                                </Typography>
                            )}
                        </Box>
                    )}

                    {role === "supervisor" && user?.department && (
                        <Typography sx={{ fontSize: "0.75rem", color: t.textSecondary, mt: 1 }}>
                            {user.department}
                        </Typography>
                    )}
                </Box>
            )}

            {/* ── User avatar (collapsed) ── */}
            {collapsed && (
                <Box sx={{
                    display: "flex", justifyContent: "center",
                    py: 2, borderBottom: `1px solid ${t.borderLight}`,
                }}>
                    <Tooltip title={user?.name ?? user?.username ?? "User"} placement="right">
                        <Avatar src={user?.avatar} sx={{
                            width: 36, height: 36,
                            bgcolor: ROLE_COLOR[role],
                            fontSize: "0.85rem", fontWeight: 600,
                        }}>
                            {user?.name?.charAt(0) ?? user?.username?.charAt(0) ?? "?"}
                        </Avatar>
                    </Tooltip>
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
                                        mx: 1, mb: 0.25, px: 1.5,
                                        justifyContent: collapsed ? "center" : "flex-start",
                                        borderRadius: "8px", minHeight: 40,
                                    }}
                                >
                                    <ListItemIcon sx={{
                                        minWidth: collapsed ? "auto" : 36,
                                        color: active ? t.accentPrimary : t.textSecondary,
                                        "& svg": { fontSize: 20 },
                                    }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    {!collapsed && (
                                        <ListItemText
                                            primary={item.label}
                                            primaryTypographyProps={{
                                                fontSize: "0.875rem",
                                                fontWeight: active ? 600 : 500,
                                                color: active ? t.accentPrimary : t.textPrimary,
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
            <Box sx={{ borderTop: `1px solid ${t.borderLight}`, py: 1 }}>

                {/* theme toggle */}
                <Tooltip title={`Switch to ${mode === "light" ? "Dark" : "Light"} mode`} placement="right">
                    <ListItemButton onClick={toggleMode} sx={{
                        mx: 1, borderRadius: "8px",
                        justifyContent: collapsed ? "center" : "flex-start",
                        minHeight: 40, px: 1.5,
                    }}>
                        <ListItemIcon sx={{
                            minWidth: collapsed ? "auto" : 36,
                            color: t.textSecondary, "& svg": { fontSize: 20 },
                        }}>
                            {mode === "light"
                                ? <DarkModeOutlinedIcon />
                                : <LightModeOutlinedIcon />}
                        </ListItemIcon>
                        {!collapsed && (
                            <ListItemText
                                primary={mode === "light" ? "Dark Mode" : "Light Mode"}
                                primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500, color: t.textPrimary }}
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
                                mx: 1, borderRadius: "8px",
                                justifyContent: collapsed ? "center" : "flex-start",
                                minHeight: 40, px: 1.5,
                            }}
                        >
                            <ListItemIcon sx={{
                                minWidth: collapsed ? "auto" : 36,
                                color: t.textSecondary, "& svg": { fontSize: 20 },
                            }}>
                                <SettingsOutlinedIcon />
                            </ListItemIcon>
                            {!collapsed && (
                                <ListItemText
                                    primary="Settings"
                                    primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500, color: t.textPrimary }}
                                />
                            )}
                        </ListItemButton>
                    </Tooltip>
                )}

                {/* logout */}
                <Tooltip title={collapsed ? "Logout" : ""} placement="right">
                    <ListItemButton onClick={handleLogout} sx={{
                        mx: 1, borderRadius: "8px",
                        justifyContent: collapsed ? "center" : "flex-start",
                        minHeight: 40, px: 1.5,
                        "&:hover": {
                            bgcolor: `${t.error}14`,
                            "& .MuiListItemIcon-root, & .MuiListItemText-primary": { color: t.error },
                        },
                    }}>
                        <ListItemIcon sx={{
                            minWidth: collapsed ? "auto" : 36,
                            color: t.textSecondary, "& svg": { fontSize: 20 },
                        }}>
                            <LogoutOutlinedIcon />
                        </ListItemIcon>
                        {!collapsed && (
                            <ListItemText
                                primary="Logout"
                                primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500, color: t.textPrimary }}
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
                sx={{
                    "& .MuiDrawer-paper": {
                        width, boxSizing: "border-box",
                        bgcolor: theme.palette.background.paper
                    }
                }}>
                {drawerContent}
            </Drawer>
        );
    }

    return (
        <Drawer variant="permanent" sx={{
            width: currentWidth, flexShrink: 0,
            "& .MuiDrawer-paper": {
                width: currentWidth, boxSizing: "border-box",
                bgcolor: theme.palette.background.paper,
                overflowX: "hidden",
                transition: theme.transitions.create("width", {
                    easing: theme.transitions.easing.sharp, duration: 220,
                }),
            },
        }}>
            {drawerContent}
        </Drawer>
    );
}