const mniam = require('mniam');
const debug = require('debug')('zsyp:logger');

module.exports = makeLogger;

const {
  ZSYP_DB: database = 'mongodb://localhost/zsyp'
} = process.env;


const db = mniam.db(database);

function makeLogger({ name }) {
  const collection = db.collection({ name });

  return log;

  function log(report) {
    debug('saving %j', report);
    collection.insertOne(report, function(err) {
      if (err) {
        console.error(err);
      }
    });
  }
}
