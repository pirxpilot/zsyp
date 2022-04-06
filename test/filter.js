const test = require('tape');
const makeFilter = require('../lib/filter');

test('filter with no params', function (t) {
  const filter = makeFilter({});

  t.equal(filter, undefined);
  t.end();
});

test('filter match', function (t) {
  const req = {
    body: {
      'csp-report': {
        'document-uri': 'https://example.com/login'
      },
    }
  };

  const filter = makeFilter({ domains: '^example' });

  t.plan(1);

  filter(req, null, () => t.pass());
});

test('filter no match', function (t) {
  const req = {
    body: {
      'csp-report': {
        'document-uri': 'https://example.com/login'
      },
    }
  };

  const filter = makeFilter({ domains: 'google.com' });

  filter(req, null, () => t.fail());
  t.end();
});
