module.exports = name =>
  new Promise((res, rej) =>
    require('./index').del(name, (err, deletions) => {
      if (err) {
        return rej(err);
      }

      res(deletions);
    })
  );
