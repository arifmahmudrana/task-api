const yargonaut = require('yargonaut');
const chalk = yargonaut.chalk();
const fmt = require('util').format;

const oauthClient = require('../../oauth/client');

module.exports = {
  command: 'delete',
  desc: 'Delete OAuth clients by match or all',
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
      const deleteResult = await oauthClient.delete(argv.match);
      console.log(chalk.green(fmt(`DEL %s`, deleteResult.keys.join(' '))));
      console.log(fmt(`(integer) %s`, deleteResult.result));
      process.exit(0);
    } catch (error) {
      throw error;
    }
  }
};
