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

module.exports = { list, get };
