const yargonaut = require('yargonaut');
const chalk = yargonaut.chalk();
const fmt = require('util').format;

const oauthClient = require('../../oauth/client');

module.exports = {
  command: 'create',
  desc: 'Create an OAuth client',
  builder(yargs) {},
  handler: async argv => {
    try {
      const clientInfo = await oauthClient.create();
      const { clientId, clientSecret } = clientInfo;
      console.log(chalk.green('Client added successfully'));
      console.log(fmt('clientId = "%s"', clientId));
      console.log(fmt('clientSecret = "%s"', clientSecret));
      process.exit(0);
    } catch (error) {
      throw error;
    }
  }
};
