const { showList } = require('../../utils/list');
const { formats } = require('../../../models/OAuth');
const oauthClient = require('../../oauth/client');

module.exports = {
  command: 'list',
  desc: 'List all OAuth clients',
  builder(yargs) {
    yargs.option('match', {
      alias: 'm',
      describe: 'Match Oauth Client in Redis store',
      type: 'string',
      default: '*'
    });
  },
  handler: async argv => {
    try {
      const keys = await oauthClient.list(argv.match);
      showList(formats.client, argv.match, keys);
      process.exit(0);
    } catch (error) {
      throw error;
    }
  }
};
