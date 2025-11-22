import jwt from 'jsonwebtoken';
import { logger } from '../logger/logger.js';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        ok: false,
        error: {
          code: 401,
          message: 'Missing or invalid authorization header',
        },
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Auth middleware error', error);
    res.status(401).json({
      ok: false,
      error: {
        code: 401,
        message: 'Invalid or expired token',
      },
    });
  }
};

export const rolesMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        error: {
          code: 401,
          message: 'Unauthorized',
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        error: {
          code: 403,
          message: 'Forbidden - Insufficient permissions',
        },
      });
    }

    next();
  };
};
