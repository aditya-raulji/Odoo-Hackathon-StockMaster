import express from 'express';
import { authMiddleware } from '../../common/middleware/auth.js';
import dashboardService from './dashboard.service.js';

const router = express.Router();

/**
 * GET /dashboard/kpis
 * Get dashboard KPIs
 */
router.get('/kpis', authMiddleware, async (req, res, next) => {
  try {
    const kpis = await dashboardService.getKPIs();
    res.json({ ok: true, data: kpis });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /dashboard/recent-movements
 * Get recent stock movements
 */
router.get('/recent-movements', authMiddleware, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const movements = await dashboardService.getRecentMovements(limit);
    res.json({ ok: true, data: movements });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /dashboard/stock-by-location
 * Get stock levels by location
 */
router.get('/stock-by-location', authMiddleware, async (req, res, next) => {
  try {
    const stock = await dashboardService.getStockByLocation();
    res.json({ ok: true, data: stock });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /dashboard/low-stock-alerts
 * Get low stock alerts
 */
router.get('/low-stock-alerts', authMiddleware, async (req, res, next) => {
  try {
    const alerts = await dashboardService.getLowStockAlerts();
    res.json({ ok: true, data: alerts });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /dashboard/pending-operations
 * Get pending operations summary
 */
router.get('/pending-operations', authMiddleware, async (req, res, next) => {
  try {
    const operations = await dashboardService.getPendingOperations();
    res.json({ ok: true, data: operations });
  } catch (error) {
    next(error);
  }
});

export default router;
