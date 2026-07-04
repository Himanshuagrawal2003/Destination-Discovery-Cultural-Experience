const jwt     = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const User    = require('../models/User');

/**
 * Protect routes — verifies JWT and attaches user to req.user
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user    = await User.findById(decoded.id).select('-password');

  if (!user) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  if (user.passwordChangedAfter && user.passwordChangedAfter(decoded.iat)) {
    return next(new AppError('Password recently changed. Please log in again.', 401));
  }

  req.user = user;
  next();
});

/**
 * Optional auth — attaches user if token present, but doesn't block
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user      = await User.findById(decoded.id).select('-password');
    } catch {
      // silently ignore invalid token
    }
  }
  next();
});

module.exports = { protect, optionalAuth };
