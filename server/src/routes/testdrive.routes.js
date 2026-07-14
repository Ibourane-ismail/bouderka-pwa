const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  creerTestDrive,
  getTestDrives,
  updateStatutTestDrive,
} = require('../controllers/testdrive.controller');
const { verifyAccessToken, roleGuard } = require('../middlewares/auth.middleware');

// POST /api/testdrive - CLIENT / ADMIN
router.post('/', verifyAccessToken, roleGuard('CLIENT', 'ADMIN'), [
  body('vehiculeId').isUUID().withMessage('ID véhicule invalide'),
  body('dateHeure').isISO8601().withMessage('Date invalide'),
], creerTestDrive);

// GET /api/testdrive - COMMERCIAL / ADMIN
router.get('/', verifyAccessToken, roleGuard('COMMERCIAL', 'ADMIN'), getTestDrives);

// PUT /api/testdrive/:id/statut - COMMERCIAL / ADMIN
router.put('/:id/statut', verifyAccessToken, roleGuard('COMMERCIAL', 'ADMIN'), [
  body('statut').isIn(['EN_ATTENTE', 'APPROUVE', 'REFUSE', 'EFFECTUE']).withMessage('Statut invalide'),
  body('valideParId').optional().isUUID().withMessage('ID validateur invalide'),
], updateStatutTestDrive);

module.exports = router;