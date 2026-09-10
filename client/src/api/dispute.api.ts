import apiClient from './api-client.js';
import { Dispute, DisputeStatus, DisputeMessage, AuditLog, Pagination, ApiResponse } from '../types/index.js';

export const createDisputeApi = async (data: {
  contractId: string;
  reason: string;
  description: string;
  evidence?: string[];
}): Promise<Dispute> => {
  const response = await apiClient.post<ApiResponse<Dispute>>('/disputes', data);
  return response.data.data!;
};

export const getDisputesApi = async (params?: {
  status?: DisputeStatus;
  page?: number;
  limit?: number;
}): Promise<{ disputes: Dispute[]; pagination: Pagination }> => {
  const response = await apiClient.get<
    ApiResponse<{ disputes: Dispute[]; pagination: Pagination }>
  >('/disputes', { params });
  return response.data.data!;
};

export const getDisputeByIdApi = async (id: string): Promise<Dispute> => {
  const response = await apiClient.get<ApiResponse<Dispute>>(`/disputes/${id}`);
  return response.data.data!;
};

export const addDisputeMessageApi = async (
  disputeId: string,
  data: {
    message: string;
    attachments?: string[];
  }
): Promise<DisputeMessage> => {
  const response = await apiClient.post<ApiResponse<DisputeMessage>>(
    `/disputes/${disputeId}/messages`,
    data
  );
  return response.data.data!;
};

export const updateDisputeStatusApi = async (
  disputeId: string,
  data: {
    status: DisputeStatus;
    notes?: string;
  }
): Promise<Dispute> => {
  const response = await apiClient.patch<ApiResponse<Dispute>>(
    `/disputes/${disputeId}/status`,
    data
  );
  return response.data.data!;
};

export const resolveDisputeApi = async (
  disputeId: string,
  data: {
    adminDecision: string;
    resolutionNotes: string;
  }
): Promise<Dispute> => {
  const response = await apiClient.post<ApiResponse<Dispute>>(
    `/disputes/${disputeId}/resolve`,
    data
  );
  return response.data.data!;
};

export const rejectDisputeApi = async (
  disputeId: string,
  data: {
    resolutionNotes: string;
  }
): Promise<Dispute> => {
  const response = await apiClient.post<ApiResponse<Dispute>>(
    `/disputes/${disputeId}/reject`,
    data
  );
  return response.data.data!;
};

export const getDisputeAuditLogsApi = async (disputeId: string): Promise<AuditLog[]> => {
  const response = await apiClient.get<ApiResponse<AuditLog[]>>(
    `/disputes/${disputeId}/audit-logs`
  );
  return response.data.data!;
};
