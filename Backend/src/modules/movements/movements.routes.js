import express from 'express';
import movementsService from './movements.service.js';
import { authMiddleware, rolesMiddleware } from '../../common/middleware/auth.js';
import { logger } from '../../common/logger/logger.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      type: req.query.type,
      status: req.query.status,
      locationId: req.query.locationId,
    };

    const result = await movementsService.getAll(page, limit, filters);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Get movements error', error);
    res.status(400).json({
      ok: false,
      error: { code: 400, message: error.message },
    });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await movementsService.getById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Get movement error', error);
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({
      ok: false,
      error: { code: status, message: error.message },
    });
  }
});

router.post('/receipts', authMiddleware, rolesMiddleware('INVENTORY_MANAGER', 'STOCKMASTER'), async (req, res) => {
  try {
    const result = await movementsService.createReceipt(req.body, req.user.sub, req.ip);
    res.status(201).json(result);
  } catch (error) {
    logger.error('Create receipt error', error);
    res.status(400).json({
      ok: false,
      error: { code: 400, message: error.message },
    });
  }
});

router.post('/deliveries', authMiddleware, rolesMiddleware('INVENTORY_MANAGER', 'WAREHOUSE_STAFF', 'STOCKMASTER'), async (req, res) => {
  try {
    const result = await movementsService.createDelivery(req.body, req.user.sub, req.ip);
    res.status(201).json(result);
  } catch (error) {
    logger.error('Create delivery error', error);
    res.status(400).json({
      ok: false,
      error: { code: 400, message: error.message },
    });
  }
});

router.post('/transfers', authMiddleware, rolesMiddleware('INVENTORY_MANAGER', 'WAREHOUSE_STAFF', 'STOCKMASTER'), async (req, res) => {
  try {
    const result = await movementsService.createTransfer(req.body, req.user.sub, req.ip);
    res.status(201).json(result);
  } catch (error) {
    logger.error('Create transfer error', error);
    res.status(400).json({
      ok: false,
      error: { code: 400, message: error.message },
    });
  }
});

router.post('/adjustments', authMiddleware, rolesMiddleware('INVENTORY_MANAGER', 'STOCKMASTER'), async (req, res) => {
  try {
    const result = await movementsService.createAdjustment(req.body, req.user.sub, req.ip);
    res.status(201).json(result);
  } catch (error) {
    logger.error('Create adjustment error', error);
    res.status(400).json({
      ok: false,
      error: { code: 400, message: error.message },
    });
  }
});

router.put('/:id/status', authMiddleware, rolesMiddleware('INVENTORY_MANAGER', 'WAREHOUSE_STAFF', 'STOCKMASTER'), async (req, res) => {
  try {
    const result = await movementsService.updateStatus(req.params.id, req.body.status, req.user.sub, req.ip);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Update status error', error);
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({
      ok: false,
      error: { code: status, message: error.message },
    });
  }
});

router.post('/:id/confirm-pick', authMiddleware, rolesMiddleware('WAREHOUSE_STAFF', 'STOCKMASTER'), async (req, res) => {
  try {
    const result = await movementsService.confirmPick(req.params.id, req.body.pickedLines, req.user.sub, req.ip);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Confirm pick error', error);
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({
      ok: false,
      error: { code: status, message: error.message },
    });
  }
});

router.post('/:id/complete', authMiddleware, rolesMiddleware('WAREHOUSE_STAFF', 'STOCKMASTER'), async (req, res) => {
  try {
    const result = await movementsService.complete(req.params.id, req.user.sub, req.ip);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Complete movement error', error);
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({
      ok: false,
      error: { code: status, message: error.message },
    });
  }
});

export default router;
