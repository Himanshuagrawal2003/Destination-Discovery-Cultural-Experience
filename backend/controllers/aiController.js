const asyncHandler     = require('../utils/asyncHandler');
const AppError         = require('../utils/AppError');
const { sendSuccess }  = require('../utils/apiResponse');
const { generateContent, prompts, aiQueue } = require('../services/geminiService');
const AIHistory        = require('../models/AIHistory');

/**
 * Helper: save AI interaction to history
 */
const saveHistory = async (userId, type, prompt, response, metadata = {}) => {
  try {
    const doc = await AIHistory.create({ user: userId, type, prompt, response, metadata });
    return doc;
  } catch (err) {
    console.error('Failed to save AI history:', err.message);
    return null;
  }
};

/**
 * Helper: safely parse JSON from Gemini response
 */
const parseJSON = (text) => {
  try {
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    return JSON.parse(text);
  } catch {
    return { rawText: text };
  }
};

// ─── @POST /api/ai/recommend-destinations ────────────────────────────────────
exports.recommendDestinations = asyncHandler(async (req, res) => {
  const { budget, travelStyle, season, interests, country, duration, experienceDescription } = req.body;
  
  if (!experienceDescription && (!budget || !season)) {
    throw new AppError('Preferences details are required', 400);
  }

  const prompt   = prompts.recommendDestinations({ 
    budget: budget || 'mid-range', 
    travelStyle: travelStyle || 'solo', 
    season: season || 'any season', 
    interests: interests || [], 
    country, 
    duration: duration || 7,
    experienceDescription
  });
  const rawText  = await generateContent(prompt);
  const data     = parseJSON(rawText);

  const historyDoc = await saveHistory(req.user._id, 'recommendation', prompt, rawText, { budget, travelStyle, season, experienceDescription });
  sendSuccess(res, { recommendations: data, rawText, historyId: historyDoc?._id }, 'Destinations recommended by AI');
});

// ─── @POST /api/ai/storytelling ──────────────────────────────────────────────
exports.storytelling = asyncHandler(async (req, res) => {
  const { destinationName, country } = req.body;
  if (!destinationName || !country) throw new AppError('Destination name and country required', 400);

  const prompt  = prompts.storytelling({ destinationName, country });
  const story   = await generateContent(prompt);

  const historyDoc = await saveHistory(req.user._id, 'storytelling', prompt, story, { destinationName, country });
  sendSuccess(res, { story, historyId: historyDoc?._id }, 'Story generated successfully');
});

// ─── @POST /api/ai/hidden-gems ───────────────────────────────────────────────
exports.hiddenGems = asyncHandler(async (req, res) => {
  const { country, travelStyle, interests } = req.body;

  const prompt  = prompts.hiddenGems({ country, travelStyle, interests });
  const rawText = await generateContent(prompt);
  const data    = parseJSON(rawText);

  const historyDoc = await saveHistory(req.user._id, 'hidden-gems', prompt, rawText, { country });
  sendSuccess(res, { gems: data, rawText, historyId: historyDoc?._id }, 'Hidden gems discovered by AI');
});

// ─── @POST /api/ai/food-guide ────────────────────────────────────────────────
exports.foodGuide = asyncHandler(async (req, res) => {
  const { country, city, dietaryPreferences } = req.body;
  if (!country) throw new AppError('Country is required', 400);

  const prompt  = prompts.foodGuide({ country, city, dietaryPreferences });
  const rawText = await generateContent(prompt);
  const data    = parseJSON(rawText);

  const historyDoc = await saveHistory(req.user._id, 'food-guide', prompt, rawText, { country, city });
  sendSuccess(res, { foodGuide: data, rawText, historyId: historyDoc?._id }, 'Food guide generated');
});

// ─── @POST /api/ai/festival-guide ────────────────────────────────────────────
exports.festivalGuide = asyncHandler(async (req, res) => {
  const { country, month } = req.body;
  if (!country) throw new AppError('Country is required', 400);

  const prompt  = prompts.festivalGuide({ country, month });
  const rawText = await generateContent(prompt);
  const data    = parseJSON(rawText);

  const historyDoc = await saveHistory(req.user._id, 'festival-guide', prompt, rawText, { country, month });
  sendSuccess(res, { festivals: data, rawText, historyId: historyDoc?._id }, 'Festival guide generated');
});

