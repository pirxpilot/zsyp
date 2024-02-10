check: lint test

lint:
	./node_modules/.bin/jshint *.js lib test

test:
	node --require ./test/env --test

.PHONY: check lint test
