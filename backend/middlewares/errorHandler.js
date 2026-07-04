const AppError = require('../utils/AppError');

/**
 * Global Express error handler.
 * Handles Mongoose errors, JWT errors, validation errors,
 * and generic operational / programming errors.
 */

// ─── Mongoose-specific error transformers ───────────────────────────────────

const handleCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}.`, 400);

const handleDuplicateField = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new AppError(`Duplicate field value: "${value}" for "${field}". Please use another value.`, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Validation failed: ${errors.join('. ')}`, 400);
};

// ─── JWT error transformers ──────────────────────────────────────────────────

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again.', 401);

// ─── Response senders ────────────────────────────────────────────────────────

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    success:    false,
    status:     err.status,
    message:    err.message,
    stack:      err.stack,
    error:      err,
  });
};

const sendProdError = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      status:  err.status,
      message: err.message,
    });
  }
  // Programming / unknown error — don't leak details
  console.error('💥 UNEXPECTED ERROR:', err);
  return res.status(500).json({
    success: false,
    status:  'error',
    message: 'Something went wrong. Please try again later.',
  });
};

// ─── Main error handler ───────────────────────────────────────────────────────

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status     = err.status     || 'error';

  if (process.env.NODE_ENV === 'development') {
    return sendDevError(err, res);
  }

  // Production: sanitize errors
  let error = { ...err, message: err.message };
  if (error.name === 'CastError')             error = handleCastError(error);
  if (error.code  === 11000)                  error = handleDuplicateField(error);
  if (error.name === 'ValidationError')       error = handleValidationError(error);
  if (error.name === 'JsonWebTokenError')     error = handleJWTError();
  if (error.name === 'TokenExpiredError')     error = handleJWTExpiredError();

  sendProdError(error, res);
};

module.exports = errorHandler;
