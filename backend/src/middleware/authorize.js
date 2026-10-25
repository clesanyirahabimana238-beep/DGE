/**
 * Role-based authorization middleware.
 * @param  {...string} allowedRoles - List of authorized roles (e.g., 'seller', 'client')
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required.' }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: `Access denied. Requires one of: ${allowedRoles.join(', ')}` }
      });
    }

    next();
  };
}

module.exports = authorize;
