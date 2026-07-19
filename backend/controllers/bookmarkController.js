const Bookmark = require('../models/Bookmark');
const AIHistory = require('../models/AIHistory');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

// @GET /api/bookmarks
exports.getBookmarks = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  const typeFilter = req.query.type;

  let bookmarks = [];

  // 1. Fetch standard bookmarks if no filter or one of standard types is queried
  const standardTypes = ['destination', 'event', 'hidden-gem'];
  if (!typeFilter || standardTypes.includes(typeFilter)) {
    const bookmarkFilter = { ...filter };
    if (typeFilter) bookmarkFilter.itemType = typeFilter;

    const dbBookmarks = await Bookmark.find(bookmarkFilter)
      .populate('destination', 'name country city coverImage slug rating')
      .populate('event',       'title type coverImage startDate location')
      .populate('hiddenGem',   'name description image location')
      .sort('-createdAt');

    bookmarks = dbBookmarks.map(b => b.toObject());
  }

  // 2. Fetch saved AI history items if no filter or one of the AI types is queried
  const aiTypes = ['cultural-guide', 'budget-planner', 'food-guide', 'route-planner'];
  if (!typeFilter || aiTypes.includes(typeFilter)) {
    const aiFilter = { user: req.user._id, isSaved: true };
    if (typeFilter) aiFilter.type = typeFilter;

    const dbAiHistory = await AIHistory.find(aiFilter).sort('-createdAt');
    const aiBookmarks = dbAiHistory.map(item => {
      let name = '';
      if (item.type === 'cultural-guide') {
        const cityStr = item.metadata?.city ? `${item.metadata.city}, ` : '';
        name = `Cultural Guide: ${cityStr}${item.metadata?.country || 'Unknown'}`;
      } else if (item.type === 'budget-planner') {
        name = `Budget Plan: ${item.metadata?.destination || 'Unknown'} (${item.metadata?.duration || 1} Days)`;
      } else if (item.type === 'food-guide') {
        const cityStr = item.metadata?.city ? `${item.metadata.city}, ` : '';
        name = `Food Guide: ${cityStr}${item.metadata?.country || 'Unknown'}`;
      } else if (item.type === 'route-planner') {
        name = `Route: ${item.metadata?.origin || 'Unknown'} to ${item.metadata?.destination || 'Unknown'}`;
      } else {
        name = `${item.type.replace('-', ' ')}: ${item.title || 'AI Guide'}`;
      }

      return {
        _id: item._id,
        itemType: item.type, // 'cultural-guide', 'budget-planner', 'food-guide'
        user: item.user,
        notes: '',
        collection: 'Default',
        createdAt: item.createdAt,
        isAiHistory: true,
        aiItem: {
          name,
          title: name,
          coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200', // unified fallback
          city: item.metadata?.city || item.metadata?.destination || '',
          country: item.metadata?.country || '',
          type: item.type,
          prompt: item.prompt,
          response: item.response,
        }
      };
    });

    bookmarks = [...bookmarks, ...aiBookmarks];
  }

  // Sort unified bookmarks list by creation date descending
  bookmarks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  sendSuccess(res, { bookmarks, count: bookmarks.length }, 'Bookmarks fetched successfully');
});

// @POST /api/bookmarks
exports.addBookmark = asyncHandler(async (req, res, next) => {
  const { itemType, destinationId, eventId, hiddenGemId, notes, collection } = req.body;

  const bookmarkData = { user: req.user._id, itemType, notes, collection };
  if (destinationId) bookmarkData.destination = destinationId;
  if (eventId)       bookmarkData.event       = eventId;
  if (hiddenGemId)   bookmarkData.hiddenGem   = hiddenGemId;

  const bookmark = await Bookmark.create(bookmarkData);
  sendSuccess(res, { bookmark }, 'Bookmark added successfully', 201);
});

// @DELETE /api/bookmarks/:id
exports.removeBookmark = asyncHandler(async (req, res, next) => {
  // Try to remove from standard Bookmarks first
  let bookmark = await Bookmark.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  // If not found, check and update AIHistory isSaved flag
  if (!bookmark) {
    const aiHistory = await AIHistory.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isSaved: false },
      { new: true }
    );
    if (aiHistory) {
      return sendSuccess(res, {}, 'Bookmark removed successfully');
    }
    return next(new AppError('Bookmark not found', 404));
  }

  sendSuccess(res, {}, 'Bookmark removed successfully');
});

// @DELETE /api/bookmarks/item/:itemId  — remove by item reference
exports.removeBookmarkByItem = asyncHandler(async (req, res) => {
  const { itemType } = req.query;
  const typeToField  = {
    destination: 'destination',
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
  const typeToField  = { 
    destination: 'destination', 
    event: 'event', 
    'hidden-gem': 'hiddenGem' 
  };
  const field = typeToField[itemType];
  const bookmark = field
    ? await Bookmark.findOne({ user: req.user._id, [field]: req.params.itemId })
    : null;
  sendSuccess(res, { isBookmarked: !!bookmark, bookmarkId: bookmark?._id || null });
});
