import prisma from '../../prisma/prisma.js';

export class DashboardService {
  /**
   * Get dashboard KPIs
   */
  async getKPIs() {
    try {
      // Total products
      const totalProducts = await prisma.product.count({
        where: { isActive: true, deletedAt: null }
      });

      // Low stock items (below reorder point)
      const lowStockItems = await prisma.productLocation.count({
        where: {
          AND: [
            { quantity: { gt: 0 } },
            { quantity: { lt: 100 } } // Simple threshold
          ]
        }
      });

      // Out of stock items
      const outOfStockItems = await prisma.productLocation.count({
        where: { quantity: 0 }
      });

      // Pending receipts
      const pendingReceipts = await prisma.stockMovement.count({
        where: {
          type: 'RECEIPT',
          status: { in: ['DRAFT', 'WAITING'] }
        }
      });

      // Pending deliveries
      const pendingDeliveries = await prisma.stockMovement.count({
        where: {
          type: 'DELIVERY',
          status: { in: ['DRAFT', 'READY'] }
        }
      });

      // Internal transfers in queue
      const internalTransfers = await prisma.stockMovement.count({
        where: {
          type: 'TRANSFER',
          status: { in: ['DRAFT', 'WAITING'] }
        }
      });

      return {
        totalProducts,
        lowStockItems,
        outOfStockItems,
        pendingReceipts,
        pendingDeliveries,
        internalTransfers
      };
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      throw error;
    }
  }

  /**
   * Get recent stock movements
   */
  async getRecentMovements(limit = 10) {
    try {
      const movements = await prisma.stockMovement.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          lines: {
            include: { product: true }
          }
        }
      });

      return movements.map(m => ({
        id: m.id,
        refNo: m.referenceNo,
        type: m.type.toLowerCase(),
        status: m.status.toLowerCase(),
        date: m.createdAt,
        items: m.lines.length,
        createdBy: m.createdBy,
        lines: m.lines
      }));
    } catch (error) {
      console.error('Error fetching recent movements:', error);
      throw error;
    }
  }

  /**
   * Get stock levels by location
   */
  async getStockByLocation() {
    try {
      const locations = await prisma.location.findMany({
        where: { isActive: true, deletedAt: null },
        include: {
          products: {
            include: { product: true }
          }
        }
      });

      return locations.map(loc => ({
        id: loc.id,
        name: loc.name,
        code: loc.code,
        type: loc.type,
        totalItems: loc.products.reduce((sum, p) => sum + p.quantity, 0),
        itemCount: loc.products.length,
        products: loc.products
      }));
    } catch (error) {
      console.error('Error fetching stock by location:', error);
      throw error;
    }
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts() {
    try {
      const alerts = await prisma.productLocation.findMany({
        where: {
          quantity: {
            lte: 100  // Simple threshold for low stock
          }
        },
        include: {
          product: true,
          location: true
        },
        orderBy: { quantity: 'asc' },
        take: 20
      });

      return alerts.map(a => ({
        id: a.id,
        product: a.product,
        location: a.location,
        currentQuantity: a.quantity,
        reorderPoint: a.product.reorderPoint,
        minLevel: a.product.minStockLevel,
        variance: a.product.reorderPoint - a.quantity
      }));
    } catch (error) {
      console.error('Error fetching low stock alerts:', error);
      throw error;
    }
  }

  /**
   * Get pending operations summary
   */
  async getPendingOperations() {
    try {
      const pendingReceipts = await prisma.stockMovement.findMany({
        where: {
          type: 'RECEIPT',
          status: { in: ['DRAFT', 'WAITING'] }
        },
        include: { lines: true, createdBy: { select: { firstName: true, lastName: true } } },
        take: 5
      });

      const pendingDeliveries = await prisma.stockMovement.findMany({
        where: {
          type: 'DELIVERY',
          status: { in: ['DRAFT', 'READY'] }
        },
        include: { lines: true, createdBy: { select: { firstName: true, lastName: true } } },
        take: 5
      });

      const pendingTransfers = await prisma.stockMovement.findMany({
        where: {
          type: 'TRANSFER',
          status: { in: ['DRAFT', 'WAITING'] }
        },
        include: { lines: true, createdBy: { select: { firstName: true, lastName: true } } },
        take: 5
      });

      return {
        receipts: pendingReceipts,
        deliveries: pendingDeliveries,
        transfers: pendingTransfers
      };
    } catch (error) {
      console.error('Error fetching pending operations:', error);
      throw error;
    }
  }
}

export default new DashboardService();
