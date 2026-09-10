import apiClient from './api-client.js';
import { HealthResponse } from '../types/index.js';

export const getHealth = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>('/health');
  return response.data;
};
