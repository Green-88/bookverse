const asyncHandler = require('../utils/asyncHandler');
const Book = require('../models/Book');
const User = require('../models/User');

const searchRegex = (value) => new RegExp(value, 'i');

const buildQuery = (query) => {
  const conditions = {};

  if (query.q) {
    conditions.$or = [
      { title: searchRegex(query.q) },
      { author: searchRegex(query.q) },
      { genre: searchRegex(query.q) },
      { tags: searchRegex(query.q) },
      { description: searchRegex(query.q) }
    ];
  }

  if (query.genre) conditions.genre = searchRegex(query.genre);
  if (query.author) conditions.author = searchRegex(query.author);
  if (query.language) conditions.language = searchRegex(query.language);
  if (query.trending === 'true') conditions.isTrending = true;
  if (query.newRelease === 'true') conditions.isNewRelease = true;
  if (query.bestseller === 'true') conditions.isBestseller = true;
  if (query.minRating) conditions.rating = { $gte: Number(query.minRating) };

  return conditions;
};

const listBooks = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 48);
  const skip = (page - 1) * limit;
  const query = buildQuery(req.query);
  const sort = req.query.sort || '-likesCount -rating -createdAt';

  if (req.query.q && req.user) {
    const user = await User.findById(req.user._id);
    if (user) {
      user.searchHistory = [req.query.q, ...user.searchHistory.filter((item) => item !== req.query.q)].slice(0, 20);
      await user.save();
    }
  }

  const [items, total] = await Promise.all([
    Book.find(query).sort(sort).skip(skip).limit(limit),
    Book.countDocuments(query)
  ]);

  res.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });
});

const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).populate('authorId');

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  if (req.user) {
    const user = await User.findById(req.user._id);
    if (user) {
      user.recentlyViewed = [
        { book: book._id, viewedAt: new Date() },
        ...user.recentlyViewed.filter((entry) => String(entry.book) !== String(book._id))
      ].slice(0, 20);
      await user.save();
    }
  }

  const related = await Book.find({
    _id: { $ne: book._id },
    $or: [{ genre: book.genre }, { author: book.author }, { tags: { $in: book.tags } }]
  })
    .sort('-rating -likesCount')
    .limit(8);

  res.json({ book, related });
});

const getSuggestions = asyncHandler(async (req, res) => {
  const query = req.query.q || '';
  if (!query.trim()) {
    res.json({ items: [] });
    return;
  }

  const items = await Book.find({
    $or: [
      { title: searchRegex(query) },
      { author: searchRegex(query) },
      { genre: searchRegex(query) },
      { tags: searchRegex(query) }
    ]
  })
    .sort('-rating -likesCount')
    .limit(8)
    .select('title author genre coverImage rating');

  res.json({ items });
});

const toggleLike = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  const user = await User.findById(req.user._id);

  if (!book || !user) {
    res.status(404);
    throw new Error('Book or user not found');
  }

  const liked = user.likedBooks.some((item) => String(item) === String(book._id));

  if (liked) {
    user.likedBooks = user.likedBooks.filter((item) => String(item) !== String(book._id));
    book.likesCount = Math.max(0, book.likesCount - 1);
  } else {
    user.likedBooks.push(book._id);
    book.likesCount += 1;
  }

  await Promise.all([user.save(), book.save()]);

  res.json({ liked: !liked, likesCount: book.likesCount });
});

const toggleWishlist = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  const user = await User.findById(req.user._id);

  if (!book || !user) {
    res.status(404);
    throw new Error('Book or user not found');
  }

  const exists = user.wishlist.some((item) => String(item) === String(book._id));
  if (exists) {
    user.wishlist = user.wishlist.filter((item) => String(item) !== String(book._id));
  } else {
    user.wishlist.push(book._id);
  }

  await user.save();
  res.json({ wished: !exists, wishlist: user.wishlist });
});

const recordView = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  if (req.user) {
    const user = await User.findById(req.user._id);
    if (user) {
      user.recentlyViewed = [
        { book: book._id, viewedAt: new Date() },
        ...user.recentlyViewed.filter((entry) => String(entry.book) !== String(book._id))
      ].slice(0, 20);
      await user.save();
    }
  }

  res.json({ success: true });
});

const createBook = asyncHandler(async (req, res) => {
  const book = await Book.create(req.body);
  res.status(201).json({ book });
});

const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  res.json({ book });
});

const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  res.json({ message: 'Book deleted' });
});

module.exports = {
  listBooks,
  getBookById,
  getSuggestions,
  toggleLike,
  toggleWishlist,
  recordView,
  createBook,
  updateBook,
  deleteBook
};
