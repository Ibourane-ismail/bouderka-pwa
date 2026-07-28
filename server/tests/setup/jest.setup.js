process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.CLIENT_URL = 'http://localhost:5173';

// Mock manuel automatique : voir src/config/__mocks__/prisma.js
jest.mock('../../src/config/prisma');
