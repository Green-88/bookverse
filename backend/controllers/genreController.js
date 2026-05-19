const asyncHandler = require('../utils/asyncHandler');
const Genre = require('../models/Genre');

const listGenres = asyncHandler(async (_req, res) => {
  const items = await Genre.find({}).sort('name');
  res.json({ items });
});

const createGenre = asyncHandler(async (req, res) => {
  const genre = await Genre.create(req.body);
  res.status(201).json({ genre });
});

const updateGenre = asyncHandler(async (req, res) => {
  const genre = await Genre.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!genre) {
    res.status(404);
    throw new Error('Genre not found');
  }
  res.json({ genre });
});

const deleteGenre = asyncHandler(async (req, res) => {
  const genre = await Genre.findByIdAndDelete(req.params.id);
  if (!genre) {
    res.status(404);
    throw new Error('Genre not found');
  }
  res.json({ message: 'Genre deleted' });
});

module.exports = {
  listGenres,
  createGenre,
  updateGenre,
  deleteGenre
};
