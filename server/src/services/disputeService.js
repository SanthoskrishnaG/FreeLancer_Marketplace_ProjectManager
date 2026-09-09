import { prisma } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

export class DisputeService {
  static async createDispute(userId, data) {
    const contract = await prisma.contract.findUnique({
      where: { id: data.contractId },
      include: { client: true, freelancerProfile: true },
    });

    if (!contract) {
      throw ApiError.notFound('Contract not found');
    }

    const isClient = contract.client.userId === userId;
    const isFreelancer = contract.freelancerProfile.userId === userId;

    if (!isClient && !isFreelancer) {
      throw ApiError.forbidden('Only contract participants can raise a dispute');
    }

    return prisma.$transaction(async (tx) => {
      const dispute = await tx.dispute.create({
        data: {
          contractId: data.contractId,
          initiatorId: userId,
          reason: data.reason,
          description: data.description,
          evidence: data.evidence || [],
          status: 'OPEN',
        },
      });

      await tx.contract.update({
        where: { id: data.contractId },
        data: { status: 'DISPUTED' },
      });

      // Record audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'CREATE',
          entity: 'Dispute',
          entityId: dispute.id,
          details: JSON.stringify({ reason: data.reason, contractId: data.contractId }),
        },
      });

      return dispute;
    });
  }

  static async getDisputes(userId, role) {
    const where = {};
    if (role === 'CLIENT') {
      where.contract = { client: { userId } };
    } else if (role === 'FREELANCER') {
      where.contract = { freelancerProfile: { userId } };
    } else if (role !== 'ADMIN') {
      where.initiatorId = userId;
    }

    return prisma.dispute.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        contract: {
          select: {
            id: true,
            totalAmount: true,
            project: { select: { id: true, title: true } },
          },
        },
        initiator: { select: { firstName: true, lastName: true, email: true, role: true } },
        _count: { select: { messages: true } },
      },
    });
  }

  static async getDisputeById(userId, disputeId) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        contract: {
          include: {
            project: true,
            client: { include: { user: true } },
            freelancerProfile: { include: { user: true } },
          },
        },
        initiator: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!dispute) {
      throw ApiError.notFound('Dispute not found');
    }

    return dispute;
  }

  static async addDisputeMessage(userId, disputeId, { message, attachments = [] }) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { contract: { include: { client: true, freelancerProfile: true } } },
    });

    if (!dispute) {
      throw ApiError.notFound('Dispute not found');
    }

    const isClient = dispute.contract.client.userId === userId;
    const isFreelancer = dispute.contract.freelancerProfile.userId === userId;

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!isClient && !isFreelancer && user?.role !== 'ADMIN') {
      throw ApiError.forbidden('Unauthorized to participate in this dispute thread');
    }

    return prisma.disputeMessage.create({
      data: {
        disputeId,
        senderId: userId,
        message,
        attachments,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true } },
      },
    });
  }
}
