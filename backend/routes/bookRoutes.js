const express = require('express');
const {
  listBooks,
  getBookById,
  getSuggestions,
  toggleLike,
  toggleWishlist,
  recordView,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', listBooks);
router.get('/suggestions', getSuggestions);
router.get('/:id', getBookById);
router.post('/:id/view', protect, recordView);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/wishlist', protect, toggleWishlist);
router.post('/', protect, adminOnly, createBook);
router.put('/:id', protect, adminOnly, updateBook);
router.delete('/:id', protect, adminOnly, deleteBook);

module.exports = router;
