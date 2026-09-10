import apiClient from './api-client.js';
import {
  User,
  FreelancerProfile,
  Category,
  Skill,
  Pagination,
  ApiResponse,
} from '../types/index.js';

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  location?: string | null;
  companyName?: string | null;
  companyWebsite?: string | null;
  description?: string | null;
  industry?: string | null;
  logoUrl?: string | null;
  title?: string | null;
  bio?: string | null;
  hourlyRate?: number | null;
  experienceYears?: number | null;
  experienceLevel?: 'ENTRY' | 'INTERMEDIATE' | 'EXPERT';
  isAvailable?: boolean;
  languages?: string[];
  portfolio?: Array<{
    title: string;
    description?: string;
    url?: string;
    imageUrl?: string;
  }>;
}

export const getMyProfileApi = async (): Promise<User> => {
  const response = await apiClient.get<ApiResponse<User>>('/users/me');
  return response.data.data!;
};

export const updateMyProfileApi = async (data: UpdateProfilePayload): Promise<User> => {
  const response = await apiClient.put<ApiResponse<User>>('/users/me', data);
  return response.data.data!;
};

export const getFreelancersApi = async (params: {
  search?: string;
  skill?: string;
  experienceLevel?: string;
  minRate?: string | number;
  maxRate?: string | number;
  availableOnly?: boolean;
  page?: number;
  limit?: number;
}): Promise<{ freelancers: FreelancerProfile[]; pagination: Pagination }> => {
  const response = await apiClient.get<
    ApiResponse<{ freelancers: FreelancerProfile[]; pagination: Pagination }>
  >('/freelancers', { params });
  return response.data.data!;
};

export const getFreelancerByIdApi = async (id: string): Promise<FreelancerProfile> => {
  const response = await apiClient.get<ApiResponse<FreelancerProfile>>(`/freelancers/${id}`);
  return response.data.data!;
};

export const addFreelancerSkillApi = async (data: {
  skillId: string;
  proficiency?: 'Beginner' | 'Intermediate' | 'Expert';
}) => {
  const response = await apiClient.post<ApiResponse<unknown>>('/freelancers/skills', data);
  return response.data.data;
};

export const removeFreelancerSkillApi = async (skillId: string) => {
  const response = await apiClient.delete<ApiResponse<unknown>>(`/freelancers/skills/${skillId}`);
  return response.data.data;
};

export const getMetaSkillsAndCategoriesApi = async (): Promise<{
  skills: Skill[];
  categories: Category[];
}> => {
  const response =
    await apiClient.get<ApiResponse<{ skills: Skill[]; categories: Category[] }>>(
      '/meta/skills-categories'
    );
  return response.data.data!;
};
