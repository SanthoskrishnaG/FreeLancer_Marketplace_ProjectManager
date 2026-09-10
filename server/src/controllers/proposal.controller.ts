import { Request, Response, NextFunction } from 'express';
import { ProposalService } from '../services/proposal.service.js';
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';
import { UserRole } from '@prisma/client';

export class ProposalController {
  public static async createProposal(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      if (req.user.role !== UserRole.FREELANCER && req.user.role !== UserRole.ADMIN) {
        throw ApiError.forbidden('Only freelancers can submit proposals');
      }

      const proposal = await ProposalService.createProposal(req.user.userId, req.body);
      res.status(201).json(ApiResponse.success(proposal, 'Proposal submitted successfully'));
    } catch (error) {
      next(error);
    }
  }

  public static async getMyProposals(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const result = await ProposalService.getMyProposals(req.user.userId, req.query as any);
      res.status(200).json(ApiResponse.success(result, 'My proposals retrieved'));
    } catch (error) {
      next(error);
    }
  }

  public static async getProjectProposals(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const result = await ProposalService.getProjectProposals(
        req.user.userId,
        req.params.projectId as string,
        req.query as any
      );
      res.status(200).json(ApiResponse.success(result, 'Project proposals retrieved'));
    } catch (error) {
      next(error);
    }
  }

  public static async getProposalById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const proposal = await ProposalService.getProposalById(
        req.user.userId,
        req.params.id as string
      );
      res.status(200).json(ApiResponse.success(proposal, 'Proposal details retrieved'));
    } catch (error) {
      next(error);
    }
  }

  public static async withdrawProposal(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const updated = await ProposalService.withdrawProposal(
        req.user.userId,
        req.params.id as string
      );
      res.status(200).json(ApiResponse.success(updated, 'Proposal withdrawn successfully'));
    } catch (error) {
      next(error);
    }
  }

  public static async shortlistProposal(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const updated = await ProposalService.shortlistProposal(
        req.user.userId,
        req.params.id as string
      );
      res.status(200).json(ApiResponse.success(updated, 'Proposal shortlisted'));
    } catch (error) {
      next(error);
    }
  }

  public static async rejectProposal(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const updated = await ProposalService.rejectProposal(
        req.user.userId,
        req.params.id as string
      );
      res.status(200).json(ApiResponse.success(updated, 'Proposal rejected'));
    } catch (error) {
      next(error);
    }
  }

  public static async acceptProposal(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const result = await ProposalService.acceptProposal(req.user.userId, req.params.id as string);
      res
        .status(200)
        .json(
          ApiResponse.success(
            result,
            'Proposal accepted! Project is now active with contract initiated.'
          )
        );
    } catch (error) {
      next(error);
    }
  }
}
