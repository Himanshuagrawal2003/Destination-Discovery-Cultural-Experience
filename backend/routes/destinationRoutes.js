const express = require('express');
const router  = express.Router();
const {
  getDestinations, getDestination, createDestination,
  updateDestination, deleteDestination, getFeaturedDestinations,
  getTrendingDestinations, getSearchSuggestions,
} = require('../controllers/destinationController');
const { protect }         = require('../middlewares/authMiddleware');
const { uploadDestination } = require('../config/cloudinary');

// Public
router.get('/',           getDestinations);
router.get('/featured',   getFeaturedDestinations);
router.get('/trending',   getTrendingDestinations);
router.get('/suggestions',getSearchSuggestions);
router.get('/:id',        getDestination);

// Authenticated only
router.use(protect);
router.post('/', uploadDestination.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]), createDestination);
router.put('/:id', uploadDestination.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]), updateDestination);
router.delete('/:id', deleteDestination);

module.exports = router;
