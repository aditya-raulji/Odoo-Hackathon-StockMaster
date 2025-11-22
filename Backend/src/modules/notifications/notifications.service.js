import prisma from '../../prisma/prisma.js';
import { logger } from '../../common/logger/logger.js';

export class NotificationsService {
  async getAll(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.notification.count({ where: { userId } }),
      ]);

      return {
        ok: true,
        data: notifications,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get notifications error', error);
      throw error;
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      if (notification.userId !== userId) {
        throw new Error('Unauthorized');
      }

      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true, readAt: new Date() },
      });

      return {
        ok: true,
        data: updated,
      };
    } catch (error) {
      logger.error('Mark notification as read error', error);
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });

      return {
        ok: true,
        data: { message: 'All notifications marked as read' },
      };
    } catch (error) {
      logger.error('Mark all notifications as read error', error);
      throw error;
    }
  }

  async createNotification(userId, type, title, message, data = null) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          data,
        },
      });

      return notification;
    } catch (error) {
      logger.error('Create notification error', error);
      throw error;
    }
  }

  async notifyLowStock(productId, locationId, currentQuantity, minLevel) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      const users = await prisma.user.findMany({
        where: { role: { in: ['INVENTORY_MANAGER', 'STOCKMASTER'] } },
      });

      for (const user of users) {
        await this.createNotification(
          user.id,
          'LOW_STOCK',
          'Low Stock Alert',
          `${product.name} is below minimum level (${currentQuantity}/${minLevel})`,
          { productId, locationId, currentQuantity, minLevel },
        );
      }
    } catch (error) {
      logger.error('Notify low stock error', error);
    }
  }

  async notifyMovementStatusChange(movementId, newStatus, userId) {
    try {
      const movement = await prisma.stockMovement.findUnique({
        where: { id: movementId },
      });

      const users = await prisma.user.findMany({
        where: { role: { in: ['INVENTORY_MANAGER', 'WAREHOUSE_STAFF', 'STOCKMASTER'] } },
      });

      for (const user of users) {
        await this.createNotification(
          user.id,
          'MOVEMENT_STATUS',
          'Movement Status Updated',
          `Movement ${movement.referenceNo} status changed to ${newStatus}`,
          { movementId, newStatus },
        );
      }
    } catch (error) {
      logger.error('Notify movement status change error', error);
    }
  }
}

export default new NotificationsService();
