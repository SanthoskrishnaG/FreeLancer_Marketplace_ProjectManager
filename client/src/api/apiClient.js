import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach bearer token
apiClient.interceptors.request.use(
  (config) => {
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
    const resData = error.response?.data;
    const message =
      resData?.error?.message ||
      resData?.message ||
      (typeof resData === 'string' ? resData : null) ||
      error.message ||
      'Something went wrong';
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
