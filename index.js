require('dotenv').config({ path: '/etc/default/zsyp' });

const connect = require('@pirxpilot/connect');
const router = require('./lib/csp');

const PORT = process.env.ZSYP_SERVER_PORT || 3090;

const app = connect();

app.use(router());


module.exports = app;

if (!module.parent) {
  app.listen(PORT);
  console.log('Listening on port', PORT);
}
