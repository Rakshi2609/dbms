import {
  AppError,
  isPgCheckViolation,
  isPgForeignKeyViolation,
  isPgUniqueViolation
} from '../utils/errors.js';

export const errorMiddleware = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details
    });
  }

  if (error?.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation failed',
      details: Object.values(error.errors).map((item) => item.message)
    });
  }

  if (error?.code === 11000) {
    return res.status(409).json({
      message: 'Unique constraint violation',
      details: error.keyValue
    });
  }

  if (error?.name === 'CastError') {
    return res.status(400).json({
      message: `Invalid ${error.path}`,
      details: error.value
    });
  }

  if (isPgUniqueViolation(error)) {
    return res.status(409).json({ message: 'Unique constraint violation', details: error.detail });
  }

  if (isPgForeignKeyViolation(error)) {
    return res.status(400).json({ message: 'Invalid foreign key reference', details: error.detail });
  }

  if (isPgCheckViolation(error)) {
    return res.status(400).json({ message: 'Database check constraint failed', details: error.detail });
  }

  console.error(error);
  return res.status(500).json({ message: 'Internal server error' });
};
