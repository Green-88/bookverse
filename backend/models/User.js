const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
    },
    favoriteGenres: [{ type: String, trim: true }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    likedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    recentlyViewed: [
      {
        book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
        viewedAt: { type: Date, default: Date.now }
      }
    ],
    searchHistory: [{ type: String, trim: true }],
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
