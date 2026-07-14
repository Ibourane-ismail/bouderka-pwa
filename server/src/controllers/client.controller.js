/**
 * Contrôleur pour la gestion des clients (ADMIN uniquement)
 */
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Format de réponse standardisé
function response(res, success, data = {}, message = '', statusCode = 200) {
  return res.status(statusCode).json({ success, data, message });
}

// GET /api/clients - ADMIN
async function getClients(req, res) {
  try {
    const clients = await prisma.user.findMany({
      where: { role: { in: ['CLIENT', 'COMMERCIAL', 'CHEF_ATELIER', 'ADMIN'] } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        actif: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            rendezVous: true,
            testDrives: true,
            entretienHistoriques: true,
          },
        },
      },
    });

    return response(res, true, { clients }, 'Clients récupérés');
  } catch (err) {
    console.error('Erreur getClients:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

// PUT /api/clients/:id/actif - ADMIN
async function toggleActif(req, res) {
  try {
    const { id } = req.params;

    const client = await prisma.user.findUnique({ where: { id } });
    if (!client) {
      return response(res, false, {}, 'Client non trouvé', 404);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { actif: !client.actif },
    });

    return response(res, true, { client: updated }, 'Statut actif mis à jour');
  } catch (err) {
    console.error('Erreur toggleActif:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

// PUT /api/clients/:id/role - ADMIN
async function updateRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['CLIENT', 'COMMERCIAL', 'CHEF_ATELIER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return response(res, false, {}, 'Rôle invalide', 400);
    }

    const client = await prisma.user.findUnique({ where: { id } });
    if (!client) {
      return response(res, false, {}, 'Client non trouvé', 404);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return response(res, true, { client: updated }, 'Rôle mis à jour');
  } catch (err) {
    console.error('Erreur updateRole:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

module.exports = {
  getClients,
  toggleActif,
  updateRole,
};