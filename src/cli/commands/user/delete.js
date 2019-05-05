const mongoose = require('mongoose');
const yargonaut = require('yargonaut');
const chalk = yargonaut.chalk();

const user = require('../../db/user');
const utils = require('./utils');

module.exports = {
  command: 'delete',
  desc: 'Delete multiple users',
  builder(yargs) {
    yargs
      .option('id', {
        describe: 'Delete user by ID'
      })
      .option('email', {
        describe: `Delete user by Email`
      })
      .option('verified', {
        describe: 'Delete user verified or non verified'
      })
      .option('token-expired', {
        describe: `Delete users who's token from time`
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
        if (argv.id && !mongoose.Types.ObjectId.isValid(argv.id)) {
          throw new Error(chalk.red(`Invalid id: "${argv.id}"`));
        }
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
      if (argv.id) {
        match._id = argv.id;
      }
      if (argv.email) {
        match.email = argv.email;
      }
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
      const res = await user.delete(match, skip, limit);

      if (res > 0) {
        console.log(chalk.green(`User deleted: `), res);
      } else {
        console.log(chalk.red(`No record deleted!`));
      }

      process.exit(0);
    } catch (error) {
      throw error;
    }
  }
};
