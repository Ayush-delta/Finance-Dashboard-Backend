const request = require('supertest');
const app = require('../app');
const prisma = require('../prisma/client');

let adminToken, analystToken, viewerToken;
let recordId;

beforeAll(async () => {
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();

  // Register users for each role
  const adminRes = await request(app).post('/api/auth/register').send({
    email: 'admin@test.com', name: 'Admin', password: 'password123', role: 'ADMIN',
  });
  const analystRes = await request(app).post('/api/auth/register').send({
    email: 'analyst@test.com', name: 'Analyst', password: 'password123', role: 'ANALYST',
  });
  const viewerRes = await request(app).post('/api/auth/register').send({
    email: 'viewer@test.com', name: 'Viewer', password: 'password123', role: 'VIEWER',
  });

  adminToken = adminRes.body.data.token;
  analystToken = analystRes.body.data.token;
  viewerToken = viewerRes.body.data.token;
});

afterAll(async () => {
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('POST /api/records', () => {
  it('admin can create a record', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 5000, type: 'INCOME', category: 'Salary', date: '2024-01-15' });

    expect(res.status).toBe(201);
    expect(res.body.data.amount).toBe(5000);
    recordId = res.body.data.id;
  });

  it('analyst can create a record', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${analystToken}`)
      .send({ amount: 200, type: 'EXPENSE', category: 'Groceries', date: '2024-01-20' });
    expect(res.status).toBe(201);
  });

  it('viewer cannot create a record', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ amount: 100, type: 'EXPENSE', category: 'Food', date: '2024-01-20' });
    expect(res.status).toBe(403);
  });

  it('rejects negative amount', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: -100, type: 'INCOME', category: 'Test', date: '2024-01-15' });
    expect(res.status).toBe(422);
  });

  it('rejects invalid type', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 100, type: 'INVALID', category: 'Test', date: '2024-01-15' });
    expect(res.status).toBe(422);
  });
});

describe('GET /api/records', () => {
  it('viewer can list records', async () => {
    const res = await request(app)
      .get('/api/records')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.pagination).toBeDefined();
  });

  it('supports filtering by type', async () => {
    const res = await request(app)
      .get('/api/records?type=INCOME')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.status).toBe(200);
    res.body.data.forEach((r) => expect(r.type).toBe('INCOME'));
  });

  it('supports pagination', async () => {
    const res = await request(app)
      .get('/api/records?page=1&limit=1')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(1);
    expect(res.body.pagination.limit).toBe(1);
  });
});

describe('PATCH /api/records/:id', () => {
  it('admin can update any record', async () => {
    const res = await request(app)
      .patch(`/api/records/${recordId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 6000, description: 'Updated salary' });
    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe(6000);
  });

  it('viewer cannot update a record', async () => {
    const res = await request(app)
      .patch(`/api/records/${recordId}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ amount: 9999 });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/records/:id (soft)', () => {
  it('admin can soft-delete a record', async () => {
    const res = await request(app)
      .delete(`/api/records/${recordId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);

    // Record should not appear in normal listing
    const listRes = await request(app)
      .get('/api/records')
      .set('Authorization', `Bearer ${viewerToken}`);
    const ids = listRes.body.data.map((r) => r.id);
    expect(ids).not.toContain(recordId);
  });

  it('admin can restore a soft-deleted record', async () => {
    const res = await request(app)
      .patch(`/api/records/${recordId}/restore`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.isDeleted).toBe(false);
  });
});

describe('GET /api/records/deleted', () => {
  it('admin can see deleted records', async () => {
    // Soft-delete the record first
    await request(app)
      .delete(`/api/records/${recordId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    const res = await request(app)
      .get('/api/records/deleted')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.some((r) => r.id === recordId)).toBe(true);
  });

  it('analyst cannot see deleted records', async () => {
    const res = await request(app)
      .get('/api/records/deleted')
      .set('Authorization', `Bearer ${analystToken}`);
    expect(res.status).toBe(403);
  });
});
