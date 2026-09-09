import apiClient from './apiClient.js';

export const invoiceApi = {
  getUserInvoices: (params) => apiClient.get('/invoices', { params }),
  getInvoiceById: (id) => apiClient.get(`/invoices/${id}`),
  createInvoice: (data) => apiClient.post('/invoices', data),
  downloadPdf: (id) => `/api/invoices/${id}/pdf`,
};
