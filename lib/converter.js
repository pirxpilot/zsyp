module.exports = makeConverter;

function makeConverter({ converter }) {

  return converter ? convert : keep;

  function convert(req, res, next) {
    const { item, meta } = converter(req.body);
    req.item = item;
    req.meta = meta;
    return next();
  }

  function keep(req, res, next) {
    req.item = req.body;
    return next();
  }
}

