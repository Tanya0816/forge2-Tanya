const knex = require('knex')({
  client: 'better-sqlite3',
  connection: {
    filename: './pulsedesk.db'
  },
  useNullAsDefault: true
});

module.exports = knex;