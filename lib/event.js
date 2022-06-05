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

function convertError(event) {
  return event;
}
