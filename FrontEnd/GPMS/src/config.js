const config = {
  // API Configuration
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  wsUrl: process.env.REACT_APP_WS_URL || 'ws://localhost:3000',
  
  // App Configuration
  appName: 'GPMS - Graduation Project Management System',
  appVersion: '1.0.0',
  
  // Features
  enableNotifications: true,
  enableRealTimeUpdates: true,
  enableAIReports: true,
  
  // Pagination
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 25, 50, 100],
  
  // File Upload
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedFileTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/png',
    'image/jpeg',
    'application/zip',
  ],
  
  // Date Format
  dateFormat: 'MMM dd, yyyy',
  timeFormat: 'HH:mm',
  dateTimeFormat: 'MMM dd, yyyy HH:mm',
  
  // Theme
  defaultTheme: 'light',
  themes: ['light', 'dark'],
  
  // Authentication
  tokenKey: 'token',
  userKey: 'user',
  sessionTimeout: 60 * 60 * 1000, // 1 hour
  
  // Analytics
  enableAnalytics: true,
  analyticsRefreshInterval: 5 * 60 * 1000, // 5 minutes
  
  // Cache
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  
  // Export
  exportFormats: ['csv', 'excel', 'pdf', 'json'],
  
  // Roles
  roles: {
    admin: 'Admin',
    supervisor: 'Supervisor',
    student: 'Student',
  },
  
  // Statuses
  projectStatuses: ['On Track', 'At Risk', 'Behind', 'Completed'],
  taskStatuses: ['To Do', 'In Progress', 'Done'],
  fileStatuses: ['Approved', 'Pending Review', 'Rejected', 'Feedback Required'],
  meetingStatuses: ['Confirmed', 'Pending Confirmation', 'Cancelled', 'Completed'],
  
  // Defaults
  defaultDepartment: 'CS',
  defaultTeamSize: { min: 2, max: 6 },
  
  // UI
  sidebarWidth: 260,
  topBarHeight: 64,
  animationDuration: 300,
  
  // Development
  isDevelopment: process.env.NODE_ENV === 'development',
  enableDebugLogs: process.env.NODE_ENV === 'development',
  mockApiDelay: process.env.NODE_ENV === 'development' ? 500 : 0,
};

export default config;