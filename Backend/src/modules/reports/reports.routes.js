import express from 'express';
import reportsService from './reports.service.js';
import { authMiddleware, rolesMiddleware } from '../../common/middleware/auth.js';
import { logger } from '../../common/logger/logger.js';

const router = express.Router();

router.get('/stock-val', authMiddleware, rolesMiddleware('INVENTORY_MANAGER', 'STOCKMASTER'), async (req, res) => {
  try {
    const filters = {
      locationId: req.query.locationId,
    };

    const result = await reportsService.getStockValuation(filters);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Get stock valuation error', error);
    res.status(400).json({
      ok: false,
      error: { code: 400, message: error.message },
    });
  }
});

router.get('/movements', authMiddleware, rolesMiddleware('INVENTORY_MANAGER', 'STOCKMASTER'), async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const result = await reportsService.getMovementsReport(filters);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Get movements report error', error);
    res.status(400).json({
      ok: false,
      error: { code: 400, message: error.message },
    });
  }
});

router.get('/abc-analysis', authMiddleware, rolesMiddleware('INVENTORY_MANAGER', 'STOCKMASTER'), async (req, res) => {
  try {
    const filters = {};

    const result = await reportsService.getAbcAnalysis(filters);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Get ABC analysis error', error);
    res.status(400).json({
      ok: false,
      error: { code: 400, message: error.message },
    });
  }
});

export default router;
