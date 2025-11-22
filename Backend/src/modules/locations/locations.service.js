import prisma from '../../prisma/prisma.js';
import { logger } from '../../common/logger/logger.js';

export class LocationsService {
  async getAll(page = 1, limit = 20, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const where = {};

      if (filters.type) where.type = filters.type;
      if (filters.isActive !== undefined) where.isActive = filters.isActive;

      const [locations, total] = await Promise.all([
        prisma.location.findMany({
          where,
          skip,
          take: limit,
          include: { products: true },
        }),
        prisma.location.count({ where }),
      ]);

      return {
        ok: true,
        data: locations,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get all locations error', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const location = await prisma.location.findUnique({
        where: { id },
        include: { products: { include: { product: true } } },
      });

      if (!location) {
        throw new Error('Location not found');
      }

      return {
        ok: true,
        data: location,
      };
    } catch (error) {
      logger.error('Get location by ID error', error);
      throw error;
    }
  }

  async create(data, userId, ipAddress) {
    try {
      const existingCode = await prisma.location.findUnique({
        where: { code: data.code },
      });

      if (existingCode) {
        throw new Error('Location code already exists');
      }

      const location = await prisma.location.create({
        data: {
          code: data.code,
          name: data.name,
          type: data.type,
          address: data.address,
          capacity: data.capacity,
        },
      });

      await this.logAudit(userId, 'Location', location.id, 'CREATE', null, location, ipAddress);

      logger.info(`Location created: ${location.code}`);

      return {
        ok: true,
        data: location,
      };
    } catch (error) {
      logger.error('Create location error', error);
      throw error;
    }
  }

  async update(id, data, userId, ipAddress) {
    try {
      const location = await prisma.location.findUnique({ where: { id } });

      if (!location) {
        throw new Error('Location not found');
      }

      if (data.code && data.code !== location.code) {
        const existingCode = await prisma.location.findUnique({
          where: { code: data.code },
        });

        if (existingCode) {
          throw new Error('Location code already exists');
        }
      }

      const updatedLocation = await prisma.location.update({
        where: { id },
        data,
      });

      await this.logAudit(userId, 'Location', id, 'UPDATE', location, updatedLocation, ipAddress);

      logger.info(`Location updated: ${updatedLocation.code}`);

      return {
        ok: true,
        data: updatedLocation,
      };
    } catch (error) {
      logger.error('Update location error', error);
      throw error;
    }
  }

  async delete(id, userId, ipAddress) {
    try {
      const location = await prisma.location.findUnique({ where: { id } });

      if (!location) {
        throw new Error('Location not found');
      }

      await prisma.location.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      await this.logAudit(userId, 'Location', id, 'DELETE', location, null, ipAddress);

      logger.info(`Location deleted: ${location.code}`);

      return {
        ok: true,
        data: { message: 'Location deleted successfully' },
      };
    } catch (error) {
      logger.error('Delete location error', error);
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

export default new LocationsService();
