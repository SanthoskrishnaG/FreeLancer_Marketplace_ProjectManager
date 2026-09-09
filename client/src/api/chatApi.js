import apiClient from './apiClient.js';

export const chatApi = {
  getConversations: () => apiClient.get('/chat/conversations'),
  getMessages: (conversationId, params) =>
    apiClient.get(`/chat/conversations/${conversationId}/messages`, { params }),
  sendMessage: (data) => apiClient.post('/chat/messages', data),
  getOrCreateConversation: (recipientId) =>
    apiClient.get(`/chat/conversations/recipient/${recipientId}`),
};
