import './lib/env.js';
import makeApp from './lib/app.js';

const { ZSYP_PORT: PORT = 3090 } = process.env;

const app = makeApp();

export default app;

if (import.meta.main) {
  app.listen(PORT);
  console.log('Listening on port', PORT);
}
