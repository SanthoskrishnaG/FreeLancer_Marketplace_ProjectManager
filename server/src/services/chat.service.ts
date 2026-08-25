import { ChatRepository } from '../repositories/chat.repository.js';
import { ApiError } from '../utils/api-error.js';

export class ChatService {
  public static async getOrCreateConversation(
    userId: string,
    recipientId: string,
    contractId?: string,
    projectId?: string
  ) {
    if (userId === recipientId) {
      throw ApiError.badRequest('Cannot start a conversation with yourself');
    }

    return ChatRepository.findOrCreateConversation(userId, recipientId, contractId, projectId);
  }

  public static async getUserConversations(userId: string) {
    const rawConversations = await ChatRepository.getUserConversations(userId);

    return rawConversations.map((conv) => {
      const partner = conv.participants.find((p) => p.userId !== userId)?.user;
      const myParticipant = conv.participants.find((p) => p.userId === userId);
      const lastMessage = conv.messages[0] || null;

      const isUnread =
        lastMessage &&
        lastMessage.senderId !== userId &&
        (!myParticipant?.lastReadAt ||
          new Date(myParticipant.lastReadAt) < new Date(lastMessage.createdAt));

      return {
        id: conv.id,
        contractId: conv.contractId,
        projectId: conv.projectId,
        updatedAt: conv.updatedAt,
        partner,
        lastMessage,
        isUnread: !!isUnread,
        contract: conv.contract,
      };
    });
  }

  public static async getConversationMessages(
    userId: string,
    conversationId: string,
    page?: string,
    limit?: string
  ) {
    const conv = await ChatRepository.getConversationById(conversationId);
    if (!conv) {
      throw ApiError.notFound('Conversation not found');
    }

    const isParticipant = conv.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw ApiError.forbidden('You are not a participant in this conversation');
    }

    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '30', 10);

    return ChatRepository.getConversationMessages(conversationId, pageNum, limitNum);
  }

  public static async sendMessage(params: {
    userId: string;
    conversationId: string;
    content: string;
    fileIds?: string[];
  }) {
    const { userId, conversationId, content, fileIds } = params;

    const conv = await ChatRepository.getConversationById(conversationId);
    if (!conv) {
      throw ApiError.notFound('Conversation not found');
    }

    const isParticipant = conv.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw ApiError.forbidden('You are not a participant in this conversation');
    }

    return ChatRepository.createMessage({
      conversationId,
      senderId: userId,
      content,
      fileIds,
    });
  }

  public static async markAsRead(userId: string, conversationId: string) {
    const conv = await ChatRepository.getConversationById(conversationId);
    if (!conv) {
      throw ApiError.notFound('Conversation not found');
    }

    await ChatRepository.markConversationAsRead(conversationId, userId);
    return { success: true };
  }
}
