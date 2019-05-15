const validator = require('validator');
const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const customErr = require('../utils/err');
const formatValidationErrors = require('../utils/format-validation-errors');
const { generateRandomStringURLSafe } = require('../utils/rand');
const {
  sendVerificationEmail,
  sendResetPasswordEmail
} = require('../mails/mail');

router.post('/register', async (req, res, next) => {
  try {
    const user = await new User({
      ...req.body,
      verifyToken: generateRandomStringURLSafe(48)
    }).save();

    res.status(201).send();

    sendVerificationEmail(
      user.email,
      `${process.env.ROOT_URL}/api/v1/verify/${user.verifyToken}`
    );
  } catch (error) {
    next(formatValidationErrors(error));
  }
});

router.get('/verify/:token(^[a-zA-Zd]{48}$)', async (req, res, next) => {
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

        sendVerificationEmail(
          user.email,
          `${process.env.ROOT_URL}/api/v1/verify/${user.verifyToken}`
        );
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

        sendResetPasswordEmail(
          user.email,
          `${process.env.ROOT_URL}/api/v1/verify/${user.reset.token}`
        );
      } else {
        throw customErr('Not Found', 404);
      }
    } catch (error) {
      next(error);
    }
  }
);

const resetPassword = async (req, res, next) => {
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
};
router
  .route('/reset-password/:token')
  .put(resetPassword)
  .patch(resetPassword);

module.exports = router;
