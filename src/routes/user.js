const express = require('express');
const router = express.Router();

const customErr = require('../utils/err');
const { userTransformer } = require('../models/User');
const formatValidationErrors = require('../utils/format-validation-errors');

router.get('/', (req, res) => {
  res.json(userTransformer(req.user));
});

const updatePassword = [
  async (req, res, next) => {
    try {
      if (!req.body.password) {
        throw customErr('Password is required', 422);
      }
      if (typeof req.body.password !== 'string') {
        throw customErr('Password must be valid', 422);
      }
      if (!req.body.newPassword) {
        throw customErr('New Password is required', 422);
      }
      if (typeof req.body.newPassword !== 'string') {
        throw customErr('New Password must be valid', 422);
      }
      const matched = await req.user.passwordMatched(req.body.password);
      if (!matched) {
        throw customErr('Password must match previous password', 422);
      }

      next();
    } catch (error) {
      next(formatValidationErrors(error));
    }
  },
  async (req, res, next) => {
    try {
      req.user.password = req.body.newPassword;
      await req.user.save();
      res.send();
    } catch (error) {
      next(formatValidationErrors(error));
    }
  }
];
router
  .route('/')
  .put(updatePassword)
  .patch(updatePassword);

module.exports = router;
