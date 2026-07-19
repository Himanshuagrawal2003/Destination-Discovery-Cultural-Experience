const express = require('express');
const router  = express.Router();
const {
  recommendDestinations, storytelling, hiddenGems,
  foodGuide, festivalGuide, culturalGuide, languageHelper,
  budgetPlanner, generateItinerary, chatbot, routePlanner,
  getHistory, updateHistory, deleteHistory, getQueueStatus,
} = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

// All AI routes require authentication
router.use(protect);

router.post('/recommend-destinations', recommendDestinations);
router.post('/storytelling',           storytelling);
router.post('/hidden-gems',            hiddenGems);
router.post('/food-guide',             foodGuide);
router.post('/festival-guide',         festivalGuide);
router.post('/cultural-guide',         culturalGuide);
router.post('/language-helper',        languageHelper);
router.post('/budget-planner',         budgetPlanner);
router.post('/itinerary',              generateItinerary);
router.post('/chatbot',                chatbot);
router.post('/route-planner',          routePlanner);
router.get('/history',                 getHistory);
router.put('/history/:id',             updateHistory);
router.delete('/history/:id',          deleteHistory);
router.get('/queue-status',            getQueueStatus);

module.exports = router;
