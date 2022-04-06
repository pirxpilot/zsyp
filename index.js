require('dotenv').config({ path: '/etc/default/zsyp' });

const connect = require('@pirxpilot/connect');
const mniam = require('mniam');
const { json } = require('body-parser');
const router = require('./lib/router');

const {
  ZSYP_PORT: PORT = 3090,
  ZSYP_DOMAINS: domains,
  ZSYP_DB: database = 'mongodb://localhost/zsyp'
} = process.env;

const app = connect();
const db = mniam.db(database);

app.use(json({ limit: 5000, type: [ '*/json', 'application/csp-report' ] }));
app.use('/csp', router({ domains, db, name: 'csp' }));
app.use('/event', router({ domains, db, name: 'event' }));

module.exports = app;

if (!module.parent) {
  app.listen(PORT);
  console.log('Listening on port', PORT);
}
