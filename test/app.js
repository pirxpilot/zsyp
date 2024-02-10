const test = require('node:test');
const assert = require('node:assert/strict');
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
    return new Promise(function (resolve) {
      done = resolve;
    });
  }
}

test('zsyp app', async function (t) {
  t.after(cleanup);

  const notifier = makeNofier();
  const app = makeApp({ finalMiddleware: notifier.middleware });
  const { db } = app;
  const events = db.collection({ name: 'event' });
  const request = supertest(app);

  async function cleanup() {
    await db.drop();
    await db.close();
  }

  await t.test('invalid path', async function (t) {
    await events.deleteMany();
    t.after(() => events.deleteMany());

    const response = await request
      .post('/invalid')
      .send({ data: { item: 15 } });
    assert.equal(response.status, 404, 'response should be invalid');
    const logged = await events.find();
    assert.deepEqual(logged, [], 'nothing has been logged');
  });

  await t.test('invalid method', async function (t) {
    await events.deleteMany();
    t.after(() => events.deleteMany());

    const response = await request
      .get('/csp');

    assert.equal(response.status, 404, 'response should be invalid');
    const logged = await events.find();
    assert.deepEqual(logged, [], 'nothing has been logged');
  });

  await t.test('from in headers', async function (t) {
    await events.deleteMany();
    t.after(() => events.deleteMany());

    const processingDone = notifier.start();

    const response = await request
      .post('/event')
      .set({
        'user-agent': 'Mozilla/5.0 (Windows NT 6.3; rv:31.0) Gecko/20100101 Firefox/31.0',
        'x-forwarded-for': '10.1.2.5',
      })
      .send({ data: { item: 15 } });

    assert.equal(response.status, 204, 'request was valid');

    await processingDone;

    const logged = await events.find();
    assert.equal(logged.length, 1, 'a single item has been logged');
    const r = logged[0];
    assert.deepEqual(r.data, { item: 15 });
    assert.deepEqual(r.from, {
      ua: 'Mozilla/5.0 (Windows NT 6.3; rv:31.0) Gecko/20100101 Firefox/31.0',
      browser: { name: 'Firefox', version: '31' },
      os: { name: 'Windows', version: '8.1' },
      ip: '10.1.2.5'
    });
  });

  await t.test('from in item', async function (t) {
    await events.deleteMany();
    t.after(() => events.deleteMany());

    const processingDone = notifier.start();

    const response = await request
      .post('/event')
      .send({
        from: {
          ua: 'Mozilla/5.0 (Windows NT 6.3; rv:31.0) Gecko/20100101 Firefox/31.0',
          ip: '10.1.2.5'
        },
        data: { item: 15 }
      });

    assert.equal(response.status, 204, 'request was valid');

    await processingDone;

    const logged = await events.find();
    assert.equal(logged.length, 1, 'a single item has been logged');
    const r = logged[0];
    assert.deepEqual(r.data, { item: 15 });
    assert.deepEqual(r.from, {
      ua: 'Mozilla/5.0 (Windows NT 6.3; rv:31.0) Gecko/20100101 Firefox/31.0',
      browser: { name: 'Firefox', version: '31' },
      os: { name: 'Windows', version: '8.1' },
      ip: '10.1.2.5'
    });
  });

  await t.test('error', async function (t) {
    const errors = db.collection({ name: 'error' });
    t.after(() => errors.deleteMany());

    await errors.deleteMany();

    const processingDone = notifier.start();

    const response = await request
      .post('/event')
      .send({ type: 'error', stack: '' });

    assert.equal(response.status, 204, 'request was valid');

    await processingDone;

    const logged = await errors.find();
    assert.equal(logged.length, 1, 'a single item has been logged');
    const r = logged[0];
    assert.deepEqual(r.stack, []);
  });
});
