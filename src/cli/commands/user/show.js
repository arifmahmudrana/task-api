const mongoose = require('mongoose');
const yargonaut = require('yargonaut');
const chalk = yargonaut.chalk();

const user = require('../../db/user');

module.exports = {
  command: 'show',
  desc: 'Show user details',
  builder(yargs) {
    yargs
      .option('id', {
        describe: 'Get user by ID'
      })
      .option('email', {
        describe: `Get user by Email`
      })
      .option('verified', {
        describe: 'Get user verified or non verified'
      })
      .check(argv => {
        if (argv.id && !mongoose.Types.ObjectId.isValid(argv.id)) {
          throw new Error(chalk.red(`Invalid id: "${argv.id}"`));
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

      const data = await user.get(match);

      if (data) {
        console.log(chalk.green(`User found.`));
        console.log(JSON.stringify(data, undefined, 2));
      } else {
        console.log(chalk.red(`No user found!`));
      }

      process.exit(0);
    } catch (error) {
      throw error;
    }
  }
};
