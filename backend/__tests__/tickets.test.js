const request = require('supertest');
const knex = require('../src/database/db');

let app;
let server;

beforeAll(async () => {
  app = require('../src/index');
  server = app.listen(3001);
  await knex.migrate.latest();
  await knex.seed.run();
});

afterAll(async () => {
  await server.close();
  await knex.destroy();
});

describe('Ticket API', () => {
  let authToken;
  let orgSlug;

  beforeAll(async () => {
    // Login as admin
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@techcorp.com',
        password: 'password123'
      });
    authToken = res.body.token;
    orgSlug = res.body.organization.slug;
  });

  describe('GET /api/organizations/:orgSlug/tickets', () => {
    it('should return tickets for the organization', async () => {
      const res = await request(app)
        .get(`/api/organizations/${orgSlug}/tickets`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.tickets)).toBe(true);
      expect(res.body.tickets.length).toBeGreaterThan(0);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get(`/api/organizations/${orgSlug}/tickets?status=open`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.tickets.every(t => t.status === 'open')).toBe(true);
    });

    it('should filter by priority', async () => {
      const res = await request(app)
        .get(`/api/organizations/${orgSlug}/tickets?priority=high`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.tickets.every(t => t.priority === 'high')).toBe(true);
    });

    it('should search by subject', async () => {
      const res = await request(app)
        .get(`/api/organizations/${orgSlug}/tickets?search=login`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.tickets.some(t => 
        t.subject.toLowerCase().includes('login')
      )).toBe(true);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get(`/api/organizations/${orgSlug}/tickets`);
      
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/organizations/:orgSlug/tickets', () => {
    it('should create a new ticket', async () => {
      const res = await request(app)
        .post(`/api/organizations/${orgSlug}/tickets`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          subject: 'Test ticket from API',
          description: 'This is a test ticket created via API',
          priority: 'medium',
          tags: ['api', 'test']
        });
      
      expect(res.status).toBe(201);
      expect(res.body.ticket).toHaveProperty('id');
      expect(res.body.ticket.subject).toBe('Test ticket from API');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post(`/api/organizations/${orgSlug}/tickets`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          subject: 'Missing description'
        });
      
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/organizations/:orgSlug/tickets/:id', () => {
    let ticketId;

    beforeAll(async () => {
      const res = await request(app)
        .get(`/api/organizations/${orgSlug}/tickets`)
        .set('Authorization', `Bearer ${authToken}`);
      ticketId = res.body.tickets[0].id;
    });

    it('should get a specific ticket', async () => {
      const res = await request(app)
        .get(`/api/organizations/${orgSlug}/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.ticket).toHaveProperty('id', ticketId);
      expect(res.body.ticket).toHaveProperty('replies');
    });
  });

  describe('POST /api/organizations/:orgSlug/tickets/:id/replies', () => {
    let ticketId;

    beforeAll(async () => {
      const res = await request(app)
        .get(`/api/organizations/${orgSlug}/tickets`)
        .set('Authorization', `Bearer ${authToken}`);
      ticketId = res.body.tickets[0].id;
    });

    it('should add a reply to a ticket', async () => {
      const res = await request(app)
        .post(`/api/organizations/${orgSlug}/tickets/${ticketId}/replies`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'This is a test reply',
          is_internal: false
        });
      
      expect(res.status).toBe(201);
      expect(res.body.reply).toHaveProperty('id');
      expect(res.body.reply.content).toBe('This is a test reply');
    });

    it('should allow internal notes', async () => {
      const res = await request(app)
        .post(`/api/organizations/${orgSlug}/tickets/${ticketId}/replies`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Internal note for agents',
          is_internal: true
        });
      
      expect(res.status).toBe(201);
      expect(res.body.reply.is_internal).toBe(true);
    });
  });
});