const express = require('express');
const router = express.Router();
const controller = require('./member.controller');

router.post('/register', controller.register);
router.get('/', controller.list);

module.exports = router;
