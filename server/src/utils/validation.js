import mongoose from 'mongoose';
import { AppError } from './errors.js';

export const requireFields = (payload, fields) => {
  for (const field of fields) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
      throw new AppError(400, `${field} is required`);
    }
  }
};

export const parsePositiveInt = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(400, `${fieldName} must be a positive integer`);
  }

  return parsed;
};

export const validateObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(400, `${fieldName} must be a valid id`);
  }

  return value;
};

export const parsePagination = (query) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 50);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new AppError(400, 'Invalid email format');
  }
};

export const validateTaskPayload = (payload) => {
  requireFields(payload, ['title']);

  if (payload.priority !== undefined) {
    const priority = Number(payload.priority);

    if (!Number.isInteger(priority) || priority < 1 || priority > 5) {
      throw new AppError(400, 'Priority must be an integer between 1 and 5');
    }
  }

  if (payload.status !== undefined) {
    const allowed = ['pending', 'in-progress', 'completed'];

    if (!allowed.includes(payload.status)) {
      throw new AppError(400, 'Invalid task status');
    }
  }
};
