const Router = require('router');
const { json } = require('body-parser');

const from = require('./from');
const makeFilter = require('./filter');

function respond(req, res, next) {
  res.statusCode = 204; // empty
  res.end();
  next();
}


function log({ from, body: csp, log }) {
  const report = {
    from,
    ...csp
  };

  log(report);
}

module.exports = function (opts) {
  const router = new Router();
  const filter = makeFilter(opts);

  router.post('/csp',
    from,
    json({ limit: 5000, type: [ '*/json', 'application/csp-report' ] }),
    respond,
    filter,
    log
  );

  return router;
};
