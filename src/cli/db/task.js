const { Task } = require('../../models/Task');

const list = async (match, skip, limit) => {
  const [totalCount, tasks] = await Promise.all([
    Task.countTaskList(match),
    Task.taskList(match, skip, limit)
  ]);

  return { totalCount, tasks };
};

module.exports = { list };
