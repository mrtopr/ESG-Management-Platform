import { AppError } from '../errors/AppError.js';

export const requireRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError(403, 'Forbidden: Insufficient permissions'));
  }
  next();
};
