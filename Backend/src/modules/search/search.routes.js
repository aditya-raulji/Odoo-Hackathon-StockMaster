import express from 'express';
import searchService from './search.service.js';
import { authMiddleware } from '../../common/middleware/auth.js';
import { logger } from '../../common/logger/logger.js';

const router = express.Router();

router.get('/products', authMiddleware, async (req, res) => {
  try {
    const query = req.query.q || '';
    const filters = {
      categoryId: req.query.categoryId,
      supplierId: req.query.supplierId,
      locationId: req.query.locationId,
    };

    const result = await searchService.searchProducts(query, filters);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Search products error', error);
    res.status(400).json({
      ok: false,
      error: { code: 400, message: error.message },
    });
  }
});

router.get('/suppliers', authMiddleware, async (req, res) => {
  try {
    const query = req.query.q || '';
    const filters = {};

    const result = await searchService.searchSuppliers(query, filters);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Search suppliers error', error);
    res.status(400).json({
      ok: false,
      error: { code: 400, message: error.message },
    });
  }
});

export default router;
