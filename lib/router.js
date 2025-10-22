import makeConverter from './converter.js';
import makeFilter from './filter.js';
import from from './from.js';
import makeLogger from './logger.js';

export default function router(opts) {
  const stack = [respond, from, makeFilter(opts), makeConverter(opts), makeLogger(opts), opts.finalMiddleware].filter(
    Boolean
  );

  return loop(stack);
}

function loop(stack) {
  return (req, res, next) => {
    let i = 0;
    fn();

    function fn() {
      const layer = stack[i++];
      if (!layer) {
        return next();
      }
      try {
        layer(req, res, fn);
      } catch (err) {
        next(err);
      }
    }
  };
}

function respond(req, res, next) {
  if (req.method !== 'POST' && req.path !== '/') {
    res.statusCode = 404;
    res.end();
    return;
  }
  res.statusCode = 204; // empty
  res.end();
  next();
}
