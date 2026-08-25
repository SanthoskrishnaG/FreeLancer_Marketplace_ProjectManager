import { Request, Response, NextFunction } from 'express';
import { ChatService } from '../services/chat.service.js';
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';

export class ChatController {
  public static async getConversations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const conversations = await ChatService.getUserConversations(req.user.userId);
      res.status(200).json(ApiResponse.success(conversations, 'Conversations retrieved'));
    } catch (error) {
      next(error);
    }
  }

  public static async startConversation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const { recipientId, contractId, projectId } = req.body;
      if (!recipientId) {
        throw ApiError.badRequest('recipientId is required');
      }

      const conversation = await ChatService.getOrCreateConversation(
        req.user.userId,
        recipientId,
        contractId,
        projectId
      );
      res.status(200).json(ApiResponse.success(conversation, 'Conversation ready'));
    } catch (error) {
      next(error);
    }
  }

  public static async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const result = await ChatService.getConversationMessages(
        req.user.userId,
        req.params.id as string,
        req.query.page as string,
        req.query.limit as string
      );
      res.status(200).json(ApiResponse.success(result, 'Messages retrieved'));
    } catch (error) {
      next(error);
    }
  }

  public static async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const message = await ChatService.sendMessage({
        userId: req.user.userId,
        conversationId: req.params.id as string,
        content: req.body.content,
        fileIds: req.body.fileIds,
      });
      res.status(201).json(ApiResponse.success(message, 'Message sent successfully'));
    } catch (error) {
      next(error);
    }
  }

  public static async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const result = await ChatService.markAsRead(req.user.userId, req.params.id as string);
      res.status(200).json(ApiResponse.success(result, 'Conversation marked as read'));
    } catch (error) {
      next(error);
    }
  }
}
