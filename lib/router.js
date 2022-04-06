const Router = require('router');

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
    from,
    respond
  ];

  const filter = makeFilter(opts);
  if (filter) {
    stack.push(filter);
  }

  const logger = makeLogger(opts);

  router.post('', ...stack, log);

  return router;

  function log({ from, body }) {
    const report = {
      ...body,
      from
    };

    logger(report);
  }
};
