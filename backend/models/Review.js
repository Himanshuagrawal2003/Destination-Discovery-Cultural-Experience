const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Review must belong to a user'],
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Destination',
    },
    experience: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Experience',
    },
    rating: {
      type:     Number,
      required: [true, 'Rating is required'],
      min:      [1, 'Rating must be at least 1'],
      max:      [5, 'Rating cannot exceed 5'],
    },
    title:   { type: String, maxlength: 150, default: '' },
    comment: {
      type:     String,
      required: [true, 'Review comment is required'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    images:  { type: [String], default: [] },
    likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    replies: [
      {
        user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        comment:   { type: String, required: true, maxlength: 1000 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    visitDate: { type: Date },
    isVerified:{ type: Boolean, default: false },
    isHidden:  { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject:{ virtuals: true },
  }
);

// Each user can only review a destination or experience once
reviewSchema.index({ user: 1, destination: 1 }, { 
  unique: true, 
  partialFilterExpression: { destination: { $exists: true } } 
});
reviewSchema.index({ user: 1, experience: 1 }, { 
  unique: true, 
  partialFilterExpression: { experience: { $exists: true } } 
});

// Virtual: likes count
reviewSchema.virtual('likesCount').get(function () {
  return this.likes.length;
});

// Static: recalculate average rating after create/update/delete
reviewSchema.statics.calcAverageRatings = async function (destinationId) {
  if (!destinationId) return;
  const Destination = require('./Destination');
  const stats = await this.aggregate([
    { $match: { destination: destinationId, isHidden: false } },
    { $group: { _id: '$destination', nRating: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
  ]);
  if (stats.length > 0) {
    await Destination.findByIdAndUpdate(destinationId, {
      'rating.average': Math.round(stats[0].avgRating * 10) / 10,
      'rating.count':   stats[0].nRating,
    });
  } else {
    await Destination.findByIdAndUpdate(destinationId, { 'rating.average': 0, 'rating.count': 0 });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.destination);
});

reviewSchema.post('remove', function () {
  this.constructor.calcAverageRatings(this.destination);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
