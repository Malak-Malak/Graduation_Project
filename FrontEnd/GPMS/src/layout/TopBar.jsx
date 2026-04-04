// src/layout/TopBar.jsx

import React, { useState } from 'react';
import {
    AppBar, Toolbar, Box, Typography, IconButton, Badge,
    InputBase, Menu, MenuItem, Avatar, useTheme, Chip,
} from '@mui/material';
import {
    Search as SearchIcon,
    Notifications as NotificationsIcon,
    WbSunny as LightModeIcon,
    NightsStay as DarkModeIcon,
    Logout as LogoutIcon,
    Menu as MenuIcon,
} from '@mui/icons-material';
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import { styled, alpha } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useThemeContext } from '../contexts/ThemeContext';

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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        width: '20ch',
    },
}));

const PRIMARY = "#B46F4C";

const TopBar = ({ onMenuClick, isMobile }) => {
    const theme = useTheme();
    const { user, role, logout, currentPhase } = useAuth();
    const { mode, toggleMode } = useThemeContext();

    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchor, setNotificationAnchor] = useState(null);

    const handleProfileMenuOpen = (e) => setAnchorEl(e.currentTarget);
    const handleNotificationMenuOpen = (e) => setNotificationAnchor(e.currentTarget);
    const handleMenuClose = () => { setAnchorEl(null); setNotificationAnchor(null); };
    const handleLogout = () => {
        sessionStorage.removeItem("team_checked");
        logout();
        handleMenuClose();
    };

    const notifications = [
        { id: 1, message: 'New comment on your task', time: '5 min ago', read: false },
        { id: 2, message: 'Meeting scheduled for tomorrow', time: '1 hour ago', read: false },
        { id: 3, message: 'File approved by supervisor', time: '2 hours ago', read: true },
    ];
    const unreadCount = notifications.filter((n) => !n.read).length;

    const displayName = user?.name ?? user?.fullName ?? user?.username ?? "User";
    const avatarLetter = displayName.charAt(0).toUpperCase();

    // ── Phase config (student only) ───────────────────────────────────────────
    const isPhase2 = role === "student" && currentPhase === "Phase2";
    const phaseColor = isPhase2 ? "#6D8A7D" : "#C49A6C";
    const PhaseIcon = isPhase2 ? RocketLaunchOutlinedIcon : LightbulbOutlinedIcon;
    const phaseLabel = isPhase2 ? "Phase 2 — Project" : "Phase 1 — Proposal";

    return (
        <AppBar
            position="static"
            color="transparent"
            elevation={0}
            sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
                height: 64,
                justifyContent: 'center',
                // subtle top phase indicator line for student
                borderTop: role === "student"
                    ? `2px solid ${phaseColor}40`
                    : "none",
                transition: "border-top-color 0.4s ease",
            }}
        >
            <Toolbar sx={{ minHeight: '64px !important' }}>

                {isMobile && (
                    <IconButton
                        onClick={onMenuClick}
                        sx={{ mr: 1, color: theme.palette.text.secondary }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}

                {/* Welcome text */}
                <Typography
                    variant="h6"
                    noWrap
                    sx={{
                        fontWeight: 600,
                        display: { xs: 'none', sm: 'block' },
                        color: theme.palette.text.primary,
                    }}
                >
                    Welcome back,{' '}
                    <Box
                        component="span"
                        sx={{
                            color: role === "student" ? phaseColor : PRIMARY,
                            transition: "color 0.4s ease",
                        }}
                    >
                        {displayName.split(' ')[0]}
                    </Box>
                </Typography>

                {/* Phase badge — only for student, visible on sm+ */}
                {role === "student" && (
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 2, alignItems: 'center' }}>
                        <Chip
                            icon={<PhaseIcon sx={{ fontSize: '14px !important' }} />}
                            label={phaseLabel}
                            size="small"
                            sx={{
                                height: 24,
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                bgcolor: `${phaseColor}12`,
                                color: phaseColor,
                                border: `1px solid ${phaseColor}30`,
                                "& .MuiChip-icon": { color: phaseColor },
                                "& .MuiChip-label": { px: 1 },
                                transition: "all 0.4s ease",
                                letterSpacing: "0.02em",
                            }}
                        />
                    </Box>
                )}

                <Box sx={{ flexGrow: 1 }} />

                {/* Search — hidden on small mobile */}
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{ 'aria-label': 'search' }}
                        />
                    </Search>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {/* Theme toggle */}
                    <IconButton onClick={toggleMode} sx={{ color: theme.palette.text.secondary }}>
                        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                    </IconButton>

                    {/* Notifications */}
                    <IconButton
                        onClick={handleNotificationMenuOpen}
                        sx={{ color: theme.palette.text.secondary }}
                    >
                        <Badge badgeContent={unreadCount} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>

                    {/* Avatar */}
                    <IconButton edge="end" onClick={handleProfileMenuOpen}>
                        <Avatar
                            src={user?.avatar}
                            sx={{
                                width: 34,
                                height: 34,
                                bgcolor: role === "student" ? phaseColor : PRIMARY,
                                fontSize: "0.9rem",
                                fontWeight: 700,
                                transition: "background-color 0.4s ease",
                            }}
                        >
                            {avatarLetter}
                        </Avatar>
                    </IconButton>
                </Box>

                {/* Profile Menu */}
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

                {/* Notifications Menu */}
                <Menu
                    anchorEl={notificationAnchor}
                    open={Boolean(notificationAnchor)}
                    onClose={handleMenuClose}
                    PaperProps={{
                        sx: { mt: 1.5, borderRadius: 2, minWidth: 300, maxHeight: 400 },
                    }}
                >
                    {notifications.map((n) => (
                        <MenuItem
                            key={n.id}
                            onClick={handleMenuClose}
                            sx={{
                                bgcolor: !n.read
                                    ? alpha(role === "student" ? phaseColor : PRIMARY, 0.08)
                                    : 'transparent',
                            }}
                        >
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body2" fontWeight={n.read ? 400 : 600}>
                                    {n.message}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {n.time}
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))}
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default TopBar;