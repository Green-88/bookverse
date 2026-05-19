const asyncHandler = require('../utils/asyncHandler');
const Author = require('../models/Author');
const Book = require('../models/Book');

const listAuthors = asyncHandler(async (_req, res) => {
  const items = await Author.find({}).sort('name');
  res.json({ items });
});

const getAuthorById = asyncHandler(async (req, res) => {
  const author = await Author.findById(req.params.id);

  if (!author) {
    res.status(404);
    throw new Error('Author not found');
  }

  const books = await Book.find({ $or: [{ author: author.name }, { authorId: author._id }] }).sort('-rating -likesCount');
  const relatedAuthors = await Author.find({ _id: { $ne: author._id }, genres: { $in: author.genres } }).limit(6);

  res.json({ author, books, relatedAuthors });
});

const createAuthor = asyncHandler(async (req, res) => {
  const author = await Author.create(req.body);
  res.status(201).json({ author });
});

const updateAuthor = asyncHandler(async (req, res) => {
  const author = await Author.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!author) {
    res.status(404);
    throw new Error('Author not found');
  }

  res.json({ author });
});

const deleteAuthor = asyncHandler(async (req, res) => {
  const author = await Author.findByIdAndDelete(req.params.id);
  if (!author) {
    res.status(404);
    throw new Error('Author not found');
  }

  res.json({ message: 'Author deleted' });
});

module.exports = {
  listAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor
};
