const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis);
const db = redis.createClient(process.env.REDIS_URL);

module.exports = db;
