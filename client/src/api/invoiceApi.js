import apiClient from './apiClient.js';

const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  const clean = envUrl.trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

export const invoiceApi = {
  getUserInvoices: (params) => apiClient.get('/invoices', { params }),
  getInvoiceById: (id) => apiClient.get(`/invoices/${id}`),
  createInvoice: (data) => apiClient.post('/invoices', data),
  downloadPdf: (id) => `${getApiBase()}/invoices/${id}/pdf`,
};

export default invoiceApi;
