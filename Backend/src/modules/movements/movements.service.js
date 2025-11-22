import prisma from '../../prisma/prisma.js';
import { logger } from '../../common/logger/logger.js';
import { v4 as uuidv4 } from 'uuid';

export class MovementsService {
  async getAll(page = 1, limit = 20, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const where = {};

      if (filters.type) where.type = filters.type;
      if (filters.status) where.status = filters.status;
      if (filters.locationId) {
        where.OR = [
          { fromLocationId: filters.locationId },
          { toLocationId: filters.locationId },
        ];
      }

      const [movements, total] = await Promise.all([
        prisma.stockMovement.findMany({
          where,
          skip,
          take: limit,
          include: {
            lines: { include: { product: true } },
            fromLocation: true,
            toLocation: true,
            supplier: true,
            createdBy: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.stockMovement.count({ where }),
      ]);

      return {
        ok: true,
        data: movements,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get all movements error', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const movement = await prisma.stockMovement.findUnique({
        where: { id },
        include: {
          lines: { include: { product: true, batch: true } },
          fromLocation: true,
          toLocation: true,
          supplier: true,
          createdBy: true,
        },
      });

      if (!movement) {
        throw new Error('Movement not found');
      }

      return {
        ok: true,
        data: movement,
      };
    } catch (error) {
      logger.error('Get movement by ID error', error);
      throw error;
    }
  }

  async createReceipt(data, userId, ipAddress) {
    try {
      const referenceNo = `RCP-${Date.now()}-${uuidv4().substring(0, 8)}`;

      const movement = await prisma.stockMovement.create({
        data: {
          referenceNo,
          type: 'RECEIPT',
          status: 'DRAFT',
          toLocationId: data.toLocationId,
          supplierId: data.supplierId,
          productId: data.productId,
          createdById: userId,
          notes: data.notes,
          lines: {
            create: data.lines.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
              batchId: line.batchId,
            })),
          },
        },
        include: {
          lines: { include: { product: true } },
          toLocation: true,
          supplier: true,
        },
      });

      await this.logAudit(userId, 'StockMovement', movement.id, 'CREATE', null, movement, ipAddress);

      logger.info(`Receipt created: ${movement.referenceNo}`);

