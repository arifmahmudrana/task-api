const yargonaut = require('yargonaut');
const chalk = yargonaut.chalk();
const fmt = require('util').format;

const { formats } = require('../../../models/OAuth');
const oauthClient = require('../../oauth/client');

module.exports = {
  command: 'show',
  desc: 'Show OAuth client details',
  builder(yargs) {
    yargs.option('id', {
      describe: 'ID of OAuth client',
      type: 'string',
      required: true
    });
  },
  handler: async argv => {
    try {
      const client = await oauthClient.show(argv.id);
      const values = [];
      for (const key in client) {
        values.push(key);
        values.push(client[key]);
      }
      console.log(chalk.green(fmt(`HGETALL ${formats.client}`, argv.id)));
      const len = values.length;
      if (len) {
        for (let i = 0; i < len; i++) {
          console.log(fmt(`%s) "%s"`, i + 1, values[i]));
        }
      } else {
        console.log('(empty list or set)');
      }
      process.exit(0);
    } catch (error) {
      throw error;
    }
  }
};
