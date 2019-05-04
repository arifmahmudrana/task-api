const { Task } = require('../../models/Task');

const list = async (match, skip, limit) => {
  const [totalCount, tasks] = await Promise.all([
    Task.countTaskList(match),
    Task.taskList(match, skip, limit)
  ]);

  return { totalCount, tasks };
};

const get = async match => {
  const task = await Task.findOne(match, {
    score: { $meta: 'textScore' }
  }).sort({ score: { $meta: 'textScore' } });

  return task;
};

const done = async (match, done) => {
  const result = await Task.doneMany(match, done);

  return result;
};

const deleteTask = async match => {
  await Task.deleteMany(match);
};

module.exports = { list, get, done, delete: deleteTask };
