const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');

const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  favoriteGenres: user.favoriteGenres,
  wishlist: user.wishlist,
  likedBooks: user.likedBooks,
  recentlyViewed: user.recentlyViewed,
  searchHistory: user.searchHistory,
  role: user.role
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, avatar, favoriteGenres = [] } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    avatar,
    favoriteGenres
  });

  const rememberMe = Boolean(req.body.rememberMe);
  const token = generateToken(user._id, rememberMe, user.role);

  res.status(201).json({
    token,
    user: formatUser(user)
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user._id, Boolean(rememberMe), user.role);

  res.json({
    token,
    user: formatUser(user)
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist')
    .populate('likedBooks')
    .populate('recentlyViewed.book')
    .select('-password');

  res.json({ user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, avatar, favoriteGenres } = req.body;

  user.name = name ?? user.name;
  user.avatar = avatar ?? user.avatar;
  if (Array.isArray(favoriteGenres)) {
    user.favoriteGenres = favoriteGenres;
  }

  await user.save();

  res.json({ user: formatUser(user) });
});

const logoutUser = asyncHandler(async (_req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  logoutUser
};
