const jwt = require('jsonwebtoken');

/**
 * Construit un cookie "accessToken" valide pour un rôle donné,
 * afin de tester roleGuard sans passer par le flux /login complet.
 */
function authCookie(role, overrides = {}) {
  const payload = {
    userId: 'test-user-id',
    email: 'test@example.com',
    role,
    ...overrides,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
  return `accessToken=${token}`;
}

module.exports = { authCookie };
