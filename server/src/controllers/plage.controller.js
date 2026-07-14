/**
 * Contrôleur pour la gestion des plages bloquées
 */
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Format de réponse standardisé
function response(res, success, data = {}, message = '', statusCode = 200) {
  return res.status(statusCode).json({ success, data, message });
}

// GET /api/plages - CHEF_ATELIER
async function getPlages(req, res) {
  try {
    const { statut } = req.query;

    const where = statut ? { statut } : {};

    const plages = await prisma.plageBloquee.findMany({
      where,
      include: {
        creePar: {
          select: { nom: true, prenom: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return response(res, true, { plages }, 'Plages bloquées récupérées');
  } catch (err) {
    console.error('Erreur getPlages:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

// POST /api/plages - CHEF_ATELIER
async function createPlage(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response(res, false, {}, 'Validation échouée', 400);
    }

    const { debut, fin, motif } = req.body;
    const creeParId = req.user.userId;

    const plage = await prisma.plageBloquee.create({
      data: {
        debut: new Date(debut),
        fin: new Date(fin),
        motif,
        creeParId,
      },
    });

    return response(res, true, { plage }, 'Plage bloquée créée', 201);
  } catch (err) {
    console.error('Erreur createPlage:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

// DELETE /api/plages/:id - CHEF_ATELIER
async function deletePlage(req, res) {
  try {
    const { id } = req.params;

    const plage = await prisma.plageBloquee.findUnique({ where: { id } });
    if (!plage) {
      return response(res, false, {}, 'Plage bloquée non trouvée', 404);
    }

    await prisma.plageBloquee.delete({ where: { id } });

    return response(res, true, {}, 'Plage bloquée supprimée');
  } catch (err) {
    console.error('Erreur deletePlage:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

module.exports = {
  getPlages,
  createPlage,
  deletePlage,
};