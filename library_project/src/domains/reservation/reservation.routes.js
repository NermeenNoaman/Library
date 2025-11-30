const express = require('express');
const router = express.Router();
const controller = require('./reservation.controller');

router.post('/', controller.create);
router.post('/:id/cancel', controller.cancel);

module.exports = router;
