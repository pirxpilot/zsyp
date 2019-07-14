const Router = require('router');
const { json } = require('body-parser');
const from = require('./from');

function respond(req, res, next) {
  res.statusCode = 204; // empty
  res.end();
  next();
}

function log({ from, body, log }) {
  const report = {
    from,
    ...body
  };

  log(report);
}

module.exports = function() {
  const router = new Router();

  router.post('/csp',
    from,
    json({ limit: 5000, type: [ '*/json', 'application/csp-report' ] }),
    respond,
    log
  );

  return router;
};
