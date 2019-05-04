const mongoose = require('mongoose');
const yargonaut = require('yargonaut');
const chalk = yargonaut.chalk();

const user = require('../../db/user');
const utils = require('./utils');

module.exports = {
  command: 'verify',
  desc: 'Verify multiple users',
  builder(yargs) {
    yargs
      .option('id', {
        describe: 'Verify user by ID'
      })
      .option('email', {
        describe: `Verify user by Email`
      })
      .option('verified', {
        describe: 'Verify user verified or non verified'
      })
      .option('token-expired', {
        describe: `Verify users who's token from time`
      })
      .check(argv => {
        if (argv.id && !mongoose.Types.ObjectId.isValid(argv.id)) {
          throw new Error(chalk.red(`Invalid user ID: "${argv.id}"`));
        }
        if (argv.tokenExpired && !utils.validateDate(argv.tokenExpired)) {
          throw new Error(chalk.red(`Invalid date: "${argv.tokenExpired}"`));
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

      const { n, nModified } = await user.verify(match);

      if (nModified > 0) {
        console.log(chalk.green(`User matched: `), n);
        console.log(chalk.green(`User verified: `), nModified);
      } else {
        console.log(chalk.red(`No record updated!`));
      }

      process.exit(0);
    } catch (error) {
      throw error;
    }
  }
};
