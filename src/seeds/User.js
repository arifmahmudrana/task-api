const bcrypt = require('bcryptjs');
const faker = require('faker');
require('../db/mongoose');
const { User } = require('../models/User');

User.find({}, { email: true })
  .then(users => users.map(({ email }) => ({ [email]: true })))
  .then(emails => {
    const users = [],
      password = bcrypt.hashSync('Abc890)', 8);
    let count = parseInt(process.argv[2], 10);
    if (count < 0) {
      count = 5;
    }

    while (count) {
      let email = faker.internet.email();
      while (emails[email]) {
        email = faker.internet.email();
      }
      emails[email] = true;

      const user = { email, password, verified: true };
      users.push(user);
      count--;
    }

    return User.insertMany(users);
  })
  .then(users => {
    console.log('Users inserted successfully');

    process.exit(0);
  })
  .catch(err => {
    console.log('Error occured: ', err);

    process.exit(1);
  });
