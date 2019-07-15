const Router = require('router');
const { json } = require('body-parser');

const from = require('./from');

/* global URL */

function respond(req, res, next) {
  res.statusCode = 204; // empty
  res.end();
  next();
}


module.exports = function ({ domains }) {
  const router = new Router();

  const domainRe = domains && new RegExp(domains);

  function filter(csp) {
    if (!domainRe) {
      return true;
    }
    const { hostname } = new URL(csp['document-uri']);
    return domainRe.test(hostname);
  }

  function log({ from, body: csp, log }) {

    if (!filter(csp)) {
      // skip reports for domains we are not interested in
      return;
    }

    const report = {
      from,
      ...csp
    };

    log(report);
  }

  router.post('/csp',
    from,
    json({ limit: 5000, type: [ '*/json', 'application/csp-report' ] }),
    respond,
    log
  );

  return router;
};
