const connect = require('@pirxpilot/connect');
const { json } = require('body-parser');
const router = require('./router');

module.exports = makeApp;

const {
  ZSYP_DOMAINS: domains,
} = process.env;


function makeApp(opts) {
  const app = connect();

  app.use(json({ limit: 5000, type: ['*/json', 'application/csp-report'] }));
  app.use('/csp', router({ ...opts, name: 'csp', domains }));
  app.use('/event', router({ ...opts, name: 'event' }));

  return app;
}

