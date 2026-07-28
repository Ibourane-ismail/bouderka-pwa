const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');
const { authCookie } = require('../../tests/helpers/auth');

describe('Rendez-vous', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Un CLIENT crée un RDV pour lui-même (201)', async () => {
    prisma.rendezVous.create.mockResolvedValue({
      id: 'rdv-1',
      clientId: 'test-user-id',
      dateHeure: new Date('2026-08-01T10:00:00.000Z'),
      motif: 'Révision',
      statut: 'EN_ATTENTE',
    });

    const res = await request(app)
      .post('/api/rdv')
      .set('Cookie', authCookie('CLIENT'))
      .send({
        clientId: 'test-user-id',
        dateHeure: '2026-08-01T10:00:00.000Z',
        motif: 'Révision',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rdv.clientId).toBe('test-user-id');
  });

  test('Un CLIENT ne peut pas créer un RDV pour un autre clientId (403)', async () => {
    const res = await request(app)
      .post('/api/rdv')
      .set('Cookie', authCookie('CLIENT'))
      .send({
        clientId: 'un-autre-client',
        dateHeure: '2026-08-01T10:00:00.000Z',
        motif: 'Révision',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(prisma.rendezVous.create).not.toHaveBeenCalled();
  });

  test('Un CHEF_ATELIER confirme un RDV → statut CONFIRME + notification créée', async () => {
    prisma.rendezVous.findUnique.mockResolvedValue({
      id: 'rdv-1',
      clientId: 'client-1',
      dateHeure: new Date('2026-08-01T10:00:00.000Z'),
      motif: 'Révision',
      statut: 'EN_ATTENTE',
    });
    prisma.rendezVous.update.mockResolvedValue({
      id: 'rdv-1',
      clientId: 'client-1',
      statut: 'CONFIRME',
    });

    const res = await request(app)
      .put('/api/rdv/rdv-1/statut')
      .set('Cookie', authCookie('CHEF_ATELIER'))
      .send({ statut: 'CONFIRME' });

    expect(res.status).toBe(200);
    expect(res.body.data.rdv.statut).toBe('CONFIRME');
    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'client-1', type: 'RDV' }),
      })
    );
  });

  test('Un CHEF_ATELIER refuse un RDV → statut REFUSE + notification créée', async () => {
    prisma.rendezVous.findUnique.mockResolvedValue({
      id: 'rdv-1',
      clientId: 'client-1',
      dateHeure: new Date('2026-08-01T10:00:00.000Z'),
      motif: 'Révision',
      statut: 'EN_ATTENTE',
    });
    prisma.rendezVous.update.mockResolvedValue({
      id: 'rdv-1',
      clientId: 'client-1',
      statut: 'REFUSE',
    });

    const res = await request(app)
      .put('/api/rdv/rdv-1/statut')
      .set('Cookie', authCookie('CHEF_ATELIER'))
      .send({ statut: 'REFUSE' });

    expect(res.status).toBe(200);
    expect(res.body.data.rdv.statut).toBe('REFUSE');
    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'client-1', type: 'RDV' }),
      })
    );
  });
});
