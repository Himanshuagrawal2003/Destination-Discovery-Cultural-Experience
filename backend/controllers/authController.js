const jwt         = require('jsonwebtoken');
const crypto      = require('crypto');
const { validationResult } = require('express-validator');
const User        = require('../models/User');
const asyncHandler= require('../utils/asyncHandler');
const AppError    = require('../utils/AppError');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');

// ─── Helper: sign JWT ─────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove sensitive fields from output
  user.password = undefined;

  return res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};

// ─── @route  POST /api/auth/register ─────────────────────────────────────────
exports.register = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 400, errors.array());
  }

  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new AppError('Email already registered. Please log in.', 400));

  // Prevent self-assigning admin role
  const safeRole = role === 'admin' ? 'user' : (role || 'user');

  const user = await User.create({ name, email, password, role: safeRole });

  // Send welcome email (with strict timeout safety)
  try {
    await sendWelcomeEmail(email, name);
  } catch (err) {
    console.error('Welcome email failed:', err.message);
  }

  createSendToken(user, 201, res);
});

// ─── @route  POST /api/auth/login ─────────────────────────────────────────────
exports.login = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 400, errors.array());
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Contact support.', 401));
  }

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res);
});

// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  sendSuccess(res, { user }, 'Profile fetched successfully');
});

// ─── @route  PUT /api/auth/profile ────────────────────────────────────────────
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, bio, country, language, travelInterests, preferences } = req.body;

  const updateData = {};
  if (name)            updateData.name = name;
  if (bio !== undefined) updateData.bio = bio;
  if (country)         updateData.country = country;
  if (language)        updateData.language = language;
  if (travelInterests) updateData.travelInterests = travelInterests;
  if (preferences)     updateData.preferences = preferences;

  // Handle avatar upload
  if (req.file) {
    updateData.avatar         = req.file.path;
    updateData.avatarPublicId = req.file.filename;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new:              true,
    runValidators:    true,
  });

  sendSuccess(res, { user }, 'Profile updated successfully');
});

// ─── @route  PUT /api/auth/change-password ────────────────────────────────────
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect.', 401));
  }

  user.password = newPassword;
  await user.save();

  createSendToken(user, 200, res);
});

// ─── @route  POST /api/auth/forgot-password ──────────────────────────────────
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal whether user exists
    return sendSuccess(res, {}, 'If that email exists, a reset link has been sent.');
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail(user.email, user.name, resetUrl);
    sendSuccess(res, {}, 'Password reset email sent successfully.');
  } catch (err) {
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Error sending email. Please try again.', 500));
  }
});

// ─── @route  POST /api/auth/reset-password/:token ────────────────────────────
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken:  hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or has expired.', 400));

  user.password            = req.body.password;
  user.resetPasswordToken  = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

// ─── @route  POST /api/auth/logout ───────────────────────────────────────────
exports.logout = asyncHandler(async (req, res) => {
  sendSuccess(res, {}, 'Logged out successfully');
});
