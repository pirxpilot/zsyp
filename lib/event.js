const stackParser = require('error-stack-parser');

module.exports = {
  converter
};

const collectionNames = {
  'error': true
};

function converter(event) {
  const { type = 'event' } = event;
  const item = type === 'error' ? convertError(event) : event;
  return {
    item,
    meta: {
      name: collectionNames[type] ? type : 'event'
    }
  };
}

function convertError(error) {
  error.stack = safeParseStack(error).map(frame => {
    const { fileName, lineNumber, columnNumber = 0 } = frame;
    return {
      source: fileName,
      line: lineNumber,
      column: columnNumber
    };
  });
  return error;

  function safeParseStack(error) {
    try {
      return stackParser.parse(error);
    } catch {
      return [];
    }
  }
}
