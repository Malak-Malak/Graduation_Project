import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Folder as FolderIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { useThemeContext } from '../../../contexts/ThemeContext';

const Sidebar = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { mode } = useThemeContext();
  const [active, setActive] = React.useState('Dashboard');

  const getNavItems = () => {
    switch(user?.role) {
      case 'admin':
        return [
          { label: 'Dashboard', icon: <DashboardIcon /> },
          { label: 'User Management', icon: <PeopleIcon /> },
          { label: 'Project Oversight', icon: <FolderIcon /> },
          { label: 'Reports', icon: <AssessmentIcon /> },
          { label: 'Activity Logs', icon: <AssessmentIcon /> },
          { label: 'Settings', icon: <SettingsIcon /> },
        ];
      case 'supervisor':
        return [
          { label: 'Dashboard', icon: <DashboardIcon /> },
          { label: 'My Groups', icon: <GroupIcon /> },
          { label: 'Pending Requests', icon: <MessageIcon /> },
          { label: 'Files Review', icon: <FolderIcon /> },
          { label: 'Meeting Schedule', icon: <CalendarIcon /> },
          { label: 'AI Reports', icon: <AssessmentIcon /> },
          { label: 'Settings', icon: <SettingsIcon /> },
        ];
      default:
        return [
          { label: 'Dashboard', icon: <DashboardIcon /> },
          { label: 'Team Discovery Hub', icon: <PeopleIcon /> },
          { label: 'Kanban Board', icon: <DashboardIcon /> },
          { label: 'Files Repository', icon: <FolderIcon /> },
          { label: 'Meetings', icon: <CalendarIcon /> },
          { label: 'Analytics', icon: <AssessmentIcon /> },
          { label: 'Settings', icon: <SettingsIcon /> },
        ];
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 260,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 260,
          boxSizing: 'border-box',
          bgcolor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Box
            component="img"
            src={mode === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
            alt="PTUK Logo"
            sx={{ height: 40 }}
          />
          <Typography variant="h6" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 }}>
            PTUK
          </Typography>
        </Box>

        {/* User Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 48, height: 48 }}>
            {user?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {user?.role === 'admin' ? 'Administrator' : 
               user?.role === 'supervisor' ? 'Supervisor' : 'Student'}
            </Typography>
          </Box>
        </Box>

        {/* Team Context (for students) */}
        {user?.role === 'student' && (
          <Box sx={{ mb: 3, p: 2, bgcolor: theme.palette.background.hover, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              EcoTrackers (4/6)
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, my: 1 }}>
              {['A', 'H', 'M', 'S'].map((initial, i) => (
                <Avatar key={i} sx={{ width: 24, height: 24, bgcolor: theme.palette.primary.main }}>
                  {initial}
                </Avatar>
              ))}
              <Avatar sx={{ width: 24, height: 24, bgcolor: theme.palette.background.default }}>
                +2
              </Avatar>
            </Box>
            <Typography variant="caption" sx={{ color: theme.palette.warning.main }}>
              Pending: 2 invites
            </Typography>
          </Box>
        )}

        {/* Navigation */}
        <List>
          {getNavItems().map((item) => (
            <ListItem
              key={item.label}
              button
              selected={active === item.label}
              onClick={() => setActive(item.label)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: `${theme.palette.primary.main}20`,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                },
                '&:hover': {
                  bgcolor: theme.palette.background.hover,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: theme.palette.text.secondary }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: active === item.label ? 500 : 400,
                }}
              />
              {item.label === 'Pending Requests' && user?.role === 'supervisor' && (
                <Chip label="3" size="small" color="warning" sx={{ height: 20, minWidth: 20 }} />
              )}
            </ListItem>
          ))}
        </List>

        {/* Upcoming Section */}
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            UPCOMING
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CalendarIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
              <Typography variant="body2">Meeting: Today 2pm</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MessageIcon sx={{ fontSize: 16, color: theme.palette.warning.main }} />
              <Typography variant="body2">Feedback: 2 unread</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon sx={{ fontSize: 16, color: theme.palette.error.main }} />
              <Typography variant="body2">Deadline: Friday</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;