// ─── @POST /api/ai/cultural-guide ────────────────────────────────────────────
exports.culturalGuide = asyncHandler(async (req, res) => {
  const { country, city } = req.body;
  if (!country) throw new AppError('Country is required', 400);

  const prompt  = prompts.culturalGuide({ country, city });
  const rawText = await generateContent(prompt);
  const data    = parseJSON(rawText);

  const historyDoc = await saveHistory(req.user._id, 'cultural-guide', prompt, rawText, { country, city });
  sendSuccess(res, { culturalGuide: data, rawText, historyId: historyDoc?._id }, 'Cultural guide generated');
});

// ─── @POST /api/ai/language-helper ───────────────────────────────────────────
exports.languageHelper = asyncHandler(async (req, res) => {
  const { country, language, situation } = req.body;
  if (!country) throw new AppError('Country is required', 400);

  const prompt  = prompts.languageHelper({ country, language, situation });
  const rawText = await generateContent(prompt);
  const data    = parseJSON(rawText);

  const historyDoc = await saveHistory(req.user._id, 'language-helper', prompt, rawText, { country, language });
  sendSuccess(res, { languageGuide: data, rawText, historyId: historyDoc?._id }, 'Language guide generated');
});

// ─── @POST /api/ai/budget-planner ────────────────────────────────────────────
exports.budgetPlanner = asyncHandler(async (req, res) => {
  const { destination, duration, travelStyle, groupSize } = req.body;
  if (!destination || !duration) throw new AppError('Destination and duration are required', 400);

  const prompt  = prompts.budgetPlanner({ destination, duration, travelStyle, groupSize });
  const rawText = await generateContent(prompt);
  const data    = parseJSON(rawText);

  const historyDoc = await saveHistory(req.user._id, 'budget-planner', prompt, rawText, { destination, duration });
  sendSuccess(res, { budgetPlan: data, rawText, historyId: historyDoc?._id }, 'Budget plan generated');
});

// ─── @POST /api/ai/itinerary ──────────────────────────────────────────────────
exports.generateItinerary = asyncHandler(async (req, res) => {
  const { destination, days, interests, budget, travelStyle } = req.body;
  if (!destination || !days) throw new AppError('Destination and days are required', 400);

  const prompt  = prompts.itinerary({ destination, days, interests, budget, travelStyle });
  const rawText = await generateContent(prompt);
  const data    = parseJSON(rawText);

  const historyDoc = await saveHistory(req.user._id, 'itinerary', prompt, rawText, { destination, days });
  sendSuccess(res, { itinerary: data, rawText, historyId: historyDoc?._id }, 'Itinerary generated successfully');
});

// ─── @POST /api/ai/chatbot ────────────────────────────────────────────────────
exports.chatbot = asyncHandler(async (req, res) => {
  const { message, conversationHistory = [] } = req.body;
  if (!message) throw new AppError('Message is required', 400);

  const prompt   = prompts.chatbot(message, conversationHistory.slice(-10));
  const response = await generateContent(prompt);

  const historyDoc = await saveHistory(req.user._id, 'chatbot', message, response, { historyLength: conversationHistory.length });
  sendSuccess(res, { response, message, historyId: historyDoc?._id }, 'AI response generated');
});

// ─── @GET /api/ai/history ────────────────────────────────────────────────────
exports.getHistory = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10)|| 20;
  const filter= { user: req.user._id };
  if (req.query.type) filter.type = req.query.type;
  if (req.query.isSaved !== undefined) filter.isSaved = req.query.isSaved === 'true';

  const [history, total] = await Promise.all([
    AIHistory.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit),
    AIHistory.countDocuments(filter),
  ]);
  sendSuccess(res, { history, total, page, totalPages: Math.ceil(total / limit) }, 'AI history fetched');
});

// ─── @PUT /api/ai/history/:id ─────────────────────────────────────────────────
exports.updateHistory = asyncHandler(async (req, res) => {
  const historyItem = await AIHistory.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isSaved: req.body.isSaved },
    { new: true }
  );
  if (!historyItem) throw new AppError('History item not found or unauthorized', 404);
  sendSuccess(res, { historyItem }, 'AI history item updated successfully');
});

// ─── @DELETE /api/ai/history/:id ─────────────────────────────────────────────
exports.deleteHistory = asyncHandler(async (req, res) => {
  await AIHistory.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  sendSuccess(res, {}, 'History deleted');
});

// ─── @GET /api/ai/queue-status ───────────────────────────────────────────────
exports.getQueueStatus = asyncHandler(async (req, res) => {
  const status = aiQueue.getStatus();
  sendSuccess(res, { status }, 'AI queue status fetched successfully');
});
