/**
 * Contrôleur pour la gestion des ventes
 */
const { validationResult } = require('express-validator');
const { startOfMonth, endOfMonth } = require('date-fns');
const { response } = require('../utils/response');
const prisma = require('../config/prisma');

// GET /api/ventes/clients - COMMERCIAL / ADMIN liste des clients (pour le formulaire de vente)
async function getClientsVente(req, res) {
  try {
    const clients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: { id: true, nom: true, prenom: true, email: true, telephone: true },
      orderBy: { nom: 'asc' },
    });

    return response(res, true, { clients }, 'Clients récupérés');
  } catch (err) {
    console.error('Erreur getClientsVente:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

// GET /api/ventes/stats - ADMIN
async function getStatsVentes(req, res) {
  try {
    const now = new Date();
    const debutMois = startOfMonth(now);
    const finMois = endOfMonth(now);

    const [totalVentes, ventesCeMois, aggTotal, aggMois] = await Promise.all([
      prisma.vente.count(),
      prisma.vente.count({ where: { dateVente: { gte: debutMois, lte: finMois } } }),
      prisma.vente.aggregate({ _sum: { prixVente: true } }),
      prisma.vente.aggregate({
        _sum: { prixVente: true },
        where: { dateVente: { gte: debutMois, lte: finMois } },
      }),
    ]);

    return response(res, true, {
      totalVentes,
      ventesCeMois,
      chiffreAffairesTotal: aggTotal._sum.prixVente || 0,
      chiffreAffairesCeMois: aggMois._sum.prixVente || 0,
    }, 'Statistiques récupérées');
  } catch (err) {
    console.error('Erreur getStatsVentes:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

// GET /api/ventes - COMMERCIAL voit ses propres ventes / ADMIN voit tout
async function getVentes(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where = req.user.role === 'ADMIN' ? {} : { commercialId: req.user.userId };

    const [ventes, total] = await Promise.all([
      prisma.vente.findMany({
        where,
        skip,
        take,
        include: {
          vehicule: { select: { marque: true, modele: true, annee: true } },
          client: { select: { nom: true, prenom: true, email: true } },
        },
        orderBy: { dateVente: 'desc' },
      }),
      prisma.vente.count({ where }),
    ]);

    return response(res, true, {
      ventes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    }, 'Ventes récupérées');
  } catch (err) {
    console.error('Erreur getVentes:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

// POST /api/ventes - COMMERCIAL
async function creerVente(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response(res, false, {}, 'Validation échouée', 400);
    }

    const { vehiculeId, clientId, cinClient, telephone, dateVente, prixVente, modePaiement, notes } = req.body;
    const commercialId = req.user.userId;

    const vehicule = await prisma.vehicule.findUnique({ where: { id: vehiculeId } });
    if (!vehicule) {
      return response(res, false, {}, 'Véhicule non trouvé', 404);
    }
    if (vehicule.statut !== 'DISPONIBLE') {
      return response(res, false, {}, "Ce véhicule n'est plus disponible à la vente", 409);
    }

    const client = await prisma.user.findUnique({ where: { id: clientId } });
    if (!client) {
      return response(res, false, {}, 'Client non trouvé', 404);
    }

    const vente = await prisma.vente.create({
      data: {
        vehiculeId,
        clientId,
        commercialId,
        cinClient,
        telephone,
        dateVente: new Date(dateVente),
        prixVente: Number(prixVente),
        modePaiement,
        notes: notes || null,
      },
    });

    // Un même véhicule (modèle) peut être vendu plusieurs fois : le statut
    // n'est plus modifié automatiquement et aucune contrainte d'unicité
    // n'empêche plus les ventes répétées sur le même véhicule.

    // Notifier le client de son achat
    try {
      await prisma.notification.create({
        data: {
          userId: clientId,
          titre: 'Félicitations !',
          message: `Votre achat du véhicule ${vehicule.marque} ${vehicule.modele} a été enregistré.`,
          type: 'INFO',
        },
      });
    } catch (notifErr) {
      console.error('Erreur création notification vente:', notifErr);
    }

    return response(res, true, { vente }, 'Vente enregistrée', 201);
  } catch (err) {
    console.error('Erreur creerVente:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

module.exports = {
  getClientsVente,
  getStatsVentes,
  getVentes,
  creerVente,
};
