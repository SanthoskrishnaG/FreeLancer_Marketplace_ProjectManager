import apiClient from './apiClient.js';

export const contractApi = {
  getUserContracts: (params) => apiClient.get('/contracts', { params }),
  getContractById: (id) => apiClient.get(`/contracts/${id}`),
  completeContract: (id) => apiClient.post(`/contracts/${id}/complete`),
  cancelContract: (id, reason) => apiClient.post(`/contracts/${id}/cancel`, { reason }),
};
