import express from 'express';
import productsService from './products.service.js';
import { authMiddleware, rolesMiddleware } from '../../common/middleware/auth.js';
import { validateRequest, createProductSchema, updateProductSchema } from '../../common/utils/validators.js';
import { logger } from '../../common/logger/logger.js';

const router = express.Router();

router.get('/categories/list', authMiddleware, async (req, res, next) => {
  try {
    const result = await productsService.getCategories();
    res.status(200).json(result);
  } catch (error) {
    logger.error('Get categories route error', error);
    res.status(400).json({
      ok: false,
      error: {
        code: 400,
        message: error.message,
      },
    });
  }
});

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      categoryId: req.query.categoryId,
      isActive: req.query.isActive === 'true',
      search: req.query.search,
    };

    const result = await productsService.getAll(page, limit, filters);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Get all products route error', error);
    res.status(400).json({
      ok: false,
      error: {
        code: 400,
        message: error.message,
      },
    });
  }
});

router.post('/', authMiddleware, rolesMiddleware('INVENTORY_MANAGER', 'STOCKMASTER'), validateRequest(createProductSchema), async (req, res, next) => {
  try {
    const result = await productsService.create(req.validatedBody, req.user.sub, req.ip);
    res.status(201).json(result);
  } catch (error) {
    logger.error('Create product route error', error);
    const status = error.message.includes('already exists') ? 409 : 400;
    res.status(status).json({
      ok: false,
      error: {
        code: status,
        message: error.message,
      },
    });
  }
});

router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const result = await productsService.getById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Get product by ID route error', error);
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({
      ok: false,
      error: {
        code: status,
        message: error.message,
      },
    });
  }
});

router.put('/:id', authMiddleware, rolesMiddleware('INVENTORY_MANAGER', 'STOCKMASTER'), validateRequest(updateProductSchema), async (req, res, next) => {
  try {
    const result = await productsService.update(req.params.id, req.validatedBody, req.user.sub, req.ip);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Update product route error', error);
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({
      ok: false,
      error: {
        code: status,
        message: error.message,
      },
    });
  }
});

router.delete('/:id', authMiddleware, rolesMiddleware('INVENTORY_MANAGER', 'STOCKMASTER'), async (req, res, next) => {
  try {
    const result = await productsService.delete(req.params.id, req.user.sub, req.ip);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Delete product route error', error);
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({
      ok: false,
      error: {
        code: status,
        message: error.message,
      },
    });
  }
});

router.post('/bulk', authMiddleware, rolesMiddleware('INVENTORY_MANAGER', 'STOCKMASTER'), async (req, res, next) => {
  try {
    if (!Array.isArray(req.body.products)) {
      return res.status(400).json({
        ok: false,
        error: {
          code: 400,
          message: 'Products must be an array',
        },
      });
    }

    const result = await productsService.bulkCreate(req.body.products, req.user.sub, req.ip);
    res.status(201).json(result);
  } catch (error) {
    logger.error('Bulk create products route error', error);
    res.status(400).json({
      ok: false,
      error: {
        code: 400,
        message: error.message,
      },
    });
  }
});

export default router;
