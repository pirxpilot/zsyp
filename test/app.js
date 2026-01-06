import './env.js';

import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';
import { makeFetch } from 'supertest-fetch';
import makeApp from '../lib/app.js';

function makeNofier() {
  let done = false;

  return {
    start,
    middleware
  };

  function middleware(_req, _res, next) {
    if (done) {
      done();
      done = false;
    }
    next();
  }

  function start() {
    return new Promise(resolve => {
      done = resolve;
    });
  }
}

test('zsyp app', async t => {
  t.after(cleanup);

  const notifier = makeNofier();
  const app = makeApp({ finalMiddleware: notifier.middleware });
  const { db } = app;
  const events = db.collection({ name: 'event' });
  const request = makeFetch(http.createServer(app));

  async function cleanup() {
    await db.drop();
    await db.close();
  }

  await t.test('invalid path', async t => {
    await events.deleteMany();
    t.after(() => events.deleteMany());

    const response = await request('/invalid', {
      method: 'POST',
      body: {
        data: { item: 15 }
      }
    });
    assert.equal(response.status, 404, 'response should be invalid');
    const logged = await events.find();
    assert.deepEqual(logged, [], 'nothing has been logged');
  });

  await t.test('invalid method', async t => {
    await events.deleteMany();
    t.after(() => events.deleteMany());

    const response = await request('/csp');

    assert.equal(response.status, 404, 'response should be invalid');
    const logged = await events.find();
    assert.deepEqual(logged, [], 'nothing has been logged');
  });

  await t.test('from in headers', async t => {
    await events.deleteMany();
    t.after(() => events.deleteMany());

    const processingDone = notifier.start();

    const response = await request('/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-agent': 'Mozilla/5.0 (Windows NT 6.3; rv:31.0) Gecko/20100101 Firefox/31.0',
        'x-forwarded-for': '10.1.2.5'
      },
      body: JSON.stringify({ data: { item: 15 } })
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
      os: { name: 'Windows', version: '8' },
      ip: '10.1.2.5'
    });
  });

  await t.test('from in item', async t => {
    await events.deleteMany();
    t.after(() => events.deleteMany());

    const processingDone = notifier.start();

    const response = await request('/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: {
          ua: 'Mozilla/5.0 (Windows NT 6.3; rv:31.0) Gecko/20100101 Firefox/31.0',
          ip: '10.1.2.5'
        },
        data: { item: 15 }
      })
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
      os: { name: 'Windows', version: '8' },
      ip: '10.1.2.5'
    });
  });

  await t.test('error', async t => {
    const errors = db.collection({ name: 'error' });
    t.after(() => errors.deleteMany());

    await errors.deleteMany();

    const processingDone = notifier.start();

    const response = await request('/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: 'error', stack: '' })
    });

    assert.equal(response.status, 204, 'request was valid');

    await processingDone;

    const logged = await errors.find();
    assert.equal(logged.length, 1, 'a single item has been logged');
    const r = logged[0];
    assert.deepEqual(r.stack, []);
  });

  await t.test('ping', async t => {
    const pings = db.collection({ name: 'ping' });
    t.after(() => pings.deleteMany());

    await pings.deleteMany();

    const response = await request('/_/ping');

    assert.equal(response.status, 204, 'request was valid');

    const logged = await pings.find();
    assert.equal(logged.length, 1, 'a single item has been logged');
    const r = logged[0];
    assert.ok('timestamp' in r, 'timestamp is present');
  });
});
