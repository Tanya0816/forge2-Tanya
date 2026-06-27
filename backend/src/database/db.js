const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './pulsedesk.db'
  },
  useNullAsDefault: true
});

module.exports = knex;