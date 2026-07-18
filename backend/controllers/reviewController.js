const Review       = require('../models/Review');
const Destination  = require('../models/Destination');
const asyncHandler = require('../utils/asyncHandler');
const AppError     = require('../utils/AppError');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');

// @GET /api/reviews/destination/:destinationId
exports.getDestinationReviews = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page, 10)  || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip  = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ destination: req.params.destinationId, isHidden: false })
      .populate('user', 'name avatar')
      .populate('replies.user', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ destination: req.params.destinationId, isHidden: false }),
  ]);
  sendPaginated(res, reviews, total, page, limit, 'Reviews fetched');
});

// @POST /api/reviews
exports.createReview = asyncHandler(async (req, res, next) => {
  const { rating, title, comment, destinationId, visitDate } = req.body;

  // Verify destination exists
  if (destinationId) {
    const dest = await Destination.findById(destinationId);
    if (!dest) return next(new AppError('Destination not found', 404));
  }

  const images = req.files ? req.files.map((f) => f.path) : [];

  const review = await Review.create({
    user:        req.user._id,
    destination: destinationId,
    rating,
    title,
    comment,
    images,
    visitDate,
  });

  await review.populate('user', 'name avatar');
  sendSuccess(res, { review }, 'Review created successfully', 201);
});

// @PUT /api/reviews/:id
exports.updateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));
  if (review.user.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to update this review', 403));
  }

  const { rating, title, comment } = req.body;
  if (rating)  review.rating  = rating;
  if (title)   review.title   = title;
  if (comment) review.comment = comment;
  await review.save();
  sendSuccess(res, { review }, 'Review updated successfully');
});

// @DELETE /api/reviews/:id
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));
  if (review.user.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only delete your own reviews', 403));
  }
  await review.remove();
  sendSuccess(res, {}, 'Review deleted successfully');
});

// @POST /api/reviews/:id/like
exports.toggleLike = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));

  const userId  = req.user._id;
  const likeIdx = review.likes.indexOf(userId);
  if (likeIdx === -1) {
    review.likes.push(userId);
  } else {
    review.likes.splice(likeIdx, 1);
  }
  await review.save({ validateBeforeSave: false });
  sendSuccess(res, { likesCount: review.likes.length }, 'Like toggled');
});

// @POST /api/reviews/:id/reply
exports.addReply = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));
  review.replies.push({ user: req.user._id, comment: req.body.comment });
  await review.save({ validateBeforeSave: false });
  await review.populate('replies.user', 'name avatar');
  sendSuccess(res, { replies: review.replies }, 'Reply added');
});

// @GET /api/reviews/my
exports.getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .populate('destination', 'name coverImage slug')
    .sort('-createdAt');
  sendSuccess(res, { reviews, count: reviews.length }, 'Your reviews fetched');
});
