import apiClient from './apiClient.js';

export const projectApi = {
  getProjects: (params) => apiClient.get('/projects', { params }),
  getProjectById: (id) => apiClient.get(`/projects/${id}`),
  createProject: (data) => apiClient.post('/projects', data),
  updateProject: (id, data) => apiClient.put(`/projects/${id}`, data),
  deleteProject: (id) => apiClient.delete(`/projects/${id}`),
  getClientProjects: (params) => apiClient.get('/projects/my/projects', { params }),
  getCategories: () => apiClient.get('/projects/categories'),
  getSkills: () => apiClient.get('/projects/skills'),
  analyzeAiRequirements: (data) => apiClient.post('/projects/ai/analyze-requirements', data),
  generateAiMilestones: (data) => apiClient.post('/projects/ai/generate-milestones', data),
  getProjectFolders: (projectId) => apiClient.get(`/projects/${projectId}/folders`),
  createProjectFolder: (projectId, data) => apiClient.post(`/projects/${projectId}/folders`, data),
  deleteProjectFolder: (projectId, folderId) => apiClient.delete(`/projects/${projectId}/folders/${folderId}`),
  addProjectFile: (projectId, folderId, data) => apiClient.post(`/projects/${projectId}/folders/${folderId}/files`, data),
  deleteProjectFile: (projectId, folderId, fileId) => apiClient.delete(`/projects/${projectId}/folders/${folderId}/files/${fileId}`),
  createProjectIdea: (data) => apiClient.post('/projects/ideas', data),
  getFreelancerProjects: (params) => apiClient.get('/projects/my/ideas', { params }),
};
