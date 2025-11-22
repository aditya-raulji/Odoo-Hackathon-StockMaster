import prisma from '../../prisma/prisma.js';
import { logger } from '../../common/logger/logger.js';
import bcrypt from 'bcryptjs';

export class StaffService {
  async getAll(page = 1, limit = 20, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const where = {};

      if (filters.role) where.role = filters.role;
      if (filters.isActive !== undefined) where.isActive = filters.isActive;

      const [staff, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        ok: true,
        data: staff,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get all staff error', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new Error('Staff member not found');
      }

      return {
        ok: true,
        data: user,
      };
    } catch (error) {
      logger.error('Get staff by ID error', error);
      throw error;
    }
  }

  async create(data, userId, ipAddress) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error('Email already registered');
      }

      const passwordHash = await bcrypt.hash(data.password, 10);

      const user = await prisma.user.create({
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          passwordHash,
          role: data.role || 'WAREHOUSE_STAFF',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      await this.logAudit(userId, 'User', user.id, 'CREATE', null, user, ipAddress);

      logger.info(`Staff member created: ${user.email}`);

      return {
        ok: true,
        data: user,
      };
    } catch (error) {
      logger.error('Create staff error', error);
      throw error;
    }
  }

  async update(id, data, userId, ipAddress) {
    try {
      const user = await prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new Error('Staff member not found');
      }

      const updateData = { ...data };
      if (data.password) {
        updateData.passwordHash = await bcrypt.hash(data.password, 10);
        delete updateData.password;
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      await this.logAudit(userId, 'User', id, 'UPDATE', user, updatedUser, ipAddress);

      logger.info(`Staff member updated: ${updatedUser.email}`);

      return {
        ok: true,
        data: updatedUser,
      };
    } catch (error) {
      logger.error('Update staff error', error);
      throw error;
    }
  }

  async updateRole(id, newRole, userId, ipAddress) {
    try {
      if (userId !== 'STOCKMASTER' && userId !== 'ADMIN') {
        throw new Error('Only StockMaster can update roles');
      }

      const user = await prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new Error('Staff member not found');
      }

      const validRoles = ['STOCKMASTER', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'];
      if (!validRoles.includes(newRole)) {
        throw new Error('Invalid role');
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role: newRole },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      await this.logAudit(userId, 'User', id, 'UPDATE', user, updatedUser, ipAddress);

      logger.info(`Staff role updated: ${updatedUser.email} -> ${newRole}`);

      return {
        ok: true,
        data: updatedUser,
      };
    } catch (error) {
      logger.error('Update staff role error', error);
      throw error;
    }
  }

  async delete(id, userId, ipAddress) {
    try {
      const user = await prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new Error('Staff member not found');
      }

      await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      await this.logAudit(userId, 'User', id, 'DELETE', user, null, ipAddress);

      logger.info(`Staff member deleted: ${user.email}`);

      return {
        ok: true,
        data: { message: 'Staff member deleted successfully' },
      };
    } catch (error) {
      logger.error('Delete staff error', error);
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

export default new StaffService();
