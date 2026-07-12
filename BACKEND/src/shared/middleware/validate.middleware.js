import { AppError } from '../errors/AppError.js';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(new AppError(400, result.error.errors[0].message));
  }
  req.body = result.data;
  next();
};
