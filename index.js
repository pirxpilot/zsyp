require('dotenv').config({ path: '/etc/default/zsyp' });

const connect = require('@pirxpilot/connect');
const router = require('./lib/csp');
const makeLogger = require('./lib/logger');

const {
  ZSYP_PORT: PORT = 3090,
  ZSYP_DOMAINS: domains
} = process.env;

const app = connect();
const log = makeLogger();

app.use(function (req, res, next) {
  req.log = log;
  next();
});
app.use(router({ domains }));


module.exports = app;

if (!module.parent) {
  app.listen(PORT);
  console.log('Listening on port', PORT);
}
