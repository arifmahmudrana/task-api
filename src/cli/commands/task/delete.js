const mongoose = require('mongoose');
const yargonaut = require('yargonaut');
const chalk = yargonaut.chalk();

const task = require('../../db/task');

module.exports = {
  command: 'delete',
  desc: 'Delete task',
  builder(yargs) {
    yargs
      .option('id', {
        describe: 'Delete task by ID'
      })
      .option('title', {
        describe: `Delete task by title`,
        type: 'string'
      })
      .option('done', {
        describe: `Delete task by done`
      })
      .option('user', {
        describe: 'Delete task by user ID',
        type: 'string'
      })
      .check(argv => {
        if (argv.id && !mongoose.Types.ObjectId.isValid(argv.id)) {
          throw new Error(chalk.red(`Invalid id: "${argv.id}"`));
        }
        if (argv.user && !mongoose.Types.ObjectId.isValid(argv.user)) {
          throw new Error(chalk.red(`Invalid user ID: "${argv.user}"`));
        }

        return true;
      });
  },
  handler: async argv => {
    try {
      const match = {};
      if (argv.id) {
        match._id = argv.id;
      }
      if (argv.title) {
        match.$text = { $search: argv.title };
      }
      if (argv.done !== void 0) {
        match.done = [true, 1, 'true'].includes(argv.done);
      }
      if (argv.user) {
        match.user = argv.user;
      }

      await task.delete(match);
      console.log(chalk.green(`Tasks deleted.`));

      process.exit(0);
    } catch (error) {
      throw error;
    }
  }
};
