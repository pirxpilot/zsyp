const debug = require('debug')('zsyp:logger');

module.exports = makeLogger;

function makeLogger({ db, name }) {
  const cache = Object.create(null);

  const getCollection =  name ?
    () => collectionFromCache(name) :
    ({ name }) => collectionFromCache(name);

  return log;

  function log({ from, item, meta }, res, next) {
    debug('saving %j', item);
    getCollection(meta)
      .insertOne({ from, ...item })
      .then(() => next())
      .catch(err => { console.error(err); next(); });
  }

  function collectionFromCache(name) {
    if (!cache[name]) {
      cache[name] = db.collection({ name });
    }
    return cache[name];
  }
}
