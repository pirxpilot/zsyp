const { db } = require('mniam');
const debug = require('debug')('zsyp:logger');

module.exports = makeLogger;

function makeLogger({ database }) {
  const csp = db(database).collection({ name: 'csp'});

  return log;

  function log(report) {
    debug('saving %j', report);
    csp.insertOne(report, function(err) {
      if (err) {
        console.error(err);
      }
    });
  }
}
