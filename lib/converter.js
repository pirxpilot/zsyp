export default function makeConverter({ converter }) {
  async function convert(req, _res, next) {
    try {
      const { item, meta } = await converter(req.body);
      req.item = item;
      req.meta = meta;
      return next();
    } catch (e) {
      return next(e);
    }
  }

  return converter ? convert : keep;
}

function keep(req, _res, next) {
  req.item = req.body;
  return next();
}
