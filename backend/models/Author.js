const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    bio: { type: String, required: true },
    image: { type: String, required: true },
    nationality: { type: String, required: true },
    famousBooks: [{ type: String, trim: true }],
    genres: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Author', authorSchema);
