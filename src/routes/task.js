const express = require('express');
const router = express.Router();

const paginate = require('../utils/paginate');
const { Task, taskTransformer } = require('../models/Task');
const taskMiddlewares = require('../middlewares/task');
const formatValidationErrors = require('../utils/format-validation-errors');
const { cache, cacheDel } = require('../cache');

router.post('/', async (req, res, next) => {
  try {
    await new Task({
      title: req.body.title,
      description: req.body.description,
      user: req.user
    }).save();

    await cacheDel('task-list-' + req.user._id.toString() + '-*');
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
      await Promise.all([
        cacheDel('task-list-' + req.user._id.toString() + '-*'),
        cacheDel('task-' + req.task._id.toString())
      ]);

      res.send();
    } catch (error) {
      next(formatValidationErrors(error));
    }
  }
];
router
  .route('/:id([a-f0-9]{24})')
  .put(updateTask)
  .patch(updateTask);

router.delete(
  '/:id([a-f0-9]{24})',
  taskMiddlewares.findByIdWithUser,
  async (req, res, next) => {
    try {
      await req.task.delete();
      await Promise.all([
        cacheDel('task-list-' + req.user._id.toString() + '-*'),
        cacheDel('task-' + req.task._id.toString())
      ]);

      res.send();
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id([a-f0-9]{24})',
  (req, res, next) => {
    // set cache name
    res.express_redis_cache_name = 'task-' + req.params.id;
    next();
  },
  cache.route({
    expire: {
      200: 3600,
      xxx: 0
    }
  }),
  taskMiddlewares.findByIdWithUser,
  (req, res) => {
    res
      // .set({
      //   'Cache-Control': 'private, must-revalidate',
      //   'Last-Modified': req.task.updatedAt.toUTCString()
      // })
      .json(taskTransformer(req.task));
  }
);

router.get(
  '/',
  (req, res, next) => {
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

    req.taskGet = {
      match,
      options: {
        limit: req.query.limit,
        skip: req.skip,
        sort: {
          [req.query.sortBy]: orderBy
        }
      }
    };

    next();
  },
  (req, res, next) => {
    // set cache name
    res.express_redis_cache_name =
      'task-list-' +
      req.user._id.toString() +
      '-' +
      JSON.stringify(req.taskGet);
    next();
  },
  cache.route({
    expire: {
      200: 3600,
      xxx: 0
    }
  }),
  async (req, res, next) => {
    await req.user
      .populate({
        path: 'taskCount',
        match: req.taskGet.match,
        options: {}
      })
      .execPopulate();

    const newReq = { query: req.query, originalUrl: req.originalUrl };
    delete newReq.query.limit;
    const pagination = paginate(
      newReq,
      Math.ceil(req.user.taskCount / req.query.limit)
    );

    await req.user
      .populate({
        path: 'tasks',
        match: req.taskGet.match,
        options: req.taskGet.options
      })
      .execPopulate();

    res.json({
      tasks: req.user.tasks.map(task => taskTransformer(task)),
      pagination
    });
  }
);

module.exports = router;
