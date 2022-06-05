const { parse } = require('useragent');

module.exports = from;

function from(req, res, next) {
  const { headers, body } = req;
  const ua = body?.from?.ua ??  headers['user-agent'];
  const {
    family,
    major,
    os,
    device
  } = parse(ua);
  const data = {
    ua,
    browser: {
      name: family,
      version: major
    },
    os: {
      name: os.family,
      version: os.major
    },
    ip: body?.from?.ip ?? headers['x-forwarded-for'] ?? req.connection.remoteAddress
  };
  if (device.family !== 'Other') {
    data.device = device.family;
  }
  req.from = data;
  next();
}
