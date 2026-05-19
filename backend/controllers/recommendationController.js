const asyncHandler = require('../utils/asyncHandler');
const Book = require('../models/Book');
const User = require('../models/User');

const uniqueIds = (items) => [...new Set(items.map((item) => String(item)))];

const buildRecommendationQuery = (user) => {
  const favoriteGenres = user?.favoriteGenres || [];
  const likedIds = user?.likedBooks || [];
  const wishlistIds = user?.wishlist || [];
  const viewedIds = (user?.recentlyViewed || []).map((entry) => entry.book);

  return { favoriteGenres, likedIds, wishlistIds, viewedIds };
};

const getHomeRecommendations = asyncHandler(async (req, res) => {
  const user = req.user ? await User.findById(req.user._id) : null;
  const { favoriteGenres, likedIds, wishlistIds, viewedIds } = buildRecommendationQuery(user);

  const seedGenres = favoriteGenres.length > 0 ? favoriteGenres : ['Fiction', 'Fantasy', 'Motivation', 'Hindi Literature'];

  const personalized = await Book.find({
    $or: [
      { genre: { $in: seedGenres } },
      { _id: { $in: uniqueIds([...likedIds, ...wishlistIds, ...viewedIds]) } }
    ]
  })
    .sort('-rating -likesCount -createdAt')
    .limit(12);

  const trending = await Book.find({ isTrending: true }).sort('-likesCount -rating').limit(12);
  const hindi = await Book.find({ language: /Hindi/i }).sort('-rating -likesCount').limit(12);
  const international = await Book.find({ language: { $ne: /Hindi/i } }).sort('-rating -likesCount').limit(12);
  const newArrivals = await Book.find({ isNewRelease: true }).sort('-createdAt').limit(12);
  const topRated = await Book.find({ rating: { $gte: 4.4 } }).sort('-rating -likesCount').limit(12);
  const similar = await Book.find({ genre: { $in: seedGenres } }).sort('-rating -likesCount').limit(12);

  res.json({
    personalized,
    trending,
    hindi,
    international,
    newArrivals,
    topRated,
    similar,
    popularGenres: seedGenres
  });
});

const getBookRecommendations = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  const similar = await Book.find({
    _id: { $ne: book._id },
    $or: [{ genre: book.genre }, { author: book.author }, { tags: { $in: book.tags } }]
  })
    .sort('-rating -likesCount')
    .limit(8);

  const popularInGenre = await Book.find({ genre: book.genre, _id: { $ne: book._id } }).sort('-likesCount -rating').limit(8);

  res.json({ similar, popularInGenre });
});

module.exports = { getHomeRecommendations, getBookRecommendations };
