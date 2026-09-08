import apiClient from './api-client.js';
import { Review, ApiResponse } from '../types/index.js';

export const submitReviewApi = async (data: {
  contractId: string;
  rating: number;
  comment: string;
}): Promise<Review> => {
  const response = await apiClient.post<ApiResponse<Review>>('/reviews', data);
  return response.data.data!;
};

export const getContractReviewsApi = async (contractId: string): Promise<Review[]> => {
  const response = await apiClient.get<ApiResponse<Review[]>>(`/reviews/contract/${contractId}`);
  return response.data.data!;
};

export const getFreelancerReviewsApi = async (freelancerProfileId: string): Promise<Review[]> => {
  const response = await apiClient.get<ApiResponse<Review[]>>(
    `/reviews/freelancer/${freelancerProfileId}`
  );
  return response.data.data!;
};
