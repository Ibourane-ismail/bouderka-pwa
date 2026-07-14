/**
 * Contrôleur pour la gestion des véhicules
 */
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Format de réponse standardisé
function response(res, success, data = {}, message = '', statusCode = 200) {
  return res.status(statusCode).json({ success, data, message });
}

// GET /api/vehicules - Liste publique avec filtres
async function getVehicules(req, res) {
  try {
    const { marque, statut, prixMin, prixMax, page = 1, limit = 20 } = req.query;

    const where = {
      statut: statut || 'DISPONIBLE',
      ...(marque && { marque }),
      ...(prixMin && { prix: { gte: Number(prixMin) } }),
      ...(prixMax && { prix: { lte: Number(prixMax) } }),
    };

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [vehicules, total] = await Promise.all([
      prisma.vehicule.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vehicule.count({ where }),
    ]);

    return response(res, true, {
      vehicules,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    }, 'Véhicules récupérés avec succès');
  } catch (err) {
    console.error('Erreur getVehicules:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

// GET /api/vehicules/:id - Détail
async function getVehiculeById(req, res) {
  try {
    const { id } = req.params;

    const vehicule = await prisma.vehicule.findUnique({
      where: { id },
      include: {
        testDrives: { take: 5, orderBy: { dateHeure: 'desc' } },
        entretiens: { take: 5, orderBy: { dateService: 'desc' } },
      },
    });

    if (!vehicule) {
      return response(res, false, {}, 'Véhicule non trouvé', 404);
    }

    return response(res, true, { vehicule }, 'Véhicule récupéré');
  } catch (err) {
    console.error('Erreur getVehiculeById:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

// POST /api/vehicules - Créer (COMMERCIAL uniquement)
async function createVehicule(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response(res, false, {}, 'Validation échouée', 400);
    }

    const { marque, modele, annee, prix, prixPromo, kilometrage, carburant, transmission, description, images } = req.body;

    const vehicule = await prisma.vehicule.create({
      data: {
        marque,
        modele,
        annee: Number(annee),
        prix: Number(prix),
        prixPromo: prixPromo ? Number(prixPromo) : null,
        kilometrage: Number(kilometrage),
        carburant,
        transmission,
        description,
        images: images || [],
        statut: 'DISPONIBLE',
      },
    });

    return response(res, true, { vehicule }, 'Véhicule créé avec succès', 201);
  } catch (err) {
    console.error('Erreur createVehicule:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

// PUT /api/vehicules/:id - Modifier (COMMERCIAL uniquement)
async function updateVehicule(req, res) {
  try {
    const { id } = req.params;
    const { marque, modele, annee, prix, prixPromo, kilometrage, carburant, transmission, description, images, statut } = req.body;

    const vehicule = await prisma.vehicule.findUnique({ where: { id } });
    if (!vehicule) {
      return response(res, false, {}, 'Véhicule non trouvé', 404);
    }

    const updated = await prisma.vehicule.update({
      where: { id },
      data: {
        ...(marque && { marque }),
        ...(modele && { modele }),
        ...(annee && { annee: Number(annee) }),
        ...(prix && { prix: Number(prix) }),
        ...(prixPromo !== undefined && { prixPromo: prixPromo ? Number(prixPromo) : null }),
        ...(kilometrage && { kilometrage: Number(kilometrage) }),
        ...(carburant && { carburant }),
        ...(transmission && { transmission }),
        ...(description && { description }),
        ...(images && { images }),
        ...(statut && { statut }),
      },
    });

    return response(res, true, { vehicule: updated }, 'Véhicule mis à jour');
  } catch (err) {
    console.error('Erreur updateVehicule:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

// DELETE /api/vehicules/:id - Supprimer (COMMERCIAL uniquement)
async function deleteVehicule(req, res) {
  try {
    const { id } = req.params;

    const vehicule = await prisma.vehicule.findUnique({ where: { id } });
    if (!vehicule) {
      return response(res, false, {}, 'Véhicule non trouvé', 404);
    }

    await prisma.vehicule.delete({ where: { id } });

    return response(res, true, {}, 'Véhicule supprimé');
  } catch (err) {
    console.error('Erreur deleteVehicule:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

module.exports = {
  getVehicules,
  getVehiculeById,
  createVehicule,
  updateVehicule,
  deleteVehicule,
};