const jwt = require('jsonwebtoken');

const generateToken = (userId, rememberMe = false, role = 'user') => {
  const expiresIn = rememberMe
    ? process.env.JWT_REMEMBER_EXPIRES_IN || '30d'
    : process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn });
};

module.exports = generateToken;
