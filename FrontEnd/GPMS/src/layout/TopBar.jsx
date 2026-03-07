import { useState } from "react";
import {
    AppBar,
    Toolbar,
    Box,
    IconButton,
    Typography,
    InputBase,
    Badge,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Stack,
    Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";

import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import { useAuth } from "../contexts/AuthContext";
import { useThemeContext } from "../contexts/ThemeContext";

// ─── Breadcrumb helper ────────────────────────────────────────────────────────

const ROUTE_LABELS = {
    admin: "Dashboard",
    "admin/users": "User Management",
    "admin/reports": "Reports",
    "admin/logs": "Activity Logs",
    "admin/settings": "Configuration",

    supervisor: "Dashboard",
    "supervisor/groups": "My Groups",
    "supervisor/requests": "Pending Requests",
    "supervisor/files": "File Review",
    "supervisor/meetings": "Meetings",
    "supervisor/ai-reports": "AI Reports",
    "supervisor/analytics": "Analytics",

    student: "Dashboard",
    "student/team-finder": "Team Finder",
    "student/kanban": "Kanban Board",
    "student/files": "Files",
    "student/meetings": "Meetings",
    "student/analytics": "Analytics",
};

function getPageTitle(pathname) {
    const key = pathname.replace(/^\//, "").replace(/\/$/, "");
    return ROUTE_LABELS[key] ?? "GPMS";
}

// ─── Mock notifications ───────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS = [
    { id: 1, text: "Dr. Vane commented on your file", time: "10m ago", read: false },
    { id: 2, text: "Meeting confirmed for tomorrow 2pm", time: "1h ago", read: false },
    { id: 3, text: "New task assigned: UI Mockups", time: "3h ago", read: true },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function TopBar({ height, onMenuClick, isMobile }) {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, role, logout } = useAuth();
    const { mode, toggleMode } = useThemeContext();

    const t = theme.palette.custom;
    const pageTitle = getPageTitle(location.pathname);
    const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

    // User menu
    const [userAnchor, setUserAnchor] = useState(null);
    const openUserMenu = Boolean(userAnchor);

    // Notification menu
    const [notifAnchor, setNotifAnchor] = useState(null);
    const openNotif = Boolean(notifAnchor);

    const handleLogout = () => {
        setUserAnchor(null);
        logout();
        navigate("/login");
    };

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                height,
                left: 0,
                right: 0,
                zIndex: theme.zIndex.drawer - 1,
                bgcolor: theme.palette.background.paper,
                borderBottom: `1px solid ${t.borderLight}`,
            }}
        >
            <Toolbar
                sx={{
                    height: "100%",
                    minHeight: `${height}px !important`,
                    px: { xs: 2, sm: 3 },
                    gap: 2,
                }}
            >
                {/* Mobile hamburger */}
                {isMobile && (
                    <IconButton
                        size="small"
                        onClick={onMenuClick}
                        sx={{ color: t.textSecondary, mr: 0.5 }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}

                {/* Page title */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: '"DM Sans", sans-serif',
                            fontWeight: 700,
                            fontSize: { xs: "1rem", sm: "1.1rem" },
                            color: t.textPrimary,
                            lineHeight: 1.3,
                        }}
                    >
                        {pageTitle}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: "0.72rem",
                            color: t.textTertiary,
                            display: { xs: "none", sm: "block" },
                        }}
                    >
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </Typography>
                </Box>

                {/* Search bar — desktop */}
                <Box
                    sx={{
                        display: { xs: "none", md: "flex" },
                        alignItems: "center",
                        gap: 1,
                        bgcolor: t.bgPrimary,
                        border: `1px solid ${t.borderLight}`,
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.6,
                        width: 220,
                        transition: "all 0.2s",
                        "&:focus-within": {
                            borderColor: t.accentPrimary,
                            width: 280,
                        },
                    }}
                >
                    <SearchIcon sx={{ fontSize: 17, color: t.textTertiary }} />
                    <InputBase
                        placeholder="Search..."
                        sx={{
                            fontSize: "0.8rem",
                            color: t.textPrimary,
                            "& input::placeholder": { color: t.textTertiary },
                            flexGrow: 1,
                        }}
                    />
                </Box>

                {/* Theme toggle */}
                <Tooltip title={`${mode === "light" ? "Dark" : "Light"} mode`}>
                    <IconButton
                        size="small"
                        onClick={toggleMode}
                        sx={{
                            color: t.textSecondary,
                            border: `1px solid ${t.borderLight}`,
                            borderRadius: 2,
                            width: 34,
                            height: 34,
                        }}
                    >
                        {mode === "light" ? (
                            <DarkModeOutlinedIcon sx={{ fontSize: 18 }} />
                        ) : (
                            <LightModeOutlinedIcon sx={{ fontSize: 18 }} />
                        )}
                    </IconButton>
                </Tooltip>

                {/* Notifications */}
                <Tooltip title="Notifications">
                    <IconButton
                        size="small"
                        onClick={(e) => setNotifAnchor(e.currentTarget)}
                        sx={{
                            color: t.textSecondary,
                            border: `1px solid ${t.borderLight}`,
                            borderRadius: 2,
                            width: 34,
                            height: 34,
                        }}
                    >
                        <Badge badgeContent={unreadCount} color="error">
                            <NotificationsOutlinedIcon sx={{ fontSize: 18 }} />
                        </Badge>
                    </IconButton>
                </Tooltip>

                {/* User avatar */}
                <Tooltip title={user?.name ?? "Account"}>
                    <IconButton
                        size="small"
                        onClick={(e) => setUserAnchor(e.currentTarget)}
                        sx={{ p: 0.25 }}
                    >
                        <Avatar
                            src={user?.avatar}
                            sx={{
                                width: 34,
                                height: 34,
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                bgcolor: t.accentPrimary,
                                border: `2px solid ${openUserMenu ? t.accentPrimary : "transparent"}`,
                                transition: "border-color 0.2s",
                            }}
                        >
                            {user?.name?.charAt(0) ?? "?"}
                        </Avatar>
                    </IconButton>
                </Tooltip>
            </Toolbar>

            {/* ── Notification menu ── */}
            <Menu
                anchorEl={notifAnchor}
                open={openNotif}
                onClose={() => setNotifAnchor(null)}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                PaperProps={{
                    sx: {
                        width: 320,
                        maxHeight: 400,
                        bgcolor: theme.palette.background.paper,
                    },
                }}
            >
                <Box sx={{ px: 2, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h5" sx={{ color: t.textPrimary }}>
                        Notifications
                    </Typography>
                    {unreadCount > 0 && (
                        <Typography sx={{ fontSize: "0.75rem", color: t.accentPrimary, cursor: "pointer" }}>
                            Mark all read
                        </Typography>
                    )}
                </Box>
                <Divider />
                {MOCK_NOTIFICATIONS.map((n) => (
                    <MenuItem
                        key={n.id}
                        sx={{
                            px: 2,
                            py: 1.2,
                            alignItems: "flex-start",
                            bgcolor: n.read ? "transparent" : `${t.accentPrimary}09`,
                            borderLeft: n.read ? "none" : `3px solid ${t.accentPrimary}`,
                            borderRadius: 0,
                            margin: 0,
                        }}
                    >
                        <Box sx={{ minWidth: 0 }}>
                            <Typography
                                sx={{
                                    fontSize: "0.82rem",
                                    fontWeight: n.read ? 400 : 600,
                                    color: t.textPrimary,
                                    lineHeight: 1.4,
                                    whiteSpace: "normal",
                                }}
                            >
                                {n.text}
                            </Typography>
                            <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary, mt: 0.3 }}>
                                {n.time}
                            </Typography>
                        </Box>
                    </MenuItem>
                ))}
                <Divider />
                <Box sx={{ px: 2, py: 1, textAlign: "center" }}>
                    <Typography sx={{ fontSize: "0.8rem", color: t.accentPrimary, cursor: "pointer" }}>
                        View all notifications
                    </Typography>
                </Box>
            </Menu>

            {/* ── User menu ── */}
            <Menu
                anchorEl={userAnchor}
                open={openUserMenu}
                onClose={() => setUserAnchor(null)}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                PaperProps={{
                    sx: { width: 220, bgcolor: theme.palette.background.paper },
                }}
            >
                {/* User info */}
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ color: t.textPrimary }} noWrap>
                        {user?.name ?? "User"}
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: t.textTertiary }} noWrap>
                        {user?.email ?? ""}
                    </Typography>
                </Box>
                <Divider />

                <MenuItem onClick={() => { setUserAnchor(null); navigate(`/${role}/settings`); }}>
                    <PersonOutlineIcon sx={{ fontSize: 18, mr: 1.5, color: t.textSecondary }} />
                    <Typography sx={{ fontSize: "0.875rem" }}>Profile</Typography>
                </MenuItem>

                <MenuItem onClick={() => { setUserAnchor(null); navigate(`/${role}/settings`); }}>
                    <SettingsOutlinedIcon sx={{ fontSize: 18, mr: 1.5, color: t.textSecondary }} />
                    <Typography sx={{ fontSize: "0.875rem" }}>Settings</Typography>
                </MenuItem>

                <MenuItem onClick={() => { setUserAnchor(null); toggleMode(); }}>
                    {mode === "light"
                        ? <DarkModeOutlinedIcon sx={{ fontSize: 18, mr: 1.5, color: t.textSecondary }} />
                        : <LightModeOutlinedIcon sx={{ fontSize: 18, mr: 1.5, color: t.textSecondary }} />
                    }
                    <Typography sx={{ fontSize: "0.875rem" }}>
                        {mode === "light" ? "Dark Mode" : "Light Mode"}
                    </Typography>
                </MenuItem>

                <Divider />
                <MenuItem
                    onClick={handleLogout}
                    sx={{
                        "&:hover": { bgcolor: `${t.error}14` },
                        "&:hover .logout-icon, &:hover .logout-text": { color: t.error },
                    }}
                >
                    <LogoutOutlinedIcon className="logout-icon" sx={{ fontSize: 18, mr: 1.5, color: t.textSecondary }} />
                    <Typography className="logout-text" sx={{ fontSize: "0.875rem" }}>
                        Logout
                    </Typography>
                </MenuItem>
            </Menu>
        </AppBar>
    );
}