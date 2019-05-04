const mongoose = require('mongoose');
const yargonaut = require('yargonaut');
const chalk = yargonaut.chalk();

const task = require('../../db/task');

module.exports = {
  command: 'show',
  desc: 'Show task details',
  builder(yargs) {
    yargs
      .option('id', {
        describe: 'Get task by ID'
      })
      .option('title', {
        describe: `Get task by title`,
        type: 'string'
      })
      .option('done', {
        describe: `Get task by done`
      })
      .option('user', {
        describe: 'Get task by user ID',
        type: 'string'
      })
      .check(argv => {
        if (argv.id && !mongoose.Types.ObjectId.isValid(argv.id)) {
          throw new Error(chalk.red(`Invalid id: "${argv.id}"`));
        }
        if (argv.user && !mongoose.Types.ObjectId.isValid(argv.user)) {
          throw new Error(chalk.red(`Invalid id: "${argv.user}"`));
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

      const data = await task.get(match);

      if (data) {
        console.log(chalk.green(`Task found.`));
        console.log(JSON.stringify(data, undefined, 2));
      } else {
        console.log(chalk.red(`No task found!`));
      }

      process.exit(0);
    } catch (error) {
      throw error;
    }
  }
};
