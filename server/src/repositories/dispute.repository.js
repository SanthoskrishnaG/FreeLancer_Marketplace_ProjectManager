import { prisma } from '../config/database.js';

export class DisputeRepository {
  static async createDispute(data) {
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

  static async findDisputeById(id) {
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
            project: { select: { id: true, title: true } },
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

  static async getDisputesList(filter) {
    const { userId, status, isAdmin, page = 1, limit = 10 } = filter;
    const where = {};
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
            },
          },
          _count: { select: { messages: true } },
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

  static async addMessage(data) {
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

  static async updateDispute(id, data) {
    return prisma.dispute.update({
      where: { id },
      data,
      include: {
        initiator: true,
        contract: true,
      },
    });
  }

  static async recordAuditLog(data) {
    return prisma.auditLog.create({ data });
  }

  static async getDisputeAuditLogs(disputeId) {
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

export default DisputeRepository;
