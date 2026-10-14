import axios from 'axios';

// Resolve API base URL: defaults to '/api' for local Vite proxy, or uses environment configuration
const resolveBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || '/api';
  // Strip trailing slashes to guarantee clean endpoint concatenation
  url = url.trim().replace(/\/+$/, '');
  return url;
};

const apiClient = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach bearer token & prevent duplicate '/api/api' pathing
apiClient.interceptors.request.use(
  (config) => {
    // If an endpoint was accidentally passed with leading '/api', strip it to prevent duplicate '/api/api/...'
    if (config.url && config.url.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api/, '');
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle session expiry and extract payload
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error('Unable to connect to the server. Please check your connection or backend status.'));
    }

    const resData = error.response?.data;
    const message =
      resData?.error?.message ||
      resData?.message ||
      (typeof resData === 'string' ? resData : null) ||
      'Something went wrong. Please try again.';

    if (error.response?.status === 401) {
      // Clear token if unauthenticated
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
