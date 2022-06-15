const test = require('tape');
require('./env');

const { clear, resolve } = require('../lib/source-map');

test('resolve position', async function (t) {

  const frame = ['app.js', 1, 305];
  const info = { an: 'zapp', av: '1.0.0' };

  const [source, line, column, name] = await resolve(info, frame);

  t.teardown(clear);
  t.equal(source, 'lib/app.js');
  t.equal(line, 17);
  t.equal(column, 2);
  t.looseEqual(name, null);
});

test('missing source map', async function (t) {

  const frame = ['index.js', 1, 305];
  const info = { an: 'zapp', av: '1.0.0' };

  const position = await resolve(info, frame);

  t.equal(position, frame, 'should return the same frame is source map is missing');
});
