import { logger } from '../logger/logger.js';

export const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`Error: ${status} - ${message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(status).json({
    ok: false,
    error: {
      code: status,
      message,
      details: process.env.NODE_ENV === 'development' ? err.details : undefined,
    },
  });
};
