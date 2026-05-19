const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  const response = {
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? null : error.stack
  };

  if (error.name === 'CastError') {
    res.status(404).json({ message: 'Resource not found', stack: response.stack });
    return;
  }

  if (error.code === 11000) {
    res.status(409).json({ message: 'Duplicate field value', stack: response.stack });
    return;
  }

  res.status(statusCode).json(response);
};

module.exports = { notFound, errorHandler };
