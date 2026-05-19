const express = require('express');
const path = require('path');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'No image uploaded' });
    return;
  }

  const url = `/uploads/${path.basename(req.file.path)}`;
  res.status(201).json({ url });
});

module.exports = router;
