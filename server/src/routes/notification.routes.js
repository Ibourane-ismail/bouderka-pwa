const express = require('express');
const router = express.Router();
const { getNotifications, marquerLue, marquerToutesLues } = require('../controllers/notification.controller');
const { verifyAccessToken } = require('../middlewares/auth.middleware');

router.get('/', verifyAccessToken, getNotifications);
router.put('/:id/lue', verifyAccessToken, marquerLue);
router.put('/lire-toutes', verifyAccessToken, marquerToutesLues);

module.exports = router;
