const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');
const { authCookie } = require('../../tests/helpers/auth');

describe("Contrôle d'accès par rôle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Un CLIENT ne peut pas créer de véhicule (403)', async () => {
    const res = await request(app)
      .post('/api/vehicules')
      .set('Cookie', authCookie('CLIENT'))
      .send({
        marque: 'VOLKSWAGEN',
        modele: 'Golf',
        annee: 2024,
        prix: 250000,
        carburant: 'Essence',
        transmission: 'Automatique',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(prisma.vehicule.create).not.toHaveBeenCalled();
  });

  test("Un CLIENT ne peut pas accéder à la liste des clients (réservée ADMIN) (403)", async () => {
    const res = await request(app)
      .get('/api/clients')
      .set('Cookie', authCookie('CLIENT'));

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });
});
