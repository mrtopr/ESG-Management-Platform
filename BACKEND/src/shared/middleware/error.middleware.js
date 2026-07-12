import { AppError } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : 'Internal server error';
  
  if (!(err instanceof AppError)) {
    logger.error(err);
  }
  
  res.status(statusCode).json({ success: false, message });
}
