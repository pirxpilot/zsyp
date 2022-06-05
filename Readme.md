[![NPM version][npm-image]][npm-url]
[![Build Status][build-image]][build-url]
[![Dependency Status][deps-image]][deps-url]

# zsyp

[CSP] violation reports logger. Zsyp is a simple standalone web service that parses CPS violation reports
and stores them in MongoDB collection.

## Install

```sh
npm install --global zsyp
```

## Environment

Zsyp is using [dotenv] and by default reads its environment from `/etc/default/zsyp`

- `ZSYP_PORT` - port number on which, defaults to 3090
- `ZSYP_DB` - [mongo URI] connection string, defaults to `mongodb://localhost/zsyp`
- `ZSYP_DOMAINS` - domain name or a regular expression used to filter CSP violation reports - can be left empty in which case all reports for all domains are logged

## Report format

```json5
{
  "from": {
    "ua": "Mozilla/5.0 (Macintosh; Intel Mac OS...",   // User-Agent string
    "browser": {                                       // browser brand and version
      "name": "Safari", 
      "version": "13"
    },
    "os": {                                            // operating system info
      "name": "Mac OS X",
      "version": "10"
    },
    "ip": "1.2.3.4"                                    // originator IP address 
  },
  "csp-report": {                                      // original CSP report
    "document-uri": "https://example.com/page",
    "referrer": "https://example.com/",
    "violated-directive": "...",
    "effective-directive": "...",
    "original-policy": "...",
    "blocked-uri": "",
    "status-code": 0,
    "source-file": "..."
  }
}
```


## Logger

Reports are stored in `csp` collection. If you want to use [capped collection] create it
manually before running zsyp.

```javascript
db.createCollection( "csp", { capped: true, size: 100000 } );
```


## License

MIT © [Damian Krzeminski](https://pirxpilot.me)


[CSP]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
[mongo URI]: https://docs.mongodb.com/manual/reference/connection-string
[capped collection]: https://docs.mongodb.com/manual/core/capped-collections/
[dotenv]: https://www.npmjs.com/package/dotenv

[npm-image]: https://img.shields.io/npm/v/zsyp
[npm-url]: https://npmjs.org/package/zsyp

[build-url]: https://github.com/pirxpilot/zsyp/actions/workflows/check.yaml
[build-image]: https://img.shields.io/github/workflow/status/pirxpilot/zsyp/check

[deps-image]: https://img.shields.io/librariesio/release/npm/zsyp
[deps-url]: https://libraries.io/npm/zsyp
