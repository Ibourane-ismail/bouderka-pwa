const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, login, refresh, logout, getMe, updateProfile, changePassword } = require('../controllers/auth.controller');
const { verifyAccessToken } = require('../middlewares/auth.middleware');

router.post('/register', [
  body('nom').not().isEmpty().withMessage('Nom requis'),
  body('prenom').not().isEmpty().withMessage('Prénom requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('telephone').isLength({ min: 10 }).withMessage('Téléphone trop court'),
  body('motDePasse').isLength({ min: 6 }).withMessage('Mot de passe trop court')
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Email invalide'),
  body('motDePasse').isLength({ min: 6 }).withMessage('Mot de passe trop court')
], login);

router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', verifyAccessToken, getMe);

router.put('/me', verifyAccessToken, [
  body('nom').optional().not().isEmpty().withMessage('Nom requis'),
  body('prenom').optional().not().isEmpty().withMessage('Prénom requis'),
  body('telephone').optional().isLength({ min: 10 }).withMessage('Téléphone trop court'),
], updateProfile);

router.put('/password', verifyAccessToken, [
  body('ancienMotDePasse').not().isEmpty().withMessage('Ancien mot de passe requis'),
  body('nouveauMotDePasse').isLength({ min: 6 }).withMessage('Nouveau mot de passe trop court'),
], changePassword);

module.exports = router;