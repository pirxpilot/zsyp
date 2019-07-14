module.exports = from;

function from(req, res, next) {
  req.from = {
    userAgent: req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
  };
  next();
}
