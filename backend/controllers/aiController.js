const asyncHandler     = require('../utils/asyncHandler');
const AppError         = require('../utils/AppError');
const { sendSuccess }  = require('../utils/apiResponse');
const { generateContent, prompts } = require('../services/geminiService');
const AIHistory        = require('../models/AIHistory');

/**
 * Helper: save AI interaction to history
 */
const saveHistory = async (userId, type, prompt, response, metadata = {}) => {
  try {
    await AIHistory.create({ user: userId, type, prompt, response, metadata });
  } catch (err) {
    console.error('Failed to save AI history:', err.message);
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
  const { budget, travelStyle, season, interests, country, duration } = req.body;
  if (!budget || !season) throw new AppError('Budget and season are required', 400);

  const prompt   = prompts.recommendDestinations({ budget, travelStyle, season, interests: interests || [], country, duration: duration || 7 });
  const rawText  = await generateContent(prompt);
  const data     = parseJSON(rawText);

  await saveHistory(req.user._id, 'recommendation', prompt, rawText, { budget, travelStyle, season });
  sendSuccess(res, { recommendations: data, rawText }, 'Destinations recommended by AI');
});

// ─── @POST /api/ai/storytelling ──────────────────────────────────────────────
exports.storytelling = asyncHandler(async (req, res) => {
  const { destinationName, country } = req.body;
  if (!destinationName || !country) throw new AppError('Destination name and country required', 400);

  const prompt  = prompts.storytelling({ destinationName, country });
  const story   = await generateContent(prompt);

  await saveHistory(req.user._id, 'storytelling', prompt, story, { destinationName, country });
  sendSuccess(res, { story }, 'Story generated successfully');
});

// ─── @POST /api/ai/hidden-gems ───────────────────────────────────────────────
exports.hiddenGems = asyncHandler(async (req, res) => {
  const { country, travelStyle, interests } = req.body;

  const prompt  = prompts.hiddenGems({ country, travelStyle, interests });
  const rawText = await generateContent(prompt);
  const data    = parseJSON(rawText);

  await saveHistory(req.user._id, 'hidden-gems', prompt, rawText, { country });
  sendSuccess(res, { gems: data, rawText }, 'Hidden gems discovered by AI');
});

// ─── @POST /api/ai/food-guide ────────────────────────────────────────────────
exports.foodGuide = asyncHandler(async (req, res) => {
  const { country, city, dietaryPreferences } = req.body;
  if (!country) throw new AppError('Country is required', 400);

  const prompt  = prompts.foodGuide({ country, city, dietaryPreferences });
  const rawText = await generateContent(prompt);
  const data    = parseJSON(rawText);

  await saveHistory(req.user._id, 'food-guide', prompt, rawText, { country, city });
  sendSuccess(res, { foodGuide: data, rawText }, 'Food guide generated');
});

// ─── @POST /api/ai/festival-guide ────────────────────────────────────────────
exports.festivalGuide = asyncHandler(async (req, res) => {
  const { country, month } = req.body;
  if (!country) throw new AppError('Country is required', 400);

  const prompt  = prompts.festivalGuide({ country, month });
  const rawText = await generateContent(prompt);
  const data    = parseJSON(rawText);

  await saveHistory(req.user._id, 'festival-guide', prompt, rawText, { country, month });
  sendSuccess(res, { festivals: data, rawText }, 'Festival guide generated');
});

// ─── @POST /api/ai/cultural-guide ────────────────────────────────────────────
exports.culturalGuide = asyncHandler(async (req, res) => {
  const { country, city } = req.body;
  if (!country) throw new AppError('Country is required', 400);

  const prompt  = prompts.culturalGuide({ country, city });
  const rawText = await generateContent(prompt);
  const data    = parseJSON(rawText);

  await saveHistory(req.user._id, 'cultural-guide', prompt, rawText, { country, city });
  sendSuccess(res, { culturalGuide: data, rawText }, 'Cultural guide generated');
});

// ─── @POST /api/ai/language-helper ───────────────────────────────────────────
exports.languageHelper = asyncHandler(async (req, res) => {
  const { country, language, situation } = req.body;
  if (!country) throw new AppError('Country is required', 400);

  const prompt  = prompts.languageHelper({ country, language, situation });
  const rawText = await generateContent(prompt);
  const data    = parseJSON(rawText);

  await saveHistory(req.user._id, 'language-helper', prompt, rawText, { country, language });
  sendSuccess(res, { languageGuide: data, rawText }, 'Language guide generated');
});

// ─── @POST /api/ai/budget-planner ────────────────────────────────────────────
exports.budgetPlanner = asyncHandler(async (req, res) => {
  const { destination, duration, travelStyle, groupSize } = req.body;
  if (!destination || !duration) throw new AppError('Destination and duration are required', 400);

  const prompt  = prompts.budgetPlanner({ destination, duration, travelStyle, groupSize });
  const rawText = await generateContent(prompt);
  const data    = parseJSON(rawText);

  await saveHistory(req.user._id, 'budget-planner', prompt, rawText, { destination, duration });
  sendSuccess(res, { budgetPlan: data, rawText }, 'Budget plan generated');
});

// ─── @POST /api/ai/itinerary ──────────────────────────────────────────────────
exports.generateItinerary = asyncHandler(async (req, res) => {
  const { destination, days, interests, budget, travelStyle } = req.body;
  if (!destination || !days) throw new AppError('Destination and days are required', 400);

  const prompt  = prompts.itinerary({ destination, days, interests, budget, travelStyle });
  const rawText = await generateContent(prompt);
  const data    = parseJSON(rawText);

  await saveHistory(req.user._id, 'itinerary', prompt, rawText, { destination, days });
  sendSuccess(res, { itinerary: data, rawText }, 'Itinerary generated successfully');
});

// ─── @POST /api/ai/chatbot ────────────────────────────────────────────────────
exports.chatbot = asyncHandler(async (req, res) => {
  const { message, conversationHistory = [] } = req.body;
  if (!message) throw new AppError('Message is required', 400);

  const prompt   = prompts.chatbot(message, conversationHistory.slice(-10));
  const response = await generateContent(prompt);

  await saveHistory(req.user._id, 'chatbot', message, response, { historyLength: conversationHistory.length });
  sendSuccess(res, { response, message }, 'AI response generated');
});

// ─── @GET /api/ai/history ────────────────────────────────────────────────────
exports.getHistory = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10)|| 20;
  const filter= { user: req.user._id };
  if (req.query.type) filter.type = req.query.type;

  const [history, total] = await Promise.all([
    AIHistory.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit),
    AIHistory.countDocuments(filter),
  ]);
  sendSuccess(res, { history, total, page, totalPages: Math.ceil(total / limit) }, 'AI history fetched');
});

// ─── @DELETE /api/ai/history/:id ─────────────────────────────────────────────
exports.deleteHistory = asyncHandler(async (req, res) => {
  await AIHistory.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  sendSuccess(res, {}, 'History deleted');
});
