import express from 'express';
import notificationsService from './notifications.service.js';
import { authMiddleware } from '../../common/middleware/auth.js';
import { logger } from '../../common/logger/logger.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await notificationsService.getAll(req.user.sub, page, limit);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Get notifications error', error);
    res.status(400).json({
      ok: false,
      error: { code: 400, message: error.message },
    });
  }
});

router.post('/:id/mark-read', authMiddleware, async (req, res) => {
  try {
    const result = await notificationsService.markAsRead(req.params.id, req.user.sub);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Mark notification as read error', error);
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({
      ok: false,
      error: { code: status, message: error.message },
    });
  }
});

router.post('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    const result = await notificationsService.markAllAsRead(req.user.sub);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Mark all notifications as read error', error);
    res.status(400).json({
      ok: false,
      error: { code: 400, message: error.message },
    });
  }
});

export default router;
