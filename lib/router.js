const Router = require('router');

const from = require('./from');
const makeFilter = require('./filter');
const makeConverter = require('./converter');
const makeLogger = require('./logger');

module.exports = function (opts) {
  const router = new Router({
    strict: true,
    caseSensitive: true
  });

  const stack = [
    respond,
    from,
    makeFilter(opts),
    makeConverter(opts),
    makeLogger(opts),
    opts.finalMiddleware
  ].filter(Boolean);

  router.post('/', stack);

  return router;
};

function respond(req, res, next) {
  res.statusCode = 204; // empty
  res.end();
  next();
}
