/**
 * Contrôleur pour la gestion des test drives
 */
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Format de réponse standardisé
function response(res, success, data = {}, message = '', statusCode = 200) {
  return res.status(statusCode).json({ success, data, message });
}

// POST /api/testdrive - CLIENT
async function creerTestDrive(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response(res, false, {}, 'Validation échouée', 400);
    }

    const { vehiculeId, dateHeure } = req.body;
    const clientId = req.user.userId;

    const testDrive = await prisma.testDrive.create({
      data: {
        clientId,
        vehiculeId,
        dateHeure: new Date(dateHeure),
      },
    });

    return response(res, true, { testDrive }, 'Test drive demandé avec succès', 201);
  } catch (err) {
    console.error('Erreur creerTestDrive:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

// GET /api/testdrive - COMMERCIAL
async function getTestDrives(req, res) {
  try {
    const { statut, page = 1, limit = 20 } = req.query;

    const where = statut ? { statut } : {};

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [testDrives, total] = await Promise.all([
      prisma.testDrive.findMany({
        where,
        skip,
        take,
        include: {
          client: { select: { nom: true, prenom: true, email: true, telephone: true } },
          vehicule: { select: { marque: true, modele: true, annee: true } },
        },
        orderBy: { dateHeure: 'desc' },
      }),
      prisma.testDrive.count({ where }),
    ]);

    return response(res, true, {
      testDrives,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    }, 'Test drives récupérés');
  } catch (err) {
    console.error('Erreur getTestDrives:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

// PUT /api/testdrive/:id/statut - COMMERCIAL
async function updateStatutTestDrive(req, res) {
  try {
    const { id } = req.params;
    const { statut, valideParId } = req.body;

    const testDrive = await prisma.testDrive.findUnique({ where: { id } });
    if (!testDrive) {
      return response(res, false, {}, 'Test drive non trouvé', 404);
    }

    const validStatuts = ['EN_ATTENTE', 'APPROUVE', 'REFUSE', 'EFFECTUE'];
    if (!validStatuts.includes(statut)) {
      return response(res, false, {}, 'Statut invalide', 400);
    }

    const updateData = { statut };
    if (statut === 'APPROUVE' && valideParId) {
      updateData.valideParId = valideParId;
    }

    const updated = await prisma.testDrive.update({
      where: { id },
      data: updateData,
    });

    return response(res, true, { testDrive: updated }, 'Statut mis à jour');
  } catch (err) {
    console.error('Erreur updateStatutTestDrive:', err);
    return response(res, false, {}, 'Erreur serveur', 500);
  }
}

module.exports = {
  creerTestDrive,
  getTestDrives,
  updateStatutTestDrive,
};