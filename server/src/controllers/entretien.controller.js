/**
 * Contrôleur pour la gestion de l'historique des entretiens
 */
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Format de réponse standardisé
function response(res, success, data = {}, message = '', statusCode = 200) {
  return res.status(statusCode).json({ success, data, message });
}

// GET /api/entretiens/mes-entretiens - CLIENT
async function getMesEntretiens(req, res) {
  try {
    const userId = req.user.userId;

    const entretiens = await prisma.entretienHistorique.findMany({
      where: { clientId: userId },
      orderBy: { dateService: 'desc' },
      include: {
        vehicule: { select: { marque: true, modele: true, annee: true } },
      },
    });

    return response(res, true, { entretiens }, 'Entretiens récupérés');
  } catch (err) {
    console.error('Erreur getMesEntretiens:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

// POST /api/entretiens - CHEF_ATELIER
async function createEntretien(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response(res, false, {}, 'Validation échouée', 400);
    }

    const { clientId, vehiculeId, typeService, description, dateService, kilometrageService } = req.body;
    const chefAtelierId = req.user.userId;

    const entretien = await prisma.entretienHistorique.create({
      data: {
        clientId,
        vehiculeId,
        typeService,
        description,
        dateService: new Date(dateService),
        kilometrageService: Number(kilometrageService),
        // Ajouter le chef_atelier_id ici si vous voulez le lier dans le modèle
      },
    });

    return response(res, true, { entretien }, 'Entretien créé');
  } catch (err) {
    console.error('Erreur createEntretien:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

// PUT /api/entretiens/:id - CHEF_ATELIER
async function updateEntretien(req, res) {
  try {
    const { id } = req.params;
    const { typeService, description, dateService, kilometrageService } = req.body;

    const entretien = await prisma.entretienHistorique.findUnique({ where: { id } });
    if (!entretien) {
      return response(res, false, {}, 'Entretien non trouvé', 404);
    }

    const updated = await prisma.entretienHistorique.update({
      where: { id },
      data: {
        ...(typeService && { typeService }),
        ...(description && { description }),
        ...(dateService && { dateService: new Date(dateService) }),
        ...(kilometrageService && { kilometrageService: Number(kilometrageService) }),
      },
    });

    return response(res, true, { entretien: updated }, 'Entretien mis à jour');
  } catch (err) {
    console.error('Erreur updateEntretien:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

module.exports = {
  getMesEntretiens,
  createEntretien,
  updateEntretien,
};