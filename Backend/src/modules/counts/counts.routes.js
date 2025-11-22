import express from 'express';
import countsService from './counts.service.js';
import { authMiddleware, rolesMiddleware } from '../../common/middleware/auth.js';
import { logger } from '../../common/logger/logger.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      status: req.query.status,
      locationId: req.query.locationId,
    };

    const result = await countsService.getAll(page, limit, filters);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Get counts error', error);
    res.status(400).json({
      ok: false,
      error: { code: 400, message: error.message },
    });
  }
});

router.post('/', authMiddleware, rolesMiddleware('INVENTORY_MANAGER', 'STOCKMASTER'), async (req, res) => {
  try {
    const result = await countsService.create(req.body, req.user.sub, req.ip);
    res.status(201).json(result);
  } catch (error) {
    logger.error('Create count error', error);
    res.status(400).json({
      ok: false,
      error: { code: 400, message: error.message },
    });
  }
});

router.put('/:id/line', authMiddleware, rolesMiddleware('WAREHOUSE_STAFF', 'INVENTORY_MANAGER', 'STOCKMASTER'), async (req, res) => {
  try {
    const result = await countsService.updateLine(
      req.params.id,
      req.body.lineId,
      req.body.countedQuantity,
      req.user.sub,
      req.ip,
    );
    res.status(200).json(result);
  } catch (error) {
    logger.error('Update count line error', error);
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({
      ok: false,
      error: { code: status, message: error.message },
    });
  }
});

router.post('/:id/reconcile', authMiddleware, rolesMiddleware('INVENTORY_MANAGER', 'STOCKMASTER'), async (req, res) => {
  try {
    const result = await countsService.reconcile(req.params.id, req.user.sub, req.ip);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Reconcile count error', error);
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({
      ok: false,
      error: { code: status, message: error.message },
    });
  }
});

export default router;
