const express     = require('express');
const router      = express.Router();
const User        = require('../models/User');
const asyncHandler= require('../utils/asyncHandler');
const AppError    = require('../utils/AppError');
const { protect } = require('../middlewares/authMiddleware');
const { sendSuccess } = require('../utils/apiResponse');

router.use(protect);

// @GET /api/users/profile
router.get('/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  sendSuccess(res, { user }, 'Profile fetched');
}));

// @GET /api/users/:id/public
router.get('/:id/public', asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('name avatarUrl bio country travelInterests stats createdAt');
  if (!user) return next(new AppError('User not found', 404));
  sendSuccess(res, { user }, 'Public profile fetched');
}));

// @PUT /api/users/search-history
router.put('/search-history', asyncHandler(async (req, res) => {
  const { query } = req.body;
  if (!query) return sendSuccess(res, {}, 'No query provided');
  await User.findByIdAndUpdate(
    req.user._id,
    { $push: { searchHistory: { $each: [query], $slice: -20 } } }
  );
  sendSuccess(res, {}, 'Search history updated');
}));

// @DELETE /api/users/search-history
router.delete('/search-history', asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { searchHistory: [] } });
  sendSuccess(res, {}, 'Search history cleared');
}));

// @DELETE /api/users/account
router.delete('/account', asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isActive: false });
  sendSuccess(res, {}, 'Account deactivated successfully');
}));

module.exports = router;
