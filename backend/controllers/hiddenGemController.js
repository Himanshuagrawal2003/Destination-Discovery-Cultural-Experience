const HiddenGem    = require('../models/HiddenGem');
const asyncHandler = require('../utils/asyncHandler');
const AppError     = require('../utils/AppError');
const APIFeatures  = require('../utils/apiFeatures');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');

exports.getHiddenGems = asyncHandler(async (req, res) => {
  const features = new APIFeatures(HiddenGem.find({ isActive: true }), req.query)
    .filter().search(['name', 'description']).sort().limitFields().paginate();
  const gems  = await features.query;
  const total = await HiddenGem.countDocuments({ isActive: true });
  sendPaginated(res, gems, total, req.query.page || 1, req.query.limit || 12);
});

exports.getHiddenGem = asyncHandler(async (req, res, next) => {
  const gem = await HiddenGem.findById(req.params.id).populate('createdBy', 'name avatar');
  if (!gem) return next(new AppError('Hidden gem not found', 404));
  gem.viewCount += 1;
  await gem.save({ validateBeforeSave: false });
  sendSuccess(res, { gem }, 'Hidden gem fetched');
});

exports.createHiddenGem = asyncHandler(async (req, res) => {
  const data = { ...req.body, createdBy: req.user._id };
  if (req.file) data.image = req.file.path;
  const gem = await HiddenGem.create(data);
  sendSuccess(res, { gem }, 'Hidden gem created', 201);
});

exports.updateHiddenGem = asyncHandler(async (req, res, next) => {
  const data = { ...req.body };
  if (req.file) data.image = req.file.path;
  const gem = await HiddenGem.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!gem) return next(new AppError('Hidden gem not found', 404));
  sendSuccess(res, { gem }, 'Hidden gem updated');
});

exports.deleteHiddenGem = asyncHandler(async (req, res, next) => {
  const gem = await HiddenGem.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!gem) return next(new AppError('Hidden gem not found', 404));
  sendSuccess(res, {}, 'Hidden gem deleted');
});
