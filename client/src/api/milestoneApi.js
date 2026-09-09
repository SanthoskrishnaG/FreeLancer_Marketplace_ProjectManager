import apiClient from './apiClient.js';

export const milestoneApi = {
  getContractMilestones: (contractId) => apiClient.get(`/milestones/contract/${contractId}`),
  submitMilestoneWork: (id, formData) =>
    apiClient.post(`/milestones/${id}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  approveMilestone: (id) => apiClient.post(`/milestones/${id}/approve`),
  requestRevision: (id, revisionNotes) =>
    apiClient.post(`/milestones/${id}/revision`, { revisionNotes }),
};
