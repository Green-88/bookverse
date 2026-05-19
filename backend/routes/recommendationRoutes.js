const express = require('express');
const { getHomeRecommendations, getBookRecommendations } = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/home', protect, getHomeRecommendations);
router.get('/book/:id', getBookRecommendations);

module.exports = router;
