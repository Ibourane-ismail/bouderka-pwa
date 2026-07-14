const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  creerRdv,
  getMesRdv,
  getRdvJour,
  updateStatutRdv,
  getCreneauxLibres,
} = require('../controllers/rdv.controller');

const { verifyAccessToken, roleGuard } = require('../middlewares/auth.middleware');

// POST /api/rdv - CLIENT / ADMIN crée un RDV
router.post('/', verifyAccessToken, roleGuard('CLIENT', 'ADMIN'), [
  body('dateHeure').isISO8601().withMessage('Date invalide'),
  body('motif').not().isEmpty().withMessage('Motif requis'),
], creerRdv);

// GET /api/rdv/mes-rdv - CLIENT / ADMIN voit ses propres RDV
router.get('/mes-rdv', verifyAccessToken, roleGuard('CLIENT', 'ADMIN'), getMesRdv);

// GET /api/rdv/jour - CHEF_ATELIER / ADMIN voit RDV du jour
router.get('/jour', verifyAccessToken, roleGuard('CHEF_ATELIER', 'ADMIN'), getRdvJour);

// PUT /api/rdv/:id/statut - CHEF_ATELIER / ADMIN confirme/refuse/termine
router.put('/:id/statut', verifyAccessToken, roleGuard('CHEF_ATELIER', 'ADMIN'), [
  body('statut').isIn(['EN_ATTENTE', 'CONFIRME', 'REFUSE', 'ANNULE', 'TERMINE']).withMessage('Statut invalide'),
], updateStatutRdv);

// GET /api/rdv/creneaux-libres - retourne les créneaux disponibles
router.get('/creneaux-libres', getCreneauxLibres);

module.exports = router;