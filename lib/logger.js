module.exports = makeLogger;

function makeLogger() {
  return log;

  function log(report) {
    console.log(JSON.stringify(report));
  }
}
