import apiClient from './api-client.js';
import { Payment, Pagination, ApiResponse } from '../types/index.js';

export interface ProcessPaymentResponse {
  payment: Payment;
  invoiceNumber: string;
  status: string;
  message: string;
}

export const processPaymentApi = async (data: {
  invoiceId: string;
  provider?: string;
  paymentMethod?: string;
  currency?: string;
}): Promise<ProcessPaymentResponse> => {
  const response = await apiClient.post<ApiResponse<ProcessPaymentResponse>>(
    '/payments/checkout',
    data
  );
  return response.data.data!;
};

export const getPaymentHistoryApi = async (params?: {
  invoiceId?: string;
  contractId?: string;
  page?: number;
  limit?: number;
}): Promise<{ payments: Payment[]; pagination: Pagination }> => {
  const response = await apiClient.get<
    ApiResponse<{ payments: Payment[]; pagination: Pagination }>
  >('/payments/history', { params });
  return response.data.data!;
};

export const getPaymentByIdApi = async (id: string): Promise<Payment> => {
  const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
  return response.data.data!;
};
