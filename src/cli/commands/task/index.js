const yargonaut = require('yargonaut');
const chalk = yargonaut.chalk();

module.exports = {
  command: 'task',
  desc: 'Task commands',
  builder(yargs) {
    yargs
      .command(require('./list'))
      .demandCommand(
        1,
        chalk.red.bold('You need at least one command before moving on')
      )
      .version(false);
  }
};
