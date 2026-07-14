const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  getClients,
  toggleActif,
  updateRole,
} = require('../controllers/client.controller');

const { verifyAccessToken, roleGuard } = require('../middlewares/auth.middleware');

// GET /api/clients - ADMIN
router.get('/', verifyAccessToken, roleGuard('ADMIN'), getClients);

// PUT /api/clients/:id/actif - ADMIN
router.put('/:id/actif', verifyAccessToken, roleGuard('ADMIN'), toggleActif);

// PUT /api/clients/:id/role - ADMIN
router.put('/:id/role', verifyAccessToken, roleGuard('ADMIN'), [
  body('role').isIn(['CLIENT', 'COMMERCIAL', 'CHEF_ATELIER', 'ADMIN']).withMessage('Rôle invalide')
], updateRole);

module.exports = router;