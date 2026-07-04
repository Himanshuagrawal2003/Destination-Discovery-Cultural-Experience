const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    title:   { type: String, required: true, maxlength: 150 },
    message: { type: String, required: true, maxlength: 500 },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'review', 'bookmark', 'trip', 'ai', 'system'],
      default: 'info',
    },
    link:      { type: String, default: '' },
    isRead:    { type: Boolean, default: false },
    readAt:    { type: Date },
    metadata:  { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
