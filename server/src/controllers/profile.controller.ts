import { Request, Response, NextFunction } from 'express';
import { ProfileService } from '../services/profile.service.js';
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';

export class ProfileController {
  public static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const user = await ProfileService.getMyProfile(req.user.userId);
      res.status(200).json(ApiResponse.success(user, 'User profile retrieved'));
    } catch (error) {
      next(error);
    }
  }

  public static async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const updated = await ProfileService.updateMyProfile(req.user.userId, req.body);
      res.status(200).json(ApiResponse.success(updated, 'Profile updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  public static async listFreelancers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ProfileService.listFreelancers(req.query as any);
      res.status(200).json(ApiResponse.success(result, 'Freelancers retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  public static async getFreelancerById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const freelancer = await ProfileService.getFreelancerById(req.params.id as string);
      res.status(200).json(ApiResponse.success(freelancer, 'Freelancer details retrieved'));
    } catch (error) {
      next(error);
    }
  }

  public static async addSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const result = await ProfileService.addFreelancerSkill(req.user.userId, req.body);
      res.status(201).json(ApiResponse.success(result, 'Skill added to profile'));
    } catch (error) {
      next(error);
    }
  }

  public static async removeSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const result = await ProfileService.removeFreelancerSkill(
        req.user.userId,
        req.params.skillId as string
      );
      res.status(200).json(ApiResponse.success(result, 'Skill removed from profile'));
    } catch (error) {
      next(error);
    }
  }

  public static async getMeta(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const meta = await ProfileService.getSkillsAndCategories();
      res.status(200).json(ApiResponse.success(meta, 'Metadata retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}
