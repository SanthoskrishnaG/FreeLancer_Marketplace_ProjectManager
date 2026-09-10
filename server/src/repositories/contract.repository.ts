import { prisma } from '../config/database.js';
import { ContractStatus, Prisma } from '@prisma/client';

export class ContractRepository {
  public static async findContractById(contractId: string) {
    return prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        project: {
          include: {
            category: true,
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
        client: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                location: true,
              },
            },
          },
        },
        freelancerProfile: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                location: true,
              },
            },
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
        milestones: {
          orderBy: { order: 'asc' },
          include: {
            submissions: {
              orderBy: { submittedAt: 'desc' },
              include: {
                files: true,
                revisions: {
                  orderBy: { createdAt: 'desc' },
                },
              },
            },
            revisions: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        conversation: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  public static async getUserContracts(params: {
    clientId?: string;
    freelancerProfileId?: string;
    status?: ContractStatus;
    page?: number;
    limit?: number;
  }) {
    const { clientId, freelancerProfileId, status, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ContractWhereInput = {};
    if (clientId) where.clientId = clientId;
    if (freelancerProfileId) where.freelancerProfileId = freelancerProfileId;
    if (status) where.status = status;

    const [total, contracts] = await Promise.all([
      prisma.contract.count({ where }),
      prisma.contract.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          client: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          freelancerProfile: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          milestones: {
            select: {
              id: true,
              status: true,
              amount: true,
            },
          },
        },
      }),
    ]);

    // Calculate progress stats for each contract
    const formatted = contracts.map((c) => {
      const totalMilestones = c.milestones.length;
      const completedMilestones = c.milestones.filter(
        (m) => m.status === 'COMPLETED' || m.status === 'APPROVED'
      ).length;
      const progressPercentage =
        totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

      return {
        ...c,
        totalMilestones,
        completedMilestones,
        progressPercentage,
      };
    });

    return {
      contracts: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public static async updateContractStatus(contractId: string, status: ContractStatus) {
    return prisma.contract.update({
      where: { id: contractId },
      data: {
        status,
        ...(status === 'COMPLETED' ? { endDate: new Date() } : {}),
      },
      include: {
        project: true,
        client: {
          include: {
            user: true,
          },
        },
        freelancerProfile: {
          include: {
            user: true,
          },
        },
      },
    });
  }
}
