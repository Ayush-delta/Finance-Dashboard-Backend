const request = require('supertest');
const app = require('../app');
const prisma = require('../prisma/client');

let adminToken, analystToken, viewerToken;

beforeAll(async () => {
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();

  const adminRes = await request(app).post('/api/auth/register').send({
    email: 'dash_admin@test.com', name: 'Admin', password: 'password123', role: 'ADMIN',
  });
  const analystRes = await request(app).post('/api/auth/register').send({
    email: 'dash_analyst@test.com', name: 'Analyst', password: 'password123', role: 'ANALYST',
  });
  const viewerRes = await request(app).post('/api/auth/register').send({
    email: 'dash_viewer@test.com', name: 'Viewer', password: 'password123', role: 'VIEWER',
  });

  adminToken = adminRes.body.data.token;
  analystToken = analystRes.body.data.token;
  viewerToken = viewerRes.body.data.token;

  const adminId = adminRes.body.data.user.id;

  // Seed some records for aggregation testing
  await prisma.financialRecord.createMany({
    data: [
      { amount: 5000, type: 'INCOME',  category: 'Salary',     date: new Date('2024-01-01'), createdById: adminId },
      { amount: 1000, type: 'INCOME',  category: 'Freelance',  date: new Date('2024-01-15'), createdById: adminId },
      { amount: 800,  type: 'EXPENSE', category: 'Rent',       date: new Date('2024-01-05'), createdById: adminId },
      { amount: 200,  type: 'EXPENSE', category: 'Groceries',  date: new Date('2024-01-20'), createdById: adminId },
      { amount: 3000, type: 'INCOME',  category: 'Salary',     date: new Date('2024-02-01'), createdById: adminId },
      { amount: 500,  type: 'EXPENSE', category: 'Utilities',  date: new Date('2024-02-10'), createdById: adminId },
    ],
  });
});

afterAll(async () => {
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('GET /api/dashboard/summary', () => {
  it('analyst can access summary', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${analystToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totalIncome');
    expect(res.body.data).toHaveProperty('totalExpenses');
    expect(res.body.data).toHaveProperty('netBalance');
    expect(res.body.data.totalIncome).toBe(9000);
    expect(res.body.data.totalExpenses).toBe(1500);
    expect(res.body.data.netBalance).toBe(7500);
  });

  it('viewer cannot access summary', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.status).toBe(403);
  });

  it('unauthenticated request is rejected', async () => {
    const res = await request(app).get('/api/dashboard/summary');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/dashboard/categories', () => {
  it('returns category breakdown', async () => {
    const res = await request(app)
      .get('/api/dashboard/categories')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data[0]).toHaveProperty('category');
    expect(res.body.data[0]).toHaveProperty('total');
  });

  it('filters by type=INCOME', async () => {
    const res = await request(app)
      .get('/api/dashboard/categories?type=INCOME')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    res.body.data.forEach((item) => expect(item.type).toBe('INCOME'));
  });
});

describe('GET /api/dashboard/trends/monthly', () => {
  it('returns monthly trend data', async () => {
    const res = await request(app)
      .get('/api/dashboard/trends/monthly?months=6')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    if (res.body.data.length > 0) {
      expect(res.body.data[0]).toHaveProperty('month');
      expect(res.body.data[0]).toHaveProperty('income');
      expect(res.body.data[0]).toHaveProperty('expenses');
      expect(res.body.data[0]).toHaveProperty('net');
    }
  });
});

describe('GET /api/dashboard/range-summary', () => {
  it('returns summary for a date range', async () => {
    const res = await request(app)
      .get('/api/dashboard/range-summary?startDate=2024-01-01&endDate=2024-01-31')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalIncome).toBe(6000);
    expect(res.body.data.totalExpenses).toBe(1000);
    expect(res.body.data.netBalance).toBe(5000);
  });
});

describe('GET /api/dashboard/top-categories', () => {
  it('returns top N categories', async () => {
    const res = await request(app)
      .get('/api/dashboard/top-categories?limit=3')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(3);
    expect(res.body.data[0]).toHaveProperty('category');
    expect(res.body.data[0]).toHaveProperty('total');
  });
});
