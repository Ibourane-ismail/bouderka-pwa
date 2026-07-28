const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../app');
const prisma = require('../config/prisma');

describe('Auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Inscription réussie → utilisateur créé avec le rôle CLIENT par défaut', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      nom: 'Alami',
      prenom: 'Sara',
      email: 'sara.alami@example.com',
      telephone: '0612345678',
      motDePasse: 'hashed',
      role: 'CLIENT',
    });

    const res = await request(app).post('/api/auth/register').send({
      nom: 'Alami',
      prenom: 'Sara',
      email: 'sara.alami@example.com',
      telephone: '0612345678',
      motDePasse: 'motdepasse123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('CLIENT');
    expect(res.body.data.user.motDePasse).toBeUndefined();
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ role: 'CLIENT' }) })
    );
  });

  test("Inscription refusée si l'email existe déjà (409)", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-existing',
      email: 'sara.alami@example.com',
    });

    const res = await request(app).post('/api/auth/register').send({
      nom: 'Alami',
      prenom: 'Sara',
      email: 'sara.alami@example.com',
      telephone: '0612345678',
      motDePasse: 'motdepasse123',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  test('Connexion réussie avec les bons identifiants', async () => {
    const hashedPassword = await bcrypt.hash('motdepasse123', 12);
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      nom: 'Alami',
      prenom: 'Sara',
      email: 'sara.alami@example.com',
      telephone: '0612345678',
      motDePasse: hashedPassword,
      role: 'CLIENT',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'sara.alami@example.com',
      motDePasse: 'motdepasse123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('sara.alami@example.com');
    expect(res.headers['set-cookie'].some((c) => c.startsWith('accessToken='))).toBe(true);
  });

  test('Connexion refusée avec un mauvais mot de passe (401)', async () => {
    const hashedPassword = await bcrypt.hash('bonmotdepasse', 12);
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'sara.alami@example.com',
      motDePasse: hashedPassword,
      role: 'CLIENT',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'sara.alami@example.com',
      motDePasse: 'mauvaismotdepasse',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("Accès à /api/auth/me refusé sans cookie d'authentification (401)", async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});
