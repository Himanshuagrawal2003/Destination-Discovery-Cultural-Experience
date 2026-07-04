const express = require('express');
const router  = express.Router();
const {
  getMyTrips, getTrip, createTrip,
  updateTrip, deleteTrip, getPublicTrips,
} = require('../controllers/tripController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/public', getPublicTrips);
router.use(protect);
router.get('/',     getMyTrips);
router.post('/',    createTrip);
router.get('/:id',  getTrip);
router.put('/:id',  updateTrip);
router.delete('/:id', deleteTrip);

module.exports = router;
