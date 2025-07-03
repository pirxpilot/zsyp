module.exports = makePing;

function makePing({ db }) {
  const pingsCollection = db.collection({ name: 'ping' });

  return ping;

  async function ping(req, res) {
    if (req.method !== 'GET' && req.path !== '/') {
      res.statusCode = 404;
      res.end();
      return;
    }
    try {
      await pingsCollection.insertOne({
        timestamp: new Date()
      });
      res.statusCode = 204; // empty
      res.end();
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.end();
    }
  }
}
