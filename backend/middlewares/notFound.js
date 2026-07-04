const AppError = require('../utils/AppError');

/**
 * 404 handler — catches any request that doesn't match a registered route
 */
const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

module.exports = notFound;
