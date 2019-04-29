const yargonaut = require('yargonaut');
const chalk = yargonaut.chalk();
const fmt = require('util').format;

const token = require('../../oauth/token');

module.exports = {
  command: 'delete',
  desc: 'Delete OAuth tokens',
  builder(yargs) {
    yargs
      .option('match', {
        alias: 'm',
        describe: 'Match Oauth tokens in Redis store',
        type: 'string',
        default: '*'
      })
      .option('access', {
        describe: 'Match Access tokens only',
        type: 'boolean'
      })
      .option('refresh', {
        describe: 'Match Refresh tokens only',
        type: 'boolean'
      })
      .option('expired', {
        describe: 'Match expired tokens only',
        type: 'boolean',
        default: false
      })
      .conflicts('access', 'refresh');
  },
  handler: async argv => {
    try {
      let accessTokenKeys, refreshTokenKeys;
      if (argv.access) {
        accessTokenKeys = await token.list(argv.match);
        accessTokenKeys = await token.applyExpired(
          accessTokenKeys,
          argv.expired
        );
      } else if (argv.refresh) {
        refreshTokenKeys = await token.list(
          argv.match,
          undefined,
          undefined,
          true
        );
        refreshTokenKeys = await token.applyExpired(
          refreshTokenKeys,
          argv.expired
        );
      } else {
        [accessTokenKeys, refreshTokenKeys] = await Promise.all([
          token.list(argv.match),
          token.list(argv.match, undefined, undefined, true)
        ]);
        accessTokenKeys = await token.applyExpired(
          accessTokenKeys,
          argv.expired
        );
        refreshTokenKeys = await token.applyExpired(
          refreshTokenKeys,
          argv.expired
        );
      }

      let keys;
      if (accessTokenKeys !== void 0 && refreshTokenKeys !== void 0) {
        if (!accessTokenKeys.length && !refreshTokenKeys.length) {
          throw new Error('No unused tokens found!!');
        }

        keys = [...new Set([...accessTokenKeys, ...refreshTokenKeys])];
      } else if (accessTokenKeys !== void 0) {
        if (!accessTokenKeys.length) {
          throw new Error('No unused tokens found!!');
        }

        keys = [...accessTokenKeys];
      } else if (refreshTokenKeys !== void 0) {
        if (!refreshTokenKeys.length) {
          throw new Error('No unused tokens found!!');
        }

        keys = [...refreshTokenKeys];
      }

      const result = await token.delete(keys);
      console.log(chalk.green(fmt(`DEL %s`, keys.join(' '))));
      console.log(fmt(`(integer) %s`, result));
      process.exit(0);
    } catch (error) {
      throw error;
    }
  }
};
