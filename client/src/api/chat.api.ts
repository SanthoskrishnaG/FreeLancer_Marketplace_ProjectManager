import apiClient from './api-client.js';
import { Conversation, Message, Pagination, ApiResponse } from '../types/index.js';

export const getConversationsApi = async (): Promise<Conversation[]> => {
  const response = await apiClient.get<ApiResponse<Conversation[]>>('/chat/conversations');
  return response.data.data!;
};

export const startConversationApi = async (data: {
  recipientId: string;
  contractId?: string;
  projectId?: string;
}): Promise<Conversation> => {
  const response = await apiClient.post<ApiResponse<Conversation>>('/chat/conversations', data);
  return response.data.data!;
};

export const getConversationMessagesApi = async (
  conversationId: string,
  params?: { page?: number; limit?: number }
): Promise<{ messages: Message[]; pagination: Pagination }> => {
  const response = await apiClient.get<
    ApiResponse<{ messages: Message[]; pagination: Pagination }>
  >(`/chat/conversations/${conversationId}/messages`, { params });
  return response.data.data!;
};

export const sendMessageApi = async (
  conversationId: string,
  data: { content: string; fileIds?: string[] }
): Promise<Message> => {
  const response = await apiClient.post<ApiResponse<Message>>(
    `/chat/conversations/${conversationId}/messages`,
    data
  );
  return response.data.data!;
};

export const markConversationReadApi = async (conversationId: string): Promise<void> => {
  await apiClient.post(`/chat/conversations/${conversationId}/read`);
};
