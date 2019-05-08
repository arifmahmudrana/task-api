const multer = require('multer');
const sharp = require('sharp');
const express = require('express');
const router = express.Router();

const customErr = require('../utils/err');
const { userTransformer } = require('../models/User');
const formatValidationErrors = require('../utils/format-validation-errors');
const s3 = require('../aws/s3');
const { cache, cacheDel } = require('../cache');

router.get(
  '/',
  (req, res, next) => {
    // set cache name
    res.express_redis_cache_name = 'user-' + req.user._id.toString();
    next();
  },
  cache.route({
    expire: {
      200: 3600,
      xxx: 0
    }
  }),
  (req, res) => {
    res.json(userTransformer(req.user));
  }
);

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

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (
      !file.originalname.match(/\.(jpg|jpeg|png)$/) ||
      !file.mimetype.match(/^image\/(jpeg|png)$/)
    ) {
      return cb(customErr('Please upload an image', 422));
    }

    cb(undefined, true);
  }
});
router.post('/avatar', upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw customErr('Avatar file is required', 422);
    }
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .jpeg()
      .toBuffer();

    const data = await s3
      .upload({
        ACL: 'public-read',
        Key: req.user._id + '/avatar.jpeg',
        Body: buffer,
        ContentType: 'image/jpeg'
      })
      .promise();
    req.user.avatar = data.Location;
    await req.user.save();
    await cacheDel('user-' + req.user._id.toString());

    res.send();
  } catch (error) {
    next(formatValidationErrors(error));
  }
});

module.exports = router;
