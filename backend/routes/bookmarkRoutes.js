const express = require('express');
const router  = express.Router();
const {
  getBookmarks, addBookmark, removeBookmark,
  removeBookmarkByItem, checkBookmark,
} = require('../controllers/bookmarkController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);
router.get('/',                   getBookmarks);
router.post('/',                  addBookmark);
router.get('/check/:itemId',      checkBookmark);
router.delete('/item/:itemId',    removeBookmarkByItem);
router.delete('/:id',             removeBookmark);

module.exports = router;
