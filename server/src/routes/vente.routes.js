const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  getClientsVente,
  getStatsVentes,
  getVentes,
  creerVente,
} = require('../controllers/vente.controller');
const { verifyAccessToken, roleGuard } = require('../middlewares/auth.middleware');

const MODES_PAIEMENT = ['ESPECES', 'CARTE_BANCAIRE', 'VIREMENT'];

// GET /api/ventes/stats - ADMIN
router.get('/stats', verifyAccessToken, roleGuard('ADMIN'), getStatsVentes);

// GET /api/ventes/clients - COMMERCIAL / ADMIN
router.get('/clients', verifyAccessToken, roleGuard('COMMERCIAL', 'ADMIN'), getClientsVente);

// GET /api/ventes - COMMERCIAL / ADMIN
router.get('/', verifyAccessToken, roleGuard('COMMERCIAL', 'ADMIN'), getVentes);

// POST /api/ventes - COMMERCIAL
router.post('/', verifyAccessToken, roleGuard('COMMERCIAL'), [
  body('vehiculeId').isUUID().withMessage('Véhicule invalide'),
  body('clientId').isUUID().withMessage('Client invalide'),
  body('cinClient').not().isEmpty().withMessage('CIN requis'),
  body('telephone').isLength({ min: 10 }).withMessage('Téléphone invalide'),
  body('dateVente').isISO8601().withMessage('Date invalide'),
  body('prixVente').isFloat({ min: 0 }).withMessage('Prix invalide'),
  body('modePaiement').isIn(MODES_PAIEMENT).withMessage('Mode de paiement invalide'),
  body('notes').optional().isString(),
], creerVente);

module.exports = router;
