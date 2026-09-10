import { prisma } from '../config/database.js';

export class ChatRepository {
  public static async findOrCreateConversation(
    userAId: string,
    userBId: string,
    contractId?: string,
    projectId?: string
  ) {
    // Check if conversation already exists between these users
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: userAId } } },
          { participants: { some: { userId: userBId } } },
          ...(contractId ? [{ contractId }] : []),
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (existing) {
      return existing;
    }

    return prisma.conversation.create({
      data: {
        contractId: contractId || null,
        projectId: projectId || null,
        participants: {
          create: [{ userId: userAId }, { userId: userBId }],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  public static async getUserConversations(userId: string) {
    return prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            files: true,
          },
        },
        contract: {
          select: {
            id: true,
            status: true,
            project: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });
  }

  public static async getConversationById(conversationId: string) {
    return prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  public static async getConversationMessages(conversationId: string, page = 1, limit = 30) {
    const skip = (page - 1) * limit;

    const [total, messages] = await Promise.all([
      prisma.message.count({ where: { conversationId } }),
      prisma.message.findMany({
        where: { conversationId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          files: true,
        },
      }),
    ]);

    return {
      messages: messages.reverse(), // chronologically ordered for chat window
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public static async createMessage(params: {
    conversationId: string;
    senderId: string;
    content: string;
    fileIds?: string[];
  }) {
    const { conversationId, senderId, content, fileIds } = params;

    return prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId,
          senderId,
          content,
        },
      });

      if (fileIds && fileIds.length > 0) {
        await tx.file.updateMany({
          where: { id: { in: fileIds } },
          data: {
            messageId: message.id,
            entityType: 'CHAT',
            entityId: conversationId,
          },
        });
      }

      // Update conversation updatedAt timestamp
      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return tx.message.findUnique({
        where: { id: message.id },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          files: true,
        },
      });
    });
  }

  public static async markConversationAsRead(conversationId: string, userId: string) {
    // 1. Mark participant's lastReadAt
    await prisma.conversationParticipant.updateMany({
      where: { conversationId, userId },
      data: { lastReadAt: new Date() },
    });

    // 2. Mark incoming messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });
  }
}
