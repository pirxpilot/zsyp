const { readFile } = require('node:fs').promises;
const path = require('node:path');
const { SourceMapConsumer } = require('source-map');
const { LRUCache: LRU } = require('lru-cache');

module.exports = {
  resolve,
  clear
};

const { ZSYP_SOURCE_MAP_DIR = '/var/lib/zsyp', ZSYP_SOURCE_MAP_CACHE_SIZE = 30 } = process.env;

const cache = new LRU({
  max: ZSYP_SOURCE_MAP_CACHE_SIZE,
  fetchMethod: fetchSourceMap,
  dispose: smc => smc?.destroy()
});

async function resolve({ an, av }, frame) {
  const [source, line, column] = frame;
  const smc = await loadSourceMap(an, av, source);
  if (!smc) {
    return frame;
  }
  const pos = smc.originalPositionFor({ line, column });
  if (!pos) {
    return frame;
  }
  const resolved = [pos.source, pos.line, pos.column];
  if (pos.name) {
    resolved.push(pos.name);
  }
  return resolved;
}

function clear() {
  cache.clear();
}

function loadSourceMap(app, version, source) {
  const filename = path.resolve(ZSYP_SOURCE_MAP_DIR, app, version, source);
  return cache.fetch(filename);
}

async function fetchSourceMap(filename) {
  try {
    const txt = await readFile(filename + '.map');
    const map = JSON.parse(txt);
    return new SourceMapConsumer(map);
  } catch {
    // ignore errors during map parsing
  }
}
