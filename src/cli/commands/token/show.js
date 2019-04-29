const utils = require('./utils');

module.exports = {
  command: 'show',
  desc: 'Show OAuth token details',
  builder(yargs) {
    yargs
      .option('id', {
        describe: 'ID of OAuth token',
        type: 'string',
        required: true
      })
      .option('refresh', {
        describe: 'ID of OAuth token is refresh token',
        type: 'boolean',
        default: false
      });
  },
  handler: async argv => {
    try {
      await utils.showToken(argv.id, argv.refresh, false, true);
      process.exit(0);
    } catch (error) {
      throw error;
    }
  }
};
