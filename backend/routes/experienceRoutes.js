const express = require('express');
const router  = express.Router();
const { getExperiences, getExperience, createExperience, updateExperience, deleteExperience } = require('../controllers/experienceController');
const { protect }    = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');
const { uploadGeneral } = require('../config/cloudinary');

router.get('/',     getExperiences);
router.get('/:id',  getExperience);

router.use(protect, restrictTo('admin'));
router.post('/', uploadGeneral.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'images', maxCount: 8 }]), createExperience);
router.put('/:id', uploadGeneral.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'images', maxCount: 8 }]), updateExperience);
router.delete('/:id', deleteExperience);

module.exports = router;
