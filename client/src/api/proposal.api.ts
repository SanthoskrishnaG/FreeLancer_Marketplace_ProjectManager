import apiClient from './api-client.js';
import { Proposal, ProposalStatus, Pagination, ApiResponse } from '../types/index.js';

export interface CreateProposalPayload {
  projectId: string;
  coverLetter: string;
  bidAmount: number;
  estimatedDuration: string;
  milestonePricing?: Array<{
    title: string;
    amount: number;
    duration?: string;
  }>;
  attachments?: Array<{ name: string; url: string; size?: number }>;
}

export const createProposalApi = async (data: CreateProposalPayload): Promise<Proposal> => {
  const response = await apiClient.post<ApiResponse<Proposal>>('/proposals', data);
  return response.data.data!;
};

export const getMyProposalsApi = async (params?: {
  status?: ProposalStatus;
  page?: number;
  limit?: number;
}): Promise<{ proposals: Proposal[]; pagination: Pagination }> => {
  const response = await apiClient.get<
    ApiResponse<{ proposals: Proposal[]; pagination: Pagination }>
  >('/proposals/my-proposals', { params });
  return response.data.data!;
};

export const getProjectProposalsApi = async (
  projectId: string,
  params?: {
    status?: ProposalStatus;
    sortBy?: 'newest' | 'bid_low' | 'bid_high' | 'rating';
    page?: number;
    limit?: number;
  }
): Promise<{ proposals: Proposal[]; pagination: Pagination }> => {
  const response = await apiClient.get<
    ApiResponse<{ proposals: Proposal[]; pagination: Pagination }>
  >(`/proposals/projects/${projectId}`, { params });
  return response.data.data!;
};

export const getProposalByIdApi = async (id: string): Promise<Proposal> => {
  const response = await apiClient.get<ApiResponse<Proposal>>(`/proposals/${id}`);
  return response.data.data!;
};

export const withdrawProposalApi = async (id: string): Promise<Proposal> => {
  const response = await apiClient.patch<ApiResponse<Proposal>>(`/proposals/${id}/withdraw`);
  return response.data.data!;
};

export const shortlistProposalApi = async (id: string): Promise<Proposal> => {
  const response = await apiClient.patch<ApiResponse<Proposal>>(`/proposals/${id}/shortlist`);
  return response.data.data!;
};

export const rejectProposalApi = async (id: string): Promise<Proposal> => {
  const response = await apiClient.patch<ApiResponse<Proposal>>(`/proposals/${id}/reject`);
  return response.data.data!;
};

export const acceptProposalApi = async (
  id: string
): Promise<{ proposal: Proposal; contract: any }> => {
  const response = await apiClient.patch<ApiResponse<{ proposal: Proposal; contract: any }>>(
    `/proposals/${id}/accept`
  );
  return response.data.data!;
};
