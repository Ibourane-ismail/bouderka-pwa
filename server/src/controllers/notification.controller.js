/**
 * Contrôleur pour la gestion des notifications
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Format de réponse standardisé
function response(res, success, data = {}, message = '', statusCode = 200) {
  return res.status(statusCode).json({ success, data, message });
}

// GET /api/notifications - utilisateur connecté
async function getNotifications(req, res) {
  try {
    const userId = req.user.userId;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return response(res, true, { notifications }, 'Notifications récupérées');
  } catch (err) {
    console.error('Erreur getNotifications:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

// PUT /api/notifications/:id/lue - marquer comme lue
async function marquerLue(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      return response(res, false, {}, 'Notification non trouvée', 404);
    }

    if (notification.userId !== userId) {
      return response(res, false, {}, 'Accès non autorisé', 403);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { lue: true },
    });

    return response(res, true, { notification: updated }, 'Notification marquée comme lue');
  } catch (err) {
    console.error('Erreur marquerLue:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

// PUT /api/notifications/lire-toutes - marquer toutes comme lues
async function marquerToutesLues(req, res) {
  try {
    const userId = req.user.userId;

    await prisma.notification.updateMany({
      where: { userId, lue: false },
      data: { lue: true },
    });

    return response(res, true, {}, 'Toutes les notifications marquées comme lues');
  } catch (err) {
    console.error('Erreur marquerToutesLues:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

module.exports = {
  getNotifications,
  marquerLue,
  marquerToutesLues,
};