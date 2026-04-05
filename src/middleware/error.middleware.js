const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  // Log all errors in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${new Date().toISOString()}] ${err.stack}`);
  } else {
    console.error(`[${new Date().toISOString()}] ${err.message}`);
  }

  // Operational errors (our custom AppError subclasses)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: `A record with that ${err.meta?.target?.join(', ')} already exists.`,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found.',
    });
  }

  // JWT errors (should be caught in middleware, but safety net)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired.' });
  }

  // Unhandled / unexpected errors — don't leak details in production
  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'An unexpected error occurred. Please try again later.',
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
};

module.exports = { errorHandler, notFoundHandler };
