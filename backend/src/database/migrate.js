const knex = require('./db');

async function up() {
  await knex.schema
    .createTable('organizations', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('slug').unique().notNullable();
      table.timestamps(true, true);
    })
    .createTable('users', (table) => {
      table.increments('id').primary();
      table.integer('organization_id').unsigned().notNullable();
      table.string('name').notNullable();
      table.string('email').unique().notNullable();
      table.string('password').notNullable();
      table.enum('role', ['admin', 'agent', 'customer']).notNullable();
      table.timestamps(true, true);
      table.foreign('organization_id').references('organizations.id').onDelete('CASCADE');
    })
    .createTable('tickets', (table) => {
      table.increments('id').primary();
      table.integer('organization_id').unsigned().notNullable();
      table.integer('requester_id').unsigned().notNullable();
      table.integer('assignee_id').unsigned();
      table.string('subject').notNullable();
      table.text('description').notNullable();
      table.enum('status', ['open', 'pending', 'resolved', 'closed']).defaultTo('open');
      table.enum('priority', ['low', 'medium', 'high', 'urgent']).defaultTo('medium');
      table.string('tags');
      table.timestamps(true, true);
      table.foreign('organization_id').references('organizations.id').onDelete('CASCADE');
      table.foreign('requester_id').references('users.id').onDelete('CASCADE');
      table.foreign('assignee_id').references('users.id').onDelete('SET NULL');
    })
    .createTable('ticket_replies', (table) => {
      table.increments('id').primary();
      table.integer('ticket_id').unsigned().notNullable();
      table.integer('user_id').unsigned().notNullable();
      table.text('content').notNullable();
      table.boolean('is_internal').defaultTo(false);
      table.timestamps(true, true);
      table.foreign('ticket_id').references('tickets.id').onDelete('CASCADE');
      table.foreign('user_id').references('users.id').onDelete('CASCADE');
    });

  console.log('✅ Migrations completed successfully');
}

async function down() {
  await knex.schema
    .dropTableIfExists('ticket_replies')
    .dropTableIfExists('tickets')
    .dropTableIfExists('users')
    .dropTableIfExists('organizations');

  console.log('✅ Rollback completed');
}

if (require.main === module) {
  const command = process.argv[2];
  if (command === 'down') {
    down().catch(console.error);
  } else {
    up().catch(console.error);
  }
}

module.exports = { up, down };