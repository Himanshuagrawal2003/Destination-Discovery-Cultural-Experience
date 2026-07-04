const express     = require('express');
const router      = express.Router();
const User        = require('../models/User');
const Destination = require('../models/Destination');
const Review      = require('../models/Review');
const Trip        = require('../models/Trip');
const asyncHandler= require('../utils/asyncHandler');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');
const { sendSuccess } = require('../utils/apiResponse');

router.use(protect, restrictTo('admin'));

// @GET /api/admin/analytics
router.get('/analytics', asyncHandler(async (req, res) => {
  const [
    totalUsers, totalDestinations, totalReviews, totalTrips,
    recentUsers, popularDestinations,
    userGrowth, reviewDistribution,
  ] = await Promise.all([
    User.countDocuments(),
    Destination.countDocuments({ isActive: true }),
    Review.countDocuments(),
    Trip.countDocuments(),
    User.find().sort('-createdAt').limit(5).select('name email avatar createdAt role'),
    Destination.find({ isActive: true }).sort('-viewCount').limit(5).select('name country viewCount rating'),
    // User growth: group by month (last 6 months)
    User.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
    ]),
    // Review rating distribution
    Review.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
    ]),
  ]);

  sendSuccess(res, {
    stats: { totalUsers, totalDestinations, totalReviews, totalTrips },
    recentUsers,
    popularDestinations,
    userGrowth,
    reviewDistribution,
  }, 'Analytics fetched');
}));

// @GET /api/admin/users
router.get('/users', asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10)|| 20;
  const skip  = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().sort('-createdAt').skip(skip).limit(limit).select('-password'),
    User.countDocuments(),
  ]);
  sendSuccess(res, { users, total, page, totalPages: Math.ceil(total / limit) }, 'Users fetched');
}));

// @PUT /api/admin/users/:id
router.put('/users/:id', asyncHandler(async (req, res) => {
  const { role, isActive } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role, isActive },
    { new: true }
  ).select('-password');
  sendSuccess(res, { user }, 'User updated');
}));

// @DELETE /api/admin/users/:id
router.delete('/users/:id', asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  sendSuccess(res, {}, 'User deleted');
}));

module.exports = router;
