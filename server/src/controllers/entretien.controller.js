/**
 * Contrôleur pour la gestion de l'historique des entretiens
 */
const { validationResult } = require('express-validator');
const { response } = require('../utils/response');
const prisma = require('../config/prisma');

// GET /api/entretiens - CHEF_ATELIER liste tous les entretiens enregistrés
async function getEntretiens(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [entretiens, total] = await Promise.all([
      prisma.entretienHistorique.findMany({
        skip,
        take,
        orderBy: { dateService: 'desc' },
        include: {
          client: { select: { nom: true, prenom: true, email: true } },
          vehicule: { select: { marque: true, modele: true, annee: true } },
        },
      }),
      prisma.entretienHistorique.count(),
    ]);

    return response(res, true, {
      entretiens,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    }, 'Entretiens récupérés');
  } catch (err) {
    console.error('Erreur getEntretiens:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

// GET /api/entretiens/clients - CHEF_ATELIER liste des clients (pour le formulaire)
async function getClientsAtelier(req, res) {
  try {
    const clients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: { id: true, nom: true, prenom: true, email: true },
      orderBy: { nom: 'asc' },
    });

    return response(res, true, { clients }, 'Clients récupérés');
  } catch (err) {
    console.error('Erreur getClientsAtelier:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
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

    const { clientId, vehiculeId, immatriculation, typeService, description, dateService, kilometrageService, prochainVideange, prochainControle } = req.body;

    const entretien = await prisma.entretienHistorique.create({
      data: {
        clientId,
        vehiculeId: vehiculeId || null,
        immatriculation,
        typeService,
        description,
        dateService: new Date(dateService),
        kilometrageService: Number(kilometrageService),
        prochainVideange: Number(prochainVideange),
        prochainControle: prochainControle ? new Date(prochainControle) : null,
      },
    });

    // Notifier le client que son entretien a été enregistré
    try {
      await prisma.notification.create({
        data: {
          userId: clientId,
          titre: 'Entretien enregistré',
          message: 'Votre entretien a été enregistré par l\'atelier Bouderka.',
          type: 'ENTRETIEN',
        },
      });
    } catch (notifErr) {
      console.error('Erreur création notification entretien:', notifErr);
    }

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
    const { typeService, description, dateService, kilometrageService, immatriculation, prochainVideange, prochainControle } = req.body;

    const entretien = await prisma.entretienHistorique.findUnique({ where: { id } });
    if (!entretien) {
      return response(res, false, {}, 'Entretien non trouvé', 404);
    }

    const updated = await prisma.entretienHistorique.update({
      where: { id },
      data: {
        ...(typeService && { typeService }),
        ...(description !== undefined && { description }),
        ...(dateService && { dateService: new Date(dateService) }),
        ...(kilometrageService && { kilometrageService: Number(kilometrageService) }),
        ...(immatriculation && { immatriculation }),
        ...(prochainVideange !== undefined && { prochainVideange: Number(prochainVideange) }),
        ...(prochainControle !== undefined && { prochainControle: prochainControle ? new Date(prochainControle) : null }),
      },
    });

    return response(res, true, { entretien: updated }, 'Entretien mis à jour');
  } catch (err) {
    console.error('Erreur updateEntretien:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

module.exports = {
  getEntretiens,
  getClientsAtelier,
  getMesEntretiens,
  createEntretien,
  updateEntretien,
};