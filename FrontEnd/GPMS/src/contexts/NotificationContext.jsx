import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert, Snackbar, Box, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);

  const showNotification = useCallback((message, type = 'info', duration = 5000) => {
    const notification = {
      id: Date.now(),
      message,
      type,
      duration,
    };
    
    setNotifications(prev => [...prev, notification]);
    setCurrentNotification(notification);

    // Auto remove after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      setCurrentNotification(null);
    }, duration);
  }, []);

  const handleClose = useCallback(() => {
    setCurrentNotification(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, notifications }}>
      {children}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={!!currentNotification}
        autoHideDuration={currentNotification?.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={currentNotification?.type || 'info'}
          sx={{
            width: '100%',
            borderRadius: 2,
            '& .MuiAlert-icon': {
              alignItems: 'center',
            },
          }}
          action={
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{ color: 'inherit' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          <Typography variant="body2">
            {currentNotification?.message}
          </Typography>
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};