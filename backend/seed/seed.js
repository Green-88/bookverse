require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Book = require('../models/Book');
const Author = require('../models/Author');
const Genre = require('../models/Genre');
const { genres, authors, books } = require('./seedData');

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Book.deleteMany({}),
    Author.deleteMany({}),
    Genre.deleteMany({})
  ]);

  const genreDocs = await Genre.insertMany(genres);
  const authorDocs = await Author.insertMany(authors);
  const authorMap = new Map(authorDocs.map((author) => [author.name, author._id]));

  const booksWithAuthorRefs = books.map((book) => ({
    ...book,
    authorId: authorMap.get(book.author)
  }));

  await Book.insertMany(booksWithAuthorRefs);

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    await User.create({
      name: 'BookVerse Admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
      favoriteGenres: genreDocs.slice(0, 5).map((genre) => genre.name)
    });
  }

  console.log(`Seeded ${books.length} books, ${authors.length} authors, and ${genres.length} genres.`);
  process.exit(0);
};

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
