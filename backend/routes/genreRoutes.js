const express = require('express');
const { listGenres, createGenre, updateGenre, deleteGenre } = require('../controllers/genreController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', listGenres);
router.post('/', protect, adminOnly, createGenre);
router.put('/:id', protect, adminOnly, updateGenre);
router.delete('/:id', protect, adminOnly, deleteGenre);

module.exports = router;
