import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.util.js';
import { ChatService } from '../services/chat.service.js';
import { logger } from '../utils/logger.js';

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export class SocketServer {
  private static io: Server | null = null;
  private static onlineUsers = new Map<string, Set<string>>(); // userId -> Set of socketIds

  public static initialize(httpServer: HttpServer): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
        credentials: true,
      },
    });

    // JWT Authentication Middleware for Socket.IO
    this.io.use((socket: AuthenticatedSocket, next) => {
      try {
        const token =
          socket.handshake.auth?.token ||
          socket.handshake.headers?.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = verifyAccessToken(token);
        socket.user = decoded;
        next();
      } catch (err) {
        next(new Error('Invalid authentication token'));
      }
    });

    // Connection Handler
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      const user = socket.user;
      if (!user) return;

      const userId = user.userId;
      logger.info(`🔌 Socket connected: ${userId} (${socket.id})`);

      // Track online user
      if (!this.onlineUsers.has(userId)) {
        this.onlineUsers.set(userId, new Set());
      }
      this.onlineUsers.get(userId)!.add(socket.id);

      // Join user personal room
      socket.join(`user:${userId}`);

      // Broadcast online status
      this.io?.emit('user_online', { userId });

      // Join conversation room
      socket.on('join_conversation', (conversationId: string) => {
        socket.join(`conversation:${conversationId}`);
        logger.info(`User ${userId} joined room: conversation:${conversationId}`);
      });

      // Leave conversation room
      socket.on('leave_conversation', (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
        logger.info(`User ${userId} left room: conversation:${conversationId}`);
      });

      // Real-time message sending
      socket.on(
        'send_message',
        async (payload: { conversationId: string; content: string; fileIds?: string[] }) => {
          try {
            const { conversationId, content, fileIds } = payload;
            if (!content && (!fileIds || fileIds.length === 0)) return;

            const message = await ChatService.sendMessage({
              userId,
              conversationId,
              content,
              fileIds,
            });

            // Emit to everyone in the conversation room
            this.io?.to(`conversation:${conversationId}`).emit('receive_message', message);
          } catch (err: any) {
            socket.emit('error', { message: err.message || 'Failed to send message' });
          }
        }
      );

      // Typing indicators
      socket.on('typing_start', ({ conversationId }: { conversationId: string }) => {
        socket.to(`conversation:${conversationId}`).emit('typing_start', {
          conversationId,
          userId,
        });
      });

      socket.on('typing_stop', ({ conversationId }: { conversationId: string }) => {
        socket.to(`conversation:${conversationId}`).emit('typing_stop', {
          conversationId,
          userId,
        });
      });

      // Mark read
      socket.on('mark_read', async ({ conversationId }: { conversationId: string }) => {
        try {
          await ChatService.markAsRead(userId, conversationId);
          socket.to(`conversation:${conversationId}`).emit('conversation_read', {
            conversationId,
            userId,
          });
        } catch {
          // Ignored
        }
      });

      // Disconnect
      socket.on('disconnect', () => {
        logger.info(`🔌 Socket disconnected: ${userId} (${socket.id})`);
        const userSockets = this.onlineUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            this.onlineUsers.delete(userId);
            this.io?.emit('user_offline', { userId });
          }
        }
      });
    });

    return this.io;
  }

  public static getIO(): Server {
    if (!this.io) {
      throw new Error('Socket.IO is not initialized!');
    }
    return this.io;
  }

  public static isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId) && (this.onlineUsers.get(userId)?.size || 0) > 0;
  }
}
