const Router = require('router');
const { json } = require('body-parser');

function respond(req, res, next) {
  res.statusCode = 204; // empty
  res.end();
  next();
}

function log(req) {
  const userAgent = req.headers['user-agent'];
  const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  const report = {
    userAgent,
    ipAddress,
    ...req.body
  };

  req.log(report);
}

module.exports = function() {
  const router = new Router();

  router.post('/csp',
    json({ limit: 5000, type: [ '*/json', 'application/csp-report' ] }),
    respond,
    log
  );

  return router;
};
