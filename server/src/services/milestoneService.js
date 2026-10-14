import { MilestoneRepository } from '../repositories/milestone.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { prisma } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

export class MilestoneService {
  static async getMilestoneById(arg1, arg2) {
    const milestoneId = arg1?.length === 36 ? arg1 : arg2;
    const milestone = await MilestoneRepository.findMilestoneById(milestoneId);
    if (!milestone) throw ApiError.notFound('Milestone not found');
    return milestone;
  }

  static async getContractMilestones(contractId, userId) {
    return prisma.milestone.findMany({
      where: { contractId },
      include: {
        submissions: { orderBy: { submittedAt: 'desc' } },
        revisions: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { order: 'asc' },
    });
  }

  static async startMilestone(arg1, arg2) {
    let milestoneId, userId;
    let milestone = await MilestoneRepository.findMilestoneById(arg1);
    if (milestone) {
      milestoneId = arg1;
      userId = arg2;
    } else {
      milestone = await MilestoneRepository.findMilestoneById(arg2);
      milestoneId = arg2;
      userId = arg1;
    }

    if (!milestone) throw ApiError.notFound('Milestone not found');

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const isFreelancer =
      user.freelancerProfile &&
      milestone.contract &&
      milestone.contract.freelancerProfileId === user.freelancerProfile.id;

    if (!isFreelancer && user.role !== 'ADMIN') {
      throw ApiError.forbidden('Only the assigned freelancer can start this milestone');
    }

    if (milestone.status !== 'PENDING') {
      throw ApiError.badRequest(`Cannot start milestone with status "${milestone.status}"`);
    }

    return MilestoneRepository.startMilestone(milestoneId);
  }

  static async submitMilestone(arg1, arg2, data = {}) {
    let milestoneId, userId;
    let milestone = await MilestoneRepository.findMilestoneById(arg1);
    if (milestone) {
      milestoneId = arg1;
      userId = arg2;
    } else {
      milestone = await MilestoneRepository.findMilestoneById(arg2);
      milestoneId = arg2;
      userId = arg1;
    }

    if (!milestone) throw ApiError.notFound('Milestone not found');

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.freelancerProfile) {
      throw ApiError.forbidden('Only freelancers can submit milestone deliverables');
    }

    const isAssigned =
      milestone.contract && milestone.contract.freelancerProfileId === user.freelancerProfile.id;

    if (!isAssigned && user.role !== 'ADMIN') {
      throw ApiError.forbidden('You are not the assigned freelancer for this contract milestone');
    }

    if (
      milestone.status !== 'IN_PROGRESS' &&
      milestone.status !== 'REVISION_REQUESTED' &&
      milestone.status !== 'PENDING' &&
      milestone.status !== 'SUBMITTED'
    ) {
      throw ApiError.badRequest(
        `Cannot submit deliverables for milestone in state "${milestone.status}"`
      );
    }

    return MilestoneRepository.createSubmission(milestoneId, user.freelancerProfile.id, {
      description: data.description || data.notes || 'Deliverables submitted for milestone',
      notes: data.notes || null,
      links: data.links || [],
      fileIds: data.fileIds || [],
    });
  }

  static async approveMilestone(arg1, arg2) {
    let milestoneId, userId;
    let milestone = await MilestoneRepository.findMilestoneById(arg1);
    if (milestone) {
      milestoneId = arg1;
      userId = arg2;
    } else {
      milestone = await MilestoneRepository.findMilestoneById(arg2);
      milestoneId = arg2;
      userId = arg1;
    }

    if (!milestone) throw ApiError.notFound('Milestone not found');

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.clientProfile) {
      throw ApiError.forbidden('Only clients can approve milestone deliverables');
    }

    const isClientOwner =
      milestone.contract && milestone.contract.clientId === user.clientProfile.id;

    if (!isClientOwner && user.role !== 'ADMIN') {
      throw ApiError.forbidden('Only the contract client can approve milestones');
    }

    return MilestoneRepository.approveMilestone(milestoneId);
  }

  static async requestRevision(arg1, arg2, data = {}) {
    let milestoneId, userId;
    let milestone = await MilestoneRepository.findMilestoneById(arg1);
    if (milestone) {
      milestoneId = arg1;
      userId = arg2;
    } else {
      milestone = await MilestoneRepository.findMilestoneById(arg2);
      milestoneId = arg2;
      userId = arg1;
    }

    if (!milestone) throw ApiError.notFound('Milestone not found');

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.clientProfile) {
      throw ApiError.forbidden('Only clients can request revisions');
    }

    const isClientOwner =
      milestone.contract && milestone.contract.clientId === user.clientProfile.id;

    if (!isClientOwner && user.role !== 'ADMIN') {
      throw ApiError.forbidden('Only the contract client can request milestone revisions');
    }

    return MilestoneRepository.createRevisionRequest(milestoneId, {
      feedback: data.feedback || data.revisionNotes || 'Revision requested for deliverables',
      requestedChanges: data.requestedChanges || [data.feedback || 'Adjustments required'],
      dueDate: data.dueDate,
    });
  }
}

export default MilestoneService;
