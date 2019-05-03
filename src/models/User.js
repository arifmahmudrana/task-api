const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const { Task } = require('./Task');
const s3 = require('../aws/s3');

const fields = {
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid');
      }
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [7, 'Password length must be greater then 7 character'],
    match: [
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[\s\!"#\$%&\\'\(\)\*\+,\-\.\/\:;\<\=\>\?@\[\]\^_`\{\|\}~])/,
      'Password must include a number, a capital letter & a special character'
    ]
  },
  verified: {
    type: Boolean,
    default: false
  },
  reset: {
    token: {
      type: String,
      default: null
    },
    expires: {
      type: Date,
      default: null
    }
  },
  verifyToken: {
    type: String,
    default: null
  },
  verifyTokenExpires: {
    type: Date,
    default: null
  },
  avatar: {
    type: String,
    default: null
  }
};
const userSchema = new Schema(fields);
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'user'
});
userSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'user',
  count: true
});

userSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({
    email,
    verified: true
  });

  if (!user) {
    return false;
  }

  const matched = await user.passwordMatched(password);

  if (!matched) {
    return false;
  }

  return user;
};

userSchema.statics.verifyMany = function(match) {
  return this.updateMany(match, {
    verified: true,
    verifyToken: null,
    verifyTokenExpires: null
  });
};

userSchema.statics.countUserList = function(match) {
  return this.countDocuments(match).exec();
};

userSchema.statics.userList = function(match, skip, limit) {
  return this.find(
    match,
    'email verified verifyToken verifyTokenExpires avatar'
  )
    .skip(skip)
    .limit(limit);
};

userSchema.statics.findByVerifyToken = function(verifyToken) {
  return this.findOne({
    verifyToken,
    verifyTokenExpires: { $gte: new Date() }
  });
};

userSchema.statics.findByResetToken = function(token) {
  return this.findOne({
    'reset.token': token,
    'reset.expires': { $gte: new Date() }
  });
};

userSchema.methods.setVerified = function() {
  this.verified = true;
  this.verifyToken = null;
  this.verifyTokenExpires = null;
};

userSchema.methods.passwordMatched = async function(password) {
  const matched = await bcrypt.compare(password, this.password);

  return matched;
};

// Hash the plain text password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }

  if (this.isModified('reset.token') && this.reset.token) {
    const expires = new Date();
    expires.setHours(expires.getHours() + 2);
    this.reset.expires = expires;
  }

  if (this.isModified('verifyToken') && this.verifyToken) {
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);
    this.verifyTokenExpires = expires;
  }

  next();
});

// Remove user tasks & avatar
userSchema.pre('remove', async function(next) {
  await Task.remove({ user: this._id });

  if (this.avatar) {
    const Key = this.avatar
      .split('/')
      .slice(-2)
      .join('/');

    await s3.deleteObject({ Bucket: process.env.S3_BUCKET, Key }).promise();
  }

  next();
});

const userTransformer = user => ({
  id: user._id,
  email: user.email,
  verified: user.verified,
  avatar: user.avatar
});

const User = mongoose.modelNames().includes('User')
  ? mongoose.connection.model('User')
  : mongoose.model('User', userSchema);

User.on('index', err => {
  if (err) {
    console.error('User index error: %s', err);
  } else {
    console.info('User indexing complete');
  }
});

module.exports = {
  User,
  fields,
  userTransformer
};
