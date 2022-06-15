module.exports = makeConverter;

function makeConverter({ converter }) {

  async function convert(req, res, next) {
    try {
      const { item, meta } = await converter(req.body);
      req.item = item;
      req.meta = meta;
      return next();
    } catch(e) {
      return next(e);
    }
  }

  return converter ? convert : keep;
}

function keep(req, res, next) {
  req.item = req.body;
  return next();
}

