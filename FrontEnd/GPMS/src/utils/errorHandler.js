export class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', status = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.timestamp = new Date().toISOString();
  }
}

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return new AppError(data.message || 'Bad request', 'BAD_REQUEST', status);
      case 401:
        return new AppError('Unauthorized. Please login again.', 'UNAUTHORIZED', status);
      case 403:
        return new AppError('You do not have permission to perform this action.', 'FORBIDDEN', status);
      case 404:
        return new AppError('Resource not found.', 'NOT_FOUND', status);
      case 422:
        return new AppError(data.message || 'Validation failed', 'VALIDATION_ERROR', status);
      case 429:
        return new AppError('Too many requests. Please try again later.', 'RATE_LIMIT', status);
      case 500:
        return new AppError('Internal server error. Please try again later.', 'SERVER_ERROR', status);
      default:
        return new AppError(data.message || 'An error occurred', 'API_ERROR', status);
    }
  } else if (error.request) {
    // Request made but no response
    return new AppError('Network error. Please check your connection.', 'NETWORK_ERROR', 0);
  } else {
    // Request setup error
    return new AppError(error.message || 'An unexpected error occurred', 'CLIENT_ERROR', 0);
  }
};

export const logError = (error, context = {}) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    code: error.code,
    status: error.status,
    context,
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    url: window.location.href,
    userAgent: navigator.userAgent,
  };
  
  console.error('Error logged:', errorLog);
  
  // Here you would send to your logging service
  // sendToLoggingService(errorLog);
};

export const showUserFriendlyError = (error) => {
  const friendlyMessages = {
    UNAUTHORIZED: 'Please log in to continue.',
    FORBIDDEN: "You don't have permission to do that.",
    NOT_FOUND: "We couldn't find what you're looking for.",
    NETWORK_ERROR: 'Please check your internet connection.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
    RATE_LIMIT: "You've made too many requests. Please wait a moment.",
  };
  
  return friendlyMessages[error.code] || error.message || 'An unexpected error occurred.';
};