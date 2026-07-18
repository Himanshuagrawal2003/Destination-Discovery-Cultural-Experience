const Trip         = require('../models/Trip');
const asyncHandler = require('../utils/asyncHandler');
const AppError     = require('../utils/AppError');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');

// @GET /api/trips
exports.getMyTrips = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10)|| 10;
  const skip  = (page - 1) * limit;
  const query = { user: req.user._id };
  if (req.query.status) query.status = req.query.status;

  const [trips, total] = await Promise.all([
    Trip.find(query)
      .populate('destinations', 'name country coverImage slug')
      .sort('-createdAt').skip(skip).limit(limit),
    Trip.countDocuments(query),
  ]);
  sendPaginated(res, trips, total, page, limit, 'Trips fetched');
});

// @GET /api/trips/:id
exports.getTrip = asyncHandler(async (req, res, next) => {
  const trip = await Trip.findOne({ _id: req.params.id })
    .populate('destinations', 'name country city coverImage slug location')
    .populate('user', 'name avatar');

  if (!trip) return next(new AppError('Trip not found', 404));
  if (trip.user._id.toString() !== req.user._id.toString() && !trip.isPublic) {
    return next(new AppError('You are not authorized to view this trip', 403));
  }
  sendSuccess(res, { trip }, 'Trip fetched');
});

const Destination  = require('../models/Destination');

// @POST /api/trips
exports.createTrip = asyncHandler(async (req, res) => {
  let { destinations, destinationName, ...tripData } = req.body;

  // If a custom destination name is provided from the frontend
  if (destinationName && (!destinations || destinations.length === 0)) {
    // Find or create the destination document in the DB
    let dest = await Destination.findOne({ name: { $regex: new RegExp(`^${destinationName.trim()}$`, 'i') } });
    if (!dest) {
      dest = await Destination.create({
        name: destinationName.trim(),
        city: destinationName.trim(),
        country: 'Travel Spot',
        category: 'cultural',
        description: `Custom destination planned with AI for ${destinationName}`,
        createdBy: req.user._id,
      });
    }
    destinations = [dest._id];
  }

  const trip = await Trip.create({ ...tripData, destinations, user: req.user._id });
  sendSuccess(res, { trip }, 'Trip created successfully', 201);
});

// @PUT /api/trips/:id
exports.updateTrip = asyncHandler(async (req, res, next) => {
  const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
  if (!trip) return next(new AppError('Trip not found or unauthorized', 404));
  Object.assign(trip, req.body);
  await trip.save();
  sendSuccess(res, { trip }, 'Trip updated successfully');
});

// @DELETE /api/trips/:id
exports.deleteTrip = asyncHandler(async (req, res, next) => {
  const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!trip) return next(new AppError('Trip not found or unauthorized', 404));
  sendSuccess(res, {}, 'Trip deleted successfully');
});

// @GET /api/trips/public  — public feed of shared trips
exports.getPublicTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find({ isPublic: true, status: 'completed' })
    .populate('user', 'name avatar')
    .populate('destinations', 'name country coverImage')
    .sort('-createdAt').limit(20);
  sendSuccess(res, { trips, count: trips.length }, 'Public trips fetched');
});
