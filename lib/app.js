import { json } from 'node:stream/consumers';
import connect from '@pirxpilot/connect';
import mniam from 'mniam';
import * as event from './event.js';
import ping from './ping.js';
import router from './router.js';

const { ZSYP_DOMAINS: domains, ZSYP_DB: database = 'mongodb://localhost/zsyp' } = process.env;

export default function makeApp(opts = {}) {
  const app = connect();

  opts.db = mniam(database);
  app.db = opts.db;

  app.use(bodyParser());

  app.use('/csp', router({ ...opts, name: 'csp', domains }));
  app.use('/event', router({ ...opts, converter: event.converter }));
  app.use('/_/ping', ping(opts));

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
