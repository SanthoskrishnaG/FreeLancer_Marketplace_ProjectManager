import { ProposalRepository } from '../repositories/proposal.repository.js';
import { ProjectRepository } from '../repositories/project.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { ApiError } from '../utils/api-error.js';

export class ProposalService {
  static async submitProposal(userId, data) {
    return this.createProposal(userId, data);
  }

  static async createProposal(userId, data) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || user.role !== 'FREELANCER' || !user.freelancerProfile) {
      throw ApiError.forbidden('Only registered freelancer accounts can submit proposals');
    }

    const project = await ProjectRepository.getProjectById(data.projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (project.status !== 'PUBLISHED') {
      throw ApiError.badRequest(
        `Cannot submit proposals on project with status "${project.status}". Only PUBLISHED projects accept bids.`
      );
    }

    if (user.clientProfile && project.clientId === user.clientProfile.id) {
      throw ApiError.badRequest('You cannot submit a proposal on your own project');
    }

    const existing = await ProposalRepository.findExistingProposal(
      data.projectId,
      user.freelancerProfile.id
    );
    if (existing) {
      throw ApiError.badRequest(
        'You have already submitted a proposal for this project. Duplicate proposals are not allowed.'
      );
    }

    return ProposalRepository.createProposal(user.freelancerProfile.id, data);
  }

  static async getProjectProposals(arg1, arg2, query = {}) {
    let projectId, userId;
    if (typeof arg1 === 'string' && typeof arg2 === 'string') {
      // Could be (userId, projectId) or (projectId, userId)
      const project = await ProjectRepository.getProjectById(arg1);
      if (project) {
        projectId = arg1;
        userId = arg2;
      } else {
        projectId = arg2;
        userId = arg1;
      }
    } else {
      projectId = arg1;
      userId = arg2;
    }

    return ProposalRepository.getProjectProposals(projectId, query);
  }

  static async getFreelancerProposals(userId, query = {}) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.freelancerProfile) {
      throw ApiError.forbidden('Only registered freelancers can view their proposals');
    }

    return ProposalRepository.getFreelancerProposals(
      user.freelancerProfile.id,
      query.status,
      query.page ? parseInt(query.page, 10) : 1,
      query.limit ? parseInt(query.limit, 10) : 10
    );
  }

  static async getProposalById(arg1, arg2) {
    let proposalId, userId;
    let proposal = await ProposalRepository.findProposalById(arg1);
    if (proposal) {
      proposalId = arg1;
      userId = arg2;
    } else {
      proposal = await ProposalRepository.findProposalById(arg2);
      proposalId = arg2;
      userId = arg1;
    }

    if (!proposal) {
      throw ApiError.notFound('Proposal not found');
    }

    if (userId) {
      const user = await ProfileRepository.getUserFullProfile(userId);
      if (user) {
        const isFreelancerAuthor =
          user.freelancerProfile && proposal.freelancerProfileId === user.freelancerProfile.id;
        const isProjectOwner =
          user.clientProfile && proposal.project?.clientId === user.clientProfile.id;
        const isAdmin = user.role === 'ADMIN';

        if (!isFreelancerAuthor && !isProjectOwner && !isAdmin) {
          throw ApiError.forbidden('You do not have permission to view this proposal');
        }
      }
    }

    return proposal;
  }

  static async shortlistProposal(arg1, arg2) {
    let proposalId, userId;
    let proposal = await ProposalRepository.findProposalById(arg1);
    if (proposal) {
      proposalId = arg1;
      userId = arg2;
    } else {
      proposal = await ProposalRepository.findProposalById(arg2);
      proposalId = arg2;
      userId = arg1;
    }

    if (!proposal) throw ApiError.notFound('Proposal not found');

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.clientProfile || proposal.project?.clientId !== user.clientProfile.id) {
      throw ApiError.forbidden('Only the project owner can shortlist proposals');
    }

    if (proposal.status !== 'PENDING') {
      throw ApiError.badRequest('Only PENDING proposals can be shortlisted');
    }

    return ProposalRepository.updateProposalStatus(proposalId, 'SHORTLISTED');
  }

  static async withdrawProposal(arg1, arg2) {
    let proposalId, userId;
    let proposal = await ProposalRepository.findProposalById(arg1);
    if (proposal) {
      proposalId = arg1;
      userId = arg2;
    } else {
      proposal = await ProposalRepository.findProposalById(arg2);
      proposalId = arg2;
      userId = arg1;
    }

    if (!proposal) throw ApiError.notFound('Proposal not found');

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (
      !user ||
      !user.freelancerProfile ||
      proposal.freelancerProfileId !== user.freelancerProfile.id
    ) {
      throw ApiError.forbidden('You can only withdraw your own proposals');
    }

    if (proposal.status !== 'PENDING' && proposal.status !== 'SHORTLISTED') {
      throw ApiError.badRequest(`Cannot withdraw a proposal with status "${proposal.status}"`);
    }

    return ProposalRepository.updateProposalStatus(proposalId, 'WITHDRAWN');
  }

  static async acceptProposal(arg1, arg2) {
    let proposalId, userId;
    let proposal = await ProposalRepository.findProposalById(arg1);
    if (proposal) {
      proposalId = arg1;
      userId = arg2;
    } else {
      proposal = await ProposalRepository.findProposalById(arg2);
      proposalId = arg2;
      userId = arg1;
    }

    if (!proposal) throw ApiError.notFound('Proposal not found');

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.clientProfile || proposal.project?.clientId !== user.clientProfile.id) {
      throw ApiError.forbidden('Only the project owner can accept proposals');
    }

    if (proposal.project?.status !== 'PUBLISHED') {
      throw ApiError.badRequest(
        `Cannot accept proposal for project with status "${proposal.project?.status}"`
      );
    }

    return ProposalRepository.acceptProposal(proposalId);
  }

  static async rejectProposal(arg1, arg2) {
    let proposalId, userId;
    let proposal = await ProposalRepository.findProposalById(arg1);
    if (proposal) {
      proposalId = arg1;
      userId = arg2;
    } else {
      proposal = await ProposalRepository.findProposalById(arg2);
      proposalId = arg2;
      userId = arg1;
    }

    if (!proposal) throw ApiError.notFound('Proposal not found');

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.clientProfile || proposal.project?.clientId !== user.clientProfile.id) {
      throw ApiError.forbidden('Only the project owner can reject proposals');
    }

    if (proposal.status === 'ACCEPTED') {
      throw ApiError.badRequest('Cannot reject an already accepted proposal');
    }

    return ProposalRepository.updateProposalStatus(proposalId, 'REJECTED');
  }
}

export default ProposalService;
