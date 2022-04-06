const Router = require('router');
const { json } = require('body-parser');

const from = require('./from');
const makeFilter = require('./filter');
const makeLogger = require('./logger');

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
    json({ limit: 5000, type: [ '*/json', 'application/csp-report' ] }),
    from,
    respond
  ];

  const filter = makeFilter(opts);
  if (filter) {
    stack.push(filter);
  }

  const logger = makeLogger(opts);

  router.post('/csp', ...stack, log);

  return router;

  function log({ from, body }) {
    const report = {
      ...body,
      from
    };

    logger(report);
  }
};
