import prisma from '../../prisma/prisma.js';
import { logger } from '../../common/logger/logger.js';

export class ReportsService {
  async getStockValuation(filters = {}) {
    try {
      const where = {};

      if (filters.locationId) {
        where.locationId = filters.locationId;
      }

      const productLocations = await prisma.productLocation.findMany({
        where,
        include: {
          product: true,
          location: true,
        },
      });

      let totalValue = 0;
      const items = productLocations.map((pl) => {
        const itemValue = pl.quantity * (pl.product.unitPrice || 0);
        totalValue += itemValue;

        return {
          productId: pl.product.id,
          productName: pl.product.name,
          sku: pl.product.sku,
          location: pl.location.name,
          quantity: pl.quantity,
          unitPrice: pl.product.unitPrice,
          totalValue: itemValue,
        };
      });

      return {
        ok: true,
        data: {
          items,
          summary: {
            totalItems: items.length,
            totalQuantity: productLocations.reduce((sum, pl) => sum + pl.quantity, 0),
            totalValue,
          },
        },
      };
    } catch (error) {
      logger.error('Get stock valuation error', error);
      throw error;
    }
  }

  async getMovementsReport(filters = {}) {
    try {
      const where = {};

      if (filters.type) where.type = filters.type;
      if (filters.status) where.status = filters.status;
      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
        if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
      }

      const movements = await prisma.stockMovement.findMany({
        where,
        include: {
          lines: { include: { product: true } },
          fromLocation: true,
          toLocation: true,
          createdBy: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const summary = {
        total: movements.length,
        byType: {},
        byStatus: {},
      };

      movements.forEach((m) => {
        summary.byType[m.type] = (summary.byType[m.type] || 0) + 1;
        summary.byStatus[m.status] = (summary.byStatus[m.status] || 0) + 1;
      });

      return {
        ok: true,
        data: {
          movements,
          summary,
        },
      };
    } catch (error) {
      logger.error('Get movements report error', error);
      throw error;
    }
  }

  async getAbcAnalysis(filters = {}) {
    try {
      const productLocations = await prisma.productLocation.findMany({
        include: {
          product: true,
        },
      });

      const items = productLocations.map((pl) => ({
        productId: pl.product.id,
        productName: pl.product.name,
        sku: pl.product.sku,
        quantity: pl.quantity,
        unitPrice: pl.product.unitPrice || 0,
        totalValue: pl.quantity * (pl.product.unitPrice || 0),
      }));

      items.sort((a, b) => b.totalValue - a.totalValue);

      const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);

      let cumulativeValue = 0;
      const classified = items.map((item) => {
        cumulativeValue += item.totalValue;
        const percentage = (cumulativeValue / totalValue) * 100;

        let classification = 'C';
        if (percentage <= 80) classification = 'A';
        else if (percentage <= 95) classification = 'B';

        return {
          ...item,
          percentage: ((item.totalValue / totalValue) * 100).toFixed(2),
          cumulativePercentage: percentage.toFixed(2),
          classification,
        };
      });

      const summary = {
        A: classified.filter((i) => i.classification === 'A').length,
        B: classified.filter((i) => i.classification === 'B').length,
        C: classified.filter((i) => i.classification === 'C').length,
      };

      return {
        ok: true,
        data: {
          items: classified,
          summary,
        },
      };
    } catch (error) {
      logger.error('Get ABC analysis error', error);
      throw error;
    }
  }
}

export default new ReportsService();
