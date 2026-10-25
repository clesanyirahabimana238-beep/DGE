/**
 * Centralized error handling middleware.
 * Prevents internal details or sensitive database information from leaking to clients.
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  // In production, mask internal error messages for 500 status codes
  const isProduction = process.env.NODE_ENV === 'production';
  const message = isProduction && statusCode === 500
    ? 'Internal Server Error'
    : err.message || 'An unexpected error occurred';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(isProduction ? {} : { details: err.details || null })
    }
  });
}

module.exports = errorHandler;
