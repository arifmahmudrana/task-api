/**
 * Module dependencies.
 */

const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis);
const db = redis.createClient(process.env.REDIS_URL);
const fmt = require('util').format;
const { User } = require('./User');

/**
 * Redis formats.
 */

const formats = {
  client: 'clients:%s',
  accessToken: 'accessTokens:%s',
  refreshToken: 'refreshTokens:%s'
};

module.exports.formats = formats;

/**
 * Get access token.
 */

module.exports.getAccessToken = bearerToken =>
  db.getAsync(fmt(formats.accessToken, bearerToken)).then(token => {
    if (!token) {
      return;
    }

    token = JSON.parse(token);
    token.accessTokenExpiresAt = new Date(token.accessTokenExpiresAt);
    token.refreshTokenExpiresAt = new Date(token.refreshTokenExpiresAt);
    token.user = JSON.parse(token.user);
    token.client = JSON.parse(token.client);

    return token;
  });

/**
 * Get client.
 */

module.exports.getClient = (clientId, clientSecret) =>
  db.hgetallAsync(fmt(formats.client, clientId)).then(client => {
    if (!client || client.clientSecret !== clientSecret) {
      return;
    }

    return {
      clientId: client.clientId,
      clientSecret: client.clientSecret,
      grants: ['password', 'refresh_token']
    };
  });

/**
 * Get refresh token.
 */

module.exports.getRefreshToken = bearerToken =>
  db.getAsync(fmt(formats.refreshToken, bearerToken)).then(token => {
    if (!token) {
      return;
    }

    token = JSON.parse(token);
    token.refreshTokenExpiresAt = new Date(token.refreshTokenExpiresAt);
    token.user = JSON.parse(token.user);
    token.client = JSON.parse(token.client);

    return token;
  });

/**
 * Revoke access token.
 */

module.exports.revokeToken = token =>
  db
    .delAsync([
      fmt(formats.accessToken, token.accessToken),
      fmt(formats.refreshToken, token.refreshToken)
    ])
    .then(() => true);

/**
 * Get user.
 */

module.exports.getUser = (username, password) =>
  User.findByCredentials(username, password).then(user => {
    if (!user) {
      return false;
    }

    return {
      id: user._id.toString()
    };
  });

/**
 * Save token.
 */

module.exports.saveToken = (token, client, user) => {
  const data = {
    accessToken: token.accessToken,
    accessTokenExpiresAt: token.accessTokenExpiresAt,
    clientId: client.clientId,
    client: JSON.stringify(client),
    refreshToken: token.refreshToken,
    refreshTokenExpiresAt: token.refreshTokenExpiresAt,
    userId: user.id,
    user: JSON.stringify(user)
  };

  return Promise.all([
    db.setexAsync(
      fmt(formats.accessToken, token.accessToken),
      Math.ceil(
        (data.accessTokenExpiresAt.getTime() - new Date().getTime()) / 1000
      ),
      JSON.stringify(data)
    ),
    db.setexAsync(
      fmt(formats.refreshToken, token.refreshToken),
      Math.ceil(
        (data.refreshTokenExpiresAt.getTime() - new Date().getTime()) / 1000
      ),
      JSON.stringify(data)
    )
  ]).then(() => data);
};
