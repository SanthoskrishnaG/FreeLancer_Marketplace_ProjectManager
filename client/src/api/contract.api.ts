import apiClient from './api-client.js';
import { Contract, ContractStatus, Pagination, ApiResponse } from '../types/index.js';

export const getMyContractsApi = async (params?: {
  status?: ContractStatus;
  page?: number;
  limit?: number;
}): Promise<{ contracts: Contract[]; pagination: Pagination }> => {
  const response = await apiClient.get<
    ApiResponse<{ contracts: Contract[]; pagination: Pagination }>
  >('/contracts/my-contracts', { params });
  return response.data.data!;
};

export const getContractByIdApi = async (id: string): Promise<Contract> => {
  const response = await apiClient.get<ApiResponse<Contract>>(`/contracts/${id}`);
  return response.data.data!;
};

export const updateContractStatusApi = async (
  id: string,
  status: ContractStatus
): Promise<Contract> => {
  const response = await apiClient.patch<ApiResponse<Contract>>(`/contracts/${id}/status`, {
    status,
  });
  return response.data.data!;
};
