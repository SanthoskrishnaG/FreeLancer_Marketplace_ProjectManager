import { prisma } from '../config/database.js';
import { DisputeStatus, AuditAction, Prisma } from '@prisma/client';

export class DisputeRepository {
  public static async createDispute(data: {
    contractId: string;
    initiatorId: string;
    reason: string;
    description: string;
    evidence?: Prisma.InputJsonValue;
    status: DisputeStatus;
  }) {
    return prisma.dispute.create({
      data,
      include: {
        initiator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        contract: {
          include: {
            project: {
              select: { id: true, title: true },
            },
            client: {
              include: {
                user: {
                  select: { id: true, firstName: true, lastName: true, email: true },
                },
              },
            },
            freelancerProfile: {
              include: {
                user: {
                  select: { id: true, firstName: true, lastName: true, email: true },
                },
              },
            },
          },
        },
      },
    });
  }

  public static async findDisputeById(id: string) {
    return prisma.dispute.findUnique({
      where: { id },
      include: {
        initiator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
        contract: {
          include: {
            project: {
              select: { id: true, title: true },
            },
            client: {
              include: {
                user: {
                  select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
                },
              },
            },
            freelancerProfile: {
              include: {
                user: {
                  select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
                },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
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

  public static async getDisputesList(filter: {
    userId?: string;
    status?: DisputeStatus;
    isAdmin?: boolean;
    page: number;
    limit: number;
  }) {
    const { userId, status, isAdmin, page, limit } = filter;

    const where: Prisma.DisputeWhereInput = {};
    if (status) where.status = status;

    if (!isAdmin && userId) {
      where.OR = [
        { initiatorId: userId },
        { contract: { client: { userId } } },
        { contract: { freelancerProfile: { userId } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          initiator: {
            select: { id: true, firstName: true, lastName: true, role: true },
          },
          contract: {
            select: {
              id: true,
              project: { select: { id: true, title: true } },
              client: {
                select: {
                  user: { select: { id: true, firstName: true, lastName: true } },
                },
              },
              freelancerProfile: {
                select: {
                  user: { select: { id: true, firstName: true, lastName: true } },
                },
              },
            },
          },
          _count: {
            select: { messages: true },
          },
        },
      }),
      prisma.dispute.count({ where }),
    ]);

    return {
      disputes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  public static async addMessage(data: {
    disputeId: string;
    senderId: string;
    message: string;
    attachments?: Prisma.InputJsonValue;
  }) {
    return prisma.disputeMessage.create({
      data,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });
  }

  public static async updateDispute(
    id: string,
    data: {
      status?: DisputeStatus;
      adminDecision?: string | null;
      resolutionNotes?: string | null;
      resolvedAt?: Date | null;
    }
  ) {
    return prisma.dispute.update({
      where: { id },
      data,
      include: {
        initiator: true,
        contract: true,
      },
    });
  }

  public static async recordAuditLog(data: {
    userId: string;
    action: AuditAction;
    entity: string;
    entityId: string;
    details: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    return prisma.auditLog.create({
      data,
    });
  }

  public static async getDisputeAuditLogs(disputeId: string) {
    return prisma.auditLog.findMany({
      where: {
        entity: 'Dispute',
        entityId: disputeId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }
}
