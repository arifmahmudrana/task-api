const fmt = require('util').format;
const rand = require('../../utils/rand');
const db = require('../../redis/db');
const { formats } = require('../../models/OAuth');

const list = (pattern = '*', cursor = 0, keys = []) =>
  db.scanAsync(cursor, 'MATCH', fmt(formats.client, pattern)).then(result => {
    keys = [...keys, ...result[1]];
    if (result[0] === '0') return keys;
    return list(pattern, result[0], keys);
  });

const create = async () => {
  try {
    const clientId = rand.generateRandomStringURLSafe(16);
    const clientSecret = rand.generateRandomString(32);

    await db.hmsetAsync(fmt('clients:%s', clientId), {
      clientId,
      clientSecret
    });

    return { clientId, clientSecret };
  } catch (error) {
    throw error;
  }
};

const show = async key => {
  try {
    const client = await db.hgetallAsync(fmt(formats.client, key));
    return client;
  } catch (error) {
    throw error;
  }
};

const deleteClient = async (pattern = '*') => {
  try {
    const keys = await list(pattern);
    if (keys.length === 0) {
      throw new Error(
        `No keys matched for pattern: "${fmt(formats.client, pattern)}"`
      );
    }
    const result = await db.delAsync(keys);
    return { result, keys };
  } catch (error) {
    throw error;
  }
};

module.exports = { list, create, show, delete: deleteClient };
