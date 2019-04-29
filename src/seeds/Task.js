const faker = require('faker');
const { User } = require('../models/User');
const { Task } = require('../models/Task');

module.exports = async count =>
  User.find({ verified: true }, { _id: true }).then(users => {
    if (!users.length) {
      throw new Error('Please add some user first!!');
    }

    const tasks = [];
    count = parseInt(count, 10);
    if (count < 0) {
      count = 20;
    }

    const titleGenerators = [
      faker.lorem.sentence,
      faker.company.catchPhrase,
      faker.company.bs
    ];

    while (count) {
      tasks.push({
        title: titleGenerators[count % titleGenerators.length](),
        description: faker.lorem.paragraphs(),
        done: faker.random.arrayElement([true, false]),
        user: faker.random.arrayElement(users)._id,
        createdAt: faker.date.recent(),
        updatedAt: faker.date.future()
      });
      count--;
    }

    return Task.insertMany(tasks);
  });
