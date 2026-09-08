import apiClient from './api-client.js';
import { Invoice, InvoiceStatus, Pagination, FinancialMetrics, ApiResponse } from '../types/index.js';

export const generateInvoiceApi = async (data: {
  contractId: string;
  dueDate?: string;
  tax?: number;
  notes?: string;
}): Promise<Invoice> => {
  const response = await apiClient.post<ApiResponse<Invoice>>('/invoices', data);
  return response.data.data!;
};

export const getInvoicesApi = async (params?: {
  contractId?: string;
  status?: InvoiceStatus;
  page?: number;
  limit?: number;
}): Promise<{ invoices: Invoice[]; pagination: Pagination }> => {
  const response = await apiClient.get<
    ApiResponse<{ invoices: Invoice[]; pagination: Pagination }>
  >('/invoices', { params });
  return response.data.data!;
};

export const getInvoiceByIdApi = async (id: string): Promise<Invoice> => {
  const response = await apiClient.get<ApiResponse<Invoice>>(`/invoices/${id}`);
  return response.data.data!;
};

export const downloadInvoicePdfApi = async (id: string, invoiceNumber: string): Promise<void> => {
  const response = await apiClient.get(`/invoices/${id}/pdf`, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `Invoice-${invoiceNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

export const getFinancialMetricsApi = async (): Promise<FinancialMetrics> => {
  const response = await apiClient.get<ApiResponse<FinancialMetrics>>('/invoices/metrics');
  return response.data.data!;
};
