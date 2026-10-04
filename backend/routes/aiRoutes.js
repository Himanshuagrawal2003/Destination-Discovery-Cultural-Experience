const express = require('express');
const router  = express.Router();
const {
  recommendDestinations, storytelling, hiddenGems,
  foodGuide, festivalGuide, culturalGuide, languageHelper,
  budgetPlanner, generateItinerary, chatbot, routePlanner,
  getHistory, updateHistory, deleteHistory, getQueueStatus,
} = require('../controllers/aiController');
const { protect, optionalAuth } = require('../middlewares/authMiddleware');

// Public / Optional Auth AI Generation Endpoints
router.post('/recommend-destinations', optionalAuth, recommendDestinations);
router.post('/storytelling',           optionalAuth, storytelling);
router.post('/hidden-gems',            optionalAuth, hiddenGems);
router.post('/food-guide',             optionalAuth, foodGuide);
router.post('/festival-guide',         optionalAuth, festivalGuide);
router.post('/cultural-guide',         optionalAuth, culturalGuide);
router.post('/language-helper',        optionalAuth, languageHelper);
router.post('/budget-planner',         optionalAuth, budgetPlanner);
router.post('/itinerary',              optionalAuth, generateItinerary);
router.post('/chatbot',                optionalAuth, chatbot);
router.post('/route-planner',          optionalAuth, routePlanner);
router.get('/queue-status',            getQueueStatus);

// Authenticated History Endpoints
router.use(protect);
router.get('/history',                 getHistory);
router.put('/history/:id',             updateHistory);
router.delete('/history/:id',          deleteHistory);

module.exports = router;
