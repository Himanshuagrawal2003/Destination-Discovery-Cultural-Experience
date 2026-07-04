const Event        = require('../models/Event');
const asyncHandler = require('../utils/asyncHandler');
const AppError     = require('../utils/AppError');
const APIFeatures  = require('../utils/apiFeatures');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');

exports.getEvents = asyncHandler(async (req, res) => {
  const features = new APIFeatures(Event.find({ isActive: true }), req.query)
    .filter().search(['title', 'description']).sort().limitFields().paginate();
  const events = await features.query;
  const total  = await Event.countDocuments({ isActive: true });
  sendPaginated(res, events, total, req.query.page || 1, req.query.limit || 12);
});

exports.getUpcomingEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ isActive: true, startDate: { $gte: new Date() } })
    .sort('startDate').limit(10).select('title type coverImage startDate endDate location price');
  sendSuccess(res, { events }, 'Upcoming events fetched');
});

exports.getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id).populate('createdBy', 'name avatar');
  if (!event) return next(new AppError('Event not found', 404));
  event.viewCount += 1;
  await event.save({ validateBeforeSave: false });
  sendSuccess(res, { event }, 'Event fetched');
});

exports.createEvent = asyncHandler(async (req, res) => {
  const data = { ...req.body, createdBy: req.user._id };
  if (req.files?.coverImage?.[0]) data.coverImage = req.files.coverImage[0].path;
  if (req.files?.images)          data.images      = req.files.images.map((f) => f.path);
  const event = await Event.create(data);
  sendSuccess(res, { event }, 'Event created', 201);
});

exports.updateEvent = asyncHandler(async (req, res, next) => {
  const data = { ...req.body };
  if (req.files?.coverImage?.[0]) data.coverImage = req.files.coverImage[0].path;
  const event = await Event.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!event) return next(new AppError('Event not found', 404));
  sendSuccess(res, { event }, 'Event updated');
});

exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!event) return next(new AppError('Event not found', 404));
  sendSuccess(res, {}, 'Event deleted');
});
