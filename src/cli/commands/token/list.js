const { list } = require('../../oauth/token');
const { showList } = require('../../utils/list');
const { formats } = require('../../../models/OAuth');

module.exports = {
  command: 'list',
  desc: 'List all OAuth tokens',
  builder(yargs) {
    yargs
      .option('match', {
        alias: 'm',
        describe: 'Match Oauth token in Redis store',
        type: 'string',
        default: '*'
      })
      .option('refresh', {
        describe: 'Show refresh tokens matched in store',
        type: 'boolean',
        default: false
      });
  },
  handler: async argv => {
    try {
      const keys = await list(argv.match, undefined, undefined, argv.refresh);
      showList(
        argv.refresh ? formats.refreshToken : formats.accessToken,
        argv.match,
        keys
      );
      process.exit(0);
    } catch (error) {
      throw error;
    }
  }
};
