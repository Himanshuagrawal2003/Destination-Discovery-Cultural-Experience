const express = require('express');
const router  = express.Router();
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { protect }  = require('../middlewares/authMiddleware');
const { sendSuccess } = require('../utils/apiResponse');

router.use(protect);

// @GET /api/notifications
router.get('/', asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort('-createdAt').limit(50);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
  sendSuccess(res, { notifications, unreadCount }, 'Notifications fetched');
}));

// @PATCH /api/notifications/:id/read
router.patch('/:id/read', asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true, readAt: Date.now() }
  );
  sendSuccess(res, {}, 'Notification marked as read');
}));

// @PATCH /api/notifications/read-all
router.patch('/read-all', asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true, readAt: Date.now() }
  );
  sendSuccess(res, {}, 'All notifications marked as read');
}));

// @DELETE /api/notifications/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  sendSuccess(res, {}, 'Notification deleted');
}));

module.exports = router;
