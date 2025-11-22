import prisma from '../../prisma/prisma.js';
import { logger } from '../../common/logger/logger.js';
import { v4 as uuidv4 } from 'uuid';

export class CountsService {
  async getAll(page = 1, limit = 20, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const where = {};

      if (filters.status) where.status = filters.status;
      if (filters.locationId) where.locationId = filters.locationId;

      const [counts, total] = await Promise.all([
        prisma.inventoryCount.findMany({
          where,
          skip,
          take: limit,
          include: {
            location: true,
            lines: { include: { product: true } },
            assignedTo: true,
            createdBy: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.inventoryCount.count({ where }),
      ]);

      return {
        ok: true,
        data: counts,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get all counts error', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const count = await prisma.inventoryCount.findUnique({
        where: { id },
        include: {
          location: true,
          lines: { include: { product: true } },
          assignedTo: true,
          createdBy: true,
        },
      });

      if (!count) {
        throw new Error('Count not found');
      }

      return {
        ok: true,
        data: count,
      };
    } catch (error) {
      logger.error('Get count by ID error', error);
      throw error;
    }
  }

  async create(data, userId, ipAddress) {
    try {
      const referenceNo = `CNT-${Date.now()}-${uuidv4().substring(0, 8)}`;

      const count = await prisma.inventoryCount.create({
        data: {
          referenceNo,
          locationId: data.locationId,
          status: 'DRAFT',
          createdById: userId,
          assignedToId: data.assignedToId,
          notes: data.notes,
          lines: {
            create: data.lines?.map((line) => ({
              productId: line.productId,
              expectedQuantity: line.expectedQuantity || 0,
            })) || [],
          },
        },
        include: {
          location: true,
          lines: { include: { product: true } },
          assignedTo: true,
          createdBy: true,
        },
      });

      await this.logAudit(userId, 'InventoryCount', count.id, 'CREATE', null, count, ipAddress);

      logger.info(`Count created: ${count.referenceNo}`);

      return {
        ok: true,
        data: count,
      };
    } catch (error) {
      logger.error('Create count error', error);
      throw error;
    }
  }

  async updateLine(countId, lineId, countedQuantity, userId, ipAddress) {
    try {
      const count = await prisma.inventoryCount.findUnique({
        where: { id: countId },
        include: { lines: true },
      });

      if (!count) {
        throw new Error('Count not found');
      }

      const line = count.lines.find((l) => l.id === lineId);
      if (!line) {
        throw new Error('Line not found');
      }

      const variance = countedQuantity - line.expectedQuantity;

      const updatedLine = await prisma.inventoryCountLine.update({
        where: { id: lineId },
        data: {
          countedQuantity,
          variance,
          status: 'COUNTED',
        },
        include: { product: true },
      });

      await this.logAudit(userId, 'InventoryCountLine', lineId, 'UPDATE', line, updatedLine, ipAddress);

      logger.info(`Count line updated: ${countId}`);

      return {
        ok: true,
        data: updatedLine,
      };
    } catch (error) {
      logger.error('Update count line error', error);
      throw error;
    }
  }

  async reconcile(countId, userId, ipAddress) {
    try {
      const count = await prisma.inventoryCount.findUnique({
        where: { id: countId },
        include: { lines: { include: { product: true } }, location: true },
      });

      if (!count) {
        throw new Error('Count not found');
      }

      let totalVariance = 0;
      const adjustments = [];

      for (const line of count.lines) {
        if (line.variance !== 0) {
          totalVariance += Math.abs(line.variance);

          const productLocation = await prisma.productLocation.findUnique({
            where: {
              productId_locationId: {
                productId: line.productId,
                locationId: count.locationId,
              },
            },
          });

          if (productLocation) {
            await prisma.productLocation.update({
              where: {
                productId_locationId: {
                  productId: line.productId,
                  locationId: count.locationId,
                },
              },
              data: {
                quantity: line.countedQuantity,
              },
            });

            adjustments.push({
              productId: line.productId,
              variance: line.variance,
            });
          }
        }
      }

      const updatedCount = await prisma.inventoryCount.update({
        where: { id: countId },
        data: {
          status: 'RECONCILED',
          totalVariance,
          reconciledAt: new Date(),
        },
        include: {
          location: true,
          lines: { include: { product: true } },
          assignedTo: true,
          createdBy: true,
        },
      });

      await this.logAudit(userId, 'InventoryCount', countId, 'COMPLETE', count, updatedCount, ipAddress);

      logger.info(`Count reconciled: ${count.referenceNo}`);

      return {
        ok: true,
        data: {
          count: updatedCount,
          adjustments,
        },
      };
    } catch (error) {
      logger.error('Reconcile count error', error);
      throw error;
    }
  }

  async logAudit(userId, entity, entityId, action, before, after, ipAddress) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          entity,
          entityId,
          action,
          before,
          after,
          ipAddress,
        },
      });
    } catch (error) {
      logger.error('Audit log error', error);
    }
  }
}

export default new CountsService();
