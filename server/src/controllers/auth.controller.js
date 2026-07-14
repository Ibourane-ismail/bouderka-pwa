/**
 * Authentication controller handling user registration, login, refresh, and logout.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_default_refresh_secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Helper function to generate access token.
 * @param {Object} payload - User payload for JWT.
 * @returns {string} Signed JWT token.
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

/**
 * Helper function to generate refresh token.
 * @param {Object} payload - User payload for JWT.
 * @returns {string} Signed refresh token.
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

/**
 * Helper function to set httpOnly cookies.
 * @param {Response} res - Express response object.
 * @param {string} accessToken - Access token.
 * @param {string} refreshToken - Refresh token.
 */
function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

/**
 * Helper function to clear cookies.
 * @param {Response} res - Express response object.
 */
function clearAuthCookies(res) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
}

/**
 * POST /api/auth/register
 * Register a new user with role CLIENT by default.
 */
async function register(req, res) {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: {},
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { nom, prenom, email, telephone, motDePasse } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        data: {},
        message: 'User with this email already exists.'
      });
    }

    // Hash password with bcrypt (salt rounds: 12)
    const hashedPassword = await bcrypt.hash(motDePasse, 12);

    // Create user with default CLIENT role
    const user = await prisma.user.create({
      data: {
        nom,
        prenom,
        email,
        telephone,
        motDePasse: hashedPassword,
        role: 'CLIENT'
      }
    });

    // Return user without password
    const { motDePasse: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      success: true,
      data: { user: userWithoutPassword },
      message: 'User registered successfully.'
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      data: {},
      message: 'Internal server error during registration.'
    });
  }
}

/**
 * POST /api/auth/login
 * Authenticate user and issue JWT tokens in httpOnly cookies.
 */
async function login(req, res) {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: {},
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, motDePasse } = req.body;

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        data: {},
        message: 'Invalid email or password.'
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(motDePasse, user.motDePasse);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        data: {},
        message: 'Invalid email or password.'
      });
    }

    // Generate tokens
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);

    // Return user without password
    const { motDePasse: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      data: { user: userWithoutPassword },
      message: 'Login successful.'
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      data: {},
      message: 'Internal server error during login.'
    });
  }
}

/**
 * POST /api/auth/refresh
 * Generate new access token using valid refresh token.
 */
async function refresh(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        data: {},
        message: 'Refresh token is missing.'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    // Generate new access token
    const payload = { userId: decoded.userId, email: decoded.email, role: decoded.role };
    const newAccessToken = generateAccessToken(payload);

    // Set new access token cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      data: {},
      message: 'Access token refreshed successfully.'
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      data: {},
      message: 'Invalid or expired refresh token.'
    });
  }
}

/**
 * POST /api/auth/logout
 * Clear authentication cookies.
 */
async function logout(req, res) {
  clearAuthCookies(res);

  return res.status(200).json({
    success: true,
    data: {},
    message: 'Logout successful.'
  });
}

/**
 * GET /api/auth/me
 * Return current authenticated user.
 */
async function getMe(req, res) {
  try {
    // User is attached by verifyAccessToken middleware
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        data: {},
        message: 'User not found.'
      });
    }

    // Return user without password
    const { motDePasse: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      data: { user: userWithoutPassword },
      message: 'User profile retrieved successfully.'
    });
  } catch (err) {
    console.error('Get me error:', err);
    return res.status(500).json({
      success: false,
      data: {},
      message: 'Internal server error.'
    });
  }
}

/**
 * PUT /api/auth/me
 * Update current user profile.
 */
async function updateProfile(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: {},
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const { nom, prenom, telephone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(nom && { nom }),
        ...(prenom && { prenom }),
        ...(telephone && { telephone }),
      },
    });

    const { motDePasse: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      data: { user: userWithoutPassword },
      message: 'Profil mis à jour.'
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({
      success: false,
      data: {},
      message: 'Internal server error.'
    });
  }
}

/**
 * PUT /api/auth/password
 * Change current user password.
 */
async function changePassword(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: {},
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    const isPasswordValid = await bcrypt.compare(ancienMotDePasse, user.motDePasse);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        data: {},
        message: 'Ancien mot de passe incorrect.'
      });
    }

    const hashedPassword = await bcrypt.hash(nouveauMotDePasse, 12);
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { motDePasse: hashedPassword },
    });

    return res.status(200).json({
      success: true,
      data: {},
      message: 'Mot de passe modifié avec succès.'
    });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({
      success: false,
      data: {},
      message: 'Internal server error.'
    });
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  updateProfile,
  changePassword
};