const express = require('express');
const router = express.Router();

const paginate = require('../utils/paginate');
const { Task, taskTransformer } = require('../models/Task');
const taskMiddlewares = require('../middlewares/task');
const formatValidationErrors = require('../utils/format-validation-errors');

router.post('/', async (req, res, next) => {
  try {
    await new Task({
      title: req.body.title,
      description: req.body.description,
      user: req.user
    }).save();

    res.status(201).send();
  } catch (error) {
    next(formatValidationErrors(error));
  }
});

const updateTask = [
  taskMiddlewares.findByIdWithUser,
  async (req, res, next) => {
    try {
      const {
        title = req.task.title,
        description = req.task.description,
        done = req.task.done
      } = req.body;

      req.task.title = title;
      req.task.description = description;
      req.task.done = done;
      await req.task.save();

      res.send();
    } catch (error) {
      next(formatValidationErrors(error));
    }
  }
];
router
  .route('/:id')
  .put(updateTask)
  .patch(updateTask);

router.delete(
  '/:id',
  taskMiddlewares.findByIdWithUser,
  async (req, res, next) => {
    try {
      await req.task.delete();

      res.send();
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id', taskMiddlewares.findByIdWithUser, (req, res) => {
  res.json(taskTransformer(req.task));
});

router.get('/', async (req, res, next) => {
  const match = {};

  if (req.query.done) {
    match.done = req.query.done.toLowerCase() === 'true';
  }

  if (req.query.q) {
    match.$text = { $search: req.query.q };
  }

  if (!['title', 'done', 'createdAt'].includes(req.query.sortBy)) {
    req.query.sortBy = 'createdAt';
  }

  let orderBy = 1;
  if (req.query.orderBy === 'desc') {
    orderBy = -1;
  }

  await req.user
    .populate({
      path: 'taskCount',
      match,
      options: {}
    })
    .execPopulate();
  const pageCount = Math.ceil(req.user.taskCount / req.query.limit);
  const newReq = { query: req.query, originalUrl: req.originalUrl };
  delete newReq.query.limit;
  const pagination = paginate(newReq, pageCount);

  await req.user
    .populate({
      path: 'tasks',
      match,
      options: {
        limit: req.query.limit,
        skip: req.skip,
        sort: {
          [req.query.sortBy]: orderBy
        }
      }
    })
    .execPopulate();

  res.json({
    tasks: req.user.tasks.map(task => taskTransformer(task)),
    pagination
  });
});

module.exports = router;
