/**
 * Contrôleur pour la gestion des rendez-vous
 */
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const { startOfDay, endOfDay, addDays } = require('date-fns');

const prisma = new PrismaClient();

// Format de réponse standardisé
function response(res, success, data = {}, message = '', statusCode = 200) {
  return res.status(statusCode).json({ success, data, message });
}

// POST /api/rdv - CLIENT crée un RDV
async function creerRdv(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response(res, false, {}, 'Validation échouée', 400);
    }

    const { clientId, dateHeure, motif } = req.body;
    const userId = req.user.userId;

    // Vérifier que l'utilisateur est bien le CLIENT
    if (clientId !== userId) {
      return response(res, false, {}, 'Accès non autorisé', 403);
    }

    const rdv = await prisma.rendezVous.create({
      data: {
        clientId,
        dateHeure: new Date(dateHeure),
        motif,
      },
    });

    return response(res, true, { rdv }, 'Rendez-vous créé avec succès', 201);
  } catch (err) {
    console.error('Erreur creerRdv:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

// GET /api/rdv/mes-rdv - CLIENT voit ses propres RDV
async function getMesRdv(req, res) {
  try {
    const userId = req.user.userId;

    const rdv = await prisma.rendezVous.findMany({
      where: { clientId: userId },
      orderBy: { dateHeure: 'desc' },
    });

    return response(res, true, { rdv }, 'Rendez-vous récupérés');
  } catch (err) {
    console.error('Erreur getMesRdv:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

// GET /api/rdv/jour - CHEF_ATELIER voit RDV du jour
async function getRdvJour(req, res) {
  try {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    const rdv = await prisma.rendezVous.findMany({
      where: {
        dateHeure: {
          gte: start,
          lte: end,
        },
      },
      include: {
        client: {
          select: { nom: true, prenom: true, email: true, telephone: true },
        },
      },
      orderBy: { dateHeure: 'asc' },
    });

    return response(res, true, { rdv }, 'Rendez-vous du jour récupérés');
  } catch (err) {
    console.error('Erreur getRdvJour:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

// PUT /api/rdv/:id/statut - CHEF_ATELIER confirme/refuse/termine
async function updateStatutRdv(req, res) {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    const rdv = await prisma.rendezVous.findUnique({ where: { id } });
    if (!rdv) {
      return response(res, false, {}, 'Rendez-vous non trouvé', 404);
    }

    const validStatuts = ['EN_ATTENTE', 'CONFIRME', 'REFUSE', 'ANNULE', 'TERMINE'];
    if (!validStatuts.includes(statut)) {
      return response(res, false, {}, 'Statut invalide', 400);
    }

    const updated = await prisma.rendezVous.update({
      where: { id },
      data: { statut },
    });

    return response(res, true, { rdv: updated }, 'Statut mis à jour');
  } catch (err) {
    console.error('Erreur updateStatutRdv:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

// GET /api/rdv/creneaux-libres - Créneaux disponibles
async function getCreneauxLibres(req, res) {
  try {
    const { date } = req.query;

    if (!date) {
      return response(res, false, {}, 'Date requise', 400);
    }

    const targetDate = new Date(date);
    const start = startOfDay(targetDate);
    const end = endOfDay(targetDate);

    // Récupérer les RDV existants et les plages bloquées
    const [rdvExistant, plagesBloquees] = await Promise.all([
      prisma.rendezVous.findMany({
        where: {
          dateHeure: { gte: start, lte: end },
          statut: { in: ['CONFIRME', 'TERMINE'] },
        },
        select: { dateHeure: true },
      }),
      prisma.plageBloquee.findMany({
        where: {
          debut: { lte: end },
          fin: { gte: start },
          statut: 'ACTIVE',
        },
        select: { debut: true, fin: true },
      }),
    ]);

    // Générer les créneaux de 9h à 18h (1h par créneau)
    const creneaux = [];
    for (let h = 9; h < 18; h++) {
      const creneau = new Date(targetDate);
      creneau.setHours(h, 0, 0, 0);
      creneaux.push(creneau);
    }

    // Filtrer les créneaux occupés
    const creneauxDisponibles = creneaux.filter(creneau => {
      // Vérifier si RDV existant
      const rdvv = rdvExistant.some(r => {
        const rd = new Date(r.dateHeure);
        return rd.getHours() === creneau.getHours();
      });
      if (rdvv) return false;

      // Vérifier si plage bloquée
      const bloquee = plagesBloquees.some(plage => {
        const debut = new Date(plage.debut);
        const fin = new Date(plage.fin);
        return creneau >= debut && creneau <= fin;
      });
      if (bloquee) return false;

      return true;
    });

    return response(res, true, { creneaux: creneauxDisponibles }, 'Créneaux disponibles récupérés');
  } catch (err) {
    console.error('Erreur getCreneauxLibres:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

module.exports = {
  creerRdv,
  getMesRdv,
  getRdvJour,
  updateStatutRdv,
  getCreneauxLibres,
};