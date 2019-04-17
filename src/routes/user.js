const express = require('express');
const router = express.Router();
const { userTransformer } = require('../models/User');

router.get('/', (req, res) => {
  res.json(userTransformer(req.user));
});

module.exports = router;
