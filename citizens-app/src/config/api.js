// API Configuration
import { ENV } from './constants';

export const API_BASE_URL = 'https://setshaba-connect-backend.onrender.com';
console.log('API_BASE_URL:', API_BASE_URL);

export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  
  // Users
  USER_PROFILE: '/api/users/me',
  USER_BY_ID: '/api/users',
  
  // Reports
  REPORTS: '/api/reports',
  MY_REPORTS: '/api/reports/mine',
  MUNICIPALITY_REPORTS: '/api/reports/municipality',
  REPORT_UPVOTE: '/api/reports/{id}/upvote',
  
  // Municipalities
  MUNICIPALITIES: '/api/municipalities',
  MUNICIPALITY_BY_ID: '/api/municipalities/{id}',
  MUNICIPALITY_REPORTS: '/api/municipalities/{id}/reports',
  
  // Status Updates
  STATUS_UPDATES: '/api/reports/{reportId}/status',
};

export const REPORT_CATEGORIES = [
  { value: 'water', label: 'Water & Sanitation', icon: 'water' },
  { value: 'electricity', label: 'Electricity', icon: 'flash' },
  { value: 'roads', label: 'Roads & Transport', icon: 'car' },
  { value: 'waste', label: 'Waste Management', icon: 'trash' },
  { value: 'safety', label: 'Safety & Security', icon: 'shield' },
  { value: 'other', label: 'Other', icon: 'help-circle' },
];

export const REPORT_STATUSES = [
  { value: 'pending', label: 'Pending', color: '#FFA500' },
  { value: 'acknowledged', label: 'Acknowledged', color: '#2196F3' },
  { value: 'in_progress', label: 'In Progress', color: '#FF9800' },
  { value: 'resolved', label: 'Resolved', color: '#4CAF50' },
];