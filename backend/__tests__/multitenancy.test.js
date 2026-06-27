const request = require('supertest');
const app = require('../src/index');
const knex = require('../src/database/db');
const bcrypt = require('bcryptjs');

describe('Multi-Tenancy Tests', () => {
  let orgA, orgB;
  let userA, userB;
  let tokenA, tokenB;

  beforeAll(async () => {
    // Create two organizations
    [orgA] = await knex('organizations')
      .insert({ name: 'Org A', slug: 'org-a' })
      .returning('*');
    [orgB] = await knex('organizations')
      .insert({ name: 'Org B', slug: 'org-b' })
      .returning('*');

    // Create users in different organizations
    const password = await bcrypt.hash('password123', 10);

    [userA] = await knex('users')
      .insert({
        organization_id: orgA.id,
        name: 'User A',
        email: 'userA@orgA.com',
        password,
        role: 'admin'
      })
      .returning('*');

    [userB] = await knex('users')
      .insert({
        organization_id: orgB.id,
        name: 'User B',
        email: 'userB@orgB.com',
        password,
        role: 'admin'
      })
      .returning('*');

    // Get tokens
    const loginA = await request(app)
      .post('/api/login')
      .send({ email: 'userA@orgA.com', password: 'password123' });
    tokenA = loginA.body.token;

    const loginB = await request(app)
      .post('/api/login')
      .send({ email: 'userB@orgB.com', password: 'password123' });
    tokenB = loginB.body.token;
  });

  afterAll(async () => {
    await knex.destroy();
  });

  describe('Organization Data Isolation', () => {
    it('user from Org A cannot access Org B tickets via wrong orgSlug', async () => {
      const response = await request(app)
        .get('/api/organizations/org-b/tickets')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('not a member');
    });

    it('user from Org B cannot access Org A tickets via wrong orgSlug', async () => {
      const response = await request(app)
        .get('/api/organizations/org-a/tickets')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('not a member');
    });

    it('user can access their own organization tickets', async () => {
      const response = await request(app)
        .get('/api/organizations/org-a/tickets')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Cross-Organization Data Access Prevention', () => {
    let ticketA, ticketB;

    beforeAll(async () => {
      // Create tickets in each organization
      [ticketA] = await knex('tickets')
        .insert({
          organization_id: orgA.id,
          requester_id: userA.id,
          subject: 'Ticket in Org A',
          description: 'Description',
          status: 'open',
          priority: 'medium'
        })
        .returning('*');

      [ticketB] = await knex('tickets')
        .insert({
          organization_id: orgB.id,
          requester_id: userB.id,
          subject: 'Ticket in Org B',
          description: 'Description',
          status: 'open',
          priority: 'medium'
        })
        .returning('*');
    });

    it('user from Org A cannot access Org B ticket directly', async () => {
      const response = await request(app)
        .get(`/api/organizations/org-a/tickets/${ticketB.id}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect([404, 403]).toContain(response.status);
    });

    it('user from Org B cannot access Org A ticket directly', async () => {
      const response = await request(app)
        .get(`/api/organizations/org-b/tickets/${ticketA.id}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect([404, 403]).toContain(response.status);
    });
  });

  describe('Customer Data Isolation', () => {
    let customerA1, customerA2, agentA;
    let customerTokenA1, customerTokenA2, agentTokenA;

    beforeAll(async () => {
      const password = await bcrypt.hash('password123', 10);

      // Create two customers in same organization
      [customerA1] = await knex('users')
        .insert({
          organization_id: orgA.id,
          name: 'Customer A1',
          email: 'customerA1@orgA.com',
          password,
          role: 'customer'
        })
        .returning('*');

      [customerA2] = await knex('users')
        .insert({
          organization_id: orgA.id,
          name: 'Customer A2',
          email: 'customerA2@orgA.com',
          password,
          role: 'customer'
        })
        .returning('*');

      // Create an agent
      [agentA] = await knex('users')
        .insert({
          organization_id: orgA.id,
          name: 'Agent A',
          email: 'agentA@orgA.com',
          password,
          role: 'agent'
        })
        .returning('*');

      // Create tickets for each customer
      await knex('tickets')
        .insert({
          organization_id: orgA.id,
          requester_id: customerA1.id,
          assignee_id: agentA.id,
          subject: 'Customer A1 Ticket',
          description: 'Description',
          status: 'open',
          priority: 'medium'
        });

      await knex('tickets')
        .insert({
          organization_id: orgA.id,
          requester_id: customerA2.id,
          assignee_id: agentA.id,
          subject: 'Customer A2 Ticket',
          description: 'Description',
          status: 'open',
          priority: 'medium'
        });

      // Get tokens
      const loginA1 = await request(app)
        .post('/api/login')
        .send({ email: 'customerA1@orgA.com', password: 'password123' });
      customerTokenA1 = loginA1.body.token;

      const loginA2 = await request(app)
        .post('/api/login')
        .send({ email: 'customerA2@orgA.com', password: 'password123' });
      customerTokenA2 = loginA2.body.token;

      const loginAgent = await request(app)
        .post('/api/login')
        .send({ email: 'agentA@orgA.com', password: 'password123' });
      agentTokenA = loginAgent.body.token;
    });

    it('customer only sees their own tickets', async () => {
      const response = await request(app)
        .get('/api/organizations/org-a/tickets')
        .set('Authorization', `Bearer ${customerTokenA1}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].requester_name).toBe('Customer A1');
    });

    it('customer cannot create internal notes', async () => {
      const tickets = await request(app)
        .get('/api/organizations/org-a/tickets')
        .set('Authorization', `Bearer ${customerTokenA1}`);

      const response = await request(app)
        .post(`/api/organizations/org-a/tickets/${tickets.body.data[0].id}/replies`)
        .set('Authorization', `Bearer ${customerTokenA1}`)
        .send({
          content: 'This should be an internal note',
          is_internal: true
        });

      expect(response.status).toBe(403);
    });

    it('agent sees all tickets in organization', async () => {
      const response = await request(app)
        .get('/api/organizations/org-a/tickets')
        .set('Authorization', `Bearer ${agentTokenA}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
    });
  });
});