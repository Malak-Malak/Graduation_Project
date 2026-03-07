import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    
    // Log error to service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback 
        error={this.state.error} 
        resetError={this.handleReset}
        theme={this.props.theme}
      />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, resetError, theme }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
        bgcolor: theme?.palette?.background?.default || '#F9F7F4',
      }}
    >
      <Box
        sx={{
          maxWidth: 500,
          textAlign: 'center',
        }}
      >
        <ErrorIcon 
          sx={{ 
            fontSize: 64, 
            color: theme?.palette?.error?.main || '#C47E7E',
            mb: 2,
          }} 
        />
        
        <Typography 
          variant="h4" 
          sx={{ 
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 600,
            mb: 2,
          }}
        >
          Oops! Something went wrong
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: theme?.palette?.text?.secondary || '#5C6B7E',
            mb: 3,
          }}
        >
          We're sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.
        </Typography>

        {error && process.env.NODE_ENV === 'development' && (
          <Box
            sx={{
              p: 2,
              bgcolor: theme?.palette?.background?.hover || '#F5F3F0',
              borderRadius: 2,
              mb: 3,
              textAlign: 'left',
              overflow: 'auto',
            }}
          >
            <Typography variant="body2" component="pre">
              {error.toString()}
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={resetError}
          sx={{ borderRadius: 2 }}
        >
          Refresh Page
        </Button>
      </Box>
    </Box>
  );
};

export default ErrorBoundary;