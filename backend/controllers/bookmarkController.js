const Bookmark     = require('../models/Bookmark');
const asyncHandler = require('../utils/asyncHandler');
const AppError     = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

// @GET /api/bookmarks
exports.getBookmarks = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.type) filter.itemType = req.query.type;

  const bookmarks = await Bookmark.find(filter)
    .populate('destination', 'name country city coverImage slug rating')
    .populate('experience',  'title type coverImage price location')
    .populate('event',       'title type coverImage startDate location')
    .populate('hiddenGem',   'name description image location')
    .sort('-createdAt');

  sendSuccess(res, { bookmarks, count: bookmarks.length }, 'Bookmarks fetched');
});

// @POST /api/bookmarks
exports.addBookmark = asyncHandler(async (req, res, next) => {
  const { itemType, destinationId, experienceId, eventId, hiddenGemId, notes, collection } = req.body;

  const bookmarkData = { user: req.user._id, itemType, notes, collection };
  if (destinationId) bookmarkData.destination = destinationId;
  if (experienceId)  bookmarkData.experience  = experienceId;
  if (eventId)       bookmarkData.event       = eventId;
  if (hiddenGemId)   bookmarkData.hiddenGem   = hiddenGemId;

  const bookmark = await Bookmark.create(bookmarkData);
  sendSuccess(res, { bookmark }, 'Bookmark added successfully', 201);
});

// @DELETE /api/bookmarks/:id
exports.removeBookmark = asyncHandler(async (req, res, next) => {
  const bookmark = await Bookmark.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!bookmark) return next(new AppError('Bookmark not found', 404));
  sendSuccess(res, {}, 'Bookmark removed successfully');
});

// @DELETE /api/bookmarks/item/:itemId  — remove by item reference
exports.removeBookmarkByItem = asyncHandler(async (req, res) => {
  const { itemType } = req.query;
  const typeToField  = {
    destination: 'destination',
    experience:  'experience',
    event:       'event',
    'hidden-gem':'hiddenGem',
  };
  const field = typeToField[itemType];
  if (!field) return sendSuccess(res, {}, 'Invalid item type');

  await Bookmark.findOneAndDelete({ user: req.user._id, [field]: req.params.itemId });
  sendSuccess(res, {}, 'Bookmark removed');
});

// @GET /api/bookmarks/check/:itemId  — check if user bookmarked item
exports.checkBookmark = asyncHandler(async (req, res) => {
  const { itemType } = req.query;
  const typeToField  = { destination: 'destination', experience: 'experience', event: 'event', 'hidden-gem': 'hiddenGem' };
  const field = typeToField[itemType];
  const bookmark = field
    ? await Bookmark.findOne({ user: req.user._id, [field]: req.params.itemId })
    : null;
  sendSuccess(res, { isBookmarked: !!bookmark, bookmarkId: bookmark?._id || null });
});
