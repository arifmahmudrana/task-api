const yargonaut = require('yargonaut');
const chalk = yargonaut.chalk();
const Table = require('cli-table3');

const user = require('../../db/user');
const utils = require('./utils');

module.exports = {
  command: 'list',
  desc: 'List users',
  builder(yargs) {
    yargs
      .option('verified', {
        describe: 'Get users verified or non verified'
      })
      .option('token-expired', {
        describe: `Get users who's token from time`
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
        if (argv.tokenExpired && !utils.validateDate(argv.tokenExpired)) {
          throw new Error(chalk.red(`Invalid date: "${argv.tokenExpired}"`));
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
      if (argv.verified !== void 0) {
        match.verified = [true, 1, 'true'].includes(argv.verified);
      }
      if (match.verified === false) {
        match.verifyToken = { $ne: null };

        if (argv.tokenExpired) {
          match.verifyTokenExpires = {
            $ne: null,
            $lte: new Date(argv.tokenExpired)
          };
        }
      }

      const skip = parseInt(argv.skip, 10),
        limit = parseInt(argv.limit, 10);
      const { totalCount, users } = await user.list(match, skip, limit);

      if (totalCount > 0 && users.length > 0) {
        let end = skip + limit;
        if (end > totalCount) {
          end = totalCount;
        }
        console.log(
          chalk.green(`Showing results: ${skip}-${end} from ${totalCount}`)
        );
        const table = new Table({
          head: ['#', 'verified', 'token', 'expires'].map(i => chalk.white(i))
        });
        for (const key in table.options.chars) {
          table.options.chars[key] = chalk.white(table.options.chars[key]);
        }
        users.forEach(u =>
          table.push([
            u._id.toString(),
            u.verified ? 'Y' : 'N',
            u.verifyToken,
            u.verifyTokenExpires && u.verifyTokenExpires.toString()
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
