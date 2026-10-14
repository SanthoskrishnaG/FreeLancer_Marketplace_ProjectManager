import { prisma } from '../config/database.js';

export class ContractRepository {
  static async findContractById(contractId) {
    return prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        project: {
          include: {
            category: true,
            skills: { include: { skill: true } },
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
            skills: { include: { skill: true } },
          },
        },
        milestones: {
          orderBy: { order: 'asc' },
          include: {
            submissions: {
              orderBy: { submittedAt: 'desc' },
              include: {
                files: true,
                revisions: { orderBy: { createdAt: 'desc' } },
              },
            },
          },
        },
      },
    });
  }

  static async getUserContracts(params) {
    const { clientId, freelancerProfileId, status, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where = {};
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
          project: { select: { id: true, title: true, budget: true, status: true } },
          client: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, avatarUrl: true },
              },
            },
          },
          freelancerProfile: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, avatarUrl: true },
              },
            },
          },
          milestones: {
            select: { id: true, title: true, amount: true, status: true, order: true },
          },
        },
      }),
    ]);

    return {
      contracts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async updateContractStatus(contractId, status) {
    return prisma.contract.update({
      where: { id: contractId },
      data: { status },
    });
  }
}

export default ContractRepository;
