import { prisma } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

export class ContractService {
  static async getContracts(userId, role) {
    const where = {};
    if (role === 'CLIENT') {
      where.client = { userId };
    } else if (role === 'FREELANCER') {
      where.freelancerProfile = { userId };
    } else if (role !== 'ADMIN') {
      where.OR = [{ client: { userId } }, { freelancerProfile: { userId } }];
    }

    return prisma.contract.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        project: { select: { id: true, title: true, budget: true, status: true } },
        client: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
          },
        },
        freelancerProfile: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
          },
        },
        milestones: { orderBy: { order: 'asc' } },
      },
    });
  }

  static async getContractById(userId, contractId) {
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        project: true,
        client: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
          },
        },
        freelancerProfile: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
          },
        },
        milestones: {
          orderBy: { order: 'asc' },
          include: {
            submissions: {
              orderBy: { submittedAt: 'desc' },
              include: { revisions: true },
            },
          },
        },
        invoices: true,
        reviews: true,
        disputes: true,
      },
    });

    if (!contract) {
      throw ApiError.notFound('Contract not found');
    }

    // Access control
    const isClient = contract.client.userId === userId;
    const isFreelancer = contract.freelancerProfile.userId === userId;

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!isClient && !isFreelancer && user?.role !== 'ADMIN') {
      throw ApiError.forbidden('Unauthorized access to contract record');
    }

    return contract;
  }
}
