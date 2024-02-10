require('./env');

const test = require('node:test');
const assert = require('node:assert/strict');

const { ObjectId } = require('mongodb');
const { converter } = require('../lib/event');

test('converter for event', async function () {
  const event = { type: 'event' };
  const converted = await converter(event);
  assert.deepEqual(converted.item, event, 'should not convert event type');
  assert.deepEqual(converted.meta, { name: 'event' });
});

test('converter for error', async function () {
  const stack = `TypeError: app.forceError is not a function
    at makeApp (http://example.com/app.js:1:305)
    at app.use (http://example.com/app.js:1:600)`;
  const error = {
    type: 'error',
    an: 'zapp',
    av: '1.0.0',
    message: "Uncaught TypeError: app.forceError is not a function",
    stack
  };
  const converted = await converter(error);
  assert.deepEqual(converted.item, {
    an: 'zapp',
    av: '1.0.0',
    message: 'Uncaught TypeError: app.forceError is not a function',
    stack: [
      ['lib/app.js', 17, 2, 'makeApp'],
      ['lib/app.js', 25, 0, 'app.use']
    ],
    org_stack: stack,
    _hash: new ObjectId('67e90d7a6cac7dd838a76a68')
  });
  assert.deepEqual(converted.meta, { name: 'error' });
});
