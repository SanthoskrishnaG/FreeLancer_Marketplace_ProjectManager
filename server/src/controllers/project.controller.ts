import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service.js';
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';
import { UserRole } from '@prisma/client';

export class ProjectController {
  public static async createProject(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      if (req.user.role !== UserRole.CLIENT && req.user.role !== UserRole.ADMIN) {
        throw ApiError.forbidden('Only clients can post new projects');
      }

      const project = await ProjectService.createProject(req.user.userId, req.body);
      res.status(201).json(ApiResponse.success(project, 'Project created successfully'));
    } catch (error) {
      next(error);
    }
  }

  public static async updateProject(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const updated = await ProjectService.updateProject(
        req.user.userId,
        req.params.id as string,
        req.body
      );
      res.status(200).json(ApiResponse.success(updated, 'Project updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  public static async deleteDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const result = await ProjectService.deleteDraftProject(
        req.user.userId,
        req.params.id as string
      );
      res.status(200).json(ApiResponse.success(result, 'Project draft deleted'));
    } catch (error) {
      next(error);
    }
  }

  public static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const updated = await ProjectService.updateProjectStatus(
        req.user.userId,
        req.params.id as string,
        req.body.status
      );
      res
        .status(200)
        .json(ApiResponse.success(updated, `Project status changed to ${req.body.status}`));
    } catch (error) {
      next(error);
    }
  }

  public static async getMyProjects(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const status = req.query.status as any;
      const projects = await ProjectService.getClientProjects(req.user.userId, status);
      res.status(200).json(ApiResponse.success(projects, 'Client projects retrieved'));
    } catch (error) {
      next(error);
    }
  }

  public static async getPublicProjects(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const currentUserId = req.user?.userId;
      const result = await ProjectService.getPublicMarketplaceProjects({
        ...(req.query as any),
        currentUserId,
      });
      res.status(200).json(ApiResponse.success(result, 'Marketplace projects retrieved'));
    } catch (error) {
      next(error);
    }
  }

  public static async getProjectById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const currentUserId = req.user?.userId;
      const project = await ProjectService.getProjectDetails(
        req.params.id as string,
        currentUserId
      );
      res.status(200).json(ApiResponse.success(project, 'Project details retrieved'));
    } catch (error) {
      next(error);
    }
  }

  public static async toggleBookmark(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const result = await ProjectService.toggleProjectBookmark(
        req.user.userId,
        req.params.id as string
      );
      res
        .status(200)
        .json(
          ApiResponse.success(
            result,
            result.isBookmarked ? 'Project bookmarked' : 'Bookmark removed'
          )
        );
    } catch (error) {
      next(error);
    }
  }

  public static async getBookmarks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const bookmarks = await ProjectService.getUserBookmarks(req.user.userId);
      res.status(200).json(ApiResponse.success(bookmarks, 'User bookmarks retrieved'));
    } catch (error) {
      next(error);
    }
  }

  public static async generateMilestones(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const suggestions = await ProjectService.generateMilestonesForProject(
        req.user.userId,
        req.params.id as string,
        req.body.customPrompt
      );
      res.status(200).json(ApiResponse.success(suggestions, 'Milestones generated successfully'));
    } catch (error) {
      next(error);
    }
  }

  public static async saveBatchMilestones(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const project = await ProjectService.saveBatchMilestones(
        req.user.userId,
        req.params.id as string,
        req.body.milestones
      );
      res.status(200).json(ApiResponse.success(project, 'Project milestones saved successfully'));
    } catch (error) {
      next(error);
    }
  }
}
