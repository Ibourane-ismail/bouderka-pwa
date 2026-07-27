const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  getVehicules,
  getVehiculeById,
  createVehicule,
  updateVehicule,
  deleteVehicule,
} = require('../controllers/vehicule.controller');

const { verifyAccessToken, roleGuard } = require('../middlewares/auth.middleware');

// Routes publiques
router.get('/', getVehicules);
router.get('/:id', getVehiculeById);

// Routes protégées - COMMERCIAL / ADMIN
router.post('/', verifyAccessToken, roleGuard('COMMERCIAL', 'ADMIN'), [
  body('marque').not().isEmpty().withMessage('Marque requise'),
  body('modele').not().isEmpty().withMessage('Modèle requis'),
  body('annee').isInt({ min: 1900 }).withMessage('Année invalide'),
  body('prix').isFloat({ min: 0 }).withMessage('Prix invalide'),
  body('carburant').not().isEmpty().withMessage('Carburant requis'),
  body('transmission').not().isEmpty().withMessage('Transmission requise'),
  body('images').optional().isArray().withMessage('Images invalides'),
  body('images.*').isURL({ protocols: ['http', 'https'], require_protocol: true }).isLength({ max: 2000 }).withMessage('Chaque image doit être une URL http(s) valide (2000 caractères max)'),
], createVehicule);

router.put('/:id', verifyAccessToken, roleGuard('COMMERCIAL', 'CHEF_ATELIER', 'ADMIN'), [
  body('annee').optional().isInt({ min: 1900 }).withMessage('Année invalide'),
  body('prix').optional().isFloat({ min: 0 }).withMessage('Prix invalide'),
  body('images').optional().isArray().withMessage('Images invalides'),
  body('images.*').isURL({ protocols: ['http', 'https'], require_protocol: true }).isLength({ max: 2000 }).withMessage('Chaque image doit être une URL http(s) valide (2000 caractères max)'),
], updateVehicule);

router.delete('/:id', verifyAccessToken, roleGuard('COMMERCIAL', 'ADMIN'), deleteVehicule);

module.exports = router;