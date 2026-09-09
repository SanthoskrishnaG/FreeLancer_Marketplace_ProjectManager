import apiClient from './apiClient.js';

export const proposalApi = {
  submitProposal: (data) => apiClient.post('/proposals', data),
  getProjectProposals: (projectId) => apiClient.get(`/proposals/project/${projectId}`),
  getFreelancerProposals: (params) => apiClient.get('/proposals/my/proposals', { params }),
  getProposalById: (id) => apiClient.get(`/proposals/${id}`),
  acceptProposal: (id) => apiClient.post(`/proposals/${id}/accept`),
  rejectProposal: (id) => apiClient.post(`/proposals/${id}/reject`),
};
