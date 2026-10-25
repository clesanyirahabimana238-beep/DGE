const jwt = require('jsonwebtoken');

/**
 * Authentication middleware to verify JWT tokens.
 * Extracts Bearer token from Authorization header and verifies with JWT_SECRET.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required. No token provided.' }
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded; // { id, email, role, name, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { message: 'Token has expired. Please log in again.' }
      });
    }
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid authentication token.' }
    });
  }
}

module.exports = authenticate;
