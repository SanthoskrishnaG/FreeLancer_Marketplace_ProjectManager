import { DisputeRepository } from '../repositories/dispute.repository.js';
import { ContractRepository } from '../repositories/contract.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { prisma } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';
import {
  CreateDisputeInput,
  AddDisputeMessageInput,
  ResolveDisputeInput,
  RejectDisputeInput,
  UpdateDisputeStatusInput,
} from '../validators/dispute.validator.js';
import { DisputeStatus, ContractStatus, UserRole, NotificationType, AuditAction } from '@prisma/client';

export class DisputeService {
  public static async createDispute(userId: string, input: CreateDisputeInput) {
    const { contractId, reason, description, evidence } = input;

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const contract = await ContractRepository.findContractById(contractId);
    if (!contract) throw ApiError.notFound('Contract not found');

    const isClient = user.clientProfile && contract.clientId === user.clientProfile.id;
    const isFreelancer =
      user.freelancerProfile && contract.freelancerProfileId === user.freelancerProfile.id;

    if (!isClient && !isFreelancer && user.role !== UserRole.ADMIN) {
      throw ApiError.forbidden('Only parties to this contract can raise a dispute');
    }

    // Check if there is already an active dispute on this contract
    const existingDispute = await prisma.dispute.findFirst({
      where: {
        contractId,
        status: { in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW] },
      },
    });

    if (existingDispute) {
      throw ApiError.badRequest('An active dispute is already open for this contract');
    }

    // 1. Create dispute
    const dispute = await DisputeRepository.createDispute({
      contractId,
      initiatorId: user.id,
      reason,
      description,
      evidence: evidence || [],
      status: DisputeStatus.OPEN,
    });

    // 2. Update contract status to DISPUTED
    await prisma.contract.update({
      where: { id: contractId },
      data: { status: ContractStatus.DISPUTED },
    });

    // 3. Notify counter-party
    const counterPartyUserId = isClient
      ? contract.freelancerProfile.userId
      : contract.client.userId;

    await prisma.notification.create({
      data: {
        userId: counterPartyUserId,
        title: 'Dispute Raised on Contract',
        message: `${user.firstName} has opened a dispute on contract "${contract.project?.title || 'Project'}": "${reason}".`,
        type: NotificationType.DISPUTE,
        link: `/disputes/${dispute.id}`,
      },
    });

