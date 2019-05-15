const yargonaut = require('yargonaut');
const chalk = yargonaut.chalk();

module.exports = {
  command: 'cache',
  desc: 'Redis cache commands',
  builder(yargs) {
    yargs
      .command(require('./clear'))
      .demandCommand(
        1,
        chalk.red.bold('You need at least one command before moving on')
      )
      .version(false);
  }
};
