const debug = require('debug')('zsyp:logger');

module.exports = makeLogger;

function makeLogger({ db, name = 'csp' }) {
  const csp = db.collection({ name });

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
