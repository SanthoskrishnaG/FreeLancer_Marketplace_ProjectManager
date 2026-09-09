import apiClient from './apiClient.js';

export const authApi = {
  login: (data) => apiClient.post('/auth/login', data),
  register: (data) => apiClient.post('/auth/register', data),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  getFreelancers: (params) => apiClient.get('/auth/freelancers', { params }),
  getFreelancerById: (id) => apiClient.get(`/auth/freelancers/${id}`),
};
