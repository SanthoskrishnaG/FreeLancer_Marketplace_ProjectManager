import { Request, Response, NextFunction } from 'express';
import { StorageService } from '../services/storage.service.js';
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';

export class FileController {
  public static async uploadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      if (!req.file) {
        throw ApiError.badRequest('No file uploaded');
      }

      const fileRecord = await StorageService.uploadFile({
        uploaderId: req.user.userId,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer,
        entityType: req.body.entityType,
        entityId: req.body.entityId,
        milestoneSubmissionId: req.body.milestoneSubmissionId,
        messageId: req.body.messageId,
      });

      res.status(201).json(ApiResponse.success(fileRecord, 'File uploaded successfully'));
    } catch (error) {
      next(error);
    }
  }

  public static async getFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = await StorageService.getFileById(req.params.id as string);
      res.status(200).json(ApiResponse.success(file, 'File metadata retrieved'));
    } catch (error) {
      next(error);
    }
  }

  public static async deleteFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      await StorageService.deleteFile(req.params.id as string, req.user.userId);
      res.status(200).json(ApiResponse.success({ success: true }, 'File deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}
