import express from 'express';
import staffService from './staff.service.js';
import { authMiddleware, rolesMiddleware } from '../../common/middleware/auth.js';
import { logger } from '../../common/logger/logger.js';

const router = express.Router();

router.get('/', authMiddleware, rolesMiddleware('INVENTORY_MANAGER', 'STOCKMASTER'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      role: req.query.role,
      isActive: req.query.isActive === 'true',
    };

    const result = await staffService.getAll(page, limit, filters);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Get staff error', error);
    res.status(400).json({
      ok: false,
      error: { code: 400, message: error.message },
    });
  }
});

router.post('/', authMiddleware, rolesMiddleware('INVENTORY_MANAGER', 'STOCKMASTER'), async (req, res) => {
  try {
    const result = await staffService.create(req.body, req.user.sub, req.ip);
    res.status(201).json(result);
  } catch (error) {
    logger.error('Create staff error', error);
    const status = error.message.includes('already registered') ? 409 : 400;
    res.status(status).json({
      ok: false,
      error: { code: status, message: error.message },
    });
  }
});

router.get('/:id', authMiddleware, rolesMiddleware('INVENTORY_MANAGER', 'STOCKMASTER'), async (req, res) => {
  try {
    const result = await staffService.getById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Get staff error', error);
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({
      ok: false,
      error: { code: status, message: error.message },
    });
  }
});

router.put('/:id', authMiddleware, rolesMiddleware('INVENTORY_MANAGER', 'STOCKMASTER'), async (req, res) => {
  try {
    const result = await staffService.update(req.params.id, req.body, req.user.sub, req.ip);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Update staff error', error);
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({
      ok: false,
      error: { code: status, message: error.message },
    });
  }
});

router.put('/:id/role', authMiddleware, rolesMiddleware('STOCKMASTER'), async (req, res) => {
  try {
    const result = await staffService.updateRole(req.params.id, req.body.role, req.user.sub, req.ip);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Update staff role error', error);
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({
      ok: false,
      error: { code: status, message: error.message },
    });
  }
});

router.delete('/:id', authMiddleware, rolesMiddleware('INVENTORY_MANAGER', 'STOCKMASTER'), async (req, res) => {
  try {
    const result = await staffService.delete(req.params.id, req.user.sub, req.ip);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Delete staff error', error);
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({
      ok: false,
      error: { code: status, message: error.message },
    });
  }
});

export default router;
