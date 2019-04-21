const customErr = require('../utils/err');
const { User } = require('../models/User');

const findById = async (req, res, next) => {
  try {
    const user = await User.findById(res.locals.oauth.token.user.id);

    if (user) {
      req.user = user;
      next();
    } else {
      throw customErr('', 401);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  findById
};
