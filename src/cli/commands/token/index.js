const yargonaut = require('yargonaut');
const chalk = yargonaut.chalk();

module.exports = {
  command: 'token',
  desc: 'Oauth token commands',
  builder(yargs) {
    yargs
      .command(require('./list'))
      .command(require('./create'))
      .command(require('./show'))
      .command(require('./delete'))
      .demandCommand(
        1,
        chalk.red.bold('You need at least one command before moving on')
      )
      .version(false);
  }
};
