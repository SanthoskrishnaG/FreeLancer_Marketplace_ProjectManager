import { prisma } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

export class ChatService {
  static async getOrCreateConversation(userId, optionsOrRecipientId) {
    let participantId;
    let projectId = null;
    let contractId = null;

    if (typeof optionsOrRecipientId === 'string') {
      participantId = optionsOrRecipientId;
    } else if (optionsOrRecipientId && typeof optionsOrRecipientId === 'object') {
      participantId = optionsOrRecipientId.participantId || optionsOrRecipientId.recipientId;
      projectId = optionsOrRecipientId.projectId || null;
      contractId = optionsOrRecipientId.contractId || null;
    }

    if (!participantId) {
      throw ApiError.badRequest('Recipient participant ID is required');
    }

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

  static async getMessages(conversationId, userId, query = {}) {
    const isParticipant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId },
    });
    if (!isParticipant) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (user?.role !== 'ADMIN') {
        throw ApiError.forbidden('You are not a member of this conversation');
      }
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true },
        },
        files: true,
      },
    });

    prisma.message
      .updateMany({
        where: { conversationId, senderId: { not: userId }, isRead: false },
        data: { isRead: true },
      })
      .catch(() => {});

    return messages;
  }

  static async sendMessage(userId, { conversationId, content, fileUrl }) {
    let convId = conversationId;
    if (!convId && arguments[1]?.recipientId) {
      const conv = await this.getOrCreateConversation(userId, arguments[1].recipientId);
      convId = conv.id;
    }

    const isParticipant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: convId,
          userId,
        },
      },
    });

    if (!isParticipant) {
      throw ApiError.forbidden('You are not a member of this conversation');
    }

    const message = await prisma.message.create({
      data: {
        conversationId: convId,
        senderId: userId,
        content: content || (fileUrl ? 'Attached file' : ''),
        files: fileUrl
          ? {
              create: {
                originalName: 'Attachment',
                storageKey: `chat_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                url: fileUrl,
                mimeType: 'application/octet-stream',
                size: 0,
                uploaderId: userId,
                entityType: 'CHAT',
              },
            }
          : undefined,
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true },
        },
        files: true,
      },
    });

    await prisma.conversation.update({
      where: { id: convId },
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
