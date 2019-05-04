const mongoose = require('mongoose');
const yargonaut = require('yargonaut');
const chalk = yargonaut.chalk();
const Table = require('cli-table3');

const task = require('../../db/task');

module.exports = {
  command: 'list',
  desc: 'List tasks',
  builder(yargs) {
    yargs
      .option('title', {
        describe: `Title of task`,
        type: 'string'
      })
      .option('done', {
        describe: `Task by done`,
        type: 'boolean'
      })
      .option('user', {
        describe: 'User ID of tasks',
        type: 'string'
      })
      .option('skip', {
        describe: `Skip number of results`,
        type: 'number',
        default: 0
      })
      .option('limit', {
        describe: `Limit number of results`,
        type: 'number',
        default: 10
      })
      .check(argv => {
        if (argv.user && !mongoose.Types.ObjectId.isValid(argv.user)) {
          throw new Error(chalk.red(`Invalid user ID: "${argv.user}"`));
        }
        const skip = parseInt(argv.skip, 10);
        if (isNaN(skip) || skip < 0) {
          throw new Error(chalk.red(`Invalid skip: "${argv.skip}"`));
        }

        const limit = parseInt(argv.limit, 10);
        if (isNaN(limit) || limit < 1) {
          throw new Error(chalk.red(`Invalid limit: "${argv.limit}"`));
        }

        return true;
      });
  },
  handler: async argv => {
    try {
      const match = {};
      if (argv.title) {
        match.$text = { $search: argv.title };
      }
      if (argv.done !== void 0) {
        match.done = [true, 1, 'true'].includes(argv.done);
      }
      if (argv.user) {
        match.user = argv.user;
      }
      const skip = parseInt(argv.skip, 10),
        limit = parseInt(argv.limit, 10);
      const { totalCount, tasks } = await task.list(match, skip, limit);

      if (totalCount > 0 && tasks.length > 0) {
        let end = skip + limit;
        if (end > totalCount) {
          end = totalCount;
        }
        console.log(
          chalk.green(`Showing results: ${skip}-${end} from ${totalCount}`)
        );
        const table = new Table({
          head: ['#', 'Title', 'Done', 'User'].map(i => chalk.white(i))
        });
        for (const key in table.options.chars) {
          table.options.chars[key] = chalk.white(table.options.chars[key]);
        }
        tasks.forEach(t =>
          table.push([
            t._id.toString(),
            t.title.substr(0, 60),
            t.done ? 'Y' : 'N',
            t.user.toString()
          ])
        );

        console.log(table.toString());
      } else {
        console.log(chalk.red(`No results found!`));
      }

      process.exit(0);
    } catch (error) {
      throw error;
    }
  }
};
