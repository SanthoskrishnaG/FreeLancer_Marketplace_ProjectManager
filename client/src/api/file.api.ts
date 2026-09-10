import apiClient from './api-client.js';
import { FileItem, ApiResponse } from '../types/index.js';

export const uploadFileApi = async (
  file: File,
  options?: {
    entityType?: 'PORTFOLIO' | 'PROJECT' | 'MILESTONE' | 'CHAT' | 'DISPUTE' | 'AVATAR';
    entityId?: string;
    onProgress?: (percent: number) => void;
  }
): Promise<FileItem> => {
  const formData = new FormData();
  formData.append('file', file);
  if (options?.entityType) formData.append('entityType', options.entityType);
  if (options?.entityId) formData.append('entityId', options.entityId);

  const response = await apiClient.post<ApiResponse<FileItem>>('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && options?.onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        options.onProgress(percent);
      }
    },
  });

  return response.data.data!;
};

export const deleteFileApi = async (fileId: string): Promise<void> => {
  await apiClient.delete(`/files/${fileId}`);
};
