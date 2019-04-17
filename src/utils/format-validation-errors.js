const customErr = require('./err');

module.exports = error => {
  if (error.name === 'ValidationError') {
    for (const err in error.errors) {
      if (error.errors.hasOwnProperty(err)) {
        return customErr(error.errors[err].message, 422);
      }
    }
  }

  if (error.name === 'MongoError') {
    return customErr('Email allready exists!', 422);
  }

  return error;
};
