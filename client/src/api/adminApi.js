import apiClient from './apiClient.js';

export const adminApi = {
  getOverview: () => apiClient.get('/admin/overview'),
  getAnalytics: () => apiClient.get('/admin/analytics'),
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  updateUserStatus: (id, data) => apiClient.patch(`/admin/users/${id}/status`, data),
  getFreelancers: (params) => apiClient.get('/admin/freelancers', { params }),
  verifyFreelancer: (id, isVerified) => apiClient.patch(`/admin/freelancers/${id}/verify`, { isVerified }),
  getProjects: (params) => apiClient.get('/admin/projects', { params }),
  updateProjectStatus: (id, status) => apiClient.patch(`/admin/projects/${id}/status`, { status }),
  getContracts: (params) => apiClient.get('/admin/contracts', { params }),
  getDisputes: (params) => apiClient.get('/admin/disputes', { params }),
  resolveDispute: (id, data) => apiClient.post(`/admin/disputes/${id}/resolve`, data),
  getCategories: () => apiClient.get('/admin/categories'),
  createCategory: (data) => apiClient.post('/admin/categories', data),
  updateCategory: (id, data) => apiClient.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => apiClient.delete(`/admin/categories/${id}`),
  getSkills: () => apiClient.get('/admin/skills'),
  createSkill: (data) => apiClient.post('/admin/skills', data),
  deleteSkill: (id) => apiClient.delete(`/admin/skills/${id}`),
  getAuditLogs: (params) => apiClient.get('/admin/audit-logs', { params }),
};
