import apiClient from './api-client.js';
import { Milestone, MilestoneSubmission, MilestoneRevision, ApiResponse } from '../types/index.js';

export interface SubmitMilestonePayload {
  description: string;
  notes?: string;
  links?: string[];
  fileIds?: string[];
}

export interface RequestRevisionPayload {
  feedback: string;
  requestedChanges: string[];
  dueDate?: string;
}

export const startMilestoneApi = async (id: string): Promise<Milestone> => {
  const response = await apiClient.post<ApiResponse<Milestone>>(`/milestones/${id}/start`);
  return response.data.data!;
};

export const submitMilestoneApi = async (
  id: string,
  data: SubmitMilestonePayload
): Promise<MilestoneSubmission> => {
  const response = await apiClient.post<ApiResponse<MilestoneSubmission>>(
    `/milestones/${id}/submit`,
    data
  );
  return response.data.data!;
};

export const approveMilestoneApi = async (id: string): Promise<Milestone> => {
  const response = await apiClient.post<ApiResponse<Milestone>>(`/milestones/${id}/approve`);
  return response.data.data!;
};

export const requestMilestoneRevisionApi = async (
  id: string,
  data: RequestRevisionPayload
): Promise<MilestoneRevision> => {
  const response = await apiClient.post<ApiResponse<MilestoneRevision>>(
    `/milestones/${id}/request-revision`,
    data
  );
  return response.data.data!;
};

export const getMilestoneHistoryApi = async (id: string): Promise<Milestone> => {
  const response = await apiClient.get<ApiResponse<Milestone>>(`/milestones/${id}/history`);
  return response.data.data!;
};
