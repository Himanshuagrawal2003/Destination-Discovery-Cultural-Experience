const express = require('express');
const router  = express.Router();
const { getHiddenGems, getHiddenGem, createHiddenGem, updateHiddenGem, deleteHiddenGem } = require('../controllers/hiddenGemController');
const { protect }    = require('../middlewares/authMiddleware');
const { uploadGeneral } = require('../config/cloudinary');

router.get('/',     getHiddenGems);
router.get('/:id',  getHiddenGem);

router.use(protect);
router.post('/',   uploadGeneral.single('image'), createHiddenGem);
router.put('/:id', uploadGeneral.single('image'), updateHiddenGem);
router.delete('/:id', deleteHiddenGem);

module.exports = router;
