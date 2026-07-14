/**
 * Authentication middleware for handling JWT tokens and role-based access.
 */
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

// Load JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_default_refresh_secret';

/**
 * Middleware to verify access token from httpOnly cookie named 'accessToken'.
 */
async function verifyAccessToken(req, res, next) {
  try {
    const cookie = req.cookies?.accessToken;
    if (!cookie) {
      return res.status(401).json({
        success: false,
        data: {},
        message: 'Access token is missing.'
      });
    }

    // Verify JWT token
    const decoded = await promisify(jwt.verify)(cookie, JWT_SECRET);
    req.user = decoded; // Attach decoded user payload to request
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      data: {},
      message: 'Invalid or expired access token.'
    });
  }
}

/**
 * Middleware to verify refresh token from httpOnly cookie named 'refreshToken'.
 */
async function verifyRefreshToken(req, res, next) {
  try {
    const cookie = req.cookies?.refreshToken;
    if (!cookie) {
      return res.status(401).json({
        success: false,
        data: {},
        message: 'Refresh token is missing.'
      });
    }

    // Verify refresh JWT token
    const decoded = await promisify(jwt.verify)(cookie, JWT_REFRESH_SECRET);
    req.refreshUser = decoded; // Attach decoded refresh payload
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      data: {},
      message: 'Invalid or expired refresh token.'
    });
  }
}

/**
 * Higher-order middleware for role-based access control.
 * @param {...string} allowedRoles - Roles that are allowed to access the route.
 * @returns {Function} Express middleware function.
 */
function roleGuard(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(403).json({
        success: false,
        data: {},
        message: 'Access denied: no role specified.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        data: {},
        message: 'Access denied: insufficient permissions.'
      });
    }

    next();
  };
}

module.exports = {
  verifyAccessToken,
  verifyRefreshToken,
  roleGuard
};