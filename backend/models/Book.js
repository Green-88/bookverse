const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
    genre: { type: String, required: true, trim: true },
    language: { type: String, required: true, trim: true },
    rating: { type: Number, default: 4.2, min: 0, max: 5 },
    description: { type: String, required: true },
    coverImage: { type: String, required: true },
    publicationYear: { type: Number, required: true },
    pages: { type: Number, required: true },
    isbn: { type: String, required: true, unique: true },
    likesCount: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
    isTrending: { type: Boolean, default: false },
    isNewRelease: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