    return dispute;
  }

  public static async getDisputes(
    userId: string,
    query: { status?: DisputeStatus; page?: string; limit?: string }
  ) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const isAdmin = user.role === UserRole.ADMIN;

    return DisputeRepository.getDisputesList({
      userId: user.id,
      status: query.status,
      isAdmin,
      page,
      limit,
    });
  }

  public static async getDisputeById(userId: string, disputeId: string) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const dispute = await DisputeRepository.findDisputeById(disputeId);
    if (!dispute) throw ApiError.notFound('Dispute case not found');

    const isInitiator = dispute.initiatorId === user.id;
    const isClient =
      user.clientProfile && dispute.contract.clientId === user.clientProfile.id;
    const isFreelancer =
      user.freelancerProfile &&
      dispute.contract.freelancerProfileId === user.freelancerProfile.id;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isInitiator && !isClient && !isFreelancer && !isAdmin) {
      throw ApiError.forbidden('You do not have authorization to view this dispute case');
    }

    return dispute;
  }

  public static async addDisputeMessage(
    userId: string,
    disputeId: string,
    input: AddDisputeMessageInput
  ) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const dispute = await DisputeRepository.findDisputeById(disputeId);
    if (!dispute) throw ApiError.notFound('Dispute case not found');

    const isInitiator = dispute.initiatorId === user.id;
    const isClient =
      user.clientProfile && dispute.contract.clientId === user.clientProfile.id;
    const isFreelancer =
      user.freelancerProfile &&
      dispute.contract.freelancerProfileId === user.freelancerProfile.id;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isInitiator && !isClient && !isFreelancer && !isAdmin) {
      throw ApiError.forbidden('You do not have authorization to post in this dispute');
    }

    return DisputeRepository.addMessage({
      disputeId,
      senderId: user.id,
      message: input.message,
      attachments: input.attachments || [],
    });
  }

  public static async updateDisputeStatus(
    adminUserId: string,
    disputeId: string,
    input: UpdateDisputeStatusInput,
    metadata?: { ipAddress?: string; userAgent?: string }
  ) {
    const admin = await ProfileRepository.getUserFullProfile(adminUserId);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw ApiError.forbidden('Only administrators can update dispute status');
    }

    const dispute = await DisputeRepository.findDisputeById(disputeId);
    if (!dispute) throw ApiError.notFound('Dispute case not found');

    const updated = await DisputeRepository.updateDispute(disputeId, {
      status: input.status,
    });

    // Record Audit Log for admin decision
    await DisputeRepository.recordAuditLog({
      userId: admin.id,
      action: AuditAction.STATUS_CHANGE,
      entity: 'Dispute',
      entityId: disputeId,
      details: JSON.stringify({
        previousStatus: dispute.status,
        newStatus: input.status,
        notes: input.notes || 'Status updated by Admin',
        adminName: `${admin.firstName} ${admin.lastName}`,
      }),
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    return updated;
  }

  public static async resolveDispute(
    adminUserId: string,
    disputeId: string,
    input: ResolveDisputeInput,
    metadata?: { ipAddress?: string; userAgent?: string }
  ) {
    const admin = await ProfileRepository.getUserFullProfile(adminUserId);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw ApiError.forbidden('Only administrators can resolve disputes');
    }

    const dispute = await DisputeRepository.findDisputeById(disputeId);
    if (!dispute) throw ApiError.notFound('Dispute case not found');

    const resolved = await DisputeRepository.updateDispute(disputeId, {
      status: DisputeStatus.RESOLVED,
      adminDecision: input.adminDecision,
      resolutionNotes: input.resolutionNotes,
      resolvedAt: new Date(),
    });

    // Update contract status back to active or completed based on context
    await prisma.contract.update({
      where: { id: dispute.contractId },
      data: { status: ContractStatus.COMPLETED },
    });

    // Record Audit Log for resolution
    await DisputeRepository.recordAuditLog({
      userId: admin.id,
      action: AuditAction.UPDATE,
      entity: 'Dispute',
      entityId: disputeId,
      details: JSON.stringify({
        action: 'RESOLVE_DISPUTE',
        adminDecision: input.adminDecision,
        resolutionNotes: input.resolutionNotes,
        adminId: admin.id,
        adminName: `${admin.firstName} ${admin.lastName}`,
      }),
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    // Notify parties
    const clientUserId = dispute.contract.client.userId;
    const freelancerUserId = dispute.contract.freelancerProfile.userId;

    const notificationMessage = `Dispute on contract "${dispute.contract.project?.title || 'Project'}" has been RESOLVED by Admin. Decision: ${input.adminDecision}`;

    await prisma.notification.createMany({
      data: [
        {
          userId: clientUserId,
          title: 'Dispute Resolved',
          message: notificationMessage,
          type: NotificationType.DISPUTE,
          link: `/disputes/${dispute.id}`,
        },
        {
          userId: freelancerUserId,
          title: 'Dispute Resolved',
          message: notificationMessage,
          type: NotificationType.DISPUTE,
          link: `/disputes/${dispute.id}`,
        },
      ],
    });

    return resolved;
  }

  public static async rejectDispute(
    adminUserId: string,
    disputeId: string,
    input: RejectDisputeInput,
    metadata?: { ipAddress?: string; userAgent?: string }
  ) {
    const admin = await ProfileRepository.getUserFullProfile(adminUserId);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw ApiError.forbidden('Only administrators can reject dispute claims');
    }

    const dispute = await DisputeRepository.findDisputeById(disputeId);
    if (!dispute) throw ApiError.notFound('Dispute case not found');

    const rejected = await DisputeRepository.updateDispute(disputeId, {
      status: DisputeStatus.REJECTED,
      resolutionNotes: input.resolutionNotes,
      resolvedAt: new Date(),
    });

    // Restore contract to active
    await prisma.contract.update({
      where: { id: dispute.contractId },
      data: { status: ContractStatus.ACTIVE },
    });

    // Record Audit Log for rejection
    await DisputeRepository.recordAuditLog({
      userId: admin.id,
      action: AuditAction.UPDATE,
      entity: 'Dispute',
      entityId: disputeId,
      details: JSON.stringify({
        action: 'REJECT_DISPUTE',
        resolutionNotes: input.resolutionNotes,
        adminId: admin.id,
        adminName: `${admin.firstName} ${admin.lastName}`,
      }),
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    // Notify parties
    const clientUserId = dispute.contract.client.userId;
    const freelancerUserId = dispute.contract.freelancerProfile.userId;

    const notificationMessage = `Dispute on contract "${dispute.contract.project?.title || 'Project'}" has been reviewed and REJECTED by Admin. Notes: ${input.resolutionNotes}`;

    await prisma.notification.createMany({
      data: [
        {
          userId: clientUserId,
          title: 'Dispute Claim Rejected',
          message: notificationMessage,
          type: NotificationType.DISPUTE,
          link: `/disputes/${dispute.id}`,
        },
        {
          userId: freelancerUserId,
          title: 'Dispute Claim Rejected',
          message: notificationMessage,
          type: NotificationType.DISPUTE,
          link: `/disputes/${dispute.id}`,
        },
      ],
    });

    return rejected;
  }

  public static async getDisputeAuditLogs(adminUserId: string, disputeId: string) {
    const admin = await ProfileRepository.getUserFullProfile(adminUserId);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw ApiError.forbidden('Only administrators can inspect audit logs');
    }

    return DisputeRepository.getDisputeAuditLogs(disputeId);
  }
}
