export const ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  STUDENT: 'student',
};

export const PROJECT_STATUS = {
  ON_TRACK: 'On Track',
  AT_RISK: 'At Risk',
  BEHIND: 'Behind',
  COMPLETED: 'Completed',
};

export const TASK_STATUS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

export const FILE_STATUS = {
  APPROVED: 'Approved',
  PENDING: 'Pending Review',
  REJECTED: 'Rejected',
  FEEDBACK: 'Feedback Required',
};

export const MEETING_STATUS = {
  CONFIRMED: 'Confirmed',
  PENDING: 'Pending Confirmation',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
};

export const NOTIFICATION_TYPES = {
  TASK: 'task',
  FILE: 'file',
  MEETING: 'meeting',
  COMMENT: 'comment',
  SYSTEM: 'system',
};

export const DEPARTMENTS = [
  { id: 'CS', name: 'Computer Science' },
  { id: 'CE', name: 'Computer Engineering' },
  { id: 'EE', name: 'Electrical Engineering' },
  { id: 'ME', name: 'Mechanical Engineering' },
  { id: 'Civil', name: 'Civil Engineering' },
  { id: 'IT', name: 'Information Technology' },
];

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USERS: '/users',
  PROJECTS: '/projects',
  TASKS: '/tasks',
  FILES: '/files',
  MEETINGS: '/meetings',
  NOTIFICATIONS: '/notifications',
  ANALYTICS: '/analytics',
  LOGS: '/logs',
  SETTINGS: '/settings',
};

export const FILE_TYPES = {
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  PPT: 'application/vnd.ms-powerpoint',
  PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  PNG: 'image/png',
  JPG: 'image/jpeg',
  ZIP: 'application/zip',
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZES: [5, 10, 25, 50, 100],
};

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
};