const yargonaut = require('yargonaut');
const chalk = yargonaut.chalk();

const seeders = require('../../../seeds');

module.exports = {
  command: 'seed',
  desc: 'Seed database',
  builder(yargs) {
    yargs
      .option('collection', {
        alias: 'c',
        describe: `Collection to seed`,
        type: 'string'
      })
      .option('total', {
        describe: `Total number of collections to seed`,
        type: 'number',
        default: 10
      })
      .check(argv => {
        if (argv.collection && !seeders[argv.collection]) {
          throw new Error(
            chalk.red(`Invalid collection: "${argv.collection}"`)
          );
        }

        return true;
      })
      .version(false);
  },
  handler: async argv => {
    try {
      const promises = [];
      if (argv.collection) {
        promises.push(seeders[argv.collection](argv.total));
      } else {
        for (const seeder in seeders) {
          promises.push(seeders[seeder](argv.total));
        }
      }

      await Promise.all(promises);
      chalk.green(`Database seeded successfully!`);

      process.exit(0);
    } catch (error) {
      throw error;
    }
  }
};
