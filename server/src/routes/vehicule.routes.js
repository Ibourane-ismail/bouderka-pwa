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
  body('kilometrage').optional().isInt({ min: 0 }).withMessage('Kilométrage invalide'),
  body('carburant').not().isEmpty().withMessage('Carburant requis'),
  body('transmission').not().isEmpty().withMessage('Transmission requise'),
], createVehicule);

router.put('/:id', verifyAccessToken, roleGuard('COMMERCIAL', 'CHEF_ATELIER', 'ADMIN'), [
  body('annee').optional().isInt({ min: 1900 }).withMessage('Année invalide'),
  body('prix').optional().isFloat({ min: 0 }).withMessage('Prix invalide'),
  body('kilometrage').optional().isInt({ min: 0 }).withMessage('Kilométrage invalide'),
], updateVehicule);

router.delete('/:id', verifyAccessToken, roleGuard('COMMERCIAL', 'ADMIN'), deleteVehicule);

module.exports = router;