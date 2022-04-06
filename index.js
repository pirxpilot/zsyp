require('dotenv').config({ path: '/etc/default/zsyp' });

const logger = require('./lib/logger');
const makeApp = require('./lib/app');

const {
  ZSYP_PORT: PORT = 3090,
} = process.env;

const app = makeApp({
  logger
});

module.exports = app;

if (!module.parent) {
  app.listen(PORT);
  console.log('Listening on port', PORT);
}
