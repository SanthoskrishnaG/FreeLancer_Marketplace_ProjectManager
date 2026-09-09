import apiClient from './apiClient.js';

export const dashboardApi = {
  getClientDashboard: () => apiClient.get('/dashboards/client'),
  getFreelancerDashboard: () => apiClient.get('/dashboards/freelancer'),
};
