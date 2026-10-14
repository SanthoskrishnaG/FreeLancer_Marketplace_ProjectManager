import { prisma } from '../config/database.js';

export class NotificationService {
  static async getNotifications(userId) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  static async getUserNotifications(userId, query = {}) {
    return this.getNotifications(userId);
  }

  static async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  static async markAsRead(arg1, arg2) {
    // Support both (id, userId) and (userId, id)
    return prisma.notification.updateMany({
      where: {
        OR: [
          { id: arg1, userId: arg2 },
          { id: arg2, userId: arg1 },
        ],
      },
      data: { isRead: true },
    });
  }
}
