const test = require('tape');
require('./env');

const { converter } = require('../lib/event');

test('converter for event', async function (t) {
  const event = { type: 'event' };
  const converted = await converter(event);
  t.deepEqual(converted.item, event, 'should not convert event type');
  t.deepEqual(converted.meta, { name: 'event' });
});


test('converter for error', async function (t) {
  const error = {
    type: 'error',
    an: 'zapp',
    av: '1.0.0',
    message: "Uncaught TypeError: app.forceError is not a function",
    stack: `TypeError: app.forceError is not a function
      at makeApp (http://example.com/app.js:1:305)
      at app.use (http://example.com/app.js:1:600)`
  };
  const converted = await converter(error);
  t.deepEqual(converted.item, {
    an: 'zapp',
    av: '1.0.0',
    message: 'Uncaught TypeError: app.forceError is not a function',
    stack: [
      ['lib/app.js', 17, 2, 'makeApp'],
      ['lib/app.js', 25, 0, 'app.use']
    ]
  });
  t.deepEqual(converted.meta, { name: 'error' });
});
