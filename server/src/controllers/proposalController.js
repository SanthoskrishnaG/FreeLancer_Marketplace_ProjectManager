import { ProposalService } from '../services/proposalService.js';
import { ApiResponse } from '../utils/api-response.js';

export class ProposalController {
  static async submitProposal(req, res, next) {
    try {
      const proposal = await ProposalService.submitProposal(req.user.id, req.body);
      return ApiResponse.created(res, proposal, 'Proposal submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getProjectProposals(req, res, next) {
    try {
      const proposals = await ProposalService.getProjectProposals(req.params.projectId, req.user.id);
      return ApiResponse.success(res, proposals, 'Project proposals retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getFreelancerProposals(req, res, next) {
    try {
      const proposals = await ProposalService.getFreelancerProposals(req.user.id, req.query);
      return ApiResponse.success(res, proposals, 'Freelancer proposals retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getProposalById(req, res, next) {
    try {
      const proposal = await ProposalService.getProposalById(req.params.id, req.user.id);
      return ApiResponse.success(res, proposal, 'Proposal retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async acceptProposal(req, res, next) {
    try {
      const result = await ProposalService.acceptProposal(req.params.id, req.user.id);
      return ApiResponse.success(res, result, 'Proposal accepted and contract initialized');
    } catch (error) {
      next(error);
    }
  }

  static async rejectProposal(req, res, next) {
    try {
      const rejected = await ProposalService.rejectProposal(req.params.id, req.user.id);
      return ApiResponse.success(res, rejected, 'Proposal rejected');
    } catch (error) {
      next(error);
    }
  }
}
