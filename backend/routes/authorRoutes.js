const express = require('express');
const {
  listAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor
} = require('../controllers/authorController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', listAuthors);
router.get('/:id', getAuthorById);
router.post('/', protect, adminOnly, createAuthor);
router.put('/:id', protect, adminOnly, updateAuthor);
router.delete('/:id', protect, adminOnly, deleteAuthor);

module.exports = router;
