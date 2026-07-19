const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  getMesEntretiens,
  createEntretien,
  updateEntretien,
} = require('../controllers/entretien.controller');
const { verifyAccessToken, roleGuard } = require('../middlewares/auth.middleware');

// GET /api/entretiens/mes-entretiens - CLIENT / ADMIN
router.get('/mes-entretiens', verifyAccessToken, roleGuard('CLIENT', 'ADMIN'), getMesEntretiens);

// POST /api/entretiens - CHEF_ATELIER / ADMIN
router.post('/', verifyAccessToken, roleGuard('CHEF_ATELIER', 'ADMIN'), [
  body('clientId').isUUID().withMessage('Client ID invalide'),
  body('vehiculeId').optional({ nullable: true }).isUUID().withMessage('Véhicule ID invalide'),
  body('immatriculation').not().isEmpty().withMessage('Immatriculation requise'),
  body('typeService').not().isEmpty().withMessage('Type de service requis'),
  body('description').optional().isString(),
  body('dateService').isISO8601().withMessage('Date invalide'),
  body('kilometrageService').isInt({ min: 0 }).withMessage('Kilométrage invalide'),
  body('prochainVideange').isInt({ min: 0 }).withMessage('Prochaine vidange invalide'),
  body('prochainControle').optional({ nullable: true }).isISO8601().withMessage('Prochain contrôle invalide')
], createEntretien);

// PUT /api/entretiens/:id - CHEF_ATELIER / ADMIN
router.put('/:id', verifyAccessToken, roleGuard('CHEF_ATELIER', 'ADMIN'), [
  body('typeService').optional().isString(),
  body('description').optional().isString(),
  body('dateService').optional().isISO8601(),
  body('kilometrageService').optional().isInt({ min: 0 }),
], updateEntretien);

module.exports = router;