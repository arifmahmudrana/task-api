const cache = require('express-redis-cache')({
  client: require('../redis/db')
});

const cacheDel = name =>
  new Promise((res, rej) =>
    cache.del(name, (err, deletions) => {
      if (err) {
        return rej(err);
      }

      res(deletions);
    })
  );

module.exports = { cache, cacheDel };
