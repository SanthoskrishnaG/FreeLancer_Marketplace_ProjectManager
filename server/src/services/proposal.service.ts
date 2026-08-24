import { ProposalRepository } from '../repositories/proposal.repository.js';
import { ProjectRepository } from '../repositories/project.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { ApiError } from '../utils/api-error.js';
import { CreateProposalInput } from '../validators/proposal.validator.js';
import { ProposalStatus, ProjectStatus, UserRole } from '@prisma/client';

export class ProposalService {
  public static async createProposal(userId: string, data: CreateProposalInput) {
    // 1. Fetch user & freelancer profile
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || user.role !== UserRole.FREELANCER || !user.freelancerProfile) {
      throw ApiError.forbidden('Only registered freelancer accounts can submit proposals');
    }

    // 2. Fetch project
    const project = await ProjectRepository.getProjectById(data.projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    // 3. Project status must be PUBLISHED
    if (project.status !== ProjectStatus.PUBLISHED) {
      throw ApiError.badRequest(
        `Cannot submit proposals on project with status "${project.status}". Only PUBLISHED projects accept bids.`
      );
    }

    // 4. Prevent applying to own project
    if (user.clientProfile && project.clientId === user.clientProfile.id) {
      throw ApiError.badRequest('You cannot submit a proposal on your own project');
    }

    // 5. Check for duplicate proposal
    const existing = await ProposalRepository.findExistingProposal(
      data.projectId,
      user.freelancerProfile.id
    );
    if (existing) {
      throw ApiError.badRequest(
        'You have already submitted a proposal for this project. Duplicate proposals are not allowed.'
      );
    }

    // 6. Create proposal
    return ProposalRepository.createProposal(user.freelancerProfile.id, data);
  }

  public static async getMyProposals(
    userId: string,
    query: { status?: ProposalStatus; page?: string; limit?: string }
  ) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.freelancerProfile) {
      throw ApiError.forbidden('Only freelancers have submitted proposals');
    }

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);

    return ProposalRepository.getFreelancerProposals(
      user.freelancerProfile.id,
      query.status,
      page,
      limit
    );
  }

  public static async getProjectProposals(
    userId: string,
    projectId: string,
    query: {
      status?: ProposalStatus;
      sortBy?: 'newest' | 'bid_low' | 'bid_high' | 'rating';
      page?: string;
      limit?: string;
    }
  ) {
    const project = await ProjectRepository.getProjectById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.clientProfile || project.clientId !== user.clientProfile.id) {
      throw ApiError.forbidden('Only the project owner can view received proposals');
    }

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);

    return ProposalRepository.getProjectProposals(projectId, {
      status: query.status,
      sortBy: query.sortBy,
      page,
      limit,
    });
  }

  public static async getProposalById(userId: string, proposalId: string) {
    const proposal = await ProposalRepository.findProposalById(proposalId);
    if (!proposal) {
      throw ApiError.notFound('Proposal not found');
    }

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const isFreelancerAuthor =
      user.freelancerProfile && proposal.freelancerProfileId === user.freelancerProfile.id;
    const isProjectOwner =
      user.clientProfile && proposal.project.clientId === user.clientProfile.id;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isFreelancerAuthor && !isProjectOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have permission to view this proposal');
    }

    return proposal;
  }

  public static async withdrawProposal(userId: string, proposalId: string) {
    const proposal = await ProposalRepository.findProposalById(proposalId);
    if (!proposal) {
      throw ApiError.notFound('Proposal not found');
    }

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (
      !user ||
      !user.freelancerProfile ||
      proposal.freelancerProfileId !== user.freelancerProfile.id
    ) {
      throw ApiError.forbidden('You can only withdraw your own proposals');
    }

    if (
      proposal.status !== ProposalStatus.PENDING &&
      proposal.status !== ProposalStatus.SHORTLISTED
    ) {
      throw ApiError.badRequest(`Cannot withdraw a proposal with status "${proposal.status}"`);
    }

    return ProposalRepository.updateProposalStatus(proposalId, ProposalStatus.WITHDRAWN);
  }

  public static async shortlistProposal(userId: string, proposalId: string) {
    const proposal = await ProposalRepository.findProposalById(proposalId);
    if (!proposal) {
      throw ApiError.notFound('Proposal not found');
    }

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.clientProfile || proposal.project.clientId !== user.clientProfile.id) {
      throw ApiError.forbidden('Only the project owner can shortlist proposals');
    }

    if (proposal.status !== ProposalStatus.PENDING) {
      throw ApiError.badRequest(`Only PENDING proposals can be shortlisted`);
    }

    return ProposalRepository.updateProposalStatus(proposalId, ProposalStatus.SHORTLISTED);
  }

  public static async rejectProposal(userId: string, proposalId: string) {
    const proposal = await ProposalRepository.findProposalById(proposalId);
    if (!proposal) {
      throw ApiError.notFound('Proposal not found');
    }

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.clientProfile || proposal.project.clientId !== user.clientProfile.id) {
      throw ApiError.forbidden('Only the project owner can reject proposals');
    }

    if (proposal.status === ProposalStatus.ACCEPTED) {
      throw ApiError.badRequest('Cannot reject an already accepted proposal');
    }

    return ProposalRepository.updateProposalStatus(proposalId, ProposalStatus.REJECTED);
  }

  public static async acceptProposal(userId: string, proposalId: string) {
    const proposal = await ProposalRepository.findProposalById(proposalId);
    if (!proposal) {
      throw ApiError.notFound('Proposal not found');
    }

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.clientProfile || proposal.project.clientId !== user.clientProfile.id) {
      throw ApiError.forbidden('Only the project owner can accept proposals');
    }

    if (proposal.project.status !== ProjectStatus.PUBLISHED) {
      throw ApiError.badRequest(
        `Cannot accept proposal for project with status "${proposal.project.status}"`
      );
    }

    return ProposalRepository.acceptProposal(proposalId);
  }
}
