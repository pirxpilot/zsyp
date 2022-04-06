const test = require('tape');
const from = require('../lib/from');

test('from', function (t) {
  const req = {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 6.3; rv:31.0) Gecko/20100101 Firefox/31.0',
      'x-forwarded-for': '10.1.2.5',
      connection: {
        remoteAddress: '127.0.0.1'
      }
    }
  };

  from(req, null, function() {
    t.same(req.from, {
      ua: 'Mozilla/5.0 (Windows NT 6.3; rv:31.0) Gecko/20100101 Firefox/31.0',
      ip: '10.1.2.5',
      browser: {
        name: 'Firefox',
        version: '31'
      },
      os: {
        name: 'Windows',
        version: '8.1'
      },
    });
    t.end();
  });
});

test('from body overwrite', function (t) {
  const req = {
    body: {
      from: {
        ua: 'Mozilla/5.0 (Linux; Android 10; K) Chrome/95.0.0.0 Safari/537.36',
        ip: '10:10::1'
      }
    },
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 6.3; rv:31.0) Gecko/20100101 Firefox/31.0',
      connection: {
        remoteAddress: '127.0.0.1'
      }
    }
  };

  from(req, null, function() {
    t.same(req.from, {
      ua: 'Mozilla/5.0 (Linux; Android 10; K) Chrome/95.0.0.0 Safari/537.36',
      browser: {
        name: 'Chrome',
        version: '95'
      },
      os: {
        name: 'Android',
        version: '0'
      },
      ip: '10:10::1',
      device: 'Generic Smartphone'
    });
    t.end();
  });
});
