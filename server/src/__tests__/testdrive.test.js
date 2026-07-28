const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');
const { authCookie } = require('../../tests/helpers/auth');

describe('Test drive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Un COMMERCIAL approuve un test drive → notification créée', async () => {
    prisma.testDrive.findUnique.mockResolvedValue({
      id: 'td-1',
      clientId: 'client-1',
      vehiculeId: 'vehicule-1',
      statut: 'EN_ATTENTE',
      vehicule: { marque: 'VOLKSWAGEN', modele: 'Golf' },
    });
    prisma.testDrive.update.mockResolvedValue({
      id: 'td-1',
      clientId: 'client-1',
      statut: 'APPROUVE',
    });

    const res = await request(app)
      .put('/api/testdrive/td-1/statut')
      .set('Cookie', authCookie('COMMERCIAL'))
      .send({ statut: 'APPROUVE' });

    expect(res.status).toBe(200);
    expect(res.body.data.testDrive.statut).toBe('APPROUVE');
    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'client-1', type: 'TEST_DRIVE' }),
      })
    );
  });
});
