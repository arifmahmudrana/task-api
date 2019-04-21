const customErr = require('../utils/err');
const { Task } = require('../models/Task');

const findByIdWithUser = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user });

    if (task) {
      req.task = task;
      next();
    } else {
      throw customErr('Not found', 404);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  findByIdWithUser
};
