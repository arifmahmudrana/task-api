const express = require('express');
const router = express.Router();
const { User, userTransformer } = require('../models/User');
const customErr = require('../utils/err');

router.get('/me', async (req, res, next) => {
  try {
    const user = await User.findById(res.locals.oauth.token.user.id);

    if (user) {
      res.json(userTransformer(user));
    } else {
      throw customErr('Not Found', 404);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
