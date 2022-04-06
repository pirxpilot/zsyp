const Router = require('router');
const { json } = require('body-parser');

const from = require('./from');
const makeFilter = require('./filter');

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

module.exports = function (opts) {
  const router = new Router({
    strict: true,
    caseSensitive: true
  });

  const stack = [
    from,
    json({ limit: 5000, type: [ '*/json', 'application/csp-report' ] }),
    respond
  ];

  const filter = makeFilter(opts);
  if (filter) {
    stack.push(filter);
  }

  router.post('/csp', ...stack, log);

  return router;
};
