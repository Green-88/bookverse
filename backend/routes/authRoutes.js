const express = require('express');
const { registerUser, loginUser, getCurrentUser, updateProfile, logoutUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getCurrentUser);
router.put('/me', protect, updateProfile);

module.exports = router;
