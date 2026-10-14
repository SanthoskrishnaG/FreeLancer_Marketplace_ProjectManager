import { DisputeRepository } from '../repositories/dispute.repository.js';
import { ContractRepository } from '../repositories/contract.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { prisma } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

export class DisputeService {
  static async createDispute(userId, input) {
    const { contractId, reason, description, evidence } = input;

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const contract = await ContractRepository.findContractById(contractId);
    if (!contract) throw ApiError.notFound('Contract not found');

    const isClient = user.clientProfile && contract.clientId === user.clientProfile.id;
    const isFreelancer =
      user.freelancerProfile && contract.freelancerProfileId === user.freelancerProfile.id;

    if (!isClient && !isFreelancer && user.role !== 'ADMIN') {
      throw ApiError.forbidden('Only parties to this contract can raise a dispute');
    }

    const existingDispute = await prisma.dispute.findFirst({
      where: {
        contractId,
        status: { in: ['OPEN', 'UNDER_REVIEW'] },
      },
    });

    if (existingDispute) {
      throw ApiError.badRequest('An active dispute is already open for this contract');
    }

    const dispute = await DisputeRepository.createDispute({
      contractId,
      initiatorId: user.id,
      reason,
      description,
      evidence: evidence || [],
      status: 'OPEN',
    });

    await prisma.contract.update({
      where: { id: contractId },
      data: { status: 'DISPUTED' },
    });

    const counterPartyUserId = isClient
      ? (contract.freelancerProfile?.userId || contract.freelancerProfile?.user?.id)
      : (contract.client?.userId || contract.client?.user?.id);

    if (counterPartyUserId) {
      await prisma.notification.create({
        data: {
          userId: counterPartyUserId,
          title: 'Dispute Raised on Contract',
          message: `${user.firstName || 'A user'} has opened a dispute on contract "${contract.project?.title || 'Project'}": "${reason}".`,
          type: 'DISPUTE',
          link: `/disputes/${dispute.id}`,
        },
      });
    }

    return dispute;
  }

  static async getUserDisputes(userId, query = {}) {
    return this.getDisputes(userId, query);
  }

  static async getDisputes(userId, query = {}) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const isAdmin = user.role === 'ADMIN';

    return DisputeRepository.getDisputesList({
      userId: user.id,
      status: query.status,
      isAdmin,
      page,
      limit,
    });
  }

  static async getDisputeById(disputeId, userId) {
    const dispute = await DisputeRepository.findDisputeById(disputeId);
    if (!dispute) throw ApiError.notFound('Dispute case not found');
    return dispute;
  }

  static async addDisputeMessage(userId, disputeId, input) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const dispute = await DisputeRepository.findDisputeById(disputeId);
    if (!dispute) throw ApiError.notFound('Dispute case not found');

    return DisputeRepository.addMessage({
      disputeId,
      senderId: user.id,
      message: input.message,
      attachments: input.attachments || [],
    });
  }

  static async resolveDispute(adminUserId, disputeId, input) {
    const admin = await ProfileRepository.getUserFullProfile(adminUserId);
    if (!admin || admin.role !== 'ADMIN') {
      throw ApiError.forbidden('Only administrators can resolve disputes');
    }

    const dispute = await DisputeRepository.findDisputeById(disputeId);
    if (!dispute) throw ApiError.notFound('Dispute case not found');

    const resolved = await DisputeRepository.updateDispute(disputeId, {
      status: 'RESOLVED',
      adminDecision: input.adminDecision,
      resolutionNotes: input.resolutionNotes,
      resolvedAt: new Date(),
    });

    await prisma.contract.update({
      where: { id: dispute.contractId },
      data: { status: 'COMPLETED' },
    });

    await DisputeRepository.recordAuditLog({
      userId: admin.id,
      action: 'UPDATE',
      entity: 'Dispute',
      entityId: disputeId,
      details: JSON.stringify({
        action: 'RESOLVE_DISPUTE',
        adminDecision: input.adminDecision,
        resolutionNotes: input.resolutionNotes,
      }),
    });

    return resolved;
  }

  static async rejectDispute(adminUserId, disputeId, input) {
    const admin = await ProfileRepository.getUserFullProfile(adminUserId);
    if (!admin || admin.role !== 'ADMIN') {
      throw ApiError.forbidden('Only administrators can reject dispute claims');
    }

    const dispute = await DisputeRepository.findDisputeById(disputeId);
    if (!dispute) throw ApiError.notFound('Dispute case not found');

    const rejected = await DisputeRepository.updateDispute(disputeId, {
      status: 'REJECTED',
      resolutionNotes: input.resolutionNotes,
      resolvedAt: new Date(),
    });

    await prisma.contract.update({
      where: { id: dispute.contractId },
      data: { status: 'ACTIVE' },
    });

    await DisputeRepository.recordAuditLog({
      userId: admin.id,
      action: 'UPDATE',
      entity: 'Dispute',
      entityId: disputeId,
      details: JSON.stringify({
        action: 'REJECT_DISPUTE',
        resolutionNotes: input.resolutionNotes,
      }),
    });

    return rejected;
  }
}

export default DisputeService;
