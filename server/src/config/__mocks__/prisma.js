/**
 * Mock manuel du singleton Prisma, utilisé automatiquement par Jest
 * (voir tests/setup/jest.setup.js qui appelle jest.mock('../src/config/prisma')).
 */
const { mockDeep } = require('jest-mock-extended');

module.exports = mockDeep();
