const fmt = require('util').format;

const { User } = require('../../../models/User');
const OAuth = require('../../../models/OAuth');
const utils = require('./utils');

module.exports = {
  command: 'create',
  desc: 'Create a access token',
  builder(yargs) {
    yargs
      .option('user-id', {
        alias: 'u',
        describe: 'User ID for token',
        type: 'string',
        required: true
      })
      .option('client-id', {
        alias: 'c',
        describe: 'Client ID for token',
        type: 'string',
        required: true
      });
  },
  handler: async argv => {
    try {
      let user = await User.findById(argv.u);
      if (!user) {
        throw new Error(fmt(`User ID: "%s" doesn't exist!`, argv.u));
      }
      user = {
        id: user._id.toString()
      };

      const client = await OAuth.getClientById(argv.c);
      if (!client) {
        throw new Error(fmt(`Client ID: "%s" doesn't exist!`, argv.c));
      }

      const accessTokenExpiresAt = new Date();
      accessTokenExpiresAt.setSeconds(accessTokenExpiresAt.getSeconds() + 1800);
      const refreshTokenExpiresAt = new Date();
      refreshTokenExpiresAt.setSeconds(
        refreshTokenExpiresAt.getSeconds() + 3600
      );
      const token = {
        accessToken: OAuth.generateAccessToken(client, user, undefined),
        accessTokenExpiresAt,
        refreshToken: OAuth.generateAccessToken(client, user, undefined),
        refreshTokenExpiresAt
      };

      const data = await OAuth.saveToken(token, client, user);
      if (!data) {
        throw new Error(
          fmt(
            `Something went wrong data wasn't returned after save for token: %s`,
            token.accessToken
          )
        );
      }

      await utils.showToken(token.accessToken);

      process.exit(0);
    } catch (error) {
      throw error;
    }
  }
};
