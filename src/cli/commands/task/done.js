const mongoose = require('mongoose');
const yargonaut = require('yargonaut');
const chalk = yargonaut.chalk();

const task = require('../../db/task');

module.exports = {
  command: 'done',
  desc: 'Done/Undone task',
  builder(yargs) {
    yargs
      .option('done', {
        describe: `Make done/undone task`,
        required: true
      })
      .option('id', {
        describe: 'Make done/undone task by ID'
      })
      .option('title', {
        describe: `Make done/undone task by title`,
        type: 'string'
      })
      .option('user', {
        describe: 'Make done/undone task by user ID',
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
      const match = {},
        done = [true, 1, 'true'].includes(argv.done);
      if (argv.id) {
        match._id = argv.id;
      }
      if (argv.title) {
        match.$text = { $search: argv.title };
      }
      if (argv.user) {
        match.user = argv.user;
      }
      match.done = !done;

      const { n, nModified } = await task.done(match, done);
      if (nModified > 0) {
        console.log(chalk.green(`Task matched: `), n);
        console.log(chalk.green(`Task modified: `), nModified);
      } else {
        console.log(chalk.red(`No record updated!`));
      }

      process.exit(0);
    } catch (error) {
      throw error;
    }
  }
};
