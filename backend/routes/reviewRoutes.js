const express = require('express');
const router  = express.Router();
const {
  getDestinationReviews, createReview, updateReview,
  deleteReview, toggleLike, addReply, getMyReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');
const { uploadGeneral } = require('../config/cloudinary');

router.get('/destination/:destinationId', getDestinationReviews);
router.get('/my', protect, getMyReviews);
router.post('/', protect, uploadGeneral.array('images', 5), createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/reply', protect, addReply);

module.exports = router;
