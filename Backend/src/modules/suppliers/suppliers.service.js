import prisma from '../../prisma/prisma.js';
import { logger } from '../../common/logger/logger.js';

export class SuppliersService {
  async getAll(page = 1, limit = 20, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const where = {};

      if (filters.isActive !== undefined) where.isActive = filters.isActive;
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const [suppliers, total] = await Promise.all([
        prisma.supplier.findMany({
          where,
          skip,
          take: limit,
          include: { movements: true },
        }),
        prisma.supplier.count({ where }),
      ]);

      return {
        ok: true,
        data: suppliers,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get all suppliers error', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const supplier = await prisma.supplier.findUnique({
        where: { id },
        include: { movements: true },
      });

      if (!supplier) {
        throw new Error('Supplier not found');
      }

      return {
        ok: true,
        data: supplier,
      };
    } catch (error) {
      logger.error('Get supplier by ID error', error);
      throw error;
    }
  }

  async create(data, userId, ipAddress) {
    try {
      const supplier = await prisma.supplier.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          zipCode: data.zipCode,
        },
      });

      await this.logAudit(userId, 'Supplier', supplier.id, 'CREATE', null, supplier, ipAddress);

      logger.info(`Supplier created: ${supplier.name}`);

      return {
        ok: true,
        data: supplier,
      };
    } catch (error) {
      logger.error('Create supplier error', error);
      throw error;
    }
  }

  async update(id, data, userId, ipAddress) {
    try {
      const supplier = await prisma.supplier.findUnique({ where: { id } });

      if (!supplier) {
        throw new Error('Supplier not found');
      }

      const updatedSupplier = await prisma.supplier.update({
        where: { id },
        data,
      });

      await this.logAudit(userId, 'Supplier', id, 'UPDATE', supplier, updatedSupplier, ipAddress);

      logger.info(`Supplier updated: ${updatedSupplier.name}`);

      return {
        ok: true,
        data: updatedSupplier,
      };
    } catch (error) {
      logger.error('Update supplier error', error);
      throw error;
    }
  }

  async delete(id, userId, ipAddress) {
    try {
      const supplier = await prisma.supplier.findUnique({ where: { id } });

      if (!supplier) {
        throw new Error('Supplier not found');
      }

      await prisma.supplier.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      await this.logAudit(userId, 'Supplier', id, 'DELETE', supplier, null, ipAddress);

      logger.info(`Supplier deleted: ${supplier.name}`);

      return {
        ok: true,
        data: { message: 'Supplier deleted successfully' },
      };
    } catch (error) {
      logger.error('Delete supplier error', error);
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

export default new SuppliersService();
