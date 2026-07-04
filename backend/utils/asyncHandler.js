/**
 * Wraps async route handlers to avoid try-catch boilerplate.
 * Passes any errors to Express next() error handler.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
