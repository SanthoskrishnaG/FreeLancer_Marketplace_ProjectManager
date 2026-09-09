import { prisma } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

export class ChatService {
  static async getOrCreateConversation(userId, { participantId, projectId, contractId }) {
    // Find existing conversation between these two participants
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: participantId } } },
        ],
      },
      include: {
        participants: { include: { user: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { sender: true },
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          projectId: projectId || null,
          contractId: contractId || null,
          participants: {
            create: [{ userId }, { userId: participantId }],
          },
        },
        include: {
          participants: { include: { user: true } },
          messages: { include: { sender: true } },
        },
      });
    }

    return conversation;
  }

  static async getUserConversations(userId) {
    return prisma.conversation.findMany({
      where: {
        participants: { some: { userId } },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        project: { select: { id: true, title: true } },
        contract: { select: { id: true, status: true } },
        participants: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  static async sendMessage(userId, { conversationId, content }) {
    const isParticipant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!isParticipant) {
      throw ApiError.forbidden('You are not a member of this conversation');
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content,
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true },
        },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  static async markAsRead(userId, conversationId) {
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: { lastReadAt: new Date() },
    });

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return { success: true };
  }
}
