const connect = require('@pirxpilot/connect');
const mniam = require('mniam');
const { json } = require('body-parser');
const router = require('./router');
const event = require('./event');

module.exports = makeApp;

const { ZSYP_DOMAINS: domains, ZSYP_DB: database = 'mongodb://localhost/zsyp' } = process.env;

function makeApp(opts = {}) {
  const app = connect();

  opts.db = mniam.db(database);
  app.db = opts.db;

  app.use(json({ limit: 5000, type: ['*/json', 'application/csp-report'] }));
  app.use('/csp', router({ ...opts, name: 'csp', domains }));
  app.use('/event', router({ ...opts, converter: event.converter }));

  return app;
}
