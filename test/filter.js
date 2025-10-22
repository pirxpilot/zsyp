import assert from 'node:assert/strict';
import test from 'node:test';
import makeFilter from '../lib/filter.js';

test('filter with no params', () => {
  const filter = makeFilter({});

  assert.equal(filter, undefined);
});

test('filter match', (_, done) => {
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

test('filter no match', () => {
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
