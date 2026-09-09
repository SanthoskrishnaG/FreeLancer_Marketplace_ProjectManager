import apiClient from './apiClient.js';

export const paymentApi = {
  createOrder: (data) => apiClient.post('/payments/order', data),
  verifyPayment: (data) => apiClient.post('/payments/verify', data),
  releaseEscrow: (escrowId) => apiClient.post(`/payments/escrow/${escrowId}/release`),
  getUserPayments: () => apiClient.get('/payments'),
};
