const { db } = require('mniam');

module.exports = makeLogger;

function makeLogger({ database }) {
  const csp = db(database).collection({ name: 'csp'});

  return log;

  function log(report) {
    csp.insertOne(report, function(err) {
      if (err) {
        console.error(err);
      }
    });
  }
}
