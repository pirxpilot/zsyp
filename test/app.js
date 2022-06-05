const test = require('tape');
const request = require('supertest');

const makeApp = require('../lib/app');

let logged = [];

function memoryLogger({ from, item }) {
  logged.push({ from, ...item });
}

const app = makeApp({
  logger: () => memoryLogger
});

test('invalid path', function (t) {
  logged = [];
  request(app)
    .post('/invalid')
    .send({ data: { item: 15 }})
    .expect(404)
    .end(err => {
      t.deepEqual(logged, [], 'nothing has been logged');
      t.end(err);
    });
});

test('invalid method', function (t) {
  logged = [];
  request(app)
    .get('/csp')
    .expect(404)
    .end(err => {
      t.deepEqual(logged, [], 'nothing has been logged');
      t.end(err);
    });
});

test('zsyp', function (t) {
  logged = [];
  request(app)
    .post('/event')
    .set({
      'user-agent': 'Mozilla/5.0 (Windows NT 6.3; rv:31.0) Gecko/20100101 Firefox/31.0',
      'x-forwarded-for': '10.1.2.5',
    })
    .send({ data: { item: 15 }})
    .expect(204)
    .end(err => {
      t.equal(logged.length, 1, 'a single item has been logged');
      const r = logged[0];
      t.deepEqual(r.data, { item: 15 });
      t.deepEqual(r.from, {
        ua: 'Mozilla/5.0 (Windows NT 6.3; rv:31.0) Gecko/20100101 Firefox/31.0',
        browser: { name: 'Firefox', version: '31' },
        os: { name: 'Windows', version: '8.1' },
        ip: '10.1.2.5'
      });
      t.end(err);
    });
});
