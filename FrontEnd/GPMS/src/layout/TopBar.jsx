// src/layout/TopBar.jsx

import React, { useState } from 'react';
import {
    AppBar, Toolbar, Box, Typography, IconButton,
    Badge, InputBase, Menu, MenuItem, Avatar, useTheme,
    Divider, Button, CircularProgress, Tooltip,
} from '@mui/material';
import {
    Search as SearchIcon,
    Notifications as NotificationsIcon,
    WbSunny as LightModeIcon,
    NightsStay as DarkModeIcon,
    Logout as LogoutIcon,
    Menu as MenuIcon,
    DoneAll as DoneAllIcon,
    FiberManualRecord as DotIcon,
} from '@mui/icons-material';
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import { styled, alpha } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useThemeContext } from '../contexts/ThemeContext';
import { useNotifications } from '../hooks/useNotifications';

// ── Search ────────────────────────────────────────────────────────────────────
const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.08),
    '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.12) },
    marginRight: theme.spacing(2),
    width: 'auto',
}));
const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
}));
const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        width: '20ch',
    },
}));

const DEFAULT_COLOR = "#B46F4C";
const P1_COLOR = "#C49A6C";
const P2_COLOR = "#6D8A7D";

// ─────────────────────────────────────────────────────────────────────────────

