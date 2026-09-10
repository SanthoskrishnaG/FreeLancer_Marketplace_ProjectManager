import apiClient from './api-client.js';
import { Project, Pagination, ApiResponse, Milestone } from '../types/index.js';

export interface CreateProjectPayload {
  title: string;
  description: string;
  requirements?: string;
  categoryId?: string | null;
  skillIds: string[];
  budgetType: 'FIXED' | 'HOURLY';
  budget: number;
  minBudget?: number | null;
  maxBudget?: number | null;
  experienceLevel: 'ENTRY' | 'INTERMEDIATE' | 'EXPERT';
  deadline?: string | null;
  status?: 'DRAFT' | 'PUBLISHED';
  attachments?: Array<{ name: string; url: string; size?: number }>;
}

export interface AIGeneratedMilestone {
  title: string;
  description: string;
  deliverables: string[];
  estimatedDuration: string;
  budgetPercentage: number;
  amount: number;
  dependencies: string[];
  acceptanceCriteria: string[];
  order: number;
}

export interface AIMilestoneResponse {
  source: 'openai' | 'rule_based_fallback';
  summary: string;
  milestones: AIGeneratedMilestone[];
  metadata: {
    generatedAt: string;
    model: string;
    milestoneCount: number;
  };
}

export const getProjectsApi = async (params: {
  search?: string;
  category?: string;
  skill?: string;
  budgetType?: string;
  minBudget?: string | number;
  maxBudget?: string | number;
  experienceLevel?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}): Promise<{ projects: Project[]; pagination: Pagination }> => {
  const response = await apiClient.get<
    ApiResponse<{ projects: Project[]; pagination: Pagination }>
  >('/projects', { params });
  return response.data.data!;
};

export const getProjectByIdApi = async (id: string): Promise<Project> => {
  const response = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
  return response.data.data!;
};

export const getMyProjectsApi = async (status?: string): Promise<Project[]> => {
  const response = await apiClient.get<ApiResponse<Project[]>>('/projects/my-projects', {
    params: { status },
  });
  return response.data.data!;
};

export const createProjectApi = async (data: CreateProjectPayload): Promise<Project> => {
  const response = await apiClient.post<ApiResponse<Project>>('/projects', data);
  return response.data.data!;
};

export const updateProjectApi = async (
  id: string,
  data: Partial<CreateProjectPayload>
): Promise<Project> => {
  const response = await apiClient.put<ApiResponse<Project>>(`/projects/${id}`, data);
  return response.data.data!;
};

export const deleteDraftProjectApi = async (id: string): Promise<void> => {
  await apiClient.delete(`/projects/${id}`);
};

export const updateProjectStatusApi = async (
  id: string,
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'ARCHIVED'
): Promise<Project> => {
  const response = await apiClient.patch<ApiResponse<Project>>(`/projects/${id}/status`, {
    status,
  });
  return response.data.data!;
};

export const toggleProjectBookmarkApi = async (id: string): Promise<{ isBookmarked: boolean }> => {
  const response = await apiClient.post<ApiResponse<{ isBookmarked: boolean }>>(
    `/projects/${id}/bookmark`
  );
  return response.data.data!;
};

export const generateAIMilestonesApi = async (
  id: string,
  customPrompt?: string
): Promise<AIMilestoneResponse> => {
  const response = await apiClient.post<ApiResponse<AIMilestoneResponse>>(
    `/projects/${id}/generate-milestones`,
    { customPrompt }
  );
  return response.data.data!;
};

export const saveBatchMilestonesApi = async (
  id: string,
  milestones: Array<Omit<Milestone, 'id' | 'status'>>
): Promise<Project> => {
  const response = await apiClient.post<ApiResponse<Project>>(`/projects/${id}/milestones/batch`, {
    milestones,
  });
  return response.data.data!;
};
