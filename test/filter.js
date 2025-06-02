const test = require('node:test');
const assert = require('node:assert/strict');
const makeFilter = require('../lib/filter');

test('filter with no params', function () {
  const filter = makeFilter({});

  assert.equal(filter, undefined);
});

test('filter match', function (_, done) {
  const req = {
    body: {
      'csp-report': {
        'document-uri': 'https://example.com/login'
      }
    }
  };

  const filter = makeFilter({ domains: '^example' });
  filter(req, null, () => done());
});

test('filter no match', function () {
  const req = {
    body: {
      'csp-report': {
        'document-uri': 'https://example.com/login'
      }
    }
  };

  const filter = makeFilter({ domains: 'google.com' });
  filter(req, null, () => assert.fail('should not call'));
});
