const Router = require('router');
const debug = require('debug')('zsyp:router');

const from = require('./from');
const makeFilter = require('./filter');

function respond(req, res, next) {
  res.statusCode = 204; // empty
  res.end();
  next();
}

module.exports = function (opts) {
  const router = new Router({
    strict: true,
    caseSensitive: true
  });

  const stack = [
    from,
    respond
  ];

  const filter = makeFilter(opts);
  if (filter) {
    stack.push(filter);
  }

  const logger = opts.logger(opts);

  router.post('/', ...stack, log);

  return router;

  function log({ from, body }) {
    const report = {
      ...body,
      from
    };

    debug('Logging report %j', report);
    logger(report);
  }
};
