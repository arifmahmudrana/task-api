const fmt = require('util').format;
const db = require('../../redis/db');
const { formats } = require('../../models/OAuth');

const list = (pattern = '*', cursor = 0, keys = [], refresh = false) =>
  db
    .scanAsync(
      cursor,
      'MATCH',
      fmt(refresh ? formats.refreshToken : formats.accessToken, pattern)
    )
    .then(result => {
      keys = [...keys, ...result[1]];
      if (result[0] === '0') return keys;
      return list(pattern, result[0], keys, refresh);
    });

const tokenExpired = async (key, refresh = false) => {
  let result = await db.getAsync(key);
  result = JSON.parse(result);

  if (
    (!refresh && !result.accessTokenExpiresAt.length) ||
    (refresh && !result.refreshTokenExpiresAt.length)
  ) {
    return key;
  }

  try {
    if (
      (!refresh &&
        new Date(result.accessTokenExpiresAt).getTime() <
          new Date().getTime()) ||
      (refresh &&
        new Date(result.refreshTokenExpiresAt).getTime() < new Date().getTime())
    ) {
      return key;
    }
  } catch (error) {
    return key;
  }
};

const applyExpired = async (keys, expired) => {
  if (!expired) {
    return keys;
  }
  const promises = [];
  keys.forEach(key => promises.push(tokenExpired(key)));
  keys = await Promise.all(promises);

  return keys;
};

const deleteTokens = async keys => {
  const result = await db.delAsync(keys);

  return result;
};

module.exports = { list, tokenExpired, applyExpired, delete: deleteTokens };