      return {
        ok: true,
        data: movement,
      };
    } catch (error) {
      logger.error('Create receipt error', error);
      throw error;
    }
  }

  async createDelivery(data, userId, ipAddress) {
    try {
      const referenceNo = `DEL-${Date.now()}-${uuidv4().substring(0, 8)}`;

      const movement = await prisma.stockMovement.create({
        data: {
          referenceNo,
          type: 'DELIVERY',
          status: 'DRAFT',
          fromLocationId: data.fromLocationId,
          productId: data.productId,
          createdById: userId,
          notes: data.notes,
          lines: {
            create: data.lines.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
              batchId: line.batchId,
            })),
          },
        },
        include: {
          lines: { include: { product: true } },
          fromLocation: true,
        },
      });

      await this.logAudit(userId, 'StockMovement', movement.id, 'CREATE', null, movement, ipAddress);

      logger.info(`Delivery created: ${movement.referenceNo}`);

      return {
        ok: true,
        data: movement,
      };
    } catch (error) {
      logger.error('Create delivery error', error);
      throw error;
    }
  }

  async createTransfer(data, userId, ipAddress) {
    try {
      const referenceNo = `TRN-${Date.now()}-${uuidv4().substring(0, 8)}`;

      const movement = await prisma.stockMovement.create({
        data: {
          referenceNo,
          type: 'TRANSFER',
          status: 'DRAFT',
          fromLocationId: data.fromLocationId,
          toLocationId: data.toLocationId,
          productId: data.productId,
          createdById: userId,
          notes: data.notes,
          lines: {
            create: data.lines.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
              batchId: line.batchId,
            })),
          },
        },
        include: {
          lines: { include: { product: true } },
          fromLocation: true,
          toLocation: true,
        },
      });

      await this.logAudit(userId, 'StockMovement', movement.id, 'CREATE', null, movement, ipAddress);

      logger.info(`Transfer created: ${movement.referenceNo}`);

      return {
        ok: true,
        data: movement,
      };
    } catch (error) {
      logger.error('Create transfer error', error);
      throw error;
    }
  }

  async createAdjustment(data, userId, ipAddress) {
    try {
      const referenceNo = `ADJ-${Date.now()}-${uuidv4().substring(0, 8)}`;

      const movement = await prisma.stockMovement.create({
        data: {
          referenceNo,
          type: 'ADJUSTMENT',
          status: 'DRAFT',
          fromLocationId: data.locationId,
          productId: data.productId,
          createdById: userId,
          notes: data.notes,
          lines: {
            create: data.lines.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
              batchId: line.batchId,
            })),
          },
        },
        include: {
          lines: { include: { product: true } },
          fromLocation: true,
        },
      });

      await this.logAudit(userId, 'StockMovement', movement.id, 'CREATE', null, movement, ipAddress);

      logger.info(`Adjustment created: ${movement.referenceNo}`);

      return {
        ok: true,
        data: movement,
      };
    } catch (error) {
      logger.error('Create adjustment error', error);
      throw error;
    }
  }

  async updateStatus(id, newStatus, userId, ipAddress) {
    try {
      const validStatuses = ['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELED'];

      if (!validStatuses.includes(newStatus)) {
        throw new Error('Invalid status');
      }

      const movement = await prisma.stockMovement.findUnique({
        where: { id },
        include: { lines: true },
      });

      if (!movement) {
        throw new Error('Movement not found');
      }

      const statusFlow = {
        DRAFT: ['WAITING', 'CANCELED'],
        WAITING: ['READY', 'CANCELED'],
        READY: ['DONE', 'CANCELED'],
        DONE: [],
        CANCELED: [],
      };

      if (!statusFlow[movement.status].includes(newStatus)) {
        throw new Error(`Cannot transition from ${movement.status} to ${newStatus}`);
      }

      let completedAt = movement.completedAt;
      if (newStatus === 'DONE') {
        completedAt = new Date();
        await this.updateStock(movement);
      }

      const updatedMovement = await prisma.stockMovement.update({
        where: { id },
        data: {
          status: newStatus,
          completedAt,
        },
        include: {
          lines: { include: { product: true } },
          fromLocation: true,
          toLocation: true,
        },
      });

      await this.logAudit(userId, 'StockMovement', id, 'UPDATE', movement, updatedMovement, ipAddress);

      logger.info(`Movement status updated: ${movement.referenceNo} -> ${newStatus}`);

      return {
        ok: true,
        data: updatedMovement,
      };
    } catch (error) {
      logger.error('Update movement status error', error);
      throw error;
    }
  }

  async confirmPick(id, pickedLines, userId, ipAddress) {
    try {
      const movement = await prisma.stockMovement.findUnique({
        where: { id },
        include: { lines: true },
      });

      if (!movement) {
        throw new Error('Movement not found');
      }

      for (const pickedLine of pickedLines) {
        await prisma.stockMovementLine.update({
          where: { id: pickedLine.lineId },
          data: {
            pickedQuantity: pickedLine.pickedQuantity,
            lineStatus: 'PICKED',
          },
        });
      }

      const updatedMovement = await prisma.stockMovement.findUnique({
        where: { id },
        include: { lines: { include: { product: true } } },
      });

      await this.logAudit(userId, 'StockMovement', id, 'UPDATE', movement, updatedMovement, ipAddress);

      logger.info(`Movement pick confirmed: ${movement.referenceNo}`);

      return {
        ok: true,
        data: updatedMovement,
      };
    } catch (error) {
      logger.error('Confirm pick error', error);
      throw error;
    }
  }

  async complete(id, userId, ipAddress) {
    try {
      const movement = await prisma.stockMovement.findUnique({
        where: { id },
        include: { lines: true },
      });

      if (!movement) {
        throw new Error('Movement not found');
      }

      for (const line of movement.lines) {
        await prisma.stockMovementLine.update({
          where: { id: line.id },
          data: { lineStatus: 'CONFIRMED' },
        });
      }

      const updatedMovement = await prisma.stockMovement.update({
        where: { id },
        data: {
          status: 'DONE',
          completedAt: new Date(),
        },
        include: { lines: { include: { product: true } } },
      });

      await this.updateStock(updatedMovement);

      await this.logAudit(userId, 'StockMovement', id, 'COMPLETE', movement, updatedMovement, ipAddress);

      logger.info(`Movement completed: ${movement.referenceNo}`);

      return {
        ok: true,
        data: updatedMovement,
      };
    } catch (error) {
      logger.error('Complete movement error', error);
      throw error;
    }
  }

  async updateStock(movement) {
    try {
      for (const line of movement.lines) {
        if (movement.type === 'RECEIPT') {
          await prisma.productLocation.upsert({
            where: {
              productId_locationId: {
                productId: line.productId,
                locationId: movement.toLocationId,
              },
            },
            create: {
              productId: line.productId,
              locationId: movement.toLocationId,
              quantity: line.quantity,
            },
            update: {
              quantity: {
                increment: line.quantity,
              },
            },
          });
        } else if (movement.type === 'DELIVERY') {
          await prisma.productLocation.update({
            where: {
              productId_locationId: {
                productId: line.productId,
                locationId: movement.fromLocationId,
              },
            },
            data: {
              quantity: {
                decrement: line.quantity,
              },
            },
          });
        } else if (movement.type === 'TRANSFER') {
          await prisma.productLocation.update({
            where: {
              productId_locationId: {
                productId: line.productId,
                locationId: movement.fromLocationId,
              },
            },
            data: {
              quantity: {
                decrement: line.quantity,
              },
            },
          });

          await prisma.productLocation.upsert({
            where: {
              productId_locationId: {
                productId: line.productId,
                locationId: movement.toLocationId,
              },
            },
            create: {
              productId: line.productId,
              locationId: movement.toLocationId,
              quantity: line.quantity,
            },
            update: {
              quantity: {
                increment: line.quantity,
              },
            },
          });
        } else if (movement.type === 'ADJUSTMENT') {
          await prisma.productLocation.upsert({
            where: {
              productId_locationId: {
                productId: line.productId,
                locationId: movement.fromLocationId,
              },
            },
            create: {
              productId: line.productId,
              locationId: movement.fromLocationId,
              quantity: line.quantity,
            },
            update: {
              quantity: line.quantity,
            },
          });
        }
      }
    } catch (error) {
      logger.error('Update stock error', error);
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

export default new MovementsService();
