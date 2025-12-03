import axios from 'axios';
import useAuthStore from '../store/authStore';
import { getErrorType, getUserFriendlyMessage } from '../store/errorStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with timeout
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Check if user is offline
const isOffline = () => {
  return !navigator.onLine;
};

// Add token to requests and check offline status
api.interceptors.request.use(
  (config) => {
    // Check if offline before making request
    if (isOffline()) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/error') && !currentPath.includes('/auth')) {
        sessionStorage.setItem('lastError', JSON.stringify({
          type: 'offline',
          title: 'You\'re Offline',
          message: 'It looks like you\'ve lost your internet connection. Please check your network and try again.',
          canRetry: true,
        }));
        // Use setTimeout to avoid blocking the request rejection
        setTimeout(() => {
          window.location.href = '/error';
        }, 0);
      }
      return Promise.reject(new Error('Network Error: You are offline'));
    }

    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors and redirect to error page for critical failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if offline first
    if (isOffline()) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/error') && !currentPath.includes('/auth')) {
        sessionStorage.setItem('lastError', JSON.stringify({
          type: 'offline',
          title: 'You\'re Offline',
          message: 'It looks like you\'ve lost your internet connection. Please check your network and try again.',
          canRetry: true,
        }));
        window.location.href = '/error';
      }
      return Promise.reject(error);
    }

    const errorType = getErrorType(error);
    const userMessage = getUserFriendlyMessage(error, errorType);

    // Handle 401 - redirect to auth (don't show error page)
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/auth';
      return Promise.reject(error);
    }

    // For critical errors that need a fallback screen, redirect to error page
    // Only redirect if we're not already on the error page
    const isCriticalError = 
      errorType === 'offline' || 
      errorType === 'network' || 
      errorType === 'server' || 
      errorType === 'timeout' ||
      (error.response?.status >= 500);

    // Don't redirect if already on error page or auth page
    const currentPath = window.location.pathname;
    if (isCriticalError && !currentPath.includes('/error') && !currentPath.includes('/auth')) {
      // Store error details in sessionStorage for the error page
      sessionStorage.setItem('lastError', JSON.stringify({
        type: errorType,
        title: errorType === 'offline' ? 'Connection Lost' : 'Request Failed',
        message: userMessage,
        code: error.response?.status || error.code,
        canRetry: true,
      }));

      // Redirect to error page
      window.location.href = '/error';
      return Promise.reject(error);
    }

    // For other errors, just reject (let components handle them)
    return Promise.reject(error);
  }
);

export default api;

