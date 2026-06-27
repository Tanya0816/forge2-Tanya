const bcrypt = require('bcryptjs');
const knex = require('./db');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  console.log('🌱 Starting seed...');

  // Create organization
  const org = await knex('organizations').insert({
    name: 'Acme Corp',
    slug: 'acme-corp'
  }).returning('*');
  const organization = org[0];
  console.log(`✅ Created organization: ${organization.name}`);

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create users
  const admin = await knex('users').insert({
    organization_id: organization.id,
    name: 'Admin User',
    email: 'admin@acme.com',
    password: hashedPassword,
    role: 'admin'
  }).returning('*');

  const agent1 = await knex('users').insert({
    organization_id: organization.id,
    name: 'Agent Smith',
    email: 'agent1@acme.com',
    password: hashedPassword,
    role: 'agent'
  }).returning('*');

  const agent2 = await knex('users').insert({
    organization_id: organization.id,
    name: 'Agent Johnson',
    email: 'agent2@acme.com',
    password: hashedPassword,
    role: 'agent'
  }).returning('*');

  const customer1 = await knex('users').insert({
    organization_id: organization.id,
    name: 'Customer Alice',
    email: 'alice@acme.com',
    password: hashedPassword,
    role: 'customer'
  }).returning('*');

  const customer2 = await knex('users').insert({
    organization_id: organization.id,
    name: 'Customer Bob',
    email: 'bob@acme.com',
    password: hashedPassword,
    role: 'customer'
  }).returning('*');

  console.log('✅ Created users: 1 admin, 2 agents, 2 customers');

  // Ticket data
  const ticketData = [
    {
      organization_id: organization.id,
      requester_id: customer1[0].id,
      assignee_id: agent1[0].id,
      subject: 'Unable to login to dashboard',
      description: 'I keep getting an authentication error when trying to login.',
      status: 'open',
      priority: 'urgent',
      tags: 'auth,login',
    },
    {
      organization_id: organization.id,
      requester_id: customer1[0].id,
      assignee_id: agent2[0].id,
      subject: 'Export functionality not working',
      description: 'The CSV export button does nothing when clicked.',
      status: 'pending',
      priority: 'high',
      tags: 'feature,bug',
    },
    {
      organization_id: organization.id,
      requester_id: customer2[0].id,
      assignee_id: agent1[0].id,
      subject: 'Slow page load times',
      description: 'The dashboard takes over 10 seconds to load.',
      status: 'resolved',
      priority: 'medium',
      tags: 'performance',
    },
    {
      organization_id: organization.id,
      requester_id: customer1[0].id,
      assignee_id: agent1[0].id,
      subject: 'Missing data in reports',
      description: 'Some entries are not showing up in the weekly report.',
      status: 'open',
      priority: 'medium',
      tags: 'reporting',
    },
    {
      organization_id: organization.id,
      requester_id: customer2[0].id,
      assignee_id: agent2[0].id,
      subject: 'Unable to upload files',
      description: 'File upload fails after 50% progress.',
      status: 'pending',
      priority: 'high',
      tags: 'upload,bug',
    },
    {
      organization_id: organization.id,
      requester_id: customer1[0].id,
      assignee_id: null,
      subject: 'Request for new feature',
      description: 'We need a bulk edit feature for items.',
      status: 'open',
      priority: 'low',
      tags: 'feature-request',
    },
    {
      organization_id: organization.id,
      requester_id: customer2[0].id,
      assignee_id: agent1[0].id,
      subject: 'Email notifications not received',
      description: 'Not getting email notifications for ticket updates.',
      status: 'resolved',
      priority: 'medium',
      tags: 'notification,email',
    },
    {
      organization_id: organization.id,
      requester_id: customer1[0].id,
      assignee_id: agent2[0].id,
      subject: 'Permission denied error',
      description: 'Getting permission denied when accessing settings.',
      status: 'closed',
      priority: 'urgent',
      tags: 'permission,security',
    },
    {
      organization_id: organization.id,
      requester_id: customer2[0].id,
      assignee_id: null,
      subject: 'Mobile app crashes on startup',
      description: 'The iOS app crashes immediately after launch.',
      status: 'open',
      priority: 'urgent',
      tags: 'mobile,bug',
    },
    {
      organization_id: organization.id,
      requester_id: customer1[0].id,
      assignee_id: agent1[0].id,
      subject: 'Invoice generation failing',
      description: 'Invoice PDF is not being generated correctly.',
      status: 'pending',
      priority: 'high',
      tags: 'billing,invoice',
    },
    {
      organization_id: organization.id,
      requester_id: customer2[0].id,
      assignee_id: agent2[0].id,
      subject: 'Search results inaccurate',
      description: 'Search does not return all matching items.',
      status: 'resolved',
      priority: 'low',
      tags: 'search,bug',
    },
    {
      organization_id: organization.id,
      requester_id: customer1[0].id,
      assignee_id: agent1[0].id,
      subject: 'API rate limiting issues',
      description: 'Our integration is hitting rate limits unexpectedly.',
      status: 'closed',
      priority: 'high',
      tags: 'api,integration',
    }
  ];

  const tickets = await knex('tickets').insert(ticketData).returning('*');
  console.log(`✅ Created ${tickets.length} tickets`);

  // Add some replies
  const replyData = [
    {
      ticket_id: tickets[0].id,
      user_id: agent1[0].id,
      content: 'I see the issue. Please try clearing your browser cache and cookies.',
      is_internal: false
    },
    {
      ticket_id: tickets[0].id,
      user_id: customer1[0].id,
      content: 'That worked! Thanks for the quick help.',
      is_internal: false
    },
    {
      ticket_id: tickets[1].id,
      user_id: agent2[0].id,
      content: 'Looking into this - seems to be a JavaScript error.',
      is_internal: true
    },
    {
      ticket_id: tickets[2].id,
      user_id: agent1[0].id,
      content: 'Fixed! It was a database query issue. Let me know if you see any more slowdown.',
      is_internal: false
    }
  ];

  await knex('ticket_replies').insert(replyData);
  console.log(`✅ Created ${replyData.length} ticket replies`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Demo credentials:');
  console.log('Admin: admin@acme.com / password123');
  console.log('Agent 1: agent1@acme.com / password123');
  console.log('Agent 2: agent2@acme.com / password123');
  console.log('Customer 1: alice@acme.com / password123');
  console.log('Customer 2: bob@acme.com / password123');
  console.log('Organization: acme-corp');

  await knex.destroy();
}

if (require.main === module) {
  seed().catch(console.error);
}

module.exports = seed;