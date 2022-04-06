module.exports = makeFilter;

/* global URL */

function makeFilter({ domains }) {

  if (!domains) {
    return;
  }

  const domainRe = domains && new RegExp(domains);
  return filter;

  function filter({ body: csp }, res, next) {
    const uri = csp['csp-report']['document-uri'];
    const { hostname } = new URL(uri);
    if (domainRe.test(hostname)) {
      return next();
    }
  }
}

