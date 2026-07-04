const express = require('express');
const router  = express.Router();
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent, getUpcomingEvents } = require('../controllers/eventController');
const { protect }    = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');
const { uploadGeneral } = require('../config/cloudinary');

router.get('/',          getEvents);
router.get('/upcoming',  getUpcomingEvents);
router.get('/:id',       getEvent);

router.use(protect, restrictTo('admin'));
router.post('/', uploadGeneral.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'images', maxCount: 8 }]), createEvent);
router.put('/:id', uploadGeneral.fields([{ name: 'coverImage', maxCount: 1 }]), updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;
