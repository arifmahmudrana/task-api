const yargonaut = require('yargonaut');
const chalk = yargonaut.chalk();
const { cacheDel } = require('../../../cache');

module.exports = {
  command: 'clear',
  desc: 'Clear redis cache records',
  builder(yargs) {},
  handler: async argv => {
    try {
      await Promise.all([cacheDel('task-list-*'), cacheDel('task-*')]);
      console.log(chalk.green('Cache records cleared'));
      process.exit(0);
    } catch (error) {
      throw error;
    }
  }
};
