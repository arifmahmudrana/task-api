const validator = require('validator');
// const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();
// const { User, userTransformer } = require('../models/User');
const { User } = require('../models/User');
const customErr = require('../utils/err');
const formatValidationErrors = require('../utils/format-validation-errors');
const { generateRandomStringURLSafe } = require('../utils/rand');

/* router.post(
  '/login',
  (req, res, next) => {
    if (!req.body.email) {
      return next(customErr('Email is required', 422));
    }
    if (!req.body.password) {
      return next(customErr('Password is required', 422));
    }
    if (!validator.isEmail(req.body.email)) {
      return next(customErr('Email is invalid', 422));
    }

    next();
  },
  async (req, res, next) => {
    try {
      const user = await User.findOne({
        email: req.body.email,
        verified: true
      });
      if (user) {
        const matched = await bcrypt.compare(
          req.body.password,
          user.password.toString()
        );
        if (!matched) {
          throw customErr('Credentials not matched', 404);
        }
        res.json(userTransformer(user));
      } else {
        throw customErr('Credentials not matched', 404);
      }
    } catch (error) {
      next(error);
    }
  }
); */

router.post('/register', async (req, res, next) => {
  try {
    await new User({
      ...req.body,
      verifyToken: generateRandomStringURLSafe(48)
    }).save();

    res.status(201).send();
  } catch (error) {
    next(formatValidationErrors(error));
  }
});

router.get('/verify/:token', async (req, res, next) => {
  const user = await User.findByVerifyToken(req.params.token);

  try {
    if (user) {
      user.setVerified();
      await user.save();
      res.send();
    } else {
      throw customErr('Not Found', 404);
    }
  } catch (error) {
    next(error);
  }
});

router.post(
  '/resend-verify',
  (req, res, next) => {
    if (!req.body.email) {
      return next(customErr('Email is required', 422));
    }
    if (!validator.isEmail(req.body.email)) {
      return next(customErr('Email is invalid', 422));
    }

    next();
  },
  async (req, res, next) => {
    const user = await User.findOne({
      email: req.body.email,
      verified: false
    });

    try {
      if (user) {
        user.verifyToken = generateRandomStringURLSafe(48);

        await user.save();
        res.send();
      } else {
        throw customErr('Not Found', 404);
      }
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/send-reset-password',
  (req, res, next) => {
    if (!req.body.email) {
      return next(customErr('Email is required', 422));
    }
    if (!validator.isEmail(req.body.email)) {
      return next(customErr('Email is invalid', 422));
    }

    next();
  },
  async (req, res, next) => {
    const user = await User.findOne({
      email: req.body.email,
      verified: true
    });

    try {
      if (user) {
        user.reset.token = generateRandomStringURLSafe(48);

        await user.save();
        res.send();
      } else {
        throw customErr('Not Found', 404);
      }
    } catch (error) {
      next(error);
    }
  }
);

router.put('/reset-password/:token', async (req, res, next) => {
  const user = await User.findByResetToken(req.params.token);

  try {
    if (user) {
      user.password = req.body.password;
      user.reset.token = null;
      user.reset.expires = null;
      await user.save();

      res.send();
    } else {
      throw customErr('Not Found', 404);
    }
  } catch (error) {
    next(formatValidationErrors(error));
  }
});

module.exports = router;
