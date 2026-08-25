import { Request, Response, NextFunction } from 'express';
import { MilestoneService } from '../services/milestone.service.js';
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';

export class MilestoneController {
  public static async startMilestone(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const milestone = await MilestoneService.startMilestone(
        req.user.userId,
        req.params.id as string
      );
      res.status(200).json(ApiResponse.success(milestone, 'Milestone started'));
    } catch (error) {
      next(error);
    }
  }

  public static async submitMilestone(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const submission = await MilestoneService.submitMilestone(
        req.user.userId,
        req.params.id as string,
        req.body
      );
      res
        .status(201)
        .json(ApiResponse.success(submission, 'Milestone deliverables submitted successfully'));
    } catch (error) {
      next(error);
    }
  }

  public static async approveMilestone(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const milestone = await MilestoneService.approveMilestone(
        req.user.userId,
        req.params.id as string
      );
      res.status(200).json(ApiResponse.success(milestone, 'Milestone approved!'));
    } catch (error) {
      next(error);
    }
  }

  public static async requestRevision(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const revision = await MilestoneService.requestRevision(
        req.user.userId,
        req.params.id as string,
        req.body
      );
      res.status(201).json(ApiResponse.success(revision, 'Milestone revision requested'));
    } catch (error) {
      next(error);
    }
  }

  public static async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const history = await MilestoneService.getMilestoneHistory(
        req.user.userId,
        req.params.id as string
      );
      res.status(200).json(ApiResponse.success(history, 'Milestone submission history retrieved'));
    } catch (error) {
      next(error);
    }
  }
}
