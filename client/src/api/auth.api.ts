import apiClient from './api-client.js';
import { AuthResponse, User, ApiResponse } from '../types/index.js';

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'CLIENT' | 'FREELANCER';
  companyName?: string;
  title?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const registerApi = async (data: RegisterPayload): Promise<AuthResponse> => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return response.data.data!;
};

export const loginApi = async (data: LoginPayload): Promise<AuthResponse> => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
  return response.data.data!;
};

export const logoutApi = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

export const getMeApi = async (): Promise<User> => {
  const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
  return response.data.data!.user;
};

export const forgotPasswordApi = async (email: string): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>('/auth/forgot-password', { email });
  return response.data;
};

export const resetPasswordApi = async (data: {
  token: string;
  password: string;
}): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>('/auth/reset-password', data);
  return response.data;
};
