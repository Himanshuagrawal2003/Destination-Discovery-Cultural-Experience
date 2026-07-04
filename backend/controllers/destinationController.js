const Destination  = require('../models/Destination');
const asyncHandler = require('../utils/asyncHandler');
const AppError     = require('../utils/AppError');
const APIFeatures  = require('../utils/apiFeatures');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// @GET /api/destinations
exports.getDestinations = asyncHandler(async (req, res) => {
  const features = new APIFeatures(
    Destination.find({ isActive: true }).select('-gallery'),
    req.query
  ).filter().search(['name', 'description', 'city', 'country']).sort().limitFields().paginate();

  const destinations = await features.query;
  const total = await Destination.countDocuments({ isActive: true });
  sendPaginated(res, destinations, total, req.query.page || 1, req.query.limit || 12);
});

// @GET /api/destinations/featured
exports.getFeaturedDestinations = asyncHandler(async (req, res) => {
  const destinations = await Destination.find({ isActive: true, isFeatured: true })
    .sort('-rating.average')
    .limit(8)
    .select('name country city category coverImage rating isTrending slug');
  sendSuccess(res, { destinations }, 'Featured destinations fetched');
});

// @GET /api/destinations/trending
exports.getTrendingDestinations = asyncHandler(async (req, res) => {
  const destinations = await Destination.find({ isActive: true, isTrending: true })
    .sort('-viewCount')
    .limit(6)
    .select('name country city category coverImage rating viewCount slug');
  sendSuccess(res, { destinations }, 'Trending destinations fetched');
});

// @GET /api/destinations/:id
exports.getDestination = asyncHandler(async (req, res, next) => {
  const destination = await Destination.findOne({
    $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }],
    isActive: true,
  }).populate('createdBy', 'name avatar');

  if (!destination) return next(new AppError('Destination not found', 404));

  // Increment view count
  destination.viewCount += 1;
  await destination.save({ validateBeforeSave: false });

  sendSuccess(res, { destination }, 'Destination fetched');
});

// @POST /api/destinations  [Admin]
exports.createDestination = asyncHandler(async (req, res, next) => {
  const data = { ...req.body, createdBy: req.user._id };
  if (req.files?.coverImage?.[0]) data.coverImage = req.files.coverImage[0].path;
  if (req.files?.images)          data.images      = req.files.images.map((f) => f.path);

  const destination = await Destination.create(data);
  sendSuccess(res, { destination }, 'Destination created successfully', 201);
});

// @PUT /api/destinations/:id  [Admin]
exports.updateDestination = asyncHandler(async (req, res, next) => {
  const data = { ...req.body };
  if (req.files?.coverImage?.[0]) data.coverImage = req.files.coverImage[0].path;
  if (req.files?.images)          data.images      = req.files.images.map((f) => f.path);

  const destination = await Destination.findByIdAndUpdate(req.params.id, data, {
    new: true, runValidators: true,
  });
  if (!destination) return next(new AppError('Destination not found', 404));
  sendSuccess(res, { destination }, 'Destination updated successfully');
});

// @DELETE /api/destinations/:id  [Admin]
exports.deleteDestination = asyncHandler(async (req, res, next) => {
  const destination = await Destination.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!destination) return next(new AppError('Destination not found', 404));
  sendSuccess(res, {}, 'Destination deleted successfully');
});

// @GET /api/destinations/search/suggestions
exports.getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return sendSuccess(res, { suggestions: [] });
  const regex = new RegExp(q, 'i');
  const destinations = await Destination.find({ isActive: true, $or: [{ name: regex }, { city: regex }, { country: regex }] })
    .limit(8)
    .select('name city country category slug coverImage');
  sendSuccess(res, { suggestions: destinations });
});
