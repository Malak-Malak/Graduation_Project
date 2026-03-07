import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

const LoadingSpinner = ({ message = 'Loading...', fullPage = false }) => {
  const theme = useTheme();

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 4,
      }}
    >
      <CircularProgress 
        size={48} 
        sx={{ 
          color: theme.palette.primary.main,
        }} 
      />
      <Typography 
        variant="body1" 
        sx={{ 
          color: theme.palette.text.secondary,
          fontFamily: '"Inter", sans-serif',
        }}
      >
        {message}
      </Typography>
    </Box>
  );

  if (fullPage) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: theme.palette.background.default,
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};

export default LoadingSpinner;