const test = require('tape');
const supertest = require('supertest');

process.env.ZSYP_DB = 'mongodb://localhost/test-zsyp';

const makeApp = require('../lib/app');

function makeNofier() {
  let done = false;

  return {
    start,
    middleware
  };

  function middleware(req, res, next) {
    if (done) {
      done();
      done = false;
    }
    next();
  }

  function start() {
    return new Promise(function(resolve) {
      done = resolve;
    });
  }
}

test('zsyp app', function (t) {
  t.teardown(cleanup);

  const notifier = makeNofier();
  const app = makeApp({ finalMiddleware: notifier.middleware });
  const { db } = app;
  const events = db.collection({ name: 'event' });
  const request = supertest(app);

  async function cleanup() {
    await db.drop();
    await db.close();
  }

  t.test('invalid path', async function (t) {
    await events.deleteMany();
    t.teardown(() => events.deleteMany());

    const response = await request
      .post('/invalid')
      .send({ data: { item: 15 } });
    t.equal(response.status, 404, 'response should be invalid');
    const logged = await events.find();
    t.deepEqual(logged, [], 'nothing has been logged');
  });

  t.test('invalid method', async function (t) {
    await events.deleteMany();
    t.teardown(() => events.deleteMany());

    const response = await request
      .get('/csp');

    t.equal(response.status, 404, 'response should be invalid');
    const logged = await events.find();
    t.deepEqual(logged, [], 'nothing has been logged');
  });

  t.test('from', async function (t) {
    await events.deleteMany();
    t.teardown(() => events.deleteMany());

    const processingDone = notifier.start();

    const response = await request
      .post('/event')
      .set({
        'user-agent': 'Mozilla/5.0 (Windows NT 6.3; rv:31.0) Gecko/20100101 Firefox/31.0',
        'x-forwarded-for': '10.1.2.5',
      })
      .send({ data: { item: 15 } });

    t.equal(response.status, 204, 'request was valid');

    await processingDone;

    const logged = await events.find();
    t.equal(logged.length, 1, 'a single item has been logged');
    const r = logged[0];
    t.deepEqual(r.data, { item: 15 });
    t.deepEqual(r.from, {
      ua: 'Mozilla/5.0 (Windows NT 6.3; rv:31.0) Gecko/20100101 Firefox/31.0',
      browser: { name: 'Firefox', version: '31' },
      os: { name: 'Windows', version: '8.1' },
      ip: '10.1.2.5'
    });
  });

  t.test('error', async function (t) {
    const errors = db.collection({ name: 'error' });

    await errors.deleteMany();
    t.teardown(() => errors.deleteMany());

    const processingDone = notifier.start();

    const response = await request
      .post('/event')
      .send({ type: 'error', stack: '' });

    t.equal(response.status, 204, 'request was valid');

    await processingDone;

    const logged = await errors.find();
    t.equal(logged.length, 1, 'a single item has been logged');
    const r = logged[0];
    t.deepEqual(r.stack, []);
  });
});

