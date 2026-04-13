export class AppError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const isPgUniqueViolation = (error) => error?.code === '23505';
export const isPgForeignKeyViolation = (error) => error?.code === '23503';
export const isPgCheckViolation = (error) => error?.code === '23514';
