const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const fields = {
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid');
      }
    }
  },
  password: {
    type: Buffer,
    required: [true, 'Password is required'],
    validate(v) {
      const value = v.toString();
      if (value.length < 7) {
        throw new Error('Password length must be greater then 7 character');
      }
      const spChar = ' !"#$%&\'()*+,-./:;<=>?@[]^_`{|}~';
      let found = false;
      for (let i = 0; i < spChar.length; i++) {
        const elem = spChar[i];
        if (value.includes(elem)) {
          found = true;
          break;
        }
      }
      if (!found) {
        throw new Error('Password must include a special character');
      }
      if (!value.match(/[0-9]/g)) {
        throw new Error('Password must include a number');
      }
      if (!value.match(/[A-Z]/g)) {
        throw new Error('Password must include a capital letter');
      }
    }
  },
  verified: {
    type: Boolean,
    default: false
  },
  reset: {
    token: {
      type: Buffer
    },
    expires: Date
  },
  verifyToken: {
    type: Buffer
  },
  verifyTokenExpires: {
    type: Date
  }
};
const userSchema = new Schema(fields);
/* userSchema.methods.toJSON = function() {
  const userObject = this.toObject();

  delete userObject.password;
  delete userObject.reset;
  delete userObject.verifyToken;
  delete userObject.verifyTokenExpires;
  delete userObject.__v;

  return userObject;
}; */

userSchema.statics.findByCredentials = async function(email, password) {
  console.log('==================email==================');
  console.log(email);
  console.log('==================email==================');
  console.log('==================password==================');
  console.log(password);
  console.log('==================password==================');
  const user = await this.findOne({
    email,
    verified: true
  });
  console.log('==================user==================');
  console.log(user);
  console.log('==================user==================');

  if (!user) {
    return false;
  }

  const matched = await bcrypt.compare(password, user.password.toString());
  console.log('==================matched==================');
  console.log(matched);
  console.log('==================matched==================');

  if (!matched) {
    return false;
  }

  return user;
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

// Hash the plain text password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password.toString(), 8);
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

const userTransformer = user => ({
  id: user._id,
  email: user.email,
  verified: user.verified
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
