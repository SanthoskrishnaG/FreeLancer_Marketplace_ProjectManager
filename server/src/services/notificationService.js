import { prisma } from '../config/database.js';

export class NotificationService {
  static async getNotifications(userId) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  static async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  static async markAsRead(userId, id) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }
}
