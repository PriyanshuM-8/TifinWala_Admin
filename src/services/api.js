import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to attach Admin JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gharkaswad_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s and format errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isLoginRoute = window.location.pathname.startsWith('/login');

    if (status === 401 && !isLoginRoute) {
      localStorage.removeItem('gharkaswad_admin_token');
      localStorage.removeItem('gharkaswad_admin_user');
      window.location.href = '/login?session_expired=true';
    }

    return Promise.reject(error);
  }
);

/**
 * Extract user-friendly error message from Axios error
 */
export const extractErrorMessage = (error, defaultMsg = 'Something went wrong. Please try again.') => {
  if (!error) return defaultMsg;
  if (typeof error === 'string') return error;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.message) return error.message;
  return defaultMsg;
};

export default api;
