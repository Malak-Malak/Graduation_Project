import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Badge,
  InputBase,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  WbSunny as LightModeIcon,
  NightsStay as DarkModeIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useAuth } from '../../../contexts/AuthContext';
import { useThemeContext } from '../../../contexts/ThemeContext';
import { useNotification } from '../../../contexts/NotificationContext';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.background.hover, 0.5),
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.hover, 0.8),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
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
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const TopBar = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeContext();
  const { showNotification } = useNotification();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    showNotification('Logged out successfully', 'success');
    handleMenuClose();
  };

  const notifications = [
    { id: 1, message: 'New comment on your task', time: '5 min ago', read: false },
    { id: 2, message: 'Meeting scheduled for tomorrow', time: '1 hour ago', read: false },
    { id: 3, message: 'File approved by supervisor', time: '2 hours ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppBar 
      position="static" 
      color="transparent" 
      elevation={0}
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 600,
            display: { xs: 'none', sm: 'block' },
          }}
        >
          Welcome back, {user?.name?.split(' ')[0]}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={toggleTheme} sx={{ color: theme.palette.text.secondary }}>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <IconButton 
            onClick={handleNotificationMenuOpen}
            sx={{ color: theme.palette.text.secondary }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton
            edge="end"
            onClick={handleProfileMenuOpen}
            sx={{ color: theme.palette.text.secondary }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
              {user?.name?.charAt(0)}
            </Avatar>
          </IconButton>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              borderRadius: 2,
              minWidth: 200,
            }
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
            Settings
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
            Logout
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              borderRadius: 2,
              minWidth: 300,
              maxHeight: 400,
            }
          }}
        >
          {notifications.map((notification) => (
            <MenuItem 
              key={notification.id} 
              onClick={handleMenuClose}
              sx={{
                bgcolor: !notification.read ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2">{notification.message}</Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {notification.time}
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