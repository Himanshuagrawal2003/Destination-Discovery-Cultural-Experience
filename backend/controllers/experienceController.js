const Experience   = require('../models/Experience');
const asyncHandler = require('../utils/asyncHandler');
const AppError     = require('../utils/AppError');
const APIFeatures  = require('../utils/apiFeatures');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');

exports.getExperiences = asyncHandler(async (req, res) => {
  const features = new APIFeatures(Experience.find({ isActive: true }), req.query)
    .filter().search(['title', 'description']).sort().limitFields().paginate();
  const experiences = await features.query;
  const total = await Experience.countDocuments({ isActive: true });
  sendPaginated(res, experiences, total, req.query.page || 1, req.query.limit || 12);
});

exports.getExperience = asyncHandler(async (req, res, next) => {
  const experience = await Experience.findById(req.params.id).populate('createdBy', 'name avatar');
  if (!experience) return next(new AppError('Experience not found', 404));
  sendSuccess(res, { experience }, 'Experience fetched');
});

exports.createExperience = asyncHandler(async (req, res) => {
  const data = { ...req.body, createdBy: req.user._id };
  if (req.files?.coverImage?.[0]) data.coverImage = req.files.coverImage[0].path;
  if (req.files?.images)          data.images      = req.files.images.map((f) => f.path);
  const experience = await Experience.create(data);
  sendSuccess(res, { experience }, 'Experience created', 201);
});

exports.updateExperience = asyncHandler(async (req, res, next) => {
  const data = { ...req.body };
  if (req.files?.coverImage?.[0]) data.coverImage = req.files.coverImage[0].path;
  if (req.files?.images)          data.images      = req.files.images.map((f) => f.path);
  const experience = await Experience.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!experience) return next(new AppError('Experience not found', 404));
  sendSuccess(res, { experience }, 'Experience updated');
});

exports.deleteExperience = asyncHandler(async (req, res, next) => {
  const experience = await Experience.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!experience) return next(new AppError('Experience not found', 404));
  sendSuccess(res, {}, 'Experience deleted');
});
