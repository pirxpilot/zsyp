const { json } = require('node:stream/consumers');
const connect = require('@pirxpilot/connect');
const mniam = require('mniam');
const router = require('./router');
const event = require('./event');

module.exports = makeApp;

const { ZSYP_DOMAINS: domains, ZSYP_DB: database = 'mongodb://localhost/zsyp' } = process.env;

function makeApp(opts = {}) {
  const app = connect();

  opts.db = mniam.db(database);
  app.db = opts.db;

  app.use(bodyParser());

  app.use('/csp', router({ ...opts, name: 'csp', domains }));
  app.use('/event', router({ ...opts, converter: event.converter }));

  return app;
}

function bodyParser() {
  return async (req, _res, next) => {
    if (req.method !== 'POST') {
      return next();
    }
    const contentType = req.headers['content-type'];
    if (contentType?.endsWith('json') || contentType === 'application/csp-report') {
      req.body = await json(req);
    }
    next();
  };
}
