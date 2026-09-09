import { ChatService } from '../services/chatService.js';
import { ApiResponse } from '../utils/api-response.js';

export class ChatController {
  static async getConversations(req, res, next) {
    try {
      const conversations = await ChatService.getUserConversations(req.user.id);
      return ApiResponse.success(res, conversations, 'Conversations retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getMessages(req, res, next) {
    try {
      const messages = await ChatService.getMessages(req.params.conversationId, req.user.id, req.query);
      return ApiResponse.success(res, messages, 'Messages retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async sendMessage(req, res, next) {
    try {
      const fileUrl = req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl;
      const message = await ChatService.sendMessage(req.user.id, {
        conversationId: req.body.conversationId,
        recipientId: req.body.recipientId,
        content: req.body.content,
        fileUrl
      });
      return ApiResponse.created(res, message, 'Message sent successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getOrCreateConversation(req, res, next) {
    try {
      const conversation = await ChatService.getOrCreateConversation(req.user.id, req.params.recipientId);
      return ApiResponse.success(res, conversation, 'Conversation initialized');
    } catch (error) {
      next(error);
    }
  }
}
