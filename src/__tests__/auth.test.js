const request = require('supertest');
const app = require('../app');
const prisma = require('../prisma/client');
const bcrypt = require('bcryptjs');

beforeAll(async () => {
  // Clean slate for test DB
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('registers a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe('test@example.com');
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('defaults role to VIEWER', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'viewer2@example.com',
      name: 'Viewer',
      password: 'password123',
    });
    expect(res.body.data.user.role).toBe('VIEWER');
  });

  it('rejects duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      name: 'Duplicate',
      password: 'password123',
    });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('rejects invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'not-an-email',
      name: 'Bad',
      password: 'password123',
    });
    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  it('rejects short password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'new@example.com',
      name: 'User',
      password: '123',
    });
    expect(res.status).toBe(422);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
  });

  it('rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects non-existent user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'ghost@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(401);
  });

  it('rejects deactivated user', async () => {
    await prisma.user.update({
      where: { email: 'test@example.com' },
      data: { isActive: false },
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/deactivated/i);

    // Restore
    await prisma.user.update({
      where: { email: 'test@example.com' },
      data: { isActive: true },
    });
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });
    token = res.body.data.token;
  });

  it('returns current user with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('test@example.com');
  });

  it('rejects missing token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects malformed token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not.a.real.token');
    expect(res.status).toBe(401);
  });
});
