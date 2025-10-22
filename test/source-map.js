import './env.js';

import assert from 'node:assert/strict';
import test from 'node:test';
import { clear, resolve } from '../lib/source-map.js';

test('resolve position', async t => {
  const frame = ['app.js', 1, 305];
  const info = { an: 'zapp', av: '1.0.0' };

  const [source, line, column, name] = await resolve(info, frame);

  t.after(clear);
  assert.equal(source, 'lib/app.js');
  assert.equal(line, 17);
  assert.equal(column, 2);
  assert(name == null);
});

test('missing source map', async () => {
  const frame = ['index.js', 1, 305];
  const info = { an: 'zapp', av: '1.0.0' };

  const position = await resolve(info, frame);

  assert.equal(position, frame, 'should return the same frame is source map is missing');
});
