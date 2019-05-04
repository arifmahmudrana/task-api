const mongoose = require('mongoose');
const { Schema } = mongoose;

const fields = {
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  done: {
    type: Boolean,
    default: false
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
};
const taskSchema = new Schema(fields, {
  timestamps: true
});
taskSchema.index({ title: 'text' });
taskSchema.index({ done: 1 });
taskSchema.index({ createdAt: -1 });

taskSchema.statics.countTaskList = function(match) {
  return this.countDocuments(match).exec();
};

taskSchema.statics.taskList = function(match, skip, limit) {
  return this.find(match, { score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit)
    .sort({ score: { $meta: 'textScore' } });
};

const taskTransformer = task => ({
  id: task._id,
  title: task.title,
  description: task.description,
  done: task.done
});

const Task = mongoose.modelNames().includes('Task')
  ? mongoose.connection.model('Task')
  : mongoose.model('Task', taskSchema);

Task.on('index', err => {
  if (err) {
    console.error('Task index error: %s', err);
  } else {
    console.info('Task indexing complete');
  }
});

module.exports = {
  Task,
  fields,
  taskTransformer
};
