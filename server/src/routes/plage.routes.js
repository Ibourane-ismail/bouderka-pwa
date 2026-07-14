const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const { getPlages, createPlage, deletePlage } = require('../controllers/plage.controller');
const { verifyAccessToken, roleGuard } = require('../middlewares/auth.middleware');

// GET /api/plages - CHEF_ATELIER / ADMIN
router.get('/', verifyAccessToken, roleGuard('CHEF_ATELIER', 'ADMIN'), getPlages);

// POST /api/plages - CHEF_ATELIER / ADMIN
router.post('/', verifyAccessToken, roleGuard('CHEF_ATELIER', 'ADMIN'), [
  body('debut').isISO8601().withMessage('Début invalide'),
  body('fin').isISO8601().withMessage('Fin invalide'),
  body('motif').optional().isString(),
], createPlage);

// DELETE /api/plages/:id - CHEF_ATELIER / ADMIN
router.delete('/:id', verifyAccessToken, roleGuard('CHEF_ATELIER', 'ADMIN'), deletePlage);

module.exports = router;