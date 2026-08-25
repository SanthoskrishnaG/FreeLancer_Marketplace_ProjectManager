import { MilestoneRepository } from '../repositories/milestone.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { ApiError } from '../utils/api-error.js';
import { SubmitMilestoneInput, RequestRevisionInput } from '../validators/milestone.validator.js';
import { MilestoneStatus, UserRole } from '@prisma/client';

export class MilestoneService {
  public static async startMilestone(userId: string, milestoneId: string) {
    const milestone = await MilestoneRepository.findMilestoneById(milestoneId);
    if (!milestone) {
      throw ApiError.notFound('Milestone not found');
    }

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const isFreelancer =
      user.freelancerProfile &&
      milestone.contract &&
      milestone.contract.freelancerProfileId === user.freelancerProfile.id;

    if (!isFreelancer && user.role !== UserRole.ADMIN) {
      throw ApiError.forbidden('Only the assigned freelancer can start this milestone');
    }

    if (milestone.status !== MilestoneStatus.PENDING) {
      throw ApiError.badRequest(`Cannot start milestone with status "${milestone.status}"`);
    }

    return MilestoneRepository.startMilestone(milestoneId);
  }

  public static async submitMilestone(
    userId: string,
    milestoneId: string,
    data: SubmitMilestoneInput
  ) {
    const milestone = await MilestoneRepository.findMilestoneById(milestoneId);
    if (!milestone) {
      throw ApiError.notFound('Milestone not found');
    }

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.freelancerProfile) {
      throw ApiError.forbidden('Only freelancers can submit milestone deliverables');
    }

    const isAssigned =
      milestone.contract && milestone.contract.freelancerProfileId === user.freelancerProfile.id;

    if (!isAssigned && user.role !== UserRole.ADMIN) {
      throw ApiError.forbidden('You are not the assigned freelancer for this contract milestone');
    }

    if (
      milestone.status !== MilestoneStatus.IN_PROGRESS &&
      milestone.status !== MilestoneStatus.REVISION_REQUESTED &&
      milestone.status !== MilestoneStatus.PENDING
    ) {
      throw ApiError.badRequest(
        `Cannot submit deliverables for milestone in "${milestone.status}" status`
      );
    }

    return MilestoneRepository.createSubmission(milestoneId, user.freelancerProfile.id, data);
  }

  public static async approveMilestone(userId: string, milestoneId: string) {
    const milestone = await MilestoneRepository.findMilestoneById(milestoneId);
    if (!milestone) {
      throw ApiError.notFound('Milestone not found');
    }

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const isClient =
      user.clientProfile &&
      ((milestone.contract && milestone.contract.clientId === user.clientProfile.id) ||
        (milestone.project && milestone.project.clientId === user.clientProfile.id));

    if (!isClient && user.role !== UserRole.ADMIN) {
      throw ApiError.forbidden('Only the project client can approve milestone deliverables');
    }

    if (
      milestone.status !== MilestoneStatus.SUBMITTED &&
      milestone.status !== MilestoneStatus.UNDER_REVIEW
    ) {
      throw ApiError.badRequest(
        `Cannot approve milestone with status "${milestone.status}". Deliverables must be submitted first.`
      );
    }

    return MilestoneRepository.approveMilestone(milestoneId);
  }

  public static async requestRevision(
    userId: string,
    milestoneId: string,
    data: RequestRevisionInput
  ) {
    const milestone = await MilestoneRepository.findMilestoneById(milestoneId);
    if (!milestone) {
      throw ApiError.notFound('Milestone not found');
    }

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.clientProfile) {
      throw ApiError.forbidden('Only clients can request milestone revisions');
    }

    const isClient =
      (milestone.contract && milestone.contract.clientId === user.clientProfile.id) ||
      (milestone.project && milestone.project.clientId === user.clientProfile.id);

    if (!isClient && user.role !== UserRole.ADMIN) {
      throw ApiError.forbidden(
        'You do not have permission to request revisions for this milestone'
      );
    }

    if (
      milestone.status !== MilestoneStatus.SUBMITTED &&
      milestone.status !== MilestoneStatus.UNDER_REVIEW
    ) {
      throw ApiError.badRequest(
        `Cannot request revision for milestone in "${milestone.status}" status`
      );
    }

    return MilestoneRepository.createRevisionRequest(milestoneId, data);
  }

  public static async getMilestoneHistory(userId: string, milestoneId: string) {
    const milestone = await MilestoneRepository.findMilestoneById(milestoneId);
    if (!milestone) {
      throw ApiError.notFound('Milestone not found');
    }

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    return MilestoneRepository.getMilestoneHistory(milestoneId);
  }
}
