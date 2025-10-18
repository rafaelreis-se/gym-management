import axios from 'axios';

// API Base URL - configure according to environment
export const API_BASE_URL =
  (typeof window !== 'undefined' && (window as any).ENV?.VITE_API_URL) ||
  'http://localhost:3000/api';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gym_auth_token');
    if (token && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear auth data and redirect to login
      localStorage.removeItem('gym_auth_token');
      localStorage.removeItem('gym_auth_user');
      localStorage.removeItem('gym_refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
