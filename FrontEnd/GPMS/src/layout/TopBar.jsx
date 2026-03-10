import React, { useState } from 'react';
import {
    AppBar, Toolbar, Box, Typography, IconButton, Badge,
    InputBase, Menu, MenuItem, Avatar, useTheme,
} from '@mui/material';
import {
    Search as SearchIcon,
    Notifications as NotificationsIcon,
    WbSunny as LightModeIcon,
    NightsStay as DarkModeIcon,
    Logout as LogoutIcon,
} from '@mui/icons-material';
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

const PRIMARY = "#d0895b";

const TopBar = () => {
    const theme = useTheme();
    const { user, logout } = useAuth();
    const { mode, toggleMode } = useThemeContext();   // ✅ toggleMode

    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchor, setNotificationAnchor] = useState(null);

    const handleProfileMenuOpen = (e) => setAnchorEl(e.currentTarget);
    const handleNotificationMenuOpen = (e) => setNotificationAnchor(e.currentTarget);
    const handleMenuClose = () => { setAnchorEl(null); setNotificationAnchor(null); };
    const handleLogout = () => { logout(); handleMenuClose(); };

    const notifications = [
        { id: 1, message: 'New comment on your task', time: '5 min ago', read: false },
        { id: 2, message: 'Meeting scheduled for tomorrow', time: '1 hour ago', read: false },
        { id: 3, message: 'File approved by supervisor', time: '2 hours ago', read: true },
    ];
    const unreadCount = notifications.filter((n) => !n.read).length;

    // ✅ اسم المستخدم — يشتغل مع أي شكل للداتا
    const displayName = user?.name ?? user?.fullName ?? user?.username ?? "User";
    const avatarLetter = displayName.charAt(0).toUpperCase();

    return (
        <AppBar position="static" color="transparent" elevation={0}
            sx={{ borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper }}>
            <Toolbar>
                <Typography variant="h6" noWrap
                    sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' }, color: theme.palette.text.primary }}>
                    Welcome back, {displayName.split(' ')[0]}
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                <Search>
                    <SearchIconWrapper>
                        <SearchIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                    </SearchIconWrapper>
                    <StyledInputBase placeholder="Search…" inputProps={{ 'aria-label': 'search' }} />
                </Search>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {/* ✅ toggleMode */}
                    <IconButton onClick={toggleMode} sx={{ color: theme.palette.text.secondary }}>
                        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                    </IconButton>

                    <IconButton onClick={handleNotificationMenuOpen} sx={{ color: theme.palette.text.secondary }}>
                        <Badge badgeContent={unreadCount} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>

                    {/* ✅ Avatar بالحرف الأول */}
                    <IconButton edge="end" onClick={handleProfileMenuOpen}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: PRIMARY, fontSize: "0.9rem", fontWeight: 700 }}>
                            {avatarLetter}
                        </Avatar>
                    </IconButton>
                </Box>

                {/* Profile Menu */}
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
                    PaperProps={{ sx: { mt: 1.5, borderRadius: 2, minWidth: 180 } }}>
                    <MenuItem onClick={handleLogout}>
                        <LogoutIcon sx={{ mr: 1, fontSize: 18 }} />
                        Logout
                    </MenuItem>
                </Menu>

                {/* Notifications Menu */}
                <Menu anchorEl={notificationAnchor} open={Boolean(notificationAnchor)} onClose={handleMenuClose}
                    PaperProps={{ sx: { mt: 1.5, borderRadius: 2, minWidth: 300, maxHeight: 400 } }}>
                    {notifications.map((n) => (
                        <MenuItem key={n.id} onClick={handleMenuClose}
                            sx={{ bgcolor: !n.read ? alpha(PRIMARY, 0.08) : 'transparent' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body2" fontWeight={n.read ? 400 : 600}>{n.message}</Typography>
                                <Typography variant="caption" color="text.secondary">{n.time}</Typography>
                            </Box>
                        </MenuItem>
                    ))}
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default TopBar;