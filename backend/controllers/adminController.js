const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Book = require('../models/Book');
const Author = require('../models/Author');
const Genre = require('../models/Genre');

const getStats = asyncHandler(async (_req, res) => {
  const [users, books, authors, genres] = await Promise.all([
    User.countDocuments(),
    Book.countDocuments(),
    Author.countDocuments(),
    Genre.countDocuments()
  ]);

  res.json({ users, books, authors, genres });
});

const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find({}).select('-password').sort('-createdAt');
  res.json({ items: users });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({ user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({ message: 'User deleted' });
});

module.exports = { getStats, listUsers, updateUserRole, deleteUser };
