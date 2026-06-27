const request = require('supertest');
const app = require('../src/index');
const knex = require('../src/database/db');

describe('Authentication API', () => {
  let organization;

  beforeAll(async () => {
    // Create test organization
    [organization] = await knex('organizations')
      .insert({ name: 'Test Org', slug: 'test-org' })
      .returning('*');
  });

  afterAll(async () => {
    await knex.destroy();
  });

  describe('POST /api/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123',
          organization_slug: 'test-org',
          role: 'customer'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@test.com');
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          name: 'Test User 2',
          email: 'test@test.com',
          password: 'password123',
          organization_slug: 'test-org'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email already registered');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({ email: 'invalid' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'test@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/me', () => {
    let token;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ email: 'test@test.com', password: 'password123' });
      token = response.body.token;
    });

    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('test@test.com');
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/api/me');
      expect(response.status).toBe(401);
    });
  });
});