const TopBar = ({ onMenuClick, isMobile }) => {
    const theme = useTheme();
    const { user, role, logout, currentPhase } = useAuth();
    const { mode, toggleMode } = useThemeContext();
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchor, setNotificationAnchor] = useState(null);

    const handleProfileMenuOpen = (e) => setAnchorEl(e.currentTarget);
    const handleNotificationMenuOpen = (e) => {
        setNotificationAnchor(e.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
        setNotificationAnchor(null);
    };
    const handleLogout = () => {
        sessionStorage.removeItem("team_checked");
        logout();
        handleMenuClose();
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
    };

    const displayName = user?.name ?? user?.fullName ?? user?.username ?? "User";
    const avatarLetter = displayName.charAt(0).toUpperCase();

    // ── Phase config ──────────────────────────────────────────────────────────
    const isStudent = role === "student";
    const isP2 = isStudent && currentPhase === "Phase2";
    const phaseColor = isStudent ? (isP2 ? P2_COLOR : P1_COLOR) : DEFAULT_COLOR;
    const PhaseIcon = isP2 ? RocketLaunchOutlinedIcon : LightbulbOutlinedIcon;
    const phaseLabel = isP2 ? "Phase 2 — Project" : "Phase 1 — Proposal";

    return (
        <AppBar
            position="static"
            color="transparent"
            elevation={0}
            sx={{
                bgcolor: theme.palette.background.paper,
                height: 64,
                justifyContent: 'center',
                borderTop: isStudent
                    ? `0px solid ${phaseColor}`
                    : `1px solid ${theme.palette.divider}`,
                borderBottom: `1px solid ${theme.palette.divider}`,
                transition: "border-top-color 0.4s ease",
            }}
        >
            <Toolbar sx={{ minHeight: '64px !important' }}>

                {isMobile && (
                    <IconButton onClick={onMenuClick} sx={{ mr: 1, color: theme.palette.text.secondary }}>
                        <MenuIcon />
                    </IconButton>
                )}

                {/* Welcome */}
                <Typography variant="h6" noWrap sx={{
                    fontWeight: 600,
                    display: { xs: 'none', sm: 'block' },
                    color: theme.palette.text.primary,
                }}>
                    Welcome back,{' '}
                    <Box component="span" sx={{ color: phaseColor, transition: "color 0.4s ease" }}>
                        {displayName.split(' ')[0]}
                    </Box>
                </Typography>

                {/* Phase chip */}
                {isStudent && (
                    <Box sx={{
                        display: { xs: 'none', md: 'flex' },
                        alignItems: 'center',
                        gap: "6px",
                        ml: 2,
                        px: 1.4,
                        py: 0.6,
                        borderRadius: "8px",
                        bgcolor: `${phaseColor}18`,
                        border: `1.5px solid ${phaseColor}50`,
                        transition: "all 0.4s ease",
                    }}>
                        <PhaseIcon sx={{ fontSize: 15, color: phaseColor, transition: "color 0.4s" }} />
                        <Typography sx={{
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            color: phaseColor,
                            letterSpacing: "0.02em",
                            lineHeight: 1,
                            transition: "color 0.4s ease",
                        }}>
                            {phaseLabel}
                        </Typography>
                    </Box>
                )}

                <Box sx={{ flexGrow: 1 }} />

                {/* Search */}
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                        </SearchIconWrapper>
                        <StyledInputBase placeholder="Search…" inputProps={{ 'aria-label': 'search' }} />
                    </Search>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>

                    <IconButton onClick={toggleMode} sx={{ color: theme.palette.text.secondary }}>
                        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                    </IconButton>

                    {/* 🔔 Notifications */}
                    <Tooltip title="Notifications">
                        <IconButton
                            onClick={handleNotificationMenuOpen}
                            sx={{ color: theme.palette.text.secondary }}
                        >
                            <Badge badgeContent={unreadCount} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    <IconButton edge="end" onClick={handleProfileMenuOpen}>
                        <Avatar src={user?.avatar} sx={{
                            width: 34, height: 34,
                            bgcolor: phaseColor,
                            fontSize: "0.9rem", fontWeight: 700,
                            transition: "background-color 0.4s ease",
                        }}>
                            {avatarLetter}
                        </Avatar>
                    </IconButton>
                </Box>

                {/* Profile menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{ sx: { mt: 1.5, borderRadius: 2, minWidth: 180 } }}
                >
                    <MenuItem onClick={handleLogout}>
                        <LogoutIcon sx={{ mr: 1, fontSize: 18 }} />
                        Logout
                    </MenuItem>
                </Menu>

                {/* 🔔 Notifications Menu */}
                <Menu
                    anchorEl={notificationAnchor}
                    open={Boolean(notificationAnchor)}
                    onClose={handleMenuClose}
                    PaperProps={{
                        sx: {
                            mt: 1.5,
                            borderRadius: 2,
                            minWidth: 340,
                            maxWidth: 360,
                            overflow: 'visible',   // ← مهم
                        }
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    {/* Header */}
                    <Box sx={{
                        px: 2, py: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                    }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                            Notifications
                            {unreadCount > 0 && (
                                <Box component="span" sx={{
                                    ml: 1,
                                    px: 0.9,
                                    py: 0.2,
                                    borderRadius: '10px',
                                    bgcolor: 'error.main',
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                }}>
                                    {unreadCount}
                                </Box>
                            )}
                        </Typography>
                        {unreadCount > 0 && (
                            <Button
                                size="small"
                                startIcon={<DoneAllIcon sx={{ fontSize: 14 }} />}
                                onClick={markAllAsRead}
                                sx={{
                                    fontSize: '0.72rem',
                                    color: phaseColor,
                                    textTransform: 'none',
                                    px: 1,
                                }}
                            >
                                Mark all read
                            </Button>
                        )}
                    </Box>

                    {/* ✅ هون المشكلة كانت — السكرول على Box مش على Menu */}
                    <Box sx={{
                        maxHeight: 380,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        '&::-webkit-scrollbar': { width: '4px' },
                        '&::-webkit-scrollbar-track': { background: 'transparent' },
                        '&::-webkit-scrollbar-thumb': {
                            background: alpha(phaseColor, 0.3),
                            borderRadius: '4px',
                        },
                    }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                <CircularProgress size={24} sx={{ color: phaseColor }} />
                            </Box>
                        ) : notifications.length === 0 ? (
                            <Box sx={{ py: 4, textAlign: 'center' }}>
                                <NotificationsIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    No notifications yet
                                </Typography>
                            </Box>
                        ) : (
                            notifications.map((n, index) => (
                                <React.Fragment key={n.id}>
                                    <MenuItem
                                        onClick={() => handleNotificationClick(n)}
                                        sx={{
                                            px: 2,
                                            py: 1.2,
                                            alignItems: 'flex-start',
                                            // ✅ لون خفيف بدل الغامق
                                            bgcolor: !n.isRead
                                                ? alpha(phaseColor, 0.05)
                                                : 'transparent',
                                            '&:hover': {
                                                bgcolor: alpha(phaseColor, 0.08),
                                            },
                                            transition: 'background-color 0.15s',
                                        }}
                                    >
                                        {/* Unread dot */}
                                        <Box sx={{ mt: 0.8, mr: 1, minWidth: 8 }}>
                                            {!n.isRead && (
                                                <Box sx={{
                                                    width: 7,
                                                    height: 7,
                                                    borderRadius: '50%',
                                                    bgcolor: phaseColor,
                                                    opacity: 0.8,
                                                }} />
                                            )}
                                        </Box>

                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography
                                                variant="body2"
                                                fontWeight={n.isRead ? 400 : 600}
                                                sx={{
                                                    lineHeight: 1.4,
                                                    whiteSpace: 'normal',  // ← يكسر النص للسطر الثاني
                                                }}
                                            >
                                                {n.message}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ mt: 0.3, display: 'block' }}
                                            >
                                                {n.createdAt
                                                    ? new Date(n.createdAt).toLocaleString()
                                                    : n.time}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                    {index < notifications.length - 1 && (
                                        <Divider sx={{ mx: 2, opacity: 0.4 }} />
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </Box>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default TopBar;