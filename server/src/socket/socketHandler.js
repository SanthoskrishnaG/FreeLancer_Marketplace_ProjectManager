import jwt from 'jsonwebtoken';
import { env } from '../config/env.config.js';
import prisma from '../config/database.js';

// Map of userId -> Set of socketIds
const onlineUsers = new Map();

export const setupSocketIO = (io) => {
  // Authentication middleware for Socket.IO
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Invalid or expired socket token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;

    // Track user socket
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join personal user notification room
    socket.join(`user:${userId}`);

    // Broadcast user online status
    io.emit('user_online', { userId, status: 'ONLINE' });

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Handle typing indicators
    socket.on('typing_start', ({ conversationId, recipientId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing_start', {
        conversationId,
        senderId: userId
      });
    });

    socket.on('typing_stop', ({ conversationId, recipientId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing_stop', {
        conversationId,
        senderId: userId
      });
    });

    // Realtime message dispatch
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, recipientId, content, fileUrl } = data;

        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: userId,
            recipientId,
            content,
            fileUrl
          },
          include: {
            sender: { select: { id: true, name: true, avatar: true } }
          }
        });

        // Update conversation's updatedAt
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() }
        });

        // Emit to the conversation room
        io.to(`conversation:${conversationId}`).emit('new_message', message);

        // Emit notification to recipient's private room
        io.to(`user:${recipientId}`).emit('chat_notification', {
          conversationId,
          message
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to dispatch message' });
      }
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('user_offline', { userId, status: 'OFFLINE' });
        }
      }
    });
  });

  return {
    io,
    isUserOnline: (userId) => onlineUsers.has(userId) && onlineUsers.get(userId).size > 0,
    sendNotificationToUser: (userId, notification) => {
      io.to(`user:${userId}`).emit('notification', notification);
    }
  };
};
