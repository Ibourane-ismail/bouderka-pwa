/**
 * Instance unique de PrismaClient, partagée par tous les contrôleurs.
 * Permet de mocker Prisma une seule fois dans les tests (voir __mocks__/prisma.js).
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
