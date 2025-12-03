import { create } from 'zustand';

/**
 * Error store for managing global error state
 * Provides user-friendly error messages and error type detection
 */
const useErrorStore = create((set) => ({
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

/**
 * Helper function to determine error type from axios error
 */
export const getErrorType = (error) => {
  if (!error) return 'general';

  // Network errors (offline, CORS, etc.)
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'timeout';
    }
    if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
      return 'network';
    }
    return 'offline';
  }

  // HTTP status code errors
  const status = error.response?.status;
  switch (status) {
    case 401:
      return 'unauthorized';
    case 403:
      return 'forbidden';
    case 404:
      return 'notfound';
    case 408:
    case 504:
      return 'timeout';
    case 500:
    case 502:
    case 503:
      return 'server';
    default:
      return 'general';
  }
};

/**
 * Helper function to get user-friendly error message
 */
export const getUserFriendlyMessage = (error, type) => {
  if (error.response?.data?.message) {
    // Try to use backend error message if available
    const backendMsg = error.response.data.message;
    // Remove technical details
    return backendMsg
      .replace(/\[.*?\]/g, '') // Remove brackets
      .replace(/Error:?\s*/gi, '') // Remove "Error:" prefix
      .trim();
  }

  if (error.message) {
    // Clean up Firebase/technical error messages
    return error.message
      .replace(/Firebase:\s*/gi, '')
      .replace(/\(auth\/.*?\)\.?/g, '')
      .replace(/\[.*?\]/g, '')
      .trim();
  }

  // Default messages based on type
  const defaultMessages = {
    offline: 'You are currently offline. Please check your internet connection.',
    network: 'Network error. Please check your connection and try again.',
    timeout: 'The request took too long. Please try again.',
    server: 'Server error. Please try again in a few moments.',
    unauthorized: 'Your session has expired. Please sign in again.',
    forbidden: 'You don\'t have permission to perform this action.',
    notfound: 'The requested resource was not found.',
    general: 'An unexpected error occurred. Please try again.',
  };

  return defaultMessages[type] || defaultMessages.general;
};

export default useErrorStore;

