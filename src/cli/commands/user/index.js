const yargonaut = require('yargonaut');
const chalk = yargonaut.chalk();

module.exports = {
  command: 'user',
  desc: 'User commands',
  builder(yargs) {
    yargs
      .command(require('./list'))
      .command(require('./show'))
      .command(require('./verify'))
      .command(require('./delete'))
      .demandCommand(
        1,
        chalk.red.bold('You need at least one command before moving on')
      )
      .version(false);
  }
